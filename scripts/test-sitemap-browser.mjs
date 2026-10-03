import {analyzeReachability} from './route-reachability.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import {browserType,launchOptions,browserLabel} from './browser-runtime.mjs';
import {independentlyPublishedPages,inspectSitemap,sitemapGroupIds} from './sitemap-contract.mjs';
import {readPage} from './public-route-checks.mjs';
const origin=process.env.SEO_TEST_ORIGIN||'http://127.0.0.1:5192';
assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname));
const out=path.resolve(process.env.BROWSER_REPORT_ROOT||'reports/improvement/nmr-2026-10-02/sitemap-browser');await fs.mkdir(out,{recursive:true});
const report={browser:browserLabel,renderMode:process.env.NMR_RENDER_MODE||'production',checks:[]};
const request=route=>new Promise((resolve,reject)=>{http.get(origin+route,{headers:{Host:'www.sitesnit.nl'}},r=>{let body='';r.on('data',d=>body+=d);r.on('end',()=>resolve({status:r.statusCode,body,headers:r.headers}));}).on('error',reject);});
const expected=await independentlyPublishedPages(process.cwd()),response=await request('/sitemap');assert.equal(response.status,200);
const statuses={},links=[];for(const route of expected){const r=await request(route);statuses[route]=r.status;links.push(...readPage(r.body,route,r.headers).links.map(href=>({source:route,href})));}
report.graphs={withSitemap:analyzeReachability(expected,links),withoutSitemap:analyzeReachability(expected.filter(p=>p!=='/sitemap'),links)};
assert.deepEqual(report.graphs.withSitemap.failures,[]);assert.deepEqual(report.graphs.withoutSitemap.failures,[]);
assert.deepEqual(inspectSitemap(response.body,expected,statuses),[]);
const seo=readPage(response.body,'/sitemap',response.headers);
assert.equal(seo.titles[0],'Websiteoverzicht | Sitesnit');assert.deepEqual(seo.canonicals,['https://www.sitesnit.nl/sitemap']);
assert.ok(!/noindex/.test(seo.robots));assert.ok(!seo.schemas.some(s=>['FAQPage','Review','Product'].includes(s['@type'])));
const xml=await request('/sitemap.xml');assert.equal(xml.status,200);assert.equal((xml.body.match(/<loc>https:\/\/www.sitesnit.nl\/sitemap<\/loc>/g)||[]).length,1);
assert.match((await request('/robots.txt')).body,/Sitemap: https:\/\/www.sitesnit.nl\/sitemap.xml/);
report.http={targets:expected.length,treeTargets:expected.length-1,title:seo.titles[0],canonicals:seo.canonicals,xml:'one HTML route; existing XML handler',status:'passed'};
const browser=await browserType.launch(launchOptions);
try{for(const javaScriptEnabled of [true,false])for(const width of [390,768,1440,320]){
 const context=await browser.newContext({javaScriptEnabled,viewport:{width,height:900},reducedMotion:'reduce'});
 await context.addInitScript(()=>localStorage.setItem('sitesnit-cookie-consent-v1',JSON.stringify({version:1,analytics:false,decidedAt:Date.now(),measurementId:'G-FIXTURE123'})));
 await context.route('**/*',r=>new URL(r.request().url()).origin===origin&&!r.request().url().includes('/api/')?r.continue():r.abort());
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(origin+'/kosten',{waitUntil:'networkidle'});
 await page.locator('footer').getByRole('link',{name:'Websiteoverzicht',exact:true}).click();await page.waitForURL(origin+'/sitemap');
 assert.equal(await page.locator('h1').innerText(),'Alle pagina’s van Sitesnit.');
 assert.equal(await page.locator('[data-sitemap-tree] a').count(),expected.length-1);
 assert.equal(await page.locator('.header a[href="/sitemap"]').count(),0);
 const landings=[];for(const id of sitemapGroupIds){
  const link=page.locator('.overview-jumps a[href="#'+id+'"]');await link.focus();assert.equal(await link.evaluate(e=>getComputedStyle(e).outlineStyle),'solid');
  await page.keyboard.press('Enter');
  const target=page.locator('#'+id);await target.waitFor();
  const box=await target.boundingBox();const header=await page.locator('.header').boundingBox();
  assert.ok(box.y>=Math.max(0,header?.height||0)-1,id+' behind header');assert.ok(box.y<300,id+' did not land');
  landings.push({id,top:box.y});
 }
 await page.evaluate(()=>scrollTo(0,0));
 const name=`sitemap-${width}-${javaScriptEnabled?'js':'nojs'}.png`;await page.screenshot({caret:'initial',path:path.join(out,name),fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 if(width===390||width===1440){await page.evaluate(()=>document.querySelectorAll('main *').forEach(e=>{if(!e.children.length&&e.textContent.trim())e.style.fontSize=parseFloat(getComputedStyle(e).fontSize)*2+'px';}));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false,'zoom overflow');}
 await page.locator('[data-sitemap-tree] a[href="/tools/snelheidstest/pagespeed-score"]').click();await page.waitForURL(origin+'/tools/snelheidstest/pagespeed-score');assert.ok(await page.locator('main h1').isVisible());
 assert.deepEqual(errors,[]);report.checks.push({width,javaScriptEnabled,landings,screenshot:name,status:'passed',footerNavigation:true,guideNavigation:true});await context.close();
}report.status='passed';}catch(error){report.status='failed';report.error=error.stack;throw error;}finally{await browser.close();await fs.writeFile(path.join(out,'report.json'),JSON.stringify(report,null,2));}
console.log(JSON.stringify({status:report.status,checks:report.checks.length,targets:expected.length}));
