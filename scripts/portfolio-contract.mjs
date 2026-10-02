// Explicit product contract, independent of the records under test. Never run on private customer data.
import {validateSocialRecords as validateCurrentRecords} from './portfolio-source-contract.mjs';
export {approvedCaseIds,validatePortfolio} from './portfolio-source-contract.mjs';
export const retiredCaseIds = ['atelier-vorm', 'studio-matcha', 'buiten-gewoon'];
export const retiredAssetPaths=['chair','matcha','architecture'].flatMap(name=>[240,480,640,960,1536].map(size=>`/images/${name}-${size}.webp`));
const identity = /atelier[\s_-]+vorm|studio[\s_-]+matcha|buiten[\s_-]+gewoon/i;
const retiredAsset = /(?:^|[/'"\s])(?:images\/)?(?:chair|matcha|architecture)-\d+\.webp/i;
export function retiredReferences(value) {
  let decoded = String(value).replace(/\\u002[fF]/g, '/');
  try { decoded = decodeURIComponent(decoded); } catch { /* Malformed escapes remain searchable. */ }
  return identity.test(decoded) || retiredAsset.test(decoded);
}
export function validateSocialRecords(records, expectedPaths) {
  const issues = validateCurrentRecords(records,expectedPaths);
  for (const [route, entry] of Object.entries(records)) {
    if (retiredReferences(JSON.stringify([route, entry]))) issues.push(`Retired identity in social metadata: ${route}`);
  }
  return issues;
}
