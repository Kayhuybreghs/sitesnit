import 'server-only';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { postgresHubConnection, sqliteHubConnection, type HubConnection } from '../hub/connection';
import { postgresUrl } from '../database-postgres';
import { sqliteSchema } from '../database-schema';
import { contactSchema } from './schema';

let connection: Promise<HubConnection> | undefined;
/** Reuse storage adapters, never the Hub flag, auth runtime or auth database schema. */
export function contactConnection() {
  return connection ??= (async () => {
    if (!process.env.VERCEL && process.env.SITESNIT_LOCAL_SQLITE === 'true') {
      const directory=path.resolve('.sites-runtime/storage'); await mkdir(directory,{recursive:true});
      const local=sqliteHubConnection(path.join(directory,'sitesnit.sqlite'));
      await local.executeSchema(sqliteSchema + contactSchema); return local;
    }
    const url=postgresUrl(process.env);
    if (!url) throw new Error('Contact storage unavailable.');
    return postgresHubConnection(url); // Production migrations are explicit, never request-time DDL.
  })().catch(error=>{connection=undefined;throw error;});
}
export function contactMailConfig() {
  const candidate=process.env.CONTACT_EMAIL_FROM || process.env.HUB_EMAIL_FROM || 'Sitesnit <contact@sitesnit.nl>';
  const from=/^Sitesnit <[a-zA-Z0-9._+-]+@sitesnit\.nl>$/.test(candidate) ? candidate : '';
  return {enabled:process.env.CONTACT_EMAIL_ENABLED==='true',apiKey:process.env.RESEND_API_KEY,from};
}
