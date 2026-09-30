import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectRenderedContent, renderedMainParagraphs } from '../scripts/content-render-contract.mjs';
import { inspectEvidence, comparePagePurpose } from '../lib/content-evidence.ts';

const faq = ['Wat kost SEO-onderhoud?', 'We bekijken eerst wat al in je combinatiepakket zit.'];
const article = `<article><h3>${faq[0]}</h3><p>${faq[1]}</p></article>`;
const render = body => `<main>${body}</main>`;
test('price FAQ in metadata or hidden markup does not count as visible content', () => {
  for (const body of [
    `<script type="application/ld+json">${JSON.stringify(faq)}</script>`,
    `<section class="experience-questions" hidden>${article}</section>`,
    `<section class="experience-questions"><article><h3>${faq[0]}</h3><p hidden>${faq[1]}</p></article></section>`,
  ]) assert.ok(inspectRenderedContent(render(body), {questions: [faq]}).some(issue => issue.code === 'missing-rendered-faq'));
  assert.deepEqual(inspectRenderedContent(render(`<section class="experience-questions">${article}</section>`), {questions: [faq]}), []);
});
test('global navigation does not stand in for the missing contextual SEO tool block', () => {
  const link = '<a href="/tools/seo-audit">Start de audit</a>';
  assert.ok(inspectRenderedContent(render(`<nav>${link}</nav>`), {discoveryHref: '/tools/seo-audit'}).length);
  assert.deepEqual(inspectRenderedContent(render(`<section class="service-tool-discovery">${link}</section>`), {discoveryHref: '/tools/seo-audit'}), []);
});
test('case preservation derives its requirements from exposed baseline paragraphs', () => {
  const visible = 'De case legt de ontwerpkeuze uit.';
  const decorative = '<div role="img" aria-label="Vereenvoudigd mobiel ontwerp"><div aria-hidden="true"><p>Voorbeeldtekst in een telefoonscherm.</p></div></div>';
  const baseline = render(`<p>${visible}</p>${decorative}`);
  const requiredText = renderedMainParagraphs(baseline);
  assert.deepEqual(requiredText, [visible]);
  assert.deepEqual(inspectRenderedContent(baseline, {requiredText}), []);
  assert.deepEqual(inspectRenderedContent(render(`<p>${visible}</p>`), {requiredText}), []);
  for (const body of [decorative, `<div aria-hidden="true"><p>${visible}</p></div>${decorative}`]) {
    assert.deepEqual(inspectRenderedContent(render(body), {requiredText}), [{code:'missing-visible-text', text:visible}]);
  }
});
test('a missing main cannot silently produce an empty case preservation contract', () => {
  assert.throws(() => renderedMainParagraphs('<p>Geen hoofdinhoud.</p>'), /no main content/);
});
test('wrong visible price and nonexistent audit capability fail explicit publication contracts', () => {
  const prices = render('<p>Onepager op maat €995</p>');
  assert.ok(inspectRenderedContent(prices, {requiredText: ['€895'], forbiddenText: ['€995']}).some(issue => issue.code === 'unexpected-visible-claim'));
  assert.ok(inspectRenderedContent(render('<p>De audit controleert honderd pagina’s en herstelt automatisch je website.</p>'), {forbiddenText: ['herstelt automatisch je website']}).length);
});
const shortPage = {path:'/voorbeeld',purpose:'Werk laten uitvoeren',outcome:'Herstel afbakenen',mainText:'Ik herstel de afgesproken interne verwijzing.',sections:[{heading:'Werk',content:'De bronlink krijgt de bestaande juiste bestemming.'}],primaryAction:{href:'/contact',status:200,accessibleName:'Bespreek de wijziging'},claims:[]};
test('fictitious local customer evidence is flagged; a short complete page is retained', () => {
  assert.deepEqual(inspectEvidence(shortPage, {}), []);
  assert.ok(inspectEvidence({...shortPage, claims:[{id:'local-case',kind:'business',text:'Voor een Venlose klant verdubbelde de omzet.',verified:false}]}, {}).some(issue => issue.code === 'unverified-claim'));
});
test('synonyms do not hide an identical reader task', () => {
  assert.ok(comparePagePurpose(shortPage, {...shortPage,path:'/andere-woorden',mainText:'Een verwijzing verbeteren helpt een bezoeker bij de juiste pagina.'}).includes('same-reader-task'));
});
