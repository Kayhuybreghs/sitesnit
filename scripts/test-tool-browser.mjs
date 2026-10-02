import {browserType,launchOptions,browserLabel} from './browser-runtime.mjs';
/** Loopback-only UI fixtures. No real contact request, audit, Lighthouse call or analytics event leaves the browser. */
import assert from 'node:assert/strict';
import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {websiteQuestions, priceQuestions} from '../lib/questions.ts';
import {exampleAudit} from '../lib/seo-audit/example.ts';

const base = new URL(process.argv[2] || 'http://127.0.0.1:5189');
if (base.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(base.hostname)) throw Error('Loopback HTTP only.');
const output = resolve((process.env.BROWSER_REPORT_ROOT || 'reports/improvement') + '/tool-flows');
mkdirSync(output, {recursive: true});
const only = process.argv.find(value => value.startsWith('--only='))?.slice(7);
const selectedWidth = process.argv.find(value => value.startsWith('--width='))?.slice(8);
const names = ['websitecheck', 'websitekosten', 'offertevergelijker', 'automatiseringsplan', 'ontwerptool', 'seo-audit'];
if (only && !names.includes(only)) throw Error('Unknown --only tool name.');
if (selectedWidth && !['1440', '390'].includes(selectedWidth)) throw Error('--width must be 1440 or 390.');
const widths = selectedWidth ? [Number(selectedWidth)] : [1440, 390];
const reportName = `browser-regression${only ? '-' + only : ''}${selectedWidth ? '-' + selectedWidth : ''}.json`;
const report = {status: 'not-completed', startedAt: new Date().toISOString(), origin: base.origin, browser: browserLabel, widths, only: only || null, checks: [], errors: [], limitations: ['All scan/contact/event APIs are fixtures. No external scans, mail, database writes or production requests.', 'Selected viewport emulation: desktop 1440×1000 and/or mobile 390×844; no physical phone, Safari or assistive-technology session.']};
report.buildId=readFileSync('.next/BUILD_ID','utf8').trim();
writeFileSync(resolve(output, reportName), JSON.stringify(report, null, 2) + '\n');
const lab = {requestedUrl: 'https://example.com/', finalUrl: 'https://example.com/', fetchTime: '2026-09-27T12:00:00Z', version: 'fixture', categories: ['performance', 'accessibility', 'best-practices', 'seo'].map(id => ({id, title: `Fixture ${id}`, score: 80})), metrics: [{id: 'largest-contentful-paint', title: 'Fixture LCP', displayValue: '2,0 s', score: .8}], findings: [], passed: [], audits: [], warnings: ['Geïsoleerde browserfixture, geen uitgevoerde scan.']};
const audit = {...structuredClone(exampleAudit), version: 2, lab: null, labError: 'Fixture: mobiele labtest niet beschikbaar.', labChecks: [], pages: exampleAudit.pages.map((page, index) => ({...page, detailedChecks: [{id: 'http', title: 'HTTP-respons', category: 'Bereikbaarheid', source: 'HTML', state: index === 2 ? 'failed' : 'passed', weight: 3, evidence: `Fixture HTTP ${page.status}`, action: 'Controleer deze fictieve status.'}]}))};
const browser = await browserType.launch(launchOptions);

async function fixture(width) {
  const context = await browser.newContext({viewport: {width, height: width === 390 ? 844 : 1000}, acceptDownloads: true, reducedMotion: 'reduce'});
  const calls = [], errors = [], blockedExternal = [];
  let auditMode = 'success', labMode = 'success';
  await context.addInitScript(() => localStorage.setItem('sitesnit-cookie-consent-v1', JSON.stringify({version: 1, analytics: false, decidedAt: Date.now(), measurementId: 'G-FIXTURE123'})));
  await context.addInitScript(() => {
    const nativeTimeout = AbortSignal.timeout.bind(AbortSignal);
    AbortSignal.timeout = milliseconds => {
      const signal = nativeTimeout(window.__auditFixtureTimeout ? 150 : milliseconds);
      if (window.__auditFixtureTimeout) signal.addEventListener('abort', () => { window.__auditFixtureAbortReason = signal.reason?.name; });
      return signal;
    };
  });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== base.origin) { blockedExternal.push(url.origin); return route.abort(); }
    if (url.pathname.startsWith('/api/')) {
      calls.push({path: url.pathname, method: request.method()});
      if (url.pathname === '/api/contact') return route.fulfill({status: 503, contentType: 'application/json', body: JSON.stringify({error: 'Browserfixture: verzenden is uitgeschakeld.'})});
      if (url.pathname === '/api/events') return route.fulfill({contentType: 'application/json', body: JSON.stringify({ok: true})});
      if (url.pathname === '/api/lighthouse') return route.fulfill({status: labMode === 'failed' ? 503 : 200, contentType: 'application/json', body: JSON.stringify(labMode === 'success' ? {result: lab} : labMode === 'malformed-json' ? {result:{...lab,findings:{}}} : {error: 'Fixture: technische scan tijdelijk niet beschikbaar.'})});
      if (url.pathname === '/api/seo-audit') {
        // Keep this intercepted request pending until the real client AbortSignal expires.
        if (auditMode === 'timeout') return;
        if (auditMode === 'network') return route.abort('connectionreset');
        if (auditMode === 'non-json') return route.fulfill({status: 502, contentType: 'text/html', body: '<h1>Fixture gateway unavailable</h1>'});
        if (auditMode === 'malformed-json') return route.fulfill({contentType: 'application/json', body: JSON.stringify({...audit,pages:[null]})});
        if (auditMode === 'robots' || auditMode === 'unreachable') return route.fulfill({status: 422, contentType: 'application/json', body: JSON.stringify({error: auditMode === 'robots' ? 'Fixture: Robots.txt staat deze crawl niet toe. Er zijn geen pagina’s onderzocht.' : 'Fixture: het doel antwoordt niet. Er zijn geen pagina’s onderzocht.'})});
        if (auditMode === '403' || auditMode === '429') return route.fulfill({status: Number(auditMode), contentType: 'application/json', body: JSON.stringify({error: auditMode === '403' ? 'Fixture: website blokkeert de audit.' : 'Fixture: dagelijkse scanlimiet bereikt.'})});
        if (auditMode === 'partial') return route.fulfill({contentType: 'application/json', body: JSON.stringify({...audit,limited:true,skipped:2,notes:[...audit.notes,'Fixture: twee pagina’s niet onderzocht door crawlregels.']})});
        if (auditMode === 'complete') return route.fulfill({contentType: 'application/json', body: JSON.stringify({...audit,lab})});
        return route.fulfill({contentType: 'application/json', body: JSON.stringify(audit)});
      }
      return route.abort();
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultTimeout(25000);
  page.on('pageerror', error => errors.push(error.message));
  return {context, page, calls, errors, blockedExternal, auditMode: value => {auditMode = value;}, labMode: value => {labMode = value;}};
}

async function open(page, route) {
  await page.goto(base.origin + route, {waitUntil: 'networkidle', timeout: 90000});
  assert.equal(await page.locator('[data-nextjs-dialog]').count(), 0);
  const deny = page.getByRole('button', {name: 'Alleen noodzakelijk', exact: true});
  if (await deny.isVisible()) await deny.click();
}
async function screenshot(page, name, width) {
  await page.screenshot({path: resolve(output, `${name}-${width}.png`), fullPage: true});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${name}: horizontal overflow`);
}
async function download(page, name, width, expected) {
  const pending = page.waitForEvent('download');
  await page.getByRole('button', {name: 'Bewaar je overzicht'}).click();
  const file = await pending, filename = resolve(output, `${name}-${width}-${file.suggestedFilename()}`);
  await file.saveAs(filename);
  const text = readFileSync(filename, 'utf8');
  assert.match(text, expected);
  assert.ok(text.length > 100);
  return filename;
}
async function run(name, width, fn) {
  const f = await fixture(width), start = Date.now();
  try {
    const details = await fn(f);
    assert.deepEqual(f.errors, [], 'unhandled browser exception');
    assert.equal(f.calls.filter(call => call.path === '/api/contact').length, 0, 'No inquiry should be submitted in tool-only flows.');
    report.checks.push({name, width, status: 'passed', durationMs: Date.now() - start, ...details, apiCalls: f.calls, blockedExternalOrigins: [...new Set(f.blockedExternal)]});
    console.log(`PASS ${name} ${width}`);
  } catch (error) {
    await f.page.screenshot({path: resolve(output, `${name}-${width}-failure.png`), fullPage: true}).catch(() => {});
    writeFileSync(resolve(output, `${name}-${width}-failure.txt`), await f.page.locator('body').innerText().catch(() => 'No page text'));
    report.checks.push({name, width, status: 'failed', durationMs: Date.now() - start, error: error.stack, apiCalls: f.calls, browserErrors: f.errors});
    console.error(`FAIL ${name} ${width}: ${error.message}`);
  } finally {
    await f.context.close();
    writeFileSync(resolve(output, reportName), JSON.stringify(report, null, 2) + '\n');
  }
}

async function questionnaire(f, width, kind) {
  const {page} = f, web = kind === 'websitecheck', questions = web ? websiteQuestions : priceQuestions;
  const route = web ? '/tools/website-check' : '/tools/website-kosten-berekenen';
  await open(page, route);
  const key = `sitesnit-${kind}-v3`;
  const seed = async raw => {
    await page.evaluate(({key, raw}) => sessionStorage.setItem(key, raw), {key, raw});
    await page.reload({waitUntil: 'networkidle'});
  };
  for (const raw of ['{', '[]', '{"answers":null}']) {
    await seed(raw);
    await page.getByRole('button', {name: web ? 'Start je websitecheck' : 'Start je prijscheck'}).waitFor();
  }
  await seed(JSON.stringify({stage: 'questions', step: 'not-a-number', answers: {[questions[0].id]: questions[0].options[0].value}, url: ''}));
  await page.getByText('Vraag 1 van 15', {exact: true}).waitFor();
  assert.equal(await page.locator(`.answer-options input[value="${questions[0].options[0].value}"]`).isChecked(), true);
  await seed(JSON.stringify({stage: 'result', step: 14, answers: Object.fromEntries(questions.map(question => [question.id, question.multiple ? [question.options[0].value] : question.options[0].value])), url: 'https://example.com/', scan: {status: 'complete', result: {findings: {}, categories: null}, error: ''}}));
  await page.locator('.result-heading').waitFor();
  if (web) await page.locator('.scan-status.failed').waitFor();
  await screenshot(page, `${kind}-corrupt-recovery`, width);
  await page.evaluate(key => sessionStorage.removeItem(key), key);
  await page.reload({waitUntil: 'networkidle'});
  await page.getByRole('button', {name: web ? 'Start je websitecheck' : 'Start je prijscheck'}).click();
  await page.getByRole('button', {name: 'Volgende', exact: true}).click();
  await page.getByRole('alert').filter({hasText: 'Kies een antwoord'}).waitFor();
  const choices = questions.map(question => question.options[0].value);
  for (let index = 0; index < 15; index++) {
    await page.getByText(`Vraag ${index + 1} van 15`, {exact: true}).waitFor();
    await page.locator(`.answer-options input[value="${choices[index]}"]`).check();
    if (index === 1) {
      await page.getByRole('button', {name: '← Vorige', exact: true}).click();
      assert.equal(await page.locator(`.answer-options input[value="${choices[0]}"]`).isChecked(), true);
      choices[0] = questions[0].options[1].value;
      await page.locator(`.answer-options input[value="${choices[0]}"]`).check();
      await page.getByRole('button', {name: 'Volgende', exact: true}).click();
      assert.equal(await page.locator(`.answer-options input[value="${choices[1]}"]`).isChecked(), true);
    }
    await page.getByRole('button', {name: index === 14 ? web ? 'Naar de technische scan' : 'Bekijk je resultaat' : 'Volgende', exact: true}).click();
    if (index === 4) {
      await page.getByText('Vraag 6 van 15', {exact: true}).waitFor();
      await page.reload({waitUntil: 'networkidle'});
      await page.getByText('Vraag 6 van 15', {exact: true}).waitFor();
    }
  }
  if (web) {
    assert.equal(f.calls.filter(call => call.path === '/api/lighthouse').length, 0);
    await page.locator('#scan-url').fill('http://127.0.0.1');
    await page.getByRole('button', {name: 'Meet mijn website'}).click();
    await page.locator('main [role="alert"]').waitFor();
    assert.equal(f.calls.filter(call => call.path === '/api/lighthouse').length, 0);
    f.labMode('failed');
    await page.locator('#scan-url').fill('https://example.com');
    await page.getByRole('button', {name: 'Meet mijn website'}).click();
    await page.locator('.scan-status.failed').waitFor();
    await page.reload({waitUntil: 'networkidle'});
    await page.locator('.scan-status.failed').waitFor();
    f.labMode('malformed-json');
    await page.getByRole('button', {name: 'Probeer de technische scan opnieuw'}).click();
    await page.locator('.scan-status.failed').filter({hasText: 'geen complete technische meting'}).waitFor();
    assert.equal(await page.locator('.category-scores .score').count(), 0);
    await screenshot(page, 'websitecheck-malformed-api', width);
    f.labMode('success');
    await page.getByRole('button', {name: 'Probeer de technische scan opnieuw'}).click();
    await page.locator('.scan-status.complete').waitFor();
    assert.equal(await page.locator('.category-scores .score').count(), 4);
  }
  await page.locator('.result-heading').waitFor();
  await page.getByLabel('Je naam', {exact: true}).fill('SYNTHETISCHE toolinvoer');
  await page.locator('#antwoorden summary').click();
  await page.getByRole('button', {name: 'Wijzig antwoord 1', exact: true}).click();
  await page.locator(`.answer-options input[value="${questions[0].options[0].value}"]`).check();
  await page.getByRole('button', {name: 'Werk resultaat bij', exact: true}).click();
  await page.locator('.result-heading').waitFor();
  assert.equal(await page.getByLabel('Je naam', {exact: true}).inputValue(), 'SYNTHETISCHE toolinvoer');
  const state = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key)), `sitesnit-${kind}-v3`);
  assert.equal(Object.keys(state.answers).length, 15);
  await screenshot(page, kind, width);
  const exported = web ? null : await download(page, kind, width, /WEBSITEPLAN/);
  await page.reload({waitUntil: 'networkidle'});
  await page.locator('.result-heading').waitFor();
  return {route, answers: Object.keys(state.answers).length, exported, cases: ['corrupt JSON and root/answer shape', 'invalid saved step recovers valid answers', 'malformed stored scan unavailable without crash', 'native empty choice', '15 answers', 'back and change', 'mid-flow reload', 'result edit preserves form', 'result reload', ...(web ? ['private URL rejected before API', '503/reload/retry fixture', 'malformed HTTP-200 measurement rejected without score', 'four lab categories'] : ['text export'])]};
}

async function offers({page}, width) {
  await open(page, '/tools/website-offerte-vergelijken');
  await page.locator('#offer-name').fill('Eigen fictief voorstel');
  await page.locator('#offer-once').fill('1234,50');
  await page.getByRole('button', {name: 'Vul een voorbeeld in'}).click();
  await page.getByRole('dialog').waitFor();
  await page.getByRole('button', {name: 'Annuleren, invoer behouden'}).click();
  assert.equal(await page.locator('#offer-name').inputValue(), 'Eigen fictief voorstel');
  assert.equal(await page.locator('#offer-once').inputValue(), '1234,50');
  await page.getByRole('button', {name: 'Vul een voorbeeld in'}).click();
  await page.getByRole('button', {name: 'Ja, vervangen'}).click();
  assert.equal(await page.locator('#offer-name').inputValue(), 'Voorbeeld A');
  await page.reload({waitUntil: 'networkidle'});
  await page.getByRole('button', {name: 'Vorige voorstellen terugzetten'}).click();
  await page.getByRole('button', {name: 'Ja, vervangen'}).click();
  assert.equal(await page.locator('#offer-name').inputValue(), 'Eigen fictief voorstel');
  assert.equal(await page.locator('#offer-once').inputValue(), '1234,50');
  assert.match(await page.locator('.offer-result-card').first().innerText(), /Bekend subtotaal/);
  await page.locator('#offer-once').fill('-1');
  await page.locator('main [role="alert"]').waitFor();
  await page.locator('#offer-once').fill('1234,50');
  const exported = await download(page, 'offers', width, /Eigen fictief voorstel/);
  await screenshot(page, 'offers', width);
  await page.getByRole('button', {name: 'Vul een voorbeeld in'}).click();
  await page.getByRole('button', {name: 'Ja, vervangen'}).click();
  await page.getByRole('button', {name: 'Begin met lege voorstellen'}).click();
  await page.getByRole('button', {name: 'Annuleren, invoer behouden'}).click();
  assert.equal(await page.locator('#offer-name').inputValue(), 'Voorbeeld A');
  await page.getByRole('button', {name: 'Begin met lege voorstellen'}).click();
  await page.getByRole('button', {name: 'Ja, vervangen'}).click();
  assert.equal(await page.locator('#offer-name').inputValue(), 'Voorstel A');
  assert.equal(await page.locator('#offer-once').inputValue(), '');
  await page.reload({waitUntil: 'networkidle'});
  assert.equal(await page.locator('#offer-name').inputValue(), 'Voorstel A');
  assert.equal(await page.locator('#offer-once').inputValue(), '');
  await page.getByRole('button', {name: 'Vorige voorstellen terugzetten'}).click();
  assert.equal(await page.locator('#offer-name').inputValue(), 'Voorbeeld A');
  await screenshot(page, 'offers-reset-and-undo', width);
  return {exported, cases: ['dirty example cancel', 'confirm replacement', 'reload and undo', 'unknown remains subtotal', 'negative amount error', 'actual text export', 'reset cancellation preserves example', 'confirmed reset persists after reload', 'undo reset restores example']};
}

async function automation({page}, width) {
  await open(page, '/tools/automatiseringsplan');
  await page.locator('#auto-source').fill('Fictieve mailbox');
  await page.locator('#auto-destination').fill('Fictief CRM');
  await page.getByRole('button', {name: 'Maak mijn procesplan'}).click();
  assert.equal(await page.locator('.time-result strong').innerText(), 'Nog niet berekend');
  await page.locator('#auto-count').fill('0');
  await page.locator('#auto-minutes').fill('5');
  assert.equal(await page.locator('.time-result strong').innerText(), '0 minuten per maand');
  await page.locator('#auto-count').fill('-1');
  await page.getByRole('button', {name: 'Maak mijn procesplan'}).click();
  assert.equal(await page.getByRole('button', {name: 'Bewaar je overzicht'}).count(), 0);
  await page.locator('#auto-count').fill('0');
  await page.reload({waitUntil: 'networkidle'});
  assert.equal(await page.locator('#auto-count').inputValue(), '0');
  assert.equal(await page.locator('#auto-source').inputValue(), 'Fictieve mailbox');
  await page.getByRole('button', {name: 'Maak mijn procesplan'}).click();
  const exported = await download(page, 'automation', width, /0 minuten per maand/);
  await screenshot(page, 'automation', width);
  return {exported, cases: ['unknown is not zero', 'real zero shown as zero', 'invalid numbers block export', 'reload preserves input', 'export']};
}

async function designer({page}, width) {
  await open(page, '/tools/website-ontwerp-tool');
  await page.locator('#design-name').fill('Fictieve Studio');
  await page.locator('#design-activity').fill('Fictief tuinontwerp');
  await page.locator('#design-audience').fill('Fictieve klanten');
  await page.getByRole('button', {name: 'Volgende', exact: true}).click();
  await page.locator('#design-services').fill('Ontwerp\nAdvies');
  await page.getByRole('button', {name: '← Vorige', exact: true}).click();
  assert.equal(await page.locator('#design-activity').inputValue(), 'Fictief tuinontwerp');
  await page.getByRole('button', {name: 'Volgende', exact: true}).click();
  assert.equal(await page.locator('#design-services').inputValue(), 'Ontwerp\nAdvies');
  for (let index = 1; index < 5; index++) await page.getByRole('button', {name: 'Volgende', exact: true}).click();
  await page.locator('input[name="design-pages"][value="five"]').check();
  await page.getByRole('button', {name: 'Bekijk mijn voorbeeld'}).click();
  await page.locator('#jouw-ontwerp').waitFor();
  await page.getByRole('navigation', {name: 'Navigatie binnen je ontwerpvoorbeeld'}).getByRole('button', {name: 'Contact', exact: true}).click();
  await page.locator('#ds-contact').waitFor();
  await page.getByRole('button', {name: 'Vorige voorbeeldpagina'}).click();
  await page.locator('#ds-home').waitFor();
  await page.locator('.designer-copy-editor summary').click();
  await page.locator('#design-headline').fill('Mijn fictieve opening');
  await page.locator('#design-intro').fill('Deze voorbeeldtekst is alleen browserfixture.');
  await page.locator('#design-cta').fill('Bespreek dit voorbeeld');
  await page.locator('#result-style').selectOption('editorial');
  await page.getByRole('button', {name: 'Mobiel', exact: true}).click();
  assert.equal(await page.locator('#design-headline').inputValue(), 'Mijn fictieve opening');
  await page.reload({waitUntil: 'networkidle'});
  await page.getByRole('button', {name: '← Keuzes aanpassen', exact: true}).click();
  assert.equal(await page.locator('#design-name').inputValue(), 'Fictieve Studio');
  for (let index = 0; index < 5; index++) await page.getByRole('button', {name: 'Volgende', exact: true}).click();
  await page.getByRole('button', {name: 'Bekijk mijn voorbeeld'}).click();
  await page.locator('.designer-copy-editor summary').click();
  assert.equal(await page.locator('#design-headline').inputValue(), 'Mijn fictieve opening');
  await page.locator('.designer-brief summary').click();
  const exported = await download(page, 'designer', width, /Mijn fictieve opening/);
  await screenshot(page, 'designer', width);
  return {exported, cases: ['six steps', 'back preserves fields', 'preview navigation and back', 'style and device preserve custom copy', 'reload and edit choices preserve result', 'export']};
}

async function auditFlow(f, width) {
  const {page} = f;
  await open(page, '/tools/seo-audit');
  await page.locator('#audit-url').fill('https://example.com');
  const start = () => page.getByRole('button', {name: 'Start SEO-audit'}).click();
  const success = async () => { f.auditMode('success'); await start(); await page.locator('.audit-result').waitFor(); await page.locator('.audit-score-ring').waitFor(); };
  await success();
  assert.match(await page.locator('.audit-score-ring strong').innerText(), /—/);
  assert.match(await page.locator('.audit-result-status').innerText(), /mobiele meting ontbreekt/);
  await page.getByRole('button', {name: 'Handmatig beoordelen', exact: true}).click();
  assert.equal(await page.locator('.audit-findings > article').count(), 1);
  await page.getByRole('button', {name: 'Prioriteit middel', exact: true}).click();
  assert.equal(await page.locator('.audit-findings > article').count(), 0);
  await page.getByRole('button', {name: 'Alle bevindingen', exact: true}).click();
  await page.locator('#audit-page-search').fill('diensten');
  assert.equal(await page.locator('.audit-proof-pages > details').count(), 1);
  await screenshot(page, 'audit-success', width);
  f.auditMode('complete'); await start();
  await page.locator('.audit-result-status').filter({hasText: 'Je technische rapport staat klaar.'}).waitFor();
  assert.match(await page.locator('.audit-score-ring strong').innerText(), /77/);
  await screenshot(page, 'audit-complete-lab', width);
  f.auditMode('partial'); await start();
  await page.locator('.audit-result').filter({hasText: 'Gedeeltelijke crawl'}).waitFor();
  await page.locator('#audit-page-search').fill('');
  assert.equal(await page.locator('.audit-result .audit-proof-pages > details').count(), 3);
  assert.match(await page.locator('.audit-score-ring strong').innerText(), /—/);
  await screenshot(page, 'audit-partial', width);
  const expectedErrors = {robots:/Robots\.txt/,unreachable:/doel antwoordt niet/,timeout:/scan duurde te lang/, 'malformed-json':/geen compleet leesbaar rapport/};
  for (const mode of ['403', '429', 'robots', 'unreachable', 'non-json', 'malformed-json', 'network', 'timeout']) {
    if (mode === 'timeout') await page.evaluate(() => {window.__auditFixtureTimeout = true; window.__auditFixtureAbortReason = null;});
    f.auditMode(mode); await start();
    await page.locator('.audit-error').waitFor();
    assert.equal(await page.locator('.audit-result').count(), 0, `${mode}: old report must be removed`);
    const error = await page.locator('.audit-error').innerText();
    assert.doesNotMatch(error, /Unexpected token|<h1>|SyntaxError/);
    if (expectedErrors[mode]) assert.match(error, expectedErrors[mode]);
    if (mode === 'timeout') {
      assert.equal(await page.evaluate(() => window.__auditFixtureAbortReason), 'TimeoutError', 'the real fetch AbortSignal fired');
      await page.evaluate(() => {window.__auditFixtureTimeout = false;});
    }
    await screenshot(page, `audit-${mode}`, width);
    await success();
  }
  return {cases: ['usable HTML report', 'missing lab remains unknown, not zero', 'complete lab score', 'partial crawl preserves evidence and unknown lab', 'priority filters', 'page search', '403', '429', 'robots denial', 'unreachable goal', 'non-JSON', 'malformed HTTP-200 JSON', 'network disconnect', 'actual AbortSignal timeout with shortened fixture deadline', 'old report removed on error', 'recovery']};
}

try {
  for (const width of widths) {
    if (!only || only === 'websitecheck') await run('websitecheck', width, f => questionnaire(f, width, 'websitecheck'));
    if (!only || only === 'websitekosten') await run('websitekosten', width, f => questionnaire(f, width, 'prijscheck'));
    if (!only || only === 'offertevergelijker') await run('offertevergelijker', width, f => offers(f, width));
    if (!only || only === 'automatiseringsplan') await run('automatiseringsplan', width, f => automation(f, width));
    if (!only || only === 'ontwerptool') await run('ontwerptool', width, f => designer(f, width));
    if (!only || only === 'seo-audit') await run('seo-audit', width, f => auditFlow(f, width));
  }
} finally {
  report.completedAt = new Date().toISOString();
  report.expectedChecks = widths.length * (only ? 1 : names.length);
  report.status = report.checks.some(check => check.status === 'failed') ? 'failed' : report.checks.length === report.expectedChecks ? 'passed' : 'not-completed';
  writeFileSync(resolve(output, reportName), JSON.stringify(report, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify({status: report.status, checks: report.checks.length, passed: report.checks.filter(check => check.status === 'passed').length, report: resolve(output, reportName)}));
if (report.status !== 'passed') process.exitCode = 1;
