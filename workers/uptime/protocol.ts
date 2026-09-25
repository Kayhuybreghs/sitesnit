/** Shared wire contract: no bindings, database, browser, or client-supplied targets. */
export const UPTIME_INTERVAL_MS = 300_000;
export const UPTIME_MAX_SITES = 5;
export const UPTIME_MAX_BODY_BYTES = 16_384;
export const UPTIME_CLOCK_SKEW_MS = 300_000;
export const UPTIME_SIGNATURE_CONTEXT = 'sitesnit-uptime-v1';
export type UptimeTarget = { siteId: string; origin: string };
export type UptimeStatus = 'up' | 'down' | 'unknown';
export type UptimeError = 'http_error' | 'redirect' | 'blocked' | 'timeout' | 'network_error' | 'unexpected_status';
export type UptimeSample = UptimeTarget & {
  scheduledAt: number;
  checkedAt: number;
  status: UptimeStatus;
  httpStatus: number | null;
  latencyMs: number;
  errorCode: UptimeError | null;
};
export type UptimeBatch = { version: 1; monitorId: string; samples: UptimeSample[] };

export function validUptimeId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value);
}

/** Syntax boundary only. DNS/public-address guarantees require a separate egress boundary. */
export function publicHttpsOrigin(value: unknown): string {
  if (typeof value !== 'string' || value.length > 253) throw new Error('Invalid uptime origin.');
  const url = new URL(value);
  const host = url.hostname;
  if (url.protocol !== 'https:' || url.username || url.password || url.port ||
      url.pathname !== '/' || url.search || url.hash || host.endsWith('.') ||
      !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/.test(host) ||
      /(?:^|\.)(?:localhost|local|internal|test|invalid|arpa|onion)$/.test(host) ||
      value !== url.origin) throw new Error('Invalid uptime origin.');
  return url.origin;
}

export function parseUptimeTargets(raw: string): UptimeTarget[] {
  if (raw.length > 4096) throw new Error('Invalid uptime configuration.');
  const entries: unknown = JSON.parse(raw);
  if (!Array.isArray(entries) || entries.length < 1 || entries.length > UPTIME_MAX_SITES) throw new Error('Invalid uptime configuration.');
  const seen = new Set<string>();
  return entries.map((entry: unknown) => {
    if (!entry || typeof entry !== 'object' || !('siteId' in entry) || !('origin' in entry) || !validUptimeId(entry.siteId) || seen.has(entry.siteId)) throw new Error('Invalid uptime configuration.');
    seen.add(entry.siteId);
    return { siteId: entry.siteId, origin: publicHttpsOrigin(entry.origin) };
  });
}

export function uptimeSigningMessage(timestamp: string, deliveryId: string, rawBody: string): string {
  return `${UPTIME_SIGNATURE_CONTEXT}\n${timestamp}\n${deliveryId}\n${rawBody}`;
}

export function classifyUptimeHttp(status: number, mitigated = false): Pick<UptimeSample, 'status' | 'errorCode'> {
  if (mitigated || status === 401 || status === 403 || status === 429) return { status: 'unknown', errorCode: 'blocked' };
  if (status >= 200 && status < 300) return { status: 'up', errorCode: null };
  if (status >= 300 && status < 400) return { status: 'unknown', errorCode: 'redirect' };
  if (status === 404 || status === 410 || status >= 500 && status < 600) return { status: 'down', errorCode: 'http_error' };
  return { status: 'unknown', errorCode: 'unexpected_status' };
}
