/** Loopback-only browser regression. Contact HTTP and Google scripts are fixtures; no mail or database writes. */
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Gebruiker/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const base=new URL(process.argv[2]||'http://127.0.0.1:5189');
if(base.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(base.hostname))throw Error('Loopback HTTP only.');
// Explicit allowlist keeps evidence paths predictable and prevents accidental huge viewports.
// Usage: node scripts/test-contact-browser.mjs http://127.0.0.1:5189 390 (or 1440).
const viewportKey=process.argv[3]??process.env.CONTACT_TEST_VIEWPORT??'390';
const profiles={'390':{name:'mobile-390',width:390,height:844},'1440':{name:'desktop-1440',width:1440,height:900}};
if(!Object.hasOwn(profiles,viewportKey))throw Error('CONTACT_TEST_VIEWPORT / third argument must be 390 or 1440.');
const profile=profiles[viewportKey];
const output=resolve('reports/improvement/contact-privacy',profile.name);mkdirSync(output,{recursive:true});
const report={startedAt:new Date().toISOString(),origin:base.origin,profile:profile.name,viewport:{width:profile.width,height:profile.height},browser:'Headless Microsoft Edge via Playwright',checks:[],screenshots:[],limitations:['Contact API responses and Google script are intercepted. No database writes, mail, provider delivery or external GA4 receipt tested.']};
report.buildId=readFileSync('.next/BUILD_ID','utf8').trim();
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const consentKey='sitesnit-cookie-consent-v1',measurementId='G-FIXTURE123';
async function fixture(choice,{blockAnalytics=false}={}){
  const context=await browser.newContext({viewport:report.viewport}),events=[],calls=[],errors=[];let reply='success',scriptRequests=0;
  await context.exposeBinding('__fixtureAnalytics',(_source,event)=>events.push(event));
  await context.addInitScript(({choice,consentKey,measurementId})=>{
    const layer=[];layer.push=function(...entries){for(const entry of entries)window.__fixtureAnalytics(Array.from(entry));return Array.prototype.push.apply(this,entries);};window.dataLayer=layer;
    if(choice!==undefined&&!sessionStorage.getItem('fixture-consent-seeded')){
      localStorage.setItem(consentKey,choice==='corrupt'?'broken':JSON.stringify({version:1,analytics:choice!=='deny',decidedAt:choice==='expired'?Date.now()-181*86400000:Date.now(),measurementId}));
      sessionStorage.setItem('fixture-consent-seeded','1');
    }
  },{choice,consentKey,measurementId});
  await context.route('**/*',async route=>{
    const url=new URL(route.request().url());
    if(url.origin!==base.origin){
      if(url.hostname==='www.googletagmanager.com'&&url.pathname==='/gtag/js'){scriptRequests++;return blockAnalytics?route.abort('connectionfailed'):route.fulfill({contentType:'text/javascript',body:'/* Isolated analytics fixture. No network or cookies. */'});}
      return route.abort();
    }
    if(url.pathname==='/api/contact'){
      const raw=route.request().postData(),payload=JSON.parse(raw);calls.push(raw);
      if(reply==='disconnect')return route.abort('connectionreset');
      if(reply==='invalid')return route.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'Fixture: controleer je invoer.'})});
      if(reply==='storage-unavailable')return route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Fixture: opslag is nog niet bevestigd. Probeer dezelfde aanvraag opnieuw.'})});
      if(reply==='rate-limited')return route.fulfill({status:429,contentType:'application/json',body:JSON.stringify({error:'Fixture: tijdelijk te veel aanvragen. Probeer later opnieuw.'})});
      return route.fulfill({contentType:'application/json',body:JSON.stringify({ok:true,id:payload.requestId,reference:'SN-'+payload.requestId.replaceAll('-','').toUpperCase(),mail:{confirmation:'pending'},created:calls.length===1})});
    }
    return route.continue();
  });
  const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push(error.message));
  return {context,page,events,calls,errors,reply:value=>{reply=value;},scripts:()=>scriptRequests};
}
async function open(f,suffix='?dienst=seo-optimalisatie'){
  await f.page.goto(base.origin+'/contact'+suffix,{waitUntil:'networkidle',timeout:90000});
  await f.page.getByRole('combobox',{name:'Waar gaat je vraag over?'}).waitFor();
  await f.page.waitForFunction(()=>{const button=document.querySelector('.contact-form button[type="submit"]');return button&&!button.disabled;});
  assert.equal(await f.page.locator('[data-nextjs-dialog]').count(),0);
  assert.ok((await f.page.locator('body').innerText()).length>300);
  assert.ok(await f.page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),'contact page must not overflow horizontally');
}
async function screenshot(page,name){const filename=name+'.png';await page.screenshot({path:resolve(output,filename),fullPage:true});report.screenshots.push(filename);}
async function fill(page){
  await page.getByLabel('Je naam',{exact:true}).fill('SYNTHETISCHE browserproef');
  await page.getByLabel('Je e-mailadres',{exact:true}).fill('browser-fixture@example.invalid');
  await page.getByLabel('Bestaande website').fill('https://example.invalid');
  await page.getByLabel('Telefoonnummer').fill('+31600000000');
  await page.getByLabel('Vertel kort over je plannen').fill('Geïsoleerde browserproef, geen echte aanvraag of persoon.');
}
try{
  const f=await fixture('allow');
  try{
    await open(f);
    assert.equal(await f.page.getByRole('combobox',{name:'Waar gaat je vraag over?'}).inputValue(),'seo-optimalisatie');
    assert.equal(await f.page.getByLabel('Websitepakket').count(),0);
    await f.page.getByRole('combobox',{name:'Waar gaat je vraag over?'}).selectOption('webdesign');
    assert.equal(await f.page.getByLabel('Websitepakket').count(),1);
    await f.page.getByRole('combobox',{name:'Waar gaat je vraag over?'}).selectOption('seo-optimalisatie');
    await f.page.getByRole('button',{name:'Verstuur je aanvraag'}).click();
    assert.equal(f.calls.length,0,'native invalid inputs must never reach the server');
    await fill(f.page);
    await f.page.getByLabel('Ik wil graag een belafspraak afstemmen').check();
    await f.page.getByLabel('Voorkeursdag').selectOption('Zaterdag');
    await f.page.getByLabel('Voorkeurstijd').fill('10:30');
    await screenshot(f.page,'contact-context');
    f.reply('disconnect');
    await f.page.getByRole('button',{name:'Verstuur je aanvraag'}).click({clickCount:2});
    await f.page.getByRole('alert').filter({hasText:'De verbinding is onderbroken'}).waitFor();
    assert.equal(f.calls.length,1,'double click must not send twice');
    const frozen=JSON.parse(f.calls[0]);
    assert.equal(f.events.filter(event=>event[0]==='event'&&event[1]==='generate_lead').length,0,'no success event for a missing response');
    await open(f,'?dienst=branding');
    assert.equal(await f.page.getByRole('combobox',{name:'Waar gaat je vraag over?'}).inputValue(),'seo-optimalisatie');
    assert.equal(await f.page.getByLabel('Je naam',{exact:true}).inputValue(),frozen.name);
    assert.equal(await f.page.getByLabel('Je e-mailadres',{exact:true}).inputValue(),frozen.email);
    assert.equal(await f.page.getByLabel('Bestaande website').inputValue(),frozen.website);
    assert.equal(await f.page.getByLabel('Telefoonnummer').inputValue(),frozen.phone);
    assert.equal(await f.page.getByLabel('Voorkeursdag').inputValue(),'Zaterdag');
    assert.equal(await f.page.getByLabel('Voorkeurstijd').inputValue(),'10:30');
    assert.equal(await f.page.getByLabel('Vertel kort over je plannen').isDisabled(),true);
    f.reply('success');await f.page.getByRole('button',{name:'Controleer en probeer opnieuw'}).click();
    await f.page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
    await screenshot(f.page,'contact-confirmation');
    assert.equal(f.calls[0],f.calls[1],'reload retry must keep the exact serialized payload and request ID');
    assert.equal(f.events.filter(event=>event[0]==='event'&&event[1]==='generate_lead').length,1);
    await f.page.evaluate(payload=>sessionStorage.setItem('sitesnit-contact-pending:/contact:contact',JSON.stringify(payload)),frozen);
    await open(f);await f.page.getByRole('button',{name:'Controleer en probeer opnieuw'}).click();
    await f.page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
    assert.equal(f.events.filter(event=>event[0]==='event'&&event[1]==='generate_lead').length,1,'confirmed ID remains deduplicated across reload');
    await open(f);await fill(f.page);await f.page.getByRole('button',{name:'Verstuur je aanvraag'}).click();
    await f.page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
    assert.equal(f.events.filter(event=>event[0]==='event'&&event[1]==='generate_lead').length,2,'a new inquiry is not suppressed');
    const sent=f.events.filter(event=>event[0]==='event');
    assert.doesNotMatch(JSON.stringify(sent),/browser-fixture|example\.invalid|00000000|SYNTHETISCHE|Geïsoleerde/);
    assert.equal(sent.filter(event=>event[1]==='form_start').length,2);
    assert.deepEqual(f.errors,[]);
    report.checks.push({name:'service context, native validation, double click, disconnect, reload exact retry, lead timing/dedup, genuine new lead',status:'passed'});
  }finally{await f.context.close();}
  for(const choice of [undefined,'deny','corrupt','expired']){
    const f=await fixture(choice);
    try{
      await open(f);assert.equal(f.scripts(),0);await fill(f.page);
      assert.equal(f.events.filter(event=>event[0]==='event').length,0);
      if(choice!=='deny'){
        await f.page.getByRole('button',{name:'Analyse toestaan',exact:true}).click();
        await f.page.waitForFunction(()=>window.sitesnitAnalyticsId==='G-FIXTURE123');
        assert.equal(f.events.filter(event=>event[0]==='event'&&event[1]==='form_start').length,0,'pre-consent form changes are not replayed');
      }
      assert.deepEqual(f.errors,[]);report.checks.push({name:`consent ${choice??'before choice'}: no pre-consent script/events or replay`,status:'passed'});
    }finally{await f.context.close();}
  }
  const withdrawal=await fixture('allow');try{
    await open(withdrawal);await fill(withdrawal.page);
    const scriptsBefore=withdrawal.scripts();
    await withdrawal.page.getByRole('button',{name:/Cookie.*instell/i}).last().click();
    await withdrawal.page.getByRole('dialog').waitFor();
    await screenshot(withdrawal.page,'cookie-settings');
    await Promise.all([
      withdrawal.page.waitForNavigation({waitUntil:'networkidle'}),
      withdrawal.page.getByRole('dialog').getByRole('button',{name:'Alleen noodzakelijk',exact:true}).click(),
    ]);
    await withdrawal.page.waitForFunction(()=>{const button=document.querySelector('.contact-form button[type="submit"]');return button&&!button.disabled;});
    const eventsBefore=withdrawal.events.filter(event=>event[0]==='event').length;
    await fill(withdrawal.page);await withdrawal.page.getByRole('button',{name:'Verstuur je aanvraag'}).click();
    await withdrawal.page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
    assert.equal(withdrawal.scripts(),scriptsBefore);assert.equal(withdrawal.events.filter(event=>event[0]==='event').length,eventsBefore);
    report.checks.push({name:'withdrawal through cookie settings stops scripts/events while form submission keeps working',status:'passed'});
  }finally{await withdrawal.context.close();}
  const invalid=await fixture('deny');try{
    await open(invalid);await fill(invalid.page);invalid.reply('invalid');
    await invalid.page.getByRole('button',{name:'Verstuur je aanvraag'}).click();
    await invalid.page.getByRole('alert').filter({hasText:'Fixture: controleer je invoer'}).waitFor();
    assert.equal(await invalid.page.getByLabel('Je naam',{exact:true}).inputValue(),'SYNTHETISCHE browserproef');
    assert.equal(await invalid.page.getByLabel('Vertel kort over je plannen').isDisabled(),false);
    assert.equal(await invalid.page.evaluate(()=>sessionStorage.getItem('sitesnit-contact-pending:/contact:contact')),null);
    await screenshot(invalid.page,'contact-validation-error');
    report.checks.push({name:'server validation failure unlocks original fields without losing input',status:'passed'});
  }finally{await invalid.context.close();}
  for(const failure of ['storage-unavailable','rate-limited']){
    const recovery=await fixture('allow');try{
      await open(recovery);await fill(recovery.page);recovery.reply(failure);
      await recovery.page.getByRole('button',{name:'Verstuur je aanvraag'}).click();
      await recovery.page.getByRole('alert').filter({hasText:failure==='storage-unavailable'?'Fixture: opslag':'Fixture: tijdelijk'}).waitFor();
      assert.equal(recovery.events.filter(event=>event[0]==='event'&&event[1]==='generate_lead').length,0);
      assert.equal(await recovery.page.getByLabel('Je naam',{exact:true}).inputValue(),'SYNTHETISCHE browserproef');
      assert.equal(await recovery.page.getByLabel('Vertel kort over je plannen').isDisabled(),failure==='storage-unavailable');
      const firstAttempt=recovery.calls[0];
      recovery.reply('success');
      await recovery.page.getByRole('button',{name:failure==='storage-unavailable'?'Controleer en probeer opnieuw':'Verstuur je aanvraag'}).click();
      await recovery.page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
      assert.equal(recovery.calls[1],firstAttempt,'retry preserves both payload and request ID');
      assert.equal(recovery.events.filter(event=>event[0]==='event'&&event[1]==='generate_lead').length,1);
      report.checks.push({name:`${failure}: original input retained, no premature lead, identical retry succeeds once`,status:'passed'});
    }finally{await recovery.context.close();}
  }
  const navigation=await fixture('allow');try{
    await open(navigation,'?dienst=seo-optimalisatie&token=fixture-private-token');
    // shell.tsx has a hidden desktop nav and numbered links inside the mobile dialog.
    const menuButton=navigation.page.getByRole('button',{name:'Menu openen',exact:true});
    if(await menuButton.isVisible()){
      await menuButton.click();
      await navigation.page.getByRole('dialog',{name:'Navigatiemenu',exact:true}).waitFor();
      await navigation.page.getByRole('navigation',{name:'Mobiele hoofdnavigatie',exact:true}).getByRole('link',{name:/Kosten/}).click();
    }else{
      await navigation.page.getByRole('navigation',{name:'Hoofdnavigatie',exact:true}).getByRole('link',{name:'Kosten',exact:true}).click();
    }
    await navigation.page.waitForURL(base.origin+'/kosten');
    await navigation.page.waitForFunction(()=>document.querySelector('h1')?.textContent?.length>0);
    await navigation.page.goBack({waitUntil:'networkidle'});
    await navigation.page.getByRole('combobox',{name:'Waar gaat je vraag over?'}).waitFor();
    await navigation.page.waitForFunction(()=>window.sitesnitAnalyticsId==='G-FIXTURE123');
    let pageViews=navigation.events.filter(event=>event[0]==='event'&&event[1]==='page_view');
    assert.equal(pageViews.filter(event=>new URL(event[2].page_location).pathname==='/contact').length,2,'returning to a public route records that visit once');
    assert.equal(pageViews.filter(event=>new URL(event[2].page_location).pathname==='/kosten').length,1,'clicking public navigation records one page view');
    await navigation.page.goForward({waitUntil:'networkidle'});
    await navigation.page.waitForURL(base.origin+'/kosten');
    await navigation.page.waitForFunction(()=>window.sitesnitAnalyticsId==='G-FIXTURE123');
    pageViews=navigation.events.filter(event=>event[0]==='event'&&event[1]==='page_view');
    assert.equal(pageViews.filter(event=>new URL(event[2].page_location).pathname==='/kosten').length,2,'forward navigation records that visit once');
    assert.equal(pageViews.filter(event=>new URL(event[2].page_location).pathname==='/contact').length,2,'forward navigation does not replay the previous page');
    assert.doesNotMatch(JSON.stringify(pageViews),/fixture-private-token|dienst=/,'queries and tokens never enter page views');
    const before=navigation.events.length,scriptsBefore=navigation.scripts();
    await navigation.page.goto(base.origin+'/hub/login',{waitUntil:'networkidle'});
    assert.equal(navigation.scripts(),scriptsBefore,'private routes do not load the analytics script');
    assert.equal(navigation.events.length,before,'private routes do not produce analytics events');
    assert.deepEqual(navigation.errors,[]);
    report.checks.push({name:'real navigation clicks, back and forward produce one sanitized page view per visit; Hub remains excluded',status:'passed'});
  }finally{await navigation.context.close();}
  const analyticsOutage=await fixture('allow',{blockAnalytics:true});try{
    await open(analyticsOutage);await fill(analyticsOutage.page);
    await analyticsOutage.page.getByRole('button',{name:'Verstuur je aanvraag'}).click();
    await analyticsOutage.page.getByRole('status').filter({hasText:'Je verhaal ligt klaar'}).waitFor();
    assert.equal(analyticsOutage.calls.length,1);
    assert.equal(analyticsOutage.scripts(),1,'an attempted analytics script request was actually blocked');
    assert.deepEqual(analyticsOutage.errors,[]);
    report.checks.push({name:'analytics network outage does not prevent one successful contact submission',status:'passed'});
  }finally{await analyticsOutage.context.close();}
  report.status='passed';
}catch(error){report.status='failed';report.error=error.stack;throw error;}
finally{report.completedAt=new Date().toISOString();writeFileSync(resolve(output,'browser-regression.json'),JSON.stringify(report,null,2)+'\n');await browser.close();}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,report:resolve(output,'browser-regression.json')}));
