/**
 * Local, real-HTTP API verification. Run from the integrated site's directory.
 * Never calls Google or a remote host. Creates only labelled synthetic requests.
 * Database access here is read-only and restricted to this run's UUIDs.
 */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import http from "node:http";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { DatabaseSync } from "node:sqlite";

const args = process.argv.slice(2);
const options = { base: "http://127.0.0.1:5184", label: "next-production" };
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, "");
  if (!Object.hasOwn(options, key) || !args[i + 1]) throw Error("Use --base LOCAL_URL and/or --label SAFE_LABEL.");
  options[key] = args[i + 1];
}
if (!/^[a-z0-9-]{1,50}$/.test(options.label)) throw Error("Invalid report label.");
const base = new URL(options.base);
if (base.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(base.hostname) || base.username || base.password || base.search || base.hash || base.pathname !== "/") {
  throw Error("This harness is restricted to an HTTP loopback origin without credentials, query, fragment or path.");
}
const app = resolve(process.cwd());
if (!existsSync(join(app, "app/api/contact/route.ts"))) throw Error("Run this script from the site directory.");
if (existsSync(join(app, ".env.local"))) process.loadEnvFile(join(app, ".env.local"));
if (process.env.VERCEL || process.env.SITESNIT_LOCAL_SQLITE !== "true") throw Error("This harness requires explicitly enabled local SQLite and refuses Vercel.");
const buildFile = join(app, ".next/BUILD_ID");
if (!existsSync(buildFile)) throw Error("A completed native Next build is required.");
const buildId = readFileSync(buildFile, "utf8").trim();
const contactFile = join(app, ".next/server/app/api/contact/route.js");
const runId = randomUUID();
const started = Date.now();
const report = {
  mode: options.label,
  startedAt: new Date(started).toISOString(),
  origin: base.origin,
  node: process.version,
  nextBuild: {
    id: buildId,
    completedAt: statSync(buildFile).mtime.toISOString(),
    contactBundleSha256: existsSync(contactFile) ? createHash("sha256").update(readFileSync(contactFile)).digest("hex") : null,
    identityScope: "Build files on disk. The running HTTP process must be started from this build; the API does not expose a build identifier.",
  },
  runId,
  tests: [],
  syntheticRequestIds: [],
  limitations: [
    "Only local HTTP and the explicit local SQLite store are tested; no live Neon, Vercel, email delivery or Google PageSpeed call.",
    "No authorized retention request is sent to the preview store. Destructive cleanup is tested using isolated in-memory fixtures instead.",
    "Synthetic inquiries remain in the local preview store; this harness only reads its own UUIDs and does not delete rows.",
  ],
};

function payload(extra = {}) {
  const requestId = randomUUID();
  report.syntheticRequestIds.push(requestId);
  return {
    requestId,
    name: "SYNTHETISCHE Sitesnit API-test",
    email: `sitesnit-test-${runId}@example.invalid`,
    website: "https://example.invalid",
    packageId: "website",
    message: `Lokale technische testaanvraag ${runId}. Geen echte persoon en geen belafspraak.`,
    companyCheck: "",
    ...extra,
  };
}

/** Uses TCP loopback even when the tested public Host is localhost. No redirects. */
function request(path, { method = "GET", body, origin, host = base.host, headers = {}, chunked = false } = {}) {
  const bodyBuffer = body === undefined ? null : Buffer.from(typeof body === "string" ? body : JSON.stringify(body));
  const outgoing = { Host: host, ...headers };
  if (origin !== undefined) outgoing.Origin = origin;
  if (bodyBuffer) {
    outgoing["Content-Type"] = "application/json";
    if (!chunked) outgoing["Content-Length"] = String(bodyBuffer.byteLength);
  }
  return new Promise((resolveRequest, reject) => {
    const req = http.request({
      protocol: "http:",
      hostname: base.hostname === "[::1]" ? "::1" : base.hostname === "localhost" ? "127.0.0.1" : base.hostname,
      port: base.port || 80,
      path,
      method,
      headers: outgoing,
      timeout: 20_000,
      agent: false,
    }, res => {
      const chunks = [];
      let bytes = 0;
      res.on("data", value => {
        bytes += value.byteLength;
        if (bytes > 64_000) { res.destroy(); reject(Error("RESPONSE_TOO_LARGE")); return; }
        chunks.push(value);
      });
      res.on("error", () => reject(Error("RESPONSE_CONNECTION_ERROR")));
      res.on("end", () => {
        let json = null;
        try { json = JSON.parse(Buffer.concat(chunks).toString("utf8")); } catch { /* Report status without logging HTML or body. */ }
        resolveRequest({ status: res.statusCode, headers: res.headers, json });
      });
    });
    req.on("timeout", () => req.destroy(Error("LOCAL_REQUEST_TIMEOUT")));
    req.on("error", error => reject(Error(error.code === "ECONNREFUSED" ? "LOCAL_SERVER_UNAVAILABLE" : "LOCAL_REQUEST_FAILED")));
    if (bodyBuffer && chunked) {
      for (let offset = 0; offset < bodyBuffer.byteLength; offset += 4096) req.write(bodyBuffer.subarray(offset, offset + 4096));
      req.end();
    } else req.end(bodyBuffer);
  });
}

function assertResponse(result, expected) {
  assert.equal(result.status, expected, `HTTP_STATUS_EXPECTED_${expected}_RECEIVED_${result.status}`);
  assert.match(result.headers["cache-control"] ?? "", /no-store/, "MISSING_NO_STORE");
  assert.match(result.headers["x-robots-tag"] ?? "", /noindex/, "MISSING_NOINDEX");
  assert.equal(result.headers["x-content-type-options"], "nosniff", "MISSING_NOSNIFF");
  assert.ok(result.json && typeof result.json === "object", "NON_JSON_RESPONSE");
  if (expected >= 400) {
    assert.notEqual(result.json.ok, true, "ERROR_RESPONSE_CLAIMS_SUCCESS");
    assert.equal(typeof result.json.error, "string", "MISSING_ERROR_MESSAGE");
  }
}

async function check(name, fn) {
  const begin = Date.now();
  try {
    const detail = await fn();
    report.tests.push({ name, status: "pass", milliseconds: Date.now() - begin, ...detail });
    console.log(`PASS ${name}`);
  } catch (error) {
    // Do not write raw exception messages, request bodies, headers or database rows.
    const safeMessage = typeof error.message === "string" ? error.message.split("\n")[0] : "";
    const reason = /^[A-Z][A-Z0-9_]{2,100}$/.test(safeMessage) ? safeMessage : "ASSERTION_OR_OPERATION_FAILED";
    report.tests.push({ name, status: "fail", milliseconds: Date.now() - begin, reason });
    console.log(`FAIL ${name}: ${reason}`);
  }
}

const withSummary = payload({ includeSummary: true, toolSummary: `SYNTHETISCHE prijscheck ${runId}: vijf pagina's; bespreken na 18:00.` });
const withoutSummary = payload({ includeSummary: false, toolSummary: `DEZE SAMENVATTING MAG NIET WORDEN OPGESLAGEN ${runId}` });
const blockedOrigin = payload();
const invalidId = payload({ requestId: "invalid-request-id" });
const honeypot = payload({ companyCheck: "synthetic-bot-field" });
const localhostHost = `localhost${base.port ? `:${base.port}` : ""}`;

try {
  await check("contact: matching 127.0.0.1 Origin and Host, summary opt-in", async () => {
    const response = await request("/api/contact", { method: "POST", origin: base.origin, body: withSummary });
    assertResponse(response, 200);
    assert.equal(response.json.ok, true);
    assert.equal(response.json.id, withSummary.requestId);
  });
  await check("contact: duplicate UUID succeeds without overwriting original request", async () => {
    const response = await request("/api/contact", { method: "POST", origin: base.origin, body: { ...withSummary, name: "MOET NIET OVERSCHRIJVEN", message: "Dit mag de eerste aanvraag niet vervangen.", toolSummary: "MAG NIET WORDEN VERVANGEN" } });
    assertResponse(response, 200);
    assert.equal(response.json.id, withSummary.requestId);
  });
  await check("contact: matching localhost Origin and Host, summary opt-out", async () => {
    const response = await request("/api/contact", { method: "POST", origin: `http://${localhostHost}`, host: localhostHost, body: withoutSummary });
    assertResponse(response, 200);
    assert.equal(response.json.ok, true);
    assert.equal(response.json.id, withoutSummary.requestId);
  });
  await check("contact: unrelated Origin is rejected", async () => {
    assertResponse(await request("/api/contact", { method: "POST", origin: "https://unrelated.example", body: blockedOrigin }), 403);
  });
  await check("contact: different localhost public Host and 127.0.0.1 Origin are rejected", async () => {
    const differentOrigin = base.hostname === "localhost" ? `http://127.0.0.1${base.port ? `:${base.port}` : ""}` : base.origin;
    assertResponse(await request("/api/contact", { method: "POST", origin: differentOrigin, host: localhostHost, body: blockedOrigin }), 403);
  });
  await check("contact: malformed JSON is rejected", async () => {
    assertResponse(await request("/api/contact", { method: "POST", origin: base.origin, body: "{ broken" }), 400);
  });
  await check("contact: non-object JSON is rejected", async () => {
    for (const body of ["null", "[]", '"text"']) assertResponse(await request("/api/contact", { method: "POST", origin: base.origin, body }), 400);
  });
  await check("contact: oversized Content-Length is rejected", async () => {
    assertResponse(await request("/api/contact", { method: "POST", origin: base.origin, body: { content: "x".repeat(22_001) } }), 413);
  });
  await check("contact: oversized chunked body is rejected without Content-Length", async () => {
    assertResponse(await request("/api/contact", { method: "POST", origin: base.origin, body: { content: "x".repeat(22_001) }, chunked: true }), 413);
  });
  await check("contact: honeypot and malformed request ID are rejected", async () => {
    for (const body of [honeypot, invalidId]) assertResponse(await request("/api/contact", { method: "POST", origin: base.origin, body }), 400);
  });
  await check("maintenance: missing and incorrect authorization are rejected", async () => {
    for (const path of ["/api/internal/retention", "/api/internal/storage"]) {
      assertResponse(await request(path), 401);
      assertResponse(await request(path, { headers: { Authorization: "Bearer deliberately-incorrect-local-test-token" } }), 401);
    }
  });
  await check("storage: authenticated schema health returns no private data", async () => {
    const secret = process.env.CRON_SECRET;
    assert.ok(secret && secret.length >= 16 && secret.length <= 512, "CRON_SECRET_NOT_CONFIGURED");
    const response = await request("/api/internal/storage", { headers: { Authorization: `Bearer ${secret}` } });
    assertResponse(response, 200);
    assert.deepEqual(response.json, { ok: true, schema: "sitesnit-1" });
  });
  await check("SQLite: HTTP submissions exist exactly once; duplicate and opt-out preserve privacy", async () => {
    const filename = join(app, ".sites-runtime/storage/sitesnit.sqlite");
    assert.ok(existsSync(filename), "LOCAL_SQLITE_FILE_MISSING");
    const database = new DatabaseSync(filename, { readOnly: true });
    try {
      const readOwn = database.prepare("SELECT id,name,email,website,package_id,message,tool_summary,created_at FROM inquiries WHERE id = ?");
      for (const expected of [withSummary, withoutSummary]) {
        const rows = readOwn.all(expected.requestId);
        assert.equal(rows.length, 1, "SYNTHETIC_INQUIRY_MISSING_OR_DUPLICATED");
        const row = rows[0];
        for (const key of ["id", "name", "email", "website", "message"]) assert.equal(row[key], key === "id" ? expected.requestId : expected[key], "SYNTHETIC_INQUIRY_CHANGED");
        assert.equal(row.package_id, expected.packageId, "PACKAGE_NOT_PRESERVED");
        assert.equal(row.tool_summary, expected.includeSummary ? expected.toolSummary : null, "SUMMARY_CONSENT_NOT_RESPECTED");
        assert.ok(row.created_at >= started && row.created_at <= Date.now(), "INVALID_INQUIRY_TIMESTAMP");
      }
      for (const expected of [blockedOrigin, honeypot]) assert.equal(readOwn.all(expected.requestId).length, 0, "REJECTED_REQUEST_WAS_STORED");
    } finally { database.close(); }
  });
  await check("isolated runtime tests: retention boundaries, idempotency, binding and atomic rate limit", async () => {
    const environment = { ...process.env };
    for (const key of Object.keys(environment)) if (/DATABASE_URL|PAGESPEED|CRON_SECRET|RATE_LIMIT_SECRET|GA4|GOOGLE|CLOUDFLARE|VERCEL/i.test(key)) delete environment[key];
    const child = spawnSync(process.execPath, ["--experimental-strip-types", "--import", "./scripts/typescript-test-loader.mjs", "--test", "--test-reporter=tap", "tests/database-runtime.test.mjs"], {
      cwd: app, env: environment, encoding: "utf8", timeout: 30_000, maxBuffer: 256_000,
    });
    assert.equal(child.status, 0, "ISOLATED_RUNTIME_TESTS_FAILED");
    const passCount = Number(child.stdout.match(/# pass (\d+)/)?.[1]);
    assert.ok(passCount >= 8, "ISOLATED_RUNTIME_TESTS_INCOMPLETE");
    return { passedCases: passCount, isolation: "SQLite :memory: plus mocked Neon HTTP client; no real database connection." };
  });
} finally {
  report.finishedAt = new Date().toISOString();
  report.success = report.tests.length === 14 && report.tests.every(test => test.status === "pass");
  report.counts = { passed: report.tests.filter(test => test.status === "pass").length, failed: report.tests.filter(test => test.status === "fail").length };
  const directory = join(app, "reports/seo");
  mkdirSync(directory, { recursive: true });
  const filename = join(directory, `api-${options.label}-${new Date(started).toISOString().replace(/[:.]/g, "-")}-${runId.slice(0, 8)}.json`);
  writeFileSync(filename, `${JSON.stringify(report, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  console.log(`Report: ${filename}`);
  console.log(`${report.counts.passed} passed; ${report.counts.failed} failed. No secret or customer record is included in the report.`);
  if (!report.success) process.exitCode = 1;
}
