import test from "node:test";
import assert from "node:assert/strict";
import {
  CONSENT_MAX_AGE_MS, analyticsConfigured, analyticsConfig, analyticsCookieNames,
  cookieDomains, makeConsent, parseConsent, safeAnalyticsPage, safeAnalyticsReferrer,
  validMeasurementId,
} from "../lib/consent.ts";

const id = "G-TEST1234";
const now = 1789444800000;

test("analytics cannot activate with only an ID, no ID, or malformed IDs", () => {
  assert.equal(analyticsConfigured(id, true), true);
  assert.equal(analyticsConfigured(id, false), false);
  for (const value of [undefined, null, "", "G-test", "G-123&send_data=yes", "AW-123", "G-", " G-123", "G-123 "]) {
    assert.equal(validMeasurementId(value), false);
    assert.equal(analyticsConfigured(value, true), false);
  }
});

test("accepted and rejected choices are remembered equally for at most 180 days", () => {
  for (const analytics of [false, true]) {
    const choice = makeConsent(analytics, id, now);
    const raw = JSON.stringify(choice);
    assert.deepEqual(parseConsent(raw, id, now), choice);
    assert.deepEqual(parseConsent(raw, id, now + CONSENT_MAX_AGE_MS - 1), choice);
    assert.equal(parseConsent(raw, id, now + CONSENT_MAX_AGE_MS), null);
    assert.equal(parseConsent(raw, "G-NEWPROPERTY", now), null);
  }
});

test("corrupt, future, wrong-version or incomplete consent never grants analytics", () => {
  for (const raw of [null, "invalid", "[]", "null", "true", "{}",
    JSON.stringify({ ...makeConsent(true, id, now), version: 0 }),
    JSON.stringify({ ...makeConsent(true, id, now), analytics: "true" }),
    JSON.stringify(makeConsent(true, id, now + 1)),
    JSON.stringify({ ...makeConsent(true, id, now), decidedAt: null })]) {
    assert.equal(parseConsent(raw, id, now), null, String(raw));
  }
});

test("only public routes are measured; URL inputs, hashes and referring paths cannot leak", () => {
  const page = safeAnalyticsPage("https://sitesnit.nl/contact?email=private@example.nl&summary=private-answer#naam", ["/", "/contact"], "https://example.org/customer/private?token=secret#info");
  assert.deepEqual(page, {
    page_location: "https://sitesnit.nl/contact",
    page_title: "Sitesnit · /contact",
    page_referrer: "https://example.org/",
  });
  const serialized = JSON.stringify(analyticsConfig(page));
  for (const value of ["private", "secret", "naam", "summary", "email"]) assert.equal(serialized.includes(value), false);
  assert.equal(safeAnalyticsPage("https://sitesnit.nl/customer/private", ["/"]), null);
  assert.equal(safeAnalyticsPage("javascript:alert(1)", ["/"]), null);
  assert.equal(safeAnalyticsReferrer("not a URL"), "");
  assert.equal(safeAnalyticsReferrer("file:///C:/private/data"), "");
  assert.equal(safeAnalyticsReferrer("https://name:password@example.org/private"), "https://example.org/");
});

test("configuration turns off automatic page views, advertising and long-lived renewing cookies", () => {
  const config = analyticsConfig(safeAnalyticsPage("https://sitesnit.nl/", ["/"]));
  assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
  assert.equal(config.allow_ad_personalization_signals, false);
  assert.equal(config.cookie_expires, 180 * 24 * 60 * 60);
  assert.equal(config.cookie_update, false);
  assert.equal(config.cookie_domain, "none");
  assert.equal(config.cookie_flags, "SameSite=Lax;Secure");
  for (const name of ["user_id", "user_data", "email", "form_data"]) assert.equal(name in config, false);
});

test("withdrawal targets only analytics cookies and all applicable host/parent domains", () => {
  assert.deepEqual(analyticsCookieNames("_ga=abc; _ga_123=test; session=keep; _gid=x; _gat_test=x; _gac_a=x; consent=keep; _garden=keep"), ["_ga", "_ga_123", "_gid", "_gat_test", "_gac_a"]);
  assert.deepEqual(cookieDomains("www.sitesnit.nl"), ["www.sitesnit.nl", ".www.sitesnit.nl", "sitesnit.nl", ".sitesnit.nl"]);
  assert.deepEqual(cookieDomains("localhost"), []);
  assert.deepEqual(cookieDomains("127.0.0.1"), []);
});
