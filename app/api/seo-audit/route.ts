import {crawlSite} from '../../../lib/seo-audit/crawl';
import {auditUrl} from '../../../lib/seo-audit/network';
import {json,readJson,rateLimit,runtime,RequestBodyError} from '../../../lib/server';
import {consumeRateLimit} from '../../../lib/rate-limit';
import {recordAuditUsage} from '../../../lib/seo-audit/usage';
import {isAuditAdmin} from '../../../lib/seo-audit/admin';
import {attachMobileLab} from '../../../lib/seo-audit/lab';
export const maxDuration=180;
export async function POST(request:Request){
 try{
  const body=await readJson(request,2500);if(typeof body.url!=='string')return json({error:'Vul je websiteadres in.'},400);
  const url=auditUrl(body.url).href;
  if(process.env.VERCEL&&process.env.SEO_AUDIT_ENABLED!=='true')return json({error:'De afzonderlijke SEO-audit is nog niet geactiveerd. Je kunt de uitleg bekijken.'},503);
  if(process.env.VERCEL&&!process.env.RATE_LIMIT_SECRET)return json({error:'De daglimiet is nog niet veilig ingesteld. Scannen is tijdelijk niet beschikbaar.'},503);
  const admin=await isAuditAdmin(request.headers);
  if(!admin&&!(await rateLimit(request,'seo-audit-day',1,86400)))return json({error:'De gratis audit is vandaag al gebruikt vanaf jouw netwerk. Morgen (na 00:00 UTC) kun je opnieuw scannen.'},429);
  const env=runtime();
  if(!admin&&!(await consumeRateLimit(env.DB,request,'seo-audit-global',25,86400,{vercel:false,secret:env.RATE_LIMIT_SECRET})))return json({error:'Het gezamenlijke dagbudget is bereikt. Morgen is er weer ruimte; er wordt geen betaalde scan gestart.'},429);
  await recordAuditUsage(env.DB,'started');
  try {const report=await attachMobileLab(await crawlSite(url),env.PAGESPEED_API_KEY);await recordAuditUsage(env.DB,'completed');return json(report);}
  catch(error){await recordAuditUsage(env.DB,'failed');throw error;}
 }catch(error){if(error instanceof RequestBodyError)return json({error:error.message},error.status);return json({error:error instanceof Error&&/^(Gebruik|Dit adres|Robots|Te veel|Het startadres)/.test(error.message)?error.message:'De audit kon niet worden afgerond. Controleer het openbare HTTPS-adres. Een geblokkeerde of onbereikbare website krijgt geen verzonnen rapport.'},422);}
}
