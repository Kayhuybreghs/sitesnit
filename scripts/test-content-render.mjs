import fs from 'node:fs/promises';
import { services } from '../app/diensten/service-data.ts';
import { site, euro } from '../app/site-data.ts';
import { guides } from '../lib/guides.ts';
import { contactServiceNames } from '../lib/contact/options.ts';
import { inspectRenderedContent, renderedMainParagraphs } from './content-render-contract.mjs';

const phase = process.argv[2] || 'after';
if (!['before','after'].includes(phase)) throw new Error('Expected before or after');
const base = `reports/improvement/content-review/${phase}`;
const records = [];
async function check(route, contract) {
  const name = route === '/' ? 'home' : route.slice(1).replaceAll('/','__');
  const html = await fs.readFile(`${base}/${name}.html`, 'utf8');
  const issues = inspectRenderedContent(html, contract);
  records.push({route, issues, status: issues.length ? 'fail' : 'pass'});
}
for (const service of services) await check(`/diensten/${service.slug}`, {
  questions: service.faqs,
  ...(['seo','seo-optimalisatie','seo-onderhoud'].includes(service.slug) ? {discoveryHref:'/tools/seo-audit'} : {}),
});
if (phase === 'after') {
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
  const baseline = JSON.parse(await fs.readFile('reports/improvement/content-review/before/manifest.json', 'utf8'));
  for (const slug of ['beurswijzer','beurswatcher']) {
    const original = baseline.records.find(record=>record.route===`/projecten/${slug}`);
    const originalHtml = await fs.readFile(`reports/improvement/content-review/${original.htmlFile}`, 'utf8');
    await check(`/projecten/${slug}`, {requiredText:renderedMainParagraphs(originalHtml), requiredLinks:[`/contact?project=${slug}`]});
  }
}
const report={checkedAt:new Date().toISOString(),phase,scope:'Received local main HTML; browser visibility tested separately.',records,failures:records.filter(item=>item.issues.length).length};
await fs.writeFile(`reports/improvement/content-review/${phase}-render-check.json`, JSON.stringify(report,null,2));
console.log(JSON.stringify({phase,checks:records.length,failures:report.failures},null,2));
process.exitCode = phase === 'after' && report.failures ? 1 : 0;
