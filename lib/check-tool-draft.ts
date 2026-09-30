import type {Answers, Question} from './questions';
import type {TechnicalResult} from './lighthouse';

export type CheckToolScan = {
  status: 'idle' | 'running' | 'complete' | 'failed';
  result: TechnicalResult | null;
  error: string;
};
export type CheckToolDraft = {
  stage: 'intro' | 'questions' | 'url' | 'result';
  step: number;
  answers: Answers;
  url: string;
  scan: CheckToolScan;
};
const record = (value: unknown): value is Record<string, unknown> => Boolean(value && typeof value === 'object' && !Array.isArray(value));
const text = (value: unknown): value is string => typeof value === 'string' && value.length <= 10000;
const texts = (value: unknown): value is string[] => Array.isArray(value) && value.length <= 3000 && value.every(text);
const score = (value: unknown, maximum = 1) => value === null || (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= maximum);
const list = (value: unknown, valid: (entry: Record<string, unknown>) => boolean) => Array.isArray(value) && value.length <= 3000 && value.every(entry => record(entry) && valid(entry));
const keys = (value: Record<string, unknown>, names: string[]) => names.every(name => text(value[name]));

export function isTechnicalResult(value: unknown): value is TechnicalResult {
  return record(value) && keys(value, ['requestedUrl', 'finalUrl', 'fetchTime', 'version']) &&
    list(value.categories, entry => keys(entry, ['id', 'title']) && score(entry.score, 100)) &&
    (value.categories as Record<string, unknown>[]).some(entry => typeof entry.score === 'number') &&
    list(value.metrics, entry => keys(entry, ['id', 'title', 'displayValue']) && score(entry.score)) &&
    list(value.findings, entry => keys(entry, ['id', 'title', 'what', 'why', 'action']) &&
      (entry.source === 'Lighthouse' || entry.source === 'Jouw antwoorden') && typeof entry.priority === 'number' && Number.isFinite(entry.priority) &&
      (entry.category === undefined || text(entry.category)) && (entry.evidence === undefined || texts(entry.evidence))) &&
    texts(value.passed) && texts(value.warnings) &&
    list(value.audits, entry => keys(entry, ['id', 'title', 'mode', 'description', 'displayValue']) && score(entry.score) && texts(entry.evidence));
}

function restoreScan(value: unknown): CheckToolScan {
  if (!value) return {status: 'idle', result: null, error: ''};
  const failed = (error: string): CheckToolScan => ({status: 'failed', result: null, error});
  if (!record(value) || typeof value.status !== 'string' || !['idle', 'running', 'complete', 'failed'].includes(value.status) || !text(value.error)) {
    return failed('De opgeslagen meting kon niet worden hersteld. Je antwoorden zijn bewaard; probeer de technische analyse opnieuw.');
  }
  if (value.status === 'running') return failed('De vorige scan is onderbroken. Je antwoorden zijn bewaard; probeer de technische analyse opnieuw.');
  if (value.status === 'complete') return isTechnicalResult(value.result)
    ? {status: 'complete', result: value.result, error: ''}
    : failed('De opgeslagen meting is onvolledig. Je antwoorden zijn bewaard; probeer de technische analyse opnieuw.');
  // Failed/idle states must not revive a stale result from a previous attempt.
  return {status: value.status as 'idle' | 'failed', result: null, error: value.error};
}

/** Session storage is editable/untrusted: preserve valid answers without rendering malformed saved state. */
export function restoreCheckToolDraft(raw: string | null, questions: readonly Question[]): CheckToolDraft | null {
  if (!raw || raw.length > 2_000_000 || !questions.length) return null;
  let value: unknown;
  try { value = JSON.parse(raw); } catch { return null; }
  if (!record(value) || !record(value.answers)) return null;
  const answers: Answers = {};
  for (const question of questions) {
    const answer = value.answers[question.id];
    const allowed = new Set(question.options.map(option => option.value));
    if (question.multiple) {
      if (Array.isArray(answer) && answer.length > 0 && answer.every(item => typeof item === 'string' && allowed.has(item))) answers[question.id] = [...new Set(answer)];
    } else if (typeof answer === 'string' && allowed.has(answer)) answers[question.id] = answer;
  }
  let stage: CheckToolDraft['stage'] = typeof value.stage === 'string' && ['intro', 'questions', 'url', 'result'].includes(value.stage) ? value.stage as CheckToolDraft['stage'] : 'intro';
  let step = typeof value.step === 'number' && Number.isInteger(value.step) ? Math.min(questions.length - 1, Math.max(0, value.step)) : 0;
  const missing = questions.findIndex(question => !Object.hasOwn(answers, question.id));
  if (['url', 'result'].includes(stage) && missing !== -1) { stage = 'questions'; step = missing; }
  return {stage, step, answers, url: typeof value.url === 'string' && value.url.length <= 2000 ? value.url : '', scan: restoreScan(value.scan)};
}
