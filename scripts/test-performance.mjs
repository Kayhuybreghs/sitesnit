// Local Next.js production lab tests. No URL is sent to PageSpeed or a public service.
// Integrate as site/scripts/test-performance.mjs; run only after next build + next start.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import lighthouse from '../.sites-runtime/quality/node_modules/lighthouse/core/index.js';
import desktop from '../.sites-runtime/quality/node_modules/lighthouse/core/config/desktop-config.js';
import { launch } from '../.sites-runtime/quality/node_modules/chrome-launcher/dist/index.js';

const phase = process.argv[2] || 'next-final';
if (!/^[a-z0-9-]+$/.test(phase)) throw Error('Use a plain phase name.');
const origin = (process.env.SEO_TEST_ORIGIN || 'http://127.0.0.1:5184').replace(/\/$/, '');
if (!['127.0.0.1', 'localhost'].includes(new URL(origin).hostname)) throw Error('Localhost only.');
const routes = process.argv.slice(3).length ? [...new Set(process.argv.slice(3))] : [
  '/', '/diensten/webdesign', '/kosten', '/projecten/beurswijzer', '/websitecheck',
  '/tools/ontwerp-je-website', '/webdesign-venlo',
];
for (const route of routes) if (!/^\/[a-z0-9/-]*$/.test(route)) throw Error('Use clean local route paths.');
const readRuns = (name) => {
  const value = Number(process.env[name] || 1);
  if (!Number.isInteger(value) || value < 1 || value > 5) throw Error(`${name} must be between 1 and 5.`);
  return value;
};
const runsPerDevice = { mobile: readRuns('SEO_MOBILE_RUNS'), desktop: readRuns('SEO_DESKTOP_RUNS') };
const out = path.resolve('reports/lighthouse', phase);
if (fs.existsSync(out) && fs.readdirSync(out).length) throw Error(`Refusing to overwrite existing phase ${phase}; choose a new phase.`);

const sha256 = data => crypto.createHash('sha256').update(data).digest('hex');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const buildIdFile = path.resolve('.next/BUILD_ID');
if (!fs.existsSync(buildIdFile)) throw Error('Missing .next/BUILD_ID. Complete a Next.js production build first.');
const buildId = fs.readFileSync(buildIdFile, 'utf8').trim();
if (!buildId) throw Error('Empty Next.js BUILD_ID.');
const requiredFilesPath = '.next/required-server-files.json';
if (!fs.existsSync(requiredFilesPath)) throw Error('Missing Next.js production config; do not measure next dev or the old Worker.');
const nextConfig = readJson(requiredFilesPath).config || {};
// Deliberately whitelist public build settings. Never serialize config.env or .env files.
const buildConfig = Object.fromEntries([
  'output', 'basePath', 'assetPrefix', 'trailingSlash', 'compress',
  'reactStrictMode', 'poweredByHeader', 'deploymentId',
].filter(key => nextConfig[key] !== undefined).map(key => [key, nextConfig[key]]));
const deploymentId = typeof nextConfig.deploymentId === 'string' ? nextConfig.deploymentId : '';
function compiledFiles() {
  const files = ['.next/BUILD_ID', requiredFilesPath];
  for (const file of ['.next/build-manifest.json', '.next/app-build-manifest.json', '.next/routes-manifest.json', '.next/prerender-manifest.json']) {
    if (fs.existsSync(file)) files.push(file);
  }
  for (const folder of ['.next/server', '.next/static']) {
    if (!fs.existsSync(folder)) throw Error(`Missing ${folder}; complete the production build.`);
    for (const relative of fs.readdirSync(folder, { recursive: true }).filter(file => /\.(?:js|css|html|rsc|json)$/.test(file))) {
      files.push(path.join(folder, relative));
    }
  }
  return [...new Set(files)].sort();
}
function fingerprintBuild() {
  const hash = crypto.createHash('sha256');
  let bytes = 0;
  const files = compiledFiles();
  for (const file of files) {
    const data = fs.readFileSync(file);
    bytes += data.length;
    hash.update(file.replaceAll('\\', '/')).update('\0').update(data).update('\0');
  }
  return { hash: hash.digest('hex'), files: files.length, bytes };
}
const fingerprint = fingerprintBuild();
const sourceHash = crypto.createHash('sha256');
for (const folder of ['app', 'lib']) {
  for (const file of fs.readdirSync(folder, { recursive: true }).filter(file => /\.(tsx?|css)$/.test(file)).sort()) {
    sourceHash.update(folder + '/' + file.replaceAll('\\', '/')).update(fs.readFileSync(path.join(folder, file)));
  }
}

// Match the HTML's Next build/deployment identity before opening a browser.
// Next App Router serializes the build ID in the initial RSC payload unless a
// deployment ID is configured; in that case its asset URLs carry the deployment ID.
const preflightResponse = await fetch(origin + routes[0], { signal: AbortSignal.timeout(30000), redirect: 'manual' });
if (preflightResponse.status !== 200) throw Error(`Production preflight returned HTTP ${preflightResponse.status}.`);
const preflightHtml = await preflightResponse.text();
const htmlBuildIdMatch = preflightHtml.includes(buildId);
const htmlDeploymentIdMatch = Boolean(deploymentId && preflightHtml.includes(deploymentId));
if (!htmlBuildIdMatch && !htmlDeploymentIdMatch) throw Error('Served HTML does not identify the current .next build. Start the freshly built Next.js production server first.');
const resourcePaths = [...preflightHtml.matchAll(/(?:src|href)="([^"?#]+(?:\?[^"#]*)?)"/g)]
  .map(match => match[1].replaceAll('&amp;', '&'))
  .filter(value => value.startsWith('/_next/static/') && /\.(?:js|css)(?:\?|$)/.test(value));
const selectedAssets = ['.js', '.css'].map(extension => resourcePaths.find(value => new URL(value, origin).pathname.endsWith(extension))).filter(Boolean);
if (!selectedAssets.length) throw Error('No current Next.js static assets found in production HTML.');
const verifiedAssets = [];
for (const asset of selectedAssets) {
  const pathname = new URL(asset, origin).pathname;
  const localPath = path.resolve('.next/static', pathname.slice('/_next/static/'.length));
  const staticRoot = path.resolve('.next/static') + path.sep;
  if (!localPath.startsWith(staticRoot) || !fs.existsSync(localPath)) throw Error(`Served asset is not in the current build: ${pathname}`);
  const response = await fetch(origin + asset, { signal: AbortSignal.timeout(30000) });
  const served = Buffer.from(await response.arrayBuffer());
  const localHash = sha256(fs.readFileSync(localPath));
  if (response.status !== 200 || sha256(served) !== localHash) throw Error(`Served static asset differs from the current build: ${pathname}`);
  verifiedAssets.push({ path: pathname, sha256: localHash, bytes: served.length });
}
let commit = null;
try { commit = execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, 'rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
const manifest = {
  phase, startedAt: new Date().toISOString(), origin,
  mode: 'Next.js production build served by next start on localhost',
  framework: 'Next.js', nextVersion: readJson('node_modules/next/package.json').version,
  commit, buildId, buildConfig,
  servedBuildHash: fingerprint.hash,
  compiledArtifacts: { count: fingerprint.files, bytes: fingerprint.bytes, algorithm: 'SHA-256 of ordered artifact paths and contents; .next/server, .next/static and build manifests' },
  buildModifiedAt: fs.statSync(buildIdFile).mtime.toISOString(),
  buildVerification: { htmlBuildIdMatch, htmlDeploymentIdMatch, verifiedAssets },
  sourceHash: sourceHash.digest('hex'),
  sourceNote: 'Only this measured Next.js build is represented. Earlier Vinext/Worker reports are historical and are not reused. Source edits after the build are not measured until rebuilt.',
  node: process.version,
  sampling: { runsPerDevice, default: 'One mobile and one desktop observation per route; repeat selected uncertain routes in a new phase using SEO_MOBILE_RUNS / SEO_DESKTOP_RUNS.' },
  environment: 'Windows laptop, headless Edge, isolated fresh browser profile per run; sequential simulated-throttling lab tests; no field INP',
  runs: [],
};
const metrics = ['first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'speed-index', 'server-response-time'];
fs.mkdirSync(out, { recursive: true });
const save = () => fs.writeFileSync(path.join(out, 'summary.json'), JSON.stringify(manifest, null, 2) + '\n');
save();
for (const route of routes) {
  for (const device of ['mobile', 'desktop']) {
    for (let run = 1; run <= runsPerDevice[device]; run++) {
      const label = `${route === '/' ? 'home' : route.slice(1).replaceAll('/', '-')}-${device}-${run}`;
      let chrome;
      try {
        if (fs.readFileSync(buildIdFile, 'utf8').trim() !== buildId) throw Error('Build changed during measurement. Use a new phase after rebuilding.');
        chrome = await launch({
          chromePath: process.env.CHROME_PATH || 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
          chromeFlags: ['--headless', '--no-first-run', '--disable-extensions'], logLevel: 'silent',
        });
        const result = await lighthouse(origin + route, {
          port: chrome.port, output: ['json', 'html'], logLevel: 'error',
          onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
          disableStorageReset: false, throttlingMethod: 'simulate',
        }, device === 'desktop' ? desktop : undefined);
        if (!result) throw Error('No Lighthouse result.');
        fs.writeFileSync(path.join(out, `${label}.json`), result.report[0]);
        fs.writeFileSync(path.join(out, `${label}.html`), result.report[1]);
        const lhr = result.lhr;
        const row = {
          route, device, run, file: `${label}.json`, date: lhr.fetchTime,
          status: lhr.runtimeError ? 'FAIL' : 'PASS', runtimeError: lhr.runtimeError,
          buildId, servedBuildHash: fingerprint.hash,
          version: lhr.lighthouseVersion, browser: lhr.userAgent, settings: lhr.configSettings,
          scores: Object.fromEntries(Object.entries(lhr.categories).map(([key, value]) => [key, value.score === null ? null : Math.round(value.score * 100)])),
          metrics: Object.fromEntries(metrics.map(key => [key, lhr.audits[key]?.numericValue ?? null])),
          failed: Object.values(lhr.audits).filter(audit => audit.score !== null && audit.score < 1 && !['manual', 'notApplicable', 'informative'].includes(audit.scoreDisplayMode)).map(audit => ({ id: audit.id, title: audit.title, displayValue: audit.displayValue })),
          requests: lhr.audits['network-requests']?.details?.items?.length,
          bytes: lhr.audits['total-byte-weight']?.numericValue,
          fieldData: 'Not measured. Local lab only.',
        };
        manifest.runs.push(row); save();
        console.log(JSON.stringify({ phase, route, device, run, status: row.status, scores: row.scores, metrics: row.metrics }));
      } catch (error) {
        manifest.runs.push({ route, device, run, status: 'FAIL', error: error.message }); save();
        console.error(JSON.stringify({ route, device, run, error: error.message }));
      } finally {
        if (chrome) try { await chrome.kill(); } catch { /* The OS may briefly retain the isolated profile. */ }
      }
    }
  }
}
const stats = values => {
  const sorted = values.filter(value => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const center = Math.floor(sorted.length / 2);
  return { median: sorted.length % 2 ? sorted[center] : (sorted[center - 1] + sorted[center]) / 2, min: sorted[0], max: sorted.at(-1), count: sorted.length };
};
manifest.groups = routes.flatMap(route => ['mobile', 'desktop'].map(device => {
  const runs = manifest.runs.filter(run => run.route === route && run.device === device && run.status === 'PASS');
  return {
    route, device, count: runs.length,
    samplingNote: runs.length === 1 ? 'Single observation; variation has not been estimated.' : 'Repeated observations within this build and phase.',
    scores: Object.fromEntries(['performance', 'accessibility', 'best-practices', 'seo'].map(key => [key, stats(runs.map(run => run.scores[key]))])),
    metrics: Object.fromEntries(metrics.map(key => [key, stats(runs.map(run => run.metrics[key]))])),
  };
}));
manifest.buildUnchangedAtEnd = fingerprintBuild().hash === fingerprint.hash;
manifest.finishedAt = new Date().toISOString();
if (!manifest.buildUnchangedAtEnd) manifest.invalidReason = 'Compiled artifacts changed while measuring; do not use this phase as a final result.';
save();
process.exitCode = !manifest.buildUnchangedAtEnd || manifest.runs.some(run => run.status !== 'PASS') ? 1 : 0;
