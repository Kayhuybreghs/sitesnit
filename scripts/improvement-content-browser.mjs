import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const runtime = process.env.CONTENT_PLAYWRIGHT || path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const { chromium } = await import(pathToFileURL(runtime));
const origin = process.env.CONTENT_ORIGIN || 'http://127.0.0.1:5189';
const root = path.resolve('reports/improvement/content-review/browser', process.env.CONTENT_PROBE === 'true' ? 'probe' : '.');
await fs.mkdir(root, {recursive:true});
const routes = process.env.CONTENT_ROUTES?.split(',') || ['/diensten','/diensten/webdesign','/diensten/webdesign/pakketten','/kosten','/diensten/seo','/diensten/seo-optimalisatie','/diensten/seo-onderhoud','/diensten/content','/diensten/onderhoud-hosting','/seo-venlo','/webdesign-venlo','/contact','/diensten/webapps','/diensten/social-media','/diensten/ai-automatisering','/website-levert-geen-aanvragen-op','/maandelijkse-kosten-website','/website-onderhoud-kosten','/website-offerte-aanvragen','/website-niet-gevonden-google','/website-snelheid-testen'];
if(!['127.0.0.1','localhost'].includes(new URL(origin).hostname)||routes.some(route=>!/^\/[a-z0-9/-]*$/.test(route)))throw Error('Local public routes only.');
const widths=process.env.CONTENT_WIDTHS?.split(',').map(Number)||[360,390,768,1440];
if(widths.some(width=>![360,390,768,1440].includes(width)))throw Error('Unsupported viewport.');
const browser = await chromium.launch({headless:true, executablePath: process.env.CONTENT_BROWSER || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'});
const result = {createdAt:new Date().toISOString(),origin,mode:'Headless Edge emulation, reduced motion for content inspection; no physical device, no hero validation, no submitted forms.',records:[],navigations:[]};
result.buildId=(await fs.readFile('.next/BUILD_ID','utf8')).trim();
try {
  for (const width of widths) {
    const context=await browser.newContext({viewport:{width,height:width<768?844:1000},reducedMotion:'reduce'});
    await context.route('**/*', route => new URL(route.request().url()).origin===new URL(origin).origin || route.request().url().startsWith('data:') ? route.continue() : route.abort());
    const page=await context.newPage();
    for (const route of routes) {
      const errors=[];const onError=error=>errors.push(error.message);page.on('pageerror',onError);
      const response=await page.goto(origin+route,{waitUntil:'networkidle',timeout:90000});
      await page.locator('main h1').waitFor();
      await page.evaluate(()=>document.fonts.ready);
      const necessary=page.getByRole('button',{name:'Alleen noodzakelijk',exact:true});
      if(await necessary.isVisible())await necessary.click();
      const measurement=await page.locator('main').evaluate(main=>({h1:main.querySelector('h1')?.textContent,viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,mainWidth:main.scrollWidth}));
      const record={route,width,status:response.status(),...measurement,overflow:measurement.documentWidth>width+1,errors,screenshots:[]};
      if(record.overflow) record.overflowElements=await page.locator('main').evaluate(main=>[...main.querySelectorAll('*')].map(node=>{const rect=node.getBoundingClientRect();return {tag:node.tagName,class:node.className,text:node.textContent?.slice(0,70),left:rect.left,right:rect.right,width:rect.width};}).filter(rect=>rect.right>innerWidth+1||rect.left < -1).slice(0,35));
      if ([390,1440].includes(width)) {
        const name=route.slice(1).replaceAll('/','__');
        const header=path.join(root,`${name}-${width}-header.png`);await page.screenshot({path:header});record.screenshots.push(path.basename(header));
        const target=page.locator(route==='/kosten'?'.cost-packages':route==='/diensten/webdesign'?'.experience-copy-note':'.experience-questions');
        if (await target.count()) {
          await target.scrollIntoViewIfNeeded();
          // Scrolling starts native lazy loading; capture the actual image, not its reserved background.
          await target.locator('img').evaluateAll(images=>Promise.all(images.map(image=>image.decode())));
          const section=path.join(root,`${name}-${width}-details.png`);await page.screenshot({path:section});record.screenshots.push(path.basename(section));
          record.detailText=await target.innerText();
          record.detailsVisible=await target.isVisible();
        }
        if (['/diensten/seo-optimalisatie','/diensten/seo-onderhoud'].includes(route)) {
          const discovery=page.locator('.service-tool-discovery');await discovery.scrollIntoViewIfNeeded();
          const screenshot=path.join(root,`${name}-${width}-tool.png`);await discovery.screenshot({path:screenshot});record.screenshots.push(path.basename(screenshot));
          record.toolBlockVisible=await discovery.isVisible();
          await discovery.locator('a[href="/tools/seo-audit"]').click();await page.waitForURL(origin+'/tools/seo-audit');
          result.navigations.push({from:route,width,to:new URL(page.url()).pathname,action:'click contextual technical-audit link',pass:true});
        }
      }
      page.off('pageerror',onError);result.records.push(record);
      await fs.writeFile(path.join(root,'report.json'),JSON.stringify(result,null,2));
    }
    await context.close();
  }
} finally {await browser.close();}
console.log(JSON.stringify({routes:routes.length,viewports:widths.length,checks:result.records.length,overflows:result.records.filter(record=>record.overflow),pageErrors:result.records.filter(record=>record.errors.length),navigations:result.navigations.length},null,2));
if(result.records.some(record=>record.overflow||record.errors.length||record.status!==200))process.exitCode=1;
