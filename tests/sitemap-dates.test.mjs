import test from 'node:test';
import assert from 'node:assert/strict';
import {sitemapEntries, significantPageDates} from '../lib/sitemap-dates.ts';
import {routeCatalog} from '../lib/route-catalog.ts';

const origin='https://www.sitesnit.nl';
test('sitemap dates stay stable across builds; canonical URL set is unchanged',()=>{
  const first=sitemapEntries(routeCatalog,origin,significantPageDates,'2026-10-04');
  assert.deepEqual(first,sitemapEntries(routeCatalog,origin,significantPageDates,'2027-03-02'));
  assert.deepEqual(first.map(row=>row.url),routeCatalog.map(row=>origin+row.path));
  assert.equal(new Set(first.map(row=>row.url)).size,routeCatalog.length);
  assert.equal(first.filter(row=>'lastModified' in row).length,5);
  assert.equal('lastModified' in first.find(row=>row.url===origin+'/'),false);
});
test('one editorial date update affects only that page',()=>{
  const first=sitemapEntries(routeCatalog,origin,significantPageDates,'2026-10-06');
  const next=sitemapEntries(routeCatalog,origin,{...significantPageDates,'/contact':'2026-10-05'},'2026-10-06');
  assert.deepEqual(next.filter((row,i)=>JSON.stringify(row)!==JSON.stringify(first[i])),[{url:origin+'/contact',lastModified:'2026-10-05'}]);
});
test('invalid, future and unknown-route dates fail closed',()=>{
  for(const date of ['2026-02-30','not-a-date','2026-13-01','2026-10-05','2026-10-04T00:00:00Z',''])
    assert.throws(()=>sitemapEntries(routeCatalog,origin,{'/contact':date},'2026-10-04'));
  assert.throws(()=>sitemapEntries(routeCatalog,origin,{'/unknown':'2026-10-04'},'2026-10-04'));
  assert.throws(()=>sitemapEntries(routeCatalog,origin,{},'invalid'));
});
