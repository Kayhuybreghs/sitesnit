import {getHubRuntime} from '../../../../lib/hub/runtime';
import {readObjectBody} from '../../../../lib/request-body';
import {findInvitation} from '../../../../lib/hub/invitations';
export const runtime='nodejs';
const getPaths=new Set(['get-session','verify-email','reset-password']);
const postPaths=new Set(['sign-in/email','sign-up/email','sign-out','request-password-reset','reset-password','send-verification-email','two-factor/enable','two-factor/verify-totp','two-factor/verify-backup-code','two-factor/get-totp-uri','two-factor/generate-backup-codes','revoke-sessions']);
function fail(status:number){return Response.json({error:'Deze handeling is niet beschikbaar. Probeer opnieuw of neem contact op met Sitesnit.'},{status,headers:{'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}});}
async function handle(request:Request){
  const context=await getHubRuntime();if(!context)return fail(503);
  const url=new URL(request.url);const action=url.pathname.replace(/^\/api\/hub-auth\//,'');
  const resetCallback=request.method==='GET'&&/^reset-password\/[a-zA-Z0-9_-]{20,200}$/.test(action);
  if(!resetCallback&&!(request.method==='GET'?getPaths:postPaths).has(action))return fail(404);
  try{
    if(request.method==='POST'){
      if(request.headers.get('origin')!==new URL(context.baseURL).origin||!request.headers.get('content-type')?.startsWith('application/json'))return fail(403);
      const body=await readObjectBody(request,16384);
      if(action==='two-factor/verify-totp'||action==='two-factor/verify-backup-code')body.trustDevice=false;
      if(action==='sign-up/email'&&(typeof body.email!=='string'||!await findInvitation(context.connection.db,body.email,request.headers.get('x-sitesnit-invitation')||'')))return fail(400);
      for(const key of ['callbackURL','redirectTo','newUserCallbackURL','errorCallbackURL'])if(key in body){
        const value=body[key];if(typeof value!=='string'||!['/hub','/hub/login','/hub/reset-password'].includes(value))return fail(400);
      }
      request=new Request(request.url,{method:'POST',headers:request.headers,body:JSON.stringify(body)});
    }else if(action==='verify-email'||resetCallback){
      url.searchParams.set('callbackURL',resetCallback?'/hub/reset-password':'/hub/login');request=new Request(url,{headers:request.headers});
    }
    const result=await context.auth.handler(request);
    result.headers.set('Cache-Control','private, no-store');result.headers.set('X-Robots-Tag','noindex, nofollow');
    return result;
  }catch{return fail(400);}
}
export const GET=handle;
export const POST=handle;
