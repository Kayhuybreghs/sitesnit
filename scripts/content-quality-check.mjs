import fs from 'node:fs';
import { currentPages } from './content-quality-data.mjs';
import { validateQuality } from './content-quality-core.mjs';
const root=process.cwd();
try {
  const pages=currentPages(root);
  const manifest=JSON.parse(fs.readFileSync('quality/content-manifest.json','utf8'));
  const reviews={};
  for(const page of pages){const file=`quality/reviews/${page.id}.json`;if(fs.existsSync(file))reviews[page.id]=JSON.parse(fs.readFileSync(file,'utf8'));}
  const issues=validateQuality({root,pages,manifest,reviews});
  console.log(JSON.stringify({checkedAt:new Date().toISOString(),pages:pages.length,decision:issues.length?'blocked':'approved',scope:'Explicit local release review; does not deploy, alter robots or modify indexing policy.',issues},null,2));
  process.exitCode=issues.length?1:0;
}catch(error){console.error(`Quality check failed closed: ${error instanceof Error?error.message:'Unknown error'}`);process.exitCode=1;}
