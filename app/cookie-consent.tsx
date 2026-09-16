"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CONSENT_KEY, CONSENT_MAX_AGE_DAYS, CONSENT_MAX_AGE_MS, CONSENT_SETTINGS_EVENT,
  analyticsConfigured, analyticsConfig, analyticsCookieNames, cookieDomains,
  makeConsent, parseConsent, safeAnalyticsPage, validMeasurementId,
  type ConsentChoice,
} from "../lib/consent";
import "./cookie-consent.css";

type Gtag = (...args: unknown[]) => void;
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: Gtag;
  sitesnitAnalyticsId?: string;
  [key: `ga-disable-${string}`]: boolean | undefined;
};
const SCRIPT_ID = "sitesnit-consented-analytics";

function readChoice(id: string): ConsentChoice | null {
  try { return parseConsent(localStorage.getItem(CONSENT_KEY), id); }
  catch { return null; }
}

function clearAnalyticsCookies() {
  const domains = cookieDomains(window.location.hostname);
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const paths = ["/", ...pathParts.map((_, index) => "/" + pathParts.slice(0, index + 1).join("/"))];
  for (const name of analyticsCookieNames(document.cookie)) {
    for (const path of paths) {
      const removal = `${name}=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}; SameSite=Lax`;
      document.cookie = removal;
      for (const domain of domains) document.cookie = `${removal}; domain=${domain}`;
    }
  }
}

function stopAnalytics(id: string): boolean {
  const analyticsWindow = window as unknown as AnalyticsWindow;
  const activeId = analyticsWindow.sitesnitAnalyticsId;
  if (validMeasurementId(id)) analyticsWindow[`ga-disable-${id}`] = true;
  if (activeId) analyticsWindow[`ga-disable-${activeId}`] = true;
  const loaded = Boolean(activeId || document.getElementById(SCRIPT_ID));
  document.getElementById(SCRIPT_ID)?.remove();
  clearAnalyticsCookies();
  return loaded;
}

export function CookieSettingsButton({ className = "", children = "Cookie-instellingen" }: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <button type="button" className={`cookie-settings-trigger ${className}`} onClick={() => {
    window.dispatchEvent(new Event(CONSENT_SETTINGS_EVENT));
  }}>{children}</button>;
}

/** Google Enhanced Measurement and user-provided-data collection must be disabled before verification is set. */
export function CookieConsent({ measurementId = "", privacyConfigurationVerified = false, publicPaths = ["/"] }: {
  measurementId?: string;
  privacyConfigurationVerified?: boolean;
  publicPaths?: readonly string[];
}) {
  const configured = analyticsConfigured(measurementId, privacyConfigurationVerified);
  const pathname = usePathname();
  const [choice, setChoice] = useState<ConsentChoice | null>(null);
  const [ready, setReady] = useState(false);
  const [banner, setBanner] = useState(false);
  const [settings, setSettings] = useState(false);
  const [draftAnalytics, setDraftAnalytics] = useState(false);
  const [storageWarning, setStorageWarning] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const lastPage = useRef("");
  const allowed = configured && choice?.analytics === true && choice.measurementId === measurementId;

  useEffect(() => {
    const stored = configured ? readChoice(measurementId) : null;
    if (!stored?.analytics) stopAnalytics(measurementId);
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setChoice(stored);
      setBanner(configured && !stored);
      setReady(true);
    });
    return () => { active = false; };
  }, [configured, measurementId]);

  useEffect(() => {
    const openSettings = () => {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setDraftAnalytics(allowed);
      setSettings(true);
    };
    window.addEventListener(CONSENT_SETTINGS_EVENT, openSettings);
    return () => window.removeEventListener(CONSENT_SETTINGS_EVENT, openSettings);
  }, [allowed]);

  useEffect(() => {
    if (!settings) return;
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, [settings]);

  function closeSettings() {
    setSettings(false);
    requestAnimationFrame(() => returnFocus.current?.focus({ preventScroll: true }));
  }

  function save(analytics: boolean) {
    if (!configured) { closeSettings(); return; }
    const next = makeConsent(analytics, measurementId);
    let persisted = true;
    try { localStorage.setItem(CONSENT_KEY, JSON.stringify(next)); }
    catch { persisted = false; }
    // Disable collection synchronously, before React updates or a possible reload.
    const wasLoaded = !analytics && stopAnalytics(measurementId);
    setChoice(next);
    setBanner(false);
    setStorageWarning(!persisted);
    closeSettings();
    if (wasLoaded) window.location.reload();
  }

  useEffect(() => {
    if (!ready || !allowed) return;
    const page = safeAnalyticsPage(window.location.href, publicPaths, document.referrer);
    if (!page) {
      (window as unknown as AnalyticsWindow)[`ga-disable-${measurementId}`] = true;
      lastPage.current = "";
      return;
    }
    const analyticsWindow = window as unknown as AnalyticsWindow;
    analyticsWindow[`ga-disable-${measurementId}`] = false;
    if (!analyticsWindow.sitesnitAnalyticsId) {
      analyticsWindow.dataLayer = analyticsWindow.dataLayer || [];
      analyticsWindow.gtag = function gtag() {
        // Google expects an Arguments object, not a spread array.
        // eslint-disable-next-line prefer-rest-params -- Keep the official gtag queue format.
        analyticsWindow.dataLayer?.push(arguments);
      };
      const gtag = analyticsWindow.gtag;
      gtag("consent", "default", {
        analytics_storage: "granted", ad_storage: "denied",
        ad_user_data: "denied", ad_personalization: "denied",
      });
      gtag("set", { ...page, allow_google_signals: false, allow_ad_personalization_signals: false });
      gtag("js", new Date());
      gtag("config", measurementId, analyticsConfig(page));
      analyticsWindow.sitesnitAnalyticsId = measurementId;
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      script.referrerPolicy = "no-referrer";
      document.head.appendChild(script);
    }
    if (lastPage.current !== page.page_location) {
      analyticsWindow.gtag?.("set", page);
      analyticsWindow.gtag?.("event", "page_view", { ...page, send_to: measurementId });
      lastPage.current = page.page_location;
    }
  }, [ready, allowed, measurementId, pathname, publicPaths]);

  useEffect(() => {
    if (!ready || !choice) return;
    const expire = () => {
      // Also re-check when returning to a long-lived tab.
      if (Date.now() < choice.decidedAt + CONSENT_MAX_AGE_MS) return;
      const wasLoaded = stopAnalytics(measurementId);
      setChoice(null);
      setBanner(configured);
      if (wasLoaded) window.location.reload();
    };
    // Cap each timer and schedule the exact remaining duration when expiry is close.
    let timer: number;
    const schedule = () => {
      const remaining = choice.decidedAt + CONSENT_MAX_AGE_MS - Date.now();
      if (remaining <= 0) { expire(); return; }
      timer = window.setTimeout(schedule, Math.min(remaining, 24 * 60 * 60 * 1000));
    };
    schedule();
    document.addEventListener("visibilitychange", expire);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", expire); };
  }, [ready, choice, configured, measurementId]);

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== CONSENT_KEY && event.key !== null) return;
      const next = configured ? readChoice(measurementId) : null;
      const wasLoaded = !next?.analytics && stopAnalytics(measurementId);
      setChoice(next);
      setBanner(configured && !next);
      if (wasLoaded) window.location.reload();
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [configured, measurementId]);

  return <>
    {ready && configured && banner && !settings && <section className="cookie-banner" aria-labelledby="cookie-banner-title">
      <div className="cookie-banner-copy">
        <span className="cookie-eyebrow">Jij kiest</span>
        <h2 id="cookie-banner-title">Mogen we je bezoek meten?</h2>
        <p>Met jouw toestemming gebruikt Sitesnit Google Analytics om te zien welke pagina’s helpen. Je antwoorden en contactgegevens sturen we daar niet naartoe. We gebruiken geen advertentiecookies.</p>
        <p className="cookie-small">Noodzakelijke opslag houdt je toolvoortgang en cookiekeuze bij. <a href="/cookies">Lees over cookies</a>.</p>
      </div>
      <div className="cookie-banner-actions">
        <button type="button" className="cookie-choice-button" onClick={() => save(false)}>Alleen noodzakelijk</button>
        <button type="button" className="cookie-choice-button" onClick={() => save(true)}>Analyse toestaan</button>
        <CookieSettingsButton className="cookie-details-button">Zelf instellen</CookieSettingsButton>
      </div>
    </section>}

    {storageWarning && <p className="cookie-storage-notice" role="status">Je browser bewaart je cookiekeuze niet. Je keuze geldt voor deze pagina; bij een volgend bezoek vragen we opnieuw. <button type="button" onClick={() => setStorageWarning(false)}>Sluiten</button></p>}

    <dialog ref={dialog} className="cookie-dialog" aria-labelledby="cookie-dialog-title" onCancel={event => { event.preventDefault(); closeSettings(); }}>
      <div className="cookie-dialog-heading">
        <span className="cookie-eyebrow">Sitesnit · Privacy</span>
        <button type="button" className="cookie-close" aria-label="Cookie-instellingen sluiten" onClick={closeSettings}>×</button>
      </div>
      <h2 id="cookie-dialog-title">Jouw cookiekeuze.</h2>
      <p>Je kunt je keuze altijd aanpassen via de footer. De website en alle tools werken ook zonder analyse.</p>
      <div className="cookie-setting-row">
        <div><h3>Noodzakelijke opslag</h3><p>Voor je cookiekeuze en het bewaren van je voortgang in de tools, op dit apparaat.</p></div>
        <span className="cookie-required">Altijd actief</span>
      </div>
      <div className="cookie-setting-row">
        <div><h3>Analyse met Google Analytics</h3><p>{configured ? "Meet bezochte pagina’s. Geen advertentieprofielen, ingevulde antwoorden of contactgegevens." : "Analyse staat uit. Er worden geen Google Analytics-scripts geladen of analytische cookies geplaatst."}</p></div>
        {configured ? <label className="cookie-checkbox"><input type="checkbox" checked={draftAnalytics} onChange={event => setDraftAnalytics(event.target.checked)} /><span>Analyse toestaan</span></label> : <span className="cookie-required">Niet actief</span>}
      </div>
      <p className="cookie-small">{configured ? `We bewaren je keuze maximaal ${CONSENT_MAX_AGE_DAYS} dagen. Bij intrekken verwijderen we de Analytics-cookies en herladen we de pagina om de meting te stoppen. ` : "Je hoeft geen toestemming te geven voor analyse zolang die uitstaat. "}<a href="/privacy">Privacyverklaring</a> · <a href="/cookies">Cookie-uitleg</a></p>
      <div className="cookie-dialog-actions">
        {configured ? <><button type="button" className="cookie-choice-button" onClick={() => save(false)}>Alleen noodzakelijk</button><button type="button" className="cookie-choice-button" onClick={() => save(draftAnalytics)}>Keuze opslaan</button></> : <button type="button" className="cookie-choice-button" onClick={closeSettings}>Sluiten</button>}
      </div>
    </dialog>
  </>;
}
