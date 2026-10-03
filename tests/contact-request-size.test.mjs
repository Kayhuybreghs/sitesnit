import test from 'node:test';
import assert from 'node:assert/strict';
import {contactSizeIssue} from '../lib/contact/request-size.ts';
import {parseContact} from '../lib/contact/input.ts';
import {readObjectBody} from '../lib/request-body.ts';
import {contactPayload,richSpeedStates} from './fixtures/speed-rich.mjs';
import {speedReportText} from '../lib/speed-report.ts';
import {speedContactSummary} from '../lib/speed-contact-summary.ts';

test('recoverable summary size follows real parser trimming, opt-in and UTF-16 boundaries',()=>{
  for(const summary of ['x'.repeat(12000),' \n\uFEFF\u00a0'+'🧪'.repeat(6000)+'\u00a0\r\n',' '.repeat(13000)]){
    const payload=contactPayload(summary),original=JSON.stringify(payload);
    assert.equal(contactSizeIssue(payload),null);
    assert.equal(parseContact(payload).toolSummary,summary.trim());
    assert.equal(JSON.stringify(payload),original,'valid unknown retries cannot be normalized or mutated');
  }
  for(const summary of ['x'.repeat(12001),' \n'+'🧪'.repeat(6000)+'x\n ']){
    const payload=contactPayload(summary);assert.equal(contactSizeIssue(payload),'summary');
    assert.throws(()=>parseContact(payload),e=>e.status===400);
  }
  const declined=contactPayload('x'.repeat(13000),{includeSummary:false});
  assert.equal(contactSizeIssue(declined),null);assert.equal(parseContact(declined).toolSummary,'');
});

test('body recovery proof uses exact raw JSON bytes, including ignored whitespace and JSON escapes',async()=>{
  const payload=contactPayload('🧪'.repeat(6000),{message:'Mijn eigen vraag "\\\n'+'é'.repeat(3900),padding:''});
  const base=JSON.stringify(payload);payload.padding='x'.repeat(64000-Buffer.byteLength(base));
  for(const extra of [0,1]){
    const candidate={...payload,padding:payload.padding+'x'.repeat(extra)},encoded=JSON.stringify(candidate);
    assert.equal(Buffer.byteLength(encoded),64000+extra);
    const request=new Request('http://127.0.0.1/api/contact',{method:'POST',body:encoded});
    if(extra){assert.equal(contactSizeIssue(candidate,encoded),'body');await assert.rejects(readObjectBody(request,64000),e=>e.status===413);}
    else {assert.equal(contactSizeIssue(candidate,encoded),null);assert.equal(parseContact(await readObjectBody(request,64000)).message,candidate.message);}
  }
  const whitespace=contactPayload(' '.repeat(64000)+'ok');
  assert.equal(parseContact(whitespace).toolSummary,'ok');
  assert.equal(contactSizeIssue(whitespace),'body','trimming cannot exempt the raw request body from its limit');
});

test('rich Both report remains complete while only its legacy contact representation requires recovery',()=>{
  const states=richSpeedStates(),full=speedReportText('https://example.com/',states),compact=speedContactSummary('https://example.com/',states).text;
  assert.ok(full.length>12000);assert.equal(contactSizeIssue(contactPayload(full)),'summary');
  assert.equal(contactSizeIssue(contactPayload(compact)),null);assert.equal(parseContact(contactPayload(compact)).toolSummary,compact);
  assert.equal(speedReportText('https://example.com/',states),full);
});

test('other validation failures are not used as an excuse to reset a possibly stored request',()=>{
  for(const payload of [contactPayload('ok',{requestId:'unrecognized'}),contactPayload('ok',{name:''}),contactPayload(null),contactPayload('x'.repeat(13000),{includeSummary:'yes'})]){
    const before=JSON.stringify(payload);assert.equal(contactSizeIssue(payload),null);assert.equal(JSON.stringify(payload),before);
  }
});
