import type {AppDatabase} from '../database-core';
import {productionOrigin} from '../seo-policy';

// Called only inside authenticated administration; no customer memberships or invented measurements.
export async function ensureOwnHubSite(db:AppDatabase){
 const existing=await db.prepare('SELECT id FROM hub_sites WHERE origin=? OR origin=? LIMIT 1').bind(productionOrigin,'https://sitesnit.nl').first<{id:string}>();
 if(existing)return existing.id;
 await db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?) ON CONFLICT(id) DO NOTHING').bind('sitesnit-own-client','Sitesnit — eigen website',Date.now()).run();
 await db.prepare('INSERT INTO hub_sites(id,client_id,name,origin,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind('sitesnit-own','sitesnit-own-client','Sitesnit',productionOrigin,Date.now()).run();
 return 'sitesnit-own';
}
