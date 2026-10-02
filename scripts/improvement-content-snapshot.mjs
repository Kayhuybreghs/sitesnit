import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'parse5';
import { routeCatalog } from '../lib/route-catalog.ts';

const phase = process.argv[2];
const origin = process.env.CONTENT_ORIGIN || 'http://127.0.0.1:5188';
if (!['before', 'after'].includes(phase)) throw new Error('Use before or after');
if(!['127.0.0.1','localhost'].includes(new URL(origin).hostname))throw Error('Local content snapshots only');
const root = path.resolve(process.env.BROWSER_REPORT_ROOT || 'reports/improvement','content-review', phase);
await fs.mkdir(root, { recursive: true });
const attr = (node, name) => node.attrs?.find(item => item.name === name)?.value;
const children = node => node.childNodes || [];
const all = (node, predicate) => [...(predicate(node) ? [node] : []), ...children(node).flatMap(child => all(child, predicate))];
const excluded = new Set(['script', 'style', 'noscript', 'nav', 'footer']);
const text = node => excluded.has(node.tagName) ? '' : node.nodeName === '#text' ? node.value : children(node).map(text).join(' ');
const clean = value => value.replace(/\s+/g, ' ').trim();
const records = [];
for (const route of [...new Set(routeCatalog.map(item => item.path))]) {
  const response = await fetch(origin + route, { signal: AbortSignal.timeout(60000) });
  const html = await response.text();
  const document = parse(html);
  const main = all(document, node => node.tagName === 'main')[0];
  const source = main || document;
  const name = route === '/' ? 'home' : route.slice(1).replaceAll('/', '__');
  const content = clean(text(source));
  const record = {route, status: response.status, capturedAt: new Date().toISOString(), origin, contentHash: createHash('sha256').update(content).digest('hex'),
    headings: all(source, node => /^h[1-3]$/.test(node.tagName || '')).map(node => ({level: node.tagName, text: clean(text(node))})),
    links: all(source, node => node.tagName === 'a' && attr(node, 'href')).map(node => ({href: attr(node, 'href'), label: clean(text(node))})),
    paragraphs: all(source, node => node.tagName === 'p').map(node => clean(text(node))).filter(Boolean),
    textFile: `${phase}/${name}.txt`, htmlFile: `${phase}/${name}.html`};
  await fs.writeFile(path.join(root, name + '.txt'), content + '\n');
  await fs.writeFile(path.join(root, name + '.html'), html);
  records.push(record);
}
await fs.writeFile(path.join(root, 'manifest.json'), JSON.stringify({phase, origin, method: 'Local HTTP server-rendered main content; scripts/styles/nav/footer excluded from text. HTML is not a visual browser test.', records}, null, 2));
console.log(JSON.stringify({phase, count:records.length, errors:records.filter(record=>record.status!==200).map(record=>({route:record.route,status:record.status}))}, null, 2));
