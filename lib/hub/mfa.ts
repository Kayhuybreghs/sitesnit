import type { AppDatabase } from '../database-core';

/** Add before enabling auth. Separate from Better Auth's generated schema. */
export const hubMfaSchema = `
CREATE TABLE IF NOT EXISTS hub_mfa_session_proofs (
  session_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  verified_at BIGINT NOT NULL,
  expires_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS hub_mfa_proofs_user ON hub_mfa_session_proofs(user_id);
`;

export type HubSessionBinding = { id: string; userId: string; expiresAt: Date };

/** Call only after Better Auth has successfully verified a supported second factor.
 * Re-read the actual session, preventing a proof for a revoked/replaced session.
 */
export async function recordHubMfaProof(db: AppDatabase, session: HubSessionBinding, now = Date.now()): Promise<void> {
  const expiresAt = session.expiresAt.getTime();
  if (!session.id || !session.userId || !Number.isSafeInteger(expiresAt) || expiresAt <= now) throw new Error('MFA-sessie is niet geldig.');
  const stored = await db.prepare(
    'INSERT INTO hub_mfa_session_proofs(session_id,user_id,verified_at,expires_at) SELECT s.id,s."userId",?,? FROM hub_auth_session s INNER JOIN hub_auth_user u ON u.id=s."userId" WHERE s.id=? AND s."userId"=? AND u."twoFactorEnabled"=TRUE AND u."emailVerified"=TRUE ON CONFLICT(session_id) DO UPDATE SET verified_at=excluded.verified_at,expires_at=excluded.expires_at RETURNING session_id',
  ).bind(now, expiresAt, session.id, session.userId).first();
  if (!stored) throw new Error('MFA-sessie is niet geldig.');
}

/** userId/sessionId must come from server-verified getSession(), never browser input. */
export async function hasHubMfaProof(db: AppDatabase, userId: string, sessionId: string | undefined, now = Date.now()): Promise<boolean> {
  if (!sessionId) return false;
  const proof=await db.prepare(
    'SELECT s."expiresAt" AS session_expires_at FROM hub_mfa_session_proofs p INNER JOIN hub_auth_session s ON s.id=p.session_id AND s."userId"=p.user_id INNER JOIN hub_auth_user u ON u.id=p.user_id WHERE p.user_id=? AND p.session_id=? AND p.expires_at>? AND u."twoFactorEnabled"=TRUE AND u."emailVerified"=TRUE',
  ).bind(userId, sessionId, now).first<{session_expires_at:Date|string|number}>();
  if(!proof)return false;
  const expires=proof.session_expires_at;
  const expiresAt=expires instanceof Date?expires.getTime():typeof expires==='number'?expires:Date.parse(expires);
  return Number.isFinite(expiresAt)&&expiresAt>now;
}
