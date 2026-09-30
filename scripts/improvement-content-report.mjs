import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {parse} from 'parse5';
import {guides} from '../lib/guides.ts';
import {services} from '../app/diensten/service-data.ts';
import {auditGuides} from '../lib/seo-audit/guides.ts';
import {contactServiceNames} from '../lib/contact/options.ts';
import {pageDecisions,serviceDecisions,guideDecisions,auditDecisions,semanticGroups} from './improvement-content-decisions.mjs';

const root = path.resolve('reports/improvement/content-review');
const read = async name => JSON.parse(await fs.readFile(path.join(root,name),'utf8'));
const before = await read('before/manifest.json');
const after = await read('after/manifest.json');
const renderCheck = await read('after-render-check.json');
const browser = await read('browser/report.json');
const generatedAt = new Date().toISOString();
const finalRender = process.env.CONTENT_RENDER_VERSION === 'production-final';
const version = finalRender ? 'Finale lokale productiebuild; zie renderherkomst en tijdstippen.' : 'Tussenmeting: after-snapshots zijn ouder dan de laatste bronwijzigingen. Definitieve productie-render en browsercontrole nog nodig.';
const hash = value => createHash('sha256').update(value).digest('hex');
const fileName = route => route==='/' ? 'home' : route.slice(1).replaceAll('/','__');
const json = async (name,value) => fs.writeFile(path.join(root,name),JSON.stringify(value,null,2)+'\n');
await fs.mkdir(path.join(root,'pages'),{recursive:true});
await fs.mkdir(path.join(root,'source-after'),{recursive:true});

const sourceRecords=[];
for(const name of await fs.readdir(path.join(root,'source-before'))) {
  const source=name.slice(0,-4).replaceAll('__','/');
  const old=await fs.readFile(path.join(root,'source-before',name),'utf8');
  const current=await fs.readFile(source,'utf8');
  await fs.writeFile(path.join(root,'source-after',name),current);
  sourceRecords.push({source,before:`source-before/${name}`,after:`source-after/${name}`,beforeHash:hash(old),afterHash:hash(current),changed:old!==current});
}
await json('source-comparison.json',{generatedAt,status:'Captured current source; does not prove it was rendered in the after snapshot.',records:sourceRecords});

const missingBefore=await read('before-render-check.json');
const norm=value=>value.replace(/\s+/g,' ').trim();
const attr=(node,name)=>node.attrs?.find(a=>a.name===name)?.value;
const find=(node,predicate)=>[...(predicate(node)?[node]:[]),...(node.childNodes||[]).flatMap(child=>find(child,predicate))];
const skipped=new Set(['script','style','noscript','nav','footer','aside','template']);
const sharedClasses=new Set(['guide-next','case-next','guide-related','case-study-nav','breadcrumbs']);
const text=node=>skipped.has(node.tagName)||(attr(node,'class')||'').split(/\s+/).some(name=>sharedClasses.has(name))?'':node.nodeName==='#text'?node.value:(node.childNodes||[]).map(text).join(' ');
const ngrams=value=>{const words=value.toLowerCase().match(/[\p{L}\p{N}]+/gu)||[];return new Set(words.slice(0,-4).map((_,i)=>words.slice(i,i+5).join(' ')));};
const corpora=[];
const pages=[];
for(const old of before.records){
  const current=after.records.find(record=>record.route===old.route);
  if(!current)throw new Error(`Missing after route: ${old.route}`);
  const route=old.route;
  const guide=guides.find(g=>route===`/${g.slug}`);
  const service=services.find(s=>route===`/diensten/${s.slug}`);
  const audit=auditGuides.find(g=>route===`/tools/seo-audit/${g.slug}`);
  let decision=pageDecisions[route];
  if(guide){
    const [preserved,change]=guideDecisions[guide.id];
    decision=['gericht aanscherpen',guide.outcome,guide.audience,`${guide.id} getoetst aan bijlage B. De eerdere onderwerp-query gaf geen herkende dienstcontext door.`,preserved,`${change} Gemeenschappelijke contactlink gebruikt nu een toegestane dienstwaarde.`,guide.related,guide.tool];
  } else if(service){
    const [status,preserved,change,overlap,primary]=serviceDecisions[service.slug];
    const defects=missingBefore.records.find(item=>item.route===route)?.issues||[];
    decision=[status,`Uitvoering, scope en vervolgstap beoordelen voor ${service.slug.replaceAll('-',' ')}`,'Ondernemers die passend werk, scope en vervolgstap zoeken',defects.length?`Bewezen rendergebrek: ${defects.map(issue=>issue.question||issue.code).join('; ')}.`:'Eigen inhoud reeds aanwezig; voorstelkoppen zijn geen bewijs van een fout.',preserved,change,overlap,primary];
  } else if(audit){
    decision=[audit.slug==='rapport-naar-actie'?'gericht aanscherpen':'behouden',audit.title,'Bezoekers die een specifieke auditbevinding willen beoordelen','Bestaande concrete uitleg gelezen tegen bijlage B.6; verschillen tussen meting, handwerk en onbekend blijven nodig.',auditDecisions[audit.slug],audit.slug==='rapport-naar-actie'?'Samenhang tussen meldingen, oorzaken en werkuren plus vrije uitvoerkeuze verduidelijkt.':'Geen onnodige herschrijving.',[audit.related,'/seo-audit-checklist'],'/tools/seo-audit'];
  } else if(['/privacy','/cookies','/algemene-voorwaarden'].includes(route)){
    decision=['behouden; ketenreview apart','Werkelijke gegevensverwerking of afspraken begrijpen','Bezoekers en opdrachtgevers','Geen taalherschrijving die juridische betekenis verandert; wijzigingen horen bij werkelijk gedrag.','Bestaande inhoud en afbakening; contact/privacy-agent toetst aan de werkelijke keten.','Geen inhoudelijke wijziging door contentagent.',['/contact'],'/contact'];
  } else if(route==='/tools'||route.startsWith('/tools/')){
    decision=['gericht aanscherpen door root','Een zelfstandige tool kiezen of uitvoeren','Bezoekers die hun situatie eerst zelf willen verkennen','Microcopy en capaciteit moeten de werkelijke states volgen; root toetst de volledige invoer/resultaat/herstel/aanvraagroute.','Bestaande zelfstandige uitkomsten en grenzen; geen gratis complete website, automatische winnaar of volledige indexstatus beloofd.','Root beheert toolfunctionaliteit en bewijs. Dit dossier inventariseert de gerenderde inhoud, geen end-to-end-acceptatie.',['/diensten'],'/contact'];
  }
  if(!decision)throw new Error(`Editorial decision missing: ${route}`);
  const [status,task,audience,observation,preserved,change,overlap,primary]=decision;
  const oldHtml=await fs.readFile(path.join(root,old.htmlFile),'utf8');
  const html=await fs.readFile(path.join(root,current.htmlFile),'utf8');
  const document=parse(html); const main=find(document,node=>node.tagName==='main')[0];
  corpora.push({route,grams:ngrams(norm(text(main||document)))});
  const contexts=current.links.filter(link=>link.href.startsWith('/contact?')).map(link=>{
    const query=new URL(link.href,'https://www.sitesnit.nl').searchParams;
    const service=query.get('dienst'); const project=query.get('project');
    return {href:link.href,service,project,recognized:service?Object.hasOwn(contactServiceNames,service):['beurswijzer','beurswatcher'].includes(project),evidence:'Observed href + source allowlist; no click/submission claim.'};
  });
  const checks=renderCheck.records.filter(record=>record.route===route);
  const browserChecks=browser.records.filter(record=>record.route===route);
  const record={route,status,task,audience,observation,preserved,change,ownContribution:guide?.unique||task,primaryRoute:primary,overlap,
    evidence:{before:old.textFile,beforeHtml:old.htmlFile,after:current.textFile,afterHtml:current.htmlFile,renderVersion:version,beforeCapturedAt:old.capturedAt,afterCapturedAt:current.capturedAt,beforeHash:old.contentHash,afterHash:current.contentHash,bodyTextEqual:old.contentHash===current.contentHash,
      originalParagraphs:old.paragraphs.length,preservedParagraphs:old.paragraphs.filter(p=>current.paragraphs.includes(p)).length,removedOrRewordedParagraphs:old.paragraphs.filter(p=>!current.paragraphs.includes(p)),renderChecks:checks,contactContexts:contexts,browser:browserChecks,
      screenshots:browserChecks.flatMap(item=>item.screenshots||[]),caseFaqBefore:route.startsWith('/projecten/')?find(find(parse(oldHtml),node=>node.tagName==='main')[0],node=>node.tagName==='details').length:null,caseFaqAfter:route.startsWith('/projecten/')?find(main,node=>node.tagName==='details').length:null},
    claims:{sources:guide?.sources||[],basis:'Zie claims-and-prices.md; tarieven uit centrale eigen bron, cases uit bestaande projectgegevens, nieuwe voorbeelden herkenbaar fictief. Geen gemeten ranking-/conversiewinst.',limitations:'Bestaande eigen bedrijfsbeschrijvingen zijn projectbron, geen onafhankelijke controle van externe prestaties.'},
    open:{owner:'Root: finale render/browser + category tests. Kay: uiteindelijke publicatie en zakelijke afspraken indien wijziging nodig.',status:'Agentreview; geen eigenaarakkoord. '+version}};
  pages.push(record);
  const links=[...new Set(current.links.filter(link=>link.href.startsWith('/')).map(link=>link.href))];
  const bullet=items=>items.map(item=>`- ${item}`).join('\n');
  const md=`# ${route}\n\nStatus: ${status}. Agentreview, geen goedkeuring door Kay.\n\n${version}\n\n## Taak en beslissing\n\n${task}. Doelgroep: ${audience}.\n\nWaarneming: ${observation}\n\nBehouden: ${preserved}\n\nUitgevoerd: ${change}\n\nEigen bijdrage: ${record.ownContribution}\n\nPrimaire route: ${primary}\n\n## Volledige tekst en behoud\n\n[Vóórtekst](../${old.textFile}) · [Vóór-HTML](../${old.htmlFile}) · [Natekst](../${current.textFile}) · [Na-HTML](../${current.htmlFile})\n\nTijdstippen: ${old.capturedAt} → ${current.capturedAt}. Hoofdtekst exact gelijk: ${record.evidence.bodyTextEqual}. ${record.evidence.preservedParagraphs}/${old.paragraphs.length} oorspronkelijke alinea’s exact behouden; gewijzigde alinea’s staan volledig in review-register.json. Alineabehoud is bewijs, geen kwaliteitsscore.\n\n## Claims en overlap\n\n[Bronnen en commerciële invarianten](../claims-and-prices.md). ${record.claims.basis}\n\nVergelijkbare routes: ${overlap.join(', ')}. [Inhoudelijke beslissing](../overlap-review.md).\n\n## Links en contactcontext\n\nDeze links zijn aangetroffen in ontvangen lokale HTML; een href bewijst geen klik of aflevering. Volledige routes/HTTP/anchors worden apart door de SEO-agent gecontroleerd.\n\n${bullet(links)}\n\nContactcontext in deze render: ${contexts.length?contexts.map(c=>`${c.href}: ${c.recognized?'herkende context':'geen herkende context'}`).join('; '):'geen query-CTA in de hoofdinhoud'}. Laatste broncontext kan nieuwer zijn dan deze render.\n\nRendercontract: ${checks.length?checks.map(c=>c.status).join(', '):'geen specifiek contract voor deze route; wel volledige snapshot'}. Browser: ${browserChecks.length?browserChecks.map(c=>`${c.width}px, HTTP ${c.status}, overflow ${c.overflow}, ${c.errors.length} paginafouten`).join('; '):'niet uitgevoerd binnen deze contentrun'}. Screenshots: ${record.evidence.screenshots.length?record.evidence.screenshots.join(', '):'niet uitgevoerd'}. Geen formulier verzonden in de contentrun.\n\n## Open en verantwoordelijke\n\n${record.open.owner} ${record.open.status}\n`;
  await fs.writeFile(path.join(root,'pages',fileName(route)+'.md'),md);
}
await json('review-register.json',{generatedAt,version,status:'Agent review; owner approval not asserted.',count:pages.length,pages});
const comparisons=[];
for(let i=0;i<corpora.length;i++)for(let j=i+1;j<corpora.length;j++){
  const a=corpora[i],b=corpora[j];let intersection=0;for(const gram of a.grams)if(b.grams.has(gram))intersection++;
  const jaccard=intersection/(a.grams.size+b.grams.size-intersection||1);
  comparisons.push({a:a.route,b:b.route,sharedFiveWordSequences:intersection,jaccard:Number(jaccard.toFixed(4))});
}
comparisons.sort((a,b)=>b.jaccard-a.jaccard);
await json('literal-overlap.json',{generatedAt,version,method:'Five-word set Jaccard of after main text, excluding script/style/nav/footer/aside and shared end CTAs. Candidate retrieval only; not a semantic or quality verdict.',comparisons});
await fs.writeFile(path.join(root,'overlap-review.md'),`# Inhoudelijke overlapreview\n\nAgentreview; geen automatisch uniciteitsoordeel of eigenaarakkoord. ${version}\n\n[Letterlijke kandidaten](literal-overlap.json) vergelijkt alle ${comparisons.length} routeparen na uitsluiting van navigatie/footer/aside en generieke eind-CTA’s. De maat vindt herhaalde formuleringen; gedeelde voorwaarden kunnen nodig zijn. De onderstaande beoordeling vergelijkt de bezoekerstaak en het gegeven antwoord.\n\n${semanticGroups.map(group=>`## ${group.routes.join(' · ')}\n\n${group.decision}`).join('\n\n')}\n\n## Overige pagina’s\n\nDe acht overige diensten beantwoorden verschillende uitvoeringsvragen (webshop, merk, native app, webapp, sociale posts, proces, formulier/rekentool, koppeling). De zes audituitlegpagina’s zijn gekoppeld aan verschillende concrete signalen. Privacy, cookies en voorwaarden hebben eigen informatietaken. Geen samenvoeging of URL-wijziging is nodig om woordelijke overeenkomst te verminderen.\n\n## Hoogste letterlijke kandidaten\n\n${comparisons.slice(0,12).map(c=>`- ${c.a} ↔ ${c.b}: ${c.sharedFiveWordSequences} gedeelde vijfwoordreeksen; Jaccard ${c.jaccard}.`).join('\n')}\n\nDeze lijst op zichzelf bewijst geen duplicatie. Eindoordeel blijft gekoppeld aan de genoemde taakverschillen en volledige dossiers; bijgewerkte render vereist opnieuw genereren.\n`);
const cases=pages.filter(page=>page.route.startsWith('/projecten/')).map(page=>({route:page.route,textExactlyPreserved:page.evidence.bodyTextEqual,paragraphsBefore:page.evidence.originalParagraphs,paragraphsPreserved:page.evidence.preservedParagraphs,faqBlocksBefore:page.evidence.caseFaqBefore,faqBlocksAfter:page.evidence.caseFaqAfter,context:page.evidence.contactContexts,removedOrReworded:page.evidence.removedOrRewordedParagraphs}));
await json('case-preservation.json',{generatedAt,version,method:'Full received main text hash and exact paragraph retention, plus preexisting details elements and supported project context. No fabricated missing case FAQ.',cases});
console.log(JSON.stringify({pages:pages.length,sources:sourceRecords.length,literalPairs:comparisons.length,cases,version},null,2));
