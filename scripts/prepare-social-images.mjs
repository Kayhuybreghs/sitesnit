/** Offline packaging of reviewed artwork. Complete validation before atomic staging publication. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID, createHash} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {routeCatalog} from '../lib/route-catalog.ts';
import {clientCases} from '../app/portfolio-data.ts';
import {validatePortfolio, validateSocialRecords} from './portfolio-source-contract.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const argument = process.argv.indexOf('--output');
if (argument < 0 || !process.argv[argument + 1]) throw Error('Provide --output for a NEW staging directory. Application files are never overwritten.');
const destination = path.resolve(process.argv[argument + 1]);
if (!destination.startsWith(path.join(root,'.sites-runtime') + path.sep)) throw Error('Output must be a new directory inside .sites-runtime.');
try { await fs.access(destination); throw Error('Output already exists; choose a new staging directory.'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const records = JSON.parse(await fs.readFile(new URL('./social-images-source.json', import.meta.url), 'utf8'));
const problems = [...validatePortfolio(clientCases.map(item => item.slug)), ...validateSocialRecords(records, routeCatalog.map(item => item.path))];
if (problems.length) throw Error(problems.join('\n'));
const assets = new Map();
for (const entry of Object.values(records)) {
  const data = await fs.readFile(path.join(root,'public',entry.url));
  if (data.subarray(0,8).toString('hex') !== '89504e470d0a1a0a' || data.readUInt32BE(16) !== entry.width || data.readUInt32BE(20) !== entry.height) throw Error(`Image dimensions/type differ: ${entry.url}`);
  assets.set(entry.url,data);
}
const temporary = destination + '.tmp-' + randomUUID();
await fs.mkdir(temporary,{recursive:true});
for (const [url,data] of assets) {const target=path.join(temporary,'public',url);await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,data);}
await fs.mkdir(path.join(temporary,'lib'));
await fs.writeFile(path.join(temporary,'lib/social-images.ts'),'// Generated from scripts/social-images-source.json by prepare-social-images.mjs.\nexport const socialImages: Record<string, { url: string; width: number; height: number; alt: string }> = '+JSON.stringify(records,null,2)+';\n');
await fs.writeFile(path.join(temporary,'manifest.json'),JSON.stringify({routes:Object.keys(records).sort(),assets:[...assets].map(([url,data])=>({url,sha256:createHash('sha256').update(data).digest('hex')}))},null,2));
// Windows indexing can briefly hold a new directory open. Keep the atomic move
// and refusal to overwrite; retry only these transient locks, for a bounded time.
for(let attempt=0;;attempt++){
  try{await fs.rename(temporary,destination);break;}
  catch(error){
    if(process.platform!=='win32'||!['EPERM','EBUSY'].includes(error.code)||attempt>=5)throw error;
    try{await fs.access(destination);throw Error('Staging destination appeared during generation.');}catch(check){if(check.code!=='ENOENT')throw check;}
    await delay([100,200,400,800,1600][attempt]);
  }
}
console.log(JSON.stringify({output:destination,routes:Object.keys(records).length,assets:assets.size}));
