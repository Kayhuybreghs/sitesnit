export const HUB_SYNC_ENDPOINT = 'https://www.sitesnit.nl/api/hub/sync';
export const HUB_SYNC_TIMEOUT_MS = 55_000;
const MAX_RESPONSE_BYTES = 8192;
type Requester = (url: string, init: RequestInit) => Promise<Response>;

/** No client inputs, target URLs, data credentials or public trigger endpoint. */
export async function runHubSyncTick(env: HubSyncWorkerEnv, request: Requester = fetch): Promise<{ state: 'disabled' | 'dispatched'; sitesProcessed: number }> {
  if (env.HUB_SYNC_ENABLED !== 'true') return { state: 'disabled', sitesProcessed: 0 };
  const secret = env.HUB_SYNC_SECRET;
  if (!secret || secret.length < 32 || secret.length > 512 || /[\r\n]/.test(secret)) throw new Error('Hub sync secret is not configured.');
  try {
    const response = await request(HUB_SYNC_ENDPOINT, { method: 'POST', redirect: 'error', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }, body: '{}', signal: AbortSignal.timeout(HUB_SYNC_TIMEOUT_MS) });
    if (!response.ok) { await response.body?.cancel(); throw new Error(); }
    const reader = response.body?.getReader();
    if (!reader) throw new Error();
    const chunks: Uint8Array[] = []; let length = 0;
    try {
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        length += value.length;
        if (length > MAX_RESPONSE_BYTES) { await reader.cancel(); throw new Error(); }
        chunks.push(value);
      }
    } finally { reader.releaseLock(); }
    const bytes = new Uint8Array(length); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const payload: unknown = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!payload || typeof payload !== 'object' || !('limit' in payload) || payload.limit !== 1 || !('results' in payload) || !Array.isArray(payload.results) || payload.results.length > 1 || payload.results.some(row => !row || typeof row !== 'object' || !('checked' in row) || row.checked !== true)) throw new Error();
    // Dispatched describes processing by the Hub endpoint, not healthy/connected data sources.
    return { state: 'dispatched', sitesProcessed: payload.results.length };
  } catch { throw new Error('Hub sync delivery failed.'); }
}

const hubSyncWorker = {
  fetch() { return new Response('Not found.', { status: 404, headers: { 'Cache-Control': 'no-store' } }); },
  async scheduled(controller: ScheduledController, env: HubSyncWorkerEnv) {
    controller.noRetry();
    const outcome = await runHubSyncTick(env);
    console.log(JSON.stringify({ event: 'hub-sync', state: outcome.state, sitesProcessed: outcome.sitesProcessed }));
  },
} satisfies ExportedHandler<HubSyncWorkerEnv>;
export default hubSyncWorker;
