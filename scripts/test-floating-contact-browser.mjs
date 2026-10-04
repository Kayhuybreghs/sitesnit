/** Floating email/callback flow: local synthetic handler, memory DB, fake mail only. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {browserType,launchOptions} from './browser-runtime.mjs';
import {createContactChainFixture} from './contact-chain-fixture.mjs';
const origin=process.env.SEO_TEST_ORIGIN||'http://127.0.0.1:5197';
assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname));
const out=path.resolve(process.env.BROWSER_REPORT_ROOT||'reports/improvement/browser-ci','floating-contact');await fs.mkdir(out,{recursive:true});
const report={buildId:(await fs.readFile('.next/BUILD_ID','utf8')).trim(),checks:[],limits:['Synthetic local handler, in-memory DB, fake owner/confirmation mail. No real inbox delivery or production data. Browser viewport emulation, not physical iPhone.']};
async function until(test){for(let i=0;i<100;i++){if(await test())return;await new Promise(r=>setTimeout(r,50));}throw Error('UI did not reach expected state');}
const browser=await browserType.launch(launchOptions);
try{
for(const width of [390,1440]){
 const f=await createContactChainFixture(origin),context=await browser.newContext({viewport:{width,height:900},reducedMotion:width===390?'reduce':'no-preference'}),calls=[],errors=[];let lost=true;
 await context.route('**/*',async route=>{const r=route.request(),u=new URL(r.url());if(u.origin!==origin)return route.abort();if(u.pathname==='/api/contact'){const raw=r.postData();calls.push(JSON.parse(raw));const response=await f.post(raw);if(lost){lost=false;return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetische onduidelijke ontvangst. Probeer dezelfde aanvraag opnieuw.'})});}return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});}if(u.pathname.startsWith('/api/')||r.method()!=='GET')return route.abort();return route.continue();});
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 try{
 await page.goto(origin+'/diensten/webdesign',{waitUntil:'networkidle'});const dock=page.locator('.contact-dock'),panel=page.locator('dialog.quick-contact');
 assert.equal(await panel.isVisible(),false);assert.equal(await panel.locator('form').count(),0);
 await page.evaluate(()=>scrollTo(0,800));await until(async()=>await dock.getAttribute('data-visible')==='true');
 const deny=page.getByRole('button',{name:'Alleen noodzakelijk',exact:true});await deny.waitFor({state:'visible'});assert.equal(await dock.isVisible(),false);await deny.click();
 await until(()=>dock.isVisible());await page.screenshot({path:path.join(out,'dock-'+width+'.png')});
 await page.evaluate(()=>scrollTo(0,0));await until(async()=>await dock.getAttribute('data-visible')==='false');assert.equal(await dock.getAttribute('inert'),'');
 await page.evaluate(()=>scrollTo(0,800));await until(()=>dock.isVisible());await dock.getByRole('button',{name:'E-mail',exact:true}).click();
 await panel.getByLabel('Je naam',{exact:true}).waitFor();assert.equal(await panel.locator('h1').count(),0);assert.equal(await panel.getByRole('heading',{name:'Even contact.'}).count(),1);assert.equal(await page.evaluate(()=>document.body.style.overflow),'hidden');
 const name=panel.getByLabel('Je naam',{exact:true}),email=panel.getByLabel('Je e-mailadres',{exact:true}),message=panel.getByLabel('Vertel kort over je plannen');
 await name.fill('Synthetische contactbalk');await email.fill('dock-fixture@example.invalid');await message.fill('Mijn vraag blijft bewaard bij sluiten en opnieuw openen.');
 await page.keyboard.press('Escape');await until(async()=>!await panel.isVisible());await until(async()=>await dock.getByRole('button',{name:'E-mail',exact:true}).evaluate(el=>el===document.activeElement));
 assert.notEqual(await page.evaluate(()=>document.body.style.overflow),'hidden');
 await dock.getByRole('button',{name:'Belafspraak',exact:true}).click();await panel.getByLabel('Voorkeursdag').waitFor();assert.equal(await name.inputValue(),'Synthetische contactbalk');assert.equal(await message.inputValue(),'Mijn vraag blijft bewaard bij sluiten en opnieuw openen.');
 await panel.getByLabel('Telefoonnummer',{exact:true}).fill('0612345678');await panel.getByLabel('Voorkeursdag').selectOption('Dinsdag');const time=panel.getByLabel('Voorkeurstijd');await time.fill('17:59');assert.equal(await time.evaluate(el=>el.validity.valid),false);
 await panel.getByRole('button',{name:'Verstuur je aanvraag',exact:true}).click();assert.equal(calls.length,0);
 await time.fill('18:00');assert.equal(await time.evaluate(el=>el.validity.valid),true);await time.fill('21:31');assert.equal(await time.evaluate(el=>el.validity.valid),false);
 await panel.getByLabel('Voorkeursdag').selectOption('Zaterdag');await time.fill('09:00');assert.equal(await time.evaluate(el=>el.validity.valid),true);await time.fill('23:59');assert.equal(await time.evaluate(el=>el.validity.valid),true);await time.fill('09:00');
 await panel.evaluate(el=>{el.scrollTop=0});await page.screenshot({path:path.join(out,'call-'+width+'.png')});
 await page.keyboard.press('Tab');assert.equal(await panel.evaluate(el=>el.contains(document.activeElement)),true);
 await panel.getByRole('button',{name:'Verstuur je aanvraag',exact:true}).click();await panel.getByRole('alert').waitFor();assert.equal(calls.length,1);assert.equal(calls[0].appointment,true);assert.equal(calls[0].preferredDay,'Zaterdag');assert.equal(calls[0].preferredTime,'09:00');assert.equal(calls[0].includeSummary,false);assert.equal((await f.summary()).inquiries.length,1);
 await panel.getByRole('button',{name:'Contactvenster sluiten'}).click();await until(async()=>!await panel.isVisible());
 await page.goto(origin+'/kosten',{waitUntil:'networkidle'});await page.evaluate(()=>scrollTo(0,800));await until(()=>dock.isVisible());await dock.getByRole('button',{name:'E-mail',exact:true}).click();
 await panel.getByRole('button',{name:'Controleer en probeer opnieuw'}).waitFor();assert.equal(await name.isEnabled(),false);await panel.getByRole('button',{name:'Controleer en probeer opnieuw'}).click();await panel.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
 assert.deepEqual(calls[1],calls[0]);assert.equal((await f.summary()).inquiries.length,1);assert.equal(f.mail.length,2);assert.deepEqual(errors,[]);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);assert.equal(await panel.evaluate(el=>el.scrollWidth>el.clientWidth+1),false);
 await page.screenshot({path:path.join(out,'success-'+width+'.png')});report.checks.push({width,passed:true,scrollDownUp:true,lazyForm:true,cookieSeparation:true,closeAndReopenPreservesText:true,weekdayAndWeekendWindows:true,unknownRetryAcrossRoutesExact:true,singleInquiry:true,twoFakeMailRoles:true,noOverflow:true,focusRestored:true});
 // A fresh email flow, with no call requested.
 await context.clearCookies();await page.evaluate(()=>{sessionStorage.clear();});await page.goto(origin+'/diensten/webdesign',{waitUntil:'networkidle'});await page.evaluate(()=>scrollTo(0,800));await until(()=>dock.isVisible());await dock.getByRole('button',{name:'E-mail',exact:true}).click();
 await name.fill('Synthetische e-mailvraag');await email.fill('email-fixture@example.invalid');await message.fill('Een aparte e-mailvraag zonder belafspraak.');
 assert.equal(await panel.getByLabel('Ik wil graag een belafspraak afstemmen').isChecked(),false);
 await panel.evaluate(el=>{el.scrollTop=0});await page.screenshot({path:path.join(out,'email-'+width+'.png')});
 await panel.getByRole('button',{name:'Verstuur je aanvraag',exact:true}).click();await panel.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();assert.equal(calls[2].appointment,false);assert.equal((await f.summary()).inquiries.length,2);assert.equal(f.mail.length,4);
 await page.goto(origin+'/contact',{waitUntil:'networkidle'});assert.equal(await dock.count(),0);report.checks.push({width,passed:true,emailWithoutCall:true,fullContactNotDuplicated:true});
 }finally{await context.close();await f.close();}
}
report.status='passed';
}catch(e){report.status='failed';report.error=e.stack;process.exitCode=1;}finally{await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));console.log(report);}
