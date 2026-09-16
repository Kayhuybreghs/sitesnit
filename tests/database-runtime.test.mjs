import test from "node:test";
import assert from "node:assert/strict";
import { createDatabase, postgresQuery } from "../lib/database-core.ts";
import { openLocalDatabase } from "../lib/database-sqlite.ts";
import { createNeonExecutor, validNeonUrl } from "../lib/database-neon.ts";
import { databaseMode } from "../lib/database.ts";
import { consumeRateLimit, requestAddress } from "../lib/rate-limit.ts";
import { cleanupRetention, inquiryCutoff, authorizedMaintenance, retentionResponse, storageResponse } from "../lib/retention.ts";

const databaseUrl = "postgresql://test:unit-only@ep-local-test.eu-central-1.aws.neon.tech/test?sslmode=require";
const now = Date.UTC(2026, 8, 15, 18, 30);
const secret = "local-test-only-cron-secret-12345";
const inquirySql = "INSERT INTO inquiries (id,name,email,website,package_id,message,tool_summary,created_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING";
const inquiryValues = (id, date = now) => [id, "Lokale test", "local-test@example.invalid", null, "website", "Alleen een lokale testaanvraag.", "Ontwerp + belvoorkeur", date];

test("placeholder conversion respects strings, escaped quotes, comments and dollar quotes", () => {
  const sql = `SELECT '?' AS label, "?column", $$?$$, $body$?$body$, 'It''s ?' FROM sample /* ? /* ? */ */ WHERE id=? -- ?\n AND label=?`;
  assert.equal(postgresQuery(sql, ["id", "label"]).text, sql.replace("id=?", "id=$1").replace("label=?", "label=$2"));
  const escaped = "SELECT E'it\\'s ?' WHERE id=?";
  assert.equal(postgresQuery(escaped, [1]).text, "SELECT E'it\\'s ?' WHERE id=$1");
  for (const [sqlText, values] of [["SELECT ?", []], ["SELECT 1", [1]], ["SELECT $1", [1]], ["SELECT ?", [undefined]], ["SELECT ?", [NaN]], ["SELECT ?", [Infinity]], ["SELECT ?", [{}]], ["SELECT 'unterminated", []], ["SELECT ?|x", []]]) {
    assert.throws(() => postgresQuery(sqlText, values));
  }
});

test("bindings are immutable and SQL injection payload stays a separate parameter", async () => {
  const calls = [];
  const database = createDatabase(async query => { calls.push(query); return { rows: [], changes: 1 }; });
  const original = database.prepare("INSERT INTO events (id,type,created_at) VALUES (?,?,?)");
  const first = original.bind("one", "'); DROP TABLE inquiries; --", now);
  const second = original.bind("two", "websitecheck_start", now);
  await Promise.all([first.run(), second.run()]);
  assert.equal(calls[0].text, "INSERT INTO events (id,type,created_at) VALUES ($1,$2,$3)");
  assert.equal(calls[0].text.includes("DROP"), false);
  assert.equal(calls[0].values[0], "one");
  assert.equal(calls[1].values[0], "two");
  await assert.rejects(original.run(), /parameter count/);
});

test("Neon uses explicit parameterized HTTP queries, timeout, no-store and real row counts", async () => {
  const calls = [];
  const execute = await createNeonExecutor(databaseUrl, () => ({ query: async (...args) => {
    calls.push(args);
    return { rows: [{ created_at: String(now), count: 2 }], rowCount: 1, fields: [{ name: "created_at", dataTypeID: 20 }] };
  } }));
  const database = createDatabase(execute);
  const result = await database.prepare("SELECT created_at,count FROM rate_limits WHERE key=?").bind("bound-key").run();
  assert.deepEqual(result, { success: true, results: [{ created_at: now, count: 2 }], meta: { changes: 1 } });
  assert.equal(calls[0][0], "SELECT created_at,count FROM rate_limits WHERE key=$1");
  assert.deepEqual(calls[0][1], ["bound-key"]);
  assert.equal(calls[0][2].fullResults, true);
  assert.equal(calls[0][2].fetchOptions.cache, "no-store");
  assert.ok(calls[0][2].fetchOptions.signal instanceof AbortSignal);
  const failing = await createNeonExecutor(databaseUrl, () => ({ query: async () => { throw Error("secret connection-string and personal data"); } }));
  await assert.rejects(failing({ text: "SELECT 1", values: [] }), error => !error.message.includes("secret") && error.name === "DatabaseUnavailableError");
  for (const value of ["", "https://example.org", "postgresql://u:p@localhost/db", "postgresql://u:p@neon.tech.attacker.invalid/db"]) assert.equal(validNeonUrl(value), false);
});

test("SQLite is opt-in locally and never a production fallback", () => {
  assert.equal(databaseMode({}), "unconfigured");
  assert.equal(databaseMode({ DATABASE_URL: databaseUrl }), "neon");
  assert.equal(databaseMode({ SITESNIT_LOCAL_SQLITE: "true" }), "sqlite");
  assert.equal(databaseMode({ SITESNIT_LOCAL_SQLITE: "true", DATABASE_URL: databaseUrl }), "sqlite");
  assert.equal(databaseMode({ VERCEL: "1", SITESNIT_LOCAL_SQLITE: "true" }), "unconfigured");
  assert.equal(databaseMode({ VERCEL: "1", DATABASE_URL: databaseUrl }), "neon");
});

test("contact SQL stores optional context once and returns true success only on a real query", async () => {
  const local = openLocalDatabase(":memory:");
  try {
    const first = await local.database.prepare(inquirySql).bind(...inquiryValues("same-id")).run();
    const repeated = await local.database.prepare(inquirySql).bind(...inquiryValues("same-id")).run();
    assert.equal(first.meta.changes, 1);
    assert.equal(repeated.meta.changes, 0);
    assert.equal(repeated.success, true);
    const row = await local.database.prepare("SELECT * FROM inquiries WHERE id=?").bind("same-id").first();
    assert.equal(row.name, "Lokale test");
    assert.equal(row.tool_summary, "Ontwerp + belvoorkeur");
    assert.equal(row.created_at, now);
    assert.equal(await local.database.prepare("SELECT * FROM inquiries WHERE id=?").bind("absent").first(), null);
    assert.equal(await local.database.prepare("SELECT count(*) AS count FROM inquiries").first("count"), 1);
    await assert.rejects(local.database.prepare("INSERT INTO missing_table (id) VALUES (?)").bind("x").run());
  } finally { local.close(); }
});

test("atomic rate-limit upsert increments correctly, separates clients and resets by time window", async () => {
  const local = openLocalDatabase(":memory:");
  const request = new Request("https://sitesnit.nl/api/contact", { headers: { "x-vercel-forwarded-for": "192.0.2.1", "cf-connecting-ip": "192.0.2.99" } });
  try {
    const options = { vercel: true, secret, now };
    const results = await Promise.all(Array.from({ length: 12 }, () => consumeRateLimit(local.database, request, "contact", 8, 600, options)));
    assert.equal(results.filter(Boolean).length, 8);
    assert.equal((await local.database.prepare("SELECT count FROM rate_limits").first()).count, 12);
    const other = new Request("https://sitesnit.nl/api/contact", { headers: { "x-vercel-forwarded-for": "2001:db8::1" } });
    assert.equal(await consumeRateLimit(local.database, other, "contact", 8, 600, options), true);
    assert.equal(await consumeRateLimit(local.database, request, "contact", 8, 600, { ...options, now: now + 600000 }), true);
    assert.equal(requestAddress(request, true), "192.0.2.1");
    assert.equal(requestAddress(request, false), "local-preview");
    assert.throws(() => requestAddress(new Request("https://sitesnit.nl", { headers: { "cf-connecting-ip": "192.0.2.99", "x-forwarded-for": "192.0.2.99" } }), true));
  } finally { local.close(); }
});

test("retention deletes only expired rows; exact boundaries and newer data survive; rerun is idempotent", async () => {
  const local = openLocalDatabase(":memory:");
  const boundary = inquiryCutoff(now);
  const eventBoundary = now - 90 * 86400000;
  try {
    for (const [id, date] of [["old", boundary - 1], ["boundary", boundary], ["new", now]]) await local.database.prepare(inquirySql).bind(...inquiryValues(id, date)).run();
    for (const [id, date] of [["old-event", eventBoundary - 1], ["boundary-event", eventBoundary], ["new-event", now]]) await local.database.prepare("INSERT INTO events (id,type,created_at) VALUES (?,?,?)").bind(id, "websitecheck_start", date).run();
    for (const [key, date] of [["expired-rate", now - 1], ["current-rate", now + 10000]]) await local.database.prepare("INSERT INTO rate_limits (key,count,reset_at) VALUES (?,?,?)").bind(key, 1, date).run();
    const result = await cleanupRetention(local.database, now);
    assert.deepEqual(result.deleted, { inquiries: 1, events: 1, rateLimits: 1 });
    assert.equal(await local.database.prepare("SELECT count(*) AS n FROM inquiries").first("n"), 2);
    assert.equal(await local.database.prepare("SELECT count(*) AS n FROM events").first("n"), 2);
    assert.deepEqual((await cleanupRetention(local.database, now)).deleted, { inquiries: 0, events: 0, rateLimits: 0 });
    assert.equal(inquiryCutoff(Date.UTC(2024, 1, 29, 12)), Date.UTC(2023, 1, 28, 12));
    assert.equal(inquiryCutoff(Date.UTC(2025, 1, 28, 12)), Date.UTC(2024, 1, 28, 12));
  } finally { local.close(); }
});

test("maintenance endpoints fail closed before touching storage; successful storage check returns no private rows", async () => {
  let calls = 0;
  const unavailable = createDatabase(async () => { calls++; throw Error("private database detail"); });
  const unauthorized = new Request("https://sitesnit.nl/api/internal/retention");
  assert.equal(authorizedMaintenance(unauthorized, undefined), false);
  assert.equal(authorizedMaintenance(new Request("https://sitesnit.nl", { headers: { authorization: "Bearer undefined" } }), undefined), false);
  assert.equal((await retentionResponse(unauthorized, unavailable, secret, now)).status, 401);
  assert.equal(calls, 0);
  const authenticated = new Request("https://sitesnit.nl/api/internal/retention", { headers: { authorization: `Bearer ${secret}` } });
  const failure = await retentionResponse(authenticated, unavailable, secret, now);
  assert.equal(failure.status, 503);
  assert.equal((await failure.text()).includes("private"), false);
  const local = openLocalDatabase(":memory:");
  try {
    const success = await storageResponse(authenticated, local.database, secret);
    assert.equal(success.status, 200);
    assert.equal(success.headers.get("cache-control"), "no-store");
    assert.deepEqual(await success.json(), { ok: true, schema: "sitesnit-1" });
    assert.equal((await retentionResponse(authenticated, local.database, secret, now)).status, 200);
  } finally { local.close(); }
});
