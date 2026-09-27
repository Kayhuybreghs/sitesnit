import {randomUUID} from 'node:crypto';
import type {HubConnection} from '../hub/connection';
import {ContactError} from './input';
import type {OutboxTask} from './store';
/** Verify the provider's immutable message before marking an uncertain send accepted. */
export async function reconcileContactMail(connection:Pick<HubConnection,'db'|'transaction'>,userId:string,input:Record<string,unknown>,apiKey:string|undefined,request:typeof fetch=fetch){
  if(!apiKey||typeof input.taskId!=='string'||typeof input.providerId!=='string'||!/^[-\w]{1,100}$/.test(input.providerId))throw new ContactError('Vul een geldige provider-ID in en controleer de mailkoppeling.');
  const task=await connection.db.prepare('SELECT * FROM contact_outbox WHERE id=?').bind(input.taskId).first<OutboxTask>();
  if(!task||task.state==='provider_accepted'||(task.state==='processing'&&Number(task.lease_until)>Date.now()))throw new ContactError('Deze taak kan nu niet worden vergeleken.',409);
  const response=await request(`https://api.resend.com/emails/${input.providerId}`,{headers:{Authorization:`Bearer ${apiKey}`},signal:AbortSignal.timeout(8000)});
  if(!response.ok)throw new ContactError('Het providerbericht kon niet worden gecontroleerd.');
  const remote=await response.json() as {to?:string[];from?:string;subject?:string;text?:string;html?:string;last_event?:string},frozen=JSON.parse(task.payload_json);
  if(remote.to?.length!==1||remote.to[0]!==frozen.to||remote.from!==frozen.from||remote.subject!==frozen.subject||(!remote.text||remote.text!==frozen.text)&&(!remote.html||remote.html!==frozen.html))throw new ContactError('Dit providerbericht hoort niet aantoonbaar bij deze aanvraag.',409);
  await connection.transaction(async db=>{
    const changed=await db.prepare("UPDATE contact_outbox SET state='provider_accepted',provider_id=?,error_code=NULL,claim_id=NULL,lease_until=NULL,updated_at=? WHERE id=? AND state=? RETURNING id").bind(input.providerId,Date.now(),task.id,task.state).first();
    if(!changed)throw new ContactError('De taak is intussen gewijzigd.',409);
    await db.prepare('INSERT INTO contact_admin_log(id,user_id,task_id,action,created_at) VALUES(?,?,?,?,?)').bind(randomUUID(),userId,task.id,'provider_message_matched',Date.now()).run();
  });
}
export async function recoverContactMail(connection:Pick<HubConnection,'transaction'>,userId:string,input:Record<string,unknown>,now=Date.now()) {
  if(typeof input.taskId!=='string'||input.taskId.length>60) throw new ContactError('Kies een verzendtaak.');
  return connection.transaction(async db=>{
    const task=await db.prepare('SELECT * FROM contact_outbox WHERE id=?').bind(input.taskId).first<OutboxTask>();
    if(!task) throw new ContactError('Verzendtaak niet gevonden.',404);
    if(task.state==='provider_accepted'||task.provider_id) throw new ContactError('Deze mail is al door de provider aangenomen. Hij wordt niet opnieuw verstuurd.',409);
    if(task.state==='processing'&&Number(task.lease_until)>now) throw new ContactError('Deze verzendtaak wordt al verwerkt.',409);
    const expired=task.first_attempt_at!==null&&now-Number(task.first_attempt_at)>=23*3600000;
    const manual=expired||task.state==='delivery_unknown'||task.state==='permanent_failed';
    if(input.action!=='retry'||(manual&&input.confirmedNotSent!==true)) throw new ContactError('Controleer eerst de providerlog en bevestig dat dit bericht niet is verstuurd.',409);
    const changed=await db.prepare("UPDATE contact_outbox SET state='pending',next_attempt_at=?,claim_id=NULL,lease_until=NULL,error_code=NULL,first_attempt_at=?,attempts=?,updated_at=? WHERE id=? AND state=? AND (lease_until IS NULL OR lease_until<=?) RETURNING id").bind(now,manual?null:task.first_attempt_at,manual?0:task.attempts,now,task.id,task.state,now).first();
    if(!changed) throw new ContactError('De status is intussen veranderd. Vernieuw het overzicht.',409);
    await db.prepare('INSERT INTO contact_admin_log(id,user_id,task_id,action,created_at) VALUES(?,?,?,?,?)').bind(randomUUID(),userId,task.id,manual?'provider_checked_not_sent':'retry_due',now).run();
    return task.inquiry_id;
  });
}
