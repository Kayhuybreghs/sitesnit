import { timingSafeEqual } from "node:crypto";
import type { AppDatabase } from "./database-core";

export const EVENT_RETENTION_DAYS = 90;

/** Calendar-year subtraction, clamping 29 February to 28 February. All boundaries use UTC. */
export function inquiryCutoff(now: number): number {
  const date = new Date(now);
  const targetYear = date.getUTCFullYear() - 1;
  const month = date.getUTCMonth();
  const lastDay = new Date(Date.UTC(targetYear, month + 1, 0)).getUTCDate();
  return Date.UTC(targetYear, month, Math.min(date.getUTCDate(), lastDay), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds());
}

export async function cleanupRetention(database: AppDatabase, now = Date.now()) {
  if (!Number.isSafeInteger(now) || now <= 0) throw new Error("Invalid cleanup time.");
  const inquiriesBefore = inquiryCutoff(now);
  const eventsBefore = now - EVENT_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  const inquiries = await database.prepare("DELETE FROM inquiries WHERE created_at < ?").bind(inquiriesBefore).run();
  const events = await database.prepare("DELETE FROM events WHERE created_at < ?").bind(eventsBefore).run();
  const rateLimits = await database.prepare("DELETE FROM rate_limits WHERE reset_at < ?").bind(now).run();
  return { completedAt: new Date(now).toISOString(), deleted: { inquiries: inquiries.meta.changes, events: events.meta.changes, rateLimits: rateLimits.meta.changes } };
}

export function authorizedMaintenance(request: Request, secret: string | undefined): boolean {
  if (!secret || secret.length < 16 || secret.length > 512) return false;
  const received = request.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  const left = Buffer.from(received), right = Buffer.from(expected);
  return left.length === right.length && timingSafeEqual(left, right);
}

const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow", "X-Content-Type-Options": "nosniff" };
export async function retentionResponse(request: Request, database: AppDatabase, secret: string | undefined, now = Date.now()) {
  if (!authorizedMaintenance(request, secret)) return Response.json({ error: "Niet toegestaan." }, { status: 401, headers });
  try { return Response.json({ ok: true, ...await cleanupRetention(database, now) }, { headers }); }
  catch { return Response.json({ error: "Het opruimen kon niet worden afgerond." }, { status: 503, headers }); }
}

export async function storageResponse(request: Request, database: AppDatabase, secret: string | undefined) {
  if (!authorizedMaintenance(request, secret)) return Response.json({ error: "Niet toegestaan." }, { status: 401, headers });
  try {
    await database.prepare("SELECT id,name,email,website,package_id,message,tool_summary,created_at FROM inquiries LIMIT 0").all();
    await database.prepare("SELECT id,type,created_at FROM events LIMIT 0").all();
    await database.prepare("SELECT key,count,reset_at FROM rate_limits LIMIT 0").all();
    return Response.json({ ok: true, schema: "sitesnit-1" }, { headers });
  } catch { return Response.json({ error: "De opslag is niet gereed." }, { status: 503, headers }); }
}
