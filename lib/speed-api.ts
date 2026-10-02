import {normalizeSpeedResult} from './speed-test';
import {publicWebsiteUrl} from './url';
import {json,readJson,runtime,rateLimit,RequestBodyError} from './server';
type Options={limit?:()=>Promise<boolean>;key?:string;transport?:typeof fetch};
export async function speedTestResponse(request:Request,options:Options={}){
  let url:string,device:'mobile'|'desktop';
  try{
    const body=await readJson(request,4000);
    if(typeof body.url!=='string')throw Error('Vul een openbaar websiteadres in.');
    url=publicWebsiteUrl(body.url);
    if(body.device!=='mobile'&&body.device!=='desktop')throw Error('Kies mobiel of desktop.');
    device=body.device;
  }catch(error){return json({code:'invalid_request',error:(error as Error).message},error instanceof RequestBodyError?error.status:400);}
  try{
    // Shares the existing scan budget, so switching tools cannot bypass it.
    if(!await (options.limit?options.limit():rateLimit(request,'scan',5,600)))return json({code:'rate_limit',error:'Er zijn meerdere metingen vanaf dit netwerk gestart. Probeer over tien minuten opnieuw.'},429);
    const endpoint=new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
    endpoint.searchParams.set('url',url);endpoint.searchParams.set('strategy',device);endpoint.searchParams.set('category','performance');endpoint.searchParams.set('locale','nl');
    const key=options.key??runtime().PAGESPEED_API_KEY;
    if(key)endpoint.searchParams.set('key',key);
    const response=await (options.transport??fetch)(endpoint,{cache:'no-store',signal:AbortSignal.timeout(110000)});
    if(!response.ok){
      const quota=response.status===429;
      return json({code:quota?'quota':'upstream',error:quota?'Google heeft op dit moment geen meetcapaciteit beschikbaar. Er is geen resultaat. Probeer later opnieuw.':'Google kon deze pagina niet meten. Controleer of de pagina openbaar bereikbaar is en probeer later opnieuw.'},quota?429:502);
    }
    return json({result:normalizeSpeedResult(await response.json(),url,device)});
  }catch(error){return json({code:'scan_failed',error:(error as Error).name==='TimeoutError'?'De meting duurde te lang. Er is geen resultaat opgeslagen. Probeer later opnieuw.':'Er is geen volledige, geldige meting ontvangen. Probeer later opnieuw.'},502);}
}
