import {crawlSite} from '../lib/seo-audit/crawl.ts';
import fs from 'node:fs/promises';
const report=await crawlSite(process.argv[2]||'https://example.com');
await fs.writeFile('reports/audit-live-sample.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({origin:report.origin,pages:report.pages.length,findings:report.findings.map(f=>({code:f.code,url:f.url})),limited:report.limited}));
