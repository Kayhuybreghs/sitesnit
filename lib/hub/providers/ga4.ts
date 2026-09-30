import { accessToken, number, record, requestJson, result, text, validPeriod, type Period, type ProviderDependencies, type ProviderResult } from "./common";

export const HUB_EVENTS = ["tool_start", "tool_complete", "cta_click", "form_start", "generate_lead", "contact_intent"] as const;
export type Ga4Row = { dimensions: Record<string, string>; metrics: Record<string, number> };
export type Ga4Report = { rows: Ga4Row[]; rowCount: number; subjectToThresholding: boolean; sampled: boolean; dataLossFromOtherRow: boolean };
const reports = {
  totals: { dimensions: [], metrics: ["totalUsers", "activeUsers", "sessions", "screenPageViews"] },
  daily: { dimensions: ["date"], metrics: ["totalUsers", "sessions", "screenPageViews"] },
  channels: { dimensions: ["sessionDefaultChannelGroup"], metrics: ["sessions", "totalUsers"] },
  sources: { dimensions: ["sessionSourceMedium"], metrics: ["sessions", "totalUsers"] },
  monthly: { dimensions: ["yearMonth"], metrics: ["totalUsers", "sessions", "screenPageViews"] },
  landingPages: { dimensions: ["landingPage"], metrics: ["sessions", "totalUsers"] },
  devices: { dimensions: ["deviceCategory"], metrics: ["sessions", "totalUsers"] },
  countries: { dimensions: ["country"], metrics: ["sessions", "totalUsers"] },
  events: { dimensions: ["eventName"], metrics: ["eventCount"] },
} satisfies Record<string, { dimensions: string[]; metrics: string[] }>;
export type Ga4Data = { [K in keyof typeof reports]: ProviderResult<Ga4Report> };

export function completedMonths(endDate: string): Period {
  const end = new Date(endDate+'T00:00:00Z');
  return {startDate:new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth()-6,1)).toISOString().slice(0,10),endDate:new Date(Date.UTC(end.getUTCFullYear(),end.getUTCMonth(),0)).toISOString().slice(0,10)};
}

function parseReport(value: unknown, dimensions: readonly string[], metrics: readonly string[]) {
  const payload = record(value);
  // Google can omit even the headers for an empty aggregate report.
  // Require its response identity and metadata, so malformed {} is still rejected.
  const metadataOnly = payload.kind === 'analyticsData#runReport'
    && payload.rows === undefined && (payload.rowCount === undefined || payload.rowCount === 0)
    && payload.dimensionHeaders === undefined && payload.metricHeaders === undefined
    && typeof record(payload.metadata).timeZone === 'string';
  const headers = (value: unknown, expected: readonly string[]) => {
    if (metadataOnly && value === undefined) return;
    if (value === undefined && expected.length === 0) return;
    if (!Array.isArray(value) || value.length !== expected.length || value.some((item, i) => record(item).name !== expected[i])) throw new Error("invalid-response");
  };
  headers(payload.dimensionHeaders, dimensions);
  headers(payload.metricHeaders, metrics);
  const metadata = payload.metadata === undefined ? {} : record(payload.metadata);
  const rows = payload.rows ?? [];
  if (!Array.isArray(rows) || rows.length > 10_000) throw new Error("invalid-response");
  const parsed = rows.map((item): Ga4Row => {
    const row = record(item), dv = row.dimensionValues ?? [], mv = row.metricValues;
    if (!Array.isArray(dv) || dv.length !== dimensions.length || !Array.isArray(mv) || mv.length !== metrics.length) throw new Error("invalid-response");
    return { dimensions: Object.fromEntries(dimensions.map((key, i) => [key, text(record(dv[i]).value)])), metrics: Object.fromEntries(metrics.map((key, i) => [key, number(record(mv[i]).value)])) };
  });
  if (!dimensions.length && parsed.length > 1) throw new Error("invalid-response");
  const rowCount = payload.rowCount === undefined ? parsed.length : number(payload.rowCount);
  if (rowCount < parsed.length) throw new Error("invalid-response");
  const data: Ga4Report = { rows: parsed, rowCount, subjectToThresholding: metadata.subjectToThresholding === true, sampled: Array.isArray(metadata.samplingMetadatas) && metadata.samplingMetadatas.length > 0, dataLossFromOtherRow: metadata.dataLossFromOtherRow === true };
  const warnings: string[] = [];
  if (data.subjectToThresholding) warnings.push("Google past privacydrempels toe; sommige gegevens kunnen ontbreken.");
  if (data.sampled) warnings.push("Dit rapport is gebaseerd op een steekproef.");
  if (data.dataLossFromOtherRow) warnings.push("Google heeft een deel van de uitsplitsing samengevoegd.");
  if (rowCount > parsed.length) warnings.push("Alleen de eerste rijen zijn opgehaald; dit is geen volledig rijoverzicht.");
  if (Array.isArray(metadata.dataTruncationReasons) && metadata.dataTruncationReasons.length) warnings.push("Google meldt een onvolledige gegevensperiode.");
  if (metadata.schemaRestrictionResponse) warnings.push("Google meldt beperkingen in de beschikbare metrics.");
  return { data, warnings, timeZone: metadata.timeZone === undefined ? null : text(metadata.timeZone) };
}

/** Server integration IDs must come from the authorized tenant record, never request query parameters. */
export async function fetchGa4(config: { propertyId: string; period: Period }, deps: ProviderDependencies): Promise<Ga4Data> {
  const valid = /^\d+$/.test(config.propertyId) && validPeriod(config.period);
  const auth = valid ? await accessToken(deps) : { token: null, code: "invalid-config" as const };
  const entries = await Promise.all(Object.entries(reports).map(async ([key, spec]) => {
    const period = key === 'monthly' && valid ? completedMonths((deps.now?.() ?? new Date()).toISOString().slice(0,10)) : config.period;
    if (!auth.token) return [key, result<Ga4Report>("ga4", config.period, deps, null, auth.code)] as const;
    const body = { dateRanges: [period], dimensions: spec.dimensions.map(name => ({ name })), metrics: spec.metrics.map(name => ({ name })), limit: key === "daily" ? 400 : 50, ...(key === "events" ? { dimensionFilter: { filter: { fieldName: "eventName", inListFilter: { values: [...HUB_EVENTS], caseSensitive: true } } } } : {}), ...(['daily','monthly'].includes(key) ? { orderBys: [{ dimension: { dimensionName: spec.dimensions[0] } }] } : { orderBys: [{ metric: { metricName: spec.metrics[0] }, desc: true }] }) };
    const response = await requestJson(`https://analyticsdata.googleapis.com/v1beta/properties/${config.propertyId}:runReport`, auth.token, deps, body);
    if (response.code) return [key, result<Ga4Report>("ga4", period, deps, null, response.code)] as const;
    try {
      const parsed = parseReport(response.json, spec.dimensions, spec.metrics);
      if (key === "events" && parsed.data.rows.some(row => !(HUB_EVENTS as readonly string[]).includes(row.dimensions.eventName))) throw new Error("invalid-response");
      return [key, result("ga4", period, deps, parsed.data.rows.length ? parsed.data : null, parsed.data.rows.length ? undefined : "no-data", parsed.timeZone, parsed.warnings)] as const;
    } catch { return [key, result<Ga4Report>("ga4", period, deps, null, "invalid-response")] as const; }
  }));
  return Object.fromEntries(entries) as Ga4Data;
}
