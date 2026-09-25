import {randomUUID} from 'node:crypto';
import {hubSession} from '../../../../lib/hub/session';
import {requireHubAdmin} from '../../../../lib/hub/access';
import {administerHub} from '../../../../lib/hub/store';
import {issueInvitation,invitationHash} from '../../../../lib/hub/invitations';
import {synchronizeHubSite} from '../../../../lib/hub/sync';
import {hubJson,sameHubOrigin} from '../../../../lib/hub/http';
import {readObjectBody} from '../../../../lib/request-body';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request:Request){
  try{
    const context=await hubSession(request.headers);if(!context)return hubJson({error:'Log opnieuw in.'},401);
    if(!sameHubOrigin(request,context.runtime.baseURL))return hubJson({error:'Ongeldige aanvraag.'},403);
    await requireHubAdmin(context.runtime.connection.db,context.user);
    const input=await readObjectBody(request,16384);const connection=context.runtime.connection;
    if(input.action==='invite'||input.action==='sync'){
      if(typeof input.siteId!=='string')return hubJson({error:'Kies een website.'},400);
      const site=await connection.db.prepare('SELECT id,client_id FROM hub_sites WHERE id=?').bind(input.siteId).first<{id:string;client_id:string}>();
      if(!site)return hubJson({error:'Website niet gevonden.'},404);
      if(input.action==='invite'){
        if(typeof input.email!=='string')return hubJson({error:'Vul een e-mailadres in.'},400);
        const token=await issueInvitation(connection.db,input.email,site.client_id);
        try{await context.runtime.send({to:input.email,subject:'Je uitnodiging voor Sitesnit Hub',text:`Je kunt de websitegegevens van je bedrijf bekijken in Sitesnit Hub. Open binnen 48 uur je persoonlijke uitnodiging: ${context.runtime.baseURL}/hub/uitnodiging?token=${token}\nHeb je al een account? Log eerst in en open daarna deze link opnieuw. Deel deze link niet.`});}
        catch{await connection.db.prepare('DELETE FROM hub_invitations WHERE token_hash=? AND accepted_by IS NULL').bind(invitationHash(token)).run();return hubJson({error:'De uitnodiging is niet verzonden. Controleer de mailkoppeling of probeer later opnieuw.'},503);}
      }else await synchronizeHubSite(connection,site.id);
      await connection.db.prepare('INSERT INTO hub_admin_log(id,user_id,action,site_id,created_at) VALUES(?,?,?,?,?)').bind(randomUUID(),context.user.id,input.action,site.id,Date.now()).run();
      return hubJson({ok:true,message:input.action==='invite'?'De e-mailprovider heeft de uitnodiging aangenomen.':'Bronnen gecontroleerd. Bekijk per bron de bijgewerkte status.'});
    }
    const result=await administerHub(connection,context.user,input);
    return hubJson({ok:true,message:'Opgeslagen.',...result});
  }catch{return hubJson({error:'Niet opgeslagen. Controleer je rechten en de ingevulde gegevens. Bij afgerond werk is een hercontrole nodig.'},400);}
}
