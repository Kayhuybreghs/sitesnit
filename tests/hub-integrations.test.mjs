import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync, verify } from "node:crypto";
import { createEnvCredentialResolver, createGoogleTokenResolver, parseIntegrationConfig, syncSiteProviders } from "../lib/hub/integrations.ts";

const pair = generateKeyPairSync("rsa", { modulusLength: 2048 });
const privateKey = pair.privateKey.export({ type: "pkcs8", format: "pem" });
const google = { kind: "google-service-account", allowedSites: ["site-a"], clientEmail: "hub@example.iam.gserviceaccount.com", privateKey, privateKeyId: "fixture-key" };
const vercel = { kind: "vercel-token", allowedSites: ["site-a"], token: "fake-vercel-token" };
const initialTime = new Date("2026-09-24T12:00:00Z");
const period = { startDate: "2026-08-01", endDate: "2026-08-31" };
const reply = (data, status = 200) => new Response(JSON.stringify(data), { status });
const googleConfig = { siteId: "site-a", provider: "ga4", config: { credentialRef: "google-a", propertyId: "123", period } };
const vercelConfig = { siteId: "site-a", provider: "vercel", config: { credentialRef: "vercel-a", projectId: "prj_123" } };

function memoryStore() {
  const data = new Map(), locks = new Map();
  return {
    data,
    read: async (siteId, provider) => structuredClone(data.get(`${siteId}:${provider}`) ?? null),
    write: async snapshot => { data.set(`${snapshot.siteId}:${snapshot.provider}`, structuredClone(snapshot)); },
    withLock: async (siteId, provider, work) => {
      const key = `${siteId}:${provider}`, previous = locks.get(key) ?? Promise.resolve();
      const next = previous.catch(() => {}).then(work); locks.set(key, next);
      try { return await next; } finally { if (locks.get(key) === next) locks.delete(key); }
    },
  };
}

function gaFixture(body) {
  return { dimensionHeaders: body.dimensions, metricHeaders: body.metrics.map(m => ({ ...m, type: "TYPE_INTEGER" })), rowCount: 1, metadata: { timeZone: "Europe/Amsterdam" }, rows: [{ dimensionValues: body.dimensions.map(d => ({ value: d.name === "date" ? "20260801" : d.name === "eventName" ? "tool_start" : "example" })), metricValues: body.metrics.map(() => ({ value: "17" })) }] };
}
function fixtures() {
  const requests = [];
  const fetch = async (url, init) => {
    requests.push({ url, init });
    if (url === "https://oauth2.googleapis.com/token") return reply({ access_token: "fake-google-access-token", token_type: "Bearer", expires_in: 3600 });
    if (url.includes("analyticsdata.googleapis.com")) return reply(gaFixture(JSON.parse(init.body)));
    if (url.includes("api.vercel.com")) return reply({ deployments: [{ uid: "dpl_example", projectId: "prj_123", state: "READY", target: "production", created: initialTime.getTime() }] });
    throw new Error("Unexpected fixture endpoint");
  };
  return { fetch, requests };
}
function deps(fetch, now = () => initialTime) {
  return { fetch, now, resolveCredential: async (_site, ref) => ref === "google-a" ? google : ref === "vercel-a" ? vercel : null };
}

test("Server-secret resolver denies unlisted sites, inherited keys and invalid secret types", async () => {
  const resolve = createEnvCredentialResolver(JSON.stringify({ "google-a": google, "vercel-a": vercel }));
  assert.equal((await resolve("site-a", "google-a")).kind, "google-service-account");
  assert.equal(await resolve("site-b", "google-a"), null);
  assert.equal(await resolve("site-a", "constructor"), null);
  assert.equal(await resolve("site-a", "missing"), null);
  assert.equal(await createEnvCredentialResolver(undefined)("site-a", "missing"), null);
  assert.throws(() => createEnvCredentialResolver("{secret-text"), error => !error.message.includes("secret-text"));
});

test("Stored integration config cannot contain plaintext tokens or unknown settings", () => {
  assert.deepEqual(parseIntegrationConfig("site-a", "ga4", JSON.stringify({ credentialRef: "google-a", propertyId: "123", period })), { ...googleConfig, enabled: true });
  assert.throws(() => parseIntegrationConfig("site-a", "ga4", JSON.stringify({ credentialRef: "google-a", token: "never-copy-this" })), error => !error.message.includes("never-copy-this"));
  assert.throws(() => parseIntegrationConfig("site-a", "ga4", JSON.stringify({ credentialRef: "google-a", period: { startDate: "2026-02-30", endDate: "2026-03-01" } })));
});

test("Google JWT uses verified RS256 signature, five-minute expiry and fixed readonly scope/audience", async () => {
  let calls = 0;
  const tokens = createGoogleTokenResolver({ now: () => initialTime, fetch: async (url, init) => {
    calls++;
    assert.equal(url, "https://oauth2.googleapis.com/token");
    assert.equal(init.redirect, "error");
    const body = new URLSearchParams(init.body), jwt = body.get("assertion");
    assert.equal(body.get("grant_type"), "urn:ietf:params:oauth:grant-type:jwt-bearer");
    const [header, claims, signature] = jwt.split(".");
    const payload = JSON.parse(Buffer.from(claims, "base64url"));
    assert.equal(JSON.parse(Buffer.from(header, "base64url")).alg, "RS256");
    assert.equal(payload.aud, url); assert.equal(payload.iss, google.clientEmail);
    assert.equal(payload.scope, "https://www.googleapis.com/auth/analytics.readonly");
    assert.equal(payload.exp - payload.iat, 300); assert.equal(payload.sub, undefined);
    assert.ok(verify("RSA-SHA256", Buffer.from(`${header}.${claims}`), pair.publicKey, Buffer.from(signature, "base64url")));
    return reply({ access_token: "short-lived-fixture", token_type: "Bearer", expires_in: 3600 });
  } });
  const values = await Promise.all([tokens(google, "ga4"), tokens(google, "ga4"), tokens(google, "ga4")]);
  assert.deepEqual(values, Array(3).fill("short-lived-fixture"));
  await tokens(google, "ga4"); assert.equal(calls, 1);
});

test("Google token cache expires early and separates scopes; errors never contain secrets", async () => {
  let time = initialTime, calls = 0;
  const tokens = createGoogleTokenResolver({ now: () => time, fetch: async () => { calls++; return reply({ access_token: "short-lived-fixture", token_type: "Bearer", expires_in: 3600 }); } });
  await tokens(google, "ga4"); await tokens(google, "search-console");
  assert.equal(calls, 2);
  time = new Date(initialTime.getTime() + 301_000); await tokens(google, "ga4"); assert.equal(calls, 3);
  const failed = createGoogleTokenResolver({ fetch: async () => { throw new Error(`secret=${privateKey}`); } });
  await assert.rejects(() => failed(google, "ga4"), { message: "Provider authentication failed", code: "network" });
  const overScoped = createGoogleTokenResolver({ fetch: async () => reply({ access_token: "secret", token_type: "Bearer", expires_in: 3600, scope: "https://www.googleapis.com/auth/analytics.edit" }) });
  await assert.rejects(() => overScoped(google, "ga4"), { message: "Provider authentication failed", code: "authentication" });
});

test("Credentialless sites have unavailable snapshots and make no provider requests", async () => {
  const store = memoryStore(); let calls = 0;
  const result = await syncSiteProviders({ siteId: "site-a", configs: [googleConfig], store, deps: { ...deps(async () => { calls++; throw new Error(); }), resolveCredential: async () => null } });
  assert.equal(calls, 0); assert.equal(result.ga4.reports.totals.state, "unavailable");
  assert.equal(result.ga4.reports.totals.data, null); assert.equal(store.data.size, 3);
});

test("Live-shaped responses persist safe snapshots and TTL prevents repeat provider calls", async () => {
  const mock = fixtures(), store = memoryStore(), dependencies = deps(mock.fetch);
  const first = await syncSiteProviders({ siteId: "site-a", configs: [googleConfig, vercelConfig], store, deps: dependencies });
  assert.equal(first.ga4.reports.totals.data.rows[0].metrics.totalUsers, 17);
  assert.equal(first.vercel.reports.deployments.state, "ready");
  const count = mock.requests.length;
  await syncSiteProviders({ siteId: "site-a", configs: [googleConfig, vercelConfig], store, deps: dependencies });
  assert.equal(mock.requests.length, count);
  const saved = JSON.stringify([...store.data.values()]);
  assert.equal(saved.includes("fake-google-access-token"), false); assert.equal(saved.includes("PRIVATE KEY"), false);
});

test("Independent failure preserves last-good report with its real timestamp and stale marker", async () => {
  const mock = fixtures(), store = memoryStore();
  const first = await syncSiteProviders({ siteId: "site-a", configs: [googleConfig, vercelConfig], store, deps: deps(mock.fetch) });
  const next = new Date(initialTime.getTime() + 3_601_000);
  const failedFetch = async (url, init) => {
    if (url.includes("analyticsdata.googleapis.com") && JSON.parse(init.body).dimensions[0]?.name === "deviceCategory") return reply({ secret: privateKey }, 500);
    return mock.fetch(url, init);
  };
  const second = await syncSiteProviders({ siteId: "site-a", configs: [googleConfig, vercelConfig], store, deps: deps(failedFetch, () => next) });
  assert.deepEqual(second.ga4.staleReports, ["devices"]);
  assert.equal(second.ga4.reports.devices.fetchedAt, first.ga4.reports.devices.fetchedAt);
  assert.equal(second.ga4.reports.totals.fetchedAt, next.toISOString());
  assert.equal(second.ga4.refreshCodes.devices, "provider");
  assert.equal(second.vercel.reports.deployments.state, "ready");
});

test("Removed secrets and rejected authorization never reuse formerly authorized snapshot data", async () => {
  const mock = fixtures(), store = memoryStore();
  await syncSiteProviders({ siteId: "site-a", configs: [googleConfig], store, deps: deps(mock.fetch) });
  const removed = await syncSiteProviders({ siteId: "site-a", configs: [googleConfig], store, deps: { ...deps(mock.fetch), resolveCredential: async () => null } });
  assert.equal(removed.ga4.reports.totals.data, null);
  await syncSiteProviders({ siteId: "site-a", configs: [googleConfig], store, deps: deps(mock.fetch, () => new Date(initialTime.getTime() + 400_000)) });
  const forbidden = await syncSiteProviders({ siteId: "site-a", configs: [googleConfig], store, deps: deps(async (url, init) => url.includes("analyticsdata.googleapis.com") ? reply({}, 403) : mock.fetch(url, init), () => new Date(initialTime.getTime() + 4_001_000)) });
  assert.equal(forbidden.ga4.reports.totals.code, "authentication");
  assert.equal(forbidden.ga4.reports.totals.data, null); assert.deepEqual(forbidden.ga4.staleReports, []);
});

test("Temporary OAuth outage preserves last-good report, instead of impersonating revoked access", async () => {
  const mock = fixtures(), store = memoryStore();
  await syncSiteProviders({ siteId: "site-a", configs: [googleConfig], store, deps: deps(mock.fetch) });
  const result = await syncSiteProviders({ siteId: "site-a", configs: [googleConfig], store, deps: deps(async (url, init) => url === "https://oauth2.googleapis.com/token" ? reply({ error: "temporary" }, 503) : mock.fetch(url, init), () => new Date(initialTime.getTime() + 3_601_000)) });
  assert.equal(result.ga4.reports.totals.state, "ready");
  assert.ok(result.ga4.staleReports.includes("totals"));
  assert.equal(result.ga4.refreshCodes.totals, "provider");
});

test("Configuration changes cannot reuse data for another property and wrong site config fails before requests", async () => {
  const mock = fixtures(), store = memoryStore();
  const first = await syncSiteProviders({ siteId: "site-a", configs: [googleConfig], store, deps: deps(mock.fetch) });
  const changed = { ...googleConfig, config: { ...googleConfig.config, propertyId: "456" } };
  const second = await syncSiteProviders({ siteId: "site-a", configs: [changed], store, deps: deps(async (url, init) => url.includes("analyticsdata.googleapis.com") ? reply({}, 500) : mock.fetch(url, init)) });
  assert.notEqual(first.ga4.configFingerprint, second.ga4.configFingerprint);
  assert.equal(second.ga4.reports.totals.data, null);
  await assert.rejects(() => syncSiteProviders({ siteId: "site-b", configs: [googleConfig], store, deps: deps(mock.fetch) }), { message: "Invalid Hub integration scope" });
});

test("Supplied lock serializes concurrent refreshes and second job observes the first snapshot", async () => {
  const mock = fixtures(), store = memoryStore(), input = { siteId: "site-a", configs: [googleConfig], store, deps: deps(mock.fetch) };
  await Promise.all([syncSiteProviders(input), syncSiteProviders(input)]);
  assert.equal(mock.requests.filter(req => req.url.includes("analyticsdata.googleapis.com")).length, 9);
});

test("One storage failure does not reject other provider results", async () => {
  const mock = fixtures(), store = memoryStore();
  const guardedStore = { ...store, withLock: async (siteId, provider, work) => { if (provider === "ga4") throw new Error("internal database secret"); return store.withLock(siteId, provider, work); } };
  const result = await syncSiteProviders({ siteId: "site-a", configs: [googleConfig, vercelConfig], store: guardedStore, deps: deps(mock.fetch) });
  assert.equal(result.ga4.reports.totals.code, "provider");
  assert.equal(result.vercel.reports.deployments.state, "ready");
  assert.equal(JSON.stringify(result).includes("internal database secret"), false);
});
