import test from 'node:test';
import assert from 'node:assert/strict';
import {registerHooks,stripTypeScriptTypes} from 'node:module';
import {readFileSync} from 'node:fs';
import {randomBytes} from 'node:crypto';
import {getMigrations} from 'better-auth/db/migration';
import {sqliteHubConnection} from '../lib/hub/connection.ts';
import {hubSchema} from '../lib/hub/schema.ts';
import {createHubAuth} from '../lib/hub/auth.ts';
import {issueInvitation} from '../lib/hub/invitations.ts';

// Only the runtime factory is replaced. Real route handlers, sessions, authorization,
// body limits and SQLite transactions remain in use; no production storage or mail.
registerHooks({resolve(specifier,context,nextResolve){
  if(specifier==='server-only')return {url:'data:text/javascript,export{}',shortCircuit:true};
  if(['next/headers','next/navigation'].includes(specifier))return nextResolve(specifier+'.js',context);
  if((specifier==='./runtime'&&context.parentURL?.endsWith('/lib/hub/session.ts'))||specifier.endsWith('/lib/hub/runtime'))
    return {url:'data:text/javascript,export async function getHubRuntime(){return globalThis.__hubHttpFixtureRuntime??null}',shortCircuit:true};
  return nextResolve(specifier,context);
},load(url,context,nextLoad){
  // Next normally transforms parameter properties; the Node strip-only runner does not.
  if(url.endsWith('/lib/request-body.ts'))return {format:'module',source:stripTypeScriptTypes(readFileSync(new URL(url),'utf8'),{mode:'transform'}),shortCircuit:true};
  return nextLoad(url,context);
}});
const routes={
  manage:(await import('../app/api/hub/manage/route.ts')).POST,
  contactMail:(await import('../app/api/hub/contact-mail/route.ts')).POST,
  security:(await import('../app/api/hub/security/route.ts')).POST,
  invitation:(await import('../app/api/hub/accept-invitation/route.ts')).POST,
};
const baseURL='https://hub.example.test';

async function fixture(t){
  const connection=sqliteHubConnection(':memory:');await connection.executeSchema(hubSchema);
  const messages=[];
  const send=async message=>{messages.push(message);};
  const auth=createHubAuth(connection,{secret:randomBytes(32).toString('hex'),baseURL,send});
  await(await getMigrations(auth.options)).runMigrations();
  globalThis.__hubHttpFixtureRuntime={connection,auth,send,baseURL,local:true};
  t.after(async()=>{delete globalThis.__hubHttpFixtureRuntime;await connection.close();});
  async function authRequest(action,body,cookie='',extra={}){
    const response=await auth.handler(new Request(`${baseURL}/api/hub-auth/${action}`,{method:'POST',headers:{'Content-Type':'application/json',Origin:baseURL,Cookie:cookie,...extra},body:JSON.stringify(body)}));
    return {response,data:await response.json(),cookie:response.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ')};
  }
  const clients=[];
  for(const client of ['a','b']){
    await connection.db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind(client,`Synthetic client ${client}`,Date.now()).run();
    await connection.db.prepare('INSERT INTO hub_sites(id,client_id,name,origin,created_at) VALUES(?,?,?,?,?)').bind(`site-${client}`,client,`Private fixture ${client}`,`https://${client}.example.test`,Date.now()).run();
    const email=`client-${client}@example.test`,password='Synthetic-fixture-password-7296';
    const invitation=await issueInvitation(connection.db,email,client);
    const signup=await authRequest('sign-up/email',{email,password,name:`Fixture ${client}`},'',{'x-sitesnit-invitation':invitation});
    assert.equal(signup.response.status,200);
    await auth.handler(new Request(messages.at(-1).text.match(/https:\/\/\S+/)[0]));
    const login=await authRequest('sign-in/email',{email,password});assert.equal(login.response.status,200);
    const session=await auth.api.getSession({headers:new Headers({cookie:login.cookie})});
    clients.push({id:signup.data.user.id,email,cookie:login.cookie,sessionId:session.session.id});
  }
  return {connection,clients,messages,authRequest};
}
async function invoke(route,body,cookie='',origin=baseURL){
  const response=await routes[route](new Request(`${baseURL}/api/hub/${route}`,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin,Cookie:cookie},body:JSON.stringify(body)}));
  assert.match(response.headers.get('cache-control'),/private.*no-store/);
  assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
  return {status:response.status,data:await response.json()};
}

test('real Hub handlers deny anonymous, cross-origin and non-admin client requests without mail or writes',async t=>{
  const f=await fixture(t),mailBefore=f.messages.length;
  for(const [route,body] of [['manage',{action:'sync',siteId:'site-b'}],['contactMail',{action:'retry',taskId:'other:owner'}],['security',{action:'defer-mfa',acceptRisk:true}],['invitation',{token:'fixture'}]]){
    assert.equal((await invoke(route,body)).status,401,`${route}: anonymous`);
    for(const client of f.clients)assert.equal((await invoke(route,body,client.cookie,'https://foreign.example.test')).status,403,`${route}: wrong origin`);
  }
  for(const client of f.clients){
    assert.equal((await invoke('manage',{action:'sync',siteId:'site-b'},client.cookie)).status,400);
    assert.equal((await invoke('contactMail',{action:'retry',taskId:'other:owner'},client.cookie)).status,403);
  }
  assert.equal(f.messages.length,mailBefore);
  assert.equal((await f.connection.db.prepare('SELECT COUNT(*) AS n FROM hub_admin_log').first()).n,0);
  assert.equal((await f.connection.db.prepare('SELECT COUNT(*) AS n FROM hub_snapshots').first()).n,0);
});

test('real invitation handler binds access to the signed-in email; expired and revoked sessions are rejected',async t=>{
  const f=await fixture(t),[a,b]=f.clients;
  const token=await issueInvitation(f.connection.db,b.email,'a');
  assert.equal((await invoke('invitation',{token},a.cookie)).status,400,'another verified client cannot use this invitation');
  assert.equal((await f.connection.db.prepare('SELECT COUNT(*) AS n FROM hub_memberships WHERE user_id=?').bind(a.id).first()).n,1);
  assert.equal((await invoke('invitation',{token},b.cookie)).status,200,'the intended recipient can accept it');
  assert.equal((await invoke('invitation',{token},b.cookie)).status,400,'replay cannot add another grant');
  await f.connection.db.prepare('UPDATE hub_auth_session SET "expiresAt"=? WHERE id=?').bind(Date.now()-1000,a.sessionId).run();
  assert.equal((await invoke('security',{action:'defer-mfa',acceptRisk:true},a.cookie)).status,401);
  await f.authRequest('sign-out',{},b.cookie);
  assert.equal((await invoke('manage',{action:'sync',siteId:'site-a'},b.cookie)).status,401);
});
