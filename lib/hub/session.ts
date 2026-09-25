import 'server-only';
import {headers} from 'next/headers';
import {redirect} from 'next/navigation';
import {getHubRuntime} from './runtime';
import {requiresAdminSetup,type HubIdentity} from './access';
export async function hubSession(requestHeaders?:Headers){
  const runtime=await getHubRuntime();if(!runtime)return null;
  const session=await runtime.auth.api.getSession({headers:requestHeaders??await headers(),query:{disableCookieCache:true}});
  if(!session?.user.emailVerified)return null;
  // Bind authorization to this verified session; user profile flags alone never prove MFA.
  const user:HubIdentity={...session.user,twoFactorEnabled:Boolean(session.user.twoFactorEnabled),sessionId:session.session.id};
  return {runtime,user,session};
}
export async function requireHubUser(allowEnrollment=false){
  const context=await hubSession();if(!context)redirect('/hub/login');
  if(!allowEnrollment&&await requiresAdminSetup(context.runtime.connection.db,context.user))redirect('/hub/beveiliging');
  return context;
}
