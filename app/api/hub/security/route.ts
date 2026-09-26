import {hubSession} from '../../../../lib/hub/session';
import {deferHubMfa} from '../../../../lib/hub/mfa';
import {hubJson,sameHubOrigin} from '../../../../lib/hub/http';
import {readObjectBody} from '../../../../lib/request-body';
export const runtime='nodejs';
export async function POST(request:Request){
  try{
    const context=await hubSession(request.headers);
    if(!context)return hubJson({error:'Log opnieuw in.'},401);
    if(!sameHubOrigin(request,context.runtime.baseURL))return hubJson({error:'Ongeldige aanvraag.'},403);
    const input=await readObjectBody(request,1024);
    if(input.action!=='defer-mfa'||input.acceptRisk!==true)return hubJson({error:'Bevestig eerst dat je het risico begrijpt.'},400);
    await deferHubMfa(context.runtime.connection.db,context.user.id,context.user.sessionId);
    return hubJson({ok:true});
  }catch{return hubJson({error:'Overslaan is niet beschikbaar. Als tweestapsbeveiliging al aanstaat, gebruik je je authenticator of een herstelcode.'},409);}
}
