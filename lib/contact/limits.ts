/** Existing safety and application budgets, shared by processing and admin diagnostics. */
export const CONTACT_SAFE_RETRY_MS = 23 * 60 * 60 * 1000;
export const CONTACT_MAIL_BUDGETS = [
  { table: 'contact_mail_usage', label: 'Contactmail', daily: 60, monthly: 1800 },
  { table: 'hub_mail_usage', label: 'Gedeeld met accountmail', daily: 90, monthly: 2800 },
] as const;
/** Existing contact contract; browser-safe and free of server dependencies. */
export const CONTACT_SUMMARY_MAX_LENGTH = 12000;
export const CONTACT_BODY_MAX_BYTES = 64000;
