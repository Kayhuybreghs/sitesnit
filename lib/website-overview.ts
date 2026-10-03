import {releaseRoutes} from './route-catalog';
import {pageSeo} from '../app/page-seo-data';
import {services} from '../app/diensten/service-data';
import {hubScopes,hubSlugs} from '../app/service-experience-data';
import {toolCatalog} from '../app/tools/tool-catalog';
import {guides} from './guides';
import {auditGuides} from './seo-audit/guides';
import {speedGuides} from './speed-guides';
import {clientCases} from '../app/portfolio-data';
import {publicServicePages} from './public-service-pages';

export const overviewSections=[
 {id:'sitesnit',title:'Sitesnit'}, {id:'diensten',title:'Diensten'},
 {id:'tools',title:'Gratis tools & bijbehorende uitleg'}, {id:'uitleg',title:'Praktische uitleg'},
 {id:'projecten-regio',title:'Projecten & regio'}, {id:'afspraken',title:'Afspraken'},
] as const;
export type OverviewGroup=typeof overviewSections[number]['id'];
export type OverviewEntry={href:string;label:string;group:OverviewGroup;topic:string;parent?:string};
const labels:Record<string,string>={'/':'Home','/over-sitesnit':'Over Sitesnit','/kosten':'Kosten & pakketten','/contact':'Contact','/diensten':'Alle diensten','/tools':'Alle tools & checks','/projecten':'Alle projecten','/diensten/webdesign/pakketten':'Websitepakketten uitgelegd','/privacy':'Privacy','/cookies':'Cookies','/algemene-voorwaarden':'Algemene voorwaarden'};
const articleTopics:Record<string,string>={websitecheck:'Je bestaande website',prijscheck:'Kosten & onderhoud',offertevergelijker:'Offertes aanvragen & vergelijken',automatiseringsplan:'Processen & koppelingen','ontwerp-je-website':'Structuur & ontwerp','seo-audit':'Vindbaarheid & techniek'};
const serviceTopics:Record<string,string>={webdesign:'Ontwerp, websites & apps',seo:'Vindbaarheid & inhoud','ai-automatisering':'Tools & automatisering'};

/** Server-only presentation adapter. Publication remains owned by route-catalog. */
export function overviewEntry(href:string):OverviewEntry {
 const meta=pageSeo[href];
 if(!meta?.title.trim())throw Error('Websiteoverzicht: ontbrekend label voor '+href);
 const base={href,label:labels[href]||meta.title};
 if(['/','/over-sitesnit','/kosten','/contact'].includes(href))return {...base,group:'sitesnit',topic:''};
 if(['/privacy','/cookies','/algemene-voorwaarden'].includes(href))return {...base,group:'afspraken',topic:''};
 if(href==='/diensten')return {...base,group:'diensten',topic:''};
 if(href==='/tools')return {...base,group:'tools',topic:''};
 const tool=toolCatalog.find(t=>t.href===href);
 if(tool)return {...base,label:tool.name,group:'tools',topic:tool.name};
 for(const [parent,children] of [['/tools/seo-audit',auditGuides],['/tools/snelheidstest',speedGuides]] as const){
  const guide=children.find(g=>parent+'/'+g.slug===href);
  if(guide)return {...base,label:guide.title,group:'tools',topic:toolCatalog.find(t=>t.href===parent)!.name,parent};
 }
 const guide=guides.find(g=>'/'+g.slug===href);
 if(guide){const topic=articleTopics[guide.group];if(!topic)throw Error('Websiteoverzicht: onbekende artikelgroep '+guide.group);return {...base,label:guide.title,group:'uitleg',topic};}
 const service=services.find(s=>'/diensten/'+s.slug===href);
 if(service||href in publicServicePages||href==='/diensten/webdesign/pakketten'){
  const hub=hubSlugs.find(slug=>href==='/diensten/'+slug||hubScopes[slug].some(scope=>scope.href.split('#')[0]===href));
  const topic=hub?serviceTopics[hub]:service?.slug==='onderhoud-hosting'?'Hosting & onderhoud':undefined;
  if(!topic)throw Error('Websiteoverzicht: dienst zonder groep '+href);
  return {...base,label:service?.name||labels[href]||publicServicePages[href as keyof typeof publicServicePages]?.name||meta.title,group:'diensten',topic};
 }
 if(href==='/projecten'||clientCases.some(c=>href==='/projecten/'+c.slug)||['/webdesign-venlo','/seo-venlo'].includes(href))return {...base,group:'projecten-regio',topic:''};
 throw Error('Websiteoverzicht: route zonder bewuste groep '+href);
}

export function websiteOverview(paths:readonly string[]=releaseRoutes):OverviewEntry[]{
 if(new Set(paths).size!==paths.length)throw Error('Websiteoverzicht: dubbele publicatieroute');
 const entries=paths.filter(path=>path!=='/sitemap').map(overviewEntry);
 // Stable editorial order from existing hubs/catalogs; children follow their tool in the renderer.
 const order=['/','/over-sitesnit','/kosten','/contact','/diensten',...hubSlugs.map(slug=>'/diensten/'+slug),'/tools',...toolCatalog.map(t=>t.href),'/projecten',...clientCases.map(c=>'/projecten/'+c.slug),'/webdesign-venlo','/seo-venlo','/algemene-voorwaarden','/privacy','/cookies'];
 return entries.sort((a,b)=>(order.includes(a.href)?order.indexOf(a.href):999)-(order.includes(b.href)?order.indexOf(b.href):999));
}
