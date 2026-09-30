/** Local production scene verification with screenshots. Never accesses live accounts. */
import {createRequire} from 'node:module';
import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/Gebruiker/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const phase=process.argv[2]||'before',base=new URL(process.argv[3]||'http://127.0.0.1:5188');
if(!['before','after'].includes(phase)||!['127.0.0.1','localhost'].includes(base.hostname))throw Error('Local before/after only');
const out=resolve('reports/improvement/hero-regression',phase);mkdirSync(out,{recursive:true});
const report={phase,origin:base.origin,date:new Date().toISOString(),buildId:readFileSync('.next/BUILD_ID','utf8').trim(),browser:'Headless Edge, Playwright viewport emulation',limits:['No physical iPhone/Safari test.','Timing observations from this laptop, not field INP or a performance percentile.'],cases:[]};
const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const save=()=>writeFileSync(resolve(out,'summary.json'),JSON.stringify(report,null,2)+'\n');
async function state(page){return page.evaluate(()=>{const hero=document.querySelector('[data-hero-journey]'),copy=document.querySelector('.hero-intro-copy'),header=document.querySelector('.header'),style=getComputedStyle(hero),rect=hero.getBoundingClientRect();return {y:scrollY,width:innerWidth,height:innerHeight,overflow:document.documentElement.scrollWidth>innerWidth,immersive:hero.classList.contains('is-immersive'),phase:hero.dataset.heroPhase,sceneHeight:rect.height,sceneTop:rect.top+scrollY,header:header?.getBoundingClientRect().height||0,copyHeight:copy.getBoundingClientRect().height,copyInert:copy.inert,center:Number(style.getPropertyValue('--hero-center')),split:Number(style.getPropertyValue('--hero-split')),dive:Number(style.getPropertyValue('--hero-dive')),camera:getComputedStyle(document.querySelector('.hero-camera')).transform,focused:document.activeElement?.textContent?.slice(0,70)};});}
try{
for(const [name,width,height,reducedMotion] of [['desktop',1440,900,'no-preference'],['laptop',1366,768,'no-preference'],['small-laptop',1280,720,'no-preference'],['mobile360',360,800,'no-preference'],['mobile390',390,844,'no-preference'],['tablet',768,1024,'no-preference'],['short-window',1280,600,'no-preference'],['reduced-motion',1440,900,'reduce']]){
 const context=await browser.newContext({viewport:{width,height},reducedMotion});
 await context.route('**/*',route=>new URL(route.request().url()).origin===base.origin?route.continue():route.abort());
 await context.addInitScript(()=>{window.__sceneMetrics={longTasks:[],shifts:[]};new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__sceneMetrics.longTasks.push({start:entry.startTime,duration:entry.duration});}).observe({type:'longtask',buffered:true});new PerformanceObserver(list=>{for(const entry of list.getEntries())if(!entry.hadRecentInput)window.__sceneMetrics.shifts.push({value:entry.value,sources:entry.sources?.map(source=>source.node?.className)});}).observe({type:'layout-shift',buffered:true});});
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 const item={name,viewport:{width,height},reducedMotion,states:[],errors};report.cases.push(item);
 await page.goto(base.origin,{waitUntil:'networkidle',timeout:90000});
 await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(250);
 await page.getByRole('button',{name:/Alleen noodzakelijk|Weiger/i}).first().click({timeout:1500}).catch(()=>{});
 item.states.push(await state(page));await page.screenshot({path:resolve(out,`${name}-intro.png`)});
 const start=item.states[0],distance=start.immersive?start.sceneHeight-height+start.header:Math.min(start.sceneHeight,height*1.5);
 for(let step=1;step<=5;step++){await page.mouse.wheel(0,distance/5);await page.waitForTimeout(200);item.states.push(await state(page));if(step===2||step===5)await page.screenshot({path:resolve(out,`${name}-phase-${step}.png`)});}
 await page.mouse.wheel(0,-distance);await page.waitForTimeout(500);item.back=await state(page);
 const primary=page.locator('.hero-intro .button');await primary.focus();await page.mouse.wheel(0,distance*.55);await page.waitForTimeout(300);item.focusWhileScrolling=await state(page);
 await page.mouse.wheel(0,-distance);await page.waitForTimeout(300);
 await page.locator('.hero-intro a[href="#werk"]').click();await page.waitForTimeout(600);item.anchor=await page.locator('#werk').evaluate(el=>({top:el.getBoundingClientRect().top,height:el.getBoundingClientRect().height,hash:location.hash}));
 await page.reload({waitUntil:'networkidle'});await page.waitForTimeout(200);item.reload=await state(page);
 await page.goto(base.origin+'/diensten',{waitUntil:'networkidle'});item.otherRoute=await page.evaluate(()=>({hero:!!document.querySelector('[data-hero-journey]'),depth:document.documentElement.classList.contains('depth-enabled')}));
 await page.goBack({waitUntil:'networkidle'});await page.waitForTimeout(200);item.historyBack=await state(page);
 item.metrics=await page.evaluate(()=>window.__sceneMetrics);item.conclusions={respondsToScroll:Math.max(...item.states.map(s=>s.split+s.center+s.dive))>0,noHorizontalOverflow:item.states.every(s=>!s.overflow),focusRetained:!item.focusWhileScrolling.copyInert,anchorReached:item.anchor.hash==='#werk',noPageErrors:errors.length===0};
 if(name==='desktop'){await page.setViewportSize({width:1280,height:600});await page.waitForTimeout(500);item.resizedShort=await state(page);await page.setViewportSize({width,height});await page.waitForTimeout(500);item.resizedBack=await state(page);await page.evaluate(()=>{scrollTo(0,0);document.documentElement.style.fontSize='200%';});await page.waitForTimeout(1500);item.textZoom=await state(page);}
 save();console.log(JSON.stringify({name,...item.conclusions,immersive:start.immersive}));await context.close();
}
}finally{await browser.close();report.finishedAt=new Date().toISOString();save();}
report.failures=report.cases.flatMap(item=>{
 const failed=Object.entries(item.conclusions).filter(([key,pass])=>key!=='respondsToScroll'&&!pass).map(([key])=>key);
 const staticExpected=['short-window','reduced-motion'].includes(item.name);
 if(!staticExpected&&!item.conclusions.respondsToScroll)failed.push('normal scene does not respond to scroll');
 if(staticExpected&&item.states[0].immersive)failed.push('static fallback missing');
 if(item.name==='desktop'&&(item.resizedShort.immersive||!item.resizedBack.immersive||item.textZoom.immersive||item.textZoom.overflow))failed.push('resize or text zoom fallback failed');
 return failed.map(check=>({name:item.name,check}));
});save();if(report.failures.length){console.error(JSON.stringify(report.failures));process.exitCode=1;}
