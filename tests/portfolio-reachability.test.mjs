import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {retiredReferences,validatePortfolio,validateSocialRecords} from '../scripts/portfolio-contract.mjs';
import {analyzeReachability} from '../scripts/route-reachability.mjs';
import {clientCases} from '../app/portfolio-data.ts';
import {socialImages} from '../lib/social-images.ts';
import {routeCatalog} from '../lib/route-catalog.ts';
test('two independently approved public cases and all current social mappings survive',()=>{
  assert.deepEqual(validatePortfolio(clientCases.map(p=>p.slug)),[]);
  assert.deepEqual(validateSocialRecords(socialImages,routeCatalog.map(p=>p.path)),[]);
  assert.deepEqual(JSON.parse(readFileSync(new URL('../scripts/social-images-source.json',import.meta.url),'utf8')),socialImages);
  // Fixed non-case preservation sample, not computed from the generator being tested.
  for(const p of ['/diensten/website-monitoring','/seo-venlo','/website-offerte-aanvragen','/tools/seo-audit/canonical-controleren'])assert.ok(socialImages[p]);
});
test('portfolio rejects third, absent and duplicate records',()=>{
  for(const ids of [['beurswijzer','beurswatcher','atelier-vorm'],['beurswijzer'],['beurswijzer','beurswijzer']])assert.ok(validatePortfolio(ids).length);
});
test('publication scanner detects retired identity in actual output channels',()=>{
  for(const content of ['<footer><a href="/projecten/atelier-vorm?x=1">Werk</a></footer>','https://www.sitesnit.nl/projecten/Studio-Matcha/','<img alt="Buiten Gewoon">','{"/projecten/atelier-vorm":{"url":"/og/atelier-vorm.png"}}',"cases=['studio-matcha']",'/images/architecture-480.webp','/projecten/atelier%2Dvorm'])assert.equal(retiredReferences(content),true,content);
  assert.equal(retiredReferences('Een ontwerp met een eigen vorm. <img alt="Beurswijzer">'),false);
  // User input is deliberately outside the publication scan. It remains arbitrary data.
  const userInput={message:'Mijn bedrijf heet Atelier Vorm'};assert.equal(userInput.message,'Mijn bedrijf heet Atelier Vorm');
});
test('social metadata rejects stale routes and old hidden metadata',()=>{
  const copy=structuredClone(socialImages);delete copy['/diensten/website-monitoring'];copy['/projecten/atelier-vorm']=copy['/projecten/beurswijzer'];
  assert.ok(validateSocialRecords(copy,routeCatalog.map(p=>p.path)).length>=2);
});
test('zero incoming pages AND mutually linked isolated group fail even when sitemap seeds all pages',()=>{
  const paths=['/','/diensten','/orphan','/island-a','/island-b'];
  const links=[{source:'/',href:'/diensten'},{source:'/island-a',href:'/island-b'},{source:'/island-b',href:'/island-a'},{source:'/orphan',href:'/orphan#self'}];
  const result=analyzeReachability(paths,links);
  assert.deepEqual(result.orphans,['/orphan']);assert.deepEqual(result.isolatedGroups,[['/island-a','/island-b']]);assert.equal(result.failures.length,3);
  links.push({source:'/diensten?x=1',href:'https://www.sitesnit.nl/island-a?x=2#section'},{source:'/diensten',href:'/orphan'});
  assert.deepEqual(analyzeReachability(paths,links).failures,[]);
});
