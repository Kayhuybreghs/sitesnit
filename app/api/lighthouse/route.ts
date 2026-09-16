import { normalizeLighthouse } from "../../../lib/lighthouse";
import { publicWebsiteUrl } from "../../../lib/url";
import { json, readJson, runtime, rateLimit, RequestBodyError } from "../../../lib/server";
export const maxDuration = 120;
export async function POST(request: Request) {
  let url: string;
  try {
    const body = await readJson(request, 4000);
    if (typeof body.url !== 'string') throw new Error('Vul een geldig websiteadres in.');
    url = publicWebsiteUrl(body.url);
  } catch (e) {
    if (e instanceof RequestBodyError) return json({error:e.message,code:'invalid_request'},e.status);
    return json({ error: (e as Error).message, code: "invalid_url" }, 400);
  }
  try {
    if (!(await rateLimit(request, "scan", 5, 600)))
      return json(
        {
          error:
            "Er zijn in korte tijd meerdere scans gestart. Probeer het over enkele minuten opnieuw; je antwoorden blijven bewaard.",
          code: "rate_limit",
        },
        429,
      );
    const key = runtime().PAGESPEED_API_KEY;
    if (!key)
      return json(
        {
          error:
            "De technische analyse is tijdelijk niet beschikbaar. Je kunt de vragen beantwoorden en later opnieuw proberen.",
          code: "not_configured",
        },
        503,
      );
    const endpoint = new URL(
      "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
    );
    endpoint.searchParams.set("url", url);
    endpoint.searchParams.set("strategy", "mobile");
    endpoint.searchParams.set("locale", "nl");
    for (const c of ["performance", "accessibility", "best-practices", "seo"])
      endpoint.searchParams.append("category", c);
    endpoint.searchParams.set("key", key);
    const response = await fetch(endpoint, {
      cache: 'no-store',
      signal: AbortSignal.timeout(110000),
    });
    if (!response.ok) {
      const code =
        response.status === 429
          ? "quota"
          : response.status === 400
            ? "unreachable"
            : response.status === 403
              ? "configuration"
              : "upstream";
      return json(
        {
          error:
            code === "quota"
              ? "Google kan op dit moment geen nieuwe analyse uitvoeren. Je antwoorden blijven bewaard. Probeer de technische scan later opnieuw."
              : code === "unreachable"
                ? "Google kan deze pagina niet onderzoeken. Controleer het websiteadres en probeer opnieuw."
                : "De technische analyse is niet gelukt. Je antwoorden blijven bewaard; je kunt opnieuw proberen.",
          code,
        },
        response.status === 429 ? 429 : 502,
      );
    }
    const data = await response.json();
    const result = normalizeLighthouse(data, url);
    return json({ result });
  } catch (e) {
    return json(
      {
        error:
          (e as Error).name === "TimeoutError"
            ? "De analyse duurt te lang. Je antwoorden blijven bewaard. Probeer de scan opnieuw."
            : "De technische analyse kon niet worden afgerond. Je antwoorden blijven bewaard. Probeer opnieuw.",
        code: "scan_failed",
      },
      502,
    );
  }
}
