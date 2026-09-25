import 'server-only';
import type {HubConnection} from './connection';
import {createEnvCredentialResolver,createGoogleTokenResolver,syncSiteProviders} from './integrations';
import {siteIntegrationConfigs,snapshotStore} from './store';
const googleTokens=createGoogleTokenResolver({fetch});
export async function synchronizeHubSite(connection:HubConnection,siteId:string){
  return syncSiteProviders({siteId,configs:await siteIntegrationConfigs(connection,siteId),store:snapshotStore(connection),deps:{fetch,googleTokens,resolveCredential:createEnvCredentialResolver(process.env.HUB_PROVIDER_CREDENTIALS)}});
}
