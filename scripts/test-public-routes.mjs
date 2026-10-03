import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {analyzeReachability} from './route-reachability.mjs';
import {retiredReferences,retiredCaseIds,retiredAssetPaths} from './portfolio-contract.mjs';
import {routeCatalog} from '../lib/route-catalog.ts';
import {pageSeo} from '../app/page-seo-data.ts';
import {publicAssetPaths} from '../lib/public-asset-paths.ts';
import {toolRedirects} from '../lib/tool-routes.ts';
import {crawlPublicRoutes, productionOrigin, readPage, validatePage, validateRedirect, validateSitemap} from './public-route-checks.mjs';
import {filesBelow, inventoryAppPages, inventoryPublicAssets, validateRouteInventory} from './public-route-inventory.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const origin = process.env.SEO_TEST_ORIGIN || 'http://127.0.0.1:5186';
const originUrl = new URL(origin);
if (originUrl.protocol !== 'http:' || !['localhost', '127.0.0.1'].includes(originUrl.hostname) || originUrl.username || originUrl.password || originUrl.pathname !== '/' || originUrl.search || originUrl.hash) throw new Error('Local HTTP fixture origin only.');
const reportPath = process.env.SEO_TEST_REPORT || path.join(root, 'reports/routes-na-herstel.json');
const paths = routeCatalog.map(item => item.path);
const failures = [], edgeChecks = [];
const checkedAt = new Date().toISOString();

// Native HTTP preserves Host without using production DNS or making live requests.
function request(route, production = true) {
  if (!route.startsWith('/') || route.startsWith('//')) throw new Error('Expected local request path.');
  return new Promise((resolve, reject) => {
    const req = http.get(new URL(route, origin), {headers: production ? {Host: new URL(productionOrigin).host} : {}}, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks).toString('utf8')}));
      response.on('error', reject);
    });
    req.setTimeout(15000, () => req.destroy(new Error('Local route timeout')));
    req.on('error', reject);
  });
}

async function buildIdentity() {
  try {
    return {id: (await fs.readFile(path.join(root, '.next/BUILD_ID'), 'utf8')).trim(), entrySha256: createHash('sha256').update(await fs.readFile(path.join(root, '.next/server/app/page.js'))).digest('hex')};
  } catch { return null; }
}
async function sourceIdentity() {
  const hash = createHash('sha256');
  const files = [...await filesBelow(path.join(root, 'app')), ...await filesBelow(path.join(root, 'lib')), ...await filesBelow(path.join(root, 'scripts')),
    ...['proxy.ts', 'next.config.ts', 'package.json', 'package-lock.json'].map(file => path.join(root, file))];
  for (const file of files.sort()) hash.update(path.relative(root, file)).update(await fs.readFile(file));
  return hash.digest('hex');
}
function check(code, route, passed, expected, actual) {
  const item = {code, path: route, expected, actual};
  edgeChecks.push({...item, passed});
  if (!passed) failures.push(item);
}

const beforeBuild = await buildIdentity(), beforeSource = await sourceIdentity();
const appPages = await inventoryAppPages(root), diskAssets = await inventoryPublicAssets(root);
failures.push(...validateRouteInventory(appPages, paths, toolRedirects));
check('asset-manifest', 'public/', JSON.stringify(diskAssets) === JSON.stringify([...publicAssetPaths].sort()), diskAssets, [...publicAssetPaths].sort());

const result = await crawlPublicRoutes({paths, request, metadata: pageSeo, assetPaths: diskAssets});
const reachability=analyzeReachability(paths,result.links);
const reachabilityWithoutSitemap=analyzeReachability(paths.filter(path=>path!=='/sitemap'),result.links);
failures.push(...result.failures,...reachability.failures,...reachabilityWithoutSitemap.failures.map(f=>({...f,graph:'without-sitemap'})));
for (const route of paths) {const response=await request(route);check('no-retired-public-content',route,!retiredReferences(response.body),'no retired identities in HTML/RSC','HTML scanned');}
for(const id of retiredCaseIds) for(const suffix of ['','?source=retired-check']) {const route='/projecten/'+id+suffix;const response=await request(route);check('retired-case-404',route,response.status===404,404,response.status);}
for (const route of paths) {
  const response = await request(route + '?utm_source=route-fixture&pakket=onepager');
  const page = readPage(response.body, route + '?utm_source=route-fixture&pakket=onepager', response.headers);
  failures.push(...validatePage(page, {status: response.status, headers: response.headers, requireNonce: true, expectedDescription: pageSeo[route]?.description}));
  const preview = await request(route, false);
  const previewPage = readPage(preview.body, route, preview.headers);
  check('preview-noindex', route, /\bnoindex\b/i.test(previewPage.robots), 'preview noindex', previewPage.robots);
}
// Test intentional result noindex separately, while the plain and tracking variants above must remain indexable.
for (const route of ['/tools/website-check', '/tools/website-kosten-berekenen']) {
  const query = route + '?utm_source=route-fixture&resultaat=1&pakket=onepager';
  const response = await request(query), page = readPage(response.body, query, response.headers);
  const issues = validatePage(page, {status: response.status, headers: response.headers, requireNonce: true, expectedDescription: pageSeo[route]?.description});
  failures.push(...issues);
  edgeChecks.push({code: 'tool-result-variant', path: query, passed: issues.length === 0, expected: {status: 200, canonical: productionOrigin + route, robots: 'noindex'}, actual: {status: response.status, canonicals: page.canonicals, robots: page.robots}});
}
for (const redirect of toolRedirects) {
  const response = await request(redirect.source);
  failures.push(...validateRedirect(response, redirect));
  const destination = await request(redirect.destination);
  check('legacy-final-status', redirect.destination, destination.status === 200, 200, destination.status);
}
for (const route of ['/not-a-real-article', '/projecten/not-a-real-case', '/diensten/unknown-service', '/tools/not-a-real-tool', '/tools/snelheidstest/not-a-real-guide', '/about/not-a-real-image.jpg', '/og/not-a-real-image.png', '/fonts/not-a-real-font.woff2', '/brand/not-a-real-image.png']) {
  const response = await request(route);
  check('unknown-404', route, response.status === 404, 404, response.status);
  check('unknown-html-protection', route, Boolean(response.headers['content-security-policy']?.includes("'nonce-")), 'HTML nonce CSP', response.headers['content-security-policy']);
}
for(const asset of retiredAssetPaths){const response=await request(asset);check('retired-asset-404',asset,response.status===404,404,response.status);}
const sitemap = await request('/sitemap.xml');
check('sitemap-response', '/sitemap.xml', sitemap.status === 200 && /xml/.test(sitemap.headers['content-type'] || ''), '200 XML', {status: sitemap.status, contentType: sitemap.headers['content-type']});
const sitemapResult = validateSitemap(sitemap.body, paths);
failures.push(...sitemapResult.failures);
const previewSitemap = await request('/sitemap.xml', false);
check('preview-sitemap', '/sitemap.xml', previewSitemap.status === 200 && !/<loc\s*>/.test(previewSitemap.body), 'empty preview sitemap', previewSitemap.status);
for (const production of [true, false]) {
  const robots = await request('/robots.txt', production);
  check('robots-public-crawl', '/robots.txt', robots.status === 200 && !/^Disallow:\s*\/\s*$/m.test(robots.body), 'crawler can read public HTML/noindex', robots.body);
  check('robots-sitemap', '/robots.txt', production ? robots.body.includes(`Sitemap: ${productionOrigin}/sitemap.xml`) : !/^Sitemap:/m.test(robots.body), production ? 'production sitemap' : 'no preview sitemap', robots.body);
}
const privatePage = await request('/hub/admin/aanvragen', false);
check('anonymous-hub', '/hub/admin/aanvragen', [303, 307].includes(privatePage.status) && privatePage.headers.location?.includes('/hub/login'), 'login redirect', {status: privatePage.status, location: privatePage.headers.location});
check('private-noindex', '/hub/admin/aanvragen', /\bnoindex\b/.test(privatePage.headers['x-robots-tag'] || ''), 'private noindex header', privatePage.headers['x-robots-tag']);

const afterBuild = await buildIdentity(), afterSource = await sourceIdentity();
check('stable-source-during-test', 'source', beforeSource === afterSource, beforeSource, afterSource);
check('stable-production-build', '.next/BUILD_ID', Boolean(beforeBuild) && JSON.stringify(beforeBuild) === JSON.stringify(afterBuild), beforeBuild, afterBuild);
const homepage = await request('/');
const flight = [...homepage.body.matchAll(/self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)/g)].map(match => { try {return JSON.parse(match[1]);} catch {return '';} }).join('');
const servedBuildIds = [...new Set([...flight.matchAll(/"b"\s*:\s*"([A-Za-z0-9_-]{1,128})"/g)].map(match => match[1]))];
check('served-build-identity', '/', Boolean(beforeBuild) && JSON.stringify(servedBuildIds) === JSON.stringify([beforeBuild.id]), beforeBuild?.id, servedBuildIds);

const report = {
  checkedAt, completedAt: new Date().toISOString(), environment: 'local-production-build', origin,
  commit: process.env.GITHUB_SHA || null, sourceSha256: afterSource, build: afterBuild, servedBuildIds,
  inventory: {appPages, catalogPaths: paths, sitemapUrls: sitemapResult.values, diskAssets},
  ...result, reachability, reachabilityWithoutSitemap, edgeChecks, failures,
  limits: [
    'HTTP/HTML validation only; desktop/mobile layout, fragment landing, hydrated DOM and browser exceptions require separate browser evidence.',
    'Dynamic-only anchors are reported for browser verification; no arbitrary missing-anchor allowlist is used.',
    'External URLs are inventoried but not requested. Their reachability is not confirmed.',
    'Schema syntax is checked; correspondence of business claims and visible content requires content review.',
    'App Router static files are independently reconciled. Dynamic values come from the catalog and discovered links; unlinked dynamic values need content inventory review.',
    'Build ID proves the served build and disk build agree and stayed stable. It is not an attestation that local source was used to produce that build.',
    'No live deployment, production indexing, promotion gate, email delivery or private-data access is proven.',
  ],
};
await fs.mkdir(path.dirname(reportPath), {recursive: true});
await fs.writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(`${result.routes.length} public HTML URLs, ${result.resources.length} resources, ${result.links.length} links; ${failures.length} failures. Report: ${reportPath}`);
if (failures.length) { console.error(JSON.stringify(failures, null, 2)); process.exitCode = 1; }
