import {browserType,launchOptions} from './browser-runtime.mjs';
/** Frozen Next build + separate synthetic databases. No original runtime storage or live APIs. */
import assert from 'node:assert/strict';
import {cpSync,copyFileSync,mkdirSync,readFileSync,symlinkSync,writeFileSync} from 'node:fs';
import {resolve,join,relative,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomBytes,createHmac} from 'node:crypto';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {getMigrations} from 'better-auth/db/migration';
import {sqliteHubConnection} from '../lib/hub/connection.ts';
import {hubSchema} from '../lib/hub/schema.ts';
import {createHubAuth} from '../lib/hub/auth.ts';
import {issueInvitation} from '../lib/hub/invitations.ts';
import {sqliteSchema} from '../lib/database-schema.ts';
import {contactSchema} from '../lib/contact/schema.ts';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const width=Number(process.argv.find(value=>value.startsWith('--width='))?.split('=')[1]||1440);
assert.ok([390,1440].includes(width),'Only the documented viewports are supported.');
assert.equal(Boolean(process.env.VERCEL),false,'Never run inside a deployment.');
const expected=process.argv.find(value=>value.startsWith('--build='))?.slice(8);
const buildId=readFileSync(join(root,'.next/BUILD_ID'),'utf8').trim();
if(expected)assert.equal(buildId,expected,'The frozen build changed.');
const fixtureBase=join(root,'.sites-runtime/hub-browser-fixtures');
const fixture=join(fixtureBase,`run-${Date.now()}-${randomBytes(4).toString('hex')}`);
assert.ok(relative(fixtureBase,fixture)&&!relative(fixtureBase,fixture).startsWith('..'+sep));
mkdirSync(join(fixture,'.sites-runtime/storage'),{recursive:true});
writeFileSync(join(fixture,'ISOLATED_FIXTURE.txt'),'Synthetic test data only. Separate copy of the Next build; original storage is never used.\n');
// Copy instead of linking .next: runtime caches must not write into the frozen build.
cpSync(join(root,'.next'),join(fixture,'.next'),{recursive:true,filter:source=>{
  const part=relative(join(root,'.next'),source).split(sep)[0];
  return !['cache','dev','diagnostics','types','trace','trace-build'].includes(part);
}});
for(const name of ['node_modules','public'])symlinkSync(join(root,name),join(fixture,name),'junction');
for(const name of ['package.json','next.config.ts'])copyFileSync(join(root,name),join(fixture,name));
mkdirSync(join(fixture,'lib'));copyFileSync(join(root,'lib/tool-routes.ts'),join(fixture,'lib/tool-routes.ts'));
const secret=randomBytes(32).toString('hex');
writeFileSync(join(fixture,'.sites-runtime/hub-local.json'),JSON.stringify({enabled:true,secret}));
const output=resolve(root,process.env.BROWSER_REPORT_ROOT || 'reports/improvement','contact-privacy',`hub-${width}`);mkdirSync(output,{recursive:true});
const report={startedAt:new Date().toISOString(),buildId,viewport:{width,height:width===390?844:900},checks:[],
  isolation:{build:'Separate copy; shared build is not mutated',storage:'Two new SQLite files below a fresh fixture directory',mail:'Disabled in server; account verification messages captured only in memory',providers:'No external credentials; browser and server fetch deny external destinations'},
  limitations:['Real production-built SSR and browser history are tested with synthetic accounts. Sessions are created through real Better Auth in the fixture, not through the browser login UI. No production transport, provider delivery or live client data is tested.','This is Chromium/Edge history coverage, not a physical Safari or all-browser BFCache certification.']};
const persist=()=>writeFileSync(join(output,'browser-hub.json'),JSON.stringify(report,null,2)+'\n');
persist();
const hub=sqliteHubConnection(join(fixture,'.sites-runtime/storage/hub.sqlite'));
const contacts=sqliteHubConnection(join(fixture,'.sites-runtime/storage/sitesnit.sqlite'));
let server,browser;const contexts=[];let serverLog='';
const syntheticPassword='Isolated-fixture-password-2026';
// The current local runtime deliberately fixes this auth origin. Session cookies
// remain host-bound; the isolated HTTP server uses another free loopback port.
const authOrigin='http://127.0.0.1:5184';
const messages=[];const auth=createHubAuth(hub,{secret,baseURL:authOrigin,send:async message=>messages.push(message)});
function mergeCookies(...headers){const values=new Map();for(const header of headers)for(const entry of header.split('; ')){const at=entry.indexOf('=');if(at>0)values.set(entry.slice(0,at),entry.slice(at+1));}return [...values].map(([key,value])=>`${key}=${value}`).join('; ');}
async function authRequest(action,body,cookie='',extra={}){
  const result=await auth.handler(new Request(authOrigin+'/api/hub-auth/'+action,{method:'POST',headers:{'Content-Type':'application/json',Origin:authOrigin,Cookie:cookie,...extra},body:JSON.stringify(body)}));
  assert.equal(result.status,200,`Synthetic auth action failed: ${action}`);
  return {data:await result.json(),cookie:result.headers.getSetCookie().map(value=>value.split(';')[0]).join('; ')};
}
function totp(uri){let bits='';for(const c of new URL(uri).searchParams.get('secret').replace(/=/g,''))bits+='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c).toString(2).padStart(5,'0');const bytes=[];for(let i=0;i+8<=bits.length;i+=8)bytes.push(parseInt(bits.slice(i,i+8),2));const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const digest=createHmac('sha1',Buffer.from(bytes)).update(counter).digest();return String((digest.readUInt32BE(digest[19]&15)&0x7fffffff)%1000000).padStart(6,'0');}
async function account(id,admin=false){
  const email=`hub-browser-${id}@example.invalid`,invitation=await issueInvitation(hub.db,email,admin?null:id,admin?'admin':'client');
  const signed=await authRequest('sign-up/email',{email,password:syntheticPassword,name:`Synthetic ${id}`},'',{'x-sitesnit-invitation':invitation});
  const url=messages.at(-1).text.match(/http:\/\/\S+/)?.[0];assert.ok(url,'Synthetic verification URL missing');
  const verified=await auth.handler(new Request(url));assert.ok([200,302].includes(verified.status));
  let login=await authRequest('sign-in/email',{email,password:syntheticPassword});
  if(admin){const enrollment=await authRequest('two-factor/enable',{password:syntheticPassword},login.cookie);login=await authRequest('two-factor/verify-totp',{code:totp(enrollment.data.totpURI)},mergeCookies(login.cookie,enrollment.cookie));}
  const session=await auth.api.getSession({headers:new Headers({Cookie:login.cookie})});assert.ok(session?.user.emailVerified);
  return {id:signed.data.user.id,cookie:login.cookie,sessionId:session.session.id};
}
async function check(name,work){try{const details=await work();report.checks.push({name,status:'passed',...(details?{details}:{})});}catch(error){report.checks.push({name,status:'failed',error:error.message});}persist();}
function assertPrivate(response){assert.ok(response,'Expected a fresh document response');assert.match(response.headers()['cache-control']||'',/private.*no-store/);assert.equal(response.headers()['x-robots-tag'],'noindex, nofollow');}
try{
  await hub.executeSchema(hubSchema);await contacts.executeSchema(sqliteSchema+contactSchema);await(await getMigrations(auth.options)).runMigrations();
  const now=Date.now();
  for(const id of ['a','b']){
    await hub.db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind(id,`Synthetic client ${id}`,now).run();
    await hub.db.prepare('INSERT INTO hub_sites(id,client_id,name,origin,created_at) VALUES(?,?,?,?,?)').bind(`site-${id}`,id,`PRIVATE-SITE-${id.toUpperCase()}`,`https://${id}.example.invalid`,now).run();
    await hub.db.prepare('INSERT INTO hub_work_items(id,site_id,title,detail,status,evidence,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(`work-${id}`,`site-${id}`,`PRIVATE-WORK-${id.toUpperCase()}`,`PRIVATE-DETAIL-${id.toUpperCase()}`,'open','Synthetic fixture evidence',now,now).run();
    await hub.db.prepare('INSERT INTO hub_monthly_reports(site_id,month,summary,created_at) VALUES(?,?,?,?)').bind(`site-${id}`,'2026-08',`PRIVATE-REPORT-${id.toUpperCase()}`,now).run();
  }
  const identities={a:await account('a'),b:await account('b'),admin:await account('admin',true)};
  // One old unresolved request behind 105 newer accepted requests. Two tasks each.
  for(let i=0;i<106;i++){
    const id=`hub-fixture-request-${String(i).padStart(3,'0')}`,created=now-86400000+i*1000;
    await contacts.db.prepare('INSERT INTO inquiries(id,name,email,message,created_at) VALUES(?,?,?,?,?)').bind(id,i===0?'OLD-REQUEST-NEEDS-REVIEW':`Recent request ${i}`,'synthetic@example.invalid',i===0?'OLD-REQUEST-PRIVATE-CONTEXT':'Synthetic request context',created).run();
    await contacts.db.prepare('INSERT INTO contact_requests(inquiry_id,payload_hash,context_json) VALUES(?,?,?)').bind(id,'synthetic-hash',JSON.stringify({serviceId:'seo-optimalisatie',phone:'',appointment:false})).run();
    for(const kind of ['owner','confirmation'])await contacts.db.prepare('INSERT INTO contact_outbox(id,inquiry_id,kind,payload_json,state,attempts,next_attempt_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)').bind(`${id}:${kind}`,id,kind,'{}',i===0?'delivery_unknown':'provider_accepted',1,created,created,created).run();
  }
  const port=await new Promise((resolvePort,reject)=>{const socket=createServer();socket.once('error',reject);socket.listen(0,'127.0.0.1',()=>{const value=socket.address().port;socket.close(()=>resolvePort(value));});});
  const origin=`http://127.0.0.1:${port}`;report.origin=origin;
  // Node fetch is denied for every non-loopback destination in this child only.
  writeFileSync(join(fixture,'fixture-network.cjs'),`const originalFetch=globalThis.fetch;globalThis.fetch=(input,init)=>{const u=new URL(typeof input==='string'||input instanceof URL?input:input.url);if(!['127.0.0.1','localhost','[::1]'].includes(u.hostname))throw new Error('Isolated Hub fixture blocked outbound fetch');return originalFetch(input,init);};\n`);
  const env={};for(const key of ['PATH','Path','SystemRoot','SYSTEMROOT','WINDIR','TEMP','TMP','USERPROFILE','COMSPEC'])if(process.env[key])env[key]=process.env[key];
  Object.assign(env,{NODE_ENV:'production',NEXT_TELEMETRY_DISABLED:'1',HUB_ENABLED:'false',HUB_EMAIL_ENABLED:'false',CONTACT_EMAIL_ENABLED:'false',SITESNIT_LOCAL_SQLITE:'true',RATE_LIMIT_SECRET:'isolated-hub-browser-rate-limit-2026',GA4_MEASUREMENT_ID:'',GA4_PRIVACY_CONFIGURED:'false'});
  server=spawn(process.execPath,['--require',join(root,'scripts/fixture-network.cjs'),'--require',join(fixture,'fixture-network.cjs'),join(root,'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port',String(port)],{cwd:fixture,env,windowsHide:true,stdio:['ignore','pipe','pipe']});
  for(const stream of [server.stdout,server.stderr])stream.on('data',chunk=>{serverLog+=chunk.toString();});
  for(let attempt=0;attempt<80;attempt++){
    if(server.exitCode!==null)throw new Error(`Isolated server exited: ${server.exitCode}`);
    try{if((await fetch(origin+'/hub/login',{signal:AbortSignal.timeout(1200)})).ok)break;}catch{}
    if(attempt===79)throw new Error('Isolated server readiness timed out');
    await new Promise(done=>setTimeout(done,250));
  }
  // --http-only prepares and lightly verifies without ever launching a browser.
  if(process.argv.includes('--http-only')){
    const response=await fetch(origin+'/hub/site/site-a',{headers:{Cookie:identities.a.cookie}});assert.equal(response.status,200);const html=await response.text();assert.ok(html.includes('PRIVATE-SITE-A'));assert.ok(!html.includes('PRIVATE-SITE-B'));
    report.checks.push({name:'Isolated server reads only its synthetic SQLite runtime',status:'passed'});
    report.status='prepared';
  }else{
    
    browser=await browserType.launch(launchOptions);
    const pages={};
    for(const id of ['anonymous','a','b','admin']){
      const context=await browser.newContext({viewport:report.viewport});contexts.push(context);
      await context.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
      if(id!=='anonymous')await context.addCookies(identities[id].cookie.split('; ').map(entry=>{const at=entry.indexOf('=');return {name:entry.slice(0,at),value:entry.slice(at+1),url:origin,httpOnly:true,sameSite:'Lax'};}));
      pages[id]=await context.newPage();pages[id].setDefaultTimeout(15000);
    }
    const visit=async(page,path)=>{const response=await page.goto(origin+path,{waitUntil:'networkidle'});assertPrivate(response);return response;};
    await check('Anonymous direct private URLs redirect to login without private content',async()=>{
      for(const path of ['/hub','/hub/admin','/hub/admin/aanvragen','/hub/site/site-a']){await visit(pages.anonymous,path);assert.equal(new URL(pages.anonymous.url()).pathname,'/hub/login');assert.ok(!(await pages.anonymous.content()).includes('PRIVATE-WORK-A'));}
    });
    for(const [id,other] of [['a','b'],['b','a']])await check(`Client ${id}: all five authorized sections, foreign direct URLs and admin URLs stay isolated`,async()=>{
      const page=pages[id];await visit(page,'/hub');let html=await page.content();assert.ok(html.includes(`PRIVATE-SITE-${id.toUpperCase()}`));assert.ok(!html.includes(`PRIVATE-SITE-${other.toUpperCase()}`));
      for(const suffix of ['','/bezoekers','/google','/status','/werkzaamheden']){
        await visit(page,`/hub/site/site-${id}${suffix}`);assert.equal(await page.locator('.hub-dashboard').count(),1);html=await page.content();assert.ok(!html.includes(`PRIVATE-SITE-${other.toUpperCase()}`));assert.ok(!html.includes(`PRIVATE-WORK-${other.toUpperCase()}`));
        if(suffix===''||suffix==='/werkzaamheden')assert.ok(html.includes(`PRIVATE-REPORT-${id.toUpperCase()}`));
      }
      for(const path of [`/hub/site/site-${other}`,`/hub/site/site-${other}/werkzaamheden`,`/hub/site/site-${other}?preview=1`,'/hub/admin','/hub/admin/aanvragen']){await visit(page,path);assert.equal(await page.locator('.hub-dashboard').count(),0);html=await page.content();assert.ok(!html.includes(`PRIVATE-WORK-${other.toUpperCase()}`));assert.ok(!html.includes('OLD-REQUEST-PRIVATE-CONTEXT'));assert.equal(await page.getByRole('heading',{name:'Aanvragen & mailstatus',exact:true}).count(),0);}
    });
    await check('MFA-authenticated admin can view both clients and the own Sitesnit dossier',async()=>{
      const page=pages.admin;await visit(page,'/hub');const html=await page.content();for(const label of ['PRIVATE-SITE-A','PRIVATE-SITE-B','sitesnit-own'])assert.ok(html.includes(label));
      for(const id of ['a','b']){await visit(page,`/hub/site/site-${id}?preview=1`);assert.ok((await page.content()).includes(`PRIVATE-WORK-${id.toUpperCase()}`));assert.equal(await page.getByRole('navigation',{name:'Beheerdersnavigatie'}).count(),1);}
      await page.screenshot({path:join(output,'admin-site.png'),fullPage:true});
    });
    await check('Admin queue shows old unresolved request beyond 105 newer requests and separate mail statuses',async()=>{
      const page=pages.admin;await visit(page,'/hub/admin/aanvragen');await page.getByRole('heading',{name:'Aanvragen & mailstatus',exact:true}).waitFor();
      const articles=page.locator('article.context-box');assert.equal(await articles.count(),50);assert.equal(await articles.first().locator('h2').innerText(),'OLD-REQUEST-NEEDS-REVIEW');
      assert.match(await page.locator('section[aria-labelledby="contact-operations"]').innerText(),/2 taken voor handmatige controle/);
      await articles.first().getByText('Aanvraag bekijken',{exact:true}).click();assert.ok((await articles.first().innerText()).includes('OLD-REQUEST-PRIVATE-CONTEXT'));
      assert.equal(await articles.first().getByRole('heading',{level:3}).count(),2);
      await articles.first().scrollIntoViewIfNeeded();await page.screenshot({path:join(output,'admin-old-request.png')});
      return {storedRequests:106,storedMailTasks:212,visibleRequests:50,oldestUnresolvedFirst:true};
    });
    await check('Revoked membership disappears on direct request and back/forward navigation',async()=>{
      const page=pages.a;await visit(page,'/hub/site/site-a');assert.ok((await page.content()).includes('PRIVATE-WORK-A'));
      await page.getByRole('navigation',{name:'Onderdelen van je websiteoverzicht'}).getByRole('link',{name:'Bezoekers',exact:true}).click();await page.waitForURL('**/hub/site/site-a/bezoekers');await page.waitForLoadState('networkidle');
      await hub.db.prepare('DELETE FROM hub_memberships WHERE user_id=?').bind(identities.a.id).run();
      await page.goBack({waitUntil:'networkidle'});await page.waitForTimeout(300);assert.equal(await page.locator('.hub-dashboard').count(),0,'Back restored a private dossier after membership revocation');assert.ok(!(await page.content()).includes('PRIVATE-WORK-A'));
      await page.goForward({waitUntil:'networkidle'});await page.waitForTimeout(300);assert.equal(await page.locator('.hub-dashboard').count(),0,'Forward restored a private dossier after membership revocation');
      await visit(page,'/hub/site/site-a/werkzaamheden');assert.ok(!(await page.content()).includes('PRIVATE-WORK-A'));await visit(page,'/hub');assert.ok(!(await page.content()).includes('PRIVATE-SITE-A'));
      await page.screenshot({path:join(output,'revoked-membership.png'),fullPage:true});
    });
    await check('Revoked session cannot retrieve its former site or restore it through browser history',async()=>{
      const page=pages.b;await visit(page,'/hub/site/site-b');await page.getByRole('navigation',{name:'Onderdelen van je websiteoverzicht'}).getByRole('link',{name:'Status',exact:true}).click();await page.waitForURL('**/hub/site/site-b/status');await page.waitForLoadState('networkidle');
      await hub.db.prepare('DELETE FROM hub_auth_session WHERE id=?').bind(identities.b.sessionId).run();
      await page.goBack({waitUntil:'networkidle'});await page.waitForTimeout(300);assert.equal(new URL(page.url()).pathname,'/hub/login');assert.ok(!(await page.content()).includes('PRIVATE-WORK-B'));
      await visit(page,'/hub/site/site-b');assert.equal(new URL(page.url()).pathname,'/hub/login');
    });
    report.status=report.checks.every(item=>item.status==='passed')?'passed':'failed';
  }
}catch(error){report.status='failed';report.error=error.message;}
finally{
  for(const context of contexts)await context.close().catch(()=>{});await browser?.close().catch(()=>{});
  if(server){server.kill();await Promise.race([new Promise(done=>server.once('exit',done)),new Promise(done=>setTimeout(done,2000))]);}
  await hub.close();await contacts.close();
  report.completedAt=new Date().toISOString();report.fixtureDirectory=relative(root,fixture);persist();writeFileSync(join(output,'isolated-server.log'),serverLog);
  assert.equal(readFileSync(join(root,'.next/BUILD_ID'),'utf8').trim(),buildId,'Shared build changed during the fixture.');
}
console.log(JSON.stringify({status:report.status,passed:report.checks.filter(item=>item.status==='passed').length,failed:report.checks.filter(item=>item.status==='failed').length,report:join(output,'browser-hub.json')}));
if(report.status==='failed')process.exitCode=1;
