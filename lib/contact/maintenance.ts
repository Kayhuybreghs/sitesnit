import type {AppDatabase} from '../database-core';
/** Call only after the additive contact migration. Personal payloads cascade with inquiries. */
export async function cleanupContactMetadata(db:AppDatabase,now=Date.now()){
  const before=now-90*86400000;
  await db.prepare('DELETE FROM contact_webhook_events WHERE received_at<?').bind(before).run();
  await db.prepare('DELETE FROM contact_admin_log WHERE created_at<?').bind(before).run();
  await db.prepare('DELETE FROM contact_mail_usage WHERE period<?').bind(new Date(before).toISOString().slice(0,7)).run();
}
