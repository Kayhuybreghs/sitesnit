'use client';

import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import '../hub-auth.css';

export type AdminSite = { id: string; name: string; origin: string; client_id: string; client_name: string };
export type AdminWorkItem = { id: string; site_id: string; title: string; detail: string; status: 'open' | 'in_progress' | 'completed'; evidence: string };
export type AdminPanelProps = {
  sites: AdminSite[];
  workItems: AdminWorkItem[];
  members: { user_id: string; client_id: string; email: string }[];
  reports: { site_id: string; month: string; summary: string }[];
  integrations: { site_id: string; provider: string; config_json: string }[];
};
type Action = 'create-site' | 'invite' | 'work-item' | 'monthly-report' | 'integration' | 'sync' | 'revoke-member';
type Response = { ok?: boolean; message?: string; siteId?: string; error?: string };
type Provider = 'ga4' | 'search-console' | 'vercel';
const providerNames: Record<Provider, string> = { ga4: 'Google Analytics 4', 'search-console': 'Google Search Console', vercel: 'Vercel' };
const field = (data: FormData, key: string) => String(data.get(key) || '').trim();

function ActionForm({ action, body, label, busyLabel = 'Bezig met opslaan…', children, onSuccess }: {
  action: Action; body: (data: FormData) => Record<string, unknown>; label: string; busyLabel?: string;
  children?: ReactNode; onSuccess?: (data: Response) => void;
}) {
  const router = useRouter();
  const pending = useRef(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const formData = new FormData(event.currentTarget);
    pending.current = true; setBusy(true); setNotice(null);
    try {
      const response = await fetch('/api/hub/manage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify({ action, ...body(formData) }) });
      const raw: unknown = await response.json().catch(() => null);
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid response');
      const payload = raw as Record<string, unknown>;
      const data: Response = {
        ok: payload.ok === true,
        ...(typeof payload.message === 'string' ? { message: payload.message } : {}),
        ...(typeof payload.error === 'string' ? { error: payload.error } : {}),
        ...(typeof payload.siteId === 'string' ? { siteId: payload.siteId } : {}),
      };
      if (!response.ok || data.ok !== true) {
        setNotice({ok:false, text:typeof data.error === 'string' && data.error.length <= 500 ? data.error : 'Dit is niet opgeslagen. Controleer de velden en probeer het opnieuw.'});
        return;
      }
      setNotice({ok:true, text:typeof data.message === 'string' && data.message.length <= 500 ? data.message : 'De wijziging is opgeslagen.'});
      onSuccess?.({ok:true, ...(typeof data.siteId === 'string' ? {siteId:data.siteId} : {})});
      router.refresh();
    } catch {
      setNotice({ok:false, text:'We konden de bevestiging niet ontvangen. Vernieuw eerst het overzicht om te controleren of de wijziging is verwerkt, voordat je opnieuw probeert.'});
    } finally { pending.current = false; setBusy(false); }
  }
  return <form className="hub-admin-form" onSubmit={submit} aria-busy={busy}><fieldset disabled={busy}>{children}<button className="button" type="submit" disabled={busy}>{busy ? busyLabel : label}</button></fieldset>{notice && <p className={`hub-form-feedback ${notice.ok ? 'is-success' : 'is-error'}`} role={notice.ok ? 'status' : 'alert'}>{notice.text}</p>}</form>;
}
function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return <section className="hub-admin-card"><header><h2>{title}</h2>{hint && <p>{hint}</p>}</header>{children}</section>;
}
function SiteCreator({ onCreated }: { onCreated: (siteId: string) => void }) {
  return <details className="hub-admin-create"><summary>Nieuwe klantwebsite toevoegen <span aria-hidden="true">+</span></summary><ActionForm action="create-site" label="Website toevoegen" body={data => ({name:field(data,'name'),client:field(data,'client'),origin:field(data,'origin')})} onSuccess={data => { if (data.siteId) onCreated(data.siteId); }}><div className="hub-admin-fields"><label>Naam van de klant<input name="client" required maxLength={120} autoComplete="organization" placeholder="Bedrijfsnaam"/></label><label>Naam van de website<input name="name" required maxLength={120} placeholder="Bijvoorbeeld de bedrijfswebsite"/></label></div><label>Websiteadres<input name="origin" type="url" required maxLength={250} placeholder="https://voorbeeld.nl" autoComplete="off"/></label><p className="hub-field-hint">Gebruik het openbare hoofddomein. Dit maakt een dossier aan; het verstuurt nog geen uitnodiging en sluit geen meetbron aan.</p></ActionForm></details>;
}
function AccessEditor({ site, members }: { site: AdminSite; members: AdminPanelProps['members'] }) {
  const [revokeId, setRevokeId] = useState<string | null>(null);
  return <Card title="Klanttoegang" hint={`Toegang geldt voor ${site.client_name} en de websites die bij deze klant horen.`}><ActionForm action="invite" label="Uitnodiging aanvragen" busyLabel="Uitnodiging verwerken…" body={data => ({siteId:site.id,email:field(data,'email')})}><label>E-mailadres van de klant<input name="email" type="email" required autoComplete="off" maxLength={254} placeholder="naam@bedrijf.nl"/></label><p className="hub-field-hint">De server regelt de uitnodiging via de ingestelde e-mailroute. Er wordt hier geen persoonlijke uitnodigingslink getoond. Een verzendbevestiging betekent niet dat de klant al toegang heeft geaccepteerd.</p></ActionForm><div className="hub-admin-members"><h3>Bestaande toegang</h3>{members.length ? members.map(member => <div className="hub-admin-member" key={member.user_id}><div><strong>{member.email}</strong><span>Toegang tot {site.client_name}</span></div>{revokeId !== member.user_id ? <button type="button" className="hub-quiet-button" onClick={() => setRevokeId(member.user_id)}>Toegang intrekken</button> : <div className="hub-revoke-confirm"><p>De toegang van <strong>{member.email}</strong> tot <strong>{site.client_name}</strong> intrekken? Dit geldt ook voor andere websites van deze klant.</p><ActionForm action="revoke-member" body={() => ({siteId:site.id,userId:member.user_id})} label="Ja, toegang intrekken" busyLabel="Toegang intrekken…"/><button className="hub-quiet-button" type="button" onClick={() => setRevokeId(null)}>Annuleren</button></div>}</div>) : <p className="hub-field-hint">Er zijn nog geen klantleden met toegang. Beheerdersrechten worden hier niet gewijzigd.</p>}</div></Card>;
}
function WorkEditor({ siteId, items }: { siteId: string; items: AdminWorkItem[] }) {
  const [selected, setSelected] = useState('');
  const item = items.find(value => value.id === selected);
  const [status, setStatus] = useState<AdminWorkItem['status']>('open');
  return <Card title="Werkzaamheden vastleggen" hint="Een echte wijziging, een duidelijke status en controlebewijs. De klant ziet wat je hier opslaat."><label className="hub-admin-picker">Welke taak wil je bewerken?<select value={selected} onChange={event => { setSelected(event.target.value); setStatus(items.find(value => value.id === event.target.value)?.status || 'open'); }}><option value="">Nieuwe taak</option>{items.map(value => <option value={value.id} key={value.id}>{value.title}</option>)}</select></label><ActionForm key={item?.id || 'new'} action="work-item" label={item ? 'Taak bijwerken' : 'Taak toevoegen'} body={data => ({siteId,...(item ? {id:item.id} : {}),title:field(data,'title'),detail:field(data,'detail'),status:field(data,'status'),evidence:field(data,'evidence')})}><label>Wat is de taak?<input name="title" defaultValue={item?.title || ''} required maxLength={180} placeholder="Bijvoorbeeld: contactroute op mobiel herstellen"/></label><label>Toelichting<textarea name="detail" defaultValue={item?.detail || ''} required rows={4} maxLength={5000} placeholder="Wat is vastgesteld, wat is afgesproken en wat is gedaan?"/></label><label>Status<select name="status" value={status} onChange={event => setStatus(event.target.value as AdminWorkItem['status'])}><option value="open">Open</option><option value="in_progress">In uitvoering</option><option value="completed">Afgerond</option></select></label><label>Controle en onderbouwing <span>{status === 'completed' ? 'Verplicht bij afgerond werk' : 'Optioneel zolang de taak openstaat'}</span><textarea name="evidence" defaultValue={item?.evidence || ''} rows={3} maxLength={3000} required={status === 'completed'} placeholder="Welke hercontrole is uitgevoerd? Wat staat nog open?"/></label><p className="hub-field-hint">Vermeld alleen werkelijk uitgevoerd werk. Een afgeronde taak bewijst geen hogere positie of extra aanvragen. Deel geen wachtwoorden of toegangscodes in het werklog.</p></ActionForm></Card>;
}
function ReportEditor({ siteId, reports }: { siteId: string; reports: AdminPanelProps['reports'] }) {
  const [selected, setSelected] = useState('');
  const report = reports.find(value => value.month === selected);
  return <Card title="Maandterugblik" hint="Een korte toelichting op het werk en de keuzes voor de volgende periode."><label className="hub-admin-picker">Terugblik kiezen<select value={selected} onChange={event => setSelected(event.target.value)}><option value="">Nieuwe terugblik</option>{[...reports].sort((a,b) => b.month.localeCompare(a.month)).map(value => <option key={value.month} value={value.month}>{value.month}</option>)}</select></label><ActionForm key={report?.month || 'new'} action="monthly-report" label={report ? 'Terugblik bijwerken' : 'Terugblik opslaan'} body={data => ({siteId,month:field(data,'month'),summary:field(data,'summary')})}><label>Maand<input type="month" name="month" defaultValue={report?.month || ''} required readOnly={Boolean(report)}/></label><label>Terugblik<textarea name="summary" defaultValue={report?.summary || ''} required rows={6} maxLength={8000} placeholder="Wat is uitgevoerd? Wat lieten controles zien? Welke besluiten of werkzaamheden volgen?"/></label><p className="hub-field-hint">Dit is jouw toelichting, geen automatisch rapport. Cijfers horen bij hun bron en meetperiode. Opslaan verstuurt geen mail naar de klant.</p></ActionForm></Card>;
}
function integrationFields(raw: string | undefined): Record<string, string | boolean> {
  try {
    const value: unknown = JSON.parse(raw || '{}');
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
    const source = value as Record<string, unknown>;
    const safe: Record<string, string | boolean> = {enabled:source.enabled !== false};
    for (const name of ['credentialRef','propertyId','siteUrl','projectId','teamId']) if (typeof source[name] === 'string') safe[name] = source[name];
    return safe;
  } catch { return {}; }
}
function IntegrationEditor({ siteId, integrations }: { siteId: string; integrations: AdminPanelProps['integrations'] }) {
  const [provider, setProvider] = useState<Provider>('ga4');
  const integration = integrations.find(value => value.provider === provider);
  const config = integrationFields(integration?.config_json);
  const initial = (name: string) => typeof config[name] === 'string' ? config[name] as string : '';
  return <Card title="Meetbronnen aansluiten" hint="Alleen voor beheer: wijs de juiste accountgegevens en de beveiligde serverreferentie toe."><label className="hub-admin-picker">Bron<select value={provider} onChange={event => setProvider(event.target.value as Provider)}>{Object.entries(providerNames).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><ActionForm key={`${provider}:${integration?.config_json || ''}`} action="integration" label="Broninstellingen opslaan" body={data => {
    const config: Record<string,string|boolean> = {credentialRef:field(data,'credentialRef'),enabled:data.get('enabled') === 'on'};
    for (const name of provider === 'ga4' ? ['propertyId'] : provider === 'search-console' ? ['siteUrl'] : ['projectId','teamId']) { const value = field(data,name); if(value) config[name] = value; }
    return {siteId,provider,config:JSON.stringify(config)};
  }}><label>Serverreferentie voor toegang<input name="credentialRef" defaultValue={initial('credentialRef')} required maxLength={160} pattern="[A-Za-z0-9_-]+" autoComplete="off" spellCheck={false} placeholder="Bijvoorbeeld google-bedrijf"/></label><p className="hub-field-hint">De naam van een al veilig ingestelde credential op de server. Plak hier geen API-sleutel, toegangstoken, privésleutel of JSON-accountbestand.</p>{provider === 'ga4' && <label>GA4-property-ID<input name="propertyId" defaultValue={initial('propertyId')} required inputMode="numeric" pattern="[0-9]+" maxLength={30} autoComplete="off" placeholder="Alleen het numerieke property-ID"/></label>}{provider === 'search-console' && <label>Search Console-property<input name="siteUrl" defaultValue={initial('siteUrl')} required maxLength={250} autoComplete="off" spellCheck={false} placeholder="sc-domain:voorbeeld.nl of https://voorbeeld.nl/"/></label>}{provider === 'vercel' && <><label>Vercel-project-ID<input name="projectId" defaultValue={initial('projectId')} required maxLength={128} autoComplete="off" spellCheck={false} placeholder="Project-ID uit Vercel"/></label><label>Vercel-team-ID <span>Optioneel</span><input name="teamId" defaultValue={initial('teamId')} maxLength={128} autoComplete="off" spellCheck={false}/></label></>}<label className="hub-admin-check"><input type="checkbox" name="enabled" defaultChecked={config.enabled !== false}/><span>Deze bron gebruiken bij synchroniseren</span></label><p className="hub-field-hint">Opslaan is geen bevestiging dat de bron werkt. De server controleert toegang en haalt alleen gegevens op die bij deze website zijn toegestaan.</p></ActionForm><div className="hub-admin-sync"><h3>Opgeslagen bronnen bijwerken</h3><p>Vraag gegevens opnieuw op met de opgeslagen instellingen. De server houdt bronlimieten en wachttijden aan. Dit belooft geen doorlopende monitoring.</p><ActionForm action="sync" label="Gegevens ophalen" busyLabel="Bronnen controleren…" body={() => ({siteId})}/></div></Card>;
}

export function AdminPanel({sites,workItems,members,reports,integrations}:AdminPanelProps) {
  const [selectedSite, setSelectedSite] = useState(sites[0]?.id || '');
  const site = sites.find(value => value.id === selectedSite) || sites[0];
  return <div className="hub-admin-panel"><SiteCreator onCreated={setSelectedSite}/>{site ? <><div className="hub-admin-site-switch"><label>Website beheren<select value={site.id} onChange={event => setSelectedSite(event.target.value)}>{sites.map(value => <option key={value.id} value={value.id}>{value.client_name} · {value.name}</option>)}</select></label><a className="hub-admin-preview" href={`/hub/site/${encodeURIComponent(site.id)}?preview=1`}>Bekijk als beheerder <span aria-hidden="true">↗</span></a><p>{site.origin}</p></div><div className="hub-admin-grid" key={site.id}><div><WorkEditor siteId={site.id} items={workItems.filter(value => value.site_id === site.id)}/><ReportEditor siteId={site.id} reports={reports.filter(value => value.site_id === site.id)}/></div><div><AccessEditor site={site} members={members.filter(value => value.client_id === site.client_id)}/><IntegrationEditor siteId={site.id} integrations={integrations.filter(value => value.site_id === site.id)}/></div></div></> : <div className="hub-notice"><strong>Begin met een klantwebsite.</strong><p>Daarna kun je toegang regelen, werkzaamheden vastleggen en meetbronnen aansluiten.</p></div>}</div>;
}

export default AdminPanel;
