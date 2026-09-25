import {hubSession} from '../../../../lib/hub/session';
import {acceptInvitation} from '../../../../lib/hub/invitations';
import {hubJson,sameHubOrigin} from '../../../../lib/hub/http';
import {readObjectBody} from '../../../../lib/request-body';
export async function POST(request:Request){
  const context=await hubSession(request.headers);if(!context)return hubJson({error:'Log in en bevestig je e-mailadres.'},401);
  if(!sameHubOrigin(request,context.runtime.baseURL))return hubJson({error:'Ongeldige aanvraag.'},403);
  try{const body=await readObjectBody(request,1024);if(typeof body.token!=='string')throw new Error();await acceptInvitation(context.runtime.connection,context.user.id,context.user.email,body.token);return hubJson({ok:true});}
  catch{return hubJson({error:'Deze uitnodiging is verlopen, al gebruikt of voor een ander e-mailadres.'},400);}
}
