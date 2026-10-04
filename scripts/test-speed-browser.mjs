/** NMR isolated browser stories. Provider, mail and analytics are captured locally. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {browserType,launchOptions,browserLabel} from './browser-runtime.mjs';
import {normalizeSpeedResult} from '../lib/speed-test.ts';
import {speedFixture} from '../tests/fixtures/speed.mjs';
import {createContactChainFixture} from './contact-chain-fixture.mjs';
const origin=process.argv[2]||'http://127.0.0.1:5192';
assert.ok(['127.0.0.1','localhost'].includes(new URL(origin).hostname));
const out=path.resolve(process.env.BROWSER_REPORT_ROOT||'reports/improvement/browser-ci','speed');
await fs.mkdir(out,{recursive:true});
const report={buildId:(await fs.readFile('.next/BUILD_ID','utf8')).trim(),browser:browserLabel,checks:[],limits:['Synthetic Google responses, in-memory contact store and captured provider; no live scan, mail delivery or GA4 receipt.']};
const browser=await browserType.launch(launchOptions);
const mail=await createContactChainFixture(origin);
try{for(const width of [390,1440]){
 const allow=width===1440,context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
 const calls=[],events=[],errors=[],external=[],pending=[],contactPayloads=[];let modes={},starts=0,completes=0,contactCalls=0;
 await context.exposeBinding('__fixtureAnalytics',(_source,event)=>events.push(event));
 await context.addInitScript(allow=>{
  const layer=[];layer.push=function(...entries){for(const entry of entries)window.__fixtureAnalytics(Array.from(entry));return Array.prototype.push.apply(this,entries);};window.dataLayer=layer;
  localStorage.setItem('sitesnit-cookie-consent-v1',JSON.stringify({version:1,analytics:allow,decidedAt:Date.now(),measurementId:'G-FIXTURE123'}));
  Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{if(window.__clipboardDenied)throw Error('Fixture denial');window.__copied=text;}}});
 },allow);
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin){
   if(url.hostname==='www.googletagmanager.com'&&allow)return route.fulfill({contentType:'text/javascript',body:'/* inert fixture */'});
   external.push(url.origin);return route.abort();
  }
  if(url.pathname==='/api/contact'){
   contactCalls++;contactPayloads.push(route.request().postDataJSON());const response=await mail.post(route.request().postData(),{origin});
   return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
  }
  if(url.pathname==='/api/speed-test'){
   const body=route.request().postDataJSON();calls.push(body);const mode=modes[body.device]||'success';
   if(mode==='pending'){pending.push(route);return;}
   if(mode==='quota')return route.fulfill({status:429,json:{error:'Fixture: meetlimiet bereikt.'}});
   if(mode==='html')return route.fulfill({status:502,contentType:'text/html',body:'<h1>Fixture gateway</h1>'});
   if(mode==='incomplete')return route.fulfill({json:{result:{score:100,device:body.device}}});
   const raw=speedFixture(body.device);raw.lighthouseResult.fetchTime=body.device==='mobile'?'2026-10-02T10:00:00Z':'2026-10-02T10:01:00Z';
   raw.lighthouseResult.finalUrl=mode==='redirect'?'https://example.org/other':body.url;
   raw.lighthouseResult.categories.performance.score=body.device==='desktop'?.94:.76;
   const result=normalizeSpeedResult(raw,body.url,body.device);
   if(mode==='wrong-url')result.requestedUrl='https://wrong.example.com/';
   if(mode==='wrong-device')result.device=body.device==='mobile'?'desktop':'mobile';
   return route.fulfill({json:{result}});
  }
  if(url.pathname.startsWith('/api/'))throw Error('Unexpected API '+url.pathname);
  return route.continue();
 });
 const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/website-snelheid-testen',{waitUntil:'networkidle'});
 await page.getByRole('link',{name:'Meet je pagina op mobiel en desktop',exact:true}).first().click();
 await page.waitForURL(origin+'/tools/snelheidstest');
 const input=page.getByLabel('Websiteadres',{exact:true}),start=page.getByRole('button',{name:'Start snelheidstest',exact:true});
 const result=kind=>page.locator('.speed-result[data-device="'+kind+'"]');
 const waitDone=()=>page.waitForFunction(()=>document.querySelector('#snelheid-meten form')?.getAttribute('aria-busy')==='false');
 const begin=async(success=true)=>{starts++;if(success)completes++;await start.click();await waitDone();};
 assert.equal(calls.length,0,'no automatic scans');
 await page.screenshot({path:path.join(out,'input-'+width+'.png'),fullPage:true});
 for(const bad of ['http://127.0.0.1','https://user:pass@example.com/','https://example.com/?token=secret']){
  await input.fill(bad);await start.click();await page.locator('.speed-error[role=alert]').waitFor();
 }
 assert.equal(calls.length,0,'invalid inputs stay local');
 await input.fill('example.com');await begin();
 assert.equal(await result('mobile').locator('.speed-score strong').innerText(),'76\n/ 100');
 assert.equal(await result('mobile').locator('.speed-metrics article').count(),5);
 assert.match(await result('mobile').locator('.speed-evidence').innerText(),/<script/);
 assert.equal(await result('mobile').locator('.speed-evidence script').count(),0);
 assert.equal(await page.locator('#speed-result-title').evaluate(n=>n===document.activeElement),true);
 await page.getByRole('radio',{name:'Desktop',exact:true}).check();
 assert.equal(await page.locator('.speed-score').count(),0,'no invented desktop score');
 await begin();await page.getByRole('radio',{name:'Mobiel',exact:true}).check();
 assert.equal(await result('mobile').locator('.speed-score strong').innerText(),'76\n/ 100');
 assert.equal(calls.length,2,'switching back uses the existing measurement');
 await page.getByRole('radio',{name:'Beide vergelijken'}).check();await begin();
 assert.equal(await page.locator('.speed-score').count(),2);
 await page.locator('.speed-results').screenshot({path:path.join(out,'both-results-'+width+'.png')});
 modes={desktop:'quota'};await begin(false);
 assert.equal(await page.locator('.speed-score').count(),2,'prior result stays explicitly labelled');
 assert.match(await result('desktop').innerText(),/Eerdere meting/);
 const before=calls.length;modes={};starts++;completes++;
 await page.getByRole('button',{name:'Probeer desktop opnieuw'}).click();await waitDone();
 assert.equal(calls.length,before+1);assert.equal(calls.at(-1).device,'desktop');
 assert.doesNotMatch(await result('desktop').innerText(),/Eerdere meting/);
 await input.fill('https://example.net/');assert.equal(await page.locator('.speed-result').count(),0);
 modes={desktop:'quota'};await begin(false);
 assert.equal(await result('desktop').locator('.speed-score').count(),0);
 assert.equal(await result('mobile').locator('.speed-score').count(),1,'partial success available');
 await input.fill('https://example.com/');assert.equal(await page.locator('.speed-score').count(),2);
 modes={desktop:'redirect'};await begin();
 assert.match(await page.locator('.speed-results').innerText(),/De eindadressen verschillen/);
 for(const state of ['html','incomplete','wrong-url','wrong-device']){
  modes={desktop:state};await begin(false);
  assert.match(await result('desktop').innerText(),/Eerdere meting/);
  assert.equal(await result('desktop').getByRole('alert').count(),1);
 }
 modes={};await begin();
 const [tab]=await Promise.all([context.waitForEvent('page'),result('mobile').getByRole('link',{name:'Zo lees je de prestatiescore (nieuw tabblad)'}).click()]);
 await tab.waitForLoadState();assert.match(tab.url(),/pagespeed-score/);await tab.close();
 assert.equal(await page.locator('.speed-score').count(),2);
 await page.getByRole('button',{name:'Kopieer meetrapport',exact:true}).click();
 const copied=await page.evaluate(()=>window.__copied);
 assert.match(copied,/Aangevraagde pagina: https:\/\/example.com\//);assert.match(copied,/Mobiel/);assert.match(copied,/Desktop/);assert.match(copied,/10:01:00Z/);
 await page.evaluate(()=>window.__clipboardDenied=true);
 await page.getByRole('button',{name:'Kopieer meetrapport',exact:true}).click();
 await page.getByRole('status').filter({hasText:'Gebruik de downloadknop'}).waitFor();
 const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download meetrapport als tekst'}).click()]);
 assert.equal(download.suggestedFilename(),'sitesnit-meetrapport-snelheid.txt');
 assert.equal(await fs.readFile(await download.path(),'utf8'),copied);
 // Pending request: duplicate start, explicit cancel and a late answer.
 modes={mobile:'pending'};await page.getByRole('radio',{name:'Mobiel',exact:true}).check();
 const beforePending=calls.length;starts++;await start.click();await page.getByRole('status').filter({hasText:'Google opent'}).waitFor();
 await page.locator('#snelheid-meten form').evaluate(form=>{form.requestSubmit();form.requestSubmit();});
 assert.equal(calls.length,beforePending+1);
 await page.getByRole('button',{name:'Breek mobiel af',exact:true}).click();await waitDone();
 assert.match(await result('mobile').innerText(),/afgebroken/);
 const late=pending.shift();await late.fulfill({json:{result:{score:1}}}).catch(()=>{});
 assert.match(await result('mobile').innerText(),/Eerdere meting/);
 // Accelerate only the browser timer to exercise the actual timeout path.
 await page.clock.install();starts++;await start.click();await page.getByRole('status').filter({hasText:'Google opent'}).waitFor();
 await page.clock.fastForward(116000);await waitDone();
 assert.match(await result('mobile').innerText(),/duurde te lang/);
 for(const route of pending.splice(0))await route.abort().catch(()=>{});
 await page.clock.resume();modes={};await begin();
 assert.equal(events.filter(e=>e[0]==='event'&&e[1]==='generate_lead').length,0,'scan/copy/contact click never generate a lead');
 await page.getByRole('button',{name:'Bespreek deze meting',exact:true}).click();
 await page.getByLabel('Je naam',{exact:true}).fill('SYNTHETISCHE speedproef');
 await page.getByLabel('Je e-mailadres',{exact:true}).fill('speed-visitor-'+width+'@example.invalid');
 assert.equal(await page.getByLabel('Bestaande website').inputValue(),'https://example.com/');
 assert.equal(await page.getByLabel('Wat wil je laten doen?').inputValue(),'seo-optimalisatie');
 await page.getByLabel('Waar gaat je vraag over?').selectOption('seo');
 assert.equal(await page.getByLabel('Waar gaat je vraag over?').inputValue(),'seo');
 await page.getByLabel('Wat wil je laten doen?').selectOption('seo-optimalisatie');
 await page.getByLabel('Vertel kort over je plannen').fill('Dit is een lokale fixtureaanvraag over de twee labmetingen.');
 const summaryChoice=page.getByLabel('Stuur mijn antwoorden en uitkomst mee met deze aanvraag.');
 assert.equal(await summaryChoice.isChecked(),false);
 assert.equal(contactCalls,0);
 await summaryChoice.check();await page.getByRole('button',{name:'Verstuur je aanvraag'}).click();
 await page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
 assert.equal(contactCalls,1);
 assert.equal(contactPayloads[0].sourcePage,'/tools/snelheidstest');
 assert.equal(contactPayloads[0].serviceId,'seo-optimalisatie');
 assert.equal(contactPayloads[0].website,'https://example.com/');
 assert.equal(contactPayloads[0].includeSummary,true);
 assert.match(contactPayloads[0].toolSummary,/Mobiel/);
 assert.match(contactPayloads[0].toolSummary,/Desktop/);
 assert.match(contactPayloads[0].toolSummary,/2026-10-02T10:01:00Z/);
 const state=await mail.summary(),tasks=state.tasks.filter(t=>t.payload.to==='speed-visitor-'+width+'@example.invalid');
 assert.equal(tasks.length,1);assert.equal(tasks[0].kind,'confirmation');
 assert.ok(state.tasks.some(t=>t.kind==='owner'&&t.payload.to==='contact@sitesnit.nl'));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 if(width===390){await page.setViewportSize({width:320,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);await page.screenshot({path:path.join(out,'reflow-320.png'),fullPage:true});}
 await page.waitForTimeout(100);
 const named=events.filter(e=>e[0]==='event');
 assert.equal(named.filter(e=>e[1]==='tool_start').length,allow?starts:0);
 assert.equal(named.filter(e=>e[1]==='tool_complete').length,allow?completes:0);
 assert.equal(named.filter(e=>e[1]==='generate_lead').length,allow?1:0);
 assert.ok(!JSON.stringify(events).includes('example.com'),'no visitor URL in analytics');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 report.checks.push({width,allowAnalytics:allow,status:'passed',requests:calls.length,starts,completes,flows:['URL validation','device/result retention','both success','partial success','single retry','other URL','different final URLs','invalid responses','copy + fallback','explanation tab','double start','cancel + late response','timeout','real contact opt-in + separate recipients','consent and lead events','reflow']});
 await context.close();
}report.status='passed';}catch(error){report.status='failed';report.error=error.stack;throw error;}
finally{await browser.close();await mail.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report));
