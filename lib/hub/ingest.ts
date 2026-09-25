import type {HubConnection} from './connection';
import {verifyUptimeEnvelope} from './uptime';
export async function ingestUptime(connection:HubConnection,input:Parameters<typeof verifyUptimeEnvelope>[0]){
  const batch=verifyUptimeEnvelope(input);
  return connection.transaction(async db=>{
    const claimed=await db.prepare('INSERT INTO hub_uptime_deliveries(id,received_at) VALUES(?,?) ON CONFLICT(id) DO NOTHING RETURNING id').bind(batch.deliveryId,Date.now()).first();
    if(!claimed)return {stored:false,duplicate:true};
    for(const sample of batch.samples){
      // Recheck assignment inside the same transaction as the replay claim.
      const site=await db.prepare('SELECT origin FROM hub_sites WHERE id=?').bind(sample.siteId).first<{origin:string}>();
      if(!site||site.origin!==sample.origin)throw new Error('Meetdoel is niet langer toegewezen.');
      await db.prepare('INSERT INTO hub_monitor_samples(site_id,scheduled_at,checked_at,status,http_status,latency_ms,error_code,monitor_id) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(site_id,scheduled_at) DO NOTHING').bind(sample.siteId,sample.scheduledAt,sample.checkedAt,sample.status,sample.httpStatus,sample.latencyMs,sample.errorCode,batch.monitorId).run();
    }
    await db.prepare('DELETE FROM hub_monitor_samples WHERE scheduled_at<?').bind(Date.now()-90*86400000).run();
    await db.prepare('DELETE FROM hub_uptime_deliveries WHERE received_at<?').bind(Date.now()-86400000).run();
    return {stored:true,duplicate:false};
  });
}
