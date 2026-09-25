import test from 'node:test';
import assert from 'node:assert/strict';
import {openLocalDatabase} from '../lib/database-sqlite.ts';
import {recordAuditUsage,readAuditUsage} from '../lib/seo-audit/usage.ts';
import {guides} from '../lib/guides.ts';
import {toolReading} from '../lib/tool-reading.ts';
import {guideAnswers} from '../lib/guide-answers.ts';
import {auditGuides} from '../lib/seo-audit/guides.ts';
import {auditEditorial} from '../lib/seo-audit/editorial.ts';
test('audit counts actual outcomes without storing domains, separates UTC day from 28 days',async()=>{
 const {database,close}=openLocalDatabase(':memory:');
 const now=Date.UTC(2026,8,25,16);
 try {
  await recordAuditUsage(database,'started',now);await recordAuditUsage(database,'completed',now);
  await recordAuditUsage(database,'started',now-86400000);await recordAuditUsage(database,'failed',now-86400000);
  await recordAuditUsage(database,'completed',now-29*86400000);
  const rows=await readAuditUsage(database,now);
  assert.deepEqual(rows,[{outcome:'started',total:2,today:1},{outcome:'completed',total:1,today:1},{outcome:'failed',total:1,today:0}]);
  const stored=(await database.prepare('SELECT * FROM events').all()).results;
  assert.deepEqual(Object.keys(stored[0]).sort(),['created_at','id','type']);
 }finally{close();}
});
test('every existing guide remains in its tool index and has a distinct answer; audit follow-ups resolve',()=>{
 for(const g of guides){assert(guideAnswers[g.slug]);assert.equal(toolReading.find(x=>x.slug===g.slug)?.group,g.group);}
 for(const g of auditGuides){assert(auditEditorial[g.slug]);for(const target of auditEditorial[g.slug].next)assert(auditGuides.some(g=>g.slug===target));}
 assert.equal(new Set(Object.values(guideAnswers).map(g=>g.answer)).size,guides.length);
});
