import {normalizeLighthouse} from '../lighthouse';
import {lighthouseChecks} from './detailed';
import type {AuditReport} from './crawl';
export async function attachMobileLab(report:AuditReport,key:string|undefined,request:typeof fetch=fetch){
 if(!key){report.labError='PageSpeed Insights is niet geconfigureerd. De HTML-controles blijven beschikbaar.';report.labChecks=lighthouseChecks(undefined,report.labError);return report;}
 try{
  const endpoint=new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  endpoint.searchParams.set('url',report.pages[0].url);endpoint.searchParams.set('strategy','mobile');endpoint.searchParams.set('locale','nl');endpoint.searchParams.set('key',key);
  for(const category of ['performance','accessibility','best-practices','seo'])endpoint.searchParams.append('category',category);
  const response=await request(endpoint,{cache:'no-store',signal:AbortSignal.timeout(110000)});
  if(!response.ok)throw new Error(response.status===429?'Google heeft het beschikbare meetquotum bereikt.':'Google kon de mobiele labtest niet afronden.');
  report.lab=normalizeLighthouse(await response.json(),report.pages[0].url);report.labChecks=lighthouseChecks(report.lab);
  for(const finding of report.lab.findings)report.findings.push({code:'lh-'+finding.id,priority:finding.priority>=8?'hoog':'middel',url:report.lab.finalUrl,title:finding.title,evidence:[finding.what,...finding.evidence||[]].join('\n'),why:finding.why,action:finding.action});
 }catch(error){report.labError=error instanceof Error&&error.message.startsWith('Google')?error.message:'De mobiele labtest is niet compleet ontvangen. Er zijn geen snelheidsscores verzonnen.';report.labChecks=lighthouseChecks(undefined,report.labError);}
 return report;
}
