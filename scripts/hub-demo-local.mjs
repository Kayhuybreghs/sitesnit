/** Explicit disposable demo accounts in the separate LOCAL Hub DB. Never contacts email/providers. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {randomBytes} from 'node:crypto';
import {sqliteHubConnection} from '../lib/hub/connection.ts';
import {createHubAuth} from '../lib/hub/auth.ts';
import {issueInvitation} from '../lib/hub/invitations.ts';

if(process.env.VERCEL||process.argv[2]!=='create')throw new Error('Use create in the local Sitesnit checkout only.');
const root=path.resolve('.sites-runtime');
const config=JSON.parse(await fs.readFile(path.join(root,'hub-local.json'),'utf8'));
if(config.enabled!==true||typeof config.secret!=='string')throw new Error('Initialize the local Hub first.');
const connection=sqliteHubConnection(path.join(root,'storage/hub.sqlite'));
const baseURL='http://127.0.0.1:5184',mail=[];
const auth=createHubAuth(connection,{secret:config.secret,baseURL,send:async message=>{mail.push(message);}});
const accounts=[{role:'client',email:'klant-demo@example.test',name:'Demoklant — fictief'},{role:'admin',email:'beheer-demo@example.test',name:'Demobeheerder — alleen lokaal'}];
try{
  for(const account of accounts)if(await connection.db.prepare('SELECT id FROM hub_auth_user WHERE email=?').bind(account.email).first())throw new Error('Demo account already exists; do not overwrite it.');
  await connection.db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?) ON CONFLICT(id) DO NOTHING').bind('demo-client-local','Voorbeeldbedrijf — fictief',Date.now()).run();
  await connection.db.prepare('INSERT INTO hub_sites(id,client_id,name,origin,created_at) VALUES(?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind('demo-site-local','demo-client-local','Voorbeeldbedrijf — lokale demo','https://example.com',Date.now()).run();
  const credentials=[];
  for(const account of accounts){
    const password=randomBytes(18).toString('base64url');
    const token=await issueInvitation(connection.db,account.email,account.role==='client'?'demo-client-local':null,account.role);
    const r=await auth.handler(new Request(baseURL+'/api/hub-auth/sign-up/email',{method:'POST',headers:{'Content-Type':'application/json',Origin:baseURL,'x-sitesnit-invitation':token},body:JSON.stringify({email:account.email,name:account.name,password})}));
    if(!r.ok)throw new Error('Local demo signup failed.');
    const verificationURL=mail.at(-1)?.text.match(/http:\/\/\S+/)?.[0];
    if(!verificationURL||new URL(verificationURL).origin!==baseURL)throw new Error('Unexpected fixture mail.');
    const verified=await auth.handler(new Request(verificationURL));if(![200,302].includes(verified.status))throw new Error('Local verification failed.');
    credentials.push(`### ${account.role==='admin'?'Beheerder':'Klant'}\n\n- E-mail: ${account.email}\n- Wachtwoord: ${password}\n`);
  }
  await connection.db.prepare('INSERT INTO hub_work_items(id,site_id,title,detail,status,evidence,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind('demo-editable-work','demo-site-local','Demotaak: probeer een toelichting te wijzigen','Alleen een lokale oefentaak. Geen echte klant of uitgevoerd werk.','open','',Date.now(),Date.now()).run();
  const instructions='# Lokale Hub-demoaccounts\n\nAlleen geldig op http://127.0.0.1:5184/hub/login. Niet voor de live website. Er is geen e-mail verstuurd en er zijn geen bronnen aangesloten.\n\n'+credentials.join('\n')+'\nDe beheerder stelt bij de eerste login zelf een authenticator in. MFA is niet uitgezet. Daarna: /hub/admin → Voorbeeldbedrijf kiezen → demotaak aanpassen. Gebruik geen echte klantgegevens in dit demoaccount.\n\nDe klant ziet alleen dit ene fictieve dossier. Bronvelden blijven onbekend zolang niets echt gekoppeld is. Bekijk gevulde verzonnen cijfers zonder inloggen op /hub/demo.\n';
  await fs.writeFile(path.join(root,'hub-demo-accounts.md'),instructions,{flag:'wx',mode:0o600});
  console.log('Local demo accounts created. Login details saved to .sites-runtime/hub-demo-accounts.md. No real email sent.');
}finally{await connection.close();}
