import {isPrivatePath} from './public-route-checks.mjs';
import {parse} from 'parse5';
import {inventoryAppPages} from './public-route-inventory.mjs';
import {services} from '../app/diensten/service-data.ts';
import {guides} from '../lib/guides.ts';
import {auditGuides} from '../lib/seo-audit/guides.ts';
import {speedGuides} from '../lib/speed-guides.ts';
import {clientCases} from '../app/portfolio-data.ts';
import {toolRedirects} from '../lib/tool-routes.ts';
import {retiredReferences} from './portfolio-contract.mjs';

// Independent from route-catalog and website-overview: disk pages plus the data used by dynamic pages.
export async function independentlyPublishedPages(root){
 const dynamic={'/[guide]':guides.map(g=>'/'+g.slug),'/diensten/[dienst]':services.map(s=>'/diensten/'+s.slug),'/projecten/[slug]':clientCases.map(c=>'/projecten/'+c.slug),'/tools/seo-audit/[slug]':auditGuides.map(g=>'/tools/seo-audit/'+g.slug),'/tools/snelheidstest/[slug]':speedGuides.map(g=>'/tools/snelheidstest/'+g.slug)};
 return (await inventoryAppPages(root)).filter(p=>!p.private&&!toolRedirects.some(r=>r.source===p.route)).flatMap(p=>{
  if(!p.dynamic)return [p.route];
  if(!dynamic[p.route])throw Error('Unknown dynamic publication source '+p.route);
  return dynamic[p.route];
 }).sort();
}
const attrs=n=>Object.fromEntries((n.attrs||[]).map(a=>[a.name,a.value]));
const find=(n,p)=>[...(p(n)?[n]:[]),...(n.childNodes||[]).flatMap(c=>find(c,p))];
const text=n=>n.nodeName==='#text'?n.value:(n.childNodes||[]).map(text).join(' ');
export const sitemapGroupIds=['sitesnit','diensten','tools','uitleg','projecten-regio','afspraken'];
function intendedGroup(href){
 if(['/','/over-sitesnit','/kosten','/contact'].includes(href))return 'sitesnit';
 if(['/privacy','/cookies','/algemene-voorwaarden'].includes(href))return 'afspraken';
 if(href==='/diensten'||href.startsWith('/diensten/'))return 'diensten';
 if(href==='/tools'||href.startsWith('/tools/'))return 'tools';
 if(href==='/projecten'||href.startsWith('/projecten/')||['/webdesign-venlo','/seo-venlo'].includes(href))return 'projecten-regio';
 return 'uitleg';
}
export function inspectSitemap(html,expectedPaths,statuses){
 const document=parse(html),issues=[],trees=find(document,n=>'data-sitemap-tree' in attrs(n));
 if(trees.length!==1)return ['Expected exactly one overview tree'];
 const groups=find(trees[0],n=>'data-sitemap-group' in attrs(n));
 if(JSON.stringify(groups.map(n=>attrs(n)['data-sitemap-group']))!==JSON.stringify(sitemapGroupIds))issues.push('Six ordered groups required');
 const links=[];
 for(const group of groups){const id=attrs(group)['data-sitemap-group'];
  for(const anchor of find(group,n=>n.tagName==='a')){
   const href=attrs(anchor).href||'';links.push(href);
   if(!text(anchor).trim())issues.push('Missing label '+href);
   if(intendedGroup(href)!==id)issues.push('Wrong group '+href);
   if(!expectedPaths.includes(href)||href==='/sitemap'||href==='/sitemap.xml'||/[?#]/.test(href)||isPrivatePath(href)||toolRedirects.some(r=>r.source===href)||retiredReferences(href))issues.push('Forbidden or unknown destination '+href);
   if(statuses&&statuses[href]!==200)issues.push('Broken destination '+href);
   if(/^\/tools\/(seo-audit|snelheidstest)\//.test(href)){
    const parent=href.split('/').slice(0,3).join('/');let node=anchor.parentNode?.parentNode?.parentNode;
    if(node?.tagName!=='li'||!(node.childNodes||[]).some(c=>c.tagName==='a'&&attrs(c).href===parent))issues.push('Guide is not under its tool '+href);
   }
  }
 }
 if(new Set(links).size!==links.length)issues.push('Duplicate destination');
 for(const path of expectedPaths.filter(p=>p!=='/sitemap'))if(!links.includes(path))issues.push('Missing page '+path);
 return issues;
}
