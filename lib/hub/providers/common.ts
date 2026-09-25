export type Period = { startDate: string; endDate: string };
export type Source = "ga4" | "search-console" | "vercel";
export type ProviderCode = "not-configured" | "invalid-config" | "authentication" | "quota" | "provider" | "network" | "invalid-response" | "no-data";
export type ProviderResult<T> = {
  state: "ready" | "unavailable" | "error";
  source: Source;
  period: Period | null;
  timeZone: string | null;
  fetchedAt: string;
  data: T | null;
  code?: ProviderCode;
  warnings: string[];
};
export type ProviderDependencies = {
  fetch: typeof globalThis.fetch;
  /** Server-only token resolver, already bound to an authorized Hub integration. */
  getAccessToken: () => Promise<string | null>;
  now?: () => Date;
};
/** Controlled token failures preserve a safe category without exposing token-endpoint text. */
export class TokenResolutionError extends Error {
  readonly code: ProviderCode;
  constructor(code: ProviderCode) { super("Provider authentication failed"); this.code = code; }
}
export function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("invalid-response");
  return value as Record<string, unknown>;
}
export function number(value: unknown): number {
  if (typeof value !== "number" && (typeof value !== "string" || !/^\d+(\.\d+)?$/.test(value))) throw new Error("invalid-response");
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0) throw new Error("invalid-response");
  return result;
}
export function text(value: unknown): string {
  if (typeof value !== "string" || value.length > 4096) throw new Error("invalid-response");
  return value;
}
export function validPeriod(period: Period): boolean {
  const valid = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  return valid(period.startDate) && valid(period.endDate) && period.startDate <= period.endDate;
}
export function result<T>(source: Source, period: Period | null, deps: ProviderDependencies, data: T | null, code?: ProviderCode, timeZone: string | null = null, warnings: string[] = []): ProviderResult<T> {
  return { source, period, timeZone, fetchedAt: (deps.now?.() ?? new Date()).toISOString(), data, state: code ? (["not-configured", "no-data"].includes(code) ? "unavailable" : "error") : "ready", ...(code ? { code } : {}), warnings };
}
export async function accessToken(deps: ProviderDependencies): Promise<{ token: string | null; code?: ProviderCode }> {
  try {
    const token = await deps.getAccessToken();
    if (!token) return { token: null, code: "not-configured" };
    if (/[\r\n]/.test(token)) return { token: null, code: "authentication" };
    return { token };
  } catch (error) { return { token: null, code: error instanceof TokenResolutionError ? error.code : "authentication" }; }
}
export async function requestJson(url: string, token: string, deps: ProviderDependencies, body?: unknown): Promise<{ json?: unknown; code?: ProviderCode }> {
  try {
    const response = await deps.fetch(url, { method: body === undefined ? "GET" : "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000) });
    if (!response.ok) return { code: response.status === 401 || response.status === 403 ? "authentication" : response.status === 429 ? "quota" : "provider" };
    try { return { json: await response.json() }; } catch { return { code: "invalid-response" }; }
  } catch { return { code: "network" }; }
}
