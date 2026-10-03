/** R01b: real browser form + real contact handler, isolated memory DB and captured mail. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {browserType,launchOptions,browserLabel} from './browser-runtime.mjs';
import {richSpeedStates,contactPayload} from '../tests/fixtures/speed-rich.mjs';
import {speedReportText} from '../lib/speed-report.ts';
import {speedContactSummary} from '../lib/speed-contact-summary.ts';
import {createContactChainFixture} from './contact-chain-fixture.mjs';
const origin=process.env.SEO_TEST_ORIGIN||'http://127.0.0.1:5192';
assert.ok(['localhost','127.0.0.1','[::1]'].includes(new URL(origin).hostname));
const out=path.resolve(process.env.RECOVERY_REPORT_ROOT||path.join(process.env.BROWSER_REPORT_ROOT||'reports/improvement/browser-ci','contact-recovery'));
await fs.mkdir(out,{recursive:true});
const states=richSpeedStates(),full=speedReportText('https://example.com/',states),compact=speedContactSummary('https://example.com/',states).text;
const report={buildId:(await fs.readFile('.next/BUILD_ID','utf8')).trim(),browser:browserLabel,checks:[],limits:['Synthetic legacy payload + real fixture rejection/storage; no historical UI bundle, real scan, mail or production DB.']};
const browser=await browserType.launch(launchOptions);
try{for(const width of [390,1440])for(const scenario of ['legacy-summary','legacy-body','valid-trimmed','valid-opt-out','embedded-summary']){
 const embedded=scenario==='embedded-summary',recoverable=scenario.startsWith('legacy')||embedded,routePath=embedded?'/tools/snelheidstest':'/contact',pendingKey=`sitesnit-contact-pending:${routePath}:${embedded?'tool':'contact'}`;
 const old=contactPayload(scenario==='legacy-body'?' '.repeat(64000)+'ok':scenario==='valid-trimmed'?' \n\uFEFF'+'🧪'.repeat(6000)+'\u00a0\n':scenario==='valid-opt-out'?'x'.repeat(13000):full,{sourcePage:routePath,formId:embedded?'tool_contact':'contact',includeSummary:scenario!=='valid-opt-out',name:'SYNTHETISCHE oude aanvraag',email:`recovery-${width}@example.invalid`,phone:'+31600000000',website:'https://example.com/customer-page',serviceId:'seo-onderhoud',message:'Mijn eigen vraag: behoud deze hele tekst, "quotes", \\ en Unicode 🧪. Geen echte aanvraag.',appointment:true,preferredDay:'Zaterdag',preferredTime:'12:30',careInterests:['content'],monthlyPlan:'2 blogs per maand',rhythm:'2 blogs per maand',project:'beurswijzer'});
 const fixture=await createContactChainFixture(origin),context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),calls=[],events=[],errors=[],external=[];let loseResponse=true;
 await context.exposeBinding('__recoveryEvents',(_source,e)=>events.push(e));
 await context.addInitScript(allow=>{const layer=[];layer.push=function(...items){for(const item of items)window.__recoveryEvents(Array.from(item));return Array.prototype.push.apply(this,items);};window.dataLayer=layer;localStorage.setItem('sitesnit-cookie-consent-v1',JSON.stringify({version:1,analytics:allow,decidedAt:Date.now(),measurementId:'G-FIXTURE123'}));},width===1440);
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.origin!==origin){if(url.hostname==='www.googletagmanager.com')return route.fulfill({contentType:'text/javascript',body:'/* inert fixture */'});external.push(url.origin);return route.abort();}
  if(url.pathname==='/api/contact'){const raw=route.request().postData();calls.push(raw);const response=await fixture.post(raw),body=await response.text();if(loseResponse){loseResponse=false;assert.equal(response.status,recoverable?(scenario==='legacy-body'?413:400):200);return route.abort('failed');}assert.equal(response.status,200,body);return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body});}
  if(url.pathname==='/api/speed-test'){const {device}=route.request().postDataJSON();return route.fulfill({json:{result:states[device].result}});}
  if(url.pathname.startsWith('/api/'))throw Error('Unexpected API '+url.pathname);return route.continue();
 });
 try{
  const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
  const scanAndOpen=async()=>{if(!embedded)return;await page.getByLabel('Websiteadres',{exact:true}).fill('https://example.com/');await page.getByRole('radio',{name:'Beide vergelijken'}).check();await page.getByRole('button',{name:'Start snelheidstest',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#snelheid-meten form')?.getAttribute('aria-busy')==='false');await page.getByRole('button',{name:'Bespreek deze meting',exact:true}).click();};
  const input=label=>page.getByLabel(label,{exact:true}),opt=page.getByLabel('Stuur mijn antwoorden en uitkomst mee met deze aanvraag.');
  const preserved=async()=>{assert.equal(await input('Je naam').inputValue(),old.name);assert.equal(await input('Je e-mailadres').inputValue(),old.email);assert.equal(await page.getByLabel('Vertel kort over je plannen').inputValue(),old.message);assert.equal(await page.getByLabel('Telefoonnummer').inputValue(),old.phone);assert.equal(await page.getByLabel('Bestaande website').inputValue(),old.website);assert.equal(await page.getByRole('combobox',{name:'Waar gaat je vraag over?'}).inputValue(),old.serviceId);};
  await page.goto(origin+routePath,{waitUntil:'networkidle'});
  const lost=await page.evaluate(async({old,key})=>{sessionStorage.setItem(key,JSON.stringify(old));sessionStorage.setItem('r01b-unrelated-sentinel','keep');try{await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(old)});return false;}catch{return true;}},{old,key:pendingKey});assert.equal(lost,true);
  await page.reload({waitUntil:'networkidle'});await scanAndOpen();await page.getByText('Je verzendpoging bekijken',{exact:true}).waitFor();await preserved();assert.equal(await input('Je naam').isDisabled(),true);
  const recovery=page.getByRole('button',{name:'Bereid mijn aanvraag opnieuw voor'}),leadCount=()=>events.filter(e=>e[0]==='event'&&e[1]==='generate_lead').length;
  let keyboardTabs=0,previewExact=false;
  if(recoverable){
   assert.equal((await fixture.summary()).inquiries.length,0);assert.equal(await recovery.isEnabled(),true);assert.equal(await page.getByRole('button',{name:'Controleer en probeer opnieuw'}).isDisabled(),true);
   for(;keyboardTabs<80;keyboardTabs++){await page.keyboard.press('Tab');if(await recovery.evaluate(el=>el===document.activeElement))break;}assert.ok(keyboardTabs<80,'Recovery action reachable by Tab');
   await page.screenshot({path:path.join(out,scenario+'-'+width+'-action.png')});await page.keyboard.press('Enter');await page.getByRole('status').filter({hasText:'Je aanvraag staat opnieuw klaar'}).waitFor();
   assert.equal(await input('Je naam').isDisabled(),false);assert.equal(await input('Je naam').evaluate(el=>el===document.activeElement),true);await preserved();assert.equal(calls.length,1,'Recovery itself sends nothing');
   assert.equal(await page.evaluate(()=>sessionStorage.getItem('r01b-unrelated-sentinel')),'keep');
   if(scenario==='legacy-summary'){
    // Reload before sending keeps the untouched original copy, with an actionable recovery again.
    await page.reload({waitUntil:'networkidle'});await page.getByText('Je verzendpoging bekijken',{exact:true}).waitFor();await preserved();await recovery.click();await preserved();assert.equal(await input('Je naam').isDisabled(),false);
   }
   if(embedded){assert.equal(await opt.isChecked(),false);await page.getByText('Samenvatting die je meestuurt',{exact:true}).click();const preview=page.locator('.contact-form .context-box details pre');assert.equal(await preview.textContent(),compact);await opt.check();previewExact=true;await page.locator('.contact-form .context-box').filter({has:page.getByText('Samenvatting die je meestuurt',{exact:true})}).screenshot({path:path.join(out,scenario+'-'+width+'-preview.png')});}
   else assert.equal(await opt.count(),0,'Old report is not silently offered as a new report');
   await page.getByRole('button',{name:'Verstuur je aanvraag',exact:true}).click();await page.locator('.success-box').waitFor();
   const next=JSON.parse(calls[1]);assert.notEqual(next.requestId,old.requestId);
   for(const key of ['name','email','phone','website','message','serviceId','sourcePage','formId','appointment','preferredDay','preferredTime','monthlyPlan','rhythm','project'])assert.deepEqual(next[key],old[key],key);
   assert.deepEqual(next.careInterests,old.careInterests);assert.equal(next.includeSummary,embedded);assert.equal(next.toolSummary,embedded?compact:'');
  }else{
   assert.equal(await recovery.count(),0,'Valid unknown pending has no reset action');assert.equal((await fixture.summary()).inquiries.length,1);assert.equal(leadCount(),0);
   await page.getByRole('button',{name:'Controleer en probeer opnieuw'}).click();await page.locator('.success-box').waitFor();assert.equal(calls[1],calls[0],'Exact serialized payload and requestId survive trimmed valid retry');
   const firstLeads=leadCount();await page.evaluate(({key,old})=>sessionStorage.setItem(key,JSON.stringify(old)),{key:pendingKey,old});await page.reload({waitUntil:'networkidle'});await page.getByRole('button',{name:'Controleer en probeer opnieuw'}).click();await page.locator('.success-box').waitFor();assert.equal(calls[2],calls[0]);assert.equal(leadCount(),firstLeads,'No additional lead for a confirmed same-id retry');
  }
  const saved=await fixture.summary();assert.equal(saved.inquiries.length,1);assert.equal(saved.tasks.length,2);assert.equal(fixture.mail.length,2);assert.deepEqual(saved.tasks.map(t=>[t.kind,t.payload.to]),[['confirmation',old.email],['owner','contact@sitesnit.nl']]);
  assert.equal(leadCount(),width===1440?1:0);assert.equal(await page.evaluate(()=>sessionStorage.getItem('r01b-unrelated-sentinel')),'keep');assert.equal(await page.evaluate(key=>sessionStorage.getItem(key),pendingKey),null);
  await page.locator('.success-box').screenshot({path:path.join(out,scenario+'-'+width+'-confirmed.png')});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.ok(!JSON.stringify(events).includes(old.email));assert.ok(!JSON.stringify(events).includes(old.website));
  report.checks.push({scenario,width,status:'passed',recoveryOnlyForRejectedRequest:recoverable,trimmedSummaryUnits:old.toolSummary.trim().length,rawSummaryUnits:old.toolSummary.length,legacyBodyBytes:Buffer.byteLength(JSON.stringify(old)),legacyStatus:recoverable?(scenario==='legacy-body'?413:400):200,recoveryPreservesOwnInput:recoverable,keyboardTabs:recoverable?keyboardTabs:null,exactFrozenRetry:!recoverable,previewExact:embedded?previewExact:null,inquiries:1,ownerTasks:1,confirmationTasks:1,leadEvents:leadCount(),unrelatedStoragePreserved:true});
 }finally{await context.close();await fixture.close();}
}report.status='passed';}catch(e){report.status='failed';report.error=e.stack;throw e;}finally{await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));
