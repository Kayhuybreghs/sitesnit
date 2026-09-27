/** Additive migration: existing inquiries are retained and never mailed retroactively. */
export const contactSchema = `
CREATE TABLE IF NOT EXISTS contact_requests (
 inquiry_id TEXT PRIMARY KEY REFERENCES inquiries(id) ON DELETE CASCADE,
 payload_hash TEXT NOT NULL,
 context_json TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS contact_outbox (
 id TEXT PRIMARY KEY,
 inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
 kind TEXT NOT NULL CHECK(kind IN ('owner','confirmation')),
 payload_json TEXT NOT NULL,
 state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','processing','provider_accepted','retryable_failed','permanent_failed','delivery_unknown')),
 provider_id TEXT,
 attempts INTEGER NOT NULL DEFAULT 0,
 first_attempt_at BIGINT,
 next_attempt_at BIGINT NOT NULL,
 lease_until BIGINT,
 claim_id TEXT,
 error_code TEXT,
 delivery_state TEXT,
 delivery_at BIGINT,
 created_at BIGINT NOT NULL,
 updated_at BIGINT NOT NULL,
 UNIQUE(inquiry_id,kind)
);
CREATE INDEX IF NOT EXISTS contact_outbox_due ON contact_outbox(state,next_attempt_at);
CREATE INDEX IF NOT EXISTS contact_outbox_provider ON contact_outbox(provider_id);
CREATE TABLE IF NOT EXISTS contact_mail_usage (period TEXT PRIMARY KEY, count INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS hub_mail_usage (period TEXT PRIMARY KEY, count INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS contact_webhook_events (id TEXT PRIMARY KEY, provider_id TEXT NOT NULL, delivery_state TEXT NOT NULL, event_at BIGINT NOT NULL, received_at BIGINT NOT NULL);
CREATE INDEX IF NOT EXISTS contact_webhook_provider ON contact_webhook_events(provider_id,event_at);
CREATE TABLE IF NOT EXISTS contact_admin_log (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, task_id TEXT NOT NULL, action TEXT NOT NULL, created_at BIGINT NOT NULL);
`;
