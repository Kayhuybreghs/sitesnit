import {browserType,launchOptions,browserLabel} from './browser-runtime.mjs';
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';
const origin=process.argv[2]||'http://127.0.0.1:5191';
if(!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw Error('Local origin only');
const out=path.resolve(process.env.BROWSER_REPORT_ROOT||'reports/improvement/browser-ci','cases');await fs.mkdir(out,{recursive:true});
const report={buildId:(await fs.readFile('.next/BUILD_ID','utf8')).trim(),browser:browserLabel,records:[]};
const browser=await browserType.launch(launchOptions);
try{for(const width of [320,390,768,1440]){
const context=await browser.newContext({viewport:{width,height:width<768?844:1000},reducedMotion:'reduce'});
await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.abort());
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const slug of ['beurswijzer','beurswatcher']){
 await page.goto(`${origin}/projecten/${slug}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const consent=page.getByRole('button',{name:'Alleen noodzakelijk',exact:true});if(await consent.isVisible())await consent.click();
 const rows=await page.locator('.case-followup-list>div').evaluateAll(rows=>rows.map(row=>{const label=row.querySelector('dt'),body=row.querySelector('dd');return {label:label.textContent,gap:body.getBoundingClientRect().top-label.getBoundingClientRect().bottom,padding:getComputedStyle(row).paddingTop};}));
 assert.equal(rows.length,3);assert.ok(rows.every(r=>r.gap>=9),'Labels and explanations have deliberate separation');
 const links=await page.locator('.case-context-link a,.case-followup-list a').evaluateAll(a=>a.map(n=>({text:n.textContent,decoration:getComputedStyle(n).textDecorationLine})));
 assert.ok(links.length>=3&&links.every(a=>a.decoration.includes('underline')));
 for(const href of ['#opdracht','#ontwerpkeuzes','#opgeleverd','#na-de-bouw']){
  await page.locator(`.case-study-nav a[href="${href}"]`).click();
  assert.ok(await page.locator(href).evaluate(n=>{const r=n.getBoundingClientRect();return r.top>=0&&r.top<innerHeight;}),'Anchor section should land in view');
 }
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 const shots=[];
 if([390,1440].includes(width)){
  for(const [name,selector] of [['hero','.case-study-hero'],['brief','.case-study-brief'],['tools','.picture-reverse'],['mobile','.case-mobile-story'],['outcome','.case-study-outcome'],['followup','.case-continuity-band']]){
   const section=page.locator(selector);await section.scrollIntoViewIfNeeded();await section.locator('img').evaluateAll(images=>Promise.all(images.map(n=>n.decode())));
   const file=`${slug}-${width}-${name}.png`;await section.screenshot({path:path.join(out,file)});shots.push(file);
  }
 }
 assert.deepEqual(errors,[]);report.records.push({slug,width,rows,links,shots,passed:true});
}await context.close();
}}finally{await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}
console.log(`${report.records.length} case layout/navigation checks passed.`);
