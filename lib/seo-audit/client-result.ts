import type { AuditReport } from './crawl';

const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const text = (value: unknown): value is string => typeof value === 'string';
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const count = (value: unknown) => number(value) && Number.isInteger(value) && value >= 0;
const score = (value: unknown, maximum: number) => value === null || (number(value) && value >= 0 && value <= maximum);
const list = (value: unknown, valid: (entry: unknown) => boolean): value is unknown[] => Array.isArray(value) && value.every(valid);
const texts = (value: unknown) => list(value, text);
const fields = (value: Record<string, unknown>, names: string[]) => names.every(name => text(value[name]));
const optional = (value: unknown, valid: (entry: unknown) => boolean) => value === undefined || valid(value);
const url = (value: unknown) => {
  if (!text(value)) return false;
  try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
};
const date = (value: unknown) => text(value) && Number.isFinite(Date.parse(value));

function finding(value: unknown): boolean {
  return record(value) && fields(value, ['code', 'title', 'evidence', 'why', 'action']) && url(value.url) &&
    ['hoog', 'middel', 'controle'].some(priority => priority === value.priority);
}
function check(value: unknown): boolean {
  return record(value) && text(value.code) && typeof value.passed === 'boolean' && number(value.weight) && value.weight >= 0 &&
    optional(value.evidence, text) && optional(value.snippet, text);
}
function detailedCheck(value: unknown): boolean {
  return record(value) && fields(value, ['id', 'title', 'category', 'evidence', 'action']) &&
    ['HTML', 'Lighthouse'].some(source => source === value.source) &&
    ['passed', 'failed', 'review', 'not-applicable', 'not-tested'].some(state => state === value.state) &&
    number(value.weight) && value.weight >= 0 && optional(value.snippet, text);
}
function page(value: unknown): boolean {
  return record(value) && url(value.url) && count(value.status) && (value.status as number) >= 100 && (value.status as number) <= 599 &&
    fields(value, ['title', 'description', 'canonical']) && typeof value.indexable === 'boolean' &&
    list(value.links, url) && list(value.findings, finding) &&
    optional(value.checks, entries => list(entries, check)) && optional(value.detailedChecks, entries => list(entries, detailedCheck));
}
function lab(value: unknown): boolean {
  // Missing measurements are valid partial results, including explicit null from older responses.
  if (value === null) return true;
  return record(value) && url(value.requestedUrl) && url(value.finalUrl) && date(value.fetchTime) && text(value.version) &&
    list(value.categories, entry => record(entry) && fields(entry, ['id', 'title']) && score(entry.score, 100)) &&
    list(value.metrics, entry => record(entry) && fields(entry, ['id', 'title', 'displayValue']) && score(entry.score, 1)) &&
    list(value.findings, entry => record(entry) && fields(entry, ['id', 'title', 'what', 'why', 'action']) &&
      ['Lighthouse', 'Jouw antwoorden'].some(source => source === entry.source) && number(entry.priority) &&
      optional(entry.category, text) && optional(entry.evidence, texts)) &&
    texts(value.passed) && texts(value.warnings) &&
    list(value.audits, entry => record(entry) && fields(entry, ['id', 'title', 'mode', 'description', 'displayValue']) &&
      score(entry.score, 1) && texts(entry.evidence));
}
function readableReport(value: unknown): value is AuditReport {
  return record(value) && url(value.origin) && date(value.checkedAt) &&
    list(value.pages, page) && value.pages.length > 0 && list(value.findings, finding) && texts(value.notes) &&
    count(value.discovered) && count(value.skipped) && typeof value.limited === 'boolean' &&
    (value.version === undefined || value.version === 2) && optional(value.lab, lab) &&
    optional(value.labChecks, entries => list(entries, detailedCheck)) && optional(value.labError, text);
}

export function hasUsableAuditEvidence(report: AuditReport): boolean {
  return report.pages.some(page => page.status === 200 &&
    (page.detailedChecks?.some(check => check.source === 'HTML' && ['passed', 'failed'].includes(check.state)) ||
     page.checks?.some(check => check.passed)));
}

export async function readAuditResponse(response: Response): Promise<AuditReport> {
  let data: unknown;
  try { data = await response.json(); }
  catch { throw new Error('De server gaf geen leesbaar rapport terug. Er is geen nieuwe uitkomst beschikbaar. Probeer het later opnieuw.'); }
  if (!response.ok) throw new Error((record(data) && typeof data.error === 'string' && data.error) || (response.status === 429
    ? 'De beschikbare scanlimiet is bereikt. Probeer het na de aangegeven reset opnieuw.'
    : 'De audit is tijdelijk niet beschikbaar. Er is geen nieuwe uitkomst.'));
  // Never put an unchecked nested response into React state: render uses these arrays and URLs directly.
  if (!readableReport(data)) {
    throw new Error('Er is geen compleet leesbaar rapport ontvangen. Er is geen nieuwe uitkomst beschikbaar.');
  }
  return data;
}
