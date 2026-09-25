import {getHubRuntime} from '../../../../lib/hub/runtime';
import {hubJson,validJobSecret} from '../../../../lib/hub/http';
import {synchronizeHubSite} from '../../../../lib/hub/sync';
export const runtime='nodejs';
export const maxDuration=60;
/** Explicit externally scheduled POST; no production scheduler is enabled automatically. */
export async function POST(request:Request){
  if(!validJobSecret(request,process.env.HUB_SYNC_SECRET))return hubJson({error:'Geen toegang.'},401);
  const context=await getHubRuntime();if(!context)return hubJson({error:'Niet ingericht.'},503);
  // One bounded refresh per invocation. Provider TTLs must not starve other sites.
  const sites=(await context.connection.db.prepare('SELECT s.id FROM hub_sites s LEFT JOIN hub_site_sync_attempts a ON a.site_id=s.id ORDER BY COALESCE(a.attempted_at,0),s.id LIMIT 1').all<{id:string}>()).results;
  const outcomes=[];
  for(const site of sites){await context.connection.db.prepare('INSERT INTO hub_site_sync_attempts(site_id,attempted_at) VALUES(?,?) ON CONFLICT(site_id) DO UPDATE SET attempted_at=excluded.attempted_at').bind(site.id,Date.now()).run();try{await synchronizeHubSite(context.connection,site.id);outcomes.push({siteId:site.id,checked:true});}catch{outcomes.push({siteId:site.id,checked:false});}}
  return hubJson({results:outcomes,limit:1});
}
