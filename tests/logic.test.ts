import assert from "node:assert/strict";
import fs from "node:fs";
import { calculatePrice } from "../lib/price";
import { priceQuestions, websiteQuestions } from "../lib/questions";
import { normalizeLighthouse } from "../lib/lighthouse";
import { buildWebsiteAdvice } from "../lib/advice";
import { publicWebsiteUrl } from "../lib/url";
import { readObjectBody } from '../lib/request-body';
import { indexingAllowed } from '../lib/seo-policy';
const base = {
  situation: "new",
  goal: "leads",
  action: "contact",
  features: ["form", "gallery"],
  pages: "one",
  pageTypes: "simple",
  design: "refined",
  integrations: "none",
  content: "ready",
  languages: "one",
  migration: "none",
  management: "content",
  planning: "months",
  budget: "unknown",
  support: "discuss",
};
assert.equal(priceQuestions.length, 15);
assert.equal(websiteQuestions.length, 15);
assert.equal(new Set(priceQuestions.map((q) => q.id)).size, 15);
assert.equal(calculatePrice(base).basis, 895);
assert.equal(calculatePrice(base).fixed, true);
assert.equal(calculatePrice({ ...base, pages: "five" }).basis, 1895);
assert.equal(calculatePrice({ ...base, pages: "five" }).fixed, true);
assert.equal(calculatePrice({ ...base, pages: "more" }).basis, 2750);
assert.equal(calculatePrice({ ...base, pages: "more" }).fixed, false);
assert.equal(calculatePrice({ ...base, action: "booking" }).basis, 2750);
assert.equal(calculatePrice({ ...base, action: "external" }).basis, 895);
for (const feature of ["chatbot", "automation"]) {
  const result = calculatePrice({ ...base, features: [feature, "form"] });
  assert.equal(result.basis, 2750);
  assert.equal(result.fixed, false);
  assert.equal(
    calculatePrice({ ...base, features: [feature], integrations: "api" }).basis,
    2750,
  );
  assert.equal(
    calculatePrice({ ...base, features: [feature], situation: "improve" })
      .basis,
    null,
  );
}
for (const budget of ["low", "medium", "custom", "unknown"])
  assert.equal(calculatePrice({ ...base, budget }).basis, 895);
for (const id of [
  "pages",
  "content",
  "languages",
  "migration",
  "pageTypes",
  "design",
]) {
  const r = calculatePrice({ ...base, [id]: "unknown" });
  assert.equal(r.basis, 895);
  assert.equal(r.fixed, false);
  assert.ok(r.pending.length);
}
assert.equal(calculatePrice({ ...base, situation: "improve" }).basis, null);
assert.equal(calculatePrice({}).fixed, false);
for (const extra of [
  { action: "booking" },
  { pages: "unknown" },
  { pages: "more" },
]) {
  const improvement = calculatePrice({
    ...base,
    ...extra,
    situation: "improve",
  });
  assert.equal(improvement.basis, null);
  assert.equal(improvement.route, "Eerst je bestaande website bekijken");
  assert.ok(!improvement.pending.some((p) => p.includes("€1.895")));
}
assert.equal(publicWebsiteUrl("example.com"), "https://example.com/");
for (const url of [
  "localhost",
  "http://127.0.0.1/",
  "http://192.168.1.1/",
  "http://[::1]/",
  "http://user:pass@example.com",
  "ftp://example.com",
  "http://10.0.0.5/",
])
  assert.throws(() => publicWebsiteUrl(url));
const fixture = {
  lighthouseResult: {
    configSettings: { formFactor: "mobile" },
    fetchTime: "2026-09-13T08:00:00Z",
    finalUrl: "https://example.com/",
    lighthouseVersion: "13",
    categories: {
      performance: {
        score: 0.32,
        auditRefs: [
          { id: "image-delivery-insight" },
          { id: "manual-check" },
          { id: "largest-contentful-paint" },
        ],
      },
      accessibility: { score: 0.7, auditRefs: [{ id: "color-contrast" }] },
    },
    audits: {
      "image-delivery-insight": {
        score: 0,
        scoreDisplayMode: "metricSavings",
        title: "Improve image delivery",
        displayValue: "120 KiB",
        details: {
          items: [
            { url: "https://example.com/large.jpg", wastedBytes: 120000 },
          ],
        },
      },
      "manual-check": {
        score: null,
        scoreDisplayMode: "manual",
        title: "Manual check",
      },
      "largest-contentful-paint": {
        score: 0.1,
        scoreDisplayMode: "numeric",
        title: "LCP",
        displayValue: "6 s",
      },
      "color-contrast": {
        score: 0,
        scoreDisplayMode: "binary",
        title: "Text contrast",
        details: { items: [{ node: { snippet: "<p>Text</p>" } }] },
      },
    },
  },
};
const normalized = normalizeLighthouse(fixture, "https://example.com/");
assert.throws(() => normalizeLighthouse({ lighthouseResult: {} }, 'https://example.com/'));
assert.throws(() => normalizeLighthouse({ lighthouseResult: { ...fixture.lighthouseResult, fetchTime: undefined } }, 'https://example.com/'));
assert.throws(() => normalizeLighthouse({ lighthouseResult: { ...fixture.lighthouseResult, configSettings: undefined } }, 'https://example.com/'));
const invalidCategory = structuredClone(fixture);
invalidCategory.lighthouseResult.categories.performance.score = 2;
assert.equal(normalizeLighthouse(invalidCategory, 'https://example.com/').categories[0].score, null);
assert.throws(() => publicWebsiteUrl('http://printer.local./'));
assert.throws(() => publicWebsiteUrl('http://localhost./'));
assert.equal(publicWebsiteUrl('https://10.example.com/'), 'https://10.example.com/');
assert.equal(publicWebsiteUrl('https://example.com./'), 'https://example.com/');
assert.equal(indexingAllowed('true', 'sitesnit.nl'), true);
for (const host of ['127.0.0.1:5184', 'preview.example.com', null, 'sitesnit.nl.evil.example'])
  assert.equal(indexingAllowed('true', host), false);
assert.equal(indexingAllowed('false', 'sitesnit.nl'), false);
assert.equal(indexingAllowed(undefined, 'sitesnit.nl'), false);
for (const body of ['null', '[]', '42', 'invalid'])
  await assert.rejects(readObjectBody(new Request('http://localhost', { method: 'POST', body }), 40));
assert.deepEqual(await readObjectBody(new Request('http://localhost', { method:'POST',body:'{"naam":"Zoë"}' }),40),{naam:'Zoë'});
await assert.rejects(readObjectBody(new Request('http://localhost', { method:'POST',body:'{"naam":"éééééééééé"}' }),25), /te groot/);
let cancelled = false;
const stream = new ReadableStream({ pull(controller) { controller.enqueue(new Uint8Array(10)); }, cancel() { cancelled = true; } });
await assert.rejects(readObjectBody(new Request('http://localhost', { method:'POST',body:stream,duplex:'half' } as RequestInit),25), /te groot/);
assert.ok(cancelled);
assert.equal(normalized.categories[0].score, 32);
assert.equal(normalized.categories[2].score, null);
assert.equal(normalized.findings.length, 2);
assert.ok(normalized.findings.some((f) => f.id === "image-delivery-insight"));
assert.equal(normalized.metrics[0].displayValue, "6 s");
const allGood = Object.fromEntries(websiteQuestions.map((q) => [q.id, "good"]));
assert.ok(
  buildWebsiteAdvice(allGood, normalized).priorities.some(
    (f) => f.source === "Lighthouse",
  ),
);
const needs = Object.fromEntries(websiteQuestions.map((q) => [q.id, "needs"]));
assert.ok(
  buildWebsiteAdvice(needs, normalized).priorities.some(
    (f) => f.source === "Lighthouse",
  ),
);
assert.equal(normalized.categories[0].score, 32);
const noImage = structuredClone(fixture);
Reflect.deleteProperty(
  noImage.lighthouseResult.audits,
  "image-delivery-insight",
);
const noImageResult = normalizeLighthouse(noImage, "https://example.com/");
assert.ok(
  !noImageResult.findings.some((f) =>
    f.title.toLowerCase().includes("afbeeldingen"),
  ),
);
if (fs.existsSync(".sites-runtime/live-scan.json")) {
  const real = JSON.parse(
    fs.readFileSync(".sites-runtime/live-scan.json", "utf8"),
  ).result as import("../lib/lighthouse").TechnicalResult;
  const realAdvice = buildWebsiteAdvice(allGood, real);
  assert.ok(realAdvice.priorities.some((f) => f.source === "Lighthouse"));
  for (const f of realAdvice.priorities.filter(
    (f) => f.source === "Lighthouse",
  ))
    assert.ok(
      real.audits.some(
        (a) => a.id === f.id && a.score !== null && a.score < 0.9,
      ),
    );
  console.log(
    JSON.stringify(
      {
        passed: true,
        priceScenarios:
          "pakketprijzen, extra pagina’s, AI, koppelingen, budgetneutraliteit en bestaande verbeteropdrachten",
        questionCounts: [websiteQuestions.length, priceQuestions.length],
        realUrl: real.finalUrl,
        realScores: real.categories,
        realAdvice: realAdvice.priorities.map((f) => ({
          id: f.id,
          title: f.title,
          source: f.source,
        })),
      },
      null,
      2,
    ),
  );
} else {
  console.log(
    "Pure price and Lighthouse logic tests passed. Run browser QA to add the real API response check.",
  );
}
