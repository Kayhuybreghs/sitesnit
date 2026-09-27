import fs from 'node:fs/promises';
import {parse} from 'parse5';
import {routeCatalog} from '../lib/route-catalog.ts';
import {pageSeo} from '../app/page-seo-data.ts';
import {publicAssetPaths} from '../lib/public-asset-paths.ts';
import http from 'node:http';
import {toolRedirects} from '../lib/tool-routes.ts';
const origin=process.env.SEO_TEST_ORIGIN||'http://127.0.0.1:5186';
if(!['localhost','127.0.0.1'].includes(new URL(origin).hostname))throw new Error('Local fixture checks only.');
const report=[],failures=[];
// Node 24 fetch normalizes Host to the URL; http.request preserves the explicit
// production-host fixture without touching DNS, hosts files or indexing policy.
function get(path,production=false){return new Promise((resolve,reject)=>{
 const req=http.get(origin+path,{headers:production?{Host:'www.sitesnit.nl'}:{}},response=>{
  const chunks=[];response.on('data',b=>chunks.push(b));response.on('end',()=>resolve(new Response(Buffer.concat(chunks),{status:response.statusCode,headers:response.headers})));
 });req.setTimeout(15000,()=>req.destroy(new Error('Route timeout')));req.on('error',reject);
});}
const attrs=n=>Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]));
const text=n=>(n.nodeName==='#text'?n.value:'')+(n.childNodes||[]).map(text).join('');
function all(node,fn,result=[]){if(fn(node))result.push(node);for(const c of node.childNodes||[])all(c,fn,result);return result;}
for(const {path} of routeCatalog){
 const start=Date.now();const response=await get(path,true);const html=await response.text(),root=parse(html);
 const h1=all(root,n=>n.tagName==='h1').map(text),links=all(root,n=>n.tagName==='a').map(attrs).map(a=>a.href||'');
 const canon=all(root,n=>n.tagName==='link'&&attrs(n).rel==='canonical').map(attrs)[0]?.href;
 const ld=all(root,n=>n.tagName==='script'&&attrs(n).type==='application/ld+json');let validLd=true;for(const n of ld)try{JSON.parse(text(n));}catch{validLd=false;}
 const row={path,status:response.status,h1,canonical:canon,title:all(root,n=>n.tagName==='title').map(text)[0],jsonLd:ld.length,validLd,internalLinks:links.filter(l=>l.startsWith('/')&&!l.startsWith('//')),anchors:all(root,n=>attrs(n).id).map(n=>attrs(n).id),images:all(root,n=>n.tagName==='img').map(attrs).map(a=>a.src),responseMs:Date.now()-start,description:all(root,n=>n.tagName==='meta'&&attrs(n).name==='description').map(attrs)[0]?.content,browserDesktop:'NOT_TESTED',browserMobile:'NOT_TESTED'};
 const robots=all(root,n=>n.tagName==='meta'&&attrs(n).name==='robots').map(attrs).map(a=>a.content).join(' ');
 if(response.status!==200||h1.length!==1||!canon?.startsWith('https://www.sitesnit.nl')||!validLd||/noindex/i.test(robots+' '+response.headers.get('x-robots-tag')))failures.push({path,reason:'status/h1/canonical/schema/robots',robots});
 if(!response.headers.get('content-security-policy')?.includes("'nonce-"))failures.push({path,reason:'Missing HTML nonce CSP'});
 report.push(row);
}
const pages=new Map(report.map(r=>[r.path,r]));
for(const row of report){
 if(!row.title||!row.description||row.description!==pageSeo[row.path]?.description)failures.push({path:row.path,reason:'Missing or mismatching metadata'});
 for(const href of row.internalLinks){const url=new URL(href,origin),target=pages.get(url.pathname);if(target&&url.hash&&!target.anchors.includes(decodeURIComponent(url.hash.slice(1))))failures.push({path:row.path,href,reason:'Missing anchor'});}
}
for(const path of [...new Set(report.flatMap(r=>r.images).filter(p=>p?.startsWith('/')))]){const r=await get(path);if(r.status!==200)failures.push({path,reason:'Image unavailable',status:r.status});}
for(const redirect of toolRedirects){const r=await get(redirect.source);if(r.status!==308||new URL(r.headers.get('location'),origin).pathname!==redirect.destination)failures.push({path:redirect.source,reason:'Incorrect legacy redirect'});}
for(const path of [...publicAssetPaths].slice(0,2)){
 const response=await fetch(origin+path);if(response.status!==200||response.headers.has('content-security-policy'))failures.push({path,reason:'Static asset still has HTML nonce policy or does not exist'});
}
for(const path of ['/projecten/not-a-real-case','/diensten/unknown-service','/about/not-a-real-image.jpg']){
 const response=await fetch(origin+path);if(response.status!==404||!response.headers.get('content-security-policy'))failures.push({path,reason:'Unknown paths must retain 404 and HTML protection'});
}
const sitemap=await get('/sitemap.xml',true);const xml=await sitemap.text();
if(sitemap.status!==200||(xml.match(/<loc>/g)||[]).length!==routeCatalog.length)failures.push({path:'/sitemap.xml',reason:'Wrong sitemap entries'});
const privatePage=await fetch(origin+'/hub/admin/aanvragen',{redirect:'manual'});
if(![303,307].includes(privatePage.status)||!privatePage.headers.get('location')?.includes('/hub/login'))failures.push({path:'/hub/admin/aanvragen',reason:'Anonymous user not redirected to login'});
await fs.mkdir('reports',{recursive:true});await fs.writeFile('reports/routes-na-herstel.json',JSON.stringify({checkedAt:new Date().toISOString(),environment:'local-production-build',routes:report,failures},null,2));
console.log(`${report.length} public routes checked; ${failures.length} failures.`);if(failures.length){console.error(failures);process.exitCode=1;}
