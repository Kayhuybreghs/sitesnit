import test from 'node:test';import assert from 'node:assert/strict';
import {normalizeLighthouse} from '../lib/lighthouse.ts';
import {normalizeSpeedResult,validSpeedResult} from '../lib/speed-test.ts';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,nextResolve){return specifier==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:nextResolve(specifier,context);}});
const {speedTestResponse}=await import('../lib/speed-api.ts');
import {speedFixture} from './fixtures/speed.mjs';
const request=(body={url:'https://example.com/',device:'mobile'},origin='http://localhost')=>new Request('http://localhost/api/speed-test',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
test('mobile and desktop use the returned score and numeric evidence without changing the old mobile default',()=>{
 for(const device of ['mobile','desktop']){const result=normalizeSpeedResult(speedFixture(device),'https://example.com/',device);assert.equal(result.score,76);assert.equal(result.metrics[1].displayValue,'3,1 s');assert.equal(result.metrics[3].displayValue,'0,04');assert.equal(result.findings.length,1);assert.match(result.findings[0].evidence[0],/<script/);assert.equal(result.passed.length,1);assert.ok(validSpeedResult(result));}
 assert.throws(()=>normalizeLighthouse(speedFixture('desktop'),'https://example.com/'),/apparaat/);
});
test('missing, invalid and mismatched reports never produce a replacement score',()=>{
 for(const change of [r=>delete r.lighthouseResult.categories.performance,r=>r.lighthouseResult.categories.performance.score=null,r=>r.lighthouseResult.categories.performance.score=2,r=>r.lighthouseResult.audits['largest-contentful-paint'].numericValue=-1,r=>delete r.lighthouseResult.audits['speed-index'],r=>r.lighthouseResult.runtimeError={code:'error'},r=>r.lighthouseResult.fetchTime='bad',r=>r.lighthouseResult.finalUrl='http://127.0.0.1']){const r=speedFixture();change(r);assert.throws(()=>normalizeSpeedResult(r,'https://example.com/','mobile'));}
 const valid=normalizeSpeedResult(speedFixture(),'https://example.com/','mobile');for(const bad of [null,{}, {...valid,findings:[null]},{...valid,passed:{}},{...valid,warnings:[{}]},{...valid,metrics:[...valid.metrics.slice(1),valid.metrics[1]]}])assert.equal(validSpeedResult(bad),false);
});
test('request validation prevents invalid URLs, private inputs, cross-origin calls and unknown device before provider access',async()=>{
 let calls=0;const options={limit:async()=>{calls++;return true;},transport:async()=>{throw Error('Must not fetch');},key:''};
 for(const body of [{url:'http://localhost',device:'mobile'},{url:'http://192.168.1.2',device:'mobile'},{url:'https://name:secret@example.com/',device:'mobile'},{url:'https://example.com/?token=private',device:'mobile'},{url:'https://example.com/',device:'tablet'},{url:5,device:'mobile'}])assert.equal((await speedTestResponse(request(body),options)).status,400);
 assert.equal((await speedTestResponse(request(undefined,'https://other.invalid'),options)).status,403);assert.equal(calls,0);
});
test('provider calls stay fixed, use the selected device and optional server key, and preserve errors as errors',async()=>{
 for(const key of ['', 'test-key-only']){
 let calls=0;const response=await speedTestResponse(request({url:'example.com',device:'desktop'}),{key,limit:async()=>true,transport:async(endpoint)=>{calls++;const u=new URL(endpoint);assert.equal(u.origin,'https://www.googleapis.com');assert.equal(u.searchParams.get('strategy'),'desktop');assert.equal(u.searchParams.get('category'),'performance');assert.equal(u.searchParams.get('key'),key||null);return Response.json(speedFixture('desktop'));}});
 assert.equal(response.status,200);assert.equal(calls,1);assert.equal((await response.json()).result.device,'desktop');assert.equal(response.headers.get('cache-control'),'no-store');assert.match(response.headers.get('x-robots-tag'),/noindex/);
 }
 for(const [providerStatus,status] of [[429,429],[403,502],[500,502]]){const response=await speedTestResponse(request(),{key:'',limit:async()=>true,transport:async()=>Response.json({error:'private upstream detail'},{status:providerStatus})});assert.equal(response.status,status);assert.equal((await response.json()).result,undefined);}
 const denied=await speedTestResponse(request(),{key:'',limit:async()=>false,transport:async()=>{throw Error('not called');}});assert.equal(denied.status,429);
 const broken=await speedTestResponse(request(),{key:'',limit:async()=>true,transport:async()=>Response.json({})});assert.equal(broken.status,502);
 const timeout=await speedTestResponse(request(),{key:'',limit:async()=>true,transport:async()=>{throw new DOMException('Synthetic','TimeoutError');}});assert.match((await timeout.json()).error,/duurde te lang/);
});

import {speedResultMatches,speedReportText} from '../lib/speed-report.ts';
test('report identity and export preserve source evidence and previous-state warnings',()=>{const report=normalizeSpeedResult(speedFixture(),'https://example.com/','mobile');assert.ok(speedResultMatches(report,'example.com','mobile'));for(const value of [{...report,requestedUrl:'https://other.example.com/'},{...report,finalUrl:'http://localhost/'},{...report,device:'desktop'}])assert.equal(speedResultMatches(value,'https://example.com/','mobile'),false);const text=speedReportText(report.requestedUrl,{mobile:{status:'error',result:report}});assert.match(text,/Eerdere meting/);assert.match(text,/Desktop\nGeen meting beschikbaar/);assert.match(text,/<script/);assert.match(text,/2026-10-01T10:00:00Z/);});
