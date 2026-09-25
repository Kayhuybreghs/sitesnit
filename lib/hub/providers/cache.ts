import type { ProviderResult } from "./common";
export const PROVIDER_TTL_MS = { ga4: 60 * 60_000, "search-console": 24 * 60 * 60_000, vercel: 5 * 60_000 };
export type SnapshotStore<T> = { get: (key: string) => Promise<ProviderResult<T> | null>; set: (key: string, value: ProviderResult<T>) => Promise<void> };
export function snapshotKey(config: { tenantId: string; siteId: string; integrationId: string; report: string; startDate?: string; endDate?: string }): string {
  if (!config.tenantId || !config.siteId || !config.integrationId || !config.report) throw new Error("Snapshot scope is required");
  return JSON.stringify([config.tenantId, config.siteId, config.integrationId, config.report, config.startDate ?? null, config.endDate ?? null]);
}
/** Scheduler/server service supplies storage and handles distributed locking. Never use a shared unscoped key. */
export async function readSnapshot<T>(config: { key: string; maxAgeMs: number; now: Date; store: SnapshotStore<T>; refresh: () => Promise<ProviderResult<T>> }): Promise<{ snapshot: ProviderResult<T>; stale: boolean; refreshCode?: string }> {
  const previous = await config.store.get(config.key);
  const age = previous ? config.now.getTime() - Date.parse(previous.fetchedAt) : Infinity;
  if (previous?.state === "ready" && age >= 0 && age <= config.maxAgeMs) return { snapshot: previous, stale: false };
  const current = await config.refresh();
  if (current.state === "ready") { await config.store.set(config.key, current); return { snapshot: current, stale: false }; }
  if (previous?.state === "ready") return { snapshot: previous, stale: true, refreshCode: current.code };
  return { snapshot: current, stale: false };
}
