/** Consent is stored locally; it is never included in an analytics event. */
export const CONSENT_KEY = "sitesnit-cookie-consent-v1";
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE_DAYS = 180;
export const CONSENT_MAX_AGE_MS = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
export const CONSENT_SETTINGS_EVENT = "sitesnit:cookie-settings";

export type ConsentChoice = {
  version: typeof CONSENT_VERSION;
  analytics: boolean;
  decidedAt: number;
  measurementId: string;
};

export function validMeasurementId(value: unknown): value is string {
  return typeof value === "string" && /^G-[A-Z0-9]+$/.test(value);
}

/** Activation requires the separate, verified Google-property privacy settings. */
export function analyticsConfigured(id: unknown, privacyConfigurationVerified: boolean): boolean {
  return validMeasurementId(id) && privacyConfigurationVerified === true;
}

export function makeConsent(analytics: boolean, measurementId: string, now = Date.now()): ConsentChoice {
  return { version: CONSENT_VERSION, analytics, decidedAt: now, measurementId };
}

export function parseConsent(raw: string | null, measurementId: string, now = Date.now()): ConsentChoice | null {
  if (!raw || !validMeasurementId(measurementId)) return null;
  try {
    const choice: unknown = JSON.parse(raw);
    if (typeof choice !== "object" || choice === null) return null;
    const data = choice as Record<string, unknown>;
    if (data.version !== CONSENT_VERSION || typeof data.analytics !== "boolean" ||
      data.measurementId !== measurementId || typeof data.decidedAt !== "number" ||
      !Number.isFinite(data.decidedAt) || data.decidedAt > now ||
      now - data.decidedAt >= CONSENT_MAX_AGE_MS) return null;
    return makeConsent(data.analytics, measurementId, data.decidedAt);
  } catch {
    return null;
  }
}

export type AnalyticsPage = {
  page_location: string;
  page_title: string;
  page_referrer: string;
};

/** Only known public routes can be measured. Query, hash and document.title are deliberately unused. */
export function safeAnalyticsPage(href: string, publicPaths: readonly string[], referrer = ""): AnalyticsPage | null {
  try {
    const url = new URL(href);
    if (!["http:", "https:"].includes(url.protocol) || !publicPaths.includes(url.pathname)) return null;
    return {
      page_location: url.origin + url.pathname,
      page_title: url.pathname === "/" ? "Sitesnit" : "Sitesnit · " + url.pathname,
      page_referrer: safeAnalyticsReferrer(referrer),
    };
  } catch {
    return null;
  }
}

/** Referring sites can have private paths too: retain only the referring origin. */
export function safeAnalyticsReferrer(referrer: string): string {
  try {
    const url = new URL(referrer);
    return ["https:", "http:"].includes(url.protocol) ? url.origin + "/" : "";
  } catch {
    return "";
  }
}

export function analyticsConfig(page: AnalyticsPage) {
  return {
    ...page,
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: CONSENT_MAX_AGE_MS / 1000,
    cookie_update: false,
    cookie_domain: "none",
    cookie_path: "/",
    cookie_flags: "SameSite=Lax;Secure",
  };
}

export function analyticsCookieNames(cookieHeader: string): string[] {
  return cookieHeader.split(";").map(cookie => cookie.trim().split("=")[0])
    .filter(name => /^(_ga(?:_.+)?|_gid|_gat(?:_.+)?|_gac_.+)$/.test(name));
}

export function cookieDomains(hostname: string): string[] {
  if (!hostname || hostname === "localhost" || /^[\d.]+$/.test(hostname) || hostname.includes(":")) return [];
  const labels = hostname.split(".");
  return labels.slice(0, -1).flatMap((_, index) => {
    const domain = labels.slice(index).join(".");
    return [domain, "." + domain];
  });
}
