import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  UPTIME_CLOCK_SKEW_MS, UPTIME_INTERVAL_MS, UPTIME_MAX_BODY_BYTES, UPTIME_MAX_SITES,
  classifyUptimeHttp, publicHttpsOrigin, uptimeSigningMessage, validUptimeId,
  type UptimeSample, type UptimeTarget,
} from '../../workers/uptime/protocol';
export type { UptimeBatch, UptimeSample, UptimeTarget, UptimeStatus } from '../../workers/uptime/protocol';
export { UPTIME_INTERVAL_MS, UPTIME_MAX_BODY_BYTES } from '../../workers/uptime/protocol';

export class UptimeVerificationError extends Error {
  constructor() { super('Ongeldige uptimelevering.'); this.name = 'UptimeVerificationError'; }
}

/** Verifies authenticity, freshness, shape and server-owned origin assignments.
 * Caller MUST atomically insert deliveryId into a UNIQUE replay ledger with all samples.
 * A valid HMAC is not proof that a delivery has not already been stored.
 */
export function verifyUptimeEnvelope(input: {
  headers: Headers; rawBody: string; secret: string | undefined; allowedSites: readonly UptimeTarget[]; now?: number;
}): { deliveryId: string; monitorId: string; samples: UptimeSample[] } {
  const reject = (): never => { throw new UptimeVerificationError(); };
  const { headers, rawBody, secret, allowedSites } = input;
  const now = input.now ?? Date.now();
  const timestamp = headers.get('x-sitesnit-timestamp') ?? '';
  const deliveryId = headers.get('x-sitesnit-delivery') ?? '';
  const signature = headers.get('x-sitesnit-signature') ?? '';
  if (!Number.isSafeInteger(now) || !secret || secret.length < 32 || secret.length > 512 || Buffer.byteLength(rawBody, 'utf8') > UPTIME_MAX_BODY_BYTES ||
      !/^\d{13}$/.test(timestamp) || Math.abs(now - Number(timestamp)) > UPTIME_CLOCK_SKEW_MS ||
      !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(deliveryId) || !/^v1=[a-f0-9]{64}$/.test(signature)) reject();
  const expected = createHmac('sha256', secret!).update(uptimeSigningMessage(timestamp, deliveryId, rawBody)).digest();
  const received = Buffer.from(signature.slice(3), 'hex');
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) reject();
  let data: unknown;
  try { data = JSON.parse(rawBody); } catch { return reject(); }
  if (!data || typeof data !== 'object' || !('version' in data) || data.version !== 1 || !('monitorId' in data) || !validUptimeId(data.monitorId) || !('samples' in data) || !Array.isArray(data.samples) || data.samples.length < 1 || data.samples.length > UPTIME_MAX_SITES) return reject();
  const allowed = new Map(allowedSites.map(site => [site.siteId, site.origin]));
  const seen = new Set<string>();
  const samples: UptimeSample[] = [];
  for (const item of data.samples) {
    if (!item || typeof item !== 'object') return reject();
    const sample = item as Record<string, unknown>;
    if (!validUptimeId(sample.siteId) || seen.has(sample.siteId) || typeof sample.origin !== 'string' || allowed.get(sample.siteId) !== sample.origin) return reject();
    try { publicHttpsOrigin(sample.origin); } catch { return reject(); }
    seen.add(sample.siteId);
    if (typeof sample.scheduledAt !== 'number' || !Number.isSafeInteger(sample.scheduledAt) || sample.scheduledAt % UPTIME_INTERVAL_MS !== 0 ||
        typeof sample.checkedAt !== 'number' || !Number.isSafeInteger(sample.checkedAt) || sample.checkedAt < sample.scheduledAt ||
        sample.checkedAt - sample.scheduledAt > UPTIME_CLOCK_SKEW_MS || Math.abs(Number(timestamp) - sample.checkedAt) > 60_000 ||
        typeof sample.latencyMs !== 'number' || !Number.isInteger(sample.latencyMs) || sample.latencyMs < 0 || sample.latencyMs > 60_000 ||
        !['up', 'down', 'unknown'].includes(String(sample.status)) ||
        !(sample.httpStatus === null || typeof sample.httpStatus === 'number' && Number.isInteger(sample.httpStatus) && sample.httpStatus >= 100 && sample.httpStatus <= 599)) return reject();
    const validUnknown = ['blocked', 'redirect', 'timeout', 'network_error', 'unexpected_status'];
    if (sample.status === 'up' && (sample.errorCode !== null || sample.httpStatus === null || Number(sample.httpStatus) < 200 || Number(sample.httpStatus) >= 300) ||
        sample.status === 'down' && (sample.errorCode !== 'http_error' || sample.httpStatus === null || classifyUptimeHttp(Number(sample.httpStatus)).status !== 'down') ||
        sample.status === 'unknown' && !validUnknown.includes(String(sample.errorCode))) return reject();
    samples.push({ siteId: sample.siteId, origin: sample.origin, scheduledAt: sample.scheduledAt, checkedAt: sample.checkedAt,
      latencyMs: sample.latencyMs, status: sample.status as UptimeSample['status'], httpStatus: sample.httpStatus as number | null, errorCode: sample.errorCode as UptimeSample['errorCode'] });
  }
  return { deliveryId, monitorId: data.monitorId, samples };
}

export type UptimeIncident = { firstFailureAt: number; confirmedAt: number; recoveredAt: number | null; coverageInterrupted: boolean };
export type UptimeSummary = {
  expectedSlots: number; measuredSlots: number; missingSlots: number; unknownSlots: number;
  upSamples: number; downSamples: number; measuredAvailabilityPercent: number | null; coveragePercent: number | null;
  latestStatus: 'up' | 'suspected_down' | 'down' | 'unknown'; incidents: UptimeIncident[];
};

/** One site's completed UTC slots in [from,to); pass to <= now-60s for live views.
 * Never backfill missing slots. Percentages represent samples, not a time-based SLA.
 */
export function summarizeUptime(samples: readonly UptimeSample[], window: { from: number; to: number; now?: number }): UptimeSummary {
  const now = window.now ?? Date.now();
  if (!Number.isSafeInteger(window.from) || !Number.isSafeInteger(window.to) || window.to < window.from || window.to > now) throw new Error('Ongeldig uptimebereik.');
  const expectedSlots = Math.max(0, Math.ceil(window.to / UPTIME_INTERVAL_MS) - Math.ceil(window.from / UPTIME_INTERVAL_MS));
  const relevant = samples.filter(sample => sample.scheduledAt >= window.from && sample.scheduledAt < window.to);
  if (new Set(relevant.map(sample => sample.siteId)).size > 1) throw new Error('Analyseer een site tegelijk.');
  const slots = new Map<number, UptimeSample>();
  for (const sample of relevant) {
    if (!Number.isSafeInteger(sample.scheduledAt) || sample.scheduledAt % UPTIME_INTERVAL_MS !== 0 || sample.checkedAt < sample.scheduledAt || sample.checkedAt > now) throw new Error('Ongeldige uptimemeting.');
    const existing = slots.get(sample.scheduledAt);
    // Conflicting duplicate deliveries must not inflate success or create incidents.
    if (existing && (existing.status !== sample.status || existing.httpStatus !== sample.httpStatus || existing.errorCode !== sample.errorCode)) {
      slots.set(sample.scheduledAt, { ...existing, status: 'unknown', errorCode: 'unexpected_status' });
    } else if (!existing) slots.set(sample.scheduledAt, sample);
  }
  const ordered = [...slots.values()].sort((a, b) => a.scheduledAt - b.scheduledAt);
  let upSamples = 0, downSamples = 0, unknownSlots = 0;
  let previous: UptimeSample | undefined;
  let active: UptimeIncident | undefined;
  const incidents: UptimeIncident[] = [];
  for (const sample of ordered) {
    const gap = previous !== undefined && sample.scheduledAt - previous.scheduledAt !== UPTIME_INTERVAL_MS;
    if (active && (gap || sample.status === 'unknown')) active.coverageInterrupted = true;
    if (sample.status === 'up') {
      upSamples++;
      if (active) { active.recoveredAt = sample.checkedAt; active = undefined; }
    } else if (sample.status === 'down') {
      downSamples++;
      if (!active && !gap && previous?.status === 'down') {
        active = { firstFailureAt: previous.checkedAt, confirmedAt: sample.checkedAt, recoveredAt: null, coverageInterrupted: false };
        incidents.push(active);
      }
    } else unknownSlots++;
    previous = sample;
  }
  const lastExpectedSlot = expectedSlots ? (Math.ceil(window.to / UPTIME_INTERVAL_MS) - 1) * UPTIME_INTERVAL_MS : null;
  const latest = lastExpectedSlot === null ? undefined : slots.get(lastExpectedSlot);
  if (active && (!latest || latest.status === 'unknown')) active.coverageInterrupted = true;
  return { expectedSlots, measuredSlots: slots.size, missingSlots: expectedSlots - slots.size, unknownSlots, upSamples, downSamples,
    measuredAvailabilityPercent: upSamples + downSamples ? upSamples / (upSamples + downSamples) * 100 : null,
    coveragePercent: expectedSlots ? slots.size / expectedSlots * 100 : null,
    latestStatus: !latest || latest.status === 'unknown' ? 'unknown' : latest.status === 'up' ? 'up' : active ? 'down' : 'suspected_down', incidents };
}
