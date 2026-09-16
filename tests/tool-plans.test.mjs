import test from "node:test";
import assert from "node:assert/strict";
import {
  parseMoney,
  emptyOffer,
  offerTotals,
  offersComparable,
  offerQuestions,
  summarizeOffers,
  automationPlan,
  emptyDesign,
  designPlan,
  websiteBrief,
} from "../lib/tool-plans.ts";
const offer = (data = {}) => ({
  ...emptyOffer("a", "Voorstel A"),
  once: "1000",
  monthly: "25",
  yearly: "120",
  vat: "excl",
  ...data,
});
test("NL bedragen, decimalen, nul en ontbrekende kosten blijven onderscheiden", () => {
  for (const [value, expected] of [
    ["€ 1.895,50", 189550],
    ["1.895", 189500],
    ["1895.50", 189550],
    ["0", 0],
    ["  ", null],
    ["-25", null],
    ["1,2,3", null],
    ["10000001", null],
  ])
    assert.equal(parseMoney(value), expected, value);
});
test("12/36 maanden rekenen alle kostensoorten één keer mee", () => {
  const t = offerTotals(offer());
  assert.equal(t.year, 142000);
  assert.equal(t.threeYears, 226000);
  assert.equal(t.complete, true);
});
test("inbegrepen maanden verminderen alleen maandkosten", () => {
  const t = offerTotals(offer({ includedMonths: "12" }));
  assert.equal(t.year, 112000);
  assert.equal(t.threeYears, 196000);
  assert.equal(offerTotals(offer({ includedMonths: "36" })).threeYears, 136000);
});
test("onbekend is geen nul, expliciet nul is compleet", () => {
  const t = offerTotals(offer({ monthly: "", yearly: "0" }));
  assert.equal(t.year, 100000);
  assert.equal(t.complete, false);
  assert.ok(t.missing.includes("maandkosten"));
  assert.equal(
    offerTotals(offer({ monthly: "0", yearly: "0" })).complete,
    true,
  );
  assert.equal(offerTotals(emptyOffer("a", "A")).year, null);
});
test("onbekende verlengprijs geeft geen gefingeerd totaal", () => {
  const t = offerTotals(offer({ rates: "unknown" }));
  assert.equal(t.threeYears, 100000);
  assert.equal(t.complete, false);
  assert.match(
    summarizeOffers([offer({ rates: "unknown" })]),
    /terugkerende bedragen niet meegerekend/,
  );
});
test("ongeldige bedragen of maanden lekken nooit naar export", () => {
  for (const o of [
    offer({ monthly: "-25" }),
    offer({ includedMonths: "99" }),
    offer({ once: "abc" }),
    offer({ includedMonths: "" }),
  ]) {
    const t = offerTotals(o);
    assert.equal(t.year, null);
    assert.equal(t.threeYears, null);
    assert.ok(t.invalid.length);
    assert.match(summarizeOffers([o]), /Totalen niet berekend/);
    assert.ok(
      offerQuestions([o]).some((q) => q.includes("controleer de invoer")),
    );
  }
});
test("gelijke scope met gemengde of onbekende btw wordt niet vergelijkbaar", () => {
  assert.equal(offersComparable([offer(), offer({ id: "b" })]), true);
  assert.equal(offersComparable([offer(), offer({ vat: "incl" })]), false);
  assert.equal(offersComparable([offer(), offer({ vat: "unknown" })]), false);
  assert.match(
    offerQuestions([offer(), offer({ vat: "incl" })])[0],
    /dezelfde btw-basis/,
  );
});
test("voorbeeldherkomst en ontbrekende omvang blijven herkenbaar in overdracht", () => {
  assert.match(
    summarizeOffers([offer({ example: true })]),
    /fictieve voorbeeldgegevens/,
  );
  assert.ok(offerQuestions([offer()]).some((q) => q.includes("pagina’s")));
});
const automation = {
  task: "invoice",
  source: "Mailbox",
  destination: "Boekhouding",
  count: "120",
  minutes: "5",
  control: "each",
};
test("automatiseringsplan rekent huidig werk zonder besparing te verzinnen", () => {
  const p = automationPlan(automation);
  assert.equal(p.hours, 10);
  assert.equal(p.steps.length, 5);
  assert.equal(p.steps[0], "Mailbox");
  assert.equal(p.steps[3], "Jouw controle per uitkomst");
  assert.equal(
    automationPlan({ ...automation, count: "15", minutes: "2,5" }).hours,
    0.625,
  );
});
test("onbekende tijd laat plan bruikbaar, nul blijft nul, ongeldige invoer wordt afgewezen", () => {
  const p = automationPlan({ ...automation, count: "" });
  assert.equal(p.hours, null);
  assert.equal(p.invalid, false);
  assert.equal(p.steps.length, 5);
  assert.equal(automationPlan({ ...automation, count: "0" }).hours, 0);
  for (const change of [
    { count: "-1" },
    { minutes: "abc" },
    { minutes: "1441" },
    { count: "1000001" },
  ])
    assert.equal(automationPlan({ ...automation, ...change }).invalid, true);
});
test("taak wijzigen verandert proces, dezelfde bron en bestemming zijn geldig", () => {
  const p = automationPlan({
    ...automation,
    task: "support",
    destination: "Mailbox",
  });
  assert.equal(p.steps[2], "Conceptantwoord opstellen");
  assert.equal(p.steps[4], "Mailbox");
});
test("ontwerp bewaart eigen tekst bij andere kleur of stijl", () => {
  const input = {
    ...emptyDesign,
    name: "Studio Linde",
    activity: "Interieuradvies",
    services: "Interieuradvies\nLichtplan",
    headline: "Een huis dat bij je past.",
    intro: "Jouw eigen introductie.",
    cta: "Vertel over je huis",
  };
  const p = designPlan({ ...input, palette: "coral", style: "editorial" });
  assert.equal(p.headline, input.headline);
  assert.equal(p.intro, input.intro);
  assert.equal(p.action, input.cta);
  assert.equal(p.services.length, 2);
  assert.equal(
    designPlan({ ...input, pages: "unknown" }).pending[0],
    "De uiteindelijke paginaomvang",
  );
});
test("ontwerp begrenst aanbod en verzint geen biografie of prijs", () => {
  const p = designPlan({ ...emptyDesign, services: "1,2,3,4,5,6,7" });
  assert.equal(p.services.length, 6);
  assert.equal("price" in p, false);
  assert.equal(p.name, "Jouw bedrijf");
});
test("websiteplan maakt onderscheid tussen onepager, talen en specifieke functies", () => {
  const a = websiteBrief({ pages: "one" });
  assert.match(a.label, /onepager/);
  assert.equal(a.pages.length, 4);
  const b = websiteBrief({
    pages: "five",
    action: "checkout",
    languages: "multiple",
  });
  assert.equal(b.pages.length, 5);
  assert.ok(b.content.some((c) => c.startsWith("Webshop:")));
  assert.ok(b.content.some((c) => c.startsWith("Talen:")));
});
