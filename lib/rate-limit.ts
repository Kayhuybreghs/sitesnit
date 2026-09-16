import { createHash, randomBytes } from "node:crypto";
import { isIP } from "node:net";
import type { AppDatabase } from "./database-core";

const localSalt = randomBytes(32).toString("hex");
export function requestAddress(request: Request, vercel: boolean): string {
  if (!vercel) return "local-preview";
  const address = (request.headers.get("x-vercel-forwarded-for") ?? "").split(",")[0].trim();
  if (!isIP(address)) throw new Error("A verified client address is unavailable.");
  return address;
}

export async function consumeRateLimit(database: AppDatabase, request: Request, kind: string, maximum: number, seconds = 300, options: { vercel: boolean; secret?: string; now?: number }) {
  if (!/^[a-z][a-z0-9_-]{0,40}$/.test(kind) || !Number.isInteger(maximum) || maximum < 1 || !Number.isInteger(seconds) || seconds < 1) throw new Error("Invalid rate-limit settings.");
  const secret = options.secret || (options.vercel ? "" : localSalt);
  if (!secret) throw new Error("Rate-limit configuration is unavailable.");
  const now = options.now ?? Date.now();
  const bucket = Math.floor(now / (seconds * 1000));
  const address = requestAddress(request, options.vercel);
  const key = createHash("sha256").update(`${kind}|${bucket}|${address}|${secret}`).digest("hex");
  const row = await database.prepare(
    "INSERT INTO rate_limits (key,count,reset_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1 RETURNING count",
  ).bind(key, (bucket + 1) * seconds * 1000).first<{ count: number }>();
  return Boolean(row && Number.isInteger(row.count) && row.count <= maximum);
}
