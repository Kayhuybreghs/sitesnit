import test from 'node:test';
import assert from 'node:assert/strict';
import {CHECK_COUNT,htmlCatalog,lighthouseCatalog} from '../lib/seo-audit/check-catalog.ts';
import {detailedHtml,finishCrossChecks,lighthouseChecks} from '../lib/seo-audit/detailed.ts';
import {analyze} from '../lib/seo-audit/analyze.ts';
import {auditOverview} from '../lib/seo-audit/overview.ts';
import {attachMobileLab} from '../lib/seo-audit/lab.ts';
const page=(body,url='https://example.com/',status=200)=>{const r={url,status,body,headers:{'content-type':'text/html'}};const p=analyze(r);p.detailedChecks=detailedHtml(r,p);return p;};
const get=(p,id)=>p.detailedChecks.find(c=>c.id===id);
const report=pages=>({version:2,origin:'https://example.com',checkedAt:new Date().toISOString(),pages,findings:[],discovered:pages.length,skipped:0,limited:false,notes:[]});
test('catalog has 100 distinct tests with separate HTML and lab sources',()=>{
 assert.equal(CHECK_COUNT,100);assert.equal(htmlCatalog.length,60);assert.equal(lighthouseCatalog.length,40);
 assert.equal(new Set([...htmlCatalog.map(c=>c[0]),...lighthouseCatalog.map(c=>'lh-'+c[0])]).size,100);
});
test('empty feature sets do not create free successes; weak HTML cannot score as perfect',()=>{
 const p=page('<title>Test</title>');finishCrossChecks([p]);
 assert.equal(get(p,'json').state,'not-applicable');assert.equal(get(p,'alt').state,'not-applicable');
 assert.equal(get(p,'description').state,'failed');assert.equal(get(p,'h1').state,'failed');
 assert.equal(get(p,'viewport').state,'failed');assert.equal(get(p,'og-title').state,'failed');
 const summary=auditOverview(report([p]));assert(summary.htmlScore<80);assert.equal(summary.score,null);
});
test('real metadata, canonical targets, broken links and source snippets produce specific evidence',()=>{
 const p=page('<html lang="nl"><title>Installateur</title><meta name="description" content="Installatiewerk in Venlo"><meta name="viewport" content="width=device-width"><link rel="canonical" href="https://example.com/b"><body><h1>Installateur</h1><img src="werk.jpg"><a href="/gone">Werk</a></body></html>');
 const target=page('<title>Andere titel</title><meta name="robots" content="noindex">','https://example.com/b');
 const gone=page('','https://example.com/gone',404);finishCrossChecks([p,target,gone]);
 assert.equal(get(p,'canonical-target').state,'passed');assert.equal(get(p,'canonical-index').state,'failed');
 assert.equal(get(p,'link-broken').state,'failed');assert(get(p,'link-broken').evidence.includes('/gone HTTP 404'));
 assert.equal(get(p,'alt').state,'failed');assert.equal(get(p,'alt').snippet,'<img src="werk.jpg">');
 assert.equal(get(p,'viewport').state,'passed');assert.equal(get(p,'description').state,'passed');
});
test('editorial and security suggestions do not assert ranking failures',()=>{
 const p=page('<title>'+ 'Lang '.repeat(30)+'</title><h1>A</h1><h1>B</h1><img src="x.png" alt="x.png">');
 for(const id of ['h1-count','title-length','image-alt-file','csp']){assert.equal(get(p,id).state,'review');assert.equal(get(p,id).weight,0);}
});
test('lab errors and absent audits remain unknown; not-applicable is not success',async()=>{
 const r=report([page('<title>Test</title>')]);await attachMobileLab(r,undefined);
 assert.equal(r.labChecks.length,40);assert(r.labChecks.every(c=>c.state==='not-tested'));assert.equal(auditOverview(r).score,null);
 const checks=lighthouseChecks({audits:[{id:'color-contrast',score:0,mode:'binary',title:'Contrast',description:'Pas kleur aan',evidence:['<p>tekst</p>'],displayValue:''},{id:'label',score:null,mode:'notApplicable',title:'Label',description:'',evidence:[],displayValue:''}]});
 assert.equal(checks.find(c=>c.id==='lh-color-contrast').state,'failed');assert.equal(checks.find(c=>c.id==='lh-label').state,'not-applicable');
 assert.equal(checks.find(c=>c.id==='lh-largest-contentful-paint').state,'not-tested');
});
test('total uses real category scores and cannot be produced without all four',()=>{
 const r=report([page('<title>Test</title>')]);const categories=['performance','accessibility','best-practices','seo'];
 r.lab={categories:categories.map(id=>({id,title:id,score:40}))};
 const result=auditOverview(r);assert.equal(result.score,Math.round((100*result.passedWeight/result.weight+160)/5));
 r.lab.categories[0].score=null;assert.equal(auditOverview(r).score,null);
});
