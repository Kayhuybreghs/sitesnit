import fs from 'node:fs/promises';
import { services } from '../app/diensten/service-data.ts';
import { site, euro } from '../app/site-data.ts';
import { guides } from '../lib/guides.ts';
import {speedGuides,speedQuestions} from '../lib/speed-guides.ts';
import { contactServiceNames } from '../lib/contact/options.ts';
import { inspectRenderedContent } from './content-render-contract.mjs';

const phase = process.argv[2] || 'after';
if (!['before','after'].includes(phase)) throw new Error('Expected before or after');
const base = `reports/improvement/content-review/${phase}`;
const records = [];
const origin=process.env.SEO_TEST_ORIGIN;
if(origin&&!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw Error('Content tests only use loopback');
const output=process.env.BROWSER_REPORT_ROOT||'reports/improvement';
await fs.mkdir(`${output}/content-review`,{recursive:true});
async function check(route, contract) {
  const name = route === '/' ? 'home' : route.slice(1).replaceAll('/','__');
  const html = origin ? await (await fetch(origin+route)).text() : await fs.readFile(`${base}/${name}.html`, 'utf8');
  const issues = inspectRenderedContent(html, contract);
  records.push({route, issues, status: issues.length ? 'fail' : 'pass'});
}
for (const service of services) await check(`/diensten/${service.slug}`, {
  questions: service.faqs,
  ...(['seo','seo-optimalisatie','seo-onderhoud'].includes(service.slug) ? {discoveryHref:'/tools/seo-audit'} : {}),
});
if (phase === 'after') {
  await check('/tools/snelheidstest',{requiredText:speedQuestions.flat(),requiredLinks:['/tools/seo-audit',...speedGuides.map(g=>`/tools/snelheidstest/${g.slug}`)]});
  for(const g of speedGuides)await check(`/tools/snelheidstest/${g.slug}`,{requiredText:[g.answer,...g.questions.flat()],requiredLinks:['/tools/snelheidstest#snelheid-meten',g.source]});
  for (const guide of guides) {
    const service = guide.service.slice('/diensten/'.length);
    if (!Object.hasOwn(contactServiceNames, service)) throw new Error(`Unsupported service context: ${guide.slug}: ${service}`);
    await check(`/${guide.slug}`, {requiredLinks:[guide.tool, guide.service, `/contact?dienst=${encodeURIComponent(service)}`]});
  }
  const packages = site.packages.map(plan=>({name:plan.name,price:euro(plan.price).replace(',00','')}));
  for (const route of ['/','/kosten','/diensten/webdesign','/webdesign-venlo']) await check(route, {
    packages, forbiddenText:['gemiddeld rond'],
  });
  await check('/diensten/seo-optimalisatie', {requiredLinks:['/tools/seo-audit','/tools/seo-audit/rapport-naar-actie','/diensten/seo-onderhoud','/contact?dienst=seo-optimalisatie']});
  await check('/diensten/seo-onderhoud', {requiredText:['Wat kost SEO-onderhoud?','zodat je niet dubbel betaalt'],requiredLinks:['/diensten/onderhoud-hosting#maandpakketten','/website-onderhoud-kosten','/diensten/website-monitoring','/contact?dienst=seo-onderhoud']});
  await check('/seo-venlo', {requiredLinks:['/tools/seo-audit','/diensten/seo-optimalisatie','/diensten/seo-onderhoud','/contact?dienst=seo']});
  await check('/diensten/webdesign/pakketten', {requiredLinks:site.packages.map(plan=>`/contact?dienst=webdesign&pakket=${plan.id}`)});
  await check('/website-levert-geen-aanvragen-op', {requiredText:['Noteer per stap: verwacht resultaat, waargenomen resultaat, eventuele afwijking en resultaat van de hercontrole.']});
  await check('/website-niet-gevonden-google', {requiredText:['noteer de Google-indexstatus dan als onbekend']});
  await check('/tools/seo-audit/rapport-naar-actie', {requiredText:['Het aantal meldingen is daarom geen aantal afzonderlijke reparaties of werkuren.','aan je eigen ontwikkelaar geven']});
  const baseline = JSON.parse(await fs.readFile('tests/fixtures/case-paragraphs.json', 'utf8'));
  for (const slug of ['beurswijzer','beurswatcher']) await check(`/projecten/${slug}`, {requiredText:baseline[slug], requiredLinks:[`/contact?project=${slug}`]});
  await check('/seo-venlo',{requiredText:['Zo maak je een dienst concreter'],forbiddenText:['Lokaal zonder plaatsnamenlijst']});
  await check('/webdesign-venlo',{requiredText:site.packages.map(p=>euro(p.price))});

}
const report={checkedAt:new Date().toISOString(),phase,scope:'Received local main HTML; browser visibility tested separately.',records,failures:records.filter(item=>item.issues.length).length};
await fs.writeFile(`${output}/content-review/${phase}-render-check.json`, JSON.stringify(report,null,2));
console.log(JSON.stringify({phase,checks:records.length,failures:report.failures},null,2));
process.exitCode = phase === 'after' && report.failures ? 1 : 0;
