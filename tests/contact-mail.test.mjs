import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {Webhook} from 'svix';
import {sqliteHubConnection} from '../lib/hub/connection.ts';
import {sqliteSchema} from '../lib/database-schema.ts';
import {contactSchema} from '../lib/contact/schema.ts';
import {parseContact} from '../lib/contact/input.ts';
import {saveContact,processContactTask,drainContactOutbox,contactMailStatus} from '../lib/contact/store.ts';
import {recoverContactMail,reconcileContactMail} from '../lib/contact/admin.ts';
import {recordContactWebhook} from '../lib/contact/webhook.ts';
import {cleanupRetention} from '../lib/retention.ts';

const config={enabled:true,apiKey:'fixture-only',from:'Sitesnit <contact@sitesnit.nl>'};
const now=Date.now();
const base=()=>({requestId:randomUUID(),name:'Test Bezoeker',email:'visitor@example.test',message:'Een volledig geïsoleerde testaanvraag.',sourcePage:'/contact'});
async function fixture(t){const c=sqliteHubConnection(':memory:');await c.executeSchema(sqliteSchema+contactSchema);t.after(()=>c.close());return c;}
async function task(c,id,kind='owner'){return c.db.prepare('SELECT * FROM contact_outbox WHERE id=?').bind(`${id}:${kind}`).first();}
async function save(c,b=base()){const input=parseContact(b);await saveContact(c,input,config.from,'fixture-salt',now);return input;}
const accepted=async()=>Response.json({id:'provider-fixture'});

test('one inquiry and exactly two immutable deliveries across concurrent duplicate submissions',async t=>{
 const c=await fixture(t),input=parseContact(base());
 const results=await Promise.all(Array.from({length:8},()=>saveContact(c,input,config.from,'salt',now)));
 assert.equal(results.filter(r=>r.created).length,1);
 assert.equal((await c.db.prepare('SELECT COUNT(*) AS n FROM inquiries').first()).n,1);
 assert.equal((await c.db.prepare('SELECT COUNT(*) AS n FROM contact_outbox').first()).n,2);
 await assert.rejects(()=>saveContact(c,parseContact({...base(),requestId:input.id,message:'Different valid content'}),config.from,'salt',now),e=>e.status===409);
 const owner=JSON.parse((await task(c,input.id)).payload_json),customer=JSON.parse((await task(c,input.id,'confirmation')).payload_json);
 assert.equal(owner.to,'contact@sitesnit.nl');assert.equal(owner.reply_to,input.email);
 assert.equal(customer.to,input.email);assert.equal(customer.reply_to,'contact@sitesnit.nl');
 assert.ok(!customer.text.includes(input.message));
});
test('outbox insert failure rolls the entire inquiry back',async t=>{
 const c=await fixture(t);await c.executeSchema("CREATE TRIGGER fail_outbox BEFORE INSERT ON contact_outbox WHEN NEW.kind='confirmation' BEGIN SELECT RAISE(ABORT,'fixture failure'); END;");
 await assert.rejects(()=>save(c));assert.equal((await c.db.prepare('SELECT COUNT(*) AS n FROM inquiries').first()).n,0);
 assert.equal((await c.db.prepare('SELECT COUNT(*) AS n FROM contact_outbox').first()).n,0);
});
test('one atomic claim per task and accepted tasks never send again',async t=>{
 const c=await fixture(t),input=await save(c);let requests=0;
 const request=async()=>{requests++;return accepted();};
 await Promise.all(Array.from({length:10},()=>processContactTask(c,`${input.id}:owner`,config,{now,request})));
 assert.equal(requests,1);assert.equal((await task(c,input.id)).state,'provider_accepted');
 await processContactTask(c,`${input.id}:owner`,config,{now:now+86400000,request});assert.equal(requests,1);
 await assert.rejects(()=>recoverContactMail(c,'admin',{action:'retry',taskId:`${input.id}:owner`,confirmedNotSent:true}),e=>e.status===409);
});
test('partial success retries only the failed mail with identical payload and key',async t=>{
 const c=await fixture(t),input=await save(c);const calls=[];let fail=true;
 const request=async(url,init)=>{calls.push(init);if(JSON.parse(init.body).to===input.email&&fail)return new Response('down',{status:503});return accepted();};
 await drainContactOutbox(c,config,{inquiryId:input.id,now,request});assert.equal((await task(c,input.id)).state,'provider_accepted');
 assert.equal((await task(c,input.id,'confirmation')).state,'retryable_failed');fail=false;
 await drainContactOutbox(c,config,{now:now+120000,request});assert.equal(calls.length,3);
 const confirmationCalls=calls.filter(c=>JSON.parse(c.body).to===input.email);assert.equal(confirmationCalls[0].body,confirmationCalls[1].body);assert.equal(confirmationCalls[0].headers['Idempotency-Key'],confirmationCalls[1].headers['Idempotency-Key']);
});
test('lost provider response outside the 23 hour retry window requires review',async t=>{
 const c=await fixture(t),input=await save(c);let calls=0;
 const request=async()=>{calls++;throw new Error('network disappeared after acceptance');};
 await processContactTask(c,`${input.id}:owner`,config,{now,request});
 await processContactTask(c,`${input.id}:owner`,config,{now:now+24*3600000,request});
 assert.equal(calls,1);assert.equal((await task(c,input.id)).state,'delivery_unknown');
 await assert.rejects(()=>recoverContactMail(c,'admin',{action:'retry',taskId:`${input.id}:owner`},now+24*3600000),e=>e.status===409);
});
test('confirmation succeeds independently when the owner notification fails',async t=>{
 const c=await fixture(t),input=await save(c);const destinations=[];let fail=true;
 const request=async(url,init)=>{const to=JSON.parse(init.body).to;destinations.push(to);return to==='contact@sitesnit.nl'&&fail?new Response('down',{status:503}):accepted();};
 await drainContactOutbox(c,config,{inquiryId:input.id,now,request});
 assert.equal((await task(c,input.id)).state,'retryable_failed');
 assert.equal((await task(c,input.id,'confirmation')).state,'provider_accepted');
 fail=false;await drainContactOutbox(c,config,{now:now+120000,request});
 assert.equal(destinations.filter(to=>to===input.email).length,1);
 assert.equal(destinations.filter(to=>to==='contact@sitesnit.nl').length,2);
});
test('expired processing lease is recoverable and obeys provider idempotency',async t=>{
 const c=await fixture(t),input=await save(c);
 await c.db.prepare("UPDATE contact_outbox SET state='processing',lease_until=?,first_attempt_at=?,attempts=1 WHERE id=?").bind(now-1,now-60000,`${input.id}:owner`).run();
 await processContactTask(c,`${input.id}:owner`,config,{now,request:accepted});assert.equal((await task(c,input.id)).state,'provider_accepted');
});
test('email failure, missing key or disabled Hub cannot delete or misreport stored inquiries',async t=>{
 const c=await fixture(t),input=await save(c);let calls=0;
 await drainContactOutbox(c,{...config,apiKey:undefined},{now,request:async()=>{calls++;return accepted();}});
 assert.equal(calls,0);assert.equal((await task(c,input.id)).error_code,'mail_not_configured');
 assert.equal((await c.db.prepare('SELECT COUNT(*) AS n FROM inquiries').first()).n,1);
});
test('public quota leaves room for account mail and recipient/global limits are durable',async t=>{
 const c=await fixture(t);const input=await save(c);
 await c.db.prepare('INSERT INTO contact_mail_usage(period,count) VALUES(?,60)').bind(new Date(now).toISOString().slice(0,10)).run();
 let calls=0;await drainContactOutbox(c,config,{now,request:async()=>{calls++;return accepted();}});assert.equal(calls,0);assert.equal((await task(c,input.id)).error_code,'mail_budget');
 await save(c);await save(c);await assert.rejects(()=>save(c),e=>e.status===429);
 assert.equal((await c.db.prepare('SELECT COUNT(*) AS n FROM inquiries').first()).n,3);
});

test('disabled mail is reported as unavailable instead of promising a later confirmation',async t=>{
 const c=await fixture(t),input=await save(c);let calls=0;
 await drainContactOutbox(c,{...config,enabled:false},{now,request:async()=>{calls++;return accepted();}});
 assert.equal(calls,0);
 assert.deepEqual(await contactMailStatus(c.db,input.id),{confirmation:'unavailable',owner:'unavailable'});
 await c.db.prepare("UPDATE contact_outbox SET state='provider_accepted',error_code=NULL WHERE id=?").bind(`${input.id}:confirmation`).run();
 await c.db.prepare("UPDATE contact_outbox SET state='delivery_unknown',error_code='reconcile_required' WHERE id=?").bind(`${input.id}:owner`).run();
 assert.deepEqual(await contactMailStatus(c.db,input.id),{confirmation:'provider_accepted',owner:'needs_review'});
});
test('strict input validation, explicit summary inclusion, and HTML escaping',async t=>{
 for(const patch of [{email:'a@example.test\r\nBcc: b@example.test'},{message:{}},{serviceId:'made-up'},{sourcePage:'/hub/admin'},{packageId:'bad'},{includeSummary:'true'},{appointment:true,preferredDay:'Maandag',preferredTime:'12:00'}])assert.throws(()=>parseContact({...base(),...patch}));
 assert.equal(parseContact({...base(),toolSummary:'private tool result'}).toolSummary,'');
 const c=await fixture(t),input=await save(c,{...base(),name:'<img src=x onerror=alert(1)>',includeSummary:true,toolSummary:'Chosen summary',sourcePage:'/tools/seo-audit',formId:'tool_contact'});
 const html=JSON.parse((await task(c,input.id)).payload_json).html;assert.ok(html.includes('&lt;img'));assert.ok(!html.includes('<img src=x'));assert.ok(html.includes('Chosen summary'));
});
test('signed delivery events deduplicate, preserve terminal state and survive send-response races',async t=>{
 const c=await fixture(t),input=await save(c),secret='whsec_'+Buffer.from('fixture-only-signing-secret-123456').toString('base64');
 async function event(type,id,time=now){const raw=JSON.stringify({type,created_at:new Date(time).toISOString(),data:{email_id:'provider-fixture'}});const date=new Date();const headers=new Headers({'svix-id':id,'svix-timestamp':String(Math.floor(date.getTime()/1000)),'svix-signature':new Webhook(secret).sign(id,date,raw)});return recordContactWebhook(c,raw,headers,secret);}
 await assert.rejects(()=>recordContactWebhook(c,'{}',new Headers({'svix-id':'bad'}),secret));
 await event('email.delivered','delivery-1'); // comes before send() commits provider_id
 await processContactTask(c,`${input.id}:owner`,config,{now,request:accepted});assert.equal((await task(c,input.id)).delivery_state,'delivered');
 assert.ok((await event('email.delivered','delivery-1')).duplicate);
 await event('email.bounced','delivery-2',now+1000);await event('email.delivered','delivery-3',now+2000);
 assert.equal((await task(c,input.id)).delivery_state,'bounced');
});
test('retention cascades personal request context and frozen email bodies',async t=>{
 const c=await fixture(t);await save(c);await cleanupRetention(c.db,now+367*86400000);
 for(const table of ['inquiries','contact_requests','contact_outbox'])assert.equal((await c.db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).first()).n,0);
});

test('manual reconciliation accepts only a matching provider message and never sends',async t=>{
 const c=await fixture(t),input=await save(c),id=`${input.id}:owner`;
 await c.db.prepare("UPDATE contact_outbox SET state='delivery_unknown' WHERE id=?").bind(id).run();
 await assert.rejects(()=>reconcileContactMail(c,'admin',{taskId:id,providerId:'provider-fixture'},'fixture',async()=>Response.json({to:['somebody@example.test']})),e=>e.status===409);
 const frozen=JSON.parse((await task(c,input.id)).payload_json);
 await reconcileContactMail(c,'admin',{taskId:id,providerId:'provider-fixture'},'fixture',async()=>Response.json({...frozen,to:[frozen.to]}));
 assert.equal((await task(c,input.id)).state,'provider_accepted');
 assert.equal((await task(c,input.id)).attempts,0);
});

test('provider 429 preserves the saved lead and retries with the identical key and payload',async t=>{
 const c=await fixture(t),input=await save(c),calls=[];
 const request=async(url,init)=>{calls.push(init);return calls.length===1?new Response('fixture rate limit',{status:429}):accepted();};
 await processContactTask(c,`${input.id}:owner`,config,{now,request});
 assert.equal((await task(c,input.id)).error_code,'provider_rate_limit');
 assert.equal((await c.db.prepare('SELECT COUNT(*) AS n FROM inquiries').first()).n,1);
 await processContactTask(c,`${input.id}:owner`,config,{now:now+120000,request});
 assert.equal(calls[0].body,calls[1].body);assert.equal(calls[0].headers['Idempotency-Key'],calls[1].headers['Idempotency-Key']);
 assert.equal((await task(c,input.id)).state,'provider_accepted');
});

test('crash after provider acceptance keeps its persisted attempt and recovers one intended delivery',async t=>{
 const c=await fixture(t),input=await save(c),calls=[],acceptedKeys=new Set();
 const request=async(url,init)=>{calls.push(init);acceptedKeys.add(init.headers['Idempotency-Key']);return accepted();};
 await c.executeSchema("CREATE TRIGGER fail_contact_finish BEFORE UPDATE ON contact_outbox WHEN NEW.state='provider_accepted' BEGIN SELECT RAISE(ABORT,'fixture process crash'); END;");
 await assert.rejects(()=>processContactTask(c,`${input.id}:owner`,config,{now,request}));
 assert.equal((await task(c,input.id)).first_attempt_at,now);assert.equal((await task(c,input.id)).state,'processing');
 await c.executeSchema('DROP TRIGGER fail_contact_finish;');
 await processContactTask(c,`${input.id}:owner`,config,{now:now+61000,request});
 assert.equal(calls.length,2);assert.equal(acceptedKeys.size,1);assert.equal(calls[0].body,calls[1].body);
 assert.equal((await task(c,input.id)).state,'provider_accepted');
});
