import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { verifyUptimeEnvelope, summarizeUptime, UPTIME_INTERVAL_MS as interval } from '../lib/hub/uptime.ts';
import worker, { probeTarget, runUptimeTick, signUptimeHeaders } from '../workers/uptime/index.ts';
import { publicHttpsOrigin, parseUptimeTargets } from '../workers/uptime/protocol.ts';

const slot = Math.floor(Date.UTC(2026, 8, 24, 12) / interval) * interval;
const now = slot + 1000;
const secret = 'offline-fixture-only-no-real-secret-123456789';
const target = { siteId: 'site-a', origin: 'https://fixture.example.com' };
const delivery = '277e1e6b-54df-4663-b8b2-e9f573f49c70';
const sample = (index, status = 'up', extra = {}) => ({ ...target, scheduledAt: slot + index * interval, checkedAt: slot + index * interval + 1000,
  status, httpStatus: status === 'up' ? 200 : status === 'down' ? 503 : null, latencyMs: 20,
  errorCode: status === 'up' ? null : status === 'down' ? 'http_error' : 'network_error', ...extra });
const environment = () => ({ UPTIME_ENABLED: 'true', UPTIME_MONITOR_ID: 'hub-primary', UPTIME_TARGETS_JSON: JSON.stringify([target]),
  UPTIME_INGEST_URL: 'https://hub.example.com/api/internal/uptime', UPTIME_INGEST_SECRET: secret });
async function envelope(batch = { version: 1, monitorId: 'hub-primary', samples: [sample(0)] }) {
  const rawBody = JSON.stringify(batch);
  return { rawBody, headers: new Headers(await signUptimeHeaders(rawBody, secret, now, delivery)), secret, now, allowedSites: [target] };
}

test('origin configuration rejects credentials, ports, private literals, local hosts, paths and alternate representations', () => {
  assert.equal(publicHttpsOrigin(target.origin), target.origin);
  for (const origin of ['http://example.com', 'https://localhost', 'https://a.internal', 'https://a.local', 'https://[::1]', 'https://127.0.0.1',
    'https://2130706433', 'https://0x7f000001', 'https://0177.0.0.1', 'https://[::ffff:127.0.0.1]', 'https://example.com:8080',
    'https://u:p@example.com', 'https://example.com/path', 'https://example.com/', 'https://example.com?x=1', 'https://example.com#x', 'https://example.com.']) {
    assert.throws(() => publicHttpsOrigin(origin), undefined, origin);
  }
});
test('configuration enforces maximum five unique site IDs and never accepts empty or malformed targets', () => {
  assert.deepEqual(parseUptimeTargets(JSON.stringify([target])), [target]);
  for (const raw of ['[]', '{}', 'null', 'bad', JSON.stringify([target, target]), JSON.stringify(Array.from({ length: 6 }, (_, i) => ({ ...target, siteId: `site-${i}` }))), JSON.stringify([{ ...target, siteId: '../x' }])]) assert.throws(() => parseUptimeTargets(raw));
});
test('HMAC signs raw body, timestamp and delivery ID and verifies permitted assignment', async () => {
  const input = await envelope();
  assert.deepEqual(verifyUptimeEnvelope(input), { deliveryId: delivery, monitorId: 'hub-primary', samples: [sample(0)] });
  for (const override of [{ rawBody: input.rawBody + ' ' }, { secret: secret + 'x' }, { secret: undefined }, { allowedSites: [] }, { allowedSites: [{ ...target, origin: 'https://other.example.com' }] }, { now: now + 300001 }, { now: now - 300001 }]) {
    assert.throws(() => verifyUptimeEnvelope({ ...input, ...override }), /Ongeldige uptimelevering/);
  }
  for (const [name, value] of [['x-sitesnit-timestamp', String(now + 1)], ['x-sitesnit-delivery', 'b359e10a-684f-402c-8d69-664819936381'], ['x-sitesnit-signature', 'v1=00'], ['x-sitesnit-signature', 'v2=' + '0'.repeat(64)]]) {
    const headers = new Headers(input.headers); headers.set(name, value);
    assert.throws(() => verifyUptimeEnvelope({ ...input, headers }));
  }
});
test('valid signatures cannot bypass batch shape, clock, status or origin checks', async () => {
  for (const batch of [null, { version: 2, monitorId: 'm', samples: [sample(0)] }, { version: 1, monitorId: '../m', samples: [sample(0)] },
    { version: 1, monitorId: 'm', samples: [] }, { version: 1, monitorId: 'm', samples: [sample(0), sample(0)] },
    ...[{ checkedAt: now + 60001 }, { checkedAt: slot - 1 }, { scheduledAt: slot + 1 }, { latencyMs: -1 }, { latencyMs: 60001 },
      { status: 'up', httpStatus: 500 }, { status: 'down', httpStatus: 403 }, { status: 'unknown', errorCode: null }, { origin: 'https://other.example.com' }]
      .map(extra => ({ version: 1, monitorId: 'm', samples: [sample(0, 'up', extra)] }))]) {
    const input = await envelope(batch);
    assert.throws(() => verifyUptimeEnvelope(input));
  }
});
test('oversized raw payload is rejected before authentication or JSON processing', async () => {
  const input = await envelope();
  assert.throws(() => verifyUptimeEnvelope({ ...input, rawBody: 'x'.repeat(16385) }));
});
test('HTTP ingress never starts a probe even with arbitrary target parameters', async () => {
  const response = worker.fetch(new Request('https://worker.example.com/?url=https://evil.example.com'));
  assert.equal(response.status, 404);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});
test('HEAD success and body cancellation use no cookies or redirects', async () => {
  let cancelled = false;
  const response = new Response(new ReadableStream({ cancel() { cancelled = true; } }), { status: 200 });
  const result = await probeTarget(target, slot, async (url, init) => {
    assert.equal(url, target.origin + '/'); assert.equal(init.method, 'HEAD'); assert.equal(init.redirect, 'manual');
    assert.equal(new Headers(init.headers).has('cookie'), false); assert.equal(new Headers(init.headers).has('authorization'), false);
    return response;
  }, () => now);
  assert.equal(result.status, 'up'); assert.equal(cancelled, true);
});
test('unsupported HEAD falls back once to range GET and discards rather than parses HTML', async () => {
  const methods = []; let cancelled = false;
  const result = await probeTarget(target, slot, async (_url, init) => {
    methods.push(init.method);
    if (init.method === 'HEAD') return new Response(null, { status: 405 });
    assert.equal(new Headers(init.headers).get('range'), 'bytes=0-1023');
    return new Response(new ReadableStream({ cancel() { cancelled = true; } }), { status: 200 });
  }, () => now);
  assert.deepEqual(methods, ['HEAD', 'GET']); assert.equal(result.status, 'up'); assert.equal(cancelled, true);
});
test('redirect, bot protection and quota remain unknown and never follow location', async () => {
  for (const status of [301, 302, 307, 401, 403, 429]) {
    let calls = 0;
    const result = await probeTarget(target, slot, async (_url, init) => { calls++; assert.equal(init.redirect, 'manual'); return new Response(null, { status, headers: { Location: 'http://169.254.169.254/' } }); }, () => now);
    assert.equal(calls, 1); assert.equal(result.status, 'unknown');
  }
  const blocked = await probeTarget(target, slot, async () => new Response(null, { status: 503, headers: { 'cf-mitigated': 'challenge' } }), () => now);
  assert.equal(blocked.status, 'unknown'); assert.equal(blocked.errorCode, 'blocked');
});
test('HTTP failures are distinct from network failure', async () => {
  for (const httpStatus of [404, 410, 500, 503]) assert.equal((await probeTarget(target, slot, async () => new Response(null, { status: httpStatus }), () => now)).status, 'down');
  const result = await probeTarget(target, slot, async () => { throw new Error('sensitive DNS details'); }, () => now);
  assert.equal(result.status, 'unknown'); assert.equal(result.errorCode, 'network_error'); assert.equal(JSON.stringify(result).includes('sensitive'), false);
});
test('probe deadline aborts and records unknown instead of an invented outage', async context => {
  context.mock.timers.enable({ apis: ['setTimeout'] });
  const pending = probeTarget(target, slot, async (_url, init) => new Promise((_resolve, reject) => init.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))), () => now);
  context.mock.timers.tick(10000);
  const result = await pending;
  assert.equal(result.status, 'unknown'); assert.equal(result.errorCode, 'timeout');
});
test('disabled, invalid and stale configurations make no network calls', async () => {
  const request = async () => { assert.fail('Unexpected network request'); };
  await runUptimeTick({ ...environment(), UPTIME_ENABLED: 'false' }, slot, request, () => now);
  for (const env of [{ ...environment(), UPTIME_TARGETS_JSON: '[]' }, { ...environment(), UPTIME_INGEST_URL: 'http://localhost/api/x' }, { ...environment(), UPTIME_INGEST_SECRET: 'short' }]) await assert.rejects(runUptimeTick(env, slot, request, () => now));
  await assert.rejects(runUptimeTick(environment(), slot - 600000, request, () => now));
});
test('scheduled tick sends one verifiable batch only to the configured ingest endpoint', async () => {
  const calls = [];
  await runUptimeTick(environment(), slot, async (url, init) => {
    calls.push(url);
    if (init.method === 'POST') {
      assert.equal(init.redirect, 'manual');
      const verified = verifyUptimeEnvelope({ headers: new Headers(init.headers), rawBody: init.body, secret, allowedSites: [target], now });
      assert.equal(verified.samples.length, 1); assert.equal(verified.samples[0].status, 'up');
    }
    return new Response(null, { status: 200 });
  }, () => now);
  assert.deepEqual(calls, [target.origin + '/', environment().UPTIME_INGEST_URL]);
});
test('failed ingest does not retry or follow a redirect', async () => {
  let posts = 0;
  await assert.rejects(runUptimeTick(environment(), slot, async (_url, init) => {
    if (init.method === 'POST') { posts++; return new Response(null, { status: 307, headers: { location: 'https://other.example.com' } }); }
    return new Response(null, { status: 200 });
  }, () => now), /ingestion failed/);
  assert.equal(posts, 1);
});
const summary = (samples, count) => summarizeUptime(samples, { from: slot, to: slot + count * interval, now: slot + count * interval });
test('empty and missing coverage never becomes uptime or downtime', () => {
  assert.deepEqual(summary([], 2), { expectedSlots: 2, measuredSlots: 0, missingSlots: 2, unknownSlots: 0, upSamples: 0, downSamples: 0, measuredAvailabilityPercent: null, coveragePercent: 0, latestStatus: 'unknown', incidents: [] });
  const result = summary([sample(0)], 3);
  assert.equal(result.missingSlots, 2); assert.equal(result.measuredAvailabilityPercent, 100); assert.equal(result.latestStatus, 'unknown');
});
test('two adjacent failures confirm an incident, with observed recovery and no invented duration', () => {
  assert.equal(summary([sample(0, 'down')], 1).latestStatus, 'suspected_down');
  const result = summary([sample(0, 'down'), sample(1, 'down'), sample(2)], 3);
  assert.deepEqual(result.incidents, [{ firstFailureAt: sample(0).checkedAt, confirmedAt: sample(1).checkedAt, recoveredAt: sample(2).checkedAt, coverageInterrupted: false }]);
  assert.equal(result.latestStatus, 'up'); assert.ok(Math.abs(result.measuredAvailabilityPercent - 100 / 3) < 0.00001);
});
test('unknown and missing slots interrupt failure confirmation; confirmed incidents retain uncertainty', () => {
  assert.equal(summary([sample(0, 'down'), sample(2, 'down')], 3).incidents.length, 0);
  assert.equal(summary([sample(0, 'down'), sample(1, 'unknown'), sample(2, 'down')], 3).incidents.length, 0);
  const result = summary([sample(0, 'down'), sample(1, 'down'), sample(3)], 4);
  assert.equal(result.incidents[0].coverageInterrupted, true); assert.equal(result.incidents[0].recoveredAt, sample(3).checkedAt);
});
test('duplicates do not inflate totals and contradictory deliveries become unknown', () => {
  const result = summary([sample(0), sample(0), sample(1, 'down'), sample(1)], 2);
  assert.equal(result.measuredSlots, 2); assert.equal(result.upSamples, 1); assert.equal(result.unknownSlots, 1); assert.equal(result.latestStatus, 'unknown');
});
test('mixed tenants/sites and invalid windows are rejected', () => {
  assert.throws(() => summary([sample(0), sample(1, 'up', { siteId: 'site-b' })], 2));
  assert.throws(() => summarizeUptime([], { from: 5, to: 4 }));
  assert.throws(() => summarizeUptime([], { from: slot, to: now + 1, now }));
});
test('worker config is disabled and exposes neither workers.dev nor preview URLs', async () => {
  const config = JSON.parse(await readFile(new URL('../workers/uptime/wrangler.jsonc', import.meta.url), 'utf8'));
  assert.equal(config.vars.UPTIME_ENABLED, 'false'); assert.equal(config.workers_dev, false); assert.equal(config.preview_urls, false);
  assert.deepEqual(config.triggers.crons, ['*/5 * * * *']); assert.equal(config.vars.UPTIME_TARGETS_JSON, '[]');
});
