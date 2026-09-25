import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { dependencyClosure, fileEvidence, digest, validateQuality } from '../scripts/content-quality-core.mjs';

function fixture(t) {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'sitesnit-quality-'));
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
  fs.mkdirSync(path.join(root,'quality/evidence'),{recursive:true});
  fs.writeFileSync(path.join(root,'quality/evidence/review.md'),'Test fixture only, never a real approval.');
  const hashes={contentHash:'content',businessHash:'business',sourcesHash:'sources',assetsHash:'assets'};
  const page={id:'TEST',path:'/example',...hashes};
  const review={path:page.path,...hashes,status:'approved_for_release',reviewerType:'owner',technicalStatus:'pass',editorialStatus:'pass',similarityStatus:'reviewed',claimsStatus:'verified',ownerApproved:true,reviewedAt:'2026-09-24T00:00:00Z',openIssues:[],evidence:['quality/evidence/review.md'],evidenceFiles:fileEvidence(root,['quality/evidence/review.md']),ownerApproval:{by:'TEST FIXTURE',approvedAt:'2026-09-24T00:00:00Z',evidencePath:'quality/evidence/review.md',...hashes}};
  return {root,page,review,run:(pages=[page],manifest={pages:[page]},reviews={TEST:review})=>validateQuality({root,pages,manifest,reviews})};
}
test('valid explicit owner fixture passes; agent record never becomes approval',t=>{
  const f=fixture(t);assert.deepEqual(f.run(),[]);
  assert.ok(f.run(undefined,undefined,{TEST:{...f.review,ownerApproved:false,status:'ready_for_owner_review',reviewerType:'agent_editorial_review'}}).some(x=>x.code==='not-approved-for-release'));
  assert.ok(f.run(undefined,undefined,{TEST:{...f.review,reviewerType:'agent_editorial_review'}}).some(x=>x.code==='owner-approval-without-owner-evidence'));
});
test('missing, unexpected and duplicate route coverage fail',t=>{
  const f=fixture(t);assert.ok(f.run(undefined,{pages:[]}).some(x=>x.code==='missing-manifest-route'));
  assert.ok(f.run(undefined,{pages:[f.page,{...f.page,path:'/extra'}]}).some(x=>x.code==='unexpected-manifest-route'));
  assert.ok(f.run(undefined,{pages:[f.page,f.page]}).some(x=>x.code==='duplicate-manifest-route'));
  assert.ok(f.run(undefined,undefined,{}).some(x=>x.code==='missing-review'));
});
test('each hash change fails both stale manifest and existing review',t=>{
  const f=fixture(t);for(const key of ['contentHash','businessHash','sourcesHash','assetsHash']){const issues=f.run([{...f.page,[key]:'changed'}]);assert.ok(issues.some(x=>x.code==='manifest-stale'));assert.ok(issues.some(x=>x.code==='review-blocked'&&x.message.includes('verouderd')));}
});
test('changed or missing archived evidence blocks, independent of status strings',t=>{
  const f=fixture(t);fs.writeFileSync(path.join(f.root,'quality/evidence/review.md'),'changed');assert.ok(f.run().some(x=>x.code==='missing-or-changed-review-evidence'));
  fs.unlinkSync(path.join(f.root,'quality/evidence/review.md'));assert.ok(f.run().some(x=>x.code==='missing-or-changed-review-evidence'));
});
test('legacy incompatible statuses, missing factual review and open issues fail',t=>{
  const f=fixture(t);assert.ok(f.run(undefined,undefined,{TEST:{...f.review,similarityStatus:'needs_review'}}).some(x=>x.code==='invalid-review-record'));
  assert.ok(f.run(undefined,undefined,{TEST:{...f.review,claimsStatus:'not_run',openIssues:['Unconfirmed claim']}}).some(x=>x.code==='review-blocked'));
});
test('real import closure fingerprints transitive code and CSS, not only declared dependencies',t=>{
  const f=fixture(t);fs.mkdirSync(path.join(f.root,'app'));
  fs.writeFileSync(path.join(f.root,'app/page.tsx'),'export { value } from "./shared"; import "./style.css";');
  fs.writeFileSync(path.join(f.root,'app/shared.ts'),'export const value = 1;');
  fs.writeFileSync(path.join(f.root,'app/style.css'),'@import "./nested.css";');
  fs.writeFileSync(path.join(f.root,'app/nested.css'),'.title{color:red}');
  const files=dependencyClosure(f.root,['app/page.tsx']);assert.deepEqual(files,['app/nested.css','app/page.tsx','app/shared.ts','app/style.css']);
  const before=digest(JSON.stringify(fileEvidence(f.root,files)));fs.writeFileSync(path.join(f.root,'app/shared.ts'),'export const value = 2;');assert.notEqual(digest(JSON.stringify(fileEvidence(f.root,files))),before);
});
