import { CONTACT_BODY_MAX_BYTES, CONTACT_SUMMARY_MAX_LENGTH } from './limits';

/** Only size violations proven to be rejected before contact storage. Never mutates a retry. */
export function contactSizeIssue(payload: Record<string, unknown>, encoded = JSON.stringify(payload)): 'summary' | 'body' | null {
  // parseContact validates the trimmed string, and ignores a report without explicit opt-in.
  if (payload.includeSummary === true && typeof payload.toolSummary === 'string' && payload.toolSummary.trim().length > CONTACT_SUMMARY_MAX_LENGTH) return 'summary';
  if (new TextEncoder().encode(encoded).length > CONTACT_BODY_MAX_BYTES) return 'body';
  return null;
}
