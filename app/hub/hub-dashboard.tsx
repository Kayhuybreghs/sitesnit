import type { ReactNode } from 'react';
import type { Period, ProviderResult } from '../../lib/hub/providers/common';
import type { Ga4Data, Ga4Report } from '../../lib/hub/providers/ga4';
import type { SearchConsoleData, SearchReport } from '../../lib/hub/providers/search-console';
import type { Deployment } from '../../lib/hub/providers/vercel';
import './hub.css';
import {TrafficCharts} from './traffic-charts';

export type HubSection = 'overzicht' | 'bezoekers' | 'google' | 'status' | 'werkzaamheden';
export type HubSnapshots = {
  ga4?: Partial<Ga4Data> | null;
  searchConsole?: Partial<SearchConsoleData> | null;
  deployments?: ProviderResult<Deployment[]> | null;
  stale?: Partial<Record<'ga4' | 'search-console' | 'vercel', boolean>>;
};
export type HubWorkItem = { id: string; title: string; detail: string; status: 'open' | 'in_progress' | 'completed'; evidence: string; updatedAt: string };
export type HubUptime = {
  checks: { checkedAt: string; status: 'up' | 'down' | 'unknown'; httpStatus: number | null; latencyMs: number | null; location?: string | null }[];
  period: Period | null; expectedChecks: number | null; sourceLabel?: string;
};
export type HubDashboardProps = {
  site: { id: string; name: string; origin: string };
  section: HubSection;
  snapshots: HubSnapshots;
  workItems: HubWorkItem[];
  uptime?: HubUptime | null;
  isDemo?: boolean;
  preview?: boolean;
};

// Audit results require an explicit site-bound grant. No audit product is connected yet.
const tabs: [HubSection, string][] = [['overzicht', 'Overzicht'], ['bezoekers', 'Bezoekers'], ['google', 'Google'], ['status', 'Status'], ['werkzaamheden', 'Werkzaamheden']];
const sectionCopy: Record<HubSection, [string, string]> = {
  overzicht: ['Je website, in beeld.', 'Bezoek, vindbaarheid en uitgevoerd werk. Ieder onderdeel met zijn eigen bron en meetperiode.'],
  bezoekers: ['Wie komt er kijken?', 'Lees bezoekstatistieken en gemeten handelingen naast elkaar. Toestemming en beschikbare metingen bepalen wat zichtbaar is.'],
  google: ['Gevonden in Google.', 'Zoekverkeer uit Search Console. De totalen en de uitsplitsingen hebben ieder hun eigen betekenis.'],
  status: ['De techniek volgen.', 'Bereikbaarheidscontroles en productiedeployments, met een duidelijk onderscheid tussen de twee.'],
  werkzaamheden: ['Zicht op het werk.', 'Wat staat open, wat is in uitvoering en wat is afgerond? Bij iedere taak zie je de toelichting en vastgelegde controle.'],
};
const sourceNames = { ga4: 'Google Analytics 4', 'search-console': 'Google Search Console', vercel: 'Vercel' };
const workLabels = { open: 'Open', in_progress: 'In uitvoering', completed: 'Afgerond' };
const number = (value: number | null | undefined, digits = 0) => typeof value === 'number' && Number.isFinite(value)
  ? new Intl.NumberFormat('nl-NL', { maximumFractionDigits: digits }).format(value) : 'Onbekend';
function time(value: string | null | undefined) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Onbekend';
  return new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' }).format(new Date(value));
}
function periodLabel(period: Period | null | undefined) { return period ? `${period.startDate} t/m ${period.endDate}` : 'Meetperiode onbekend'; }
function displayOrigin(value: string) { try { return new URL(value).hostname; } catch { return 'Websiteadres niet beschikbaar'; } }
function availability(report: ProviderResult<unknown> | null | undefined) {
  if (!report || report.code === 'not-configured') return 'Nog niet gekoppeld';
  if (report.code === 'no-data') return 'Gekoppeld · nog geen gegevens voor deze periode';
  if (report.state === 'error') return report.code === 'quota' ? 'Bronlimiet bereikt' : report.code === 'authentication' ? 'Toegang tot de bron controleren' : 'Ophalen niet gelukt';
  if (report.state !== 'ready' || report.data === null) return 'Gegevens niet beschikbaar';
  return 'Gegevens beschikbaar';
}
function SourceMeta({ report, source, stale = false }: { report?: ProviderResult<unknown> | null; source: keyof typeof sourceNames; stale?: boolean }) {
  const hasOldData = stale && report?.state === 'ready';
  return <div className="hub-source-meta"><p><span className={`hub-badge ${hasOldData ? 'is-warning' : report?.state === 'ready' ? 'is-ready' : 'is-muted'}`}>{hasOldData ? 'Oudere gegevens' : availability(report)}</span><span>{sourceNames[source]}</span></p><dl><div><dt>Periode</dt><dd>{periodLabel(report?.period)}</dd></div><div><dt>Brontijdzone</dt><dd>{report?.timeZone || 'Niet doorgegeven'}</dd></div><div><dt>Opgehaald</dt><dd>{time(report?.fetchedAt)}{report?.fetchedAt ? ' · Amsterdam' : ''}</dd></div></dl>{hasOldData && <p className="hub-note">Dit is een eerdere meting. Verversen is nodig; lees deze cijfers niet als de actuele stand.</p>}{report?.warnings.length ? <details><summary>Beperkingen van deze bron</summary><ul>{report.warnings.map((warning, i) => <li key={i}>{warning}</li>)}</ul></details> : null}</div>;
}
function Panel({ title, eyebrow, children, className = '' }: { title: string; eyebrow?: string; children: ReactNode; className?: string }) {
  return <section className={`hub-panel ${className}`}>{eyebrow && <p className="hub-kicker">{eyebrow}</p>}<h2>{title}</h2>{children}</section>;
}
function Empty({ children }: { children: ReactNode }) { return <div className="hub-empty"><span aria-hidden="true">—</span><p>{children}</p></div>; }
function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return <div className="hub-stat"><span>{label}</span><strong className={value === 'Onbekend' ? 'hub-unknown' : ''}>{value}</strong><p>{note}</p></div>;
}
function metric(report: ProviderResult<Ga4Report> | null | undefined, name: string) {
  return report?.state === 'ready' ? report.data?.rows[0]?.metrics[name] : undefined;
}
function Table({ headers, rows, caption }: { headers: string[]; rows: (string | number)[][]; caption: string }) {
  return <div className="hub-table-wrap" role="region" aria-label={caption} tabIndex={0}><table className="hub-table"><caption>{caption}</caption><thead><tr>{headers.map(header => <th scope="col" key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => j === 0 ? <th scope="row" key={j}>{cell}</th> : <td key={j}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
function GaBreakdown({ title, report, dimension, label, stale }: { title: string; report?: ProviderResult<Ga4Report>; dimension: string; label: string; stale?: boolean }) {
  const rows = report?.state === 'ready' ? report.data?.rows : null;
  return <Panel title={title}>{rows?.length ? <><Table caption={title} headers={[label, 'Sessies', 'Gebruikers']} rows={rows.slice(0, 15).map(row => [row.dimensions[dimension] || 'Niet beschikbaar', number(row.metrics.sessions), number(row.metrics.totalUsers)])}/><p className="hub-note">Maximaal 15 opgehaalde rijen. Gebruikers per rij kunnen overlappen; tel ze niet op tot een uniek totaal.</p></> : <Empty>{availability(report)}. Ontbrekende metingen zijn geen nul bezoekers.</Empty>}<SourceMeta report={report} source="ga4" stale={stale}/></Panel>;
}
function EventsPanel({ report, stale }: { report?: ProviderResult<Ga4Report>; stale?: boolean }) {
  const labels: Record<string, string> = { tool_start: 'Tool gestart', tool_complete: 'Tooluitkomst opgevraagd', cta_click: 'Belangrijke knop aangeklikt' };
  const rows = report?.state === 'ready' ? report.data?.rows.filter(row => Object.hasOwn(labels, row.dimensions.eventName)) : null;
  return <Panel title="Tools & belangrijke knoppen" eyebrow="Gemeten handelingen">{rows?.length ? <Table caption="Gebeurtenissen na analyse-toestemming" headers={['Handeling', 'Aantal gebeurtenissen']} rows={rows.map(row => [labels[row.dimensions.eventName], number(row.metrics.eventCount)])}/> : <Empty>Voor deze periode zijn geen gebeurtenisgegevens beschikbaar. Dat betekent niet dat niemand een tool heeft gebruikt.</Empty>}<p className="hub-note">Dit telt handelingen, geen unieke personen of ontvangen aanvragen. Alleen gemeten gebruik na toestemming verschijnt hier. Een tooluitkomst is geen geslaagde technische scan of geplande afspraak.</p><SourceMeta report={report} source="ga4" stale={stale}/></Panel>;
}
function SearchTotals({ data, stale }: { data?: Partial<SearchConsoleData> | null; stale?: boolean }) {
  const report = data?.totals, totals = report?.state === 'ready' ? report.data?.rows[0] : null;
  return <Panel title="Zoekverkeer in een overzicht" eyebrow="Afzonderlijk opgevraagde totalen"><div className="hub-stats"><Stat label="Klikken" value={number(totals?.clicks)} note="Van Google Zoeken naar je website"/><Stat label="Vertoningen" value={number(totals?.impressions)} note="Hoe vaak de bron je resultaat meetelt"/><Stat label="Klikratio" value={totals?.ctr == null ? 'Onbekend' : `${number(totals.ctr * 100, 1)}%`} note="Klikken gedeeld door vertoningen"/><Stat label="Gemiddelde positie" value={number(totals?.position, 1)} note="Bronwaarde over deze periode; geen vaste ranking"/></div><SourceMeta report={report} source="search-console" stale={stale}/></Panel>;
}
function SearchRows({ report, title, label, stale }: { report?: ProviderResult<SearchReport>; title: string; label: string; stale?: boolean }) {
  const rows = report?.state === 'ready' ? report.data?.rows : null;
  return <Panel title={title}>{rows?.length ? <Table caption={title} headers={[label, 'Klikken', 'Vertoningen', 'Klikratio', 'Positie']} rows={rows.slice(0, 20).map(row => [row.keys[0] || 'Niet beschikbaar', number(row.clicks), number(row.impressions), row.ctr == null ? 'Onbekend' : `${number(row.ctr * 100, 1)}%`, number(row.position, 1)])}/> : <Empty>Deze uitsplitsing is nog niet beschikbaar. De andere brononderdelen blijven afzonderlijk leesbaar.</Empty>}<p className="hub-note">Maximaal 20 opgehaalde toprijen. Niet alle zoekopdrachten zijn beschikbaar; de som van deze rijen is geen sitebreed totaal.</p><SourceMeta report={report} source="search-console" stale={stale}/></Panel>;
}
function WorkLog({ items, compact = false }: { items: HubWorkItem[]; compact?: boolean }) {
  const sorted = [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return <Panel title={compact ? 'Het laatste werk' : 'Werklog van je website'} eyebrow="Vastgelegd door Sitesnit">{sorted.length ? <div className="hub-work-list">{(compact ? sorted.slice(0, 3) : sorted).map(item => <article key={item.id}><div className="hub-work-heading"><span className={`hub-badge ${item.status === 'completed' ? 'is-ready' : item.status === 'in_progress' ? 'is-blue' : 'is-muted'}`}>{workLabels[item.status]}</span><time dateTime={item.updatedAt}>Bijgewerkt {time(item.updatedAt)} · Amsterdam</time></div><h3>{item.title}</h3><p>{item.detail}</p><details><summary>Controle en onderbouwing</summary><p>{item.evidence || 'Er is bij deze taak nog geen controlebewijs vastgelegd.'}</p></details></article>)}</div> : <Empty>Er zijn nog geen werkzaamheden vastgelegd. Een gekoppelde meting maakt niet automatisch een werktaak aan.</Empty>}<p className="hub-note">‘Afgerond’ is een taakstatus. Het is geen bewijs van een hogere positie of extra aanvragen.</p></Panel>;
}
function UptimePanel({ uptime }: { uptime?: HubUptime | null }) {
  const checks = [...(uptime?.checks || [])].sort((a, b) => b.checkedAt.localeCompare(a.checkedAt));
  const latest = checks[0];
  const labels = { up: 'Bereikbaar bij de controle', down: 'Niet bereikbaar bij de controle', unknown: 'Uitkomst onbekend' };
  const expected = uptime?.expectedChecks;
  return <Panel title="Bereikbaarheid" eyebrow="Afzonderlijke HTTP-controles"><div className={`hub-status-callout ${latest?.status === 'up' ? 'is-ready' : 'is-muted'}`}><span aria-hidden="true">●</span><div><strong>{latest ? labels[latest.status] : 'Nog geen controles ontvangen'}</strong><p>{latest ? `Laatste controle: ${time(latest.checkedAt)} · Amsterdam` : 'Zonder meetreeks kunnen we geen actuele bereikbaarheid bevestigen.'}</p></div></div><dl className="hub-facts"><div><dt>Bron</dt><dd>{uptime?.sourceLabel || 'Bereikbaarheidscontrole niet gekoppeld'}</dd></div><div><dt>Periode</dt><dd>{periodLabel(uptime?.period)}</dd></div><div><dt>Ontvangen metingen</dt><dd>{uptime ? number(checks.length) : 'Onbekend'}</dd></div><div><dt>Verwachte metingen</dt><dd>{number(expected)}</dd></div><div><dt>Ontvangstdekking</dt><dd>{typeof expected === 'number' && expected > 0 && checks.length <= expected ? `${number(checks.length / expected * 100, 1)}%` : 'Niet vastgesteld'}</dd></div></dl><p className="hub-note">Ontvangstdekking gaat over beschikbare metingen, niet over uptime. Geen ontvangen controle betekent niet dat je site offline is. Een mislukte controle bewijst geen doorlopende storing.</p>{checks.length > 0 && <details><summary>Bekijk de laatste controles</summary><Table caption="Laatste maximaal 10 ontvangen controles" headers={['Meetmoment · Amsterdam', 'Uitkomst', 'HTTP', 'Reactietijd', 'Meetlocatie']} rows={checks.slice(0, 10).map(check => [time(check.checkedAt), labels[check.status], number(check.httpStatus), check.latencyMs == null ? 'Onbekend' : `${number(check.latencyMs)} ms`, check.location || 'Niet doorgegeven'])}/></details>}</Panel>;
}
function DeploymentsPanel({ report, stale }: { report?: ProviderResult<Deployment[]> | null; stale?: boolean }) {
  const rows = report?.state === 'ready' ? report.data : null;
  const labels: Record<string, string> = { READY: 'Build gereed', ERROR: 'Build mislukt', BUILDING: 'Wordt gebouwd', INITIALIZING: 'Wordt voorbereid', QUEUED: 'In de wachtrij', CANCELED: 'Geannuleerd' };
  return <Panel title="Publicaties van de website" eyebrow="Productiedeployments">{rows?.length ? <Table caption="Door Vercel gerapporteerde productiedeployments" headers={['Aangemaakt · Amsterdam', 'Buildstatus', 'Gereed · Amsterdam']} rows={rows.slice(0, 10).map(row => [time(row.createdAt), labels[row.status] || 'Status onbekend', row.readyAt ? time(row.readyAt) : 'Niet bevestigd'])}/> : <Empty>Er zijn nog geen deploymentgegevens beschikbaar.</Empty>}<p className="hub-note">Een geslaagde build is geen bereikbaarheidsmeting en bevestigt niet dat iedere functie op de site werkt.</p><SourceMeta report={report} source="vercel" stale={stale}/></Panel>;
}

/** Presentation only. The parent server route must authorize this site before reading/passing data. */
export function HubDashboard({ site, section, snapshots, workItems, uptime, isDemo = false, preview = false }: HubDashboardProps) {
  const base = isDemo ? (site.id==='sitesnit-demo'?'/hub/demo/sitesnit':'/hub/demo') : `/hub/site/${encodeURIComponent(site.id)}`;
  const ga = snapshots.ga4, search = snapshots.searchConsole, stale = snapshots.stale || {};
  const title = sectionCopy[section];
  const searchTotal = search?.totals?.state === 'ready' ? search.totals.data?.rows[0] : null;
  return <div className="hub-dashboard">
    {isDemo && <p className="hub-demo-banner"><strong>Fictieve demonstratie.</strong> Dit zijn voorbeeldgegevens, geen gekoppelde klantwebsite of echte prestaties.</p>}
    {preview && <nav className="hub-admin-return" aria-label="Beheerdersnavigatie"><a href="/hub">← Alle websites</a><span>Je bekijkt {site.name} als beheerder</span><a href="/hub/admin">Klanten & koppelingen</a><a href="/hub/admin/seo-audit">SEO-audits</a></nav>}
    <header className="hub-heading"><div><p className="hub-kicker">Sitesnit Hub / {site.name}</p><h1>{title[0]}</h1><p>{title[1]}</p></div><div className="hub-site-label"><span aria-hidden="true">↗</span><div><strong>{site.name}</strong><span>{displayOrigin(site.origin)}</span></div></div></header>
    <p className="hub-note">{isDemo ? 'Deze demo bevat uitsluitend fictieve cijfers.' : 'Je bekijkt het hierboven genoemde websitedossier.'} <a href={isDemo ? "/hub/demo/sitesnit" : "/hub"}>{isDemo ? 'Bekijk Sitesnit in de demo' : 'Andere website kiezen'}</a></p><nav className="hub-section-nav" aria-label="Onderdelen van je websiteoverzicht">{tabs.map(([id, label]) => <a key={id} href={`${id === 'overzicht' ? base : `${base}/${id}`}${preview ? '?preview=1' : ''}`} aria-current={section === id ? 'page' : undefined}>{label}</a>)}</nav>
    <div className="hub-content" id={isDemo ? 'hub-demo' : undefined}>
      {section === 'overzicht' && <><div className="hub-overview-stats"><Stat label="Bezoekers (GA4)" value={number(metric(ga?.totals, 'totalUsers'))} note="Unieke gebruikers in de geselecteerde periode"/><Stat label="Sessies" value={number(metric(ga?.totals, 'sessions'))} note="Gemeten bezoeken volgens GA4"/><Stat label="Klikken vanuit Google" value={number(searchTotal?.clicks)} note="Afzonderlijk Search Console-totaal"/></div><p className="hub-note">Bezoekersperiode: {periodLabel(ga?.totals?.period)} · alleen gemeten verkeer, geen schatting van bezoek zonder toestemming.</p><TrafficCharts daily={ga?.daily} monthly={ga?.monthly} stale={stale.ga4}/><div className="hub-two-columns"><GaBreakdown title="Google, Instagram en andere bronnen" label="Bron / medium" dimension="sessionSourceMedium" report={ga?.sources} stale={stale.ga4}/><WorkLog items={workItems} compact/></div><details className="hub-panel"><summary>Bronnen en meetmomenten van de totalen</summary><SourceMeta report={ga?.totals} source="ga4" stale={stale.ga4}/><SourceMeta report={search?.totals} source="search-console" stale={stale['search-console']}/></details><UptimePanel uptime={uptime}/></>}
      {section === 'bezoekers' && <><Panel title="Bezoek in de gekozen periode"><div className="hub-stats"><Stat label="Gebruikers" value={number(metric(ga?.totals, 'totalUsers'))} note="Het unieke periodetotaal volgens GA4"/><Stat label="Actieve gebruikers" value={number(metric(ga?.totals, 'activeUsers'))} note="Volgens de activiteitsdefinitie van GA4"/><Stat label="Sessies" value={number(metric(ga?.totals, 'sessions'))} note="Bezoeken die de bron heeft gemeten"/><Stat label="Paginaweergaven" value={number(metric(ga?.totals, 'screenPageViews'))} note="Herhaald bekijken telt mee"/></div><SourceMeta report={ga?.totals} source="ga4" stale={stale.ga4}/></Panel><TrafficCharts daily={ga?.daily} monthly={ga?.monthly} stale={stale.ga4}/><div className="hub-two-columns"><GaBreakdown title="Google, Instagram en andere bronnen" label="Bron / medium" dimension="sessionSourceMedium" report={ga?.sources} stale={stale.ga4}/><EventsPanel report={ga?.events} stale={stale.ga4}/><GaBreakdown title="Waar komen bezoeken vandaan?" label="Kanaal" dimension="sessionDefaultChannelGroup" report={ga?.channels} stale={stale.ga4}/><GaBreakdown title="Op welk apparaat?" label="Apparaat" dimension="deviceCategory" report={ga?.devices} stale={stale.ga4}/><GaBreakdown title="Waar begint het bezoek?" label="Eerste pagina" dimension="landingPage" report={ga?.landingPages} stale={stale.ga4}/><GaBreakdown title="Landen in de meting" label="Land" dimension="country" report={ga?.countries} stale={stale.ga4}/></div></>}
      {section === 'google' && <><SearchTotals data={search} stale={stale['search-console']}/><SearchRows title="Zoekopdrachten" label="Zoekopdracht" report={search?.queries} stale={stale['search-console']}/><SearchRows title="Pagina’s in Google" label="Pagina" report={search?.pages} stale={stale['search-console']}/></>}
      {section === 'status' && <><UptimePanel uptime={uptime}/><DeploymentsPanel report={snapshots.deployments} stale={stale.vercel}/></>}
      {section === 'werkzaamheden' && <WorkLog items={workItems}/>}
    </div><footer className="hub-dashboard-footer"><p>Je leest gegevens per bron. Ontbrekende informatie blijft herkenbaar als onbekend.</p><a href="/contact?dienst=website-monitoring">Bespreek je website met Sitesnit <span aria-hidden="true">↗</span></a></footer>
  </div>;
}

export default HubDashboard;
