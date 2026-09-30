// HTTP resource inventory, not Lighthouse or a browser/field performance score.
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {createHash} from 'node:crypto';
const phase=process.argv[2];
if(!['before','after'].includes(phase))throw new Error('Use before or after.');
const origin=process.env.SEO_TEST_ORIGIN||'http://127.0.0.1:5188';
if(new URL(origin).hostname!=='127.0.0.1')throw new Error('Local fixture server only.');
const paths=['/','/diensten','/diensten/seo-optimalisatie','/seo-venlo','/website-structuur','/kosten','/projecten/beurswijzer','/contact','/tools/website-check','/tools/website-kosten-berekenen','/tools/website-offerte-vergelijken','/tools/automatiseringsplan','/tools/website-ontwerp-tool','/tools/seo-audit','/privacy'];
const rows=[];
for(const path of paths){
 const runs=[];let html='';
 for(let run=0;run<3;run++){
  const start=performance.now();const response=await fetch(origin+path);const headersMs=performance.now()-start;
  html=await response.text();runs.push({run:run+1,status:response.status,headersMs,completeMs:performance.now()-start,htmlBytes:Buffer.byteLength(html)});
 }
 const resources=[];
 for(const url of new Set([...html.matchAll(/(?:src|href)="([^"<>]+)"/g)].map(m=>m[1].replaceAll('&amp;','&')).filter(s=>s.startsWith('/_next/static/')&&/\.(js|css|woff2?)(\?|$)/.test(s)))){
  const response=await fetch(new URL(url,origin));const body=Buffer.from(await response.arrayBuffer());
  resources.push({url,status:response.status,type:new URL(url,origin).pathname.split('.').at(-1),bytes:body.length,sha256:createHash('sha256').update(body).digest('hex')});
 }
 rows.push({path,runs,medianHeadersMs:runs.map(r=>r.headersMs).sort((a,b)=>a-b)[1],resources,resourceBytes:resources.reduce((n,r)=>n+r.bytes,0)});
}
fs.mkdirSync('reports/improvement/performance',{recursive:true});
fs.writeFileSync(`reports/improvement/performance/http-${phase}.json`,JSON.stringify({date:new Date().toISOString(),origin,buildId:fs.readFileSync('.next/BUILD_ID','utf8').trim(),description:'Three sequential localhost HTTP requests per route. Decoded initial static resource sizes. No browser cache/CPU/network simulation. No LCP/CLS/INP/long-task claim.',rows},null,2));
console.log(JSON.stringify(rows.map(r=>({path:r.path,medianHeadersMs:Math.round(r.medianHeadersMs),resourceBytes:r.resourceBytes})),null,2));
