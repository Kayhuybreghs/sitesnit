import test from 'node:test';
import assert from 'node:assert/strict';
import {isTechnicalResult, restoreCheckToolDraft} from '../lib/check-tool-draft.ts';
import {websiteQuestions, priceQuestions} from '../lib/questions.ts';
import {buildWebsiteAdvice} from '../lib/advice.ts';
const answerAll = questions => Object.fromEntries(questions.map(question => [question.id, question.multiple ? [question.options[0].value] : question.options[0].value]));
const draft = (questions, change = {}) => ({stage: 'questions', step: 4, answers: answerAll(questions), url: '', scan: {status: 'idle', result: null, error: ''}, ...change});
const result = {requestedUrl: 'https://example.com/', finalUrl: 'https://example.com/', fetchTime: '2026-09-27T12:00:00Z', version: 'fixture', categories: [{id: 'performance', title: 'Performance', score: 80}], metrics: [], findings: [], passed: [], audits: [], warnings: []};

test('the shared guard rejects malformed live API measurements before advice and keeps valid results', () => {
  for (const invalid of [null, {}, [], {findings:{}}, {...result,findings:{}}, {...result,metrics:[null]}, {...result,categories:[{id:'performance',title:'Performance',score:'80'}]}]) {
    assert.equal(isTechnicalResult(invalid), false);
  }
  const received = JSON.parse(JSON.stringify(result));
  assert.equal(isTechnicalResult(received), true);
  assert.doesNotThrow(() => buildWebsiteAdvice(answerAll(websiteQuestions), received));
  const partial = {...received,categories:[...received.categories,{id:'seo',title:'SEO',score:null}]};
  assert.equal(isTechnicalResult(partial), true, 'unknown category is not turned into zero or rejected when other measurements exist');
});

test('negative fixture reproduces the old NaN question crash, then restores safe state with the same answers', () => {
  const invalid = draft(websiteQuestions, {step: 'not-a-number'});
  assert.throws(() => {
    const question = websiteQuestions[Math.min(14, Math.max(0, invalid.step ?? 0))];
    return invalid.answers[question.id];
  }, TypeError);
  const restored = restoreCheckToolDraft(JSON.stringify(invalid), websiteQuestions);
  assert.equal(restored.step, 0);
  assert.deepEqual(restored.answers, invalid.answers);
  assert.doesNotThrow(() => restored.answers[websiteQuestions[restored.step].id]);
});

test('invalid JSON, roots and answer containers do not reach the renderer', () => {
  for (const raw of ['{', 'null', '[]', 'true', '"text"', '{"answers":null}', '{"answers":[]}', '{"answers":"bad"}']) assert.equal(restoreCheckToolDraft(raw, websiteQuestions), null, raw);
  assert.equal(restoreCheckToolDraft(' '.repeat(2_000_001), websiteQuestions), null);
  const malformed = draft(websiteQuestions, {stage: {toString: null, valueOf: null}, scan: {status: {toString: null, valueOf: null}, result: null, error: ''}});
  const restored = restoreCheckToolDraft(JSON.stringify(malformed), websiteQuestions);
  assert.equal(restored.stage, 'intro');
  assert.equal(restored.scan.status, 'failed');
});

test('good website and price drafts survive exactly, including valid multiple answers and completed scan', () => {
  for (const questions of [websiteQuestions, priceQuestions]) {
    const saved = draft(questions);
    assert.deepEqual(restoreCheckToolDraft(JSON.stringify(saved), questions), saved);
  }
  const saved = draft(websiteQuestions, {stage: 'result', url: 'https://example.com/', scan: {status: 'complete', result, error: ''}});
  assert.deepEqual(restoreCheckToolDraft(JSON.stringify(saved), websiteQuestions), saved);
});

test('invalid answers cannot revive a complete result; valid answers stay and first missing question is selected', () => {
  const saved = draft(websiteQuestions, {stage: 'result'});
  saved.answers[websiteQuestions[3].id] = {invalid: true};
  saved.answers[websiteQuestions[5].id] = 'unknown-option';
  const restored = restoreCheckToolDraft(JSON.stringify(saved), websiteQuestions);
  assert.equal(restored.stage, 'questions');
  assert.equal(restored.step, 3);
  assert.equal(Object.keys(restored.answers).length, 13);
  assert.equal(restored.answers[websiteQuestions[0].id], saved.answers[websiteQuestions[0].id]);
});

test('malformed stored scan data previously crashed advice, but valid answers now survive with a retry state', () => {
  const invalidResult = {...result, findings: {not: 'an array'}};
  assert.throws(() => buildWebsiteAdvice(answerAll(websiteQuestions), invalidResult), TypeError);
  for (const badResult of [invalidResult, {...result, categories: null}, {...result, findings: [{title: null}]}, {...result, categories: [{id: 'performance', title: 'Performance', score: '80'}]}]) {
    const saved = draft(websiteQuestions, {stage: 'result', scan: {status: 'complete', result: badResult, error: ''}});
    const restored = restoreCheckToolDraft(JSON.stringify(saved), websiteQuestions);
    assert.equal(restored.scan.status, 'failed');
    assert.equal(restored.scan.result, null);
    assert.deepEqual(restored.answers, saved.answers);
    assert.doesNotThrow(() => buildWebsiteAdvice(restored.answers, restored.scan.result));
  }
});

test('interrupted scans and stale failed results remain unavailable after reload', () => {
  for (const status of ['running', 'failed']) {
    const restored = restoreCheckToolDraft(JSON.stringify(draft(websiteQuestions, {scan: {status, result, error: 'Fixture'}})), websiteQuestions);
    assert.equal(restored.scan.status, 'failed');
    assert.equal(restored.scan.result, null);
  }
});
