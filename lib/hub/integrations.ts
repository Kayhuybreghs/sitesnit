/** Server-only integration orchestration. Never import from client components. */
import { createHash, createPrivateKey, sign } from "node:crypto";
import { fetchGa4 } from "./providers/ga4";
import { fetchSearchConsole } from "./providers/search-console";
import { fetchVercelDeployments } from "./providers/vercel";
import { PROVIDER_TTL_MS } from "./providers/cache";
import { record, TokenResolutionError, validPeriod, type Period, type ProviderResult, type Source } from "./providers/common";

export type IntegrationSettings = { credentialRef: string; propertyId?: string; siteUrl?: string; projectId?: string; teamId?: string; period?: Period };
export type SiteProviderConfig = { siteId: string; provider: Source; enabled?: boolean; config: IntegrationSettings };
export type GoogleCredential = { kind: "google-service-account"; allowedSites: string[]; clientEmail: string; privateKey: string; privateKeyId?: string };
export type VercelCredential = { kind: "vercel-token"; allowedSites: string[]; token: string };
export type IntegrationCredential = GoogleCredential | VercelCredential;
export type CredentialResolver = (siteId: string, credentialRef: string) => Promise<IntegrationCredential | null>;
export type IntegrationSnapshot = {
  siteId: string; provider: Source; configFingerprint: string; period: Period | null;
  attemptedAt: string; nextAttemptAt: string; reports: Record<string, ProviderResult<unknown>>;
  staleReports: string[]; refreshCodes: Record<string, string>;
};
export type IntegrationStore = {
  read: (siteId: string, provider: Source) => Promise<IntegrationSnapshot | null>;
  write: (snapshot: IntegrationSnapshot) => Promise<void>;
  /** Must serialize across processes, recheck the snapshot inside the lock, and release on error. */
  withLock: <T>(siteId: string, provider: Source, work: () => Promise<T>) => Promise<T>;
};
export type IntegrationDependencies = {
  fetch: typeof globalThis.fetch; resolveCredential: CredentialResolver; now?: () => Date;
  /** Reuse a resolver instance to cache short-lived OAuth tokens in this process. */
  googleTokens?: ReturnType<typeof createGoogleTokenResolver>;
  ttlMs?: Partial<Record<Source, number>>;
};

const scopes = { ga4: "https://www.googleapis.com/auth/analytics.readonly", "search-console": "https://www.googleapis.com/auth/webmasters.readonly" } as const;
const googleTokenEndpoint = "https://oauth2.googleapis.com/token";
const providers: Source[] = ["ga4", "search-console", "vercel"];
const reportNames: Record<Source, string[]> = { ga4: ["totals", "daily", "channels", "sources", "monthly", "landingPages", "devices", "countries", "events"], "search-console": ["totals", "daily", "queries", "pages"], vercel: ["deployments"] };
const safeId = (value: unknown): value is string => typeof value === "string" && /^[A-Za-z0-9_-]{1,160}$/.test(value);
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

/** Parse server-secret JSON without ever returning its source or values in errors. */
export function createEnvCredentialResolver(serverJson: string | undefined): CredentialResolver {
  let records: Record<string, unknown> = {};
  if (serverJson) { try { records = record(JSON.parse(serverJson)); } catch { throw new Error("Hub secret configuration is invalid"); } }
  return async (siteId, credentialRef) => {
    if (!safeId(siteId) || !safeId(credentialRef) || !Object.hasOwn(records, credentialRef)) return null;
    try {
      const item = record(records[credentialRef]);
      if (!Array.isArray(item.allowedSites) || !item.allowedSites.every(safeId) || !item.allowedSites.includes(siteId)) return null;
      if (item.kind === "vercel-token" && typeof item.token === "string" && item.token.length > 0 && item.token.length <= 8192 && !/[\r\n]/.test(item.token)) return { kind: item.kind, allowedSites: [...item.allowedSites], token: item.token };
      if (item.kind === "google-service-account" && typeof item.clientEmail === "string" && /^[^\s@]+@[^\s@]+\.gserviceaccount\.com$/.test(item.clientEmail) && typeof item.privateKey === "string" && item.privateKey.length < 32768 && (item.privateKeyId === undefined || safeId(item.privateKeyId))) return { kind: item.kind, allowedSites: [...item.allowedSites], clientEmail: item.clientEmail, privateKey: item.privateKey, ...(item.privateKeyId ? { privateKeyId: item.privateKeyId } : {}) };
    } catch { /* Invalid or unauthorized secret entries behave as not configured. */ }
    return null;
  };
}

/** Reads only safe settings from a server-owned config_json column, never credentials. */
export function parseIntegrationConfig(siteId: string, provider: Source, configJson: string): SiteProviderConfig {
  if (!safeId(siteId) || !providers.includes(provider)) throw new Error("Invalid Hub integration configuration");
  try {
    const raw = record(JSON.parse(configJson));
    const allowed = ["credentialRef", "propertyId", "siteUrl", "projectId", "teamId", "period", "enabled"];
    if (Object.keys(raw).some(key => !allowed.includes(key)) || !safeId(raw.credentialRef)) throw new Error();
    const config: IntegrationSettings = { credentialRef: raw.credentialRef };
    for (const key of ["propertyId", "siteUrl", "projectId", "teamId"] as const) {
      if (raw[key] !== undefined) { if (typeof raw[key] !== "string" || raw[key].length > 2048) throw new Error(); config[key] = raw[key]; }
    }
    if (raw.period !== undefined) { const period = record(raw.period); if (typeof period.startDate !== "string" || typeof period.endDate !== "string" || !validPeriod({ startDate: period.startDate, endDate: period.endDate })) throw new Error(); config.period = { startDate: period.startDate, endDate: period.endDate }; }
    if (raw.enabled !== undefined && typeof raw.enabled !== "boolean") throw new Error();
    return { siteId, provider, config, enabled: raw.enabled !== false };
  } catch { throw new Error("Invalid Hub integration configuration"); }
}

/** Google documented RS256 JWT-bearer exchange. No user impersonation or configurable endpoint/scope. */
export function createGoogleTokenResolver(deps: { fetch: typeof globalThis.fetch; now?: () => Date }) {
  const cache = new Map<string, { token: string; expiresAt: number }>();
  const pending = new Map<string, Promise<string>>();
  return async (credential: GoogleCredential, source: "ga4" | "search-console"): Promise<string> => {
    const scope = scopes[source];
    if (!scope) throw new TokenResolutionError("authentication");
    const key = hash(JSON.stringify([credential.clientEmail, credential.privateKey, scope]));
    const nowMs = (deps.now?.() ?? new Date()).getTime(), current = cache.get(key);
    if (current && current.expiresAt > nowMs) return current.token;
    const active = pending.get(key); if (active) return active;
    const exchange = async () => {
      try {
        const privateKey = createPrivateKey(credential.privateKey);
        if (privateKey.asymmetricKeyType !== "rsa" || (privateKey.asymmetricKeyDetails?.modulusLength ?? 0) < 2048) throw new Error();
        const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
        const issuedAt = Math.floor(nowMs / 1000);
        const unsigned = `${encode({ alg: "RS256", typ: "JWT", ...(credential.privateKeyId ? { kid: credential.privateKeyId } : {}) })}.${encode({ iss: credential.clientEmail, scope, aud: googleTokenEndpoint, iat: issuedAt, exp: issuedAt + 300 })}`;
        const assertion = `${unsigned}.${sign("RSA-SHA256", Buffer.from(unsigned), privateKey).toString("base64url")}`;
        let response: Response;
        try { response = await deps.fetch(googleTokenEndpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }).toString(), redirect: "error", cache: "no-store", signal: AbortSignal.timeout(15_000) }); }
        catch { throw new TokenResolutionError("network"); }
        if (!response.ok) throw new TokenResolutionError(response.status === 429 ? "quota" : response.status >= 500 ? "provider" : "authentication");
        const body = record(await response.json());
        if (typeof body.access_token !== "string" || !body.access_token || body.access_token.length > 16384 || /[\r\n]/.test(body.access_token) || body.token_type !== "Bearer" || typeof body.expires_in !== "number" || !Number.isFinite(body.expires_in) || body.expires_in < 60) throw new Error();
        if (body.scope !== undefined && body.scope !== scope) throw new Error();
        // Keep at most five minutes locally and expire a minute before the provider does.
        cache.set(key, { token: body.access_token, expiresAt: nowMs + Math.min(300, body.expires_in - 60) * 1000 });
        for (const [cacheKey, entry] of cache) if (entry.expiresAt <= nowMs) cache.delete(cacheKey);
        return body.access_token;
      } catch (error) { throw error instanceof TokenResolutionError ? error : new TokenResolutionError("authentication"); }
    };
    const work = exchange(); pending.set(key, work);
    try { return await work; } finally { pending.delete(key); }
  };
}

function defaultPeriod(now: Date): Period {
  // Dates are labels; each provider interprets them in its own reported time zone.
  // Two-day lag avoids asking for an incomplete 'today' in any standard property time zone.
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 2 * 86_400_000);
  return { startDate: new Date(end.getTime() - 27 * 86_400_000).toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10) };
}

/** A read checks the same assignment identity as a sync, including its reporting period. */
export function integrationIdentity(siteId:string,provider:Source,config:SiteProviderConfig|undefined,now=new Date()){
  const settings=config?.config;
  const period=provider==='vercel'?null:settings?.period??defaultPeriod(now);
  const fingerprint=hash(JSON.stringify(['reports-v2',provider==='ga4'?now.toISOString().slice(0,7):null,siteId,provider,config?.enabled!==false,settings?.credentialRef??null,settings?.propertyId??null,settings?.siteUrl??null,settings?.projectId??null,settings?.teamId??null,period]));
  return {period,fingerprint};
}

function emptyReports(source: Source, period: Period | null, now: Date, code: "not-configured" | "invalid-config" | "authentication" | "provider") {
  return Object.fromEntries(reportNames[source].map(name => [name, { state: code === "not-configured" ? "unavailable" : "error", source, period, timeZone: source === "search-console" ? "America/Los_Angeles" : source === "vercel" ? "UTC" : null, fetchedAt: now.toISOString(), data: null, code, warnings: [] } satisfies ProviderResult<unknown>]));
}

/** Call only after server-side authorization, from a sync job/admin action; page reads use snapshots. */
export async function syncSiteProviders({ siteId, configs, store, deps }: { siteId: string; configs: SiteProviderConfig[]; store: IntegrationStore; deps: IntegrationDependencies }): Promise<Record<Source, IntegrationSnapshot>> {
  if (!safeId(siteId) || configs.some(item => item.siteId !== siteId || !providers.includes(item.provider)) || new Set(configs.map(item => item.provider)).size !== configs.length) throw new Error("Invalid Hub integration scope");
  const googleTokens = deps.googleTokens ?? createGoogleTokenResolver(deps);
  const entries = await Promise.all(providers.map(async provider => {
    const config = configs.find(item => item.provider === provider), now = deps.now?.() ?? new Date();
    const settings = config?.config;
    const {period,fingerprint}=integrationIdentity(siteId,provider,config,now);
    const blank = (code: "not-configured" | "invalid-config" | "authentication" | "provider"): IntegrationSnapshot => ({ siteId, provider, configFingerprint: fingerprint, period, attemptedAt: now.toISOString(), nextAttemptAt: new Date(now.getTime() + 300_000).toISOString(), reports: emptyReports(provider, period, now, code), staleReports: [], refreshCodes: {} });
    try {
      return [provider, await store.withLock(siteId, provider, async () => {
        // Check credential presence before cache reuse: removing a secret cannot expose cached data.
        let credential: IntegrationCredential | null = null;
        if (settings?.credentialRef && config?.enabled !== false) {
          try { credential = await deps.resolveCredential(siteId, settings.credentialRef); } catch { const failed = blank("authentication"); await store.write(failed); return failed; }
        }
        if (!credential || !credential.allowedSites.includes(siteId) || (provider === "vercel" ? credential.kind !== "vercel-token" : credential.kind !== "google-service-account")) { const missing = blank("not-configured"); await store.write(missing); return missing; }
        const previous = await store.read(siteId, provider);
        const matching = previous?.siteId === siteId && previous.provider === provider && previous.configFingerprint === fingerprint ? previous : null;
        if (matching && Date.parse(matching.nextAttemptAt) > now.getTime() && Date.parse(matching.attemptedAt) <= now.getTime()) return matching;
        const tokenResolver = async () => credential.kind === "vercel-token" ? credential.token : googleTokens(credential, provider as "ga4" | "search-console");
        const providerDeps = { fetch: deps.fetch, getAccessToken: tokenResolver, now: deps.now };
        let reports: Record<string, ProviderResult<unknown>>;
        if (provider === "ga4") reports = await fetchGa4({ propertyId: settings?.propertyId ?? "", period: period! }, providerDeps);
        else if (provider === "search-console") reports = await fetchSearchConsole({ siteUrl: settings?.siteUrl ?? "", period: period! }, providerDeps);
        else reports = { deployments: await fetchVercelDeployments({ projectId: settings?.projectId ?? "", teamId: settings?.teamId }, providerDeps) };
        const staleReports: string[] = [], refreshCodes: Record<string, string> = {};
        let failure = false;
        for (const [name, current] of Object.entries(reports)) {
          if (current.state === "error") {
            failure = true; refreshCodes[name] = current.code ?? "provider";
            const old = matching?.reports[name];
            // Authentication revocation must not leave a stale authorized-looking result.
            if (old?.state === "ready" && current.code !== "authentication" && current.code !== "invalid-config") { reports[name] = old; staleReports.push(name); }
          }
        }
        const configuredTtl = deps.ttlMs?.[provider] ?? PROVIDER_TTL_MS[provider];
        const ttl = Number.isFinite(configuredTtl) ? Math.max(60_000, configuredTtl) : PROVIDER_TTL_MS[provider];
        const snapshot: IntegrationSnapshot = { siteId, provider, configFingerprint: fingerprint, period, attemptedAt: now.toISOString(), nextAttemptAt: new Date(now.getTime() + (failure ? Math.min(ttl, 300_000) : ttl)).toISOString(), reports, staleReports, refreshCodes };
        await store.write(snapshot);
        return snapshot;
      })] as const;
    } catch { return [provider, blank("provider")] as const; }
  }));
  return Object.fromEntries(entries) as Record<Source, IntegrationSnapshot>;
}
