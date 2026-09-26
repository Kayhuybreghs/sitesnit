import {betterAuth} from 'better-auth';
import {AsyncLocalStorage} from 'node:async_hooks';
import {twoFactor} from 'better-auth/plugins';
import {APIError,createAuthMiddleware,getAuthoritativeSessionFromCtx,isAPIError} from 'better-auth/api';
import type {HubConnection} from './connection';
import type {MailSender} from './mail';
import {hubActionEmail} from './email-template';
import {findInvitation,acceptInvitation} from './invitations';
import {hasHubMfaProof,recordHubMfaProof} from './mfa';

export function createHubAuth(connection:HubConnection,config:{secret:string;baseURL:string;send:MailSender}){
  if(config.secret.length<32)throw new Error('Hub-authsecret is niet ingericht.');
  const secure=new URL(config.baseURL).protocol==='https:';
  const mailAttempt=new AsyncLocalStorage<{failed:boolean}>();
  const send:MailSender=async mail=>{
    try{await config.send(mail);}catch(error){
      const attempt=mailAttempt.getStore();if(attempt)attempt.failed=true;
      console.error('[hub-mail] provider rejected or could not accept the message');
      throw error;
    }
  };
  const auth=betterAuth({
    appName:'Sitesnit Hub',secret:config.secret,baseURL:config.baseURL,basePath:'/api/hub-auth',trustedOrigins:[new URL(config.baseURL).origin],
    database:connection.authDatabase,telemetry:{enabled:false},logger:{disabled:true},
    user:{modelName:'hub_auth_user'},account:{modelName:'hub_auth_account'},verification:{modelName:'hub_auth_verification'},
    session:{modelName:'hub_auth_session',expiresIn:60*60*24*7,updateAge:60*60*24,cookieCache:{enabled:false}},
    advanced:{cookiePrefix:'sitesnit-hub',useSecureCookies:secure,defaultCookieAttributes:{httpOnly:true,sameSite:'lax',secure}},
    rateLimit:{enabled:true,storage:'database',modelName:'hub_auth_rate_limit',window:60,max:20,customRules:{'/sign-in/email':{window:60,max:5},'/sign-up/email':{window:3600,max:5},'/request-password-reset':{window:3600,max:3},'/send-verification-email':{window:3600,max:3}}},
    emailAndPassword:{enabled:true,minPasswordLength:12,requireEmailVerification:true,revokeSessionsOnPasswordReset:true,resetPasswordTokenExpiresIn:3600,
      sendResetPassword:async({user,url})=>send(hubActionEmail('reset',user.email,url))},
    emailVerification:{sendOnSignUp:true,sendOnSignIn:true,autoSignInAfterVerification:false,expiresIn:3600,
      sendVerificationEmail:async({user,url})=>send(hubActionEmail('verify',user.email,url))},
    plugins:[twoFactor({issuer:'Sitesnit Hub',schema:{twoFactor:{modelName:'hub_auth_two_factor'}}})],
    hooks:{
      before:createAuthMiddleware(async ctx=>{
        // An old password-only session must not disable MFA or reveal/regenerate factors.
        if(!ctx.path.startsWith('/two-factor/')||['/two-factor/verify-totp','/two-factor/verify-backup-code'].includes(ctx.path))return;
        const active=await getAuthoritativeSessionFromCtx(ctx);
        if(active?.user.twoFactorEnabled&&!await hasHubMfaProof(connection.db,active.user.id,active.session.id))
          throw new APIError('FORBIDDEN',{message:'Bevestig eerst je tweede factor in deze sessie.'});
      }),
      after:createAuthMiddleware(async ctx=>{
        if(!['/two-factor/verify-totp','/two-factor/verify-backup-code'].includes(ctx.path)||isAPIError(ctx.context.returned))return;
        const returned=ctx.context.returned;
        if(!returned||typeof returned!=='object'||!('token' in returned)||typeof returned.token!=='string')return;
        // Enrollment rotates the active session. Prefer the new one over the old context.
        // No proof is created by sign-in/email, trust-device, user updates or enrollment alone.
        const active=ctx.context.newSession??ctx.context.session;
        if(!active?.user.twoFactorEnabled||ctx.body?.disableSession===true)return;
        await recordHubMfaProof(connection.db,active.session);
      }),
    },
    databaseHooks:{user:{create:{
      before:async(user,context)=>{
        const token=context?.headers?.get('x-sitesnit-invitation')||'';
        if(!await findInvitation(connection.db,user.email,token))throw new APIError('FORBIDDEN',{message:'Een geldige uitnodiging is nodig.'});
        return {data:{...user,email:user.email.trim().toLowerCase()}};
      },
      after:async(user,context)=>acceptInvitation(connection,user.id,user.email,context?.headers?.get('x-sitesnit-invitation')||''),
    },update:{after:async user=>{
      if(user.twoFactorEnabled===false)await connection.db.prepare('DELETE FROM hub_mfa_session_proofs WHERE user_id=?').bind(user.id).run();
      if(user.twoFactorEnabled===true)await connection.db.prepare('UPDATE hub_admin_log SET action=? WHERE user_id=? AND action=?').bind('security_defer_superseded',user.id,'security_deferred').run();
    }}},session:{delete:{after:async session=>{
      await connection.db.prepare('DELETE FROM hub_mfa_session_proofs WHERE session_id=?').bind(session.id).run();
    }}}},
  });
  // Better Auth accesses its adapter directly. Join the connection's reentrant
  // queue so local auth cannot accidentally participate in another SQLite transaction.
  // PostgreSQL uses independent pool connections; runExclusive is a pass-through there.
  // Better Auth catches mail callback errors. Preserve that outcome per request,
  // so a rejected email cannot be presented as a successful send.
  const handler:typeof auth.handler=(...args)=>connection.runExclusive(()=>mailAttempt.run({failed:false},async()=>{
    const response=await auth.handler(...args);
    if(mailAttempt.getStore()?.failed){
      const headers=new Headers(response.headers);headers.delete('content-length');
      return Response.json({code:'EMAIL_SEND_FAILED',message:'De e-mail kon niet worden verstuurd. Probeer later opnieuw.'},{status:503,headers});
    }
    return response;
  }));
  const api=new Proxy(auth.api,{
    get(target,key,receiver){
      const endpoint=Reflect.get(target,key,receiver);
      if(typeof endpoint!=='function')return endpoint;
      // Keep endpoint metadata and types intact while serializing invocation only.
      return new Proxy(endpoint,{
        apply(fn,thisArg,args){return connection.runExclusive(()=>Promise.resolve(Reflect.apply(fn,thisArg,args) as unknown));},
      });
    },
  });
  return {...auth,handler,fetch:handler,api};
}
export type HubAuth=ReturnType<typeof createHubAuth>;
