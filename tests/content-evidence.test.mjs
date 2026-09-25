import test from 'node:test';
import assert from 'node:assert/strict';
import { inspectEvidence, comparePagePurpose } from '../lib/content-evidence.ts';
const page = {path:'/dienst',purpose:'Werk laten uitvoeren',outcome:'Een afgebakende opdracht bespreken',mainText:'We herstellen de interne verwijzing op de afgesproken pagina.',sections:[{heading:'Wat verandert er?',content:'De link verwijst rechtstreeks naar de bestaande dienstenpagina.'}],primaryAction:{href:'/contact',status:200,accessibleName:'Bespreek deze wijziging'},claims:[]};
test('korte concrete service is geldig zonder minimumlengte',()=>assert.deepEqual(inspectEvidence(page,{}),[]));
test('verzonnen review mist werkelijk bronbewijs',()=>{
  const fixture={...page,claims:[{id:'review-1',kind:'business',text:'Mijn omzet verdubbelde dankzij Sitesnit — fictieve klant',verified:false}]};
  assert.equal(inspectEvidence(fixture,{})[0].code,'unverified-claim');
});
test('prijs zonder zakelijke bevestiging en ongelabelde demo worden gevonden',()=>{
  assert.equal(inspectEvidence({...page,claims:[{id:'prijs',kind:'business',text:'Onderhoud kost 25 euro.'}]},{})[0].code,'unverified-claim');
  assert.equal(inspectEvidence({...page,claims:[{id:'demo',kind:'demonstration',text:'Een score van 100'}]},{})[0].code,'unlabelled-demo');
});
test('een echte maar niet passende bron valideert geen garantieclaim',()=>{
  const claim={id:'rankinggarantie',kind:'external',text:'Een sitemap garandeert indexering.',sourceId:'google'};
  assert.equal(inspectEvidence({...page,claims:[claim]},{google:{checked:'2026-09-22',supportedClaimIds:['sitemap-ontdekking']}})[0].code,'unsupported-source-claim');
  assert.equal(inspectEvidence({...page,claims:[claim]},{google:{checked:null,supportedClaimIds:['rankinggarantie']}})[0].code,'unchecked-source');
});
test('kop zonder antwoord en defecte hoofdlink blokkeren de technische inhoudscontrole',()=>{
  const problems=inspectEvidence({...page,sections:[{heading:'Hoe werkt het?',content:'  '}],primaryAction:{...page.primaryAction,status:404}},{});
  assert.deepEqual(problems.map(x=>x.code),['empty-section','primary-action-unverified']);
});
test('regionale plaatsnaamwissel wordt reviewpunt, geen automatische indexeringsbeslissing',()=>{
  const a={...page,mainText:'Wij maken websites in Venlo. Vraag een offerte aan.',places:['Venlo']};
  const b={...page,path:'/andere-stad',mainText:'Wij maken websites in Roermond. Vraag een offerte aan.',places:['Roermond']};
  assert.ok(comparePagePurpose(a,b).includes('place-name-only-copy'));
});
test('ander woordgebruik met dezelfde lezerstaak vereist inhoudelijke afweging',()=>{
  const b={...page,path:'/ander',mainText:'Een verwijzing aanpassen kan in een los afgesproken traject.'};
  assert.deepEqual(comparePagePurpose(page,b),['same-reader-task']);
});
test('gelijke CTA maakt verschillende hoofdtaken niet gelijk',()=>{
  const b={...page,path:'/kosten-uitleg',purpose:'Kostenopbouw uitleggen',outcome:'Een offerte leren beoordelen',mainText:'Hosting, bouw en onderhoud zijn afzonderlijke kostenposten.'};
  assert.deepEqual(comparePagePurpose(page,b),[]);
});
