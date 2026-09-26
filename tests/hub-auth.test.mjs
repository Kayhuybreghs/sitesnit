import {ensureOwnHubSite} from '../lib/hub/own-site.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes,createHmac} from 'node:crypto';
import {getMigrations} from 'better-auth/db/migration';
import {sqliteHubConnection} from '../lib/hub/connection.ts';
import {hubSchema} from '../lib/hub/schema.ts';
import {createHubAuth} from '../lib/hub/auth.ts';
import {issueInvitation,findInvitation,acceptInvitation} from '../lib/hub/invitations.ts';
import {requireHubSite,isHubAdmin,requireHubAdmin,requiresAdminSetup,safeHubReturn} from '../lib/hub/access.ts';
import {hubMfaSchema,hasHubMfaProof} from '../lib/hub/mfa.ts';

function totp(uri){const encoded=new URL(uri).searchParams.get('secret');let bits='';for(const c of encoded.replace(/=/g,''))bits+='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(c).toString(2).padStart(5,'0');const bytes=[];for(let i=0;i+8<=bits.length;i+=8)bytes.push(parseInt(bits.slice(i,i+8),2));const count=Buffer.alloc(8);count.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));const digest=createHmac('sha1',Buffer.from(bytes)).update(count).digest();const at=digest[19]&15;return String((digest.readUInt32BE(at)&0x7fffffff)%1000000).padStart(6,'0');}
async function fixture(beforeSend=async()=>{}){
  const connection=sqliteHubConnection(':memory:');await connection.executeSchema(hubSchema+hubMfaSchema);const mail=[];
  const auth=createHubAuth(connection,{secret:randomBytes(32).toString('hex'),baseURL:'https://hub.example.test',send:async m=>{await beforeSend();mail.push(m);}});
  await(await getMigrations(auth.options)).runMigrations();
  for(const id of ['a','b']){await connection.db.prepare('INSERT INTO hub_clients(id,name,created_at) VALUES(?,?,?)').bind(id,`Client ${id}`,Date.now()).run();await connection.db.prepare('INSERT INTO hub_sites(id,client_id,name,origin,created_at) VALUES(?,?,?,?,?)').bind(`site-${id}`,id,`Website ${id}`,`https://${id}.example.test`,Date.now()).run();}
  const request=async(action,body,cookie='',extra={})=>{const response=await auth.handler(new Request(`https://hub.example.test/api/hub-auth/${action}`,{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://hub.example.test',Cookie:cookie,...extra},body:JSON.stringify(body)}));const cookies=response.headers.getSetCookie().map(c=>c.split(';')[0]).join('; ');return {status:response.status,data:await response.json(),cookies,headers:response.headers};};
  return{connection,auth,mail,request};
}
test('invite, verification, login, tenant boundaries, session revocation and admin MFA',async()=>{
  const f=await fixture();try{
    const email='client-a@example.test',password='Fixture-only-password-9274';
    const invite=await issueInvitation(f.connection.db,email,'a');
    const signup=await f.request('sign-up/email',{email,password,name:'Fixture A'},'',{'x-sitesnit-invitation':invite});
    assert.equal(signup.status,200,JSON.stringify(signup.data));assert.equal(f.mail.length,1);assert.ok(!signup.cookies.includes('session_token'));
    const id=signup.data.user.id;
    await assert.rejects(()=>requireHubSite(f.connection.db,{id,email,emailVerified:false},'site-a'));
    const verificationURL=f.mail[0].text.match(/https:\/\/\S+/)[0];const verify=await f.auth.handler(new Request(verificationURL));assert.ok([200,302].includes(verify.status));
    const login=await f.request('sign-in/email',{email,password});assert.equal(login.status,200);assert.match(login.headers.get('set-cookie'),/HttpOnly/i);assert.match(login.headers.get('set-cookie'),/Secure/i);
    const sessionBefore=await f.auth.api.getSession({headers:new Headers({cookie:login.cookies})});
    const identity={...sessionBefore.user,sessionId:sessionBefore.session.id};
    assert.equal((await requireHubSite(f.connection.db,identity,'site-a')).id,'site-a');
    await assert.rejects(()=>requireHubSite(f.connection.db,identity,'site-b'));
    await assert.rejects(()=>requireHubSite(f.connection.db,identity,"site-a' OR 1=1--"));
    assert.equal(await findInvitation(f.connection.db,email,invite),null);
    await f.connection.db.prepare('INSERT INTO hub_admins(user_id) VALUES(?)').bind(id).run();assert.equal(await isHubAdmin(f.connection.db,identity),false);
    const oldLogin=await f.request('sign-in/email',{email,password});assert.equal(oldLogin.status,200);
    const enrollment=await f.request('two-factor/enable',{password},login.cookies);assert.equal(enrollment.status,200,JSON.stringify(enrollment.data));
    assert.equal(await hasHubMfaProof(f.connection.db,id,identity.sessionId),false,'enrollment alone is not MFA');
    const verified=await f.request('two-factor/verify-totp',{code:totp(enrollment.data.totpURI)},[login.cookies,enrollment.cookies].join('; '));assert.equal(verified.status,200,JSON.stringify(verified.data));
    const enrolled=await f.auth.api.getSession({headers:new Headers({cookie:verified.cookies})});
    assert.ok(enrolled?.user.twoFactorEnabled);assert.equal(await isHubAdmin(f.connection.db,{...enrolled.user,sessionId:enrolled.session.id}),true);
    const oldSession=await f.auth.api.getSession({headers:new Headers({cookie:oldLogin.cookies})});
    assert.ok(oldSession.user.twoFactorEnabled,'the old session observes the updated account flag');
    const oldIdentity={...oldSession.user,sessionId:oldSession.session.id};
    assert.equal(await isHubAdmin(f.connection.db,oldIdentity),false,'old sessions must not inherit MFA proof');
    assert.equal(await requiresAdminSetup(f.connection.db,oldIdentity),true);
    await assert.rejects(()=>requireHubAdmin(f.connection.db,oldIdentity));
    assert.equal((await requireHubSite(f.connection.db,oldIdentity,'site-a')).id,'site-a','ordinary tenant membership is separate from admin MFA');
    await assert.rejects(()=>requireHubSite(f.connection.db,oldIdentity,'site-b'));
    for(const action of ['two-factor/disable','two-factor/generate-backup-codes','two-factor/get-totp-uri']){
      const denied=await f.request(action,{password},oldLogin.cookies);assert.equal(denied.status,403,action);
    }
    const invalid=await f.request('two-factor/verify-totp',{code:'not-a-totp'},oldLogin.cookies);assert.notEqual(invalid.status,200);
    assert.equal(await hasHubMfaProof(f.connection.db,id,oldSession.session.id),false,'failed verification cannot produce proof');
    const signIn=await f.request('sign-in/email',{email,password});assert.equal(signIn.data.twoFactorRedirect,true);assert.equal(await f.auth.api.getSession({headers:new Headers({cookie:signIn.cookies})}),null);
    const secondFactor=await f.request('two-factor/verify-totp',{code:totp(enrollment.data.totpURI)},signIn.cookies);assert.equal(secondFactor.status,200);
    const adminSession=await f.auth.api.getSession({headers:new Headers({cookie:secondFactor.cookies})});
    const adminIdentity={...adminSession.user,sessionId:adminSession.session.id};
    assert.equal(await isHubAdmin(f.connection.db,adminIdentity),true);
    await f.connection.db.prepare('UPDATE hub_auth_session SET "expiresAt"=? WHERE id=?').bind(Date.now()-1,adminIdentity.sessionId).run();
    assert.equal(await isHubAdmin(f.connection.db,adminIdentity),false,'a longer-lived proof cannot extend an expired auth session');
    await f.connection.db.prepare('UPDATE hub_auth_session SET "expiresAt"=? WHERE id=?').bind(adminSession.session.expiresAt.getTime(),adminIdentity.sessionId).run();
    assert.equal(await isHubAdmin(f.connection.db,adminSession.user),false,'account flags without verified session binding grant nothing');
    assert.equal(await isHubAdmin(f.connection.db,{...adminIdentity,sessionId:oldSession.session.id}),false);
    assert.equal(await isHubAdmin(f.connection.db,{...adminIdentity,id:'another-user'}),false);
    await f.connection.db.prepare('DELETE FROM hub_admins WHERE user_id=?').bind(id).run();
    assert.equal(await isHubAdmin(f.connection.db,adminIdentity),false,'MFA proof alone cannot grant an admin membership');
    assert.equal(await requiresAdminSetup(f.connection.db,adminIdentity),false,'ordinary clients are not forced into the admin gate');
    await f.connection.db.prepare('INSERT INTO hub_admins(user_id) VALUES(?)').bind(id).run();
    await f.request('sign-out',{},secondFactor.cookies);assert.equal(await f.auth.api.getSession({headers:new Headers({cookie:secondFactor.cookies})}),null);
    assert.equal(await isHubAdmin(f.connection.db,adminIdentity),false,'revoked sessions cannot reuse a cached identity/proof');
  }finally{await f.connection.close();}
});
test('public registration, mismatched email and replayed invitations cannot grant access',async()=>{
  const f=await fixture();try{
    const invite=await issueInvitation(f.connection.db,'invited@example.test','a');
    const body={email:'stranger@example.test',password:'Fixture-only-password-6237',name:'Stranger'};
    await f.request('sign-up/email',body);
    await f.request('sign-up/email',body,'',{'x-sitesnit-invitation':invite});
    assert.equal(await f.connection.db.prepare('SELECT id FROM hub_auth_user WHERE email=?').bind(body.email).first(),null);
    assert.equal(f.mail.length,0);
    assert.ok(await findInvitation(f.connection.db,'invited@example.test',invite));
    await acceptInvitation(f.connection,'user-a','invited@example.test',invite);
    await assert.rejects(()=>acceptInvitation(f.connection,'user-b','invited@example.test',invite));
    assert.equal(await f.connection.db.prepare('SELECT user_id FROM hub_memberships WHERE user_id=?').bind('user-b').first(),null);
    for(const value of ['https://evil.test','//evil.test','/hub/../api','/hub?token=secret','/hub\\evil'])assert.equal(safeHubReturn(value),'/hub');
  }finally{await f.connection.close();}
});
test('backup-code proof is session-bound; trusted-device login and expired proof require a fresh factor',async()=>{
  const f=await fixture();try{
    const email='admin-mfa@example.test',password='Fixture-only-password-8261';
    const invitation=await issueInvitation(f.connection.db,email,null,'admin');
    const signup=await f.request('sign-up/email',{email,password,name:'MFA Admin'},'',{'x-sitesnit-invitation':invitation});
    assert.equal(signup.status,200);
    await f.auth.handler(new Request(f.mail[0].text.match(/https:\/\/\S+/)[0]));
    const login=await f.request('sign-in/email',{email,password});
    const enabled=await f.request('two-factor/enable',{password},login.cookies);
    const verified=await f.request('two-factor/verify-totp',{code:totp(enabled.data.totpURI)},login.cookies);
    assert.equal(verified.status,200);
    const challenge=await f.request('sign-in/email',{email,password});assert.equal(challenge.data.twoFactorRedirect,true);
    const backup=await f.request('two-factor/verify-backup-code',{code:enabled.data.backupCodes[0],trustDevice:true},challenge.cookies);
    assert.equal(backup.status,200,JSON.stringify(backup.data));
    const backupSession=await f.auth.api.getSession({headers:new Headers({cookie:backup.cookies})});
    const backupIdentity={...backupSession.user,sessionId:backupSession.session.id};
    assert.equal(await isHubAdmin(f.connection.db,backupIdentity),true);
    const trusted=await f.request('sign-in/email',{email,password},backup.cookies);assert.equal(trusted.status,200);
    const trustedSession=await f.auth.api.getSession({headers:new Headers({cookie:trusted.cookies})});
    const trustedIdentity={...trustedSession.user,sessionId:trustedSession.session.id};
    assert.notEqual(trustedIdentity.sessionId,backupIdentity.sessionId);
    assert.equal(await isHubAdmin(f.connection.db,trustedIdentity),false,'trust-device cookie must not stand in for per-session admin MFA');
    const replayedBackup=await f.request('two-factor/verify-backup-code',{code:enabled.data.backupCodes[0]},trusted.cookies);
    assert.notEqual(replayedBackup.status,200);assert.equal(await isHubAdmin(f.connection.db,trustedIdentity),false);
    const stepUp=await f.request('two-factor/verify-totp',{code:totp(enabled.data.totpURI)},trusted.cookies);assert.equal(stepUp.status,200);
    assert.equal(await isHubAdmin(f.connection.db,trustedIdentity),true,'an existing session can prove its own factor');
    await f.connection.db.prepare('UPDATE hub_mfa_session_proofs SET expires_at=? WHERE session_id=?').bind(Date.now()-1,trustedIdentity.sessionId).run();
    assert.equal(await isHubAdmin(f.connection.db,trustedIdentity),false);
    const refreshed=await f.request('two-factor/verify-totp',{code:totp(enabled.data.totpURI)},trusted.cookies);assert.equal(refreshed.status,200);
    const disabled=await f.request('two-factor/disable',{password},trusted.cookies);assert.equal(disabled.status,200);
    assert.equal(await f.connection.db.prepare('SELECT COUNT(*) AS count FROM hub_mfa_session_proofs WHERE user_id=?').bind(signup.data.user.id).first('count'),0);
    assert.equal(await isHubAdmin(f.connection.db,backupIdentity),false,'turning off MFA invalidates every session proof, including cached identities');
  }finally{await f.connection.close();}
});
test('every public Better Auth invocation enters the shared connection queue',async()=>{
  const f=await fixture();try{
    const exclusive=f.connection.runExclusive;let calls=0;
    f.connection.runExclusive=work=>{calls++;return exclusive(work);};
    const request=()=>new Request('https://hub.example.test/api/hub-auth/get-session');
    assert.equal((await f.auth.handler(request())).status,200);
    assert.equal((await f.auth.fetch(request())).status,200);
    assert.equal(await f.auth.api.getSession({headers:new Headers()}),null);
    assert.equal(calls,3);
    assert.equal(f.auth.options.basePath,'/api/hub-auth');
    assert.equal(typeof f.auth.api.getSession,'function');
  }finally{await f.connection.close();}
});
test('unverified email cannot log in or obtain a usable session',async()=>{
  const f=await fixture();try{
    const email='unverified@example.test',password='Fixture-only-password-5382';
    const invitation=await issueInvitation(f.connection.db,email,'a');
    const signup=await f.request('sign-up/email',{email,password,name:'Unverified fixture'},'',{'x-sitesnit-invitation':invitation});
    assert.equal(signup.status,200);assert.equal(signup.data.user.emailVerified,false);
    const login=await f.request('sign-in/email',{email,password});
    assert.equal(login.status,403);assert.equal(login.data.code,'EMAIL_NOT_VERIFIED');
    assert.equal(await f.auth.api.getSession({headers:new Headers({cookie:login.cookies})}),null);
    assert.equal(await f.connection.db.prepare('SELECT COUNT(*) AS count FROM hub_auth_session WHERE "userId"=?').bind(signup.data.user.id).first('count'),0);
    assert.ok(f.mail.some(message=>message.to===email&&message.subject==='Bevestig je e-mailadres voor Sitesnit Hub'));
  }finally{await f.connection.close();}
});
test('fixturemail password reset changes credentials, revokes old sessions and rejects token replay',async()=>{
  const f=await fixture();try{
    const email='password-reset@example.test',password='Fixture-old-password-7294',newPassword='Fixture-new-password-3681';
    const invitation=await issueInvitation(f.connection.db,email,'a');
    const signup=await f.request('sign-up/email',{email,password,name:'Reset fixture'},'',{'x-sitesnit-invitation':invitation});
    assert.equal(signup.status,200);assert.equal(f.mail.length,1);
    const verificationURL=f.mail[0].text.match(/https:\/\/\S+/)[0];
    const emailVerified=await f.auth.handler(new Request(verificationURL));assert.ok([200,302].includes(emailVerified.status));
    const oldSessions=[];
    for(let i=0;i<2;i++){
      const login=await f.request('sign-in/email',{email,password});assert.equal(login.status,200);
      const session=await f.auth.api.getSession({headers:new Headers({cookie:login.cookies})});
      assert.equal(session.user.id,signup.data.user.id);oldSessions.push({cookie:login.cookies,id:session.session.id});
    }
    assert.notEqual(oldSessions[0].id,oldSessions[1].id);
    const requested=await f.request('request-password-reset',{email,redirectTo:'https://hub.example.test/hub/reset-password'});
    assert.equal(requested.status,200);assert.equal(requested.data.status,true);assert.equal(f.mail.length,2);
    const resetMail=f.mail[1];assert.equal(resetMail.to,email);assert.equal(resetMail.subject,'Je Sitesnit Hub-wachtwoord instellen');
    const resetURL=new URL(resetMail.text.match(/https:\/\/\S+/)[0]);
    assert.equal(resetURL.origin,'https://hub.example.test');assert.ok(resetURL.pathname.startsWith('/api/hub-auth/reset-password/'));
    // Follow the actual Better Auth email callback in memory; never fetch its URL.
    const callback=await f.auth.handler(new Request(resetURL));assert.equal(callback.status,302);
    const destination=new URL(callback.headers.get('location'),'https://hub.example.test');
    assert.equal(destination.origin,'https://hub.example.test');assert.equal(destination.pathname,'/hub/reset-password');
    const token=destination.searchParams.get('token');assert.ok(token);assert.equal(destination.searchParams.has('error'),false);
    const reset=await f.request('reset-password',{token,newPassword});assert.equal(reset.status,200);assert.equal(reset.data.status,true);
    for(const old of oldSessions){
      assert.equal(await f.auth.api.getSession({headers:new Headers({cookie:old.cookie})}),null,'every pre-reset session must be revoked');
      assert.equal(await f.connection.db.prepare('SELECT id FROM hub_auth_session WHERE id=?').bind(old.id).first(),null);
    }
    const obsolete=await f.request('sign-in/email',{email,password});assert.equal(obsolete.status,401);
    assert.equal(await f.auth.api.getSession({headers:new Headers({cookie:obsolete.cookies})}),null);
    const replacement=await f.request('sign-in/email',{email,password:newPassword});assert.equal(replacement.status,200);
    const fresh=await f.auth.api.getSession({headers:new Headers({cookie:replacement.cookies})});assert.equal(fresh.user.id,signup.data.user.id);
    assert.ok(!oldSessions.some(old=>old.id===fresh.session.id));
    const replay=await f.request('reset-password',{token,newPassword:'Fixture-replay-password-9321'});
    assert.equal(replay.status,400);assert.equal(replay.data.code,'INVALID_TOKEN');
    const replayCallback=await f.auth.handler(new Request(resetURL));assert.equal(replayCallback.status,302);
    const replayDestination=new URL(replayCallback.headers.get('location'),'https://hub.example.test');
    assert.equal(replayDestination.searchParams.get('error'),'INVALID_TOKEN');assert.equal(replayDestination.searchParams.has('token'),false);
    const unchanged=await f.request('sign-in/email',{email,password:newPassword});assert.equal(unchanged.status,200,'replay must not overwrite the accepted password');
  }finally{await f.connection.close();}
});

test('mail rejection is reported honestly and an existing unverified account can recover by resending',async()=>{
  let rejectMail=true;
  const f=await fixture(async()=>{if(rejectMail)throw new Error('Fixture provider rejection');});
  try{
    const email='mail-recovery@example.test',password='Fixture-mail-password-7294';
    const invitation=await issueInvitation(f.connection.db,email,'a');
    const signup=await f.request('sign-up/email',{email,password,name:'Mail recovery'},'',{'x-sitesnit-invitation':invitation});
    assert.equal(signup.status,503);assert.equal(signup.data.code,'EMAIL_SEND_FAILED');assert.equal(f.mail.length,0);
    assert.equal(await f.auth.api.getSession({headers:new Headers({cookie:signup.cookies})}),null);
    assert.equal(await findInvitation(f.connection.db,email,invitation),null,'registration consumed the invitation even though delivery failed');
    const rejected=await f.request('send-verification-email',{email,callbackURL:'/hub/login'});
    assert.equal(rejected.status,503);assert.equal(rejected.data.code,'EMAIL_SEND_FAILED');
    rejectMail=false;
    const retry=await f.request('send-verification-email',{email,callbackURL:'/hub/login'});
    assert.equal(retry.status,200);assert.equal(f.mail.length,1);assert.equal(f.mail[0].to,email);
    const verification=await f.auth.handler(new Request(f.mail[0].text.match(/https:\/\/\S+/)[0]));
    assert.ok([200,302].includes(verification.status));
    const login=await f.request('sign-in/email',{email,password});assert.equal(login.status,200);
    const session=await f.auth.api.getSession({headers:new Headers({cookie:login.cookies})});
    assert.equal(session.user.emailVerified,true);assert.equal(session.user.email,email);
  }finally{await f.connection.close();}
});

test('own Sitesnit dossier is idempotent and adds no client grants or invented metrics',async()=>{const f=await fixture();try{const first=await ensureOwnHubSite(f.connection.db);const second=await ensureOwnHubSite(f.connection.db);assert.equal(first,second);assert.equal((await f.connection.db.prepare('SELECT COUNT(*) AS n FROM hub_sites WHERE id=?').bind(first).first()).n,1);assert.equal((await f.connection.db.prepare('SELECT COUNT(*) AS n FROM hub_memberships').first()).n,0);assert.equal((await f.connection.db.prepare('SELECT COUNT(*) AS n FROM hub_snapshots').first()).n,0);}finally{await f.connection.close();}});
