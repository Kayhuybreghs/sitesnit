import fs from 'node:fs/promises';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {randomUUID,createHash} from 'node:crypto';
import {clientCases} from '../app/portfolio-data.ts';
import {routeCatalog} from '../lib/route-catalog.ts';
import {socialImages} from '../lib/social-images.ts';
import {filesBelow} from './public-route-inventory.mjs';
import {retiredReferences,validatePortfolio,validateSocialRecords} from './portfolio-contract.mjs';
const failures=[...validatePortfolio(clientCases.map(p=>p.slug)),...validateSocialRecords(socialImages,routeCatalog.map(p=>p.path))];
const checked=[], exceptions=['scripts/portfolio-contract.mjs']; // The explicit negative-test identity contract only.
const publicationFiles=['proxy.ts','next.config.ts',... (await Promise.all(['app','lib','scripts','public','.next/server','.next/static'].map(filesBelow))).flat()];
for(const file of publicationFiles){
  const name=file.replaceAll('\\','/');
  if(exceptions.includes(name))continue;
  if(retiredReferences(name))failures.push(`Retired asset file: ${name}`);
  if(/\.(?:[cm]?[jt]sx?|json|html|rsc|css|py|svg|txt)$/.test(file)){
    checked.push(name);if(retiredReferences(await fs.readFile(file,'utf8')))failures.push(`Retired publication/generator content: ${name}`);
  }
}
const staged=[];
for(let index=0;index<2;index++){
  const destination=path.resolve('.sites-runtime',`portfolio-repeat-${randomUUID()}`);
  const run=spawnSync(process.execPath,['--experimental-strip-types','--import','./scripts/typescript-test-loader.mjs','scripts/prepare-social-images.mjs','--output',destination],{encoding:'utf8',windowsHide:true});
  if(run.status!==0)throw Error(`Generator failed: ${run.stderr}`);
  const manifest=JSON.parse(await fs.readFile(path.join(destination,'manifest.json'),'utf8'));
  const source=await fs.readFile(path.join(destination,'lib/social-images.ts'));
  staged.push({routes:manifest.routes,assets:manifest.assets,metadataHash:createHash('sha256').update(source).digest('hex')});
  if(retiredReferences(source.toString()))failures.push('Generator restored retired identity');
}
if(JSON.stringify(staged[0])!==JSON.stringify(staged[1]))failures.push('Two isolated generator runs differ');
const out='reports/improvement/portfolio-2026-10-01';await fs.mkdir(out,{recursive:true});
await fs.writeFile(`${out}/source-build-generator.json`,JSON.stringify({checkedAt:new Date().toISOString(),buildId:(await fs.readFile('.next/BUILD_ID','utf8')).trim(),checkedFiles:checked,exceptions,staged,failures,limits:['Binary images require separate visual review. Tests and historical reports are not application or generator inputs and are excluded. Private customer data is never scanned.']},null,2));
console.log(JSON.stringify({files:checked.length,generatorRuns:staged.length,failures}));if(failures.length)process.exitCode=1;
