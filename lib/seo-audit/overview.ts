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
 if(report.version===2){
  const all=report.pages.flatMap(p=>p.detailedChecks||[]);
  const scored=all.filter(c=>c.weight>0&&['passed','failed'].includes(c.state));
  const weight=scored.reduce((n,c)=>n+c.weight,0),passedWeight=scored.filter(c=>c.state==='passed').reduce((n,c)=>n+c.weight,0);
  const htmlScore=weight?100*passedWeight/weight:null;
  const labScores=['performance','accessibility','best-practices','seo'].map(id=>report.lab?.categories.find(c=>c.id===id)?.score);
  const complete=htmlScore!==null&&labScores.every(s=>typeof s==='number');
  const detailed=[...all,...report.labChecks||[]];
  const groups=[...new Set(detailed.map(c=>c.category))].map(name=>({name,codes:[],count:new Set(report.pages.filter(p=>p.detailedChecks?.some(c=>c.category===name&&c.state==='failed')).map(p=>p.url)).size+(report.labChecks?.some(c=>c.category===name&&c.state==='failed')&&!report.pages.some(p=>p.url===report.lab?.finalUrl&&p.detailedChecks?.some(c=>c.category===name&&c.state==='failed'))?1:0)}));
  return {score:complete?Math.round((htmlScore!+labScores.reduce<number>((n,s)=>n+(s??0),0))/5):null,htmlScore:htmlScore===null?null:Math.round(htmlScore),checks:detailed.filter(c=>['passed','failed'].includes(c.state)).length,passed:detailed.filter(c=>c.state==='passed').length,weight,passedWeight,categories:groups,notTested:detailed.filter(c=>c.state==='not-tested').length,notApplicable:detailed.filter(c=>c.state==='not-applicable').length,reviews:detailed.filter(c=>c.state==='review').length};
 }
 return {score:weight?Math.round(100*passedWeight/weight):null,checks:checks.length,passed:checks.filter(c=>c.passed).length,weight,passedWeight,categories};
}
