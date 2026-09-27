// Reproducible editorial inventory; no external access or private data.
import fs from 'node:fs/promises';
import {site,euro} from '../app/site-data.ts';
import {business,grossPrice,minimumHostingYear} from '../lib/business.ts';
import {hostingPlans,blogPlans,socialPrices} from '../lib/pricing.ts';
import {services} from '../app/diensten/service-data.ts';
import {guides} from '../lib/guides.ts';
import {auditGuides} from '../lib/seo-audit/guides.ts';
import {pageSeo} from '../app/page-seo-data.ts';
import {routeCatalog} from '../lib/route-catalog.ts';
const origin='https://www.sitesnit.nl';
const link=(path)=>`[${path}](${origin+path})`;
let md='# Aanbod en prijzen van Sitesnit\n\nGecontroleerde codecatalogus, 27 september 2026. Alle grote hoofdprijzen zijn exclusief 21% btw; het bedrag inclusief btw staat eronder. Bedragen en pakket-ID’s zijn behouden. Contact: contact@sitesnit.nl. Dit document bevat geen nieuwe tariefafspraken.\n\n## Websitebouw\n\nAlle pakketten krijgen een eigen ontwerp. Omvang en functies bepalen het verschil.\n\n| Pakket | Omvang | Excl. btw | Incl. btw | Pagina |\n|---|---|---:|---:|---|\n';
for(const p of site.packages)md+=`| ${p.name} | ${p.pages} | ${p.id==='maatwerk'?'vanaf ':''}**${euro(p.price)}** | ${p.id==='maatwerk'?'vanaf ':''}${euro(grossPrice(p.price))} | ${link('/kosten#'+p.id)} |\n`;
md+=`\n60% voor de start en 40% bij afronding. Facturen binnen ${business.paymentDays} dagen. Hosting hoort bij een nieuwe website: eerste looptijd 12 maanden, daarna maandelijks opzegbaar. Minimaal **${euro(minimumHostingYear)} excl. btw** (${euro(grossPrice(minimumHostingYear))} incl. btw) voor het eerste jaar boven op de bouwprijs. Technisch onderhoud en nieuwe inhoud zijn optioneel. Dit geldt niet automatisch voor iedere losse SEO-, content- of appopdracht.\n\n| Bouw + eerste hostingjaar | Excl. btw | Incl. btw |\n|---|---:|---:|\n`;
for(const p of site.packages)md+=`| ${p.name} | ${p.id==='maatwerk'?'vanaf ':''}**${euro(p.price+minimumHostingYear)}** | ${p.id==='maatwerk'?'vanaf ':''}${euro(grossPrice(p.price+minimumHostingYear))} |\n`;
md+='\nDe genoemde gemiddelde maatwerkprojectprijs van €4.000 excl. / €4.840 incl. btw is een indicatie uit de bestaande code, geen vierde pakket of vast tarief.\n';
for(const [heading,plans,path] of [['Hosting en onderhoud',hostingPlans,'/diensten/onderhoud-hosting#maandpakketten'],['Blogs en content',blogPlans,'/diensten/content#maandpakketten']]){
 md+=`\n## ${heading}\n\n${link(path)}\n\n| Pakket | Per maand excl. btw | Per maand incl. btw | Inhoud |\n|---|---:|---:|---|\n`;
 for(const p of plans)md+=`| ${p.name} | **${euro(p.price)}** | ${euro(grossPrice(p.price))} | ${p.items.join('; ')} |\n`;
}
md+='\n## Social media\n\n'+link('/diensten/social-media#maandpakketten')+'\n\nBasisposts worden voor de gekozen platforms aangepast en geplaatst. Reacties, privéberichten, advertenties en extra beeldproductie worden afzonderlijk afgesproken.\n\n| Basisposts per maand | Platforms | Excl. btw per maand | Incl. btw per maand |\n|---|---:|---:|---:|\n';
for(const [count,...prices] of socialPrices)for(const [index,p] of prices.entries())md+=`| ${count} | ${index+1} | **${euro(p)}** | ${euro(grossPrice(p))} |\n`;
md+='\n## Diensten en prijsroute\n\n| Dienst | Prijsafspraak | Pagina |\n|---|---|---|\n';
for(const s of services)md+=`| ${s.name} | ${s.slug==='webdesign'?'Websitepakketten hierboven; overige scope op voorstel':['onderhoud-hosting','content','social-media'].includes(s.slug)?'Maandpakketten hierboven; extra werk op voorstel':'Voorstel op basis van de afgesproken scope; geen vast tarief gepubliceerd'} | ${link('/diensten/'+s.slug)} |\n`;
md+=`| Sitesnit Hub / website-monitoring | Betaalde aanvullende dienst; maandbedrag en koppelingen vooraf afspreken, geen vast tarief gepubliceerd | ${link('/diensten/website-monitoring')} |\n\n## Gratis tools\n\nGeen betaalde dienst of abonnement door alleen de tool te gebruiken. De SEO-audit heeft de bestaande gratis gebruiksgrenzen.\n\n`;
for(const path of ['/tools/website-check','/tools/website-kosten-berekenen','/tools/website-offerte-vergelijken','/tools/automatiseringsplan','/tools/website-ontwerp-tool','/tools/seo-audit'])md+=`- ${link(path)}\n`;
md+='\nExterne software, appstorekosten, nieuwe functies en niet afgesproken werkzaamheden worden niet stilzwijgend inbegrepen. De websiteberekening is een oriëntatie, geen definitieve offerte.\n';
await fs.mkdir('docs',{recursive:true});await fs.writeFile('docs/aanbod-en-prijzen.md',md);
let map='# Publieke pagina’s: vraag en vervolgstap\n\nDeze inhoudelijke routekaart is geen claim over zoekvolumes of posities. De browser- en HTTP-resultaten staan afzonderlijk in reports/routes-na-herstel.json.\n\n| URL | Primaire vraag / intentie | Passende vervolgstap |\n|---|---|---|\n';
for(const {path,intent} of routeCatalog){
 const guide=guides.find(g=>'/'+g.slug===path),audit=auditGuides.find(g=>'/tools/seo-audit/'+g.slug===path),service=services.find(s=>'/diensten/'+s.slug===path);
 let question=guide?.title||audit?.title||pageSeo[path]?.title||intent;
 let next=guide?.tool|| (audit?'/tools/seo-audit':service?service.contact:path.startsWith('/projecten/')?'/contact?project='+path.split('/').pop():path==='/kosten'?'/contact?pakket=website':path.startsWith('/tools/')?'/contact':path==='/contact'?'/privacy':path==='/diensten'?'/diensten/webdesign':path==='/projecten'?'/projecten/beurswijzer':path==='/diensten/website-monitoring'?'/contact?dienst=website-monitoring':'/contact');
 if(['/privacy','/cookies','/algemene-voorwaarden'].includes(path))next='/contact';
 map+=`| ${link(path)} | ${question.replaceAll('|','/')} | ${link(next)} |\n`;
}
map+='\nKostenpagina: actuele tarieven vergelijken. Wat-kost-een-website: prijsfactoren begrijpen. Prijscheck: eigen scope invoeren. Pakketverdieping: verschillen en inbegrepen omvang beoordelen. Geen URL-migratie of homepageherontwerp.\n';
await fs.writeFile('docs/pagina-intenties-en-vervolgstappen.md',map);
console.log('Price catalogue and '+routeCatalog.length+'-route editorial map generated.');
