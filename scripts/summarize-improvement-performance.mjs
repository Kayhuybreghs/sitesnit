import fs from 'node:fs';
import path from 'node:path';
const [beforePhase='improvement-stable-before',afterPhase='improvement-after']=process.argv.slice(2);
const base=path.resolve('reports/lighthouse');
const read=phase=>JSON.parse(fs.readFileSync(path.join(base,phase,'summary.json'),'utf8'));
const before=read(beforePhase),after=read(afterPhase);
if(!before.buildUnchangedAtEnd||!after.buildUnchangedAtEnd)throw Error('Both completed build fingerprints are required.');
const median=values=>{const x=values.filter(Number.isFinite).sort((a,b)=>a-b);return x.length?x.length%2?x[(x.length-1)/2]:(x[x.length/2-1]+x[x.length/2])/2:null;};
function details(phase,manifest){return manifest.runs.filter(run=>run.status==='PASS').map(run=>{
 const raw=JSON.parse(fs.readFileSync(path.join(base,phase,run.file),'utf8')),network=raw.audits['network-requests']?.details?.items||[];
 const byType={};for(const request of network){const key=request.resourceType||request.mimeType||'other';byType[key]=(byType[key]||0)+(request.transferSize||0);}
 return {route:run.route,device:run.device,run:run.run,metrics:run.metrics,scores:run.scores,networkBytesByType:byType,resources:network.map(item=>({url:item.url,type:item.resourceType,bytes:item.transferSize})),diagnostics:Object.fromEntries(Object.entries(raw.audits).filter(([id])=>/largest-contentful-paint-element|lcp-(breakdown|discovery)-insight|layout-shift|long-tasks|errors-in-console|csp-xss/.test(id)).map(([id,audit])=>[id,{score:audit.score,displayValue:audit.displayValue,details:audit.details}])),rawReport:path.relative(path.resolve('reports/improvement/performance'),path.join(base,phase,run.file)).replaceAll('\\','/')};
 });}
const a=details(beforePhase,before),b=details(afterPhase,after),comparisons=[];
for(const group of before.groups){const match=b.filter(run=>run.route===group.route&&run.device===group.device),previous=a.filter(run=>run.route===group.route&&run.device===group.device);if(!match.length)continue;
 const metrics={};for(const key of Object.keys(previous[0].metrics)){metrics[key]={before:median(previous.map(x=>x.metrics[key])),after:median(match.map(x=>x.metrics[key]))};}
 const repeated=previous.length>=3&&match.length>=3,alerts=[];
 if(repeated){for(const [key,factor,allowance] of [['largest-contentful-paint',1.2,250],['total-blocking-time',1.5,100]]){const m=metrics[key];if(m.after>Math.max(m.before*factor,m.before+allowance))alerts.push(`${key}: exceeds local regression review budget`);}if(metrics['cumulative-layout-shift'].after>Math.max(.1,metrics['cumulative-layout-shift'].before+.025))alerts.push('CLS: exceeds local regression review budget');}
 comparisons.push({route:group.route,device:group.device,runs:{before:previous.length,after:match.length},repeated,metrics,reviewAlerts:alerts,note:repeated?'Three-run local medians; no percentile or field claim.':'Single observations; insufficient to establish normal variation.'});
}
const result={date:new Date().toISOString(),before:{phase:beforePhase,buildId:before.buildId,hash:before.servedBuildHash},after:{phase:afterPhase,buildId:after.buildId,hash:after.servedBuildHash},settings:{environment:after.environment,sampling:after.sampling},budgetExplanation:'Review budgets compare three-run local medians: LCP +20% or +250ms, TBT +50% or +100ms, whichever allowance is larger; CLS >0.1 or baseline+0.025. These are regression investigation triggers, not field Web Vitals certification. No INP measured.',limitations:['Local cold navigation in fresh Edge profiles; no field INP.','One observation on nonrepresentative routes.','Localhost preview noindex affects Lighthouse SEO scores intentionally; production-host indexing is tested separately.'],comparisons,beforeRuns:a,afterRuns:b};
const output=path.resolve('reports/improvement/performance');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'comparison.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(comparisons.map(({route,device,metrics,reviewAlerts})=>({route,device,LCP:metrics['largest-contentful-paint'],TBT:metrics['total-blocking-time'],CLS:metrics['cumulative-layout-shift'],reviewAlerts})),null,2));
