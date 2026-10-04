import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const origin=process.env.SEO_TEST_ORIGIN||'http://127.0.0.1:5186';
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw Error('Local fixture server only');
const out=resolve(process.env.BROWSER_REPORT_ROOT||'reports/improvement/browser-ci');
mkdirSync(out,{recursive:true});const results=[];
function run(script,args=[],extra={}){
  const start=Date.now();const p=spawnSync(process.execPath,['--experimental-strip-types','--import','./scripts/typescript-test-loader.mjs',`scripts/${script}`,...args],{env:{...process.env,BROWSER_REPORT_ROOT:out,...extra},stdio:'inherit',timeout:600000,windowsHide:true});
  results.push({script,args,engine:extra.TEST_BROWSER||process.env.TEST_BROWSER||'chromium',status:p.status===0?'passed':'failed',elapsedMs:Date.now()-start});
  writeFileSync(resolve(out,'suite.json'),JSON.stringify({completedAt:new Date().toISOString(),commit:process.env.GITHUB_SHA||null,results},null,2));
  if(p.error||p.status!==0)throw p.error||Error(`Required browser check failed: ${script} (${p.status})`);
}
run('test-navigation-browser.mjs',[origin]);
run('test-tool-browser.mjs',[origin]);
run('test-speed-browser.mjs',[origin]);
run('test-speed-contact-browser.mjs',[],{SEO_TEST_ORIGIN:origin,BROWSER_REPORT_ROOT:resolve(out,'speed-contact')});
run('test-contact-recovery-browser.mjs',[],{SEO_TEST_ORIGIN:origin});
run('test-contact-pending-rejections-browser.mjs',[],{SEO_TEST_ORIGIN:origin});
run('test-contact-choice-browser.mjs',[],{SEO_TEST_ORIGIN:origin});
run('test-sitemap-browser.mjs',[],{SEO_TEST_ORIGIN:origin,BROWSER_REPORT_ROOT:resolve(out,'sitemap')});
run('test-case-layout.mjs',[origin]);
run('test-hero-regression.mjs',['after',origin]);
for(const width of ['390','1440']){
  run('test-contact-browser.mjs',[origin,width]);
  run('test-contact-chain-browser.mjs',[origin,width]);
  run('test-hub-browser.mjs',[`--width=${width}`]);
}
run('improvement-content-browser.mjs',[],{CONTENT_ORIGIN:origin});
// A second engine for the critical mobile scene and real contact handler boundary.
run('test-hero-regression.mjs',['after',origin],{TEST_BROWSER:'webkit',TEST_HERO_PROFILE:'mobile390',BROWSER_REPORT_ROOT:resolve(out,'webkit')});
run('test-contact-chain-browser.mjs',[origin,'390'],{TEST_BROWSER:'webkit',BROWSER_REPORT_ROOT:resolve(out,'webkit')});
