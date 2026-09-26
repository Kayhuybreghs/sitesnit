import {parse,type DefaultTreeAdapterMap} from 'parse5';
import {htmlCatalog,lighthouseCatalog,type DetailedCheck,type CheckState} from './check-catalog';
import type {AuditResponse} from './network';
import type {AuditedPage} from './analyze';
import type {TechnicalResult} from '../lighthouse';
type Node=DefaultTreeAdapterMap['node'];
type Element=DefaultTreeAdapterMap['element'];
const attrs=(node?:Pick<Element,'attrs'>)=>Object.fromEntries((node?.attrs||[]).map(a=>[a.name,a.value]));
const content=(node:Node):string=>node.nodeName==='#text'?(node as DefaultTreeAdapterMap['textNode']).value:'childNodes' in node&&!['script','style','noscript','template'].includes(node.nodeName)?node.childNodes.map(content).join(' ').replace(/\s+/g,' ').trim():'';
const absolute=(value:string,base:string)=>{try{return new URL(value,base).href;}catch{return '';}};
const httpUrl=(value:string)=>{try{return ['http:','https:'].includes(new URL(value).protocol);}catch{return false;}};

export function detailedHtml(response:AuditResponse,page:AuditedPage):DetailedCheck[]{
 const {body,headers,url,status}=response;
 const doc=parse(body,{sourceCodeLocationInfo:true});const nodes:Element[]=[];
 const walk=(node:Node)=>{if('tagName' in node)nodes.push(node);if('childNodes' in node)node.childNodes.forEach(walk);};walk(doc);
 const tags=(tag:string)=>nodes.filter(n=>n.tagName===tag);
 const meta=(name:string)=>tags('meta').filter(n=>[attrs(n).name,attrs(n).property].some(v=>v?.toLowerCase()===name));
 const value=(name:string)=>attrs(meta(name)[0]).content?.trim()||'';
 const snippet=(node?:Element)=>node?.sourceCodeLocation?body.slice(node.sourceCodeLocation.startOffset,Math.min(node.sourceCodeLocation.endOffset,node.sourceCodeLocation.startOffset+700)):undefined;
 const titles=tags('title'),descs=meta('description'),h1=tags('h1'),heads=nodes.filter(n=>/^h[1-6]$/.test(n.tagName));
 const links=tags('a').filter(n=>Object.hasOwn(attrs(n),'href')),images=tags('img');
 const base=absolute(attrs(tags('base')[0]).href||url,url)||url;
 const canonical=tags('link').filter(n=>attrs(n).rel?.toLowerCase().split(/\s+/).includes('canonical'));
 const language=tags('link').filter(n=>attrs(n).rel?.split(/\s+/).includes('alternate')&&attrs(n).hreflang);
 const jsonNodes=tags('script').filter(n=>attrs(n).type==='application/ld+json');const json:Record<string,unknown>[]=[];let invalidJson=0;
 const flatten=(input:unknown)=>{if(Array.isArray(input)){input.forEach(flatten);return;}if(input&&typeof input==='object'){const item=input as Record<string,unknown>;json.push(item);if(item['@graph'])flatten(item['@graph']);}};
 for(const node of jsonNodes){try{const raw=node.childNodes.map(n=>n.nodeName==='#text'?(n as DefaultTreeAdapterMap['textNode']).value:'').join('');flatten(JSON.parse(raw));}catch{invalidJson++;}}
 const output:DetailedCheck[]=htmlCatalog.map(([id,title,category,weight])=>({id,title,category,weight,source:'HTML',state:'not-tested',evidence:'Deze controle kon niet worden uitgevoerd.',action:'Onderzoek dit onderdeel afzonderlijk.'}));
 const set=(id:string,state:CheckState,evidence:string,action:string,node?:Element)=>{const item=output.find(c=>c.id===id)!;Object.assign(item,{state,evidence:evidence.slice(0,1200),action,snippet:snippet(node)});};
 const test=(id:string,pass:boolean,evidence:string,action:string,node?:Element)=>set(id,pass?'passed':'failed',evidence,action,node);
 const na=(id:string,reason:string)=>set(id,'not-applicable',reason,'Voor deze pagina niet van toepassing.');
 const review=(id:string,pass:boolean,evidence:string,action:string,node?:Element)=>set(id,pass?'passed':'review',evidence,action,node);
 const subset=(id:string,pool:Element[],bad:(n:Element)=>boolean,action:string,advisory=false)=>{if(!pool.length){na(id,'Geen relevante elementen in de ontvangen HTML.');return;}const failures=pool.filter(bad);(advisory?review:test)(id,!failures.length,`${pool.length} elementen onderzocht; ${failures.length} aandachtspunt(en).`,action,failures[0]||pool[0]);};
 test('http',status===200,`HTTP ${status}`,'Herstel onbedoelde foutpagina’s. Redirects kunnen bewust zijn.');
 if(status!==200){output.filter(c=>c.id!=='http').forEach(c=>{c.evidence=`Niet beoordeeld: HTTP ${status}.`;});return output;}
 test('html',headers['content-type']?.includes('text/html')===true,`Content-Type: ${headers['content-type']||'ontbreekt'}`,'Lever een HTML-pagina met het juiste bestandstype.');
 if(!headers['content-type']?.includes('text/html'))return output;
 test('noindex',page.indexable,`X-Robots-Tag: ${headers['x-robots-tag']||'niet aanwezig'}; robots: ${value('robots')||'niet aanwezig'}; googlebot: ${value('googlebot')||'niet aanwezig'}`,'Verwijder noindex uitsluitend als deze pagina openbaar gevonden moet worden.',meta('robots')[0]||meta('googlebot')[0]);
 if(!canonical.length){na('canonical-count','Geen canonical opgegeven. Google kan zelf een hoofdversie kiezen.');na('canonical-url','Geen canonical om te controleren.');na('canonical-target','Geen canonicalbestemming opgegeven.');na('canonical-index','Geen canonicalbestemming opgegeven.');}
 else{test('canonical-count',canonical.length===1,`${canonical.length} canonical-element(en).`,'Gebruik één ondubbelzinnige hoofdversie.',canonical[0]);subset('canonical-url',canonical,n=>!attrs(n).href||!httpUrl(absolute(attrs(n).href,base)),'Gebruik een geldig HTTP(S)-adres voor de hoofdversie.');}
 const refresh=tags('meta').find(n=>attrs(n)['http-equiv']?.toLowerCase()==='refresh');test('refresh',!refresh,refresh?attrs(refresh).content||'Meta-refresh gevonden.':'Geen meta-refresh gevonden.','Gebruik waar nodig een passende serverredirect in plaats van een getimede paginaverversing.',refresh);
 test('title',!!page.title,page.title||'Geen ingevulde title.','Geef de pagina een concrete titel.',titles[0]);
 test('title-count',titles.length<=1,`${titles.length} title-element(en).`,'Houd één paginatitel aan.',titles[0]);
 test('description',!!page.description,page.description||'Geen ingevulde metabeschrijving.','Beschrijf kort wat de bezoeker hier kan vinden.',descs[0]);
 test('description-count',descs.length<=1,`${descs.length} description-element(en).`,'Gebruik één metabeschrijving.',descs[0]);
 if(page.title)review('title-length',page.title.length<=70,`${page.title.length} tekens. 70 is een redactiesignaal, geen Google-limiet. Afkappen hangt onder meer af van de weergavebreedte.`,'Controleer leesbaarheid en onderwerp; voeg geen woorden toe om een quotum te halen.',titles[0]);else na('title-length','Geen titel om de lengte van te beoordelen.');
 if(page.description)review('description-length',page.description.length>=50&&page.description.length<=180,`${page.description.length} tekens. 50–180 is een redactiesignaal, geen rankingregel.`,'Controleer of de beschrijving voldoende context geeft zonder herhaling.',descs[0]);else na('description-length','Geen beschrijving om te beoordelen.');
 const bodyText=content(tags('body')[0]||doc);test('body-text',bodyText.length>0,`${bodyText.length} tekens leesbare tekst in de HTML. Dit is geen beoordeling van inhoudelijke kwaliteit.`,'Maak de belangrijkste informatie ook zonder client-JavaScript beschikbaar.');
 test('h1',h1.some(n=>content(n)),`${h1.length} H1-element(en); ${h1.filter(n=>content(n)).length} met tekst.`,'Gebruik een duidelijke hoofdonderwerp-kop.',h1[0]);
 if(h1.length)review('h1-count',h1.length===1,`${h1.length} hoofdkoppen. Meerdere H1’s zijn niet automatisch een SEO-fout.`,'Beoordeel of de hiërarchie voor bezoekers helder is.',h1[0]);else na('h1-count','Geen hoofdkop gevonden; zie de aanwezigheidstest.');
 subset('heading-empty',heads,n=>!content(n),'Vul lege koppen of verwijder ze.');
 const skipped=heads.filter((n,i)=>i>0&&Number(n.tagName[1])>Number(heads[i-1].tagName[1])+1);if(heads.length)review('heading-order',!skipped.length,`${skipped.length} sprong(en) van meer dan één niveau.`,'Controleer de inhoudelijke kophiërarchie; dit is geen gemeten rankingverlies.',skipped[0]||heads[0]);else na('heading-order','Geen koppen gevonden.');
 if(page.title&&h1.length)set('h1-title','review',`Titel: ${page.title}. H1: ${content(h1[0])}`,'Beoordeel of beide hetzelfde onderwerp duidelijk maken; identieke tekst is niet verplicht.',h1[0]);else na('h1-title','Titel of H1 ontbreekt.');
 review('main',nodes.some(n=>n.tagName==='main'||attrs(n).role==='main'),'Hoofdinhoud '+(nodes.some(n=>n.tagName==='main'||attrs(n).role==='main')?'gemarkeerd.':'niet expliciet gemarkeerd.'),'Gebruik een main-landmark als dat past bij de structuur.');
 const named=(n:Element)=>content(n)||attrs(n)['aria-label']||attrs(n)['aria-labelledby']||n.childNodes.some(c=>'tagName' in c&&c.tagName==='img'&&attrs(c).alt);
 subset('link-name',links,n=>!named(n),'Geef een link een begrijpelijke zichtbare of toegankelijke naam. CSS en ARIA-relaties worden hier niet gerenderd.');
 subset('link-placeholder',links,n=>['','#','javascript:void(0)','javascript:;'].includes(attrs(n).href?.trim()),'Controleer of dit een echte link of een knop hoort te zijn.',true);
 subset('link-http',links,n=>{const target=absolute(attrs(n).href,base);return target.startsWith('http:')&&new URL(target).hostname===new URL(url).hostname;},'Verwijs intern direct naar HTTPS.');
 const ids=new Set(nodes.map(n=>attrs(n).id).filter(Boolean));subset('link-fragment',links.filter(n=>attrs(n).href?.startsWith('#')&&attrs(n).href.length>1),n=>{try{return !ids.has(decodeURIComponent(attrs(n).href.slice(1)));}catch{return true;}},'Controleer het anker; dynamisch toegevoegde elementen kunnen buiten deze HTML-test vallen.',true);
 subset('alt',images,n=>!Object.hasOwn(attrs(n),'alt')&&attrs(n)['aria-hidden']!=='true'&&attrs(n).role!=='presentation','Geef betekenisvolle beelden tekstalternatieven; decoratieve beelden mogen alt="" hebben.');
 subset('image-src',images,n=>!attrs(n).src&&!attrs(n).srcset,'Controleer bronadres of dynamische beeldlevering.');
 subset('image-dimensions',images,n=>!(Number(attrs(n).width)>0&&Number(attrs(n).height)>0)&&!/(?:aspect-ratio|width|height)\s*:/.test(attrs(n).style||''),'Reserveer ruimte met afmetingen of CSS. Externe CSS is niet beoordeeld; dit bewijst geen layoutverschuiving.',true);
 subset('image-http',images,n=>(attrs(n).src||'').startsWith('http:'),'Gebruik HTTPS voor afbeeldingen.');
 subset('image-srcset',images,n=>!attrs(n).srcset&&n.parentNode?.nodeName!=='picture'&&!/\.svg(?:$|\?)/i.test(attrs(n).src||''),'Bekijk of responsive varianten zinvol zijn. Een klein origineel heeft die niet altijd nodig.',true);
 subset('image-priority',images,n=>attrs(n).loading==='lazy'&&attrs(n).fetchpriority==='high','Kies een consistente laadstrategie voor belangrijke en latere beelden.');
 subset('image-alt-file',images,n=>/\.(?:jpe?g|png|webp|avif|gif)$/i.test(attrs(n).alt||''),'Beschrijf het beeld in plaats van alleen de bestandsnaam.',true);
 for(const [id,name] of [['og-title','og:title'],['og-description','og:description'],['og-type','og:type']] as const)test(id,!!value(name),value(name)||`${name} ontbreekt.`,'Vul passende metadata voor het delen van deze pagina in.',meta(name)[0]);
 for(const [id,name] of [['og-image','og:image'],['og-url','og:url']] as const)test(id,httpUrl(value(name)),value(name)||`${name} ontbreekt.`,'Gebruik een absoluut HTTP(S)-adres. De bereikbaarheid van externe beelden is niet gemeten.',meta(name)[0]);
 test('twitter-card',['summary','summary_large_image','app','player'].includes(value('twitter:card')),value('twitter:card')||'Kaarttype ontbreekt.','Gebruik een passend Twitter/X-kaarttype.',meta('twitter:card')[0]);
 test('twitter-title',!!(value('twitter:title')||value('og:title')),value('twitter:title')||value('og:title')||'Geen titel of OG-fallback.','Vul een deeltitel in.',meta('twitter:title')[0]||meta('og:title')[0]);
 test('twitter-image',httpUrl(value('twitter:image')||value('og:image')),value('twitter:image')||value('og:image')||'Geen afbeeldingsadres of OG-fallback.','Geef een absoluut adres van een passende deelafbeelding op.',meta('twitter:image')[0]||meta('og:image')[0]);
 review('json-present',jsonNodes.length>0,`${jsonNodes.length} JSON-LD-blok(ken). Niet ieder paginatype heeft recht op rich results.`,'Beoordeel welke structured data inhoudelijk past.',jsonNodes[0]);
 if(!jsonNodes.length)for(const id of ['json','json-context','json-type','json-url','breadcrumbs'])na(id,'Geen JSON-LD aangetroffen. Geen gratis punten voor afwezige data.');
 else{
  test('json',!invalidJson,`${invalidJson} onleesbare JSON-LD-blokken van ${jsonNodes.length}.`,'Herstel de JSON-syntaxis.',jsonNodes[0]);
  if(invalidJson||!json.length){for(const id of ['json-context','json-type','json-url','breadcrumbs'])set(id,'not-tested','JSON-LD niet volledig uitleesbaar.','Herstel eerst de syntaxis.');}
  else{
   test('json-context',json.some(j=>/schema\.org/.test(JSON.stringify(j['@context']||''))),'Aangetroffen context: '+json.filter(j=>j['@context']).map(j=>JSON.stringify(j['@context'])).join(', '),'Controleer de passende Schema.org-context.',jsonNodes[0]);
   test('json-type',json.some(j=>j['@type']),'Aangetroffen typen: '+json.map(j=>j['@type']).filter(Boolean).join(', '),'Definieer het juiste type voor de zichtbare inhoud.',jsonNodes[0]);
   const urls=json.flatMap(j=>typeof j.url==='string'?[j.url]:[]);if(urls.length)test('json-url',urls.every(httpUrl),urls.slice(0,5).join('\n'),'Gebruik geldige absolute adressen in url-eigenschappen.',jsonNodes[0]);else na('json-url','Geen url-eigenschappen op de uitgelezen entiteiten.');
   const crumbs=json.filter(j=>j['@type']==='BreadcrumbList');if(crumbs.length)test('breadcrumbs',crumbs.every(j=>Array.isArray(j.itemListElement)&&j.itemListElement.length>0&&j.itemListElement.every((item,i)=>item&&typeof item==='object'&&Number(item.position)===i+1)),`${crumbs.length} broodkruimelstructuur/-structuren. Getest op opeenvolgende posities vanaf 1.`,'Gebruik een complete opeenvolgende itemListElement-lijst; dit vervangt geen rich-result-validatie.',jsonNodes[0]);else na('breadcrumbs','Geen BreadcrumbList aanwezig.');
  }
 }
 const html=tags('html')[0];test('lang',!!(html&&attrs(html).lang?.trim()),html?attrs(html).lang||'lang ontbreekt.':'html ontbreekt.','Geef de taal van de pagina op.',html);
 subset('hreflang-url',language,n=>!httpUrl(attrs(n).href||''),'Gebruik absolute adressen voor taalvarianten. Wederkerigheid buiten de crawl is niet getest.');
 if(language.length)review('hreflang-self',language.some(n=>absolute(attrs(n).href,base)===url),`${language.length} taalverwijzingen. Eigen URL ${url}.`,'Vermeld ook de eigen taalversie als je hreflang gebruikt.',language[0]);else na('hreflang-self','Geen taalvarianten opgegeven.');
 test('viewport',/width\s*=\s*device-width/i.test(value('viewport')),value('viewport')||'Viewport ontbreekt.','Stel de viewport in op device-width.',meta('viewport')[0]);
 test('zoom',!/(?:user-scalable\s*=\s*(?:no|0)|maximum-scale\s*=\s*1(?:[,.\s]|$))/i.test(value('viewport')),value('viewport')||'Geen zoombeperking in viewport gevonden.','Sta vergroten van tekst en inhoud toe.',meta('viewport')[0]);
 const charset=tags('meta').find(n=>attrs(n).charset||attrs(n)['http-equiv']?.toLowerCase()==='content-type');test('charset',!!charset||/charset=/i.test(headers['content-type']||''),charset?JSON.stringify(attrs(charset)):headers['content-type']||'Geen tekencodering.','Declareer de juiste tekencodering, meestal UTF-8.',charset);
 for(const [id,header] of [['nosniff','x-content-type-options'],['hsts','strict-transport-security'],['csp','content-security-policy'],['referrer','referrer-policy']] as const)review(id,!!headers[header],`${header}: ${headers[header]||'niet ontvangen'}`,'Beoordeel een passend beveiligingsbeleid. Ontbreken bewijst geen kwetsbaarheid en is geen directe SEO-rankingtest.');
 return output;
}

export function finishCrossChecks(pages:AuditedPage[]){
 for(const page of pages){if(!page.detailedChecks||page.status!==200)continue;
  const set=(id:string,state:CheckState,evidence:string,action:string)=>{const c=page.detailedChecks!.find(c=>c.id===id);if(c&&c.state!=='not-applicable')Object.assign(c,{state,evidence,action});};
  for(const field of ['title','description'] as const){const same=pages.filter(p=>p.indexable&&p[field]&&p[field].toLocaleLowerCase()===page[field].toLocaleLowerCase());set(field+'-unique',!page[field]||!page.indexable?'not-applicable':same.length>1?'review':'passed',`${same.length} onderzochte indexeerbare pagina’s met deze ${field==='title'?'titel':'beschrijving'}. Alleen deze steekproef is vergeleken.`,'Beoordeel of dit duplicaten zijn of verschillende onderwerpen met een eigen omschrijving.');}
  const target=pages.find(p=>p.url===page.canonical);
  set('canonical-target',target?(target.status===200?'passed':'failed'):'not-tested',target?`${target.url}: HTTP ${target.status}`:'Canonicalbestemming niet onderzocht binnen de crawl.','Controleer de bedoelde hoofdversie en bereikbaarheid.');
  set('canonical-index',target&&target.status===200?(target.indexable?'passed':'failed'):'not-tested',target&&target.status===200?`${target.url}: ${target.indexable?'geen noindex gevonden':'noindex gevonden'}`:'Geen beoordeelbare canonicalbestemming ontvangen.','Voorkom een canonical naar een ongewenst uitgesloten pagina.');
  const destinations=page.links.map(url=>pages.find(p=>p.url===url));const tested=destinations.filter((p):p is AuditedPage=>!!p);const bad=tested.filter(p=>p.status>=400);const redirects=tested.filter(p=>p.status>=300&&p.status<400);
  set('link-broken',!destinations.length?'not-applicable':!tested.length?'not-tested':bad.length?'failed':'passed',`${tested.length} van ${destinations.length} interne bestemmingen onderzocht; ${bad.length} foutresponsen. ${bad.slice(0,3).map(p=>p.url+' HTTP '+p.status).join('; ')}`,'Herstel de gevonden verwijzingen. Niet-bezochte bestemmingen zijn onbekend.');
  set('link-redirect',!destinations.length?'not-applicable':!tested.length?'not-tested':redirects.length?'review':'passed',`${redirects.length} redirects onder ${tested.length} onderzochte bestemmingen. ${redirects.slice(0,3).map(p=>p.url).join('; ')}`,'Verwijs waar zinvol direct naar de uiteindelijke URL.');
 }
}

const aliases:Record<string,string[]>= {'render-blocking-insight':['render-blocking-resources'],'image-delivery-insight':['uses-optimized-images'],'cache-insight':['use-cache-insight','uses-long-cache-ttl'],'document-latency-insight':['server-response-time'],'font-display-insight':['font-display'],'dom-size-insight':['dom-size'],'legacy-javascript-insight':['legacy-javascript']};
export function lighthouseChecks(result?:TechnicalResult,error='Mobiele Lighthouse-meting niet uitgevoerd.'):DetailedCheck[]{
 return lighthouseCatalog.map(([id,title,category])=>{
  const audit=result?.audits.find(a=>a.id===id)||result?.audits.find(a=>(aliases[id]||[]).includes(a.id));
  const state:CheckState=!audit?'not-tested':audit.mode==='notApplicable'?'not-applicable':audit.mode==='manual'?'review':audit.score===null?'not-tested':audit.score>=0.9?'passed':'failed';
  return {id:'lh-'+id,title,category,source:'Lighthouse',state,weight:1,evidence:!audit?(result?'Deze Lighthouse-versie leverde deze audit niet.':error):[audit.title,audit.displayValue,...audit.evidence].filter(Boolean).join('\n').slice(0,1600),action:audit?.description||'Voer een nieuwe mobiele labtest uit. Deze status levert geen scorepunten op.',snippet:audit?.evidence.find(e=>e.includes('<'))?.slice(0,700)};
 });
}
