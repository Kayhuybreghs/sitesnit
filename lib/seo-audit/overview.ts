import type {AuditReport} from './crawl';

export function auditOverview(report:AuditReport){
 const checks=report.pages.flatMap(page=>page.checks||[]);
 const weight=checks.reduce((sum,check)=>sum+check.weight,0);
 const passedWeight=checks.reduce((sum,check)=>sum+(check.passed?check.weight:0),0);
 const categories=[
  {name:'Bereikbaarheid & links',codes:['http','redirect','broken-link']},
  {name:'Indexering & hoofdversies',codes:['noindex','canonical-multiple','canonical-other']},
  {name:'Tekst & paginatitels',codes:['title','description','h1','duplicate-title','duplicate-description']},
  {name:'Beelden & gestructureerde data',codes:['alt','json']},
  {name:'Overige controles',codes:['non-html']},
 ].map(category=>({...category,count:new Set(report.findings.filter(f=>category.codes.includes(f.code)).map(f=>f.url)).size}));
 return {score:weight?Math.round(100*passedWeight/weight):null,checks:checks.length,passed:checks.filter(c=>c.passed).length,weight,passedWeight,categories};
}
