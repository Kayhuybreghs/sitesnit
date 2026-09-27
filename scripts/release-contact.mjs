// Explicit production release only. No mail is sent and existing rows are never changed.
import { readFile } from 'node:fs/promises';
import { createCipheriv, publicEncrypt, randomBytes } from 'node:crypto';
import { Pool } from 'pg';
import { postgresPoolConfig } from '../lib/postgres-config.ts';

const release = 'contact-outbox-2026-09-27';
if (process.env.CONTACT_SCHEMA_RELEASE === release) {
  if (process.env.VERCEL !== '1' || process.env.VERCEL_ENV !== 'production') throw new Error('Contact migration requires the approved production build.');
  if (!process.env.CONTACT_BACKUP_PUBLIC_KEY) throw new Error('Contact backup public key missing.');
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) throw new Error('Contact production database missing.');
  const pool = new Pool(postgresPoolConfig(url));
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext('sitesnit-contact-release'))");
    await client.query('CREATE SCHEMA IF NOT EXISTS sitesnit_release_private');
    await client.query('REVOKE ALL ON SCHEMA sitesnit_release_private FROM PUBLIC');
    await client.query('CREATE TABLE IF NOT EXISTS sitesnit_release_private.backups (id TEXT PRIMARY KEY, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), encrypted_snapshot JSONB NOT NULL)');
    await client.query('REVOKE ALL ON TABLE sitesnit_release_private.backups FROM PUBLIC');
    const done = await client.query('SELECT id FROM sitesnit_release_private.backups WHERE id=$1', [release]);
    if (!done.rowCount) {
      const tables = ['inquiries', 'contact_requests', 'contact_outbox', 'contact_mail_usage', 'hub_mail_usage', 'contact_webhook_events', 'contact_admin_log'];
      const snapshot = { release, createdAt: new Date().toISOString(), tables: {} };
      for (const table of tables) {
        const exists = await client.query('SELECT to_regclass($1) AS name', [`public.${table}`]);
        if (exists.rows[0].name) {
          const rows = await client.query(`SELECT * FROM public."${table}"`);
          snapshot.tables[table] = rows.rows;
        }
      }
      if (!snapshot.tables.inquiries) throw new Error('Existing inquiry table missing; migration stopped.');
      const key = randomBytes(32), iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', key, iv);
      const encrypted = Buffer.concat([cipher.update(JSON.stringify(snapshot), 'utf8'), cipher.final()]);
      const envelope = { algorithm: 'RSA-OAEP-SHA256/AES-256-GCM', key: publicEncrypt({key: process.env.CONTACT_BACKUP_PUBLIC_KEY, oaepHash:'sha256'}, key).toString('base64'), iv: iv.toString('base64'), tag: cipher.getAuthTag().toString('base64'), data: encrypted.toString('base64') };
      await client.query('INSERT INTO sitesnit_release_private.backups(id, encrypted_snapshot) VALUES($1,$2)', [release, JSON.stringify(envelope)]);
      await client.query(await readFile(new URL('../db/postgres/0003_contact_outbox.sql', import.meta.url), 'utf8'));
      for (const table of tables.filter(name => name !== 'inquiries')) {
        await client.query(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY`);
        await client.query(`REVOKE ALL ON TABLE public."${table}" FROM PUBLIC`);
      }
      // Supabase browser roles must not access private mail payloads or backups.
      for (const role of ['anon', 'authenticated']) {
        if ((await client.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [role])).rowCount) {
          await client.query(`REVOKE ALL ON SCHEMA sitesnit_release_private FROM "${role}"`);
          await client.query(`REVOKE ALL ON ALL TABLES IN SCHEMA sitesnit_release_private FROM "${role}"`);
          for (const table of tables.filter(name => name !== 'inquiries')) await client.query(`REVOKE ALL ON TABLE public."${table}" FROM "${role}"`);
        }
      }
      console.log('Contact release: encrypted recovery snapshot and additive schema prepared. Existing inquiries preserved; no messages sent.');
    } else console.log('Contact release: migration already recorded; no data changed.');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    const code = typeof error?.code === 'string' && /^[A-Z0-9_]{2,40}$/.test(error.code) ? error.code : 'RELEASE_FAILED';
    console.error('Contact release failed safely:', code);
    process.exitCode = 1;
  } finally { client.release(); await pool.end(); }
}
