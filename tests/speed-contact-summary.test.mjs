import test from 'node:test';
import assert from 'node:assert/strict';
import {speedContactSummary} from '../lib/speed-contact-summary.ts';
import {speedReportText} from '../lib/speed-report.ts';
import {parseContact} from '../lib/contact/input.ts';
import {CONTACT_SUMMARY_MAX_LENGTH,CONTACT_BODY_MAX_BYTES} from '../lib/contact/limits.ts';
import {readObjectBody} from '../lib/request-body.ts';
import {richSpeedStates,contactPayload} from './fixtures/speed-rich.mjs';
import {speedFixture} from './fixtures/speed.mjs';
import {normalizeSpeedResult} from '../lib/speed-test.ts';

test('rich real Both reports compact without changing state or the complete export',()=>{
  const states=richSpeedStates(),before=JSON.stringify(states),full=speedReportText('https://example.com/',states);
  const compact=speedContactSummary('https://example.com/',states);
  assert.ok(full.length>12000);assert.ok(compact.text.length<12000);assert.equal(compact.unavailable,'');
  assert.equal(parseContact(contactPayload(compact.text)).toolSummary,compact.text);
  assert.match(compact.text,/3 van 11/);assert.match(compact.text,/Dit is een samenvatting/);
  for(const d of ['Mobiel','Desktop'])assert.match(compact.text,new RegExp(d));
  assert.match(compact.text,/10:00:00Z/);assert.match(compact.text,/10:01:00Z/);
  assert.equal(JSON.stringify(states),before);assert.equal(speedReportText('https://example.com/',states),full);
  assert.equal(speedContactSummary('https://example.com/',states).text,compact.text);
});
test('short, missing, partial, prior, running and cancelled states remain honest',()=>{
  const result=normalizeSpeedResult(speedFixture(),'https://example.com/','mobile');
  const one=speedContactSummary(result.requestedUrl,{mobile:{status:'success',result}}).text;
  assert.equal(parseContact(contactPayload(one)).toolSummary,one);assert.match(one,/Desktop\nGeen meting beschikbaar/);
  const none=speedContactSummary(result.requestedUrl,{}).text;assert.doesNotMatch(none,/Prestaties:|0\/100|100\/100/);
  for(const status of ['error','loading','cancelled']){
    const text=speedContactSummary(result.requestedUrl,{mobile:{status,result},desktop:{status:'success',result:{...result,device:'desktop',finalUrl:'https://example.org/other'}}}).text;
    assert.match(text,/Eerdere meting/);assert.match(text,/Deelsucces/);assert.match(text,/eindadressen verschillen/);assert.ok(text.includes('https://example.org/other'));
  }
});
test('real parser keeps the 12000/12001 field contract and opt-in boundary',()=>{
  assert.equal(CONTACT_SUMMARY_MAX_LENGTH,12000);
  assert.equal(parseContact(contactPayload('x'.repeat(12000))).toolSummary.length,12000);
  assert.throws(()=>parseContact(contactPayload('x'.repeat(12001))),e=>e.status===400);
  assert.equal(parseContact(contactPayload('x'.repeat(40000),{includeSummary:false})).toolSummary,'');
});
test('whole URLs and Unicode stay intact; oversized mandatory context is blocked',()=>{
  const url='https://example.com/'+('a'.repeat(1800)),states=richSpeedStates(url);
  states.mobile.result.finalUrl='https://example.org/'+('b'.repeat(1800));
  states.desktop.result.finalUrl='https://example.net/'+('c'.repeat(1800));
  states.mobile.result.findings[0].title='🧪'.repeat(8000);
  states.desktop.result.findings[0].action='引号"\\\n🧪'.repeat(10000);
  const compact=speedContactSummary(url,states);assert.equal(compact.unavailable,'');
  for(const address of [url,states.mobile.result.finalUrl,states.desktop.result.finalUrl])assert.ok(compact.text.includes(address));
  assert.ok(compact.text.isWellFormed());assert.ok(compact.text.length<=12000);
  assert.equal(parseContact(contactPayload(compact.text,{website:url})).toolSummary,compact.text);
  const blocked=speedContactSummary('https://example.com/'+('🧪'.repeat(7000)),states);
  assert.equal(blocked.text,'');assert.match(blocked.unavailable,/zonder rapport/);
  states.mobile.result.findings[1].title='invalid\ud800';
  assert.ok(speedContactSummary(url,states).text.isWellFormed());
});
test('Unicode and JSON escaping fit the existing whole-body boundary with unchanged form values',async()=>{
  const states=richSpeedStates();for(const d of ['mobile','desktop'])for(const f of states[d].result.findings){f.title='漢'.repeat(200);f.what='"\\\n漢🧪'.repeat(200);f.action='漢'.repeat(300);}
  const compact=speedContactSummary('https://example.com/',states),message='漢'.repeat(4000);
  const payload=contactPayload(compact.text,{message,name:'漢'.repeat(100),website:'https://example.com/'+('a'.repeat(1900))});
  const encoded=JSON.stringify(payload);assert.ok(Buffer.byteLength(encoded)<=CONTACT_BODY_MAX_BYTES);assert.equal(parseContact(payload).message,message);
  const parsed=await readObjectBody(new Request('http://localhost/api/contact',{method:'POST',body:encoded}),64000);assert.equal(parsed.toolSummary,compact.text);
  await assert.rejects(readObjectBody(new Request('http://localhost/api/contact',{method:'POST',body:' '.repeat(64001)}),64000),e=>e.status===413);
});
