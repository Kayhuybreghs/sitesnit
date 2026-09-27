import { Webhook } from 'svix';
import type { HubConnection } from '../hub/connection';
const states:Record<string,string>={'email.delivered':'delivered','email.delivery_delayed':'delayed','email.bounced':'bounced','email.complained':'complained','email.failed':'failed'};
export async function recordContactWebhook(connection:Pick<HubConnection,'transaction'>,raw:string,headers:Headers,secret:string,now=Date.now()) {
  const id=headers.get('svix-id')||'',timestamp=headers.get('svix-timestamp')||'',signature=headers.get('svix-signature')||'';
  if(!id||id.length>200) throw new Error('Invalid webhook');
  new Webhook(secret).verify(raw,{'svix-id':id,'svix-timestamp':timestamp,'svix-signature':signature});
  const payload=JSON.parse(raw) as {type?:string;created_at?:string;data?:{email_id?:string}};
  const state=states[payload.type||''];
  if(!state) return {ignored:true};
  const at=Date.parse(payload.created_at||'');
  if(!Number.isFinite(at)||typeof payload.data?.email_id!=='string') throw new Error('Invalid webhook');
  return connection.transaction(async db=>{
    const task=await db.prepare('SELECT id FROM contact_outbox WHERE provider_id=?').bind(payload.data!.email_id).first<{id:string}>();
    // Keep only the delivery facts, including events racing the send response.
    const inserted=await db.prepare('INSERT INTO contact_webhook_events(id,provider_id,delivery_state,event_at,received_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING RETURNING id').bind(id,payload.data!.email_id,state,at,now).first();
    if(!inserted) return {duplicate:true};
    if(!task) return {pendingMatch:true};
    await db.prepare("UPDATE contact_outbox SET delivery_state=?,delivery_at=?,updated_at=? WHERE id=? AND (delivery_at IS NULL OR delivery_at<?) AND (delivery_state IS NULL OR delivery_state NOT IN ('bounced','complained','failed'))").bind(state,at,now,task.id,at).run();
    return {recorded:true};
  });
}
