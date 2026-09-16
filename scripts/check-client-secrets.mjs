/** Server-side build inspection only. Never print secret values, snippets or offsets. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const expectedKeys = ['PAGESPEED_API_KEY', 'DATABASE_URL', 'CRON_SECRET', 'RATE_LIMIT_SECRET'];
function variants(value) {
  return [...new Set([value, JSON.stringify(value).slice(1, -1), encodeURIComponent(value), Buffer.from(value).toString('base64')])];
}
function matchesIn(source, secrets) {
  const matches = [];
  for (const [key, value] of secrets) if (variants(value).some(variant => source.includes(variant))) matches.push(key);
  if (/AIza[0-9A-Za-z_-]{35}/.test(source)) matches.push('POTENTIAL_GOOGLE_API_KEY_PATTERN');
  return [...new Set(matches)];
}

if (process.argv.includes('--self-test')) {
  const key = 'synthetic-secret-test-only-1234567890+/?';
  for (const value of variants(key)) assert.deepEqual(matchesIn(`prefix ${value} suffix`, [['TEST_ONLY', key]]), ['TEST_ONLY']);
  assert.deepEqual(matchesIn('public page and G-EXAMPLE123, no private value', [['TEST_ONLY', key]]), []);
  assert.deepEqual(matchesIn(`AIza${'a'.repeat(35)}`, []), ['POTENTIAL_GOOGLE_API_KEY_PATTERN']);
  console.log('PASS: raw, JSON, percent-encoded and base64 secret matching; clean content and key-pattern controls.');
} else {
  if (process.argv.length > 2) throw Error('Run from the site directory, without arguments; --self-test is also available.');
  const root = process.cwd();
  if (!existsSync(path.join(root, 'app/api/contact/route.ts'))) throw Error('Run from the site directory.');
  // Same precedence as a production Next process; pre-existing environment wins.
  for (const filename of ['.env.production.local', '.env.local', '.env.production', '.env']) {
    const fullPath = path.join(root, filename);
    if (existsSync(fullPath)) process.loadEnvFile(fullPath);
  }
  const secrets = expectedKeys.flatMap(key => process.env[key] ? [[key, process.env[key]]] : []);
  const buildId = (await fs.readFile(path.join(root, '.next/BUILD_ID'), 'utf8')).trim();
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(buildId)) throw Error('A valid completed native Next build is required.');
  const staticRoot = path.join(root, '.next/static');
  const files = [];
  async function collect(directory) {
    for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw Error('Client asset scan refuses symlinks.');
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) await collect(fullPath);
      else if (/\.(?:js|mjs|css|json|map|html)$/i.test(entry.name)) files.push(fullPath);
    }
  }
  await collect(staticRoot);
  if (!files.length) throw Error('No native client chunks were found.');
  const findings = [];
  const assetDigest = createHash('sha256');
  let scannedBytes = 0;
  for (const filename of files.sort()) {
    const bytes = await fs.readFile(filename);
    const relativePath = path.relative(root, filename).split(path.sep).join('/');
    scannedBytes += bytes.byteLength;
    assetDigest.update(relativePath).update('\0').update(bytes).update('\0');
    for (const key of matchesIn(bytes.toString('utf8'), secrets)) findings.push({ key, file: relativePath });
  }
  const unchangedBuild = buildId === (await fs.readFile(path.join(root, '.next/BUILD_ID'), 'utf8')).trim();
  const report = {
    measuredAt: new Date().toISOString(),
    framework: 'nextjs', buildId, unchangedBuild,
    clientAssetsSha256: assetDigest.digest('hex'),
    scannedFiles: files.length, scannedBytes,
    configuredSecretKeys: secrets.map(([key]) => key),
    unconfiguredSecretKeys: expectedKeys.filter(key => !process.env[key]),
    findings,
    success: unchangedBuild && findings.length === 0,
    scope: 'Only generated .next/static text assets on disk; raw/JSON/URI/base64 forms of configured server secrets and Google API-key patterns. No secret value, excerpt or offset is reported.',
    limits: [
      'No network calls or deployment changes. This does not scan rendered HTML, API responses, server logs, historical exports or third-party storage.',
      'Unconfigured secret values cannot be searched. An empty finding list does not prove the absence of every possible credential or encoding.',
    ],
  };
  const directory = path.join(root, 'reports/seo');
  await fs.mkdir(directory, { recursive: true });
  const filename = path.join(directory, `client-secrets-${report.measuredAt.replace(/[:.]/g, '-')}.json`);
  await fs.writeFile(filename, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ success: report.success, buildId, scannedFiles: files.length, findingCount: findings.length, configuredSecretKeys: report.configuredSecretKeys, report: filename }, null, 2));
  if (!report.success) process.exitCode = 1;
}
