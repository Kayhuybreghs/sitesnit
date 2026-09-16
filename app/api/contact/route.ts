import { json, readJson, runtime, rateLimit, RequestBodyError } from "../../../lib/server";
import { site } from "../../site-data";
export async function POST(request: Request) {
  try {
    const b = await readJson(request);
    if (b.companyCheck)
      return json({ error: "De aanvraag kon niet worden verwerkt." }, 400);
    const name = String(b.name ?? "").trim();
    const email = String(b.email ?? "").trim();
    const message = String(b.message ?? "").trim();
    const website = String(b.website ?? "").trim();
    const id = String(b.requestId ?? "");
    if (
      name.length < 2 ||
      name.length > 100 ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      email.length > 254 ||
      message.length < 10 ||
      message.length > 4000 ||
      website.length > 2000 ||
      !/^[a-f0-9-]{36}$/.test(id)
    )
      return json(
        {
          error:
            "Controleer je naam, e-mailadres en bericht (minimaal 10 tekens).",
        },
        400,
      );
    const packageId = site.packages.some((p) => p.id === b.packageId)
      ? b.packageId
      : null;
    const toolSummary =
      b.includeSummary === true
        ? String(b.toolSummary ?? "").slice(0, 12000)
        : null;
    if (!(await rateLimit(request, "contact", 8, 600)))
      return json(
        {
          error:
            "Je hebt meerdere aanvragen kort achter elkaar gedaan. Probeer het over enkele minuten opnieuw.",
        },
        429,
      );
    const { DB } = runtime();
    const inserted = await DB.prepare(
      "INSERT INTO inquiries (id,name,email,website,package_id,message,tool_summary,created_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING",
    )
      .bind(
        id,
        name,
        email,
        website || null,
        packageId,
        message,
        toolSummary,
        Date.now(),
      )
      .run();
    if (!inserted.success) throw new Error("insert failed");
    return json({ ok: true, id });
  } catch (error) {
    if (error instanceof RequestBodyError) return json({error:error.message},error.status);
    return json(
      {
        error:
          "Je aanvraag is niet verzonden. Je invoer blijft staan. Probeer het later opnieuw.",
      },
      503,
    );
  }
}
