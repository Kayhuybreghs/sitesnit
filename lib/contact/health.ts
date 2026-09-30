import type { AppDatabase } from '../database-core';
import { CONTACT_MAIL_BUDGETS, CONTACT_SAFE_RETRY_MS } from './limits';

const HEARTBEAT_ID = 'system:contact-outbox-heartbeat';
const HEARTBEAT_ACTOR = 'system:contact-maintenance';
const HEARTBEAT_ACTION = 'outbox_drain_completed';

/** A successful authenticated background batch, not a visitor request or admin retry. */
export async function recordContactHeartbeat(db: AppDatabase, now = Date.now()) {
  await db.prepare(`INSERT INTO contact_admin_log(id,user_id,task_id,action,created_at) VALUES(?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET created_at=excluded.created_at WHERE contact_admin_log.created_at<excluded.created_at`)
    .bind(HEARTBEAT_ID, HEARTBEAT_ACTOR, 'contact-outbox', HEARTBEAT_ACTION, now).run();
}

/** Count the entire queue; an old failed task must not vanish behind the newest inquiries. */
export async function contactOperationalHealth(db: AppDatabase, now = Date.now()) {
  const counts = await db.prepare(`SELECT
    SUM(CASE WHEN state IN ('pending','retryable_failed') AND next_attempt_at<=? THEN 1 ELSE 0 END) AS due,
    MIN(CASE WHEN state IN ('pending','retryable_failed') AND next_attempt_at<=? THEN next_attempt_at ELSE NULL END) AS oldest_due_at,
    SUM(CASE WHEN state='processing' AND (lease_until IS NULL OR lease_until<=?) THEN 1 ELSE 0 END) AS stalled,
    SUM(CASE WHEN state IN ('delivery_unknown','permanent_failed') THEN 1 ELSE 0 END) AS review,
    SUM(CASE WHEN delivery_state IN ('bounced','complained','failed') THEN 1 ELSE 0 END) AS delivery_failed,
    SUM(CASE WHEN state IN ('pending','retryable_failed','processing') AND first_attempt_at IS NOT NULL AND first_attempt_at<=? THEN 1 ELSE 0 END) AS retry_window_risk,
    SUM(CASE WHEN state IN ('pending','retryable_failed','processing') AND error_code='mail_budget' THEN 1 ELSE 0 END) AS budget_blocked,
    SUM(CASE WHEN state IN ('pending','retryable_failed','processing') AND error_code IN ('mail_not_configured','provider_configuration') THEN 1 ELSE 0 END) AS configuration_blocked
    FROM contact_outbox`).bind(now, now, now, now - CONTACT_SAFE_RETRY_MS + 3600000)
    .first<Record<string, number | null>>();
  const heartbeat = await db.prepare('SELECT created_at FROM contact_admin_log WHERE id=? AND user_id=? AND action=?')
    .bind(HEARTBEAT_ID, HEARTBEAT_ACTOR, HEARTBEAT_ACTION).first<{ created_at: number }>();
  const lastBackgroundAt = heartbeat ? Number(heartbeat.created_at) : null;
  const date = new Date(now).toISOString();
  const budgets = [];
  for (const { table, label, daily, monthly } of CONTACT_MAIL_BUDGETS) {
    const periods = (await db.prepare(`SELECT period,count FROM ${table} WHERE period IN (?,?)`)
      .bind(date.slice(0, 10), date.slice(0, 7)).all<{ period: string; count: number }>()).results;
    budgets.push({ label, daily: { used: Number(periods.find(p => p.period === date.slice(0, 10))?.count ?? 0), limit: daily },
      monthly: { used: Number(periods.find(p => p.period === date.slice(0, 7))?.count ?? 0), limit: monthly } });
  }
  return {
    due: Number(counts?.due ?? 0), oldestDueAt: counts?.oldest_due_at == null ? null : Number(counts.oldest_due_at),
    stalled: Number(counts?.stalled ?? 0), review: Number(counts?.review ?? 0), deliveryFailed: Number(counts?.delivery_failed ?? 0),
    retryWindowRisk: Number(counts?.retry_window_risk ?? 0), budgetBlocked: Number(counts?.budget_blocked ?? 0),
    configurationBlocked: Number(counts?.configuration_blocked ?? 0), lastBackgroundAt,
    heartbeatState: lastBackgroundAt === null ? 'missing' : now - lastBackgroundAt >= CONTACT_SAFE_RETRY_MS ? 'stale' : 'recorded',
    budgets,
  };
}
