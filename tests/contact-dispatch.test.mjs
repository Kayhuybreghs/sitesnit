import test from 'node:test';
import assert from 'node:assert/strict';
import {dispatchContactResponse} from '../lib/contact/dispatch.ts';
import {sqliteHubConnection} from '../lib/hub/connection.ts';
import {sqliteSchema} from '../lib/database-schema.ts';
import {contactSchema} from '../lib/contact/schema.ts';
const secret='fixture-only-contact-dispatch-secret',config={enabled:true,apiKey:'fixture',from:'Sitesnit <contact@sitesnit.nl>'};
const request=(token=secret)=>new Request('http://localhost/api/internal/contact-dispatch',{method:'POST',headers:{authorization:`Bearer ${token}`}});
test('unauthenticated and disabled dispatch never open storage or transport',async()=>{
  const connection=async()=>{throw Error('must not open');};
  assert.equal((await dispatchContactResponse(request('wrong'),{secret,config,connection})).status,401);
  assert.equal((await dispatchContactResponse(request(),{secret,config:{...config,enabled:false},connection})).status,503);
});
test('background batches remain bounded, overlapping calls do not duplicate provider tasks',async t=>{
  const c=sqliteHubConnection(':memory:');await c.executeSchema(sqliteSchema+contactSchema);t.after(()=>c.close());const now=Date.now();
  for(let i=0;i<6;i++){
    await c.db.prepare('INSERT INTO inquiries(id,name,email,message,created_at) VALUES(?,?,?,?,?)').bind(`r${i}`,'Synthetic','fixture@example.invalid','Synthetic',now).run();
    await c.db.prepare('INSERT INTO contact_outbox(id,inquiry_id,kind,payload_json,state,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(`t${i}`,`r${i}`,'owner','{}','pending',now,now,now).run();
  }
  const calls=[];const transport=async(_url,options)=>{calls.push(options.headers['Idempotency-Key']);return Response.json({id:`fixture-${calls.length}`});};
  const options={secret,config,connection:async()=>c,transport,now};
  const first=await dispatchContactResponse(request(),options);assert.equal(first.status,200);assert.equal((await first.json()).processed,4);assert.equal(calls.length,4);
  await Promise.all([dispatchContactResponse(request(),options),dispatchContactResponse(request(),options)]);
  assert.equal(calls.length,6);assert.equal(new Set(calls).size,6);
  const log=await c.db.prepare("SELECT created_at FROM contact_admin_log WHERE id='system:contact-outbox-heartbeat'").first();assert.equal(log.created_at,now);
});
