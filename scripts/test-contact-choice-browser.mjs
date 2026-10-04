/** Compact service selection and definite antispam rejection recovery. Fixture only. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {browserType,launchOptions} from './browser-runtime.mjs';
import {contactServiceNames} from '../lib/contact/options.ts';
import {createContactChainFixture} from './contact-chain-fixture.mjs';
const origin=process.env.SEO_TEST_ORIGIN||'http://127.0.0.1:5196';
assert.ok(['127.0.0.1','localhost'].includes(new URL(origin).hostname));
const out=path.resolve(process.env.BROWSER_REPORT_ROOT||'reports/improvement/browser-ci','contact-choice');await fs.mkdir(out,{recursive:true});
const report={buildId:(await fs.readFile('.next/BUILD_ID','utf8')).trim(),checks:[],limits:['Autofill contamination is simulated, not claimed as a reproduction of every browser autofill engine. Real handler uses in-memory DB and fake mail. No real mail or production data.']};
const browser=await browserType.launch(launchOptions);
try{for(const width of [390,1440]){
 const f=await createContactChainFixture(origin),context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'}),calls=[],errors=[];
 await context.route('**/*',async route=>{const r=route.request(),u=new URL(r.url());if(u.origin!==origin)return route.abort();if(u.pathname==='/api/contact'){const raw=r.postData();calls.push(JSON.parse(raw));const response=await f.post(raw);return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});}if(u.pathname.startsWith('/api/')||r.method()!=='GET')return route.abort();return route.continue();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(origin+'/contact?pakket=website',{waitUntil:'networkidle'});
  if(await page.getByRole('button',{name:'Alleen noodzakelijk',exact:true}).isVisible())await page.getByRole('button',{name:'Alleen noodzakelijk',exact:true}).click();
  const category=page.getByRole('combobox',{name:'Waar gaat je vraag over?'}),detail=page.getByRole('combobox',{name:'Wat wil je laten doen?'});
  assert.equal(await category.locator('option').count(),6);assert.equal(await detail.count(),0);assert.equal(await page.getByLabel('Websitepakket').inputValue(),'website');
  await category.focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Tab');assert.equal(await detail.inputValue(),'webdesign');assert.equal(await page.getByLabel('Websitepakket').inputValue(),'website');
  const ids=[];for(const id of ['webdesign','seo','branding','onderhoud-hosting','ai']){await category.selectOption(id);const options=await detail.locator('option').evaluateAll(nodes=>nodes.map(n=>n.value));assert.ok(options.length<=5);ids.push(...options);}
  assert.deepEqual([...ids].sort(),Object.keys(contactServiceNames).sort());report.checks.push({width,check:'five topics plus unsure; all 16 original IDs selectable, maximum five details; keyboard; package preserved',passed:true});
  for(const id of Object.keys(contactServiceNames)){await page.goto(origin+'/contact?dienst='+encodeURIComponent(id),{waitUntil:'networkidle'});assert.equal(await detail.inputValue(),id);}
  report.checks.push({width,check:'all 16 service URL preselection values preserved',passed:true});
  await page.goto(origin+'/contact?pakket=website&dienst=webdesign',{waitUntil:'networkidle'});await category.scrollIntoViewIfNeeded();await page.screenshot({path:path.join(out,'choice-'+width+'.png')});
  const name=page.getByLabel('Je naam',{exact:true}),email=page.getByLabel('Je e-mailadres',{exact:true}),message=page.getByLabel('Vertel kort over je plannen');
  await name.fill('Synthetische browserinvoer');await email.fill('autofill-fixture@example.invalid');await message.fill('Mijn eigen vraag blijft staan na de formuliercontrole.');
  await page.getByLabel('Ik wil graag een belafspraak afstemmen').check();await page.getByLabel('Voorkeursdag').selectOption('Dinsdag');await page.getByLabel('Voorkeurstijd').fill('18:12');
  assert.equal(await page.locator('[name=contact_extra]').isVisible(),false);assert.equal(await page.locator('[name=contact_extra]').evaluate(el=>!!el.closest('[inert][hidden]')),true);
  await page.locator('[name=contact_extra]').evaluate(el=>{el.value='synthetic unwanted autofill';});
  await page.getByRole('button',{name:'Verstuur je aanvraag',exact:true}).click();await page.getByRole('alert').filter({hasText:'De formuliercontrole ging mis'}).waitFor();
  assert.equal(calls.length,1);assert.equal((await f.summary()).inquiries.length,0);assert.equal(f.mail.length,0);assert.equal(await page.locator('[name=contact_extra]').inputValue(),'');assert.equal(await name.inputValue(),'Synthetische browserinvoer');assert.equal(await detail.inputValue(),'webdesign');assert.equal(await page.getByLabel('Voorkeurstijd').inputValue(),'18:12');assert.equal(await name.isEnabled(),true);
  await page.screenshot({path:path.join(out,'rejection-preserved-'+width+'.png')});
  await page.getByRole('button',{name:'Verstuur je aanvraag',exact:true}).click();await page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
  assert.equal(calls.length,2);const {companyCheck:before,...first}=calls[0],{companyCheck:after,...second}=calls[1];assert.equal(before,'synthetic unwanted autofill');assert.deepEqual(second,first);assert.equal(after,'');assert.equal((await f.summary()).inquiries.length,1);assert.equal(f.mail.length,2);assert.deepEqual(errors,[]);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
  await page.screenshot({path:path.join(out,'fixture-success-'+width+'.png')});report.checks.push({width,check:'antispam still rejects before storage; only trap reset; same user inputs/requestId manually resubmitted once; owner/confirmation fake mail',passed:true});
 }finally{await context.close();await f.close();}
}report.status='passed';}catch(e){report.status='failed';report.error=e.stack;process.exitCode=1;}finally{await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(report);}
