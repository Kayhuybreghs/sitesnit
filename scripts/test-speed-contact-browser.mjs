/** R01 rich reports, frozen retries and real isolated contact handler. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {browserType,launchOptions,browserLabel} from './browser-runtime.mjs';
import {richSpeedStates,contactPayload} from '../tests/fixtures/speed-rich.mjs';
import {speedReportText} from '../lib/speed-report.ts';
import {speedContactSummary} from '../lib/speed-contact-summary.ts';
import {parseContact} from '../lib/contact/input.ts';
import {createContactChainFixture} from './contact-chain-fixture.mjs';
const origin=process.env.SEO_TEST_ORIGIN||'http://127.0.0.1:5186';
assert.ok(['localhost','127.0.0.1','[::1]'].includes(new URL(origin).hostname),'local fixtures only');
const out=path.resolve(process.env.BROWSER_REPORT_ROOT||'reports/improvement/browser-ci/speed-contact');
await fs.mkdir(out,{recursive:true});
const states=richSpeedStates(),full=speedReportText('https://example.com/',states),compact=speedContactSummary('https://example.com/',states).text;
// Golden export from the preserved pre-R01 fixture report (2026-10-03).
assert.equal(full,await fs.readFile('tests/fixtures/speed-rich-full-report.txt','utf8'),'full export byte-for-byte preserved');
assert.equal(parseContact(contactPayload(compact)).toolSummary,compact);
await fs.writeFile(path.join(out,'full-report.txt'),full);await fs.writeFile(path.join(out,'contact-summary.txt'),compact);
const report={buildId:(await fs.readFile('.next/BUILD_ID','utf8')).trim(),browser:browserLabel,fullReportUnits:full.length,contactSummaryUnits:compact.length,oldRequestBytes:Buffer.byteLength(JSON.stringify(contactPayload(full))),newRequestBytes:Buffer.byteLength(JSON.stringify(contactPayload(compact))),checks:[],limits:['Local synthetic Google results and captured mail provider, in-memory database. No real scan, mail or inbox delivery.']};
const browser=await browserType.launch(launchOptions);
try{for(const width of [390,1440]){
 const fixture=await createContactChainFixture(origin);
 const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
 const payloads=[],events=[],errors=[],external=[];let lost=true,newer=false,exceptional=false;
 await context.exposeBinding('__events',(_source,e)=>events.push(e));
 await context.addInitScript(allow=>{const layer=[];layer.push=function(...items){for(const item of items)window.__events(Array.from(item));return Array.prototype.push.apply(this,items);};window.dataLayer=layer;localStorage.setItem('sitesnit-cookie-consent-v1',JSON.stringify({version:1,analytics:allow,decidedAt:Date.now(),measurementId:'G-FIXTURE123'}));Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.__copied=text;}}});},width===1440);
 await context.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==origin){if(url.hostname==='www.googletagmanager.com')return route.fulfill({contentType:'text/javascript',body:'/* inert fixture */'});external.push(url.origin);return route.abort();}
  if(url.pathname==='/api/speed-test'){const {device,url:requested}=route.request().postDataJSON();const result=structuredClone(states[device].result);result.requestedUrl=requested;result.finalUrl=requested;if(newer){result.score=55;result.fetchTime='2026-10-03T11:00:00Z';}if(exceptional)result.metrics[0].displayValue='🧪'.repeat(7000);return route.fulfill({json:{result}});}
  if(url.pathname==='/api/contact'){payloads.push(route.request().postDataJSON());const response=await fixture.post(route.request().postData());const body=await response.text();assert.equal(response.status,200,body);if(lost){lost=false;return route.abort('failed');}return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body});}
  if(url.pathname.startsWith('/api/'))throw Error('Unexpected API '+url.pathname);
  return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.setDefaultTimeout(20000);
 const scan=async()=>{await page.getByLabel('Websiteadres',{exact:true}).fill('https://example.com/');await page.getByRole('radio',{name:'Beide vergelijken'}).check();await page.getByRole('button',{name:'Start snelheidstest',exact:true}).click();await page.waitForFunction(()=>document.querySelector('#snelheid-meten form')?.getAttribute('aria-busy')==='false');};
 const open=()=>page.getByRole('button',{name:'Bespreek deze meting',exact:true}).click();
 const preview=()=>page.locator('.contact-form .context-box details').filter({has:page.getByText('Samenvatting die je meestuurt',{exact:true})}).locator('pre');
 const leadCount=()=>events.filter(e=>e[0]==='event'&&e[1]==='generate_lead').length;
 try{
  await page.goto(origin+'/tools/snelheidstest',{waitUntil:'networkidle'});await scan();
  assert.equal(await page.locator('.speed-score').count(),2);assert.equal(await page.locator('.speed-finding').count(),22); // Rich detail also verified by exact full export below.
  await page.locator('.speed-results').screenshot({path:path.join(out,'rich-results-'+width+'.png')});
  await page.getByRole('button',{name:'Kopieer meetrapport',exact:true}).click();assert.equal(await page.evaluate(()=>window.__copied),full);
  const [download]=await Promise.all([page.waitForEvent('download'),page.getByRole('button',{name:'Download meetrapport als tekst'}).click()]);assert.equal(await fs.readFile(await download.path(),'utf8'),full);
  await open();assert.equal(leadCount(),0);assert.equal(await preview().textContent(),compact);
  const opt=page.getByLabel('Stuur mijn antwoorden en uitkomst mee met deze aanvraag.');assert.equal(await opt.isChecked(),false);
  await page.getByLabel('Je naam',{exact:true}).fill('SYNTHETISCHE rijke proef');await page.getByLabel('Je e-mailadres',{exact:true}).fill('rich-'+width+'@example.invalid');
  const own='Mijn eigen vraag: vergelijk beide metingen, inclusief 🧪 en de volledige uitleg. Deze vraag blijft intact.';
  await page.getByLabel('Vertel kort over je plannen').fill(own);await opt.check();
  await page.getByText('Samenvatting die je meestuurt',{exact:true}).click();
  await page.locator('.contact-form .context-box').filter({has:page.getByText('Samenvatting die je meestuurt',{exact:true})}).screenshot({path:path.join(out,'contact-preview-'+width+'.png')});
  await page.locator('.contact-form').screenshot({path:path.join(out,'contact-form-'+width+'.png')});
  await page.getByRole('button',{name:'Verstuur je aanvraag',exact:true}).click();await page.getByRole('alert').filter({hasText:'verbinding is onderbroken'}).waitFor();
  assert.equal(payloads[0].toolSummary,compact);assert.equal(payloads[0].message,own);assert.equal(leadCount(),0);
  assert.equal((await fixture.summary()).inquiries.length,1,'lost response was already saved');
  newer=true;await scan();assert.equal(await preview().textContent(),compact,'new result cannot replace a pending summary');
  await page.reload({waitUntil:'networkidle'});await scan();await open();
  assert.equal(await preview().textContent(),compact,'reload restores the frozen submitted preview');
  assert.equal(await page.getByLabel('Vertel kort over je plannen').inputValue(),own);
  await page.getByRole('button',{name:'Controleer en probeer opnieuw'}).click();await page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
  assert.deepEqual(payloads[1],payloads[0]);
  let saved=await fixture.summary();assert.equal(saved.inquiries.length,1);assert.equal(saved.tasks.length,2);assert.equal(fixture.mail.length,2);
  assert.deepEqual(saved.tasks.map(t=>[t.kind,t.payload.to]),[['confirmation','rich-'+width+'@example.invalid'],['owner','contact@sitesnit.nl']]);
  await page.locator('.success-box').screenshot({path:path.join(out,'confirmed-'+width+'.png')});
  await page.waitForTimeout(100);assert.equal(leadCount(),width===1440?1:0);
  await page.reload({waitUntil:'networkidle'});await scan();await open();
  await page.getByLabel('Je naam',{exact:true}).fill('SYNTHETISCHE zonder rapport');await page.getByLabel('Je e-mailadres',{exact:true}).fill('without-'+width+'@example.invalid');await page.getByLabel('Vertel kort over je plannen').fill(own);
  assert.equal(await page.getByLabel('Stuur mijn antwoorden en uitkomst mee met deze aanvraag.').isChecked(),false);
  await page.getByRole('button',{name:'Verstuur je aanvraag',exact:true}).click();await page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
  assert.equal(payloads[2].includeSummary,false);assert.equal(payloads[2].toolSummary,'');assert.equal(payloads[2].message,own);assert.notEqual(payloads[2].requestId,payloads[0].requestId);
  saved=await fixture.summary();assert.equal(saved.inquiries.length,2);assert.equal(saved.tasks.length,4);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.waitForTimeout(100);assert.equal(leadCount(),width===1440?2:0);
  // Deliberately exceptional but schema-valid received display text exercises the pre-submit fallback.
  exceptional=true;await page.reload({waitUntil:'networkidle'});await scan();await open();
  await page.getByRole('status').filter({hasText:'De meetcontext is te groot'}).waitFor();
  assert.equal(await page.getByLabel('Stuur mijn antwoorden en uitkomst mee met deze aanvraag.').count(),0);
  assert.equal(payloads.length,3,'warning occurs before any exceptional report request');
  await page.getByLabel('Je naam',{exact:true}).fill('SYNTHETISCHE bewuste vraag');await page.getByLabel('Je e-mailadres',{exact:true}).fill('exceptional-'+width+'@example.invalid');await page.getByLabel('Vertel kort over je plannen').fill(own);
  await page.getByRole('button',{name:'Verstuur je aanvraag zonder rapport',exact:true}).click();await page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
  assert.equal(payloads[3].includeSummary,false);assert.equal(payloads[3].toolSummary,'');assert.equal(payloads[3].message,own);
  saved=await fixture.summary();assert.equal(saved.inquiries.length,3);assert.equal(saved.tasks.length,6);
  await page.waitForTimeout(100);assert.equal(leadCount(),width===1440?3:0);
  assert.ok(!JSON.stringify(events).includes('example.com'));assert.ok(!JSON.stringify(events).includes(own));assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
  report.checks.push({width,status:'passed',consent:width===1440,fullCopyAndDownloadExact:true,previewPayloadExact:true,unchangedVisitorMessage:true,lostResponseAndReloadExact:true,inquiries:saved.inquiries.length,outboxRoles:saved.tasks.map(t=>t.kind),contactRequestBytes:Buffer.byteLength(JSON.stringify(payloads[0])),optOutEmpty:true,exceptionalContextWarningAndDeliberateNoReport:true,leadEvents:leadCount()});
 }finally{await context.close();await fixture.close();}
}report.status='passed';}catch(error){report.status='failed';report.error=error.stack;throw error;}finally{await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));
