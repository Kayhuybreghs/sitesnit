'use client';
import { InlineArrow } from '../../inline-arrow';
import dynamic from 'next/dynamic';
import {auditCapabilities} from '../../../lib/seo-audit/capabilities';
import {hasUsableAuditEvidence,readAuditResponse} from '../../../lib/seo-audit/client-result';
const AuditOverview=dynamic(()=>import('./audit-overview').then(module=>module.AuditOverview),{loading:()=> <p role="status">Je ontvangen rapport wordt klaargezet…</p>});
import {useRef,useState} from 'react';
import {createToolEventTracker} from '../../../lib/analytics-events';
import type {AuditReport} from '../../../lib/seo-audit/crawl';
import {ToolContact} from '../tool-components';
export function AuditClient({children,admin=false}:{children?:React.ReactNode;admin?:boolean}){
 const active=useRef(false);
 const [tracker]=useState(()=>createToolEventTracker('seo_audit'));
 const [url,setUrl]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[report,setReport]=useState<AuditReport|null>(null),[filter,setFilter]=useState('alle');
 async function start(event:React.FormEvent){
  event.preventDefault();
  if(active.current)return;
  active.current=true;setError('');setReport(null);setBusy(true);tracker.start();
  try{
   const response=await fetch('/api/seo-audit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url}),signal:AbortSignal.timeout(auditCapabilities.clientTimeoutMs)});
   const data=await readAuditResponse(response);setReport(data);
   if(hasUsableAuditEvidence(data))tracker.complete();
  }catch(error){setError(error instanceof Error&&error.name==='TimeoutError'
   ?'De scan duurde te lang. Er is geen nieuwe uitkomst beschikbaar. Een timeout is geen oordeel over je website.'
   :error instanceof TypeError?'De verbinding met de scanner is onderbroken. Er is geen nieuwe uitkomst beschikbaar.'
   :error instanceof Error?error.message:'De scan kon niet worden afgerond.');}
  finally{active.current=false;setBusy(false);}
 }
 const groups=report?Array.from(new Set(report.findings.map(f=>f.code))).map(code=>({code,items:report.findings.filter(f=>f.code===code)})):[];
 const summary=report?`SEO-audit van ${report.origin}, ${report.checkedAt}. ${report.pages.length} URL’s onderzocht. ${report.findings.length} bevindingen. Belangrijkste punten: ${report.findings.slice(0,5).map(f=>`${f.title} (${f.url}): ${f.evidence}`).join('\n')}`:'';
 return <div id="start-audit" className="audit-interactive"><form className="audit-workbench" onSubmit={start}><span className="eyebrow">Geen vragenlijst · alleen je websiteadres</span><h2>Wat houdt je website tegen?</h2><label htmlFor="audit-url">Openbaar websiteadres</label><div className="audit-input-row"><input id="audit-url" value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://www.jouwbedrijf.nl" required maxLength={1800} autoComplete="url" inputMode="url" disabled={busy}/><button className="button" disabled={busy}>{busy?'Website wordt onderzocht…':<>Start SEO-audit <InlineArrow /></>}</button></div><p>{admin?`Beheerdersscan: geen dagelijkse limiet. Maximaal ${auditCapabilities.maxPages} pagina’s per scan.`:`Maximaal ${auditCapabilities.maxPages} pagina’s. ${auditCapabilities.dailyAttempts} poging per netwerk per dag (reset om ${auditCapabilities.resetTime}).`} Geen account of e-mailadres nodig. Scan alleen een website waarvoor je toestemming hebt.</p><p className="small">We bezoeken openbare pagina’s namens deze audit. Voor de mobiele labtest sturen we het startadres naar Google PageSpeed Insights. Resultaten blijven in dit tabblad. Alleen als je ze hieronder meestuurt komen ze bij je aanvraag. <a href="/privacy">Over gegevens en bewaring</a></p>{busy&&<div className="audit-progress" role="status"><span/>Robotsregels lezen, pagina’s volgen en bevindingen vergelijken. Daarna volgt een mobiele Lighthouse-labtest. Dit kan ongeveer {auditCapabilities.clientTimeoutMs / 60000} minuten duren.</div>}{error&&<p className="audit-error" role="alert">{error}</p>}</form>
 {report&&<section className="audit-workbench audit-result" aria-live="polite"><span className="eyebrow">Jouw technische overzicht</span><h2>{report.findings.some(f=>f.priority==='hoog')?'Begin bij deze blokkades.':report.findings.length?'Een gerichte lijst om mee verder te gaan.':'Geen bevindingen binnen deze controles.'}</h2><p>{report.origin} · {new Date(report.checkedAt).toLocaleString('nl-NL')} · {report.limited?'Gedeeltelijke crawl':'Ontdekte route afgerond binnen de limieten'}</p><AuditOverview report={report}/><p className="small">{report.discovered} URL’s ontdekt. Zonder gevonden noindex betekent niet dat een pagina in Google staat.</p><a className="button" href="#audit-bespreken">Bespreek mijn verbeterpunten <InlineArrow /></a><details><summary>Wat is wel en niet onderzocht?</summary><ul>{report.notes.map((note,i)=><li key={i}>{note}</li>)}</ul></details><div className="audit-filters" aria-label="Filter bevindingen">{['alle','hoog','middel','controle'].map(f=><button type="button" aria-pressed={filter===f} onClick={()=>setFilter(f)} key={f}>{f==='alle'?'Alle bevindingen':f==='controle'?'Handmatig beoordelen':`Prioriteit ${f}`}</button>)}</div><div className="audit-findings">{groups.filter(group=>filter==='alle'||group.items[0].priority===filter).map(group=>{const f=group.items[0];return <article key={group.code}><span className={`audit-priority priority-${f.priority}`}>{f.priority==='controle'?'Beoordelen':`Prioriteit ${f.priority}`}</span><h3>{f.title}</h3><p><strong>{group.items.length}</strong> getroffen URL{group.items.length===1?'':'’s'} binnen deze crawl</p><dl><dt>Waarom bekijken?</dt><dd>{f.why}</dd><dt>Volgende stap</dt><dd>{f.action}</dd></dl><details><summary>Bekijk URL’s en vastgesteld bewijs</summary><ul className="audit-evidence">{group.items.map((item,i)=><li key={i}><strong>{item.url}</strong><p>{item.evidence}</p></li>)}</ul></details></article>;})}</div>{!groups.some(group=>filter==='alle'||group.items[0].priority===filter)&&<p>Geen bevindingen binnen dit filter.</p>}<details><summary>Alle onderzochte URL’s</summary><ul>{report.pages.map(p=><li key={p.url}>{p.status} · {p.url} · {p.title||'zonder titel'}</li>)}</ul></details></section>}
 {report&&<ToolContact id="audit-bespreken" alwaysOpen summary={summary} title="Van een lijst naar een betere website." text="Bespreek welke punten we kunnen herstellen en of een herontwerp zinvol is. Je hoeft de gevonden punten niet zelf naar technische oplossingen te vertalen." formTitle="Bespreek mijn SEO-audit"/>}{children}
 </div>;
}
