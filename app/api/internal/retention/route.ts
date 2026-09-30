import { runtime } from "../../../../lib/runtime";
import { retentionResponse, authorizedMaintenance } from "../../../../lib/retention";
import {contactConnection,contactMailConfig} from '../../../../lib/contact/runtime';
import {cleanupContactMetadata} from '../../../../lib/contact/maintenance';
import {drainContactOutbox} from '../../../../lib/contact/store';
import {recordContactHeartbeat} from '../../../../lib/contact/health';

export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(request: Request) {
  const { DB, CRON_SECRET } = runtime();
  if(authorizedMaintenance(request,CRON_SECRET)){
    try {
      const connection=await contactConnection();
      await cleanupContactMetadata(connection.db);
      await drainContactOutbox(connection,contactMailConfig(),{limit:4});
      await recordContactHeartbeat(connection.db);
    }catch{return Response.json({error:'Contactonderhoud niet afgerond. Controleer migratie en opslag.'},{status:503,headers:{'Cache-Control':'no-store'}});}
  }
  return retentionResponse(request, DB, CRON_SECRET);
}
export const POST = GET;
