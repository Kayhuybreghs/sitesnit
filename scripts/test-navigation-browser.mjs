import {browserType,launchOptions} from './browser-runtime.mjs';
/** Loopback-only UI verification. No form submission, API execution or external network.
 * Run serially: node scripts/test-navigation-browser.mjs http://127.0.0.1:5188
 * Optional: --width=360|390|768|1440 --only=navigation|cookies|regions
 * Audit code and tool exports are covered separately by test-tool-browser.mjs.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const args=process.argv.slice(2);
const base=new URL(args.find(arg=>!arg.startsWith('--'))||'http://127.0.0.1:5188');
if(base.protocol!=='http:'||!['localhost','127.0.0.1'].includes(base.hostname)||base.username||base.password||base.pathname!=='/'||base.search||base.hash)throw Error('Only a loopback HTTP origin is allowed.');
const option=name=>args.find(arg=>arg.startsWith(`--${name}=`))?.split('=')[1];
const selectedWidth=option('width'),only=option('only');
const widths=selectedWidth?[Number(selectedWidth)]:[360,390,768,1440];
if(widths.some(width=>![360,390,768,1440].includes(width)))throw Error('Unsupported --width.');
if(only&&!['navigation','cookies','regions'].includes(only))throw Error('Unsupported --only.');
const output=path.resolve((process.env.BROWSER_REPORT_ROOT || 'reports/improvement') + '/navigation-browser');
await fs.mkdir(output,{recursive:true});
const suffix=`${only?'-'+only:''}${selectedWidth?'-'+selectedWidth:''}`;
const reportPath=path.join(output,`report${suffix}.json`);
const report={status:'not-completed',startedAt:new Date().toISOString(),origin:base.origin,widths,only:only||null,checks:[],
  limitations:['Headless Edge with touch emulation and reduced motion; no physical phone, Safari or screen-reader test.',
    'No forms are submitted. All API requests and requests outside this origin are blocked.',
    'Expected blocked-network failures are diagnostic, not JavaScript page errors. Actual uncaught JavaScript exceptions fail the affected check.',
    'Consent enable/disable is only tested when the served build exposes its analytics checkbox; disabled configuration is reported explicitly.',
    'Audit code and tool-export behavior belong to the separate tool harness; this script tests navigation, cookie controls and representative content regions.']};
const save=()=>fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n');
report.buildId=(await fs.readFile('.next/BUILD_ID','utf8')).trim();
await save();
const browser=await browserType.launch(launchOptions);

async function open(page,route){
  const response=await page.goto(base.origin+route,{waitUntil:'networkidle',timeout:60000});
  assert.equal(response?.status(),200,`${route}: HTTP response`);
  await page.locator('main h1').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  const deny=page.locator('.cookie-banner').getByRole('button',{name:'Alleen noodzakelijk',exact:true});
  if(await deny.isVisible())await deny.tap();
}
async function capture(page,name,width){
  const file=`${name}-${width}.png`;
  await page.screenshot({path:path.join(output,file),fullPage:false,timeout:15000});
  return file;
}
async function layout(page){
  return page.evaluate(()=>{
    const viewport=innerWidth,documentWidth=document.documentElement.scrollWidth;
    return {viewport,documentWidth,overflow:documentWidth>viewport+1,
      overflowElements:documentWidth>viewport+1?[...document.querySelectorAll('main *,dialog[open] *')].map(node=>{
        const r=node.getBoundingClientRect();return {tag:node.tagName,class:node.className,text:node.textContent?.trim().slice(0,90),left:r.left,right:r.right,width:r.width};
      }).filter(r=>r.width&&((r.right>viewport+1)||(r.left < -1))).slice(0,40):[]};
  });
}
async function focused(locator){return locator.evaluate(node=>node===document.activeElement);}
async function waitFocus(locator){await locator.evaluate(node=>new Promise((resolve,reject)=>{
  const end=performance.now()+3000;const check=()=>node===document.activeElement?resolve(true):performance.now()>end?reject(Error('Focus did not return')):requestAnimationFrame(check);check();
}));}

async function navigation(page,width){
  await open(page,'/diensten');
  const trigger=page.getByRole('button',{name:'Menu openen',exact:true});
  if(await trigger.isVisible()){
    const menu=page.getByRole('dialog',{name:'Navigatiemenu',exact:true});
    await trigger.tap();await menu.waitFor({state:'visible'});
    assert.equal(await trigger.getAttribute('aria-expanded'),'true');
    const tools=menu.locator('.mobile-tool-links a');
    assert.equal(await tools.count(),8,'Overview plus all seven real tools must be available in the mobile menu.');
    assert.equal(await tools.filter({hasText:'Snelheidstest'}).count(),1);
    assert.equal(await menu.evaluate(node=>node.contains(document.activeElement)),true,'Dialog must receive focus.');
    const focusable=menu.locator('a[href],button:not(:disabled)');
    await focusable.last().focus();await page.keyboard.press('Tab');
    assert.equal(await focused(focusable.first()),true,'Tab wraps to first menu control.');
    await page.keyboard.press('Shift+Tab');
    assert.equal(await focused(focusable.last()),true,'Shift+Tab wraps to last menu control.');
    const screenshot=await capture(page,'mobile-menu',width);
    await page.keyboard.press('Escape');await menu.waitFor({state:'hidden'});await waitFocus(trigger);
    assert.equal(await trigger.getAttribute('aria-expanded'),'false');
    await page.keyboard.press('Enter');await menu.waitFor({state:'visible'});
    await menu.getByRole('button',{name:'Menu sluiten',exact:true}).tap();
    await menu.waitFor({state:'hidden'});await waitFocus(trigger);
    await trigger.tap();await menu.waitFor({state:'visible'});
    await menu.locator('a[href="/tools/website-kosten-berekenen"]').tap();
    await page.waitForURL(base.origin+'/tools/website-kosten-berekenen');
    await menu.waitFor({state:'hidden'});
    assert.equal(await page.evaluate(()=>document.body.style.overflow),'','Closing navigation restores page scroll.');
    return {mode:'mobile dialog; tools appear as direct links, not a nested hover menu',touchToolNavigation:'/tools/website-kosten-berekenen',keyboard:['Tab wrap','Shift+Tab wrap','Escape focus return','Enter opens'],screenshot};
  }
  const menu=page.locator('.desktop-nav details.tools-menu'),summary=menu.locator('summary');
  await summary.tap();assert.equal(await menu.evaluate(node=>node.open),true,'Touch opens desktop submenu without hover.');
  assert.equal(await menu.locator('a').count(),8);
  assert.equal(await menu.locator('a[href="/tools/snelheidstest"]').count(),1);
  const screenshot=await capture(page,'desktop-tools-menu',width);
  await page.keyboard.press('Escape');assert.equal(await menu.evaluate(node=>node.open),false);await waitFocus(summary);
  await page.keyboard.press('Enter');assert.equal(await menu.evaluate(node=>node.open),true);
  await page.keyboard.press('Tab');assert.equal(await focused(menu.locator('a').first()),true);
  await page.keyboard.press('Escape');assert.equal(await menu.evaluate(node=>node.open),false);await waitFocus(summary);
  await summary.tap();await page.locator('.desktop-nav a[href="/kosten"]').focus();
  assert.equal(await menu.evaluate(node=>node.open),false,'Leaving the submenu closes it.');
  await summary.tap();await menu.locator('a[href="/tools/website-kosten-berekenen"]').tap();
  await page.waitForURL(base.origin+'/tools/website-kosten-berekenen');
  return {mode:'desktop touch submenu',touchToolNavigation:'/tools/website-kosten-berekenen',keyboard:['Enter opens','Tab enters tools','Escape focus return','blur closes'],screenshot};
}

async function cookies(page,width){
  await open(page,'/diensten');
  const trigger=page.getByRole('button',{name:'Cookie-instellingen',exact:true});
  const dialog=page.locator('dialog.cookie-dialog');
  const show=async()=>{await trigger.tap();await dialog.waitFor({state:'visible'});};
  await show();assert.equal(await dialog.evaluate(node=>node.contains(document.activeElement)),true);
  const box=dialog.locator('input[type="checkbox"]');
  const configured=await box.count()===1;
  const screenshot=await capture(page,'cookie-settings',width);
  const measurements=await dialog.evaluate(node=>{const r=node.getBoundingClientRect();return {left:r.left,right:r.right,width:r.width,height:r.height,viewportWidth:innerWidth};});
  assert.ok(measurements.left>=-1&&measurements.right<=width+1,'Cookie dialog fits viewport.');
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await waitFocus(trigger);
  await show();
  if(!configured){
    assert.match(await dialog.innerText(),/Analyse staat uit/);
    assert.equal(await page.locator('#sitesnit-consented-analytics').count(),0);
    await dialog.getByRole('button',{name:'Sluiten',exact:true}).tap();await dialog.waitFor({state:'hidden'});await waitFocus(trigger);
    return {configured:false,toggle:'not-executed: analytics is disabled in this build',reopen:true,escapeFocusReturn:true,closeButtonFocusReturn:true,screenshot,measurements};
  }
  await box.check();await dialog.getByRole('button',{name:'Keuze opslaan',exact:true}).tap();
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sitesnit-cookie-consent-v1')||'null')?.analytics===true);
  await page.waitForFunction(()=>Boolean(document.getElementById('sitesnit-consented-analytics')));
  await show();assert.equal(await box.isChecked(),true,'Allowed choice survives reopening.');
  await box.uncheck();
  await Promise.all([page.waitForEvent('load'),dialog.getByRole('button',{name:'Keuze opslaan',exact:true}).tap()]);
  await page.waitForFunction(()=>JSON.parse(localStorage.getItem('sitesnit-cookie-consent-v1')||'null')?.analytics===false);
  await page.waitForLoadState('networkidle');
  await show();assert.equal(await box.isChecked(),false,'Revoked choice survives reopening/reload.');
  assert.equal(await page.locator('#sitesnit-consented-analytics').count(),0,'Revocation removes analytics script.');
  await page.keyboard.press('Escape');await dialog.waitFor({state:'hidden'});await waitFocus(trigger);
  return {configured:true,toggle:'enabled then disabled; external analytics requests blocked',reopen:true,escapeFocusReturn:true,revocationPersists:true,screenshot,measurements};
}

async function regions(page,width){
  const records=[];
  for(const route of ['/diensten/social-media','/maandelijkse-kosten-website','/projecten/beurswijzer','/projecten/beurswatcher']){
    await open(page,route);
    const tables=page.locator('main table, main [role="table"]');
    const tableRecords=[];
    for(let i=0;i<await tables.count();i++){
      const table=tables.nth(i);await table.scrollIntoViewIfNeeded();
      tableRecords.push(await table.evaluate(node=>{
        const r=node.getBoundingClientRect();let container=node;
        while(container.parentElement&&container.scrollWidth<=container.clientWidth+1)container=container.parentElement;
        const style=getComputedStyle(container),scrollable=/auto|scroll/.test(style.overflowX)&&container.scrollWidth>container.clientWidth+1;
        let reachable=null;if(scrollable){const old=container.scrollLeft;container.scrollLeft=container.scrollWidth;reachable=container.scrollLeft>0;container.scrollLeft=old;}
        return {tag:node.tagName,role:node.getAttribute('role'),width:r.width,left:r.left,right:r.right,rows:node.querySelectorAll('tr,[role="row"]').length,nonempty:!!node.textContent?.trim(),localHorizontalScroll:scrollable,programmaticEndReachable:reachable};
      }));
    }
    const isCase=route.startsWith('/projecten/');
    if(isCase)await page.locator('.case-study-outcome').scrollIntoViewIfNeeded();
    else assert.ok(tableRecords.length>0,`${route}: expected a real table or table role`);
    assert.ok(tableRecords.every(table=>table.nonempty&&table.width>0&&table.rows>1),'Tables must contain visible rows.');
    assert.ok(tableRecords.every(table=>table.programmaticEndReachable!==false),'The end of a horizontally scrollable table must be reachable.');
    const measurement=await layout(page);
    records.push({route,tables:tableRecords,...measurement,screenshot:await capture(page,route.slice(1).replaceAll('/','__'),width)});
  }
  return {regions:records};
}

try{
  for(const width of widths){
    const context=await browser.newContext({viewport:{width,height:width<768?844:1000},hasTouch:true,reducedMotion:'reduce',serviceWorkers:'block'});
    const blocked=[],errors=[];
    await context.route('**/*',async route=>{
      const request=route.request(),url=new URL(request.url());
      if(url.origin!==base.origin||url.pathname.startsWith('/api/')||!['GET','HEAD'].includes(request.method())){
        blocked.push({origin:url.origin,path:url.origin===base.origin?url.pathname:undefined,method:request.method(),reason:url.origin!==base.origin?'outside-origin':'api-or-write-blocked'});
        return route.abort('blockedbyclient');
      }
      return route.continue();
    });
    const page=await context.newPage();page.setDefaultTimeout(15000);
    page.on('pageerror',error=>errors.push(error.message));
    try{
      for(const [name,flow] of Object.entries({navigation,cookies,regions})){
        if(only&&only!==name)continue;
        const errorStart=errors.length,requestStart=blocked.length,start=Date.now();
        let details={};
        try{
          details=await flow(page,width);
          const measurement=await layout(page);
          details.layout=measurement;
          assert.equal(measurement.overflow,false,'Unexpected document horizontal overflow.');
          if(details.regions)assert.deepEqual(details.regions.filter(record=>record.overflow).map(record=>record.route),[],'Region route overflow.');
          assert.deepEqual(errors.slice(errorStart),[],'Uncaught page exception.');
          assert.equal(blocked.slice(requestStart).some(request=>request.path==='/api/contact'),false,'No contact submission is expected.');
          report.checks.push({name,width,status:'passed',durationMs:Date.now()-start,...details,blockedRequests:blocked.slice(requestStart)});
          console.log(`PASS ${name} ${width}`);
        }catch(error){
          report.checks.push({name,width,status:'failed',durationMs:Date.now()-start,...details,error:error.message,browserErrors:errors.slice(errorStart),blockedRequests:blocked.slice(requestStart),layout:await layout(page).catch(()=>null),screenshot:await capture(page,`${name}-failure`,width).catch(()=>null)});
          console.error(`FAIL ${name} ${width}: ${error.message}`);
        }
        await save();
      }
    }finally{await context.close();}
  }
}finally{
  report.completedAt=new Date().toISOString();
  report.status=report.checks.length===widths.length*(only?1:3)&&report.checks.every(check=>check.status==='passed')?'passed':'failed';
  await save();await browser.close();
}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,report:reportPath}));
if(report.status!=='passed')process.exitCode=1;
