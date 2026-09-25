import {
  UPTIME_CLOCK_SKEW_MS, UPTIME_INTERVAL_MS, UPTIME_MAX_BODY_BYTES,
  classifyUptimeHttp, parseUptimeTargets, publicHttpsOrigin, uptimeSigningMessage, validUptimeId,
  type UptimeBatch, type UptimeSample, type UptimeTarget,
} from './protocol';

export const PROBE_TIMEOUT_MS = 10_000;
type Requester = (input: string, init: RequestInit) => Promise<Response>;

/** Exported for offline fixtures only; no HTTP handler accepts a target. */
export async function probeTarget(target: UptimeTarget, scheduledAt: number, request: Requester = fetch, clock: () => number = Date.now): Promise<UptimeSample> {
  const origin = publicHttpsOrigin(target.origin);
  const checkedAt = clock();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  const base = { ...target, origin, scheduledAt, checkedAt };
  let httpStatus: number | null = null;
  try {
    const headers = { 'User-Agent': 'SitesnitUptime/1.0', 'Cache-Control': 'no-cache' };
    const options = { redirect: 'manual' as const, signal: controller.signal, headers };
    let response = await request(origin + '/', { ...options, method: 'HEAD' });
    httpStatus = response.status;
    // No HTML is buffered or parsed; cancel bodies before another request begins.
    await response.body?.cancel();
    if (response.status === 405 || response.status === 501) {
      response = await request(origin + '/', { ...options, method: 'GET', headers: { ...headers, Range: 'bytes=0-1023' } });
      httpStatus = response.status;
      await response.body?.cancel();
    }
    return { ...base, ...classifyUptimeHttp(response.status, response.headers.has('cf-mitigated')), httpStatus, latencyMs: Math.max(0, clock() - checkedAt) };
  } catch {
    return { ...base, status: 'unknown', httpStatus, latencyMs: Math.max(0, clock() - checkedAt), errorCode: controller.signal.aborted ? 'timeout' : 'network_error' };
  } finally { clearTimeout(timeout); }
}

export async function signUptimeHeaders(rawBody: string, secret: string, now = Date.now(), deliveryId = crypto.randomUUID()): Promise<Record<string, string>> {
  if (secret.length < 32 || secret.length > 512) throw new Error('Uptime signing is not configured.');
  const timestamp = String(now);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(uptimeSigningMessage(timestamp, deliveryId, rawBody)));
  const hex = Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
  return { 'Content-Type': 'application/json', 'x-sitesnit-timestamp': timestamp, 'x-sitesnit-delivery': deliveryId, 'x-sitesnit-signature': `v1=${hex}` };
}

export async function runUptimeTick(env: UptimeWorkerEnv, scheduledTime: number, request: Requester = fetch, clock: () => number = Date.now): Promise<void> {
  if (env.UPTIME_ENABLED !== 'true') return;
  // All configuration is validated before any probe or secret-bearing request.
  const targets = parseUptimeTargets(env.UPTIME_TARGETS_JSON);
  if (!validUptimeId(env.UPTIME_MONITOR_ID) || !env.UPTIME_INGEST_SECRET || env.UPTIME_INGEST_SECRET.length < 32 || env.UPTIME_INGEST_SECRET.length > 512) throw new Error('Invalid uptime configuration.');
  const ingest = new URL(env.UPTIME_INGEST_URL);
  publicHttpsOrigin(ingest.origin);
  if (ingest.username || ingest.password || ingest.search || ingest.hash || !ingest.pathname.startsWith('/api/')) throw new Error('Invalid uptime ingestion endpoint.');
  const scheduledAt = Math.floor(scheduledTime / UPTIME_INTERVAL_MS) * UPTIME_INTERVAL_MS;
  if (!Number.isSafeInteger(scheduledTime) || Math.abs(clock() - scheduledAt) > UPTIME_CLOCK_SKEW_MS) throw new Error('Uptime schedule is stale.');
  // At most five connections. HEAD+fallback GET gives at most ten probes plus one ingest.
  const samples = await Promise.all(targets.map(target => probeTarget(target, scheduledAt, request, clock)));
  const batch: UptimeBatch = { version: 1, monitorId: env.UPTIME_MONITOR_ID, samples };
  const rawBody = JSON.stringify(batch);
  if (new TextEncoder().encode(rawBody).byteLength > UPTIME_MAX_BODY_BYTES) throw new Error('Uptime batch exceeds limit.');
  const headers = await signUptimeHeaders(rawBody, env.UPTIME_INGEST_SECRET, clock());
  const result = await request(ingest.href, { method: 'POST', redirect: 'manual', headers, body: rawBody, signal: AbortSignal.timeout(PROBE_TIMEOUT_MS) });
  await result.body?.cancel();
  if (!result.ok) throw new Error('Uptime ingestion failed.');
}

const uptimeWorker = {
  fetch() { return new Response('Not found.', { status: 404, headers: { 'Cache-Control': 'no-store' } }); },
  async scheduled(controller: ScheduledController, env: UptimeWorkerEnv) {
    controller.noRetry();
    await runUptimeTick(env, controller.scheduledTime);
  },
};
export default uptimeWorker;
