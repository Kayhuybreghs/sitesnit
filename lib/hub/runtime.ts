import {postgresUrl} from '../database-postgres';
import 'server-only';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {createHubAuth} from './auth';
import {postgresHubConnection,sqliteHubConnection} from './connection';
import {resendSender} from './mail';

async function createRuntime(){
  const isVercel=Boolean(process.env.VERCEL);
  let secret=process.env.HUB_AUTH_SECRET;
  let local=false;
  if(!isVercel){
    try{const config=JSON.parse(await readFile(path.resolve('.sites-runtime/hub-local.json'),'utf8'));if(config.enabled===true&&typeof config.secret==='string'){local=true;secret=config.secret;}}catch{/* Explicit local initialization has not happened. */}
  }
  if(!local&&process.env.HUB_ENABLED!=='true')return null;
  const databaseUrl=postgresUrl(process.env);
  const baseURL=local?'http://127.0.0.1:5184':process.env.HUB_AUTH_URL;
  if(!secret||secret.length<32||!baseURL||(!local&&(!databaseUrl||!/^https:\/\//.test(baseURL))))return null;
  const connection=local?sqliteHubConnection(path.resolve('.sites-runtime/storage/hub.sqlite')):postgresHubConnection(databaseUrl!);
  const send=resendSender(connection,{enabled:process.env.HUB_EMAIL_ENABLED==='true',apiKey:process.env.RESEND_API_KEY,from:process.env.HUB_EMAIL_FROM});
  const auth=createHubAuth(connection,{secret,baseURL,send});
  return{connection,auth,send,baseURL,local};
}
export type HubRuntime=NonNullable<Awaited<ReturnType<typeof createRuntime>>>;
let instance:Promise<Awaited<ReturnType<typeof createRuntime>>>|undefined;
export function getHubRuntime(){return instance??=(createRuntime().catch(()=>{instance=undefined;return null;}));}
