import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectSitemap,sitemapGroupIds,independentlyPublishedPages} from '../scripts/sitemap-contract.mjs';
import {websiteOverview,overviewEntry} from '../lib/website-overview.ts';
const html=(links)=>'<div data-sitemap-tree>'+sitemapGroupIds.map(id=>`<section data-sitemap-group="${id}">${links.filter(l=>l.group===id).map(l=>`<a href="${l.href}">${l.label||'Pagina'}</a>`).join('')}</section>`).join('')+'</div>';
const sample=[{href:'/',group:'sitesnit'},{href:'/diensten',group:'diensten'}],expected=['/','/diensten','/sitemap'];
test('complete simple tree is accepted',()=>assert.deepEqual(inspectSitemap(html(sample),expected,{'/':200,'/diensten':200}),[]));
for(const [name,rows,targets] of [
 ['missing page',sample.slice(0,1),expected],['duplicate',[...sample,sample[0]],expected],
 ['retired case',[...sample,{href:'/projecten/atelier-vorm',group:'projecten-regio'}],expected],
 ['private record',[...sample,{href:'/hub/site/private',group:'uitleg'}],expected],
 ['wrong group',[sample[0],{href:'/diensten',group:'tools'}],expected],
 ['broken destination',sample,expected],
])test('rejects '+name,()=>assert.ok(inspectSitemap(html(rows),targets,name==='broken destination'?{'/':200,'/diensten':404}:undefined).length));
test('all real disk/dynamic pages occur once, with labels and intended groups',async()=>{
 const expected=await independentlyPublishedPages(process.cwd());
 const actual=websiteOverview();
 assert.deepEqual(actual.map(e=>e.href).sort(),expected.filter(p=>p!=='/sitemap'));
 assert.ok(actual.every(e=>e.label.trim()&&sitemapGroupIds.includes(e.group)));
 assert.equal(actual.filter(e=>e.href==='/website-snelheid-testen').length,1);
 assert.equal(actual.find(e=>e.href==='/website-snelheid-testen').group,'uitleg');
 assert.equal(actual.filter(e=>e.parent==='/tools/snelheidstest').length,3);
 assert.equal(actual.filter(e=>e.parent==='/tools/seo-audit').length,6);
});
test('adapter fails loudly for unknown routes and duplicate publication entries',()=>{
 for(const path of ['/hub/login','/projecten/atelier-vorm','/new-unknown-page'])assert.throws(()=>overviewEntry(path));
 assert.throws(()=>websiteOverview(['/','/']));
});
