import 'server-only';
import type {HubConnection} from './connection';
import type {HubSnapshots,HubWorkItem,HubUptime} from '../../app/hub/hub-dashboard';
import {createEnvCredentialResolver,integrationIdentity} from './integrations';
import {siteIntegrationConfigs,snapshotStore} from './store';
import {summarizeUptime,UPTIME_INTERVAL_MS,type UptimeSample} from './uptime';
export async function dashboardData(connection:HubConnection,site:{id:string;origin:string}){
  const snapshots:HubSnapshots={stale:{}};const store=snapshotStore(connection);
  let resolve;try{resolve=createEnvCredentialResolver(process.env.HUB_PROVIDER_CREDENTIALS);}catch{resolve=null;}
  for(const config of await siteIntegrationConfigs(connection,site.id)){
    if(!resolve||config.enabled===false)continue;
    const credential=await resolve(site.id,config.config.credentialRef);
    if(!credential||(config.provider==='vercel'?credential.kind!=='vercel-token':credential.kind!=='google-service-account'))continue;
    const snapshot=await store.read(site.id,config.provider);if(!snapshot||snapshot.siteId!==site.id||snapshot.provider!==config.provider)continue;
    // An older in-flight refresh may finish after an assignment changes. Never display it.
    if(snapshot.configFingerprint!==integrationIdentity(site.id,config.provider,config,new Date(snapshot.attemptedAt)).fingerprint)continue;
    snapshots.stale![config.provider]=snapshot.staleReports.length>0||Date.parse(snapshot.nextAttemptAt)<Date.now();
    // Shape is produced by validated server adapters. Configuration changes delete snapshots.
    if(config.provider==='ga4')snapshots.ga4=snapshot.reports as NonNullable<HubSnapshots['ga4']>;
    if(config.provider==='search-console')snapshots.searchConsole=snapshot.reports as NonNullable<HubSnapshots['searchConsole']>;
    if(config.provider==='vercel')snapshots.deployments=snapshot.reports.deployments as NonNullable<HubSnapshots['deployments']>;
  }
  const work=(await connection.db.prepare('SELECT id,title,detail,status,evidence,updated_at FROM hub_work_items WHERE site_id=? ORDER BY updated_at DESC').bind(site.id).all<{id:string;title:string;detail:string;status:HubWorkItem['status'];evidence:string;updated_at:number}>()).results;
  const reports=(await connection.db.prepare('SELECT month,summary FROM hub_monthly_reports WHERE site_id=? ORDER BY month DESC LIMIT 12').bind(site.id).all<{month:string;summary:string}>()).results;
  const to=Math.floor((Date.now()-60000)/UPTIME_INTERVAL_MS)*UPTIME_INTERVAL_MS,from=to-7*86400000;
  const rows=(await connection.db.prepare('SELECT scheduled_at,checked_at,status,http_status,latency_ms,error_code FROM hub_monitor_samples WHERE site_id=? AND scheduled_at>=? AND scheduled_at<? ORDER BY scheduled_at').bind(site.id,from,to).all<{scheduled_at:number;checked_at:number;status:UptimeSample['status'];http_status:number|null;latency_ms:number;error_code:UptimeSample['errorCode']}>()).results;
  const samples=rows.map(row=>({siteId:site.id,origin:site.origin,scheduledAt:Number(row.scheduled_at),checkedAt:Number(row.checked_at),status:row.status,httpStatus:row.http_status,latencyMs:row.latency_ms,errorCode:row.error_code}));
  const uptimeSummary=summarizeUptime(samples,{from,to});
  const uptime:HubUptime|null=samples.length?{checks:samples.map(s=>({checkedAt:new Date(s.checkedAt).toISOString(),status:s.status,httpStatus:s.httpStatus,latencyMs:s.latencyMs})),period:{startDate:new Date(from).toISOString().slice(0,10),endDate:new Date(to).toISOString().slice(0,10)},expectedChecks:uptimeSummary.expectedSlots,sourceLabel:'Sitesnit HTTP-monitor · vijfminutenmetingen · laatste 7 dagen (UTC)'}:null;
  return {snapshots,workItems:work.map(row=>({...row,updatedAt:new Date(Number(row.updated_at)).toISOString()})),reports,uptime,uptimeSummary};
}
