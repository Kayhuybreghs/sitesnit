// Product allowlist independent of application records; safe for offline generators.
export const approvedCaseIds = ['beurswijzer', 'beurswatcher'];
export function validatePortfolio(ids) {
  return JSON.stringify([...ids].sort()) === JSON.stringify([...approvedCaseIds].sort()) ? [] : ['Public portfolio must contain exactly the two approved cases, without duplicates.'];
}
export function validateSocialRecords(records, expectedPaths) {
  const issues = [], keys = Object.keys(records).sort();
  if (JSON.stringify(keys) !== JSON.stringify([...expectedPaths].sort())) issues.push('Social metadata route set differs from the complete public route set.');
  issues.push(...validatePortfolio(keys.filter(key => key.startsWith('/projecten/')).map(key => key.slice('/projecten/'.length))));
  for (const [route, entry] of Object.entries(records)) {
    if (!/^\/og(?:\/|\.png$)/.test(entry.url || '') || entry.url.includes('..') || entry.width !== 1200 || entry.height !== 630 || !entry.alt?.trim()) issues.push(`Invalid social record: ${route}`);
  }
  return issues;
}
