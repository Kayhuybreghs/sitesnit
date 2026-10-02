import {normalizeLighthouse, type TechnicalResult} from './lighthouse';
import {publicWebsiteUrl} from './url';

export const speedMetrics = [
  {id:'first-contentful-paint',label:'Eerste inhoud',short:'FCP',unit:'ms',explanation:'Wanneer de eerste tekst of afbeelding zichtbaar wordt.'},
  {id:'largest-contentful-paint',label:'Belangrijkste inhoud',short:'LCP',unit:'ms',explanation:'Wanneer het grootste zichtbare inhoudselement verschijnt. Dat kan tekst of een afbeelding zijn.'},
  {id:'total-blocking-time',label:'Blokkeertijd',short:'TBT',unit:'ms',explanation:'Opgetelde blokkeertijd tijdens het laden. Dit is een labsignaal, geen meting van INP bij echte bezoekers.'},
  {id:'cumulative-layout-shift',label:'Verspringingen',short:'CLS',unit:'score',explanation:'Hoeveel zichtbare onderdelen onverwacht verschuiven tijdens deze laadtest. Lager is beter.'},
  {id:'speed-index',label:'Visuele opbouw',short:'SI',unit:'ms',explanation:'Hoe snel het zichtbare deel van de pagina wordt opgebouwd in deze test.'},
] as const;
export type SpeedResult = {
  device:'mobile'|'desktop'; score:number; requestedUrl:string; finalUrl:string;
  fetchTime:string; version:string; warnings:string[];
  metrics:{id:string;value:number;displayValue:string}[];
  findings:TechnicalResult['findings']; passed:TechnicalResult['audits'];
};
export function validSpeedResult(value:unknown):value is SpeedResult {
  if(!value||typeof value!=='object')return false;
  const r=value as SpeedResult,strings=(x:unknown):x is string[]=>Array.isArray(x)&&x.every(v=>typeof v==='string');
  const text=(x:unknown)=>typeof x==='string';
  return ['mobile','desktop'].includes(r.device)&&Number.isFinite(r.score)&&r.score>=0&&r.score<=100&&text(r.requestedUrl)&&text(r.finalUrl)&&text(r.fetchTime)&&Number.isFinite(Date.parse(r.fetchTime))&&text(r.version)&&strings(r.warnings)&&
    Array.isArray(r.metrics)&&r.metrics.length===5&&speedMetrics.every(m=>r.metrics.filter(v=>v&&v.id===m.id&&Number.isFinite(v.value)&&v.value>=0&&text(v.displayValue)).length===1)&&
    Array.isArray(r.findings)&&r.findings.every(f=>f&&[f.id,f.title,f.what,f.why,f.action].every(text)&&strings(f.evidence))&&
    Array.isArray(r.passed)&&r.passed.every(a=>a&&[a.id,a.title,a.description].every(text)&&strings(a.evidence));
}
export function normalizeSpeedResult(input:unknown,url:string,device:'mobile'|'desktop'):SpeedResult {
  const data=input as {lighthouseResult?:{audits?:Record<string,{numericValue?:unknown}>}};
  const result=normalizeLighthouse(input,url,device);
  const score=result.categories.find(item=>item.id==='performance')?.score;
  if(typeof score!=='number')throw Error('Geen geldige prestatiescore ontvangen.');
  const metrics=speedMetrics.map(metric=>{
    const value=data.lighthouseResult?.audits?.[metric.id]?.numericValue;
    if(typeof value!=='number'||!Number.isFinite(value)||value<0)throw Error('Onvolledige snelheidsmeting ontvangen.');
    return {id:metric.id,value,displayValue:metric.unit==='score'?value.toLocaleString('nl-NL',{maximumFractionDigits:3}):metric.id==='total-blocking-time'?`${Math.round(value)} ms`:`${(value/1000).toLocaleString('nl-NL',{maximumFractionDigits:2})} s`};
  });
  // Redirects are shown as text only; reject private or credential-bearing output too.
  const finalUrl=publicWebsiteUrl(result.finalUrl);
  return {device,score,requestedUrl:url,finalUrl,fetchTime:result.fetchTime,version:result.version,metrics,
    findings:result.findings.filter(item=>item.category==='performance'),
    passed:result.audits.filter(item=>item.score===1&&['binary','numeric','metricSavings'].includes(item.mode)&&!speedMetrics.some(metric=>metric.id===item.id)),warnings:result.warnings};
}
