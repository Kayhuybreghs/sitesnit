'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {speedMetrics,validSpeedResult,type SpeedResult} from '../../../lib/speed-test';
import {createToolEventTracker} from '../../../lib/analytics-events';
import {Arrow} from '../../ui';

export function SpeedClient(){
  const [url,setUrl]=useState(''),[device,setDevice]=useState<'mobile'|'desktop'>('mobile');
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[result,setResult]=useState<SpeedResult|null>(null);
  const controller=useRef<AbortController|null>(null),generation=useRef(0),heading=useRef<HTMLHeadingElement>(null);
  const tracker=useRef(createToolEventTracker('snelheidstest'));
  useEffect(()=>()=>{generation.current++;controller.current?.abort();},[]);
  useEffect(()=>{if(result)heading.current?.focus();},[result]);
  function clear(){setResult(null);setError('');}
  function cancel(){generation.current++;controller.current?.abort();setBusy(false);setError('Meting afgebroken. Je kunt het adres aanpassen en opnieuw starten.');}
  async function submit(event:FormEvent){
    event.preventDefault();if(busy)return;
    clear();setBusy(true);tracker.current.reset();tracker.current.start();
    const current=++generation.current,abort=new AbortController();controller.current=abort;
    const timeout=setTimeout(()=>abort.abort(),115000);
    try{
      const response=await fetch('/api/speed-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url,device}),signal:abort.signal});
      const raw:unknown=await response.json().catch(()=>{throw Error('Er is geen leesbaar meetresultaat ontvangen. Probeer later opnieuw.');});
      const data=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
      if(!response.ok)throw Error(typeof data.error==='string'?data.error:'De meting is niet gelukt. Probeer later opnieuw.');
      const report=data.result as SpeedResult|undefined;
      if(!validSpeedResult(report)||report.device!==device)throw Error('Er is geen volledig meetresultaat ontvangen. Probeer later opnieuw.');
      if(generation.current!==current)return;
      setResult(report);tracker.current.complete();
    }catch(err){if(generation.current===current)setError(abort.signal.aborted?'De meting duurde te lang. Probeer later opnieuw.':(err as Error).message);}
    finally{clearTimeout(timeout);if(generation.current===current)setBusy(false);}
  }
  return <>
    <section className="speed-workbench" id="snelheid-meten" aria-labelledby="speed-form-title">
      <div className="speed-form-heading"><span className="eyebrow">Eén pagina · jouw apparaatkeuze</span><h2 id="speed-form-title">Hoe snel laadt jouw pagina?</h2><p>Vul een openbaar adres in. Je krijgt de meting hier te zien, zonder vragenlijst.</p></div>
      <form onSubmit={submit} aria-busy={busy}>
        <label htmlFor="speed-url">Websiteadres</label><input id="speed-url" name="url" value={url} onChange={e=>{setUrl(e.target.value);clear();}} required maxLength={1800} inputMode="url" autoComplete="url" placeholder="https://www.jouwbedrijf.nl/diensten" disabled={busy} aria-describedby="speed-privacy"/>
        <fieldset disabled={busy}><legend>Testomgeving</legend><div className="speed-devices">{(['mobile','desktop'] as const).map(value=><label key={value}><input type="radio" name="device" checked={device===value} onChange={()=>{setDevice(value);clear();}} value={value}/><span>{value==='mobile'?'Mobiel':'Desktop'}</span></label>)}</div></fieldset>
        <p id="speed-privacy" className="speed-note">Met Start snelheidstest stuur je dit pagina-adres naar Google PageSpeed Insights. Gebruik een openbare pagina zonder inloggegevens of parameters. <a href="/privacy#technische-scan">Over de verwerking van je adres</a>.</p>
        <div className="speed-form-actions"><button className="button" disabled={busy} type="submit">{busy?'Pagina wordt gemeten…':<>Start snelheidstest <Arrow/></>}</button>{busy&&<button className="text-link" type="button" onClick={cancel}>Meting afbreken</button>}</div>
        {busy&&<p className="speed-loading" role="status">Google opent de pagina en onderzoekt het laden. Dit kan ongeveer twee minuten duren. Er wordt nog geen score getoond.</p>}
        {error&&<p className="speed-error" role="alert">{error}</p>}
      </form>
    </section>
    {result&&<section className="speed-result" aria-labelledby="speed-result-title">
      <div className="speed-result-heading"><div><span className="eyebrow">Lighthouse · {result.device==='mobile'?'mobiele':'desktop'} labtest</span><h2 id="speed-result-title" tabIndex={-1} ref={heading}>Dit laat jouw meting zien.</h2><p className="speed-result-url">{result.finalUrl}</p>{result.finalUrl!==result.requestedUrl&&<p className="speed-note">Ingevoerd: {result.requestedUrl}. Google heeft een ander eindadres gemeten.</p>}</div>
        <div className={`speed-score ${result.score>=90?'speed-good':result.score>=50?'speed-medium':'speed-poor'}`}><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle cx="60" cy="60" r="52" pathLength="100" strokeDasharray={`${result.score} 100`} transform="rotate(-90 60 60)"/></svg><strong>{result.score}<small>/ 100</small></strong><span>Prestaties</span></div>
      </div>
      <p className="speed-note">Gemeten op {new Date(result.fetchTime).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'})} (Amsterdam) · Lighthouse {result.version||'versie niet doorgegeven'}. Eén pagina, één meetmoment. <a href="/tools/snelheidstest/pagespeed-score">Zo lees je de prestatiescore</a>.</p>
      {result.warnings.length>0&&<aside className="speed-warning"><h3>Beperkingen bij deze meting</h3><ul>{result.warnings.map((warning,i)=><li key={i}>{warning}</li>)}</ul></aside>}
      <div className="speed-metrics">{speedMetrics.map(metric=>{const measured=result.metrics.find(item=>item.id===metric.id);return <article key={metric.id}><span>{metric.short}</span><h3>{metric.label}</h3><strong>{measured?.displayValue??'Niet ontvangen'}</strong><p>{metric.explanation}</p></article>;})}</div>
      <div className="speed-result-context"><h3>Van cijfer naar oorzaak</h3><p>De prestatiescore combineert deze laadmetingen met verschillende gewichten. Een laag cijfer wijst niet vanzelf één bestand aan. Gebruik de onderstaande bevindingen voor je volgende stap.</p><p>Deze test meet geen INP van echte bezoekers. Daarvoor zijn andere gegevens nodig. Lees het <a href="/tools/snelheidstest/core-web-vitals">verschil tussen een labtest en Core Web Vitals</a>.</p></div>
      <h3 className="speed-section-title">Aandachtspunten uit deze meting <span>{result.findings.length}</span></h3>
      {result.findings.length?result.findings.map((finding,index)=><details className="speed-finding" key={finding.id} open={index===0}><summary>{finding.title}</summary><p><b>Gevonden:</b> {finding.what}</p><p>{finding.why}</p><p><b>Volgende stap:</b> {finding.action}</p>{finding.evidence?.length?<div className="speed-evidence"><h4>Voorbeelden uit het rapport</h4>{finding.evidence.map((e,i)=><pre key={i}>{e}</pre>)}</div>:<p className="speed-note">Google gaf bij deze bevinding geen bestands- of codevoorbeeld mee.</p>}</details>):<p>Er zijn geen aanvullende aandachtspunten uit de ontvangen prestatie-audits gehaald. Controleer ook de laadmetingen en eventuele waarschuwingen. Dit bewijst niet dat er nergens iets te verbeteren is.</p>}
      <details className="speed-passed"><summary>Wat ging goed in deze test? ({result.passed.length})</summary>{result.passed.length?<ul>{result.passed.map(item=><li key={item.id}><strong>{item.title}</strong><p>{item.description}</p>{item.evidence.map((e,i)=><pre key={i}>{e}</pre>)}</li>)}</ul>:<p>Geen afzonderlijke geslaagde prestatiecontroles meegegeven.</p>}</details>
      <p className="speed-note">Meet na een gerichte aanpassing opnieuw met dezelfde URL en apparaatkeuze. Geschatte tijdwinst uit verschillende audits kun je niet zomaar bij elkaar optellen.</p>
    </section>}
  </>;
}
