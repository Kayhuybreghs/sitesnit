import test from 'node:test';
import assert from 'node:assert/strict';
import {sqliteHubConnection} from '../lib/hub/connection.ts';
import {sqliteSchema} from '../lib/database-schema.ts';
import {contactSchema} from '../lib/contact/schema.ts';
import {contactOperationalHealth,recordContactHeartbeat} from '../lib/contact/health.ts';
import {CONTACT_SAFE_RETRY_MS} from '../lib/contact/limits.ts';

const now=Date.UTC(2026,8,27,12);
async function fixture(t){const connection=sqliteHubConnection(':memory:');await connection.executeSchema(sqliteSchema+contactSchema);t.after(()=>connection.close());return connection;}
async function addTask(db,id,patch={}){
  await db.prepare('INSERT INTO inquiries(id,name,email,message,created_at) VALUES(?,?,?,?,?)').bind(id,'Private name','private@example.test','Private message',now).run();
  const task={state:'pending',next:now-60000,first:null,lease:null,error:null,delivery:null,created:now,...patch};
  await db.prepare('INSERT INTO contact_outbox(id,inquiry_id,kind,payload_json,state,next_attempt_at,first_attempt_at,lease_until,error_code,delivery_state,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)')
    .bind(`${id}:owner`,id,'owner','{"private":"frozen mail content"}',task.state,task.next,task.first,task.lease,task.error,task.delivery,task.created,now).run();
}
test('absent heartbeat is unknown and visitor/admin activity cannot masquerade as background processing',async t=>{
  const {db}=await fixture(t);
  await db.prepare('INSERT INTO contact_admin_log(id,user_id,task_id,action,created_at) VALUES(?,?,?,?,?)').bind('retry','admin','a:owner','retry_due',now).run();
  const health=await contactOperationalHealth(db,now);
  assert.equal(health.lastBackgroundAt,null);assert.equal(health.heartbeatState,'missing');
  assert.equal(health.due,0);assert.equal(health.oldestDueAt,null);
  await recordContactHeartbeat(db,now);await recordContactHeartbeat(db,now-1000);
  assert.equal((await contactOperationalHealth(db,now)).lastBackgroundAt,now,'an older concurrent completion cannot move the heartbeat backwards');
  assert.equal((await contactOperationalHealth(db,now)).heartbeatState,'recorded');
  assert.equal((await contactOperationalHealth(db,now+CONTACT_SAFE_RETRY_MS)).heartbeatState,'stale');
});
test('whole-queue diagnostics include old failures beyond the recent inquiry display limit without exposing payloads',async t=>{
  const {db}=await fixture(t);
  await addTask(db,'old-risk',{state:'retryable_failed',first:now-CONTACT_SAFE_RETRY_MS+1,created:now-86400000,error:'mail_budget'});
  await addTask(db,'stalled',{state:'processing',lease:now-1});
  await addTask(db,'active',{state:'processing',lease:now+10000});
  await addTask(db,'review',{state:'delivery_unknown'});
  await addTask(db,'bounced',{state:'provider_accepted',delivery:'bounced'});
  await addTask(db,'configuration',{state:'retryable_failed',error:'mail_not_configured'});
  for(let i=0;i<105;i++)await addTask(db,`new-${i}`,{state:'provider_accepted'});
  const health=await contactOperationalHealth(db,now);
  assert.equal(health.due,2);assert.equal(health.stalled,1);assert.equal(health.review,1);assert.equal(health.deliveryFailed,1);
  assert.equal(health.retryWindowRisk,1);assert.equal(health.budgetBlocked,1);assert.equal(health.configurationBlocked,1);
  assert.doesNotMatch(JSON.stringify(health),/private|frozen|example\.test|old-risk/i);
});
test('diagnostic quotas use actual current UTC periods and the same application limits as dispatch',async t=>{
  const {db}=await fixture(t);
  for(const [table,period,count] of [['contact_mail_usage','2026-09-27',60],['contact_mail_usage','2026-09',1800],['contact_mail_usage','2026-09-26',55],['hub_mail_usage','2026-09-27',89]])
    await db.prepare(`INSERT INTO ${table}(period,count) VALUES(?,?)`).bind(period,count).run();
  const health=await contactOperationalHealth(db,now);
  assert.deepEqual(health.budgets[0],{label:'Contactmail',daily:{used:60,limit:60},monthly:{used:1800,limit:1800}});
  assert.deepEqual(health.budgets[1].daily,{used:89,limit:90});assert.equal(health.budgets[1].monthly.used,0);
});
