import { json, readJson, rateLimit, RequestBodyError } from '../../../lib/server';
import { ContactError, parseContact } from '../../../lib/contact/input';
import { contactConnection, contactMailConfig } from '../../../lib/contact/runtime';
import { saveContact, drainContactOutbox, contactMailStatus } from '../../../lib/contact/store';

export const runtime='nodejs';
export const maxDuration=30;
export async function POST(request:Request){
  let requestId:string|undefined;
  try {
    const input=parseContact(await readJson(request,64000));
    requestId=input.id;
    if(!await rateLimit(request,'contact',8,600)) return json({error:'Je hebt meerdere aanvragen kort achter elkaar gedaan. Probeer het over enkele minuten opnieuw.'},429);
    const connection=await contactConnection(),config=contactMailConfig();
    const saved=await saveContact(connection,input,config.from,process.env.RATE_LIMIT_SECRET||(!process.env.VERCEL?'local-contact-test':''));
    try {await drainContactOutbox(connection,config,{inquiryId:input.id});}
    catch {console.error('Contact mail processing interrupted; durable task retained.',{requestId:input.id});}
    let mail:Record<string,string>={owner:'pending',confirmation:'pending'};
    try {mail=await contactMailStatus(connection.db,input.id);} catch { /* Storage is already confirmed. */ }
    const localOnly=!process.env.VERCEL&&process.env.SITESNIT_LOCAL_SQLITE==='true';
    return json({ok:true,...saved,mail,localOnly});
  } catch(error){
    if(error instanceof RequestBodyError||error instanceof ContactError) return json({error:error.message,...(error instanceof ContactError&&error.code?{code:error.code}:{})},error.status);
    console.error('Contact storage not confirmed',{requestId});
    return json({error:'We konden de opslag niet bevestigen. Je invoer blijft staan. Probeer dezelfde aanvraag opnieuw; deze wordt niet dubbel opgeslagen.'},503);
  }
}
