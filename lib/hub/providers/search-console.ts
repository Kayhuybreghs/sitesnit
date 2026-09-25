import { accessToken, number, record, requestJson, result, text, validPeriod, type Period, type ProviderDependencies, type ProviderResult } from "./common";
export type SearchRow = { keys: string[]; clicks: number; impressions: number; ctr: number | null; position: number | null };
export type SearchReport = { rows: SearchRow[]; aggregation: "byProperty" | "byPage"; dataState: "final"; topRowsOnly: boolean };
export type SearchConsoleData = Record<"totals" | "daily" | "queries" | "pages", ProviderResult<SearchReport>>;

export async function fetchSearchConsole(config: { siteUrl: string; period: Period }, deps: ProviderDependencies): Promise<SearchConsoleData> {
  const valid = /^(sc-domain:[a-z0-9.-]+|https?:\/\/[^\s?#]+)$/i.test(config.siteUrl) && validPeriod(config.period);
  const auth = valid ? await accessToken(deps) : { token: null, code: "invalid-config" as const };
  const specs = { totals: [], daily: ["date"], queries: ["query"], pages: ["page"] };
  const entries = await Promise.all(Object.entries(specs).map(async ([key, dimensions]) => {
    const wrap = (data: SearchReport | null, code?: Parameters<typeof result>[4], warnings: string[] = []) => result("search-console", config.period, deps, data, code, "America/Los_Angeles", warnings);
    if (!auth.token) return [key, wrap(null, auth.code)] as const;
    const aggregation = key === "pages" ? "byPage" : "byProperty";
    const response = await requestJson(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.siteUrl)}/searchAnalytics/query`, auth.token, deps, { ...config.period, dimensions, type: "web", aggregationType: aggregation, dataState: "final", rowLimit: key === "daily" ? 400 : 50 });
    if (response.code) return [key, wrap(null, response.code)] as const;
    try {
      const payload = record(response.json), rawRows = payload.rows ?? [];
      if (!Array.isArray(rawRows) || rawRows.length > 400 || payload.responseAggregationType !== aggregation) throw new Error("invalid-response");
      const rows = rawRows.map((raw): SearchRow => {
        const row = record(raw), keys = row.keys ?? [];
        if (!Array.isArray(keys) || keys.length !== dimensions.length) throw new Error("invalid-response");
        const clicks = number(row.clicks), impressions = number(row.impressions), providerCtr = number(row.ctr), position = number(row.position);
        if (clicks > impressions || providerCtr > 1 || (impressions > 0 && position < 1)) throw new Error("invalid-response");
        return { keys: keys.map(text), clicks, impressions, ctr: impressions ? clicks / impressions : null, position: impressions ? position : null };
      });
      if (key === "totals" && rows.length > 1) throw new Error("invalid-response");
      const topRowsOnly = key === "queries" || key === "pages";
      const warnings = ["Search Console publiceert gegevens met vertraging; alleen definitieve data is opgevraagd."];
      if (topRowsOnly) warnings.push("Dit zijn toprijen. Ontbrekende of geanonimiseerde rijen maken de som ongeschikt als totaalcijfer.");
      if (key === "daily" && rows.length === 400) warnings.push("De opgehaalde dagreeks kan zijn afgekapt.");
      return [key, wrap(rows.length ? { rows, aggregation, dataState: "final", topRowsOnly } : null, rows.length ? undefined : "no-data", warnings)] as const;
    } catch { return [key, wrap(null, "invalid-response")] as const; }
  }));
  return Object.fromEntries(entries) as SearchConsoleData;
}
