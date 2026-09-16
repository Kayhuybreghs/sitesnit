import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
const origin='http://127.0.0.1:5184';
const post = body => fetch(origin+'/api/lighthouse',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body),signal:AbortSignal.timeout(120000)});
const checks=[];
for(const body of [null,[],{url:['https://example.com']},{url:'http://printer.local./'},{url:'http://127.0.0.1/'}]) {
  const response=await post(body); const result=await response.json();
  assert.equal(response.status,400); assert.ok(result.error && !result.result);
  assert.ok(!result.error.includes('TypeError'));
  checks.push({input:body,status:response.status,error:result.error});
}
const response=await post({url:'https://webfluencer.nl/'}); const data=await response.json();
const report={measuredAt:new Date().toISOString(),invalidRequests:checks,liveStatus:response.status};
if(response.ok) {
  await build({entryPoints:['lib/advice.ts'],bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/advice-verify.mjs'});
  const {buildWebsiteAdvice}=await import(pathToFileURL(path.resolve('.sites-runtime/advice-verify.mjs')));
  const advice=buildWebsiteAdvice({},data.result);
  for(const finding of advice.priorities.filter(f=>f.source==='Lighthouse'))
    assert.ok(data.result.audits.some(a=>a.id===finding.id && a.score!==null && a.score<.9));
  assert.ok(data.result.categories.some(c=>c.score!==null));
  assert.ok(data.result.audits.length>0);
  assert.ok(advice.priorities.some(f=>f.source==='Lighthouse'));
  report.status='PASS'; report.url=data.result.finalUrl; report.fetchTime=data.result.fetchTime;
  report.categories=data.result.categories; report.auditCount=data.result.audits.length;
  report.priorities=advice.priorities; report.note='Actual mobile PageSpeed API results; advice IDs matched to received failing audits. Lab test, no field data.';
  fs.writeFileSync('reports/seo/live-scan-result.json',JSON.stringify(data.result,null,2));
} else { report.status='BLOCKED'; report.error=data; }
fs.writeFileSync('reports/seo/live-scan-verification.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
process.exitCode=response.ok ? 0 : 1;
