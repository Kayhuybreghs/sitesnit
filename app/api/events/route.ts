import { json, readJson, runtime, rateLimit, RequestBodyError } from "../../../lib/server";
export async function POST(request: Request) {
  try {
    const b = await readJson(request, 1000);
    if (
      ![
        "websitecheck_start",
        "websitecheck_complete",
        "prijscheck_start",
        "prijscheck_complete",
      ].includes(b.type)
    )
      return json({ error: "Ongeldig event" }, 400);
    if (!(await rateLimit(request, "events", 30))) return json({}, 429);
    await runtime()
      .DB.prepare("INSERT INTO events (id,type,created_at) VALUES (?,?,?)")
      .bind(crypto.randomUUID(), b.type, Date.now())
      .run();
    return json({ ok: true });
  } catch (error) {
    if (error instanceof RequestBodyError) return json({error:error.message},error.status);
    return json({}, 503);
  }
}
