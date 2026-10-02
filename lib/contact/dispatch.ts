import {authorizedMaintenance} from '../retention';
import {recordContactHeartbeat} from './health';
import {drainContactOutbox} from './store';
import type {HubConnection} from '../hub/connection';
import type {MailConfig} from './store';

/** Dedicated bounded retry batch. No cleanup, target URL, recipient or payload from the caller. */
export async function dispatchContactResponse(request:Request, dependencies:{secret:string|undefined;config:MailConfig;connection:()=>Promise<Pick<HubConnection,'db'|'transaction'>>;transport?:typeof fetch;now?:number}) {
  const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
  if(!authorizedMaintenance(request,dependencies.secret))return Response.json({error:'Niet toegestaan.'},{status:401,headers});
  if(!dependencies.config.enabled||!dependencies.config.apiKey||!dependencies.config.from)return Response.json({error:'Mailverwerking niet ingesteld.'},{status:503,headers});
  try{
    const connection=await dependencies.connection();
    const processed=await drainContactOutbox(connection,dependencies.config,{limit:4,request:dependencies.transport,now:dependencies.now});
    await recordContactHeartbeat(connection.db,dependencies.now);
    return Response.json({ok:true,processed,limit:4},{headers});
  }catch{return Response.json({error:'Mailverwerking niet afgerond.'},{status:503,headers});}
}
