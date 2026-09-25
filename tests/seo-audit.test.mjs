import test from 'node:test';
import assert from 'node:assert/strict';
import {analyze,duplicateFindings} from '../lib/seo-audit/analyze.ts';
import {auditUrl,publicIpv4} from '../lib/seo-audit/network.ts';
import {crawlSite} from '../lib/seo-audit/crawl.ts';
import {completedMonths,fetchGa4} from '../lib/hub/providers/ga4.ts';
const html=(body,url='https://example.com/')=>({url,status:200,headers:{'content-type':'text/html'},body});
test('audit rejects local addresses, credentials, query strings, protocols and special IPv4 ranges',()=>{
 for(const url of ['https://127.0.0.1','https://foo.local','https://a:b@example.com','https://example.com:8080','https://example.com/?token=secret','http://example.com','https://[::1]'])assert.throws(()=>auditUrl(url));
 for(const ip of ['127.0.0.1','10.0.0.1','169.254.169.254','100.64.0.1','192.168.0.1','224.0.0.1','0.0.0.0','192.0.2.1','::1'])assert.equal(publicIpv4(ip),false,ip);
 assert.equal(publicIpv4('8.8.8.8'),true);
});
test('HTML parser handles real markup, intentional empty alt and noindex header',()=>{
 const p=analyze({...html('<title>A &amp; B</title><meta name="description" content="Een beschrijving"><h1>Helder <em>verhaal</em></h1><img alt="" src="a"><img src="b"><script type="application/ld+json">{invalid}</script><a href="/next">Verder</a>'),headers:{'content-type':'text/html','x-robots-tag':'noindex'}});
 assert.equal(p.title,'A & B');assert.equal(p.indexable,false);assert.equal(p.findings.find(f=>f.code==='alt').evidence.startsWith('1 afbeelding'),true);assert.ok(p.findings.some(f=>f.code==='json'));assert.ok(!p.findings.some(f=>f.code==='h1'));assert.deepEqual(p.links,['https://example.com/next']);
});
test('duplicates only compare received indexable pages',()=>{
 const a=analyze(html('<title>Zelfde titel</title><h1>A</h1>'));const b=analyze(html('<title>Zelfde titel</title><h1>B</h1>','https://example.com/b'));assert.equal(duplicateFindings([a,b]).length,2);b.indexable=false;assert.equal(duplicateFindings([a,b]).length,0);
});
test('crawl respects robots, reports missing link source, no external fetches',async()=>{
 const requested=[];const read=async url=>{requested.push(url);if(url.endsWith('/robots.txt'))return {...html('User-agent: *\nDisallow: /private',url),headers:{'content-type':'text/plain'}};if(url==='https://example.com/')return html('<title>Home</title><h1>Home</h1><a href="/gone">Verdwenen</a><a href="/private">Privé</a><a href="https://other.com">Extern</a>');return {...html('',url),status:404};};
 const result=await crawlSite('https://example.com/',read);assert.equal(result.pages.length,2);assert.equal(result.skipped,1);assert.ok(result.findings.some(f=>f.code==='broken-link'&&f.evidence.includes('https://example.com/')));assert.ok(!requested.includes('https://example.com/private'));assert.ok(!requested.some(u=>u.includes('other.com')));
});
test('blocked robots and cross-domain redirect produce no fabricated report',async()=>{
 await assert.rejects(()=>crawlSite('https://example.com',async url=>({...html('User-agent: *\nDisallow: /',url),headers:{'content-type':'text/plain'}})),/Robots/);
 await assert.rejects(()=>crawlSite('https://example.com',async url=>url.endsWith('/robots.txt')?{...html('',url),status:404}:{...html('',url),status:302,headers:{location:'https://other.com/'}}),/ander domein/);
});
test('monthly periods cross year boundaries and source/medium is requested independently',async()=>{
 assert.deepEqual(completedMonths('2026-01-20'),{startDate:'2025-07-01',endDate:'2025-12-31'});
 const bodies=[];await fetchGa4({propertyId:'123',period:{startDate:'2026-09-01',endDate:'2026-09-20'}},{now:()=>new Date('2026-09-25T12:00:00Z'),getAccessToken:async()=> 'fixture',fetch:async(_url,init)=>{const b=JSON.parse(init.body);bodies.push(b);return Response.json({dimensionHeaders:b.dimensions,metricHeaders:b.metrics,rows:[],rowCount:0});}});
 assert.ok(bodies.some(b=>b.dimensions[0]?.name==='sessionSourceMedium'));
 assert.deepEqual(bodies.find(b=>b.dimensions[0]?.name==='yearMonth').dateRanges,[{startDate:'2026-03-01',endDate:'2026-08-31'}]);
});
