import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {registerHooks} from 'node:module';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {parse} from 'parse5';
import {hostingPlans} from '../lib/pricing.ts';
import {business} from '../lib/business.ts';
// Only this server component needs JSX transformation; use the installed project compiler.
registerHooks({load(url,context,next){if(url.endsWith('/app/maintenance-price-table.tsx'))return {format:'module',source:ts.transpileModule(fs.readFileSync(new URL(url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText,shortCircuit:true};return next(url,context);}});
const {MaintenancePriceTable}=await import('../app/maintenance-price-table.tsx');
const all=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>all(c,p))];
const text=n=>(n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join(' ')).replace(/\s+/g,' ').trim();
const render=()=>renderToStaticMarkup(React.createElement(MaintenancePriceTable));
test('maintenance guide server table renders the actual catalogue and independently checked VAT amounts',()=>{
 const html=render(),tree=parse(html),rows=all(tree,n=>n.tagName==='tr').slice(1);
 assert.equal(rows.length,hostingPlans.length);assert.equal(rows.length,3);
 const expected=[['Hosting','5,00','6,05'],['Hosting & technisch onderhoud','29,99','36,29'],['Hosting, onderhoud & SEO','69,99','84,69']];
 rows.forEach((row,i)=>{const t=text(row);for(const value of expected[i])assert.ok(t.includes(value),value);for(const item of hostingPlans[i].items)assert.ok(t.includes(item));});
 assert.equal(business.vatRate,.21);assert.match(text(tree),/minimaal € 60,00 excl. btw \(€ 72,60 incl. btw\)/);
 assert.match(html,/href="\/diensten\/onderhoud-hosting#maandpakketten"/);assert.doesNotMatch(html,/<script/);
 assert.match(text(tree),/Hosting alleen is geen onderhoudspakket/);assert.match(text(tree),/niet nog eens bij op/);assert.match(text(tree),/niet automatisch binnen een vast pakket/);
});
test('isolated changed source fixture changes rendered name, net, gross and coverage without a second tariff list',()=>{
 const original=structuredClone(hostingPlans[1]);
 try{Object.assign(hostingPlans[1],{name:'SYNTHETISCH gewijzigd pakket',price:37.5,items:['Alleen synthetische dekking']});
  const tree=parse(render()),row=all(tree,n=>n.tagName==='tr')[2],t=text(row);
  assert.match(t,/SYNTHETISCH gewijzigd pakket/);assert.match(t,/€ 37,50 excl. btw/);assert.match(t,/€ 45,38 incl. 21% btw/);assert.match(t,/Alleen synthetische dekking/);assert.doesNotMatch(t,/29,99|36,29/);
 }finally{Object.assign(hostingPlans[1],original);}
});
