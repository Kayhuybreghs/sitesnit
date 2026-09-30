import test from 'node:test';
import assert from 'node:assert/strict';
import { uniqueAuditFindings } from '../lib/seo-audit/findings.ts';
import { hasUsableAuditEvidence, readAuditResponse } from '../lib/seo-audit/client-result.ts';
import { auditCapabilities, auditScope } from '../lib/seo-audit/capabilities.ts';
import { exampleAudit } from '../lib/seo-audit/example.ts';
import { auditOverview } from '../lib/seo-audit/overview.ts';
import { lighthouseChecks } from '../lib/seo-audit/detailed.ts';

const reportV2 = () => ({...structuredClone(exampleAudit), version: 2,
  pages: exampleAudit.pages.map(page => ({...structuredClone(page), detailedChecks: [{id:'http',title:'HTTP-respons',category:'Bereikbaarheid',source:'HTML',state:page.status===200?'passed':'failed',weight:3,evidence:`HTTP ${page.status}`,action:'Controleer de bereikbaarheid.'}]})),
  labChecks: lighthouseChecks(), labError: 'Mobiele meting is niet beschikbaar.',
});
const lab = () => ({requestedUrl:'https://example.com/',finalUrl:'https://example.com/',fetchTime:'2026-09-27T12:00:00Z',version:'fixture',
  categories:['performance','accessibility','best-practices','seo'].map(id=>({id,title:id,score:80})),
  metrics:[{id:'largest-contentful-paint',title:'LCP',displayValue:'2 seconden',score:.9}],
  findings:[{id:'fixture',title:'Aandachtspunt',what:'Bewijs',why:'Reden',action:'Advies',source:'Lighthouse',priority:8,evidence:['Ontvangen bewijs']}],
  passed:['Een geslaagde controle'],warnings:[],audits:[{id:'largest-contentful-paint',title:'LCP',score:.9,mode:'numeric',description:'Uitleg',displayValue:'2 seconden',evidence:[]}],
});

const finding = (code, url='https://example.com/') => ({code,url,title:code,priority:'middel',evidence:'HTML',why:'Test',action:'Test'});
test('same canonical or metadata evidence is counted once; other pages and checks remain', () => {
  const values = [finding('canonical-multiple'),finding('canonical-count'),finding('duplicate-title'),finding('title-unique'),finding('duplicate-description'),finding('description-unique'),finding('title-unique','https://example.com/b'),finding('link-broken')];
  const result = uniqueAuditFindings(values);
  assert.deepEqual(result.map(f=>f.code),['canonical-multiple','duplicate-title','duplicate-description','title-unique','link-broken']);
  assert.equal(result[0],values[0]);
});
test('a blocked or untested response is not a completed tool measurement', () => {
  assert.equal(hasUsableAuditEvidence({pages:[{status:403,checks:[],detailedChecks:[]}]}),false);
  assert.equal(hasUsableAuditEvidence({pages:[{status:200,checks:[],detailedChecks:[{source:'HTML',state:'not-tested'}]}]}),false);
  assert.equal(hasUsableAuditEvidence({pages:[{status:200,checks:[],detailedChecks:[{source:'HTML',state:'failed'}]}]}),true);
});
test('non-JSON, null errors, 429 and empty reports cannot replace a result with a fake success', async () => {
  await assert.rejects(readAuditResponse(new Response('<html>gateway</html>',{status:502})),/geen leesbaar rapport/);
  await assert.rejects(readAuditResponse(Response.json(null,{status:429})),/scanlimiet/);
  await assert.rejects(readAuditResponse(Response.json({error:'Robotsregels blokkeren deze scan.'},{status:422})),/Robotsregels/);
  await assert.rejects(readAuditResponse(Response.json({pages:[],findings:[],notes:[]})),/geen compleet leesbaar rapport/);
  assert.deepEqual(await readAuditResponse(Response.json(exampleAudit)),exampleAudit);
});

test('real v1 and v2 reports retain complete, partial, blocked and unknown measurement results', async () => {
  const full = {...reportV2(), lab:lab()};
  const partial = structuredClone(full);
  partial.limited = true;
  partial.skipped = 2;
  partial.lab.categories[0].score = null;
  const blocked = reportV2();
  blocked.pages = [blocked.pages[2]];
  for (const report of [exampleAudit, reportV2(), {...reportV2(),lab:null}, full, partial, blocked]) {
    const result = await readAuditResponse(Response.json(report));
    assert.deepEqual(result, JSON.parse(JSON.stringify(report)), 'all JSON response fields survive validation unchanged');
    assert.doesNotThrow(() => auditOverview(result));
  }
  assert.equal(auditOverview(await readAuditResponse(Response.json(full))).score, 77);
  assert.equal(auditOverview(await readAuditResponse(Response.json(partial))).score, null);
  assert.equal(hasUsableAuditEvidence(await readAuditResponse(Response.json(blocked))), false);
});

test('malformed nested JSON cannot enter report state or reach render and scoring consumers', async () => {
  const mutations = [
    report => {report.pages=[null];},
    report => {report.pages=[{status:200}];},
    report => {report.pages[0].url='not a URL';},
    report => {report.pages[0].title={};},
    report => {report.pages[0].checks={};},
    report => {report.pages[0].checks=[null];},
    report => {report.pages[0].checks[0].weight='3';},
    report => {report.pages[0].checks[0].passed='yes';},
    report => {report.pages[0].checks[0].snippet={};},
    report => {report.pages[0].detailedChecks={};},
    report => {report.pages[0].detailedChecks=[null];},
    report => {report.pages[0].detailedChecks[0].state='unknown';},
    report => {report.pages[0].detailedChecks[0].evidence={};},
    report => {report.findings=[null];},
    report => {report.findings[0].priority={};},
    report => {report.findings[0].evidence={};},
    report => {report.notes=[{}];},
    report => {report.origin={};},
    report => {report.checkedAt='not a date';},
    report => {report.discovered='3';},
    report => {report.skipped=-1;},
    report => {report.limited='false';},
    report => {report.version=99;},
    report => {report.lab={};},
    report => {report.lab.categories={};},
    report => {report.lab.categories=[null];},
    report => {report.lab.categories[0].score='80';},
    report => {report.lab.categories[0].score=101;},
    report => {report.lab.metrics[0].displayValue={};},
    report => {report.lab.findings[0].evidence={};},
    report => {report.lab.audits[0].score=2;},
    report => {report.lab.audits[0].evidence=[null];},
    report => {report.labChecks={};},
    report => {report.labChecks=[null];},
    report => {report.labError={};},
  ];
  for (const mutate of mutations) {
    const report = {...reportV2(),lab:lab()};
    mutate(report);
    await assert.rejects(readAuditResponse(Response.json(report)), /geen compleet leesbaar rapport/, mutate.toString());
  }
});
test('public scope describes the actual shared page and time budgets',()=>{
  assert(auditScope.includes(`${auditCapabilities.maxPages} pagina’s`));
  assert(auditScope.includes(`${auditCapabilities.crawlBudgetMs/1000} seconden`));
  assert(auditCapabilities.clientTimeoutMs >= auditCapabilities.requestBudgetMs + auditCapabilities.labTimeoutMs);
});
