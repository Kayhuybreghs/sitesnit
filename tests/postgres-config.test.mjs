import test from 'node:test';
import assert from 'node:assert/strict';
import {X509Certificate} from 'node:crypto';
import {postgresPoolConfig} from '../lib/postgres-config.ts';
test('Supabase TLS validates the official CA and hostname despite URL SSL overrides',()=>{
 const config=postgresPoolConfig('postgresql://test:fixture@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require&sslrootcert=bad&ssl=no-verify');
 assert.equal(config.ssl.rejectUnauthorized,true);
 assert.equal(config.ssl.servername,'aws-0-eu-central-1.pooler.supabase.com');
 const cert=new X509Certificate(config.ssl.ca);assert.equal(cert.ca,true);assert.ok(Date.parse(cert.validTo)>Date.now());
 const url=new URL(config.connectionString);assert.equal(url.searchParams.has('sslmode'),false);assert.equal(url.searchParams.has('sslrootcert'),false);assert.equal(url.searchParams.has('ssl'),false);assert.equal(url.password,'fixture');
});
test('Supabase trust root is not attached to lookalike or unrelated database hosts',()=>{
 for(const host of ['pooler.supabase.com.attacker.invalid','supabase.co.attacker.invalid','database.example.org'])assert.equal(postgresPoolConfig(`postgresql://test:fixture@${host}/postgres`).ssl,undefined);
});
