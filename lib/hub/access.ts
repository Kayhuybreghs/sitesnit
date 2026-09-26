import type { AppDatabase } from '../database-core';
import {hasHubMfaProof,hasHubMfaDeferral} from './mfa';
export type HubIdentity={id:string;email:string;emailVerified:boolean;twoFactorEnabled?:boolean;sessionId?:string};
export type HubSite={id:string;client_id:string;name:string;origin:string;created_at:number};
export class HubAccessError extends Error {constructor(){super('Geen toegang tot deze omgeving.');this.name='HubAccessError';}}
export function safeHubReturn(value:unknown){return typeof value==='string'&&/^\/hub(?:\/[a-zA-Z0-9_-]+)*$/.test(value)&&!value.startsWith('/hub/login')?value:'/hub';}
export async function isHubAdmin(db:AppDatabase,user:HubIdentity){
  if(!user.emailVerified||!await db.prepare('SELECT user_id FROM hub_admins WHERE user_id=?').bind(user.id).first())return false;
  return await hasHubMfaProof(db,user.id,user.sessionId)||await hasHubMfaDeferral(db,user.id,user.sessionId);
}
export async function requiresAdminSetup(db:AppDatabase,user:HubIdentity){return user.emailVerified&&Boolean(await db.prepare('SELECT user_id FROM hub_admins WHERE user_id=?').bind(user.id).first())&&!await isHubAdmin(db,user);}
export async function listHubSites(db:AppDatabase,user:HubIdentity):Promise<HubSite[]> {
  if(!user.emailVerified)throw new HubAccessError();
  return (await db.prepare('SELECT s.* FROM hub_sites s INNER JOIN hub_memberships m ON m.client_id=s.client_id WHERE m.user_id=? ORDER BY s.name').bind(user.id).all<HubSite>()).results;
}
export async function requireHubSite(db:AppDatabase,user:HubIdentity,siteId:string):Promise<HubSite>{
  if(!user.emailVerified||!/^[-a-zA-Z0-9]{1,80}$/.test(siteId))throw new HubAccessError();
  const site=await db.prepare('SELECT s.* FROM hub_sites s INNER JOIN hub_memberships m ON m.client_id=s.client_id WHERE s.id=? AND m.user_id=?').bind(siteId,user.id).first<HubSite>();
  if(!site)throw new HubAccessError();return site;
}
export async function requireHubAdmin(db:AppDatabase,user:HubIdentity){if(!await isHubAdmin(db,user))throw new HubAccessError();}
