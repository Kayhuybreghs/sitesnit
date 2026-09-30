import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {publicAssetPaths} from '../lib/public-asset-paths.ts';
import {crawlPublicRoutes, cssReferences, readPage, resolveReference, srcsetReferences, validatePage, validateRedirect, validateSitemap} from '../scripts/public-route-checks.mjs';
import {inventoryPublicAssets, validateRouteInventory} from '../scripts/public-route-inventory.mjs';
import {fixtureOrigin, pageFixture, htmlResponse, fixtureRequest, sitemapFixture} from './fixtures/public-routes.mjs';
const codes = result => result.failures.map(failure => failure.code);

test('URL resolution handles all own link forms with exact origins and preserves query context', () => {
  for (const [href, expected] of [
    ['https://www.sitesnit.nl/contact?dienst=webdesign#formulier', '/contact?dienst=webdesign'],
    ['//www.sitesnit.nl/contact', '/contact'], ['../contact', '/contact'], ['#werk', '/kosten'],
    ['https://sitesnit.nl/contact', '/contact'],
  ]) assert.equal(resolveReference(href, fixtureOrigin + '/kosten').path, expected);
  for (const href of ['https://www.sitesnit.nl.evil.test/contact', 'https://www.sitesnit.nl@evil.test/contact', 'https://www.sitesnit.nl:8443/contact']) assert.equal(resolveReference(href, fixtureOrigin).kind, 'external');
  assert.equal(resolveReference('mailto:hello@example.test', fixtureOrigin).kind, 'non-http');
});

test('absolute and relative unknown destinations are actually fetched and fail', async () => {
  for (const href of [fixtureOrigin + '/missing', 'missing', '//www.sitesnit.nl/missing']) {
    const requested = [];
    const result = await crawlPublicRoutes({paths: ['/'], request: fixtureRequest({'/': htmlResponse(pageFixture({body: `<a href="${href}">Broken link</a>`}))}, requested)});
    assert.ok(requested.includes('/missing'), href);
    assert.ok(codes(result).includes('page-status'), href);
  }
});

test('wrong-page, lookalike-origin, query and duplicate canonicals fail; correct query-page canonical passes', () => {
  for (const canonical of [fixtureOrigin + '/wrong', fixtureOrigin + '.evil.test/contact', fixtureOrigin + '/contact?resultaat=1']) {
    const page = readPage(pageFixture({path: '/contact', canonical}), '/contact');
    assert.ok(validatePage(page).some(failure => failure.code === 'canonical'));
  }
  assert.ok(validatePage(readPage(pageFixture({extraHead: `<link rel="canonical" href="${fixtureOrigin}/">`}), '/')).some(failure => failure.code === 'canonical'));
  assert.deepEqual(validatePage(readPage(pageFixture({path: '/contact'}), '/contact?dienst=webdesign')), []);
});

test('only intentional tool result variants require noindex; normal tool and other query pages remain indexable', () => {
  for (const path of ['/tools/website-check', '/tools/website-kosten-berekenen']) {
    for (const query of ['', '?utm_source=fixture&pakket=onepager', '?resultaat=']) {
      assert.deepEqual(validatePage(readPage(pageFixture({path}), path + query)), []);
      assert.ok(validatePage(readPage(pageFixture({path, robots: 'noindex, follow'}), path + query)).some(item => item.code === 'public-noindex'));
    }
    const resultPath = path + '?utm_source=fixture&resultaat=1&pakket=onepager';
    assert.deepEqual(validatePage(readPage(pageFixture({path, robots: 'noindex, follow'}), resultPath)), []);
    assert.ok(validatePage(readPage(pageFixture({path}), resultPath)).some(item => item.code === 'result-indexable'));
    assert.ok(validatePage(readPage(pageFixture({path, canonical: fixtureOrigin + resultPath, robots: 'noindex, follow'}), resultPath)).some(item => item.code === 'canonical'));
  }
  for (const path of ['/contact', '/tools/seo-audit', '/tools/website-check-extra']) {
    assert.ok(validatePage(readPage(pageFixture({path, robots: 'noindex, follow'}), path + '?resultaat=1')).some(item => item.code === 'public-noindex'));
  }
});

test('a discovered result variant is fetched and requires noindex without weakening the clean route', async () => {
  const path = '/tools/website-check', resultPath = path + '?resultaat=1', requested = [];
  const responses = {
    [path]: htmlResponse(pageFixture({path, body: `<a href="${resultPath}">Resultaat</a>`})),
    [resultPath]: htmlResponse(pageFixture({path, robots: 'noindex, follow'})),
  };
  const valid = await crawlPublicRoutes({paths: [path], request: fixtureRequest(responses, requested)});
  assert.ok(requested.includes(resultPath));
  assert.deepEqual(valid.failures, []);
  responses[resultPath] = htmlResponse(pageFixture({path}));
  const exposed = await crawlPublicRoutes({paths: [path], request: fixtureRequest(responses)});
  assert.deepEqual(codes(exposed), ['result-indexable']);
});

test('fragments are checked on source and other pages, including decoded IDs', async () => {
  const result = await crawlPublicRoutes({paths: ['/', '/contact'], request: fixtureRequest({
    '/': htmlResponse(pageFixture({body: '<a href="#missing">Missing</a><a href="/contact#caf%C3%A9">Existing</a><a href="#werk">Work</a><div id="werk"></div><a href="#top">Top</a><input name="missing">'})),
    '/contact': htmlResponse(pageFixture({path: '/contact', body: '<div id="café"></div>'})),
  })});
  assert.deepEqual(result.failures.map(item => item.code), ['missing-anchor']);
  assert.equal(result.failures[0].href, '#missing');
});

test('same-sized sitemap with duplicate/missing URL and private additions fails', () => {
  const sameSize = validateSitemap(sitemapFixture([fixtureOrigin + '/', fixtureOrigin + '/']), ['/', '/contact']);
  assert.ok(codes(sameSize).includes('sitemap-duplicates'));
  assert.ok(codes(sameSize).includes('sitemap-missing'));
  assert.ok(codes(validateSitemap(sitemapFixture([fixtureOrigin, fixtureOrigin + '/']), ['/'])).includes('sitemap-duplicates'));
  const privateMap = validateSitemap(sitemapFixture([fixtureOrigin + '/', fixtureOrigin + '/hub/admin']), ['/']);
  assert.ok(codes(privateMap).includes('sitemap-private'));
  assert.ok(codes(privateMap).includes('sitemap-unexpected'));
  assert.deepEqual(validateSitemap(sitemapFixture([fixtureOrigin + '/', fixtureOrigin + '/contact']), ['/', '/contact']).failures, []);
});

test('missing srcset and nested CSS/font assets fail with source evidence', async () => {
  const result = await crawlPublicRoutes({paths: ['/'], request: fixtureRequest({
    '/': htmlResponse(pageFixture({body: '<img src="/ok.webp" srcset="/ok.webp 1x, /missing-large.webp 2x" alt="Fixture">', extraHead: '<link rel="stylesheet" href="/styles/site.css">'})),
    '/ok.webp': {status: 200, headers: {'content-type': 'image/webp'}, body: 'fixture'},
    '/styles/site.css': {status: 200, headers: {'content-type': 'text/css'}, body: '.hero {background:url(../missing-bg.webp)} @font-face {font-family:Fixture;src:url(/missing-font.woff2)}'},
  })});
  for (const path of ['/missing-large.webp', '/missing-bg.webp', '/missing-font.woff2']) assert.ok(result.failures.some(failure => failure.code === 'asset-unavailable' && failure.path === path));
  assert.ok(result.failures.find(failure => failure.path === '/missing-bg.webp').sources.includes('/styles/site.css'));
});

test('inline CSS, preload imagesrcset, scripts and CSS imports are inventoried', () => {
  const page = readPage(pageFixture({body: '<div style="background:url(/inline.webp)"></div><script src="/bundle.js"></script>', extraHead: '<style>@import "/extra.css"; .x {background:url(/style.webp)}</style><link rel="preload" as="image" imagesrcset="/small.webp 1x, /large.webp 2x">'}), '/');
  for (const path of ['/inline.webp', '/bundle.js', '/extra.css', '/style.webp', '/small.webp', '/large.webp']) assert.ok(page.resources.some(resource => resource.href === path));
  assert.deepEqual(srcsetReferences('data:image/svg+xml,%3Csvg%3E 1x, /real.webp 2x'), ['/real.webp']);
  assert.deepEqual(cssReferences('/* url(/comment.png) */ .a{background:url(data:image/svg+xml,thing)} @import "nested.css";'), ['nested.css']);
});

test('unexpected noindex headers, duplicate IDs and malformed nested links fail', () => {
  const page = readPage(pageFixture({body: '<div id="same"></div><div id="same"></div><a href="/"><a href="/contact">Nested</a></a>'}), '/', {'x-robots-tag': 'noindex, follow'});
  const failures = validatePage(page);
  for (const code of ['public-noindex', 'duplicate-id', 'html-parse']) assert.ok(failures.some(item => item.code === code), code);
});

test('legacy redirect requires exact status, own origin and complete destination', () => {
  const redirect = {source: '/old', destination: '/new', permanent: true};
  for (const response of [
    {status: 200, headers: {location: '/new'}}, {status: 308, headers: {location: '/wrong'}},
    {status: 308, headers: {location: fixtureOrigin + '.evil.test/new'}}, {status: 308, headers: {location: '/new?wrong=1'}},
  ]) assert.equal(validateRedirect(response, redirect)[0].code, 'legacy-redirect');
  assert.deepEqual(validateRedirect({status: 308, headers: {location: '/new'}}, redirect), []);
});

test('discovered public pages outside the catalog are crawled and flagged; private links are not crawled', async () => {
  const requested = [];
  const result = await crawlPublicRoutes({paths: ['/'], request: fixtureRequest({
    '/': htmlResponse(pageFixture({body: '<a href="/new">New</a><a href="/hub/admin">Private</a>'})),
    '/new': htmlResponse(pageFixture({path: '/new'})),
  }, requested)});
  assert.ok(codes(result).includes('uncatalogued-public-page'));
  assert.ok(requested.includes('/new'));
  assert.ok(!requested.includes('/hub/admin'));
});

test('static assets with HTML nonce CSP or a false 200 HTML response fail', async () => {
  const result = await crawlPublicRoutes({paths: ['/'], assetPaths: ['/asset.png'], request: fixtureRequest({
    '/': htmlResponse(pageFixture()), '/asset.png': htmlResponse(pageFixture()),
  })});
  assert.ok(codes(result).includes('asset-unavailable'));
  assert.ok(codes(result).includes('asset-html-nonce'));
});

test('catalog pages cannot silently pass as 200 JSON, text or a missing content type', async () => {
  for (const contentType of ['application/json', 'text/plain', '']) {
    const result = await crawlPublicRoutes({paths: ['/', '/contact'], request: fixtureRequest({
      '/': htmlResponse(pageFixture({body: '<a href="/contact?dienst=test">Contact context</a><a href="/download.txt">Download</a>'})),
      '/contact': {status: 200, headers: {'content-type': contentType}, body: '{}'},
      '/contact?dienst=test': htmlResponse(pageFixture({path: '/contact'})),
      '/download.txt': {status: 200, headers: {'content-type': 'text/plain'}, body: 'A legitimate download'},
    })});
    assert.deepEqual(codes(result), ['page-content-type']);
    assert.equal(result.failures[0].path, '/contact');
    assert.ok(result.routes.some(page => page.path === '/contact?dienst=test'));
  }
});

test('independent App Router inventory catches omitted static routes and orphan catalog entries', () => {
  const inventory = [{route: '/', file: 'app/page.tsx', dynamic: false}, {route: '/missing', file: 'app/missing/page.tsx', dynamic: false}];
  const failures = validateRouteInventory(inventory, ['/', '/orphan'], []);
  assert.ok(failures.some(item => item.code === 'uncatalogued-app-page'));
  assert.ok(failures.some(item => item.code === 'catalog-without-app-page'));
});

test('asset bypass manifest equals every actual public file and file-based favicon', async () => {
  const actual = await inventoryPublicAssets(fileURLToPath(new URL('../', import.meta.url)));
  assert.deepEqual([...publicAssetPaths].sort(), actual, 'Run node scripts/generate-public-assets.mjs after adding/removing public assets.');
  assert.ok(publicAssetPaths.has('/og.png'));
  assert.ok(!publicAssetPaths.has('/og/not-a-real-image.png'));
});
