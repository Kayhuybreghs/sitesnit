/** Real UI -> real contact POST -> isolated SQLite -> fake provider. Never live mail. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {randomUUID} from 'node:crypto';
import {createContactChainFixture} from './contact-chain-fixture.mjs';
const base=new URL(process.argv[2]||'http://127.0.0.1:5190');
assert.ok(base.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(base.hostname),'loopback HTTP only');
const profiles={'390':{width:390,height:844},'1440':{width:1440,height:900}},profile=process.argv[3]||'390';
assert.ok(Object.hasOwn(profiles,profile),'viewport must be 390 or 1440');
const output=resolve('reports/improvement/contact-privacy',`chain-${profile}`);mkdirSync(output,{recursive:true});
const report={startedAt:new Date().toISOString(),origin:base.origin,viewport:profiles[profile],checks:[],limitations:['Production-built UI and actual POST handler are exercised, but the browser request is bridged to an in-process handler. SQLite is in memory and provider responses are synthetic. This does not prove Vercel transport, production database or email delivery.']};
report.buildId=readFileSync('.next/BUILD_ID','utf8').trim();
const require=createRequire(import.meta.url),{chromium}=require('C:/Users/Gebruiker/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const f=await createContactChainFixture(base.origin);
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const context=await browser.newContext({viewport:profiles[profile]});const bodies=[],errors=[];let loseFirstResponse=true;
try{
  await context.addInitScript(()=>localStorage.setItem('sitesnit-cookie-consent-v1',JSON.stringify({version:1,analytics:false,decidedAt:Date.now(),measurementId:'G-FIXTURE123'})));
  await context.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin!==base.origin)return route.abort();
    if(url.pathname!=='/api/contact')return route.continue();
    const raw=request.postData();bodies.push(raw);
    const response=await f.post(raw,{origin:request.headers().origin||base.origin});
    const body=await response.text();
    if(response.ok&&loseFirstResponse){loseFirstResponse=false;return route.abort('connectionreset');}
    return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body});
  });
  const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base.origin+'/contact?dienst=seo-optimalisatie',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>{const button=document.querySelector('.contact-form button[type="submit"]');return button&&!button.disabled;});
  await page.getByRole('button',{name:'Verstuur je aanvraag'}).click();assert.equal(bodies.length,0);
  await page.getByLabel('Je naam',{exact:true}).fill('Synthetic contact chain');
  await page.getByLabel('Je e-mailadres',{exact:true}).fill('chain-visitor@example.invalid');
  await page.getByLabel('Vertel kort over je plannen').fill('Een volledige geïsoleerde ketenproef zonder echte e-mail.');
  await page.getByRole('button',{name:'Verstuur je aanvraag'}).click();
  await page.getByRole('alert').filter({hasText:'De verbinding is onderbroken'}).waitFor();
  assert.equal(bodies.length,1);assert.equal(f.mail.length,2);
  await page.screenshot({path:resolve(output,'lost-response.png'),fullPage:true});
  await page.reload({waitUntil:'networkidle'});
  await page.getByRole('button',{name:'Controleer en probeer opnieuw'}).waitFor();
  assert.equal(await page.getByLabel('Je naam',{exact:true}).inputValue(),'Synthetic contact chain');
  assert.equal(await page.getByLabel('Vertel kort over je plannen').isDisabled(),true);
  await page.getByRole('button',{name:'Controleer en probeer opnieuw'}).click();
  await page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
  assert.equal(bodies.length,2);assert.equal(bodies[0],bodies[1]);assert.equal(f.mail.length,2);
  await page.screenshot({path:resolve(output,'confirmed.png'),fullPage:true});
  let state=await f.summary();assert.equal(state.inquiries.length,1);assert.equal(state.tasks.length,2);
  assert.ok(state.tasks.every(task=>task.state==='provider_accepted'));
  assert.equal(state.tasks.find(task=>task.kind==='owner').payload.to,'contact@sitesnit.nl');
  assert.equal(state.tasks.find(task=>task.kind==='confirmation').payload.to,'chain-visitor@example.invalid');
  report.checks.push({name:'real UI submission, lost response, reload and exact retry produce one stored inquiry and two intended provider accepts',status:'passed'});
  const invalid={requestId:randomUUID(),name:'Synthetic invalid input',email:'invalid',message:'Invalid server-side input fixture.',sourcePage:'/contact'};
  const invalidStatus=await page.evaluate(async payload=>{const result=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});return result.status;},invalid);
  assert.equal(invalidStatus,400);state=await f.summary();assert.equal(state.inquiries.length,1);assert.equal(state.tasks.length,2);assert.equal(f.mail.length,2);
  assert.deepEqual(errors,[]);
  report.checks.push({name:'native empty form does not submit; browser-injected invalid input is rejected by real handler without persistence or mail',status:'passed'});
  report.outcome={inquiries:state.inquiries.length,tasks:state.tasks.map(task=>({kind:task.kind,state:task.state,recipient:task.payload.to})),providerRequests:f.mail.length};
  report.status='passed';
}catch(error){report.status='failed';report.error=error.stack;throw error;}
finally{report.completedAt=new Date().toISOString();writeFileSync(resolve(output,'browser-chain.json'),JSON.stringify(report,null,2)+'\n');await context.close();await browser.close();await f.close();}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,report:resolve(output,'browser-chain.json')}));
