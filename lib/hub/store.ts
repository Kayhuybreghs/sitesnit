import {randomUUID} from 'node:crypto';
import type {HubConnection} from './connection';
import {requireHubAdmin,type HubIdentity,type HubSite} from './access';
import {parseIntegrationConfig,type IntegrationStore,type IntegrationSnapshot} from './integrations';
import type {Source} from './providers/common';
export function snapshotStore(connection:HubConnection):IntegrationStore {
  const db=connection.db;
  return {
    async read(siteId,provider){const row=await db.prepare('SELECT payload_json FROM hub_snapshots WHERE site_id=? AND provider=?').bind(siteId,provider).first<{payload_json:string}>();if(!row)return null;try{return JSON.parse(row.payload_json) as IntegrationSnapshot;}catch{return null;}},
    async write(s){await db.prepare('INSERT INTO hub_snapshots(site_id,provider,payload_json,fetched_at,expires_at,error_code) VALUES(?,?,?,?,?,?) ON CONFLICT(site_id,provider) DO UPDATE SET payload_json=excluded.payload_json,fetched_at=excluded.fetched_at,expires_at=excluded.expires_at,error_code=excluded.error_code').bind(s.siteId,s.provider,JSON.stringify(s),Date.parse(s.attemptedAt),Date.parse(s.nextAttemptAt),Object.values(s.refreshCodes)[0]||null).run();},
    async withLock(siteId,provider,work){const owner=randomUUID();const lock=await db.prepare('INSERT INTO hub_sync_locks(site_id,provider,owner,expires_at) VALUES(?,?,?,?) ON CONFLICT(site_id,provider) DO UPDATE SET owner=excluded.owner,expires_at=excluded.expires_at WHERE hub_sync_locks.expires_at<? RETURNING owner').bind(siteId,provider,owner,Date.now()+120000,Date.now()).first();if(!lock)throw new Error('Deze bron wordt al vernieuwd.');try{return await work();}finally{await db.prepare('DELETE FROM hub_sync_locks WHERE site_id=? AND provider=? AND owner=?').bind(siteId,provider,owner).run();}},
  };
}
export async function siteIntegrationConfigs(connection:HubConnection,siteId:string){
  const rows=(await connection.db.prepare('SELECT provider,config_json FROM hub_integrations WHERE site_id=?').bind(siteId).all<{provider:Source;config_json:string}>()).results;
  return rows.map(row=>parseIntegrationConfig(siteId,row.provider,row.config_json));
}
function text(value:unknown,max:number){if(typeof value!=='string'||!value.trim()||value.length>max)throw new Error('Vul de gevraagde gegevens in.');return value.trim();}
export async function readAdminPreview(connection:HubConnection,user:HubIdentity,siteId:string){
  await requireHubAdmin(connection.db,user);
  const site=await connection.db.prepare('SELECT * FROM hub_sites WHERE id=?').bind(siteId).first<HubSite>();
  if(!site)throw new Error('Website niet gevonden.');
  await connection.db.prepare('INSERT INTO hub_admin_log(id,user_id,action,site_id,created_at) VALUES(?,?,?,?,?)').bind(randomUUID(),user.id,'preview',siteId,Date.now()).run();
  return site;
}
export async function administerHub(connection:HubConnection,user:HubIdentity,input:Record<string,unknown>){
  await requireHubAdmin(connection.db,user);
  return connection.transaction(async db=>{
    let siteId:string|null=null;
    if(input.action==='create-site'){
      const name=text(input.name,120),client=text(input.client,120);const url=new URL(text(input.origin,2048));
      if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||url.pathname!=='/'||/^(localhost|127\.|10\.|192\.168\.|\[)/i.test(url.hostname))throw new Error('Gebruik het publieke HTTPS-hoofdadres.');
      const clientId=randomUUID();siteId=randomUUID();
      await db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind(clientId,client,Date.now()).run();
      await db.prepare('INSERT INTO hub_sites(id,client_id,name,origin,created_at) VALUES(?,?,?,?,?)').bind(siteId,clientId,name,url.origin,Date.now()).run();
    }else{
      siteId=text(input.siteId,80);if(!await db.prepare('SELECT id FROM hub_sites WHERE id=?').bind(siteId).first())throw new Error('Website niet gevonden.');
      if(input.action==='work-item'){
        const status=text(input.status,20);if(!['open','in_progress','completed'].includes(status))throw new Error('Ongeldige status.');
        const title=text(input.title,180),detail=text(input.detail,5000),evidence=typeof input.evidence==='string'?input.evidence.slice(0,3000):'';
        if(status==='completed'&&!evidence.trim())throw new Error('Vermeld de uitgevoerde wijziging en hercontrole.');
        if(typeof input.id==='string'&&input.id){const changed=await db.prepare('UPDATE hub_work_items SET title=?,detail=?,status=?,evidence=?,updated_at=? WHERE id=? AND site_id=? RETURNING id').bind(title,detail,status,evidence,Date.now(),input.id,siteId).first();if(!changed)throw new Error('Werkpunt niet gevonden.');}
        else await db.prepare('INSERT INTO hub_work_items(id,site_id,title,detail,status,evidence,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(randomUUID(),siteId,title,detail,status,evidence,Date.now(),Date.now()).run();
      }else if(input.action==='monthly-report'){
        const month=text(input.month,7);if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new Error('Kies een geldige maand.');
        await db.prepare('INSERT INTO hub_monthly_reports(site_id,month,summary,created_at) VALUES(?,?,?,?) ON CONFLICT(site_id,month) DO UPDATE SET summary=excluded.summary,created_at=excluded.created_at').bind(siteId,month,text(input.summary,8000),Date.now()).run();
      }else if(input.action==='integration'){
        const provider=text(input.provider,20) as Source;const configJson=text(input.config,5000);parseIntegrationConfig(siteId,provider,configJson);
        await db.prepare('INSERT INTO hub_integrations(site_id,provider,config_json) VALUES(?,?,?) ON CONFLICT(site_id,provider) DO UPDATE SET config_json=excluded.config_json').bind(siteId,provider,configJson).run();
        await db.prepare('DELETE FROM hub_snapshots WHERE site_id=? AND provider=?').bind(siteId,provider).run();
      }else if(input.action==='revoke-member'){
        const client=await db.prepare('SELECT client_id FROM hub_sites WHERE id=?').bind(siteId).first<{client_id:string}>();
        await db.prepare('DELETE FROM hub_memberships WHERE client_id=? AND user_id=?').bind(client!.client_id,text(input.userId,100)).run();
      }else throw new Error('Onbekende handeling.');
    }
    await db.prepare('INSERT INTO hub_admin_log(id,user_id,action,site_id,created_at) VALUES(?,?,?,?,?)').bind(randomUUID(),user.id,String(input.action),siteId,Date.now()).run();
    return {siteId};
  });
}
