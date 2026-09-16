import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

await build({entryPoints:['lib/route-catalog.ts'],bundle:true,platform:'node',format:'esm',outfile:'.sites-runtime/route-catalog.mjs'});
const { routeCatalog, seoFacts } = await import(pathToFileURL(path.resolve('.sites-runtime/route-catalog.mjs')));
fs.writeFileSync('.sites-runtime/route-catalog.json', JSON.stringify(routeCatalog));
fs.writeFileSync('.sites-runtime/seo-facts.json', JSON.stringify(seoFacts));
// Standard-library parser; no browser and no additional Python packages required.
const bundled = path.join(process.env.USERPROFILE || '', '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe');
const python = process.env.SEO_PYTHON || (fs.existsSync(bundled) ? bundled : 'python3');
const result = spawnSync(python, ['scripts/seo-check.py', ...process.argv.slice(2)], {stdio:'inherit'});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
