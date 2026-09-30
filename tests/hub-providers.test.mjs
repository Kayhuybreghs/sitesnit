import test from "node:test";
import assert from "node:assert/strict";
import { fetchGa4, HUB_EVENTS } from "../lib/hub/providers/ga4.ts";
import { fetchSearchConsole } from "../lib/hub/providers/search-console.ts";
import { fetchVercelDeployments } from "../lib/hub/providers/vercel.ts";
import { readSnapshot, snapshotKey } from "../lib/hub/providers/cache.ts";

const period = { startDate: "2026-08-01", endDate: "2026-08-31" };
const now = () => new Date("2026-09-02T12:00:00Z");
const token = "fixture-token-not-a-live-secret";
const deps = (fetch) => ({ fetch, getAccessToken: async () => token, now });
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

function gaReport(request, overrides = {}) {
  const dimensions = request.dimensions.map(d => d.name), metrics = request.metrics.map(m => m.name);
  return {
    dimensionHeaders: dimensions.map(name => ({ name })), metricHeaders: metrics.map(name => ({ name, type: "TYPE_INTEGER" })),
    rows: [{ dimensionValues: dimensions.map(name => ({ value: name === "date" ? "20260801" : name === "eventName" ? "tool_start" : "example" })), metricValues: metrics.map(name => ({ value: name === "totalUsers" ? "100" : "120" })) }],
    rowCount: 1, metadata: { timeZone: "Europe/Amsterdam" }, ...overrides,
  };
}

test("GA4 requests period totals independently and limits event names", async () => {
  const requests = [];
  const actual = await fetchGa4({ propertyId: "1234", period }, deps(async (url, init) => {
    assert.match(url, /^https:\/\/analyticsdata.googleapis.com\/v1beta\/properties\/1234:runReport$/);
    assert.equal(init.headers.Authorization, `Bearer ${token}`);
    assert.equal(init.redirect, "error");
    const body = JSON.parse(init.body); requests.push(body);
    return json(gaReport(body));
  }));
  assert.equal(requests.length, 9);
  assert.equal(requests.filter(r => !r.dimensions.length).length, 1);
  assert.equal(actual.totals.data.rows[0].metrics.totalUsers, 100);
  assert.equal(actual.totals.timeZone, "Europe/Amsterdam");
  assert.equal(actual.totals.fetchedAt, now().toISOString());
  assert.deepEqual(requests.find(r => r.dimensionFilter).dimensionFilter.filter.inListFilter.values, [...HUB_EVENTS]);
  assert.equal(actual.daily.state, "ready");
});

test("GA4 preserves other reports when a report fails and strips provider errors", async () => {
  const actual = await fetchGa4({ propertyId: "1234", period }, deps(async (_url, init) => {
    const body = JSON.parse(init.body);
    if (body.dimensions[0]?.name === "deviceCategory") return json({ error: { message: `private ${token}` } }, 403);
    return json(gaReport(body));
  }));
  assert.equal(actual.devices.state, "error");
  assert.equal(actual.devices.code, "authentication");
  assert.equal(actual.devices.data, null);
  assert.equal(actual.totals.state, "ready");
  assert.equal(JSON.stringify(actual).includes(token), false);
});

test("GA4 rejects nonnumeric metric values and reports threshold/sampling limits", async () => {
  const actual = await fetchGa4({ propertyId: "1234", period }, deps(async (_url, init) => {
    const body = JSON.parse(init.body), report = gaReport(body, { metadata: { timeZone: "Europe/Amsterdam", subjectToThresholding: true, samplingMetadatas: [{}], dataLossFromOtherRow: true } });
    if (!body.dimensions.length) report.rows[0].metricValues[0].value = "NaN";
    return json(report);
  }));
  assert.equal(actual.totals.code, "invalid-response");
  assert.equal(actual.daily.data.subjectToThresholding, true);
  assert.equal(actual.daily.warnings.length, 3);
});

test("GA4 rejects unrelated events even if provider ignores requested filter", async () => {
  const actual = await fetchGa4({ propertyId: "1234", period }, deps(async (_url, init) => {
    const body = JSON.parse(init.body), report = gaReport(body);
    if (body.dimensions[0]?.name === "eventName") report.rows[0].dimensionValues[0].value = "private_event";
    return json(report);
  }));
  assert.equal(actual.events.code, "invalid-response");
});

test("GA4 keeps stored inquiry events separate from tool use and contact intent without inventing missing rows", async () => {
  const measured = [['tool_complete', '21'], ['form_start', '9'], ['generate_lead', '4'], ['contact_intent', '7']];
  const actual = await fetchGa4({ propertyId: "1234", period }, deps(async (_url, init) => {
    const body = JSON.parse(init.body);
    if (body.dimensions[0]?.name !== 'eventName') return json(gaReport(body));
    const allowed = body.dimensionFilter.filter.inListFilter.values;
    for (const name of ['form_start', 'generate_lead', 'contact_intent']) assert.ok(allowed.includes(name));
    assert.deepEqual(body.metrics, [{name:'eventCount'}], 'counts do not impersonate unique users or revenue');
    return json(gaReport(body, {rowCount:measured.length, rows:measured.map(([name,count])=>({dimensionValues:[{value:name}],metricValues:[{value:count}]}))}));
  }));
  assert.equal(actual.events.state, 'ready');
  assert.deepEqual(actual.events.data.rows.map(row=>[row.dimensions.eventName,row.metrics.eventCount]), measured.map(([name,count])=>[name,Number(count)]));
  assert.equal(actual.events.data.rows.some(row=>row.dimensions.eventName==='cta_click'), false, 'an absent event is not fabricated as zero');
  assert.equal(actual.events.data.rows.find(row=>row.dimensions.eventName==='generate_lead').metrics.eventCount, 4);
});

test("Missing credentials and empty successful data never become zero visitor totals", async () => {
  let called = false;
  const missing = await fetchGa4({ propertyId: "1234", period }, { ...deps(async () => { called = true; throw new Error("not expected"); }), getAccessToken: async () => null });
  assert.equal(called, false);
  assert.equal(missing.totals.state, "unavailable");
  assert.equal(missing.totals.data, null);
  const empty = await fetchGa4({ propertyId: "1234", period }, deps(async (_url, init) => json(gaReport(JSON.parse(init.body), { rows: [], rowCount: 0 }))));
  assert.equal(empty.totals.code, "no-data");
  assert.equal(empty.totals.data, null);
});

test("Invalid IDs and calendar periods cannot trigger provider calls", async () => {
  const bad = await fetchGa4({ propertyId: "../other", period }, deps(async () => { throw new Error("must not call"); }));
  assert.equal(bad.totals.code, "invalid-config");
  const dates = await fetchGa4({ propertyId: "1", period: { startDate: "2026-02-30", endDate: "2026-03-02" } }, deps(async () => { throw new Error("must not call"); }));
  assert.equal(dates.totals.code, "invalid-config");
});

test("Search Console totals are separate from top queries; CTR and position keep correct bases", async () => {
  const requests = [];
  const actual = await fetchSearchConsole({ siteUrl: "sc-domain:example.nl", period }, deps(async (url, init) => {
    assert.match(url, /sc-domain%3Aexample.nl\/searchAnalytics\/query$/);
    const body = JSON.parse(init.body); requests.push(body);
    const total = body.dimensions.length === 0;
    return json({ responseAggregationType: body.aggregationType, rows: [{ keys: total ? [] : ["example"], clicks: total ? 30 : 3, impressions: total ? 200 : 10, ctr: total ? 0.15 : 0.3, position: total ? 5.75 : 2 }] });
  }));
  assert.equal(actual.totals.data.rows[0].clicks, 30);
  assert.equal(actual.queries.data.rows[0].clicks, 3);
  assert.equal(actual.totals.data.rows[0].ctr, 0.15);
  assert.equal(actual.totals.data.rows[0].position, 5.75);
  assert.equal(actual.queries.data.topRowsOnly, true);
  assert.equal(actual.pages.data.aggregation, "byPage");
  assert.equal(actual.totals.timeZone, "America/Los_Angeles");
  assert.ok(requests.every(r => r.dataState === "final"));
});

test("Search Console rejects wrong aggregation and handles partial quota failure", async () => {
  const actual = await fetchSearchConsole({ siteUrl: "https://example.nl/", period }, deps(async (_url, init) => {
    const body = JSON.parse(init.body);
    if (body.dimensions[0] === "query") return json({ message: token }, 429);
    return json({ responseAggregationType: "byProperty", rows: [{ keys: body.dimensions.length ? ["example"] : [], clicks: 0, impressions: 0, ctr: 0, position: 0 }] });
  }));
  assert.equal(actual.queries.code, "quota");
  assert.equal(actual.pages.code, "invalid-response");
  assert.equal(actual.totals.state, "ready");
  assert.equal(actual.totals.data.rows[0].ctr, null);
  assert.equal(actual.totals.data.rows[0].position, null);
});

test("Vercel request scopes project and optional team, returns only safe deployment fields", async () => {
  const urls = [];
  const d = deps(async (url) => {
    urls.push(new URL(url));
    return json({ deployments: [{ uid: "dpl_1", projectId: "prj_1", state: "READY", target: "production", created: 1788300000000, ready: 1788300001000, env: { SECRET: token }, meta: { gitAuthorEmail: "private@example.nl" }, url: "private-preview.vercel.app" }] });
  });
  const result = await fetchVercelDeployments({ projectId: "prj_1" }, d);
  await fetchVercelDeployments({ projectId: "prj_1", teamId: "team_1" }, d);
  assert.equal(urls[0].pathname, "/v7/deployments");
  assert.equal(urls[0].searchParams.has("teamId"), false);
  assert.equal(urls[1].searchParams.get("teamId"), "team_1");
  assert.equal(result.state, "ready");
  assert.equal(result.data[0].status, "READY");
  assert.equal(JSON.stringify(result).includes("private"), false);
  assert.equal(JSON.stringify(result).includes(token), false);
});

test("Vercel rejects cross-project or preview deployments and redacts network exceptions", async () => {
  const bad = await fetchVercelDeployments({ projectId: "prj_1" }, deps(async () => json({ deployments: [{ uid: "dpl_1", projectId: "prj_other", target: "production", state: "READY", created: 1788300000000 }] })));
  assert.equal(bad.code, "invalid-response");
  const network = await fetchVercelDeployments({ projectId: "prj_1" }, deps(async () => { throw new Error(`Bearer ${token}`); }));
  assert.equal(network.code, "network");
  assert.equal(JSON.stringify(network).includes(token), false);
});

test("Snapshot cache returns fresh snapshots without provider calls and preserves timestamp on refresh failure", async () => {
  const snapshot = { state: "ready", source: "ga4", period, timeZone: "Europe/Amsterdam", fetchedAt: now().toISOString(), data: { totalUsers: 15 }, warnings: [] };
  let refreshed = 0, saved = 0;
  const config = { key: snapshotKey({ tenantId: "t1", siteId: "s1", integrationId: "g1", report: "totals", ...period }), now: now(), maxAgeMs: 3_600_000, store: { get: async () => snapshot, set: async () => { saved++; } }, refresh: async () => { refreshed++; return { ...snapshot, state: "error", data: null, code: "quota" }; } };
  const fresh = await readSnapshot(config);
  assert.equal(refreshed, 0); assert.equal(fresh.stale, false);
  const stale = await readSnapshot({ ...config, now: new Date("2026-09-03T12:00:00Z") });
  assert.equal(stale.stale, true); assert.equal(stale.snapshot.fetchedAt, snapshot.fetchedAt);
  assert.equal(stale.refreshCode, "quota"); assert.equal(saved, 0);
  assert.notEqual(config.key, snapshotKey({ tenantId: "t2", siteId: "s1", integrationId: "g1", report: "totals", ...period }));
});

test("GA4 accepts Google's metadata-only empty aggregate without inventing zero totals", async () => {
  const actual = await fetchGa4({propertyId:'1234',period}, deps(async () => json({kind:'analyticsData#runReport',metadata:{currencyCode:'EUR',timeZone:'Europe/Amsterdam'}})));
  assert.equal(actual.totals.code,'no-data');
  assert.equal(actual.totals.state,'unavailable');
  assert.equal(actual.totals.timeZone,'Europe/Amsterdam');
  assert.equal(actual.totals.data,null);
  const malformed = await fetchGa4({propertyId:'1234',period}, deps(async () => json({})));
  assert.equal(malformed.totals.code,'invalid-response');
});
