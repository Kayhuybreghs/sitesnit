// Explicit additive migration. No requests or historical inquiries are sent by this script.
import {postgresHubConnection,sqliteHubConnection} from '../lib/hub/connection.ts';
import {postgresUrl} from '../lib/database-postgres.ts';
import {sqliteSchema} from '../lib/database-schema.ts';
import {contactSchema} from '../lib/contact/schema.ts';
const local=process.argv.includes('--local');
if(!local&&!process.argv.includes('--apply'))throw new Error('Use --local for an in-memory check, or --apply after reviewing the production migration.');
const databaseUrl=local?undefined:postgresUrl(process.env);
if(!local&&!databaseUrl)throw new Error('Production database configuration missing; no migration was applied.');
const connection=local?sqliteHubConnection(':memory:'):postgresHubConnection(databaseUrl);
try {
  if(local)await connection.executeSchema(sqliteSchema);
  await connection.transaction(async db=>{for(const sql of contactSchema.split(';').map(s=>s.trim()).filter(Boolean))await db.prepare(sql).run();});
  console.log(local?'Contact migration validated in an isolated in-memory database.':'Contact migration complete; no messages sent.');
}finally{await connection.close();}
