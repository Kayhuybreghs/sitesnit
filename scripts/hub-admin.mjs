/** Explicit administration. No production migrations or mail are run implicitly. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {getMigrations} from 'better-auth/db/migration';
import {sqliteHubConnection,postgresHubConnection} from '../lib/hub/connection.ts';
import {hubSchema} from '../lib/hub/schema.ts';
import {createHubAuth} from '../lib/hub/auth.ts';
import {issueInvitation} from '../lib/hub/invitations.ts';
const action=process.argv[2],root=path.resolve('.sites-runtime');
if(!['init-local','plan-production','bootstrap-admin'].includes(action))throw new Error('Gebruik init-local, plan-production of bootstrap-admin.');
if(action==='init-local'&&process.env.VERCEL)throw new Error('Lokale initialisatie is niet beschikbaar op Vercel.');
await fs.mkdir(path.join(root,'storage'),{recursive:true});
let config;
if(action==='init-local'){
  try{config=JSON.parse(await fs.readFile(path.join(root,'hub-local.json'),'utf8'));}catch{config={enabled:true,secret:randomBytes(48).toString('hex')};await fs.writeFile(path.join(root,'hub-local.json'),JSON.stringify(config),{flag:'wx'});}
}
const production=action!=='init-local'&&process.argv.includes('--production');
if(action==='plan-production'&&!production)throw new Error('Vermeld --production voor een productiemigratievoorstel; dit voert geen migratie uit.');
if(production&&(!process.env.DATABASE_URL||!process.env.HUB_AUTH_SECRET))throw new Error('Productieconfiguratie ontbreekt.');
if(!production&&!config)config=JSON.parse(await fs.readFile(path.join(root,'hub-local.json'),'utf8'));
const connection=production?postgresHubConnection(process.env.DATABASE_URL):sqliteHubConnection(path.join(root,'storage/hub.sqlite'));
try{
  const auth=createHubAuth(connection,{secret:production?process.env.HUB_AUTH_SECRET:config.secret,baseURL:production?process.env.HUB_AUTH_URL:'http://127.0.0.1:5184',send:async()=>{throw new Error('Dit script verstuurt geen e-mail.');}});
  if(action==='init-local'){await connection.executeSchema(hubSchema);await(await getMigrations(auth.options)).runMigrations();console.log('Lokale Hub-database en authschema geïnitialiseerd. Er zijn geen gebruikers of verzonden mails.');}
  if(action==='plan-production'){const migration=await getMigrations(auth.options,{throwOnUnsafe:false});const sql=await migration.compileMigrations();await fs.writeFile(path.join(root,'hub-migration-review.sql'),hubSchema+'\n'+sql);console.log('Alleen migratievoorstel opgeslagen. Niet uitgevoerd.');}
  if(action==='bootstrap-admin'){
    const email=process.argv.find(a=>a.startsWith('--email='))?.slice(8);if(!email)throw new Error('Vermeld --email= voor de echte beheerder.');
    if(await connection.db.prepare('SELECT user_id FROM hub_admins LIMIT 1').first())throw new Error('Er bestaat al een beheerder. Gebruik de bestaande beheerprocedure.');
    const token=await issueInvitation(connection.db,email,null,'admin');const url=(production?process.env.HUB_AUTH_URL:'http://127.0.0.1:5184')+'/hub/uitnodiging?token='+token;
    await fs.writeFile(path.join(root,'hub-admin-invitation.txt'),url,{mode:0o600});console.log('Eenmalige beheeruitnodiging lokaal opgeslagen in .sites-runtime/hub-admin-invitation.txt. Niet delen; e-mailverificatie en TOTP blijven vereist.');
  }
}finally{await connection.close();}
