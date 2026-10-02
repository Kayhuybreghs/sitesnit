/** Isolated UI flow: synthetic provider answers, no external scan, mail or analytics. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {browserType,launchOptions,browserLabel} from './browser-runtime.mjs';
import {normalizeSpeedResult} from '../lib/speed-test.ts';
import {speedFixture} from '../tests/fixtures/speed.mjs';
const origin=process.argv[2]||'http://127.0.0.1:5191';
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw Error('Local fixture origin only');
const out=path.resolve(process.env.BROWSER_REPORT_ROOT||'reports/improvement/browser-ci','speed');
await fs.mkdir(out,{recursive:true});
const report={buildId:(await fs.readFile('.next/BUILD_ID','utf8')).trim(),browser:browserLabel,checks:[],limits:['Synthetic provider responses, no proof of live Google quota or performance.']};
const browser=await browserType.launch(launchOptions);
try{for(const width of [390,1440]){
 const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
 let mode='success',pending;const calls=[],errors=[],external=[];
 await context.addInitScript(()=>localStorage.setItem('sitesnit-cookie-consent-v1',JSON.stringify({version:1,analytics:false,decidedAt:Date.now(),measurementId:'G-FIXTURE123'})));
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());if(url.origin!==origin){external.push(url.origin);return route.abort();}
  if(url.pathname.startsWith('/api/')){
   calls.push(url.pathname);if(url.pathname!=='/api/speed-test')return route.abort();
   if(mode==='pending'){pending=route;return;}
   if(mode==='quota')return route.fulfill({status:429,json:{error:'Fixture: meetlimiet bereikt.'}});
   if(mode==='html')return route.fulfill({status:502,contentType:'text/html',body:'<h1>Fixture gateway</h1>'});
   if(mode==='incomplete')return route.fulfill({json:{result:{score:100,device:'mobile'}}});
   const {device}=route.request().postDataJSON();
   return route.fulfill({json:{result:normalizeSpeedResult(speedFixture(device),'https://example.com/',device)}});
  }return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin+'/tools/snelheidstest',{waitUntil:'networkidle'});
 await page.getByRole('link',{name:'Meet mijn pagina'}).click();
 const input=page.getByLabel('Websiteadres',{exact:true}),start=page.getByRole('button',{name:'Start snelheidstest'});
 assert.equal(calls.length,0,'No automatic scan');
 await input.fill('https://example.com/');await start.click();
 await page.locator('#speed-result-title').waitFor();
 assert.match((await page.locator('.speed-score strong').innerText()).replace(/\s+/g,''),/^76\/100$/);
 assert.equal(await page.locator('.speed-metrics article').count(),5);
 assert.ok((await page.locator('.speed-evidence').innerText()).includes('<script'));
 assert.equal(await page.locator('.speed-evidence script').count(),0,'Evidence is escaped text');
 assert.equal(await page.locator('#speed-result-title').evaluate(n=>n===document.activeElement),true,'Result receives keyboard focus');
 await page.locator('.speed-result').screenshot({path:path.join(out,`result-${width}.png`)});
 await page.getByRole('radio',{name:'Desktop',exact:true}).check();
 assert.equal(await page.locator('.speed-result').count(),0,'Device change clears the old result');
 await start.click();await page.locator('#speed-result-title').waitFor();
 assert.match(await page.locator('.speed-result-heading').innerText(),/desktop/i);
 for(const state of ['quota','html','incomplete']){
  mode=state;await start.click();await page.locator('.speed-error[role=alert]').waitFor();
  assert.equal(await page.locator('.speed-result').count(),0,'Failure never shows an old or invented score');
  if(state==='html')assert.match(await page.locator('.speed-error[role=alert]').innerText(),/geen leesbaar/);
 }
 mode='pending';await start.click();await page.getByRole('status').filter({hasText:'Google opent'}).waitFor();
 assert.equal(await input.isDisabled(),true);
 await page.getByRole('button',{name:'Meting afbreken'}).click();
 assert.match(await page.locator('.speed-error[role=alert]').innerText(),/afgebroken/);
 if(pending)await pending.abort().catch(()=>{});
 mode='success';await start.click();await page.locator('#speed-result-title').waitFor();
 await input.fill('https://example.org/');assert.equal(await page.locator('.speed-result').count(),0,'URL change clears previous result');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 assert.ok(calls.every(p=>p==='/api/speed-test'),'No analytics or lead under rejected consent');
 report.checks.push({width,passed:true,flows:['no automatic scan','mobile report','desktop report','escaped evidence','focus','URL/device invalidation','quota','HTML error','incomplete report','cancel','retry','no overflow','no tracking without consent'],requests:calls.length});
 await context.close();
}}finally{await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify(report));
