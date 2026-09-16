/** Read-only HTTP edge audit. Never submits a valid lead or calls Google. */
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index < 0 ? fallback : args[index + 1];
}
const root = path.resolve(option('--project', process.cwd()));
const origin = option('--origin', 'http://127.0.0.1:5184').replace(/\/$/, '');
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname))
  throw new Error('This audit is limited to the local preview.');
const reportDirectory = path.resolve(option('--report-dir', path.join(root, 'reports/seo/final-edges')));
const require = createRequire(path.join(root, 'package.json'));
const { build } = require('esbuild');
async function sourceModule(relative) {
  const result = await build({
    absWorkingDir: root, entryPoints: [relative], bundle: true,
    platform: 'node', format: 'esm', write: false, logLevel: 'silent',
  });
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
}
const { routeCatalog } = await sourceModule('lib/route-catalog.ts');
const { indexingAllowed } = await sourceModule('lib/seo-policy.ts');
const checks = [], requests = [];
async function nativeBuildSnapshot() {
  const artifact = '.next/server/app/page.js';
  try {
    const diskBuildId = (await fs.readFile(path.join(root, '.next/BUILD_ID'), 'utf8')).trim();
    if (!/^[A-Za-z0-9_-]{1,128}$/.test(diskBuildId)) throw new Error('Invalid build ID');
    return { framework: 'nextjs', diskBuildId, artifact, artifactSha256: createHash('sha256').update(await fs.readFile(path.join(root, artifact))).digest('hex') };
  } catch { return { framework: 'nextjs', diskBuildId: null, artifact, artifactSha256: null }; }
}
function htmlBuildIds(html) {
  const chunks = [];
  for (const match of html.matchAll(/self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)/g)) {
    try { chunks.push(JSON.parse(match[1])); } catch { /* No JavaScript evaluation. */ }
  }
  return [...new Set([...chunks.join('').matchAll(/"b"\s*:\s*"([A-Za-z0-9_-]{1,128})"/g)].map(match => match[1]))].sort();
}
const nativeBuild = await nativeBuildSnapshot();
let homepageBuildIds = [];
function check(name, passed, detail = {}, severity = 'error') {
  checks.push({ name, passed: Boolean(passed), severity, ...detail });
}
async function request(route, options = {}, attempt = 0) {
  const response = await fetch(origin + route, {
    redirect: 'manual', signal: AbortSignal.timeout(30000),
    ...options,
    headers: { 'User-Agent': 'SitesnitFinalEdgeAudit/1.0', ...options.headers },
  });
  const body = options.method === 'HEAD' ? '' : await response.text();
  // Wrangler can restart when another task integrates files. All POST bodies in
  // this script are invalid by design; retrying this transport failure creates no data.
  if (response.status === 503 && body.includes('Your worker restarted mid-request') && attempt < 2)
    return request(route, options, attempt + 1);
  requests.push({ route, method: options.method || 'GET', status: response.status });
  return { status: response.status, headers: response.headers, body };
}
function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)].map(m => [m[1].toLowerCase(), m[2]]));
}
function htmlData(body) {
  const meta = new Map();
  for (const tag of body.match(/<meta\b[^>]*>/gi) || []) {
    const a = attributes(tag), key = a.name || a.property;
    if (key) meta.set(key, [...(meta.get(key) || []), a.content || '']);
  }
  const canonicals = (body.match(/<link\b[^>]*>/gi) || []).map(attributes).filter(a => a.rel === 'canonical').map(a => a.href);
  const json = [];
  let validJson = true;
  for (const match of body.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    if (attributes(match[1]).type !== 'application/ld+json') continue;
    try { json.push(JSON.parse(match[2])); } catch { validJson = false; }
  }
  const externalSources = [];
  for (const tag of body.match(/<(?:script|iframe|img|link)\b[^>]*>/gi) || []) {
    const a = attributes(tag), url = a.src || (['stylesheet', 'preload', 'preconnect'].includes(a.rel) ? a.href : '');
    if (url && /^(?:https?:)?\/\//.test(url)) externalSources.push(url);
  }
  return { meta, canonicals, json, validJson, externalSources };
}
function securityHeaders(route, response) {
  const h = response.headers;
  check('HTML nosniff', h.get('x-content-type-options') === 'nosniff', { route });
  check('Referrer privacy policy', ['strict-origin-when-cross-origin', 'same-origin', 'no-referrer'].includes(h.get('referrer-policy')), { route, actual: h.get('referrer-policy') });
  check('Framing protection', /^(DENY|SAMEORIGIN)$/i.test(h.get('x-frame-options') || '') || /frame-ancestors\s+(?:'none'|'self')/.test(h.get('content-security-policy') || ''), { route });
  check('No server-set analytics cookie before choice', !h.get('set-cookie'), { route });
}

for (const record of routeCatalog) {
  const route = record.path;
  const response = await request(route);
  if (route === '/' && response.status === 200) homepageBuildIds = htmlBuildIds(response.body);
  const data = htmlData(response.body);
  check('Catalog page is HTTP 200', response.status === 200, { route, actual: response.status });
  check('Preview noindex', /\bnoindex\b/.test([...(data.meta.get('robots') || []), response.headers.get('x-robots-tag') || ''].join(',')), { route });
  check('Single production canonical', data.canonicals.length === 1 && data.canonicals[0].replace(/\/$/, '') === ('https://sitesnit.nl' + (route === '/' ? '' : route)), { route, actual: data.canonicals });
  check('Valid structured data', data.validJson && data.json.length > 0, { route });
  check('No unsolicited external page resources', data.externalSources.length === 0, { route, actual: data.externalSources });
  securityHeaders(route, response);
  const queried = await request(route + '?utm_source=final-audit&resultaat=1&pakket=onepager');
  const queryData = htmlData(queried.body);
  check('Query variants retain clean canonical', queried.status === 200 && JSON.stringify(data.canonicals) === JSON.stringify(queryData.canonicals), { route });
  check('Query variants stay noindex in preview', /\bnoindex\b/.test((queryData.meta.get('robots') || []).join(',')), { route });
  if (route !== '/') {
    const slash = await request(route + '/');
    check('Trailing slash redirects to canonical path', [301, 308].includes(slash.status) && slash.headers.get('location') === route, { route, actual: slash.status, location: slash.headers.get('location') });
  }
}

for (const route of ['/does-not-exist-final-audit', '/diensten/does-not-exist-final-audit', '/projecten/does-not-exist-final-audit', '/tools/does-not-exist-final-audit', '/index.html', '/kosten/does-not-exist-final-audit', '/does-not-exist-final-audit?utm_source=test']) {
  const response = await request(route);
  const data = htmlData(response.body);
  check('Unknown path is real 404', response.status === 404, { route, actual: response.status });
  check('404 stays noindex', /\bnoindex\b/.test((data.meta.get('robots') || []).join(',')), { route });
  check('404 offers a way back', /href="\/"/.test(response.body) && /<h1\b/.test(response.body), { route });
  securityHeaders(route, response);
}

const robots = await request('/robots.txt');
check('Robots permits crawler to read preview noindex', robots.status === 200 && !/^Disallow:\s*\/\s*$/m.test(robots.body));
check('Robots excludes API', /^Disallow:\s*\/api\/\s*$/m.test(robots.body));
check('Preview robots does not advertise a sitemap', !/^Sitemap:/m.test(robots.body));
const sitemap = await request('/sitemap.xml');
check('Preview sitemap is XML without release URLs', sitemap.status === 200 && /xml/.test(sitemap.headers.get('content-type') || '') && !/<loc>/.test(sitemap.body));
for (const [enabled, host, expected] of [
  ['true', 'sitesnit.nl', true], ['true', 'SITESNIT.NL', true],
  [undefined, 'sitesnit.nl', false], ['false', 'sitesnit.nl', false],
  ['true', '127.0.0.1:5184', false], ['true', 'localhost:5184', false],
  ['true', 'preview.example.com', false], ['true', 'sitesnit.nl.example.com', false], ['true', null, false],
]) check('Indexing gate source logic', indexingAllowed(enabled, host) === expected, { enabled: enabled ?? null, host, expected });

const bodies = [
  ['empty object', '{}'], ['JSON null', 'null'], ['JSON array', '[]'], ['malformed JSON', '{'],
];
for (const endpoint of ['/api/contact', '/api/events', '/api/lighthouse']) {
  const get = await request(endpoint);
  check('POST API rejects GET', get.status === 405, { route: endpoint, actual: get.status });
  for (const [label, body] of bodies) {
    const response = await request(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    check('Invalid input returns client error', response.status >= 400 && response.status < 500, { route: endpoint, scenario: label, actual: response.status });
    check('API errors are not cacheable or indexable', /no-store/.test(response.headers.get('cache-control') || '') && /noindex/.test(response.headers.get('x-robots-tag') || ''), { route: endpoint, scenario: label });
    let parsed;
    try { parsed = JSON.parse(response.body); } catch {}
    check('Error is JSON without stack or successful receipt', parsed && parsed.ok !== true && !/\b(?:Error:|node_modules|\.env.local|AIzaSy)/.test(response.body), { route: endpoint, scenario: label });
  }
  for (const scenario of [
    { label: 'cross-origin', headers: { 'Content-Type': 'application/json', Origin: 'https://unrelated.example' }, body: '{}' },
    { label: 'oversized body', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ invalid: 'x'.repeat(endpoint === '/api/contact' ? 22500 : endpoint === '/api/events' ? 1200 : 4200) }) },
    { label: 'wrong media type', headers: { 'Content-Type': 'text/plain' }, body: '{}' },
  ]) {
    const response = await request(endpoint, { method: 'POST', ...scenario });
    check('Unsafe request returns client error', response.status >= 400 && response.status < 500, { route: endpoint, scenario: scenario.label, actual: response.status });
  }
}
for (const url of ['localhost', 'http://127.0.0.1/', 'http://192.168.1.1/', 'http://[::1]/', 'http://user:pass@example.com/', 'http://printer.local./']) {
  const response = await request('/api/lighthouse', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url }) });
  check('Private or credentialed URL rejected before Google', response.status === 400, { route: '/api/lighthouse', input: url, actual: response.status });
}

const buildVerified = Boolean(nativeBuild.diskBuildId) && JSON.stringify(homepageBuildIds) === JSON.stringify([nativeBuild.diskBuildId]) && JSON.stringify(nativeBuild) === JSON.stringify(await nativeBuildSnapshot());
Object.assign(nativeBuild, { homepageBuildIds, verified: buildVerified,
  scope: 'Homepage Flight build ID matches BUILD_ID; the native server page entry hash and BUILD_ID stayed unchanged during this audit. This is not a hash of every dependency or deployment attestation.',
});
// Provenance is a separate required gate, preserving the existing 523 content/API checks.
const buildIdentityFailure = buildVerified ? null : 'Native Next build identity missing, mismatched, or changed during the audit; restart the intended build and rerun.';
const builtCodeHash = buildVerified ? nativeBuild.artifactSha256 : null;
const failures = checks.filter(c => !c.passed && c.severity === 'error');
const failureCount = failures.length + (buildIdentityFailure ? 1 : 0);
const report = {
  measuredAt: new Date().toISOString(), origin, catalogRoutes: routeCatalog.length,
  builtCodeHash, nativeBuild, buildIdentityFailure, checks, requests, failureCount,
  limits: [
    'Local HTTP and source checks only; no proof of public indexing, DNS, TLS, email delivery, consent behavior after clicks, or mobile rendering.',
    'No valid inquiry, paid/remote Google scan, or analytics event was submitted.',
    'Rate-limit thresholds and retention execution require separate controlled integration checks; this audit does not create data to exhaust them.',
    'This run uses native Next artifacts. Existing reports with a legacy dist/server hash remain historical and are not reclassified by this audit.',
  ],
};
await fs.mkdir(reportDirectory, { recursive: true });
await fs.writeFile(path.join(reportDirectory, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
const failureGroups = Object.fromEntries([...new Set(failures.map(c => c.name))].map(name => {
  const group = failures.filter(c => c.name === name);
  return [name, { count: group.length, examples: group.slice(0, 3) }];
}));
console.log(JSON.stringify({ routes: routeCatalog.length, requests: requests.length, checks: checks.length, failureCount, failureGroups, nativeBuild, buildIdentityFailure, report: path.join(reportDirectory, 'summary.json') }, null, 2));
process.exitCode = failureCount ? 1 : 0;
