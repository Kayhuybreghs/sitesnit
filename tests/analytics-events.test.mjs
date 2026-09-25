import test, { afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { analyticsEventPayload, createToolEventTracker, publicCtaForLink, setPublicAnalyticsRuntime, trackPublicEvent } from '../lib/analytics-events.ts';

afterEach(() => setPublicAnalyticsRuntime(null));
function setup(href = 'https://sitesnit.nl/tools/website-check?url=https://private.example&email=secret#antwoord') {
  const events = [];
  setPublicAnalyticsRuntime({expiresAt:Date.now()+10000, href:()=>href,
    publicPaths:['/tools/website-check', '/contact', '/hub', '/hub/site/secret', '/account/scans/secret', '/rapport/token'],
    send:(name,params)=>events.push({name,params})});
  return events;
}
test('disabled, expired and revoked collection drops events without deferred replay', () => {
  assert.equal(trackPublicEvent({name:'tool_start',tool_id:'websitecheck'}), false);
  const tracker = createToolEventTracker('websitecheck');
  tracker.start();
  const events = setup();
  tracker.start();
  assert.equal(events.length,0);
  tracker.complete();
  assert.equal(events.length,1);
  setPublicAnalyticsRuntime(null);
  assert.equal(trackPublicEvent({name:'cta_click',action_id:'contact_open'}), false);
  setPublicAnalyticsRuntime({expiresAt:Date.now()-1,href:()=> 'https://sitesnit.nl/contact',publicPaths:['/contact'],send:()=>assert.fail('expired consent')});
  assert.equal(trackPublicEvent({name:'cta_click',action_id:'contact_open'}),false);
});
test('only allowlisted event names and identifiers survive; arbitrary fields never leave', () => {
  assert.deepEqual(analyticsEventPayload({name:'tool_complete',tool_id:'websitecheck', email:'secret', answers:{name:'private'}, page_location:'https://private.example'}),
    {name:'tool_complete',params:{tool_id:'websitecheck'}});
  for (const value of [null,{}, {name:'answer',tool_id:'websitecheck'}, {name:'tool_start',tool_id:'private@example.nl'}, {name:'cta_click',action_id:'free text'}, {name:'cta_click',action_id:'contact_open',tool_id:'bad'}]) assert.equal(analyticsEventPayload(value),null);
});
test('page context strips query, hash, referrer and any submitted values', () => {
  const events = setup();
  assert.equal(trackPublicEvent({name:'tool_complete',tool_id:'websitecheck'}),true);
  assert.deepEqual(events,[{name:'tool_complete',params:{tool_id:'websitecheck',page_location:'https://sitesnit.nl/tools/website-check',page_title:'Sitesnit · /tools/website-check',page_referrer:''}}]);
  assert.doesNotMatch(JSON.stringify(events),/secret|private|antwoord|email/);
});
test('Hub, accounts, shared reports and unknown public paths are excluded independently of allowlist mistakes', () => {
  for (const path of ['/hub','/hub/site/secret','/account/scans/secret','/rapport/token','/private-unknown']) {
    const events = setup('https://sitesnit.nl'+path);
    assert.equal(trackPublicEvent({name:'tool_start',tool_id:'websitecheck'}),false);
    assert.equal(events.length,0);
  }
});
test('rerenders, returning to a question and repeated result actions do not duplicate a run', () => {
  const events = setup();
  const tracker = createToolEventTracker('websitecheck');
  tracker.start(); tracker.start(); tracker.complete(); tracker.start(); tracker.complete();
  assert.deepEqual(events.map(e=>e.name),['tool_start','tool_complete']);
  tracker.reset(); tracker.start(); tracker.complete();
  assert.deepEqual(events.map(e=>e.name),['tool_start','tool_complete','tool_start','tool_complete']);
});
test('CTA mapping contains fixed IDs only, never link labels, queries, phone numbers or email', () => {
  const source = 'https://sitesnit.nl/tools/website-ontwerp-tool?private=secret';
  assert.deepEqual(publicCtaForLink('/contact?naam=secret&summary=private',source), {name:'cta_click',action_id:'contact_open',tool_id:'ontwerp_website'});
  assert.deepEqual(publicCtaForLink('#ontwerp-bespreken',source), {name:'cta_click',action_id:'discuss_result',tool_id:'ontwerp_website'});
  assert.deepEqual(publicCtaForLink('/tools/website-check',source), {name:'cta_click',action_id:'tool_open',tool_id:'websitecheck'});
  for (const href of ['https://other.example/contact', 'mailto:private@example.nl','tel:06123456','#private-result','/hub','/account','javascript:alert(1)']) assert.equal(publicCtaForLink(href,source),null);
});
test('analytics failure cannot break interaction', () => {
  setPublicAnalyticsRuntime({expiresAt:Date.now()+10000,href:()=> 'https://sitesnit.nl/contact',publicPaths:['/contact'],send:()=>{throw new Error('blocked script');}});
  assert.equal(trackPublicEvent({name:'cta_click',action_id:'contact_open'}),false);
});
