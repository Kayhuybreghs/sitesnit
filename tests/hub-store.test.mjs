import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { registerHooks } from 'node:module';
import { sqliteHubConnection } from '../lib/hub/connection.ts';
import { hubSchema } from '../lib/hub/schema.ts';
import { snapshotStore } from '../lib/hub/store.ts';
import { ingestUptime } from '../lib/hub/ingest.ts';
import { issueInvitation, acceptInvitation, findInvitation } from '../lib/hub/invitations.ts';
import { requireHubSite } from '../lib/hub/access.ts';
import { uptimeSigningMessage, UPTIME_INTERVAL_MS } from '../workers/uptime/protocol.ts';

// Server-only marker has no runtime work. Production compilation keeps its boundary.
registerHooks({ resolve(specifier, context, nextResolve) { return specifier === 'server-only' ? { url: 'data:text/javascript,export{}', shortCircuit: true } : nextResolve(specifier, context); } });
const { dashboardData } = await import('../lib/hub/dashboard-data.ts');

async function fixture() {
  const connection = sqliteHubConnection(':memory:');
  await connection.executeSchema(hubSchema);
  await connection.db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind('client-a', 'Fixture A', Date.now()).run();
  await connection.db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind('client-b', 'Fixture B', Date.now()).run();
  await connection.db.prepare('INSERT INTO hub_sites(id,client_id,name,origin,created_at) VALUES(?,?,?,?,?)').bind('site-a', 'client-a', 'Site A', 'https://example.com', Date.now()).run();
  return connection;
}

function uptimeInput(samples, deliveryId = randomUUID()) {
  const secret = 'fixture-only-uptime-signature-secret-0001';
  const now = Date.now(), timestamp = String(now);
  const rawBody = JSON.stringify({ version: 1, monitorId: 'fixture-monitor', samples });
  const signature = createHmac('sha256', secret).update(uptimeSigningMessage(timestamp, deliveryId, rawBody)).digest('hex');
  return { headers: new Headers({ 'x-sitesnit-timestamp': timestamp, 'x-sitesnit-delivery': deliveryId, 'x-sitesnit-signature': `v1=${signature}` }), rawBody, secret, allowedSites: samples.map(sample => ({ siteId: sample.siteId, origin: sample.origin })) };
}
function sample(siteId = 'site-a', origin = 'https://example.com') {
  const now = Date.now();
  return { siteId, origin, scheduledAt: Math.floor(now / UPTIME_INTERVAL_MS) * UPTIME_INTERVAL_MS, checkedAt: now, status: 'up', httpStatus: 200, latencyMs: 50, errorCode: null };
}

test('SQLite nontransactional operations do not disappear in another request rollback', async () => {
  const connection = await fixture();
  try {
    let enter, release;
    const entered = new Promise(resolve => { enter = resolve; });
    const gate = new Promise(resolve => { release = resolve; });
    const transaction = connection.transaction(async db => {
      await db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind('rolled-back', 'Rollback fixture', Date.now()).run();
      enter(); await gate; throw new Error('intentional rollback');
    });
    const failure = assert.rejects(transaction, /intentional rollback/);
    await entered;
    const externalWrite = connection.db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind('independent', 'Independent request', Date.now()).run();
    await new Promise(resolve => setImmediate(resolve));
    release(); await failure; await externalWrite;
    assert.ok(await connection.db.prepare('SELECT id FROM hub_clients WHERE id=?').bind('independent').first(), 'an unrelated request must commit separately, not join the rolled-back transaction');
    assert.equal(await connection.db.prepare('SELECT id FROM hub_clients WHERE id=?').bind('rolled-back').first(), null);
  } finally { await connection.close(); }
});

test('SQLite exclusive auth-style entry can reenter a transaction without deadlocking', async () => {
  const connection = await fixture();
  try {
    await connection.runExclusive(() => connection.transaction(async db => {
      await db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind('nested', 'Auth callback', Date.now()).run();
      return connection.runExclusive(async () => assert.ok(await db.prepare('SELECT id FROM hub_clients WHERE id=?').bind('nested').first()));
    }));
    assert.ok(await connection.db.prepare('SELECT id FROM hub_clients WHERE id=?').bind('nested').first());
  } finally { await connection.close(); }
});

test('expired async context cannot bypass a later SQLite transaction lock', async () => {
  const connection = await fixture();
  try {
    let startDetached, detachedWrite, enter, release;
    const detachedGate = new Promise(resolve => { startDetached = resolve; });
    await connection.runExclusive(async () => {
      detachedWrite = detachedGate.then(() => connection.db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind('detached', 'Deferred work', Date.now()).run());
    });
    const entered = new Promise(resolve => { enter = resolve; });
    const gate = new Promise(resolve => { release = resolve; });
    const transaction = connection.transaction(async () => { enter(); await gate; throw new Error('rollback current owner'); });
    const failure = assert.rejects(transaction, /rollback current owner/);
    await entered; startDetached(); await new Promise(resolve => setImmediate(resolve));
    release(); await failure; await detachedWrite;
    assert.ok(await connection.db.prepare('SELECT id FROM hub_clients WHERE id=?').bind('detached').first());
  } finally { await connection.close(); }
});

test('uptime delivery claim and samples commit atomically; retry after failed insert succeeds', async () => {
  const connection = await fixture();
  try {
    const input = uptimeInput([sample(), sample('site-b', 'https://example.org')]);
    await assert.rejects(() => ingestUptime(connection, input));
    assert.equal((await connection.db.prepare('SELECT count(*) AS n FROM hub_uptime_deliveries').first()).n, 0);
    assert.equal((await connection.db.prepare('SELECT count(*) AS n FROM hub_monitor_samples').first()).n, 0);
    await connection.db.prepare('INSERT INTO hub_sites(id,client_id,name,origin,created_at) VALUES(?,?,?,?,?)').bind('site-b', 'client-b', 'Site B', 'https://example.org', Date.now()).run();
    assert.deepEqual(await ingestUptime(connection, input), { stored: true, duplicate: false });
    assert.equal((await connection.db.prepare('SELECT count(*) AS n FROM hub_monitor_samples').first()).n, 2);
  } finally { await connection.close(); }
});

test('concurrent identical uptime delivery is stored once and cannot inflate sample counts', async () => {
  const connection = await fixture();
  try {
    const input = uptimeInput([sample()]);
    const results = await Promise.all([ingestUptime(connection, input), ingestUptime(connection, input)]);
    assert.equal(results.filter(result => result.stored).length, 1);
    assert.equal(results.filter(result => result.duplicate).length, 1);
    assert.equal((await connection.db.prepare('SELECT count(*) AS n FROM hub_monitor_samples').first()).n, 1);
  } finally { await connection.close(); }
});

test('existing-user invitation is bound to its email/client and only accepted once', async () => {
  const connection = await fixture();
  try {
    const token = await issueInvitation(connection.db, 'Existing@Example.com', 'client-a');
    await assert.rejects(() => acceptInvitation(connection, 'other-user', 'other@example.com', token));
    assert.ok(await findInvitation(connection.db, 'existing@example.com', token));
    const results = await Promise.allSettled([acceptInvitation(connection, 'existing-user', 'existing@example.com', token), acceptInvitation(connection, 'existing-user', 'existing@example.com', token)]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal((await connection.db.prepare('SELECT count(*) AS n FROM hub_memberships').first()).n, 1);
    assert.equal((await requireHubSite(connection.db, { id: 'existing-user', email: 'existing@example.com', emailVerified: true }, 'site-a')).id, 'site-a');
    assert.equal(await findInvitation(connection.db, 'existing@example.com', token), null);
  } finally { await connection.close(); }
});

test('dashboard never shows an old config snapshot written after a property change', async () => {
  const connection = await fixture(), original = process.env.HUB_PROVIDER_CREDENTIALS;
  try {
    process.env.HUB_PROVIDER_CREDENTIALS = JSON.stringify({ 'vercel-a': { kind: 'vercel-token', allowedSites: ['site-a'], token: 'fixture-token' } });
    await connection.db.prepare('INSERT INTO hub_integrations(site_id,provider,config_json) VALUES(?,?,?)').bind('site-a', 'vercel', JSON.stringify({ credentialRef: 'vercel-a', projectId: 'prj_new' })).run();
    // Simulate a prior in-flight sync finishing after the admin saved the new project.
    await snapshotStore(connection).write({ siteId: 'site-a', provider: 'vercel', configFingerprint: 'old-project-fingerprint', period: null, attemptedAt: new Date().toISOString(), nextAttemptAt: new Date(Date.now() + 300000).toISOString(), reports: { deployments: { source: 'vercel', state: 'ready', period: null, timeZone: 'UTC', fetchedAt: new Date().toISOString(), data: [{ id: 'private-old-project', status: 'READY', createdAt: new Date().toISOString(), target: 'production', readyAt: null }], warnings: [] } }, staleReports: [], refreshCodes: {} });
    const data = await dashboardData(connection, { id: 'site-a', origin: 'https://example.com' });
    assert.equal(data.snapshots.deployments, undefined, 'the server must compare current settings to the snapshot fingerprint before rendering');
  } finally { if (original === undefined) delete process.env.HUB_PROVIDER_CREDENTIALS; else process.env.HUB_PROVIDER_CREDENTIALS = original; await connection.close(); }
});

test('dashboard hides cached provider data after removing its server credential', async () => {
  const connection = await fixture(), original = process.env.HUB_PROVIDER_CREDENTIALS;
  try {
    delete process.env.HUB_PROVIDER_CREDENTIALS;
    await connection.db.prepare('INSERT INTO hub_integrations(site_id,provider,config_json) VALUES(?,?,?)').bind('site-a', 'vercel', JSON.stringify({ credentialRef: 'vercel-a', projectId: 'prj_current' })).run();
    const data = await dashboardData(connection, { id: 'site-a', origin: 'https://example.com' });
    assert.equal(data.snapshots.deployments, undefined);
  } finally { if (original === undefined) delete process.env.HUB_PROVIDER_CREDENTIALS; else process.env.HUB_PROVIDER_CREDENTIALS = original; await connection.close(); }
});
