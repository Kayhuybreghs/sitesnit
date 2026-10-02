import {browserType,launchOptions} from './browser-runtime.mjs';
import {writeFileSync} from 'node:fs';

const origin=process.argv[2]||'http://127.0.0.1:5188';
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw Error('Local only');
const browser=await browserType.launch(launchOptions);
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.route('**/*',route=>new URL(route.request().url()).origin===origin?route.continue():route.abort());
const samples=[];
async function sample(label){samples.push(await page.evaluate(label=>{const hero=document.querySelector('[data-hero-journey]'),copy=document.querySelector('.hero-intro-copy');return {label,y:scrollY,immersive:hero.classList.contains('is-immersive'),introTop:copy.offsetTop,copyHeight:copy.offsetHeight,rectHeight:copy.getBoundingClientRect().height,header:document.querySelector('.header').offsetHeight,cue:document.querySelector('.hero-scroll-cue').offsetHeight,overflow:document.documentElement.scrollWidth>innerWidth};},label));}
try{
 await page.goto(origin,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await sample('normal');
 await page.evaluate(()=>document.documentElement.style.fontSize='200%');await page.waitForTimeout(1500);await sample('zoom at top');
 await page.evaluate(()=>scrollTo(0,1700));await page.waitForTimeout(500);await sample('zoom scrolled');
 await page.screenshot({path:(process.env.BROWSER_REPORT_ROOT || 'reports/improvement') + '/hero-regression/zoom-probe.png',fullPage:false});
 await page.evaluate(()=>document.documentElement.style.fontSize='');await page.waitForTimeout(1000);await sample('reset scrolled');
 writeFileSync((process.env.BROWSER_REPORT_ROOT || 'reports/improvement') + '/hero-regression/zoom-probe.json',JSON.stringify(samples,null,2));console.log(JSON.stringify(samples,null,2));
}finally{await browser.close();}
