'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {publicWebsiteUrl} from '../../../lib/url';
import {speedResultMatches,speedReportText,deviceName,type SpeedDevice,type SpeedState} from '../../../lib/speed-report';
import {speedContactSummary} from '../../../lib/speed-contact-summary';
import {createToolEventTracker} from '../../../lib/analytics-events';
import {ToolActions,ToolContact} from '../tool-components';
import {SpeedReport,SpeedComparison} from './speed-report';
import {Arrow} from '../../ui';
type Selection=SpeedDevice|'both';
type Results=Record<string,Partial<Record<SpeedDevice,SpeedState>>>;
export function SpeedClient(){
  const [url,setUrl]=useState(''),[device,setDevice]=useState<Selection>('mobile');
  const [results,setResults]=useState<Results>({}),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [completed,setCompleted]=useState(0),heading=useRef<HTMLHeadingElement>(null);
  const active=useRef(false),generation=useRef(0),controllers=useRef<Partial<Record<SpeedDevice,AbortController>>>({});
  useEffect(()=>()=>{generation.current++;Object.values(controllers.current).forEach(c=>c.abort());},[]);
  useEffect(()=>{if(completed)heading.current?.focus();},[completed]);
  let normalized='';try{normalized=publicWebsiteUrl(url);}catch{}
  const current=results[normalized]??{},devices:SpeedDevice[]=device==='both'?['mobile','desktop']:[device];
  const hasResult=Object.values(current).some(state=>state.result);
  const summary=speedReportText(normalized,current);
  const contactSummary=speedContactSummary(normalized,current);
  function update(key:string,kind:SpeedDevice,patch:Partial<SpeedState>){setResults(previous=>({...previous,[key]:{...previous[key],[kind]:{status:'idle',...previous[key]?.[kind],...patch}}}));}
  function cancel(kind?:SpeedDevice){
    for(const selected of kind?[kind]:Object.keys(controllers.current) as SpeedDevice[]){
      const controller=controllers.current[selected];if(controller){controller.abort('cancelled');update(normalized,selected,{status:'cancelled',error:'Meting afgebroken. Je kunt deze kant opnieuw proberen.'});}
    }
  }
  async function run(selected:SpeedDevice[]){
    if(active.current)return;let key:string;
    try{key=publicWebsiteUrl(url);}catch(err){setError((err as Error).message);return;}
    active.current=true;setBusy(true);setError('');
    const runId=++generation.current,tracker=createToolEventTracker('snelheidstest');tracker.start();
    // One start per user run; completion requires all measurements requested in this run.
    const outcomes=await Promise.all(selected.map(async kind=>{
      const controller=new AbortController();controllers.current[kind]=controller;
      update(key,kind,{status:'loading',error:undefined});
      const timer=setTimeout(()=>controller.abort('timeout'),115000);
      try{
        const response=await fetch('/api/speed-test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:key,device:kind}),signal:controller.signal});
        const raw:unknown=await response.json().catch(()=>{throw Error('Er is geen leesbaar meetresultaat ontvangen. Probeer later opnieuw.');});
        const data=raw&&typeof raw==='object'?raw as Record<string,unknown>:{};
        if(!response.ok)throw Error(typeof data.error==='string'?data.error:'De meting is niet gelukt. Probeer later opnieuw.');
        if(!speedResultMatches(data.result,key,kind))throw Error('Er is geen volledig meetresultaat voor dit adres en apparaat ontvangen. Probeer later opnieuw.');
        if(runId!==generation.current||controller.signal.aborted)return false;
        update(key,kind,{status:'success',result:data.result,error:undefined});return true;
      }catch(err){
        if(runId===generation.current)update(key,kind,{status:controller.signal.reason==='cancelled'?'cancelled':'error',error:controller.signal.reason==='cancelled'?'Meting afgebroken. Je kunt deze kant opnieuw proberen.':controller.signal.aborted?'De meting duurde te lang. Probeer deze kant opnieuw.':(err as Error).message});
        return false;
      }finally{clearTimeout(timer);if(runId===generation.current)delete controllers.current[kind];}
    }));
    if(runId!==generation.current)return;
    if(outcomes.every(Boolean))tracker.complete();
    active.current=false;setBusy(false);setCompleted(n=>n+1);
  }
  function submit(event:FormEvent){event.preventDefault();void run(devices);}
  return <>
    <section className="speed-workbench" id="snelheid-meten" aria-labelledby="speed-form-title">
      <div className="speed-form-heading"><h2 id="speed-form-title">Welke pagina wil je meten?</h2><p>Kies Googles meetomgeving. Je eigen apparaat bepaalt die keuze niet.</p></div>
      <form onSubmit={submit} aria-busy={busy}>
        <label htmlFor="speed-url">Websiteadres</label><input id="speed-url" name="url" value={url} onChange={e=>{setUrl(e.target.value);setError('');}} required maxLength={1800} inputMode="url" autoComplete="url" placeholder="https://www.jouwbedrijf.nl/diensten" disabled={busy} aria-describedby="speed-privacy"/>
        <fieldset disabled={busy}><legend>Testomgeving</legend><div className="speed-devices">{(['mobile','desktop','both'] as const).map(value=><label key={value}><input type="radio" name="device" checked={device===value} onChange={()=>setDevice(value)} value={value}/><span>{value==='both'?'Beide vergelijken':deviceName(value)}</span></label>)}</div></fieldset>
        <p id="speed-privacy" className="speed-note">Starten stuurt dit openbare adres naar Google PageSpeed Insights. Geen privélinks, inloggegevens of parameters. <a href="/privacy#technische-scan" target="_blank" rel="noopener noreferrer">Privacy bij je meting (nieuw tabblad)</a>.</p>
        <div className="speed-form-actions"><button className="button" disabled={busy} type="submit">{busy?'Pagina wordt gemeten…':<>Start snelheidstest <Arrow/></>}</button>{busy&&<button className="text-link" type="button" onClick={()=>cancel()}>Alle metingen afbreken</button>}</div>
        <p className="speed-note">Beide vergelijken gebruikt twee van de vijf scanverzoeken per tien minuten. Je deelt deze limiet met je netwerk.</p>
        {error&&<p className="speed-error" role="alert">{error}</p>}
      </form>
    </section>
    {Object.keys(current).length>0&&<section className="speed-results" aria-labelledby="speed-result-title">
      <h2 id="speed-result-title" tabIndex={-1} ref={heading}>Jouw metingen voor deze pagina</h2>
      <p className="speed-note">Wissel hierboven tussen Mobiel, Desktop en Beide vergelijken om ontvangen resultaten terug te zien. Ze blijven in dit tabblad zolang je deze pagina openhoudt. Uitleg opent in een nieuw tabblad.</p>
      {device==='both'&&<><p>Twee afzonderlijke labtests, met eigen meetmomenten. Een verschil bewijst op zichzelf geen oorzaak. Er is geen gemiddelde score.</p>{current.mobile?.result&&current.desktop?.result&&current.mobile.result.finalUrl!==current.desktop.result.finalUrl&&<p className="speed-warning">De eindadressen verschillen. Google heeft verschillende eindpagina’s gemeten; vergelijk de cijfers daarom niet alsof ze dezelfde pagina beschrijven.</p>}</>}
      {device==='both'&&<SpeedComparison states={current}/>}
      <div className={'speed-result-grid '+(device==='both'?'speed-comparison':'')}>{devices.map(kind=>{const state=current[kind];return <article className="speed-result" key={kind} data-device={kind} aria-labelledby={'speed-'+kind+'-title'}>
        <h3 id={'speed-'+kind+'-title'}>{deviceName(kind)}</h3>
        {state?.status==='loading'&&<div className="speed-loading"><p role="status">Google opent de pagina voor {deviceName(kind).toLowerCase()}. Dit kan ongeveer twee minuten duren.</p><button type="button" className="text-link" onClick={()=>cancel(kind)}>Breek {deviceName(kind).toLowerCase()} af</button></div>}
        {state?.error&&<p className="speed-error" role="alert">{state.error}</p>}
        {(state?.status==='error'||state?.status==='cancelled')&&<button className="button button-secondary" type="button" disabled={busy} onClick={()=>void run([kind])}>Probeer {deviceName(kind).toLowerCase()} opnieuw</button>}
        {state?.result?<>{state.status!=='success'&&<p className="speed-warning">Eerdere meting. Dit is geen nieuwe geslaagde uitslag.</p>}<SpeedReport result={state.result}/></>:state?.status!=='loading'&&<p>Voor {deviceName(kind).toLowerCase()} is nog geen geslaagde meting beschikbaar.</p>}
      </article>;})}</div>
      {hasResult&&<><ToolActions summary={summary} filename="meetrapport-snelheid" copyLabel="Kopieer meetrapport" downloadLabel="Download meetrapport als tekst"/><ToolContact key={normalized} website={normalized} selectedService="seo-optimalisatie" summary={contactSummary.text} summaryNotice={contactSummary.notice} summaryUnavailable={contactSummary.unavailable} summaryPreviewLabel="Samenvatting die je meestuurt" title="Bespreek deze meting" buttonLabel="Bespreek deze meting" text="Leg je vraag voor aan Kay. Controleer hieronder je adres en de compacte samenvatting voordat je die meestuurt."/></>}
    </section>}
  </>;
}
