import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import {routeCatalog} from '../lib/route-catalog.ts';
const origin='http://127.0.0.1:5186';
// Native HTTP preserves the test Host header; fetch normalizes it to its URL.
function fetch(url,options={}){return new Promise((resolve,reject)=>{
  http.get(url,{headers:options.headers},response=>{let body='';response.setEncoding('utf8');response.on('data',chunk=>body+=chunk);response.on('end',()=>resolve({status:response.statusCode,headers:new Headers(response.headers),text:async()=>body}));}).on('error',reject);
});}
const results=[];
for(const {path} of routeCatalog){
  const response=await fetch(origin+path,{headers:{host:'www.sitesnit.nl'},redirect:'manual'});
  const html=await response.text();
  assert.equal(response.status,200,path);
  assert.match(html,/<meta name="robots" content="index, follow"/,path);
  assert.ok(html.includes(`rel="canonical" href="https://www.sitesnit.nl${path==='/'?'':path}"`),path+' canonical');
  const csp=response.headers.get('content-security-policy');
  const nonce=csp?.match(/'nonce-([^']+)'/)?.[1];
  assert.ok(nonce,path+' CSP');
  for(const tag of html.matchAll(/<script\b[^>]*>/g))assert.ok(tag[0].includes(`nonce="${nonce}"`),path+' script nonce');
  results.push({path,status:200,index:true,canonical:true,nonce:true});
}
for(const host of ['localhost:5186','sitesnit.nl','test.vercel.app']){
  const r=await fetch(origin,{headers:{host}});assert.match(await r.text(),/name="robots" content="noindex, follow"/);
}
const privateResponse=await fetch(origin+'/hub/demo',{headers:{host:'www.sitesnit.nl'},redirect:'manual'});
assert.match(privateResponse.headers.get('x-robots-tag'),/noindex/);
const sitemap=await fetch(origin+'/sitemap.xml',{headers:{host:'www.sitesnit.nl'}}).then(r=>r.text());
assert.ok(sitemap.includes('https://www.sitesnit.nl'));assert.ok(!sitemap.includes('https://sitesnit.nl'));
await fs.writeFile('reports/seo-production-index.json',JSON.stringify({checkedAt:new Date().toISOString(),environment:'local production simulation; not live deployment',results,previewAndPrivateExcluded:true,sitemap:true},null,2));
console.log(`${results.length} public routes: index, www canonical and CSP nonces verified. Preview/private boundaries passed.`);
