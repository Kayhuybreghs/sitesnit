import robotsParser from 'robots-parser';
import {auditUrl,readPublicHtml,type AuditResponse} from './network';
import {analyze,duplicateFindings,type AuditedPage,type Finding} from './analyze';
export type AuditReport={origin:string;checkedAt:string;pages:AuditedPage[];findings:Finding[];discovered:number;skipped:number;limited:boolean;notes:string[]};
const bot='SitesnitAudit';
export async function crawlSite(input:string,read:(url:string)=>Promise<AuditResponse>=readPublicHtml):Promise<AuditReport>{
 let start=auditUrl(input);const began=Date.now();
 const originalRead=read;
 read=async url=>{const remaining=50000-(Date.now()-began);if(remaining<=0)throw new Error('Crawlbudget bereikt.');let timer:ReturnType<typeof setTimeout>|undefined;try{return await Promise.race([originalRead(url),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('Crawlbudget bereikt.')),remaining);})]);}finally{if(timer)clearTimeout(timer);}};
 const pages:AuditedPage[]=[],notes:string[]=[];let skipped=0;const visited=new Set<string>(),discovered=new Set<string>();
 let robots=robotsParser(start.origin+'/robots.txt','');
 async function policy(url:URL){
  const r=await read(url.origin+'/robots.txt');
  if(r.status!==200&&r.status!==404&&r.status!==410)throw new Error('Robots.txt kon niet betrouwbaar worden gelezen. De crawl is niet gestart.');
  if(r.status===200&&r.headers['content-type']?.includes('text/html'))throw new Error('Robots.txt geeft HTML terug. Controleer eerst de crawler-toegang.');
  robots=robotsParser(url.origin+'/robots.txt',r.status===200?r.body:'');
 }
 await policy(start);
 // Only the initial hostname may normalize between www and non-www, always re-checking robots and DNS.
 for(let hop=0;hop<3;hop++){
  if(robots.isAllowed(start.href,bot)===false)throw new Error('Robots.txt staat deze crawl niet toe. Er zijn geen pagina’s onderzocht.');
  const first=await read(start.href);
  if(first.status>=300&&first.status<400&&first.headers.location){const target=auditUrl(new URL(first.headers.location,start).href);if(target.hostname.replace(/^www\./,'')!==start.hostname.replace(/^www\./,''))throw new Error('Het startadres verwijst naar een ander domein. Vul de uiteindelijke website zelf in.');start=target;await policy(start);continue;}
  pages.push(analyze(first));visited.add(start.href);break;
 }
 if(!pages.length)throw new Error('Te veel redirects op het startadres.');
 const queue=[...pages[0].links];queue.forEach(u=>discovered.add(u));discovered.add(start.href);
 const delay=Math.max(250,(robots.getCrawlDelay(bot)||0)*1000);
 if(delay>5000){notes.push('Deze website vraagt een lange crawl-pauze. Alleen het startadres is onderzocht.');queue.length=0;}
 while(queue.length&&pages.length<20&&Date.now()-began<45000){
  const url=queue.shift()!;if(visited.has(url))continue;visited.add(url);
  if(new URL(url).origin!==start.origin||robots.isAllowed(url,bot)===false||/\/(api|hub|admin|account|login|logout|cart|checkout)(\/|$)/i.test(new URL(url).pathname)){skipped++;continue;}
  await new Promise(resolve=>setTimeout(resolve,delay));
  try{const r=await read(url);const page=analyze(r);pages.push(page);for(const link of page.links){if(discovered.size>=400)break;if(!discovered.has(link)){discovered.add(link);queue.push(link);}}}
  catch{skipped++;notes.push(`Niet volledig onderzocht: ${url}. Netwerk-, formaat- of veiligheidsgrens bereikt.`);}
 }
 const findings=[...pages.flatMap(p=>p.findings),...duplicateFindings(pages)];
 for(const page of pages.filter(p=>p.status===404||p.status===410)){const sources=pages.filter(p=>p.links.includes(page.url));if(sources.length)findings.push({code:'broken-link',priority:'hoog',title:'Interne link naar een ontbrekende pagina',url:page.url,evidence:`HTTP ${page.status}; gevonden op ${sources.slice(0,3).map(p=>p.url).join(', ')}`,why:'Bezoekers volgen een verwijzing die nergens meer op uitkomt.',action:'Herstel de bestemming of wijzig/verwijder de verwijzende link.'});}
 const rank={hoog:0,middel:1,controle:2};findings.sort((a,b)=>rank[a.priority]-rank[b.priority]);
 return {origin:start.origin,checkedAt:new Date().toISOString(),pages,findings,discovered:discovered.size,skipped,limited:queue.length>0||skipped>0||delay>5000,notes:[...notes,'HTML-steekproef: maximaal 20 pagina’s, een domein en 45 seconden crawlbudget. Geen JavaScript-rendering, Lighthouse, backlinkdatabase, Google-indexcontrole of volledige schema-validatie. Query-URLs, privé-routes en nofollow-links worden niet gevolgd.']};
}
