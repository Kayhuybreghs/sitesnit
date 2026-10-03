import {speedFixture} from './speed.mjs';
import {normalizeSpeedResult} from '../../lib/speed-test.ts';
/** Synthetic provider response, deliberately rich enough to exceed the contact field. */
export function richSpeedProvider(device='mobile',url='https://example.com/') {
  const raw=speedFixture(device),lhr=raw.lighthouseResult;
  lhr.finalUrl=url;lhr.fetchTime=device==='mobile'?'2026-10-03T10:00:00Z':'2026-10-03T10:01:00Z';
  lhr.categories.performance.score=device==='mobile'?.62:.94;
  delete lhr.audits['unused-javascript'];
  for(let i=0;i<11;i++)lhr.audits['rich-fixture-'+i]={score:.3,scoreDisplayMode:'numeric',title:'Synthetische controle '+(i+1),description:'Uitsluitend lokale testdata; geen echte scan.',displayValue:'Ontvangen fixturebewijs',details:{items:Array.from({length:3},(_,j)=>({url:`https://example.com/assets/${device}-${i}-${j}.js`,node:{snippet:'<script data-fixture="'+('🧪 rijke bewijsregel '.repeat(10))+'"></script>',explanation:'Een synthetisch element; geen vastgestelde oorzaak bij een klant.'},label:'Fixture detail '+j,wastedBytes:20480}))}};
  lhr.categories.performance.auditRefs=Object.keys(lhr.audits).map(id=>({id}));
  return raw;
}
export function richSpeedStates(url='https://example.com/') {
  return Object.fromEntries(['mobile','desktop'].map(device=>[device,{status:'success',result:normalizeSpeedResult(richSpeedProvider(device,url),url,device)}]));
}
export function contactPayload(toolSummary='',extra={}) {
  return {requestId:'12345678-1234-4234-8234-123456789abc',name:'SYNTHETISCHE rapportproef',email:'rich-visitor@example.invalid',message:'Mijn eigen vraag blijft helemaal ongewijzigd. 🧪',website:'https://example.com/',serviceId:'seo-optimalisatie',sourcePage:'/tools/snelheidstest',formId:'tool_contact',includeSummary:true,toolSummary,...extra};
}
