import {createHash,randomBytes} from 'node:crypto';
import type {HubConnection} from './connection';
import type {AppDatabase} from '../database-core';
export const invitationHash=(token:string)=>createHash('sha256').update(token).digest('hex');
export async function findInvitation(db:AppDatabase,email:string,token:string){
  if(!/^[a-f0-9]{64}$/.test(token))return null;
  return db.prepare('SELECT token_hash,email,client_id,role FROM hub_invitations WHERE token_hash=? AND email=? AND accepted_by IS NULL AND expires_at>?').bind(invitationHash(token),email.trim().toLowerCase(),Date.now()).first<{token_hash:string;email:string;client_id:string|null;role:'client'|'admin'}>();
}
export async function issueInvitation(db:AppDatabase,email:string,clientId:string|null,role:'client'|'admin'='client'){
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||role==='client'&&!clientId)throw new Error('Ongeldige uitnodiging.');
  const token=randomBytes(32).toString('hex');
  await db.prepare('INSERT INTO hub_invitations(token_hash,email,client_id,role,expires_at,created_at) VALUES(?,?,?,?,?,?)').bind(invitationHash(token),email.trim().toLowerCase(),clientId,role,Date.now()+48*3600000,Date.now()).run();
  return token;
}
export async function acceptInvitation(connection:HubConnection,userId:string,email:string,token:string){
  await connection.transaction(async db=>{
    const invite=await findInvitation(db,email,token);if(!invite)throw new Error('Uitnodiging niet geldig.');
    const used=await db.prepare('UPDATE hub_invitations SET accepted_by=? WHERE token_hash=? AND accepted_by IS NULL RETURNING token_hash').bind(userId,invite.token_hash).first();
    if(!used)throw new Error('Uitnodiging is al gebruikt.');
    if(invite.role==='admin')await db.prepare('INSERT INTO hub_admins(user_id) VALUES(?) ON CONFLICT(user_id) DO NOTHING').bind(userId).run();
    else await db.prepare('INSERT INTO hub_memberships(user_id,client_id) VALUES(?,?) ON CONFLICT(user_id,client_id) DO NOTHING').bind(userId,invite.client_id).run();
  });
}
