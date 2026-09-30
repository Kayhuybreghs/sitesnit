import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {inventoryPublicAssets} from './public-route-inventory.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const paths = await inventoryPublicAssets(root);
const output = '/** Generated from public/ and app/favicon.ico. Run node scripts/generate-public-assets.mjs after changing assets. */\n' +
  'export const publicAssetPaths = new Set<string>([\n' + paths.map(path => `  ${JSON.stringify(path)},`).join('\n') + '\n]);\n';
await fs.writeFile(new URL('../lib/public-asset-paths.ts', import.meta.url), output);
console.log(`Recorded ${paths.length} exact public asset paths.`);
