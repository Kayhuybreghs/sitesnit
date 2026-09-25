import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { publicServicePages } from '../lib/public-service-pages.ts';
import { routeCatalog } from '../lib/route-catalog.ts';
import { pageSeo } from '../app/page-seo-data.ts';
import { socialImages } from '../lib/social-images.ts';
import { indexingAllowed, privatePath } from '../lib/seo-policy.ts';
import { services } from '../app/diensten/service-data.ts';
import { hubScopes, serviceRelated } from '../app/service-experience-data.ts';

const path = '/diensten/website-monitoring';
test('handcrafted monitoring page is catalogued once, separate from generic service rendering and private Hub', () => {
  assert.equal(routeCatalog.filter(row => row.path === path).length, 1);
  assert.equal(routeCatalog.find(row => row.path === path).releaseCandidate, true);
  assert.equal(services.some(service => service.slug === 'website-monitoring'), false);
  assert.ok(Object.values(publicServicePages).some(service => service.slug === 'website-monitoring'));
  assert.ok(routeCatalog.every(row => !privatePath(row.path)));
  assert.equal(privatePath(path), false);
  assert.equal(privatePath('/hub/login'), true);
  assert.equal(indexingAllowed('www.sitesnit.nl', 'production'), true);
  assert.equal(indexingAllowed('www.sitesnit.nl', 'preview'), false);
});
test('monitoring has unique matching metadata and an actual 1200 by 630 PNG', () => {
  const meta = pageSeo[path], image = socialImages[path];
  assert.equal(meta.title, publicServicePages[path].title);
  assert.match(meta.title, /Website-monitoring/);
  assert.match(meta.description, /koppelingen/);
  assert.ok(!Object.entries(pageSeo).some(([key, value]) => key !== path && value.description === meta.description));
  assert.ok(!Object.entries(socialImages).some(([key, value]) => key !== path && value.url === image.url));
  const png = fs.readFileSync(new URL(`../public${image.url}`, import.meta.url));
  assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(png.readUInt32BE(16), 1200); assert.equal(png.readUInt32BE(20), 630);
  assert.match(image.alt, /bron en meetmoment/);
});
test('monitoring is reachable from relevant service families without pretending to be a free check', () => {
  assert.ok(hubScopes.seo.some(scope => scope.href === path));
  for (const slug of ['seo-onderhoud', 'onderhoud-hosting']) assert.ok(serviceRelated[slug].some(item => item[2] === 'website-monitoring'));
  const page = fs.readFileSync(new URL('../app/diensten/website-monitoring/page.tsx', import.meta.url), 'utf8');
  assert.match(page, /'@type':'Service'/);
  assert.doesNotMatch(page, /isAccessibleForFree|aggregateRating|priceCurrency/);
});
