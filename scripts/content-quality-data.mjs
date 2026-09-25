import fs from 'node:fs';
import path from 'node:path';
import { routeCatalog, seoFacts } from '../lib/route-catalog.ts';
import { guides } from '../lib/guides.ts';
import { business } from '../lib/business.ts';
import { contentSources } from '../lib/content-sources.ts';
import { socialImages } from '../lib/social-images.ts';
import { digest, dependencyClosure, fileEvidence, assetEvidence, pageEntry } from './content-quality-core.mjs';
const businessFiles = ['lib/business.ts','app/site-data.ts','app/service-pricing.tsx','app/diensten/service-data.ts','app/diensten/specialist-data.ts'];
export function currentPages(root = process.cwd()) {
  return routeCatalog.map(route => {
    const guide = guides.find(guide => `/${guide.slug}` === route.path);
    const id = guide?.id || (route.path === '/seo-venlo' ? 'S1' : route.path === '/diensten/seo-onderhoud' ? 'S2' : route.path === '/diensten/website-monitoring' ? 'MONITORING' : `PAGE-${route.path.replace(/^\//,'').replaceAll('/','--') || 'home'}`);
    const entry = pageEntry(root,route.path,Boolean(guide));
    const entries = [entry,'app/layout.tsx','app/seo.tsx'];
    const segments = route.path.split('/').filter(Boolean);
    for (let i=1;i<=segments.length;i++) {const layout=`app/${segments.slice(0,i).join('/')}/layout.tsx`;if(fs.existsSync(path.join(root,layout))) entries.push(layout);}
    if (['/privacy','/cookies'].includes(route.path)) entries.push('lib/hub/auth.ts','lib/hub/ingest.ts','lib/hub/mail.ts','lib/hub/integrations.ts');
    const dependencies = dependencyClosure(root,entries);
    const sourceEvidence = (guide?.sources || []).map(id => contentSources[id]);
    const dependencyHashes = fileEvidence(root,dependencies);
    const businessDependencies = fileEvidence(root,businessFiles);
    const assets = assetEvidence(root,dependencies,socialImages[route.path] ? [`public${socialImages[route.path].url}`] : []);
    return {
      id,path:route.path,pageType:guide ? 'supporting_article' : route.path.startsWith('/tools/') ? 'tool' : route.path.startsWith('/diensten/') ? 'service' : 'public_page',
      audience:guide?.audience || null,mainQuestion:guide?.title || null,purpose:guide?.outcome || route.intent,outcome:guide?.outcome || null,
      queryFamily:guide?.slug.replaceAll('-',' ') || null,searchVolume:null,subQuestions:guide?.sections.map(section=>section.heading) || [],
      uniqueContribution:guide?.unique || null,outOfScope:['Geen rang- of conversiegarantie','Geen verzonnen praktijkresultaten'],
      tool:guide?.tool || null,service:guide?.service || null,outgoing:guide ? [guide.tool,guide.service,...guide.related] : [],
      sourceIds:guide?.sources || [],sourceEvidence,entry,dependencies,dependencyHashes,businessDependencies,assets,
      contentHash:digest(JSON.stringify({route,guide:guide || null,dependencyHashes})),
      businessHash:digest(JSON.stringify({business,packages:seoFacts.packages,businessDependencies})),
      sourcesHash:digest(JSON.stringify({sourceEvidence,register:fileEvidence(root,['lib/content-sources.ts'])})),
      assetsHash:digest(JSON.stringify(assets)),
      reviewState:'draft',reviewerType:'agent_editorial_review',ownerApproved:false,
      editorialEvidence:'quality/evidence/editorial-corpus-review.md',technicalStatus:'not_run',similarityStatus:'not_run',
    };
  });
}
