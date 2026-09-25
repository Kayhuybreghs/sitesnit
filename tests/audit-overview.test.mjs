import test from 'node:test';
import assert from 'node:assert/strict';
import {analyze} from '../lib/seo-audit/analyze.ts';
import {auditOverview} from '../lib/seo-audit/overview.ts';
import {exampleAudit} from '../lib/seo-audit/example.ts';
const response=(body,status=200,type='text/html')=>({url:'https://example.com/',status,body,headers:{'content-type':type}});
const overview=pages=>auditOverview({...exampleAudit,pages,findings:pages.flatMap(p=>p.findings)});
test('score is based on tested weighted checks and manual suggestions do not lower it',()=>{
 const page=analyze(response('<title>Test</title><link rel="canonical" href="https://example.com/other">'));
 assert.equal(overview([page]).score,100);
 assert(page.findings.some(f=>f.code==='canonical-other'));
 assert(page.findings.some(f=>f.code==='description'));
});
test('errors lower score once per tested check; unknown and redirects have no invented passes',()=>{
 const good=analyze(response('<title>Test</title>'));
 const missing=analyze(response('',404));
 assert.equal(overview([good,missing]).score,80);
 assert.equal(overview([missing]).score,0);
 assert.equal(overview([analyze(response('',301))]).score,null);
 assert.equal(overview([analyze(response('',200,'application/pdf'))]).score,null);
 assert.equal(overview([]).score,null);
});
test('example reproduces calculation and category counts deduplicate URLs',()=>{
 const result=auditOverview(exampleAudit);
 assert.equal(result.score,78);
 assert.equal(result.checks,13);
 assert.equal(result.passed,11);
 const copy={...exampleAudit,findings:[...exampleAudit.findings,...exampleAudit.findings]};
 assert.deepEqual(auditOverview(copy).categories,result.categories);
});
