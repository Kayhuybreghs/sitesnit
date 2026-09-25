import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import worker, { runHubSyncTick, HUB_SYNC_ENDPOINT, HUB_SYNC_TIMEOUT_MS } from '../workers/hub-sync/index.ts';
const secret = 'fixture-only-sync-secret-at-least-32-characters';
const env = { HUB_SYNC_ENABLED: 'true', HUB_SYNC_SECRET: secret };
const json = data => new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });

test('disabled sync worker and public HTTP handler cannot trigger requests', async () => {
  assert.deepEqual(await runHubSyncTick({ ...env, HUB_SYNC_ENABLED: 'false' }, async () => { throw new Error('must not fetch'); }), { state: 'disabled', sitesProcessed: 0 });
  assert.equal(worker.fetch(new Request('https://worker.example.com/?url=https://attacker.com')).status, 404);
});
test('exactly one fixed HTTPS POST with bearer header, redirect denial and bounded timeout', async () => {
  let calls = 0;
  const result = await runHubSyncTick({ ...env, HUB_SYNC_URL: 'https://attacker.example.com' }, async (url, init) => {
    calls++; assert.equal(url, 'https://www.sitesnit.nl/api/hub/sync'); assert.equal(url, HUB_SYNC_ENDPOINT);
    assert.equal(init.method, 'POST'); assert.equal(init.redirect, 'error');
    assert.equal(init.headers.Authorization, `Bearer ${secret}`); assert.equal(init.body, '{}');
    assert.ok(init.signal instanceof AbortSignal); assert.equal(init.signal.aborted, false);
    return json({ results: [{ siteId: 'site-a', checked: true }], limit: 1 });
  });
  assert.equal(HUB_SYNC_TIMEOUT_MS, 55000); assert.equal(calls, 1);
  assert.deepEqual(result, { state: 'dispatched', sitesProcessed: 1 });
});
test('invalid secret configuration fails before sending anything', async () => {
  for (const value of ['', 'too-short', 'x'.repeat(513), `${secret}\r\nother`]) {
    let called = false;
    await assert.rejects(() => runHubSyncTick({ ...env, HUB_SYNC_SECRET: value }, async () => { called = true; return json({}); }), /not configured/);
    assert.equal(called, false);
  }
});
test('redirect, forbidden, timeout, malformed and oversized replies fail without leaking provider text', async () => {
  const replies = [() => new Response(null, { status: 302, headers: { Location: 'https://attacker.example.com' } }), () => new Response(secret, { status: 403 }), () => { throw new Error(secret); }, () => new Response('not JSON'), () => new Response('x'.repeat(8193)), () => json({ results: [{ checked: false }], limit: 1 }), () => json({ results: [{ checked: true }, { checked: true }], limit: 1 })];
  for (const response of replies) await assert.rejects(() => runHubSyncTick(env, async () => response()), { message: 'Hub sync delivery failed.' });
});
test('empty site list is accepted without inventing a refreshed provider', async () => {
  assert.deepEqual(await runHubSyncTick(env, async () => json({ results: [], limit: 1 })), { state: 'dispatched', sitesProcessed: 0 });
});
test('scheduler disables retries and shipped configuration is opt-in hourly without public routes', async () => {
  const config = JSON.parse(readFileSync(new URL('../workers/hub-sync/wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.vars.HUB_SYNC_ENABLED, 'false'); assert.equal(config.workers_dev, false); assert.equal(config.preview_urls, false);
  assert.deepEqual(config.triggers.crons, ['15 * * * *']); assert.equal(config.routes, undefined);
  assert.deepEqual(config.secrets.required, ['HUB_SYNC_SECRET']);
  let retryDisabled = false;
  await worker.scheduled({ noRetry: () => { retryDisabled = true; } }, { ...env, HUB_SYNC_ENABLED: 'false' });
  assert.equal(retryDisabled, true);
});
