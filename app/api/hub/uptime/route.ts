import {getHubRuntime} from '../../../../lib/hub/runtime';
import {hubJson} from '../../../../lib/hub/http';
import {ingestUptime} from '../../../../lib/hub/ingest';
import {UPTIME_MAX_BODY_BYTES} from '../../../../lib/hub/uptime';
export const runtime='nodejs';
export async function POST(request:Request){
  if(!process.env.HUB_UPTIME_SECRET)return hubJson({error:'Niet ingericht.'},503);
  const context=await getHubRuntime();if(!context)return hubJson({error:'Niet ingericht.'},503);
  try{
    const reader=request.body?.getReader();if(!reader)throw new Error();const chunks:Uint8Array[]=[];let size=0;
    try{while(true){const{done,value}=await reader.read();if(done)break;size+=value.length;if(size>UPTIME_MAX_BODY_BYTES){await reader.cancel();return hubJson({error:'Te groot.'},413);}chunks.push(value);}}finally{reader.releaseLock();}
    const rawBody=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));
    const sites=(await context.connection.db.prepare('SELECT id,origin FROM hub_sites').all<{id:string;origin:string}>()).results;
    const result=await ingestUptime(context.connection,{headers:request.headers,rawBody,secret:process.env.HUB_UPTIME_SECRET,allowedSites:sites.map(s=>({siteId:s.id,origin:s.origin}))});
    return hubJson(result);
  }catch{return hubJson({error:'Levering niet geaccepteerd.'},400);}
}
