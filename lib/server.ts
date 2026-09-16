import { readObjectBody, RequestBodyError } from "./request-body";
import { runtime } from "./runtime";
import { consumeRateLimit } from "./rate-limit";
export { runtime } from "./runtime";
export { RequestBodyError } from "./request-body";

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: {
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
    "X-Content-Type-Options": "nosniff",
  } });
}
export function validOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    // Next may construct request.url with its internal localhost hostname.
    // The HTTP Host is the public target; Vercel supplies the external protocol.
    const target = new URL(request.url);
    const host = request.headers.get('host') || target.host;
    const protocol = process.env.VERCEL ? 'https:' : target.protocol;
    return origin === new URL(`${protocol}//${host}`).origin;
  } catch { return false; }
}
export async function readJson(request: Request, max = 22000) {
  if (!validOrigin(request)) throw new RequestBodyError("Ongeldige herkomst.", 403);
  return readObjectBody(request, max);
}
export async function rateLimit(request: Request, kind: string, max: number, seconds = 300) {
  const environment = runtime();
  return consumeRateLimit(environment.DB, request, kind, max, seconds, {
    vercel: Boolean(process.env.VERCEL),
    secret: environment.RATE_LIMIT_SECRET || environment.PAGESPEED_API_KEY,
  });
}
