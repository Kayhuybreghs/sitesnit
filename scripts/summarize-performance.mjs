import fs from 'node:fs';

const phases = ['before', 'after'];
const sources = phases.map(phase => ({ phase, ...JSON.parse(fs.readFileSync(`reports/lighthouse/${phase}/summary.json`, 'utf8')) }));
if (sources.some(source => !source.finishedAt || source.runs.some(run => run.status !== 'PASS'))) {
  throw new Error('Complete all measured runs before generating a release comparison.');
}
const routes = [...new Set(sources.flatMap(source => source.runs.map(run => run.route)))];
const metrics = ['first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'speed-index', 'server-response-time'];
const stat = values => {
  const sorted = values.filter(Number.isFinite).sort((a,b) => a-b);
  return sorted.length ? { median: sorted[Math.floor(sorted.length / 2)], min: sorted[0], max: sorted.at(-1) } : null;
};
const number = (value, decimals = 0) => Number(value.toFixed(decimals)).toLocaleString('nl-NL');
const display = (values, decimals = 0) => {
  const result = stat(values);
  if (!result) return 'Niet gemeten';
  return `${number(result.median, decimals)}${values.length > 1 ? ` (${number(result.min, decimals)}–${number(result.max, decimals)})` : ''}`;
};
const lines = [
  'Mediaan met minimum–maximum tussen haakjes: drie mobiele runs en één desktoprun per route en fase. Alle tijden in milliseconden; CLS heeft geen eenheid.',
  '',
  '| URL | Apparaat | Fase | P | A | BP | SEO | FCP | LCP | CLS | TBT | Speed Index | TTFB |',
  '|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|',
];
const output = [];
for (const route of routes) for (const device of ['mobile', 'desktop']) for (const source of sources) {
  const runs = source.runs.filter(run => run.route === route && run.device === device);
  if (!runs.length) {
    lines.push(`| ${route} | ${device} | ${source.phase} | N.V.T. — nieuwe pagina | — | — | — | — | — | — | — | — | — |`);
    continue;
  }
  const values = ['performance','accessibility','best-practices','seo'].map(key => display(runs.map(run => run.scores[key])));
  const measured = metrics.map(key => display(runs.map(run => run.metrics[key]), key === 'cumulative-layout-shift' ? 3 : 0));
  lines.push(`| ${route} | ${device} | ${source.phase} | ${[...values, ...measured].join(' | ')} |`);
  output.push({ route, device, phase: source.phase, runs: runs.length,
    scores: Object.fromEntries(['performance','accessibility','best-practices','seo'].map(key => [key, stat(runs.map(run => run.scores[key]))])),
    metrics: Object.fromEntries(metrics.map(key => [key, stat(runs.map(run => run.metrics[key]))])),
    bytes: stat(runs.map(run => run.bytes)), requests: stat(runs.map(run => run.requests)),
    reports: runs.map(run => `${source.phase}/${run.file}`),
  });
}
fs.writeFileSync('reports/lighthouse/comparison.md', lines.join('\n') + '\n');
fs.writeFileSync('reports/lighthouse/comparison.json', JSON.stringify({ generatedAt: new Date().toISOString(), groups: output }, null, 2));
console.log(JSON.stringify({ routes: routes.length, runs: sources.reduce((sum, source) => sum + source.runs.length, 0), groups: output.length }));
