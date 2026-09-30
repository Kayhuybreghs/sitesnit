/** Isolated real contact-handler fixture. No production database or outbound network. */
import assert from 'node:assert/strict';
import {registerHooks,stripTypeScriptTypes} from 'node:module';
import {readFileSync} from 'node:fs';
import {sqliteHubConnection} from '../lib/hub/connection.ts';
import {sqliteSchema} from '../lib/database-schema.ts';
import {contactSchema} from '../lib/contact/schema.ts';
registerHooks({resolve(specifier,context,nextResolve){
  if(specifier==='server-only')return {url:'data:text/javascript,export{}',shortCircuit:true};
  if(specifier.endsWith('/lib/contact/runtime'))return {url:'data:text/javascript,export async function contactConnection(){return globalThis.__contactChainFixture.connection} export function contactMailConfig(){return globalThis.__contactChainFixture.config}',shortCircuit:true};
  if(specifier==='./runtime'&&context.parentURL?.endsWith('/lib/server.ts'))return {url:'data:text/javascript,export function runtime(){return {DB:globalThis.__contactChainFixture.connection.db,RATE_LIMIT_SECRET:"isolated-contact-fixture"}}',shortCircuit:true};
  return nextResolve(specifier,context);
},load(url,context,nextLoad){
  if(url.endsWith('/lib/request-body.ts'))return {format:'module',source:stripTypeScriptTypes(readFileSync(new URL(url),'utf8'),{mode:'transform'}),shortCircuit:true};
  return nextLoad(url,context);
}});
const {POST}=await import('../app/api/contact/route.ts');
export async function createContactChainFixture(origin='http://127.0.0.1:5190'){
  const target=new URL(origin);
  assert.ok(target.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(target.hostname),'fixture origin must be loopback HTTP');
  assert.equal(Boolean(process.env.VERCEL),false,'never run the fixture in a deployment');
  assert.equal(globalThis.__contactChainFixture,undefined,'run fixtures serially');
  const connection=sqliteHubConnection(':memory:');await connection.executeSchema(sqliteSchema+contactSchema);
  const config={enabled:true,apiKey:'fixture-only-no-real-provider-key',from:'Sitesnit <contact@sitesnit.nl>'};
  const mail=[];const originalFetch=globalThis.fetch;
  const previous={RATE_LIMIT_SECRET:process.env.RATE_LIMIT_SECRET,SITESNIT_LOCAL_SQLITE:process.env.SITESNIT_LOCAL_SQLITE};
  process.env.RATE_LIMIT_SECRET='isolated-contact-fixture';process.env.SITESNIT_LOCAL_SQLITE='false';
  globalThis.__contactChainFixture={connection,config};
  globalThis.fetch=async(url,init)=>{
    assert.equal(String(url),'https://api.resend.com/emails','unexpected outbound request blocked');
    assert.equal(init.headers.Authorization,`Bearer ${config.apiKey}`);
    mail.push({body:init.body,key:init.headers['Idempotency-Key'],payload:JSON.parse(init.body)});
    return Response.json({id:`isolated-provider-${mail.length}`});
  };
  return {connection,mail,async post(raw,{origin=target.origin,headers={}}={}){
    return POST(new Request(target.origin+'/api/contact',{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...headers},body:raw}));
  },async summary(){
    const inquiries=(await connection.db.prepare('SELECT id,email FROM inquiries').all()).results;
    const tasks=(await connection.db.prepare('SELECT inquiry_id,kind,state,payload_json FROM contact_outbox ORDER BY kind').all()).results;
    return {inquiries,tasks:tasks.map(task=>({...task,payload:JSON.parse(task.payload_json)}))};
  },async close(){globalThis.fetch=originalFetch;delete globalThis.__contactChainFixture;for(const [key,value] of Object.entries(previous)){if(value===undefined)delete process.env[key];else process.env[key]=value;}await connection.close();}};
}
