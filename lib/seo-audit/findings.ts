import type { Finding } from './analyze';

// These aliases are the same HTML evidence collected by the basic and detailed
// analyzers. Different URLs and different questions must remain separate.
const equivalentCodes: Record<string, string> = {
  'canonical-multiple': 'canonical-count',
  'duplicate-title': 'title-unique',
  'duplicate-description': 'description-unique',
};
export function uniqueAuditFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  return findings.filter(finding => {
    const key = `${finding.url}\n${equivalentCodes[finding.code] || finding.code}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
