import {hubSession} from '../../../../lib/hub/session';
import {requireHubAdmin} from '../../../../lib/hub/access';
import {hubJson,sameHubOrigin} from '../../../../lib/hub/http';
import {readObjectBody} from '../../../../lib/request-body';
import {contactConnection,contactMailConfig} from '../../../../lib/contact/runtime';
import {recoverContactMail,reconcileContactMail} from '../../../../lib/contact/admin';
import {drainContactOutbox} from '../../../../lib/contact/store';
import {ContactError} from '../../../../lib/contact/input';
export const runtime='nodejs';
export const maxDuration=30;
export async function POST(request:Request){
  try {
    const context=await hubSession(request.headers);
    if(!context) return hubJson({error:'Log opnieuw in.'},401);
    if(!sameHubOrigin(request,context.runtime.baseURL)) return hubJson({error:'Niet toegestaan.'},403);
    await requireHubAdmin(context.runtime.connection.db,context.user);
    const connection=await contactConnection();
    const input=await readObjectBody(request,2048);
    if(input.action==='reconcile'){
      await reconcileContactMail(connection,context.user.id,input,contactMailConfig().apiKey);return hubJson({ok:true});
    }
    const inquiryId=await recoverContactMail(connection,context.user.id,input);
    await drainContactOutbox(connection,contactMailConfig(),{inquiryId});
    return hubJson({ok:true});
  } catch(error){return hubJson({error:error instanceof ContactError?error.message:'Herstel niet uitgevoerd. Controleer je rechten en de mailinstellingen.'},error instanceof ContactError?error.status:403);}
}
