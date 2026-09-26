import {parse, type DefaultTreeAdapterMap} from 'parse5';
import type {AuditResponse} from './network';
import type {DetailedCheck} from './check-catalog';
type Node=DefaultTreeAdapterMap['node'];
export type Finding={code:string;priority:'hoog'|'middel'|'controle';title:string;url:string;evidence:string;why:string;action:string};
export type AuditCheck={code:string;passed:boolean;weight:number;evidence?:string;snippet?:string};
export type AuditedPage={url:string;status:number;title:string;description:string;canonical:string;indexable:boolean;links:string[];findings:Finding[];checks?:AuditCheck[];detailedChecks?:DetailedCheck[]};
const clean=(s:string)=>s.replace(/\s+/g,' ').trim();
function text(node:Node):string{if(node.nodeName==='#text')return (node as DefaultTreeAdapterMap['textNode']).value;return 'childNodes' in node?node.childNodes.map(text).join(' '):'';}
export function analyze(response:AuditResponse):AuditedPage{
 const result:AuditedPage={url:response.url,status:response.status,title:'',description:'',canonical:'',indexable:false,links:[],findings:[]};
 const add=(code:string,priority:Finding['priority'],title:string,evidence:string,why:string,action:string)=>result.findings.push({code,priority,title,url:response.url,evidence:evidence.slice(0,500),why,action});
 if(response.status>=300&&response.status<400){add('redirect','controle','Deze URL verwijst door',`${response.status}: ${response.headers.location||'geen bestemming ontvangen'}`,'Een redirect is vaak terecht, maar interne links kunnen directer.','Controleer de bestemming en werk interne verwijzingen bij.');return result;}
 if(response.status!==200){result.checks=[{code:'http',passed:false,weight:3}];add('http','hoog','Pagina niet normaal bereikbaar',`HTTP ${response.status}`,'Een foutpagina kan bezoekers en crawlers tegenhouden.','Controleer of de pagina moet bestaan; herstel de pagina of verwijs naar een inhoudelijk passend alternatief.');return result;}
 if(!response.headers['content-type']?.includes('text/html')){add('non-html','controle','Geen HTML-pagina ontvangen',response.headers['content-type']||'Content-Type ontbreekt','Deze scan beoordeelt HTML, geen documenten of downloads.','Bekijk dit bestand afzonderlijk; er zijn geen HTML-conclusies getrokken.');return result;}
 const doc=parse(response.body,{sourceCodeLocationInfo:true});let h1=0,missingAlt=0,invalidJson=0,imageCount=0,jsonCount=0;const robots:string[]=[response.headers['x-robots-tag']||''];const canonicals:string[]=[];const snippets:Record<string,string>={};
 const remember=(key:string,node:Node)=>{if(snippets[key])return;const location=node.sourceCodeLocation;if(location)snippets[key]=response.body.slice(location.startOffset,Math.min(location.endOffset,location.startOffset+700));};
 let base=response.url;
 function walk(node:Node){
  if('tagName' in node){const attrs=Object.fromEntries(node.attrs.map(a=>[a.name,a.value]));const tag=node.tagName;
   if(tag==='base'&&attrs.href){try{base=new URL(attrs.href,response.url).href;}catch{/* malformed base ignored */}}
   if(tag==='title'){result.title=clean(text(node));remember('title',node);}
   if(tag==='meta'&&attrs.name?.toLowerCase()==='description')result.description=clean(attrs.content||'');
   if(tag==='meta'&&['robots','googlebot'].includes(attrs.name?.toLowerCase())){robots.push(attrs.content||'');remember('noindex',node);}
   if(tag==='link'&&attrs.rel?.toLowerCase().split(/\s+/).includes('canonical')){remember('canonical-multiple',node);try{canonicals.push(new URL(attrs.href,base).href);}catch{canonicals.push('ongeldig');}}
   if(tag==='h1')h1++;
   if(tag==='img'){imageCount++;remember('alt',node);if(!Object.hasOwn(attrs,'alt')&&attrs['aria-hidden']!=='true'&&attrs.role!=='presentation')missingAlt++;}
   if(tag==='script'&&attrs.type==='application/ld+json'){jsonCount++;remember('json',node);try{JSON.parse(text(node));}catch{invalidJson++;}}
   if(tag==='a'&&attrs.href&&!attrs.rel?.split(/\s+/).includes('nofollow')){try{const u=new URL(attrs.href,base);u.hash='';if(u.origin===new URL(response.url).origin&&!u.search&&!/\.(pdf|png|jpe?g|webp|svg|zip|mp4|woff2?)$/i.test(u.pathname)&&result.links.length<400)result.links.push(u.href);}catch{/* not a URL */}}
  }
  if('childNodes' in node)for(const child of node.childNodes)walk(child);
 }
 walk(doc);result.links=[...new Set(result.links)];result.canonical=canonicals[0]||'';
 const blocked=robots.some(value=>/(?:^|[\s,:])(noindex|none)(?:$|[\s,])/i.test(value));result.indexable=!blocked;
 if(blocked)add('noindex','hoog','Indexering wordt uitgesloten',robots.filter(Boolean).join(' · '),'Zoekmachines mogen deze pagina niet opnemen wanneer zij deze instructie lezen. Dat kan voor privépagina’s bewust zijn.','Wil je deze pagina laten vinden? Verwijder dan de onbedoelde noindex en controleer opnieuw.');
 if(!result.title)add('title','middel','Paginatitel ontbreekt','Geen niet-lege title in de HTML.','Een titel helpt het onderwerp onderscheiden in zoekresultaten en tabbladen.','Schrijf een concrete titel die past bij de vraag op deze pagina.');
 if(!result.description)add('description','controle','Meta description ontbreekt','Geen niet-lege description in de HTML.','Je mist een eigen voorstel voor de zoekresultaatsamenvatting; Google kan zelf tekst kiezen.','Beschrijf kort wat iemand op deze pagina vindt.');
 if(!h1)add('h1','controle','Geen hoofdkop gevonden','Aantal H1-elementen: 0','Een duidelijke hoofdkop helpt bezoekers de pagina begrijpen.','Controleer het zichtbare hoofdonderwerp. Voeg een passende kop toe als die ontbreekt.');
 if(canonicals.length>1)add('canonical-multiple','middel','Meerdere canonicals gevonden',canonicals.join(' · '),'Tegenstrijdige voorkeuren maken de bedoelde hoofdversie onduidelijk.','Gebruik een consistente canonical.');
 else if(result.canonical&&result.canonical!==response.url)add('canonical-other','controle','Canonical wijst naar een andere URL',result.canonical,'Dit kan juist zijn bij duplicaten; het is niet automatisch een fout.','Controleer of de bestemming werkelijk de gewenste hoofdversie is.');
 if(missingAlt)add('alt','middel','Afbeeldingen zonder alt-attribuut',`${missingAlt} afbeelding(en). Lege alt bij decoratie telt niet als fout.`,'Betekenisvolle beelden hebben een tekstalternatief nodig.','Beschrijf functionele beelden; gebruik alt="" voor puur decoratieve beelden.');
 if(invalidJson)add('json','middel','Ongeldige JSON-LD',`${invalidJson} JSON-LD-blok(ken) konden niet worden geparseerd.`,'Een syntaxisfout verhindert het uitlezen van die gestructureerde gegevens.','Herstel de JSON-syntaxis en test daarna de toepasselijke schema-eisen.');
 result.checks=[{code:'http',passed:true,weight:3},{code:'noindex',passed:!blocked,weight:3},{code:'title',passed:!!result.title,weight:2},{code:'canonical-multiple',passed:canonicals.length<=1,weight:2},{code:'alt',passed:missingAlt===0,weight:1},{code:'json',passed:invalidJson===0,weight:1}];
 const evidence:Record<string,string>={http:`HTTP ${response.status}: een HTML-pagina ontvangen.`,noindex:blocked?`Uitsluiting gevonden: ${robots.filter(Boolean).join(' · ')}`:`Geen noindex of none gevonden in robots-metatags en X-Robots-Tag. ${robots.filter(Boolean).join(' · ')||'Er zijn geen expliciete robots-instructies aangetroffen.'}`,title:result.title?`Gevonden titel: ${result.title.slice(0,350)}`:'Geen ingevulde title gevonden.','canonical-multiple':`${canonicals.length} canonical-verwijzing(en) gevonden. ${result.canonical||'Geen canonical aanwezig: deze controle beoordeelt alleen tegenstrijdige meervoudige verwijzingen.'}`,alt:imageCount?`${imageCount} afbeelding(en), ${missingAlt} zonder alt-attribuut of decoratieve markering. De inhoudelijke kwaliteit van alt-teksten is niet beoordeeld.`:'Geen afbeeldingen aangetroffen; er kan hier dus ook geen ontbrekend alt-attribuut worden gevonden.',json:jsonCount?`${jsonCount} JSON-LD-blok(ken), ${invalidJson} met onleesbare JSON. Dit controleert syntaxis, niet alle schema-eisen of rich-result-geschiktheid.`:'Geen JSON-LD aangetroffen. Geen syntaxisfout gevonden betekent hier niet dat gestructureerde data aanwezig is.'};
 for(const check of result.checks){check.evidence=evidence[check.code];check.snippet=snippets[check.code]||(check.code==='http'?`HTTP ${response.status}\nContent-Type: ${response.headers['content-type']}`:check.code==='noindex'&&response.headers['x-robots-tag']?`X-Robots-Tag: ${response.headers['x-robots-tag']}`:undefined);}
 return result;
}
export function duplicateFindings(pages:AuditedPage[]):Finding[]{
 const out:Finding[]=[];
 for(const field of ['title','description'] as const){const groups=new Map<string,AuditedPage[]>();for(const p of pages){if(!p[field]||!p.indexable)continue;const key=p[field].toLocaleLowerCase();groups.set(key,[...(groups.get(key)||[]),p]);}for(const same of groups.values())if(same.length>1)for(const p of same)out.push({code:`duplicate-${field}`,priority:'controle',title:field==='title'?'Dezelfde paginatitel op meerdere pagina’s':'Dezelfde description op meerdere pagina’s',url:p.url,evidence:`${same.length} onderzochte indexeerbare pagina’s: ${p[field].slice(0,300)}`,why:'Verschillende onderwerpen verdienen een eigen omschrijving; echte duplicaten kunnen een gezamenlijke hoofdversie hebben.',action:'Vergelijk de inhoud en kies een unieke omschrijving of een passende canonical.'});}
 return out;
}
