import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import type { HubConnection } from '../hub/connection';
import type { AppDatabase } from '../database-core';
import { ContactError, contactReference, type ContactInput } from './input';
import { contactMails } from './templates';
import { CONTACT_MAIL_BUDGETS, CONTACT_SAFE_RETRY_MS } from './limits';

type Connection = Pick<HubConnection,'db'|'transaction'>;
export type MailState = 'pending'|'processing'|'provider_accepted'|'retryable_failed'|'permanent_failed'|'delivery_unknown';
export type OutboxTask = { id:string; inquiry_id:string; kind:'owner'|'confirmation'; payload_json:string; state:MailState; provider_id:string|null; attempts:number; first_attempt_at:number|null; next_attempt_at:number; lease_until:number|null; claim_id:string|null; error_code:string|null; delivery_state:string|null; created_at:number };
export type MailConfig = { enabled:boolean; apiKey?:string; from:string };
const LEASE_MS = 60000;
async function reserve(db:AppDatabase,key:string,limit:number,until:number) {
  const row=await db.prepare('INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=rate_limits.count+1 WHERE rate_limits.count<? RETURNING count').bind(key,until,limit).first();
  if(!row) throw new ContactError('Er zijn tijdelijk te veel aanvragen. Je invoer blijft staan. Je kunt ook mailen naar contact@sitesnit.nl.',429);
}
export async function saveContact(connection:Connection,input:ContactInput,from:string,salt:string,now=Date.now()) {
  if(!salt||!from) throw new Error('Contact configuration missing.');
  return connection.transaction(async db=>{
    const inserted=await db.prepare('INSERT INTO inquiries(id,name,email,website,package_id,message,tool_summary,created_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING RETURNING id').bind(input.id,input.name,input.email,input.website||null,input.packageId||null,input.message,input.toolSummary||null,now).first();
    if(!inserted){
      const prior=await db.prepare('SELECT payload_hash FROM contact_requests WHERE inquiry_id=?').bind(input.id).first<{payload_hash:string}>();
      if(!prior||prior.payload_hash.length!==input.hash.length||!timingSafeEqual(Buffer.from(prior.payload_hash),Buffer.from(input.hash))) throw new ContactError('Deze verzendpoging hoort bij andere gegevens. Controleer de oorspronkelijke aanvraag voordat je een nieuwe verstuurt.',409);
      return {id:input.id,reference:contactReference(input.id),created:false};
    }
    const day=Math.floor(now/86400000),month=new Date(now).toISOString().slice(0,7);
    const recipient=createHash('sha256').update(`${salt}|${input.email}|${day}`).digest('hex');
    await reserve(db,`contact-recipient-${recipient}`,3,(day+1)*86400000);
    await reserve(db,`contact-global-${day}`,30,(day+1)*86400000);
    await reserve(db,`contact-month-${month}`,700,Date.UTC(new Date(now).getUTCFullYear(),new Date(now).getUTCMonth()+1,1));
    const {phone,serviceId,sourcePage,formId,toolId,appointment,preferredDay,preferredTime,careInterests,monthlyPlan,project,rhythm}=input;
    await db.prepare('INSERT INTO contact_requests(inquiry_id,payload_hash,context_json) VALUES(?,?,?)').bind(input.id,input.hash,JSON.stringify({phone,serviceId,sourcePage,formId,toolId,appointment,preferredDay,preferredTime,careInterests,monthlyPlan,project,rhythm})).run();
    const mails=contactMails(input,from,now);
    for(const kind of ['owner','confirmation'] as const) await db.prepare('INSERT INTO contact_outbox(id,inquiry_id,kind,payload_json,state,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(`${input.id}:${kind}`,input.id,kind,JSON.stringify(mails[kind]),'pending',now,now,now).run();
    return {id:input.id,reference:contactReference(input.id),created:true};
  });
}
class MailBudgetError extends Error {}
async function reserveMailBudget(connection:Connection,now:number) {
  await connection.transaction(async db=>{
    const date=new Date(now).toISOString();
    for(const {table,daily,monthly} of CONTACT_MAIL_BUDGETS)
      for(const [period,limit] of [[date.slice(0,10),daily],[date.slice(0,7),monthly]] as const){
        const row=await db.prepare(`INSERT INTO ${table}(period,count) VALUES(?,1) ON CONFLICT(period) DO UPDATE SET count=${table}.count+1 WHERE ${table}.count<? RETURNING count`).bind(period,limit).first();
        if(!row) throw new MailBudgetError();
      }
  });
}
export async function processContactTask(connection:Connection,id:string,config:MailConfig,options:{now?:number;request?:typeof fetch}={}) {
  const now=options.now??Date.now(),claim=randomUUID();
  const task=await connection.db.prepare(`UPDATE contact_outbox SET state='processing',claim_id=?,lease_until=?,updated_at=? WHERE id=? AND ((state IN ('pending','retryable_failed') AND next_attempt_at<=?) OR (state='processing' AND lease_until<=?)) RETURNING *`).bind(claim,now+LEASE_MS,now,id,now,now).first<OutboxTask>();
  if(!task) return;
  async function finish(state:MailState,error:string|null,providerId:string|null=null,next=now+60000){
    await connection.db.prepare('UPDATE contact_outbox SET state=?,error_code=?,provider_id=COALESCE(?,provider_id),next_attempt_at=?,lease_until=NULL,claim_id=NULL,updated_at=? WHERE id=? AND claim_id=?').bind(state,error,providerId,next,now,id,claim).run();
  }
  if(task.first_attempt_at!==null&&now-Number(task.first_attempt_at)>=CONTACT_SAFE_RETRY_MS){await finish('delivery_unknown','reconcile_required');return;}
  if(!config.enabled||!config.apiKey||!config.from){await finish('retryable_failed','mail_not_configured',null,now+300000);return;}
  if(task.attempts>=5){await finish('delivery_unknown','retry_limit_review');return;}
  try {await reserveMailBudget(connection,now);} catch(error){if(error instanceof MailBudgetError){await finish('retryable_failed','mail_budget',null,now+3600000);return;}throw error;}
  // Persist before the request, covering a crash after provider acceptance.
  await connection.db.prepare('UPDATE contact_outbox SET attempts=attempts+1,first_attempt_at=COALESCE(first_attempt_at,?) WHERE id=? AND claim_id=?').bind(now,id,claim).run();
  let state:MailState='retryable_failed',error='provider_response_unknown',providerId:string|null=null;
  try {
    const response=await (options.request??fetch)('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.apiKey}`,'Content-Type':'application/json','Idempotency-Key':`contact/${task.id}`},body:task.payload_json,signal:AbortSignal.timeout(8000)});
    if(response.ok){const body:unknown=await response.json();if(body&&typeof body==='object'&&'id' in body&&typeof body.id==='string'&&/^[\w-]{1,100}$/.test(body.id)){state='provider_accepted';error='';providerId=body.id;}}
    else if(response.status===429||response.status>=500){error=response.status===429?'provider_rate_limit':'provider_unavailable';}
    else if(response.status===401||response.status===403){error='provider_configuration';}
    else {state='permanent_failed';error=response.status===409?'provider_idempotency_conflict':'provider_rejected';}
  } catch { /* Unclear response: keep the exact payload/key and the bounded retry window. */ }
  await finish(state,error||null,providerId,now+Math.min(3600000,60000*2**task.attempts));
  if(providerId){
    const event=await connection.db.prepare("SELECT delivery_state,event_at FROM contact_webhook_events WHERE provider_id=? ORDER BY CASE WHEN delivery_state IN ('bounced','complained','failed') THEN 0 ELSE 1 END,event_at DESC LIMIT 1").bind(providerId).first<{delivery_state:string;event_at:number}>();
    if(event)await connection.db.prepare("UPDATE contact_outbox SET delivery_state=?,delivery_at=? WHERE id=? AND (delivery_at IS NULL OR delivery_at<?) AND (delivery_state IS NULL OR delivery_state NOT IN ('bounced','complained','failed'))").bind(event.delivery_state,event.event_at,id,event.event_at).run();
  }
}
/** Awaited bounded work; durable tasks survive termination. No fire-and-forget queue. */
export async function drainContactOutbox(connection:Connection,config:MailConfig,options:{inquiryId?:string;limit?:number;now?:number;request?:typeof fetch}={}) {
  const now=options.now??Date.now(),limit=Math.min(4,Math.max(1,options.limit??2));
  const tasks=await connection.db.prepare(`SELECT id FROM contact_outbox WHERE ((state IN ('pending','retryable_failed') AND next_attempt_at<=?) OR (state='processing' AND lease_until<=?)) ${options.inquiryId?'AND inquiry_id=?':''} ORDER BY created_at,kind DESC LIMIT ?`).bind(now,now,...(options.inquiryId?[options.inquiryId]:[]),limit).all<{id:string}>();
  for(const task of tasks.results) await processContactTask(connection,task.id,config,options);
  return tasks.results.length;
}
export async function contactMailStatus(db:AppDatabase,id:string){
  const rows=await db.prepare('SELECT kind,state,error_code FROM contact_outbox WHERE inquiry_id=?').bind(id).all<{kind:string;state:MailState;error_code:string|null}>();
  return Object.fromEntries(rows.results.map(r=>[r.kind,
    r.state==='provider_accepted'?'provider_accepted':
    r.error_code==='mail_not_configured'||r.error_code==='provider_configuration'?'unavailable':
    r.state==='permanent_failed'||r.state==='delivery_unknown'?'needs_review':'pending'
  ]));
}
