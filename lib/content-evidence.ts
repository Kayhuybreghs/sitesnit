/** Review signals, not automated judgments of truth, originality or Google eligibility. */
export type EvidenceClaim = {
  id: string; text: string; kind: 'business' | 'observation' | 'external' | 'advice' | 'demonstration';
  evidence?: string; verified?: boolean; sourceId?: string; demonstrationLabel?: string;
};
export type ReviewedSource = { checked: string | null; supportedClaimIds: string[] };
export type PageEvidence = {
  path: string; purpose: string; outcome: string; mainText: string; places?: string[];
  sections: { heading: string; content: string }[];
  primaryAction: { href: string; status: number | null; accessibleName: string };
  claims: EvidenceClaim[];
};
export function inspectEvidence(page: PageEvidence, sources: Record<string, ReviewedSource>) {
  const issues: { code: string; evidence: string }[] = [];
  for (const section of page.sections) if (!section.heading.trim() || !section.content.trim())
    issues.push({ code: 'empty-section', evidence: section.heading || 'Kop ontbreekt' });
  if (!page.primaryAction.accessibleName.trim() || !page.primaryAction.href || page.primaryAction.status !== 200)
    issues.push({ code: 'primary-action-unverified', evidence: page.primaryAction.href });
  for (const claim of page.claims) {
    if (claim.kind === 'demonstration') {
      if (!claim.demonstrationLabel?.trim()) issues.push({ code: 'unlabelled-demo', evidence: claim.id });
    } else if (claim.kind === 'external') {
      const source = claim.sourceId ? sources[claim.sourceId] : undefined;
      if (!source?.checked) issues.push({ code: 'unchecked-source', evidence: claim.id });
      else if (!source.supportedClaimIds.includes(claim.id)) issues.push({ code: 'unsupported-source-claim', evidence: claim.id });
    } else if (claim.kind !== 'advice' && (!claim.verified || !claim.evidence?.trim())) {
      issues.push({ code: 'unverified-claim', evidence: claim.id });
    }
  }
  return issues;
}
function normalized(text: string) { return text.toLocaleLowerCase('nl').replace(/[^\p{L}\p{N}]+/gu,' ').trim(); }
export function comparePagePurpose(a: PageEvidence, b: PageEvidence) {
  const signals: string[] = [];
  if (a.purpose === b.purpose && a.outcome === b.outcome) signals.push('same-reader-task');
  const mask = (page: PageEvidence) => {
    let value = normalized(page.mainText);
    for (const place of [...(page.places || [])].sort((x,y)=>y.length-x.length)) {
      value = value.split(normalized(place)).join(' LOCATION ');
    }
    return value.replace(/\s+/g,' ').trim();
  };
  if (a.mainText.trim() && normalized(a.mainText) === normalized(b.mainText)) signals.push('same-main-content');
  else if (a.places?.length && b.places?.length && mask(a) === mask(b)) signals.push('place-name-only-copy');
  return signals;
}
