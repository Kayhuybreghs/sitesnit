import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireHubUser} from '../../../../../lib/hub/session';
import {requireHubSite,isHubAdmin,type HubSite} from '../../../../../lib/hub/access';
import {readAdminPreview} from '../../../../../lib/hub/store';
import {dashboardData} from '../../../../../lib/hub/dashboard-data';
import {HubDashboard,type HubSection} from '../../../hub-dashboard';
export default async function HubSitePage({params,searchParams}:{params:Promise<{siteId:string;section?:string[]}>;searchParams:Promise<{preview?:string}>}){
  const context=await requireHubUser();const{siteId,section=[]}=await params;const preview=await isHubAdmin(context.runtime.connection.db,context.user)||(await searchParams).preview==='1';
  if(section.length>1||!['overzicht','bezoekers','google','status','werkzaamheden'].includes(section[0]||'overzicht'))notFound();
  const db=context.runtime.connection.db;let site:HubSite;
  try{
    if(preview)site=await readAdminPreview(context.runtime.connection,context.user,siteId);
    else site=await requireHubSite(db,context.user,siteId);
  }catch{notFound();}
  const data=await dashboardData(context.runtime.connection,site);const active=(section[0]||'overzicht') as HubSection;
  return <><HubDashboard site={site} section={active} snapshots={data.snapshots} workItems={data.workItems} uptime={data.uptime} preview={preview}/>
    {(active==='werkzaamheden'||active==='overzicht')&&<section className="hub-panel hub-extra"><h2>Maandrapporten</h2>{data.reports.length?data.reports.map(report=><details key={report.month}><summary>{report.month}</summary><p style={{whiteSpace:'pre-line'}}>{report.summary}</p></details>):<p>Er is nog geen maandrapport toegevoegd. Zodra er afgesproken werk is vastgelegd, vind je hier de toelichting.</p>}</section>}
    {active==='status'&&<section className="hub-panel hub-extra"><h2>Wat de meetreeks laat zien</h2><p>{data.uptimeSummary.measuredSlots} van {data.uptimeSummary.expectedSlots} geplande metingen ontvangen. Ontbrekende metingen tellen niet als bereikbare minuten.</p>{data.uptimeSummary.incidents.length?data.uptimeSummary.incidents.map(incident=><p key={incident.confirmedAt}>Incident bevestigd na twee opeenvolgende fouten op {new Date(incident.confirmedAt).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'})}. {incident.recoveredAt?`Herstel gemeten op ${new Date(incident.recoveredAt).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'})}.`:'Daarna nog geen herstel gemeten.'}{incident.coverageInterrupted?' De meetreeks is tussendoor onderbroken.':''}</p>):<p>In deze meetreeks zijn geen incidenten met twee opeenvolgende fouten bevestigd. Bij ontbrekende metingen is de bereikbaarheid onbekend.</p>}</section>}
    <p className="hub-extra"><Link href={preview?'/hub/admin':'/hub'}>← Terug naar je websites</Link></p>
  </>;
}
