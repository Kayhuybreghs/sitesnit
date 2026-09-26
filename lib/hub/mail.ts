import {createHash} from 'node:crypto';
import type {HubConnection} from './connection';
export type HubMail={to:string;subject:string;text:string;html?:string};
export type MailSender=(mail:HubMail)=>Promise<void>;
/** Reserves under the free account caps, including failures. No automatic paid overage. */
export function resendSender(connection:HubConnection,config:{apiKey?:string;from?:string;enabled:boolean},request:typeof fetch=fetch):MailSender{
  return async mail=>{
    if(!config.enabled||!config.apiKey||!config.from)throw new Error('E-mailverzending is nog niet ingericht.');
    await connection.transaction(async db=>{
      const date=new Date().toISOString();
      for(const [period,limit] of [[date.slice(0,10),90],[date.slice(0,7),2800]] as const){
        const row=await db.prepare('INSERT INTO hub_mail_usage(period,count) VALUES(?,1) ON CONFLICT(period) DO UPDATE SET count=hub_mail_usage.count+1 WHERE hub_mail_usage.count<? RETURNING count').bind(period,limit).first();
        if(!row)throw new Error('De beschikbare mailruimte is bereikt.');
      }
    });
    const id=createHash('sha256').update(JSON.stringify(mail)).digest('hex');
    const result=await request('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${config.apiKey}`,'Content-Type':'application/json','Idempotency-Key':`hub-${id}`},body:JSON.stringify({...mail,from:config.from}),signal:AbortSignal.timeout(10000)});
    if(!result.ok)throw new Error('E-mailverzending is tijdelijk niet beschikbaar.');
    const data:unknown=await result.json();if(!data||typeof data!=='object'||!('id' in data)||typeof data.id!=='string')throw new Error('Afleverbevestiging ontbreekt.');
  };
}
