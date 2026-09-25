import {randomUUID} from 'node:crypto';
import type {AppDatabase} from '../database-core';
export type AuditOutcome='started'|'completed'|'failed';
/** Operational counts only: no URL, IP, user ID, cookies or report contents. */
export async function recordAuditUsage(db:AppDatabase,outcome:AuditOutcome,now=Date.now()) {
  if(!['started','completed','failed'].includes(outcome))throw new Error('Unknown audit outcome');
  try {await db.prepare('INSERT INTO events(id,type,created_at) VALUES(?,?,?)').bind(randomUUID(),`seo_audit_${outcome}`,now).run();return true;}
  catch {console.warn('SEO audit usage could not be recorded');return false;}
}
export async function readAuditUsage(db:AppDatabase,now=Date.now()) {
 const start=new Date(now);start.setUTCHours(0,0,0,0);
 const rows=await db.prepare("SELECT type,COUNT(*) AS total,SUM(CASE WHEN created_at>=? THEN 1 ELSE 0 END) AS today FROM events WHERE type IN ('seo_audit_started','seo_audit_completed','seo_audit_failed') AND created_at>=? GROUP BY type").bind(start.getTime(),now-28*86400000).all<{type:string;total:number;today:number}>();
 return ['started','completed','failed'].map(outcome=>{const row=rows.results.find(r=>r.type===`seo_audit_${outcome}`);return {outcome,total:Number(row?.total||0),today:Number(row?.today||0)};});
}
