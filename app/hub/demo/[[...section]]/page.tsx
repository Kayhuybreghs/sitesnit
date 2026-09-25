import {notFound} from 'next/navigation';
import {HubDashboard,type HubSection} from '../../hub-dashboard';
import {demoSite,demoSnapshots,demoWork,demoUptime} from '../../../../lib/hub/demo';

export default async function HubDemoPage({params}:{params:Promise<{section?:string[]}>}){
  const {section:raw=[]}=await params; const own=raw[0]==='sitesnit'; const section=own?raw.slice(1):raw; const shownSite=own?{id:'sitesnit-demo',name:'Sitesnit — fictieve demonstratie',origin:'https://www.sitesnit.nl'}:demoSite;
  if(section.length>1||!['overzicht','bezoekers','google','status','werkzaamheden'].includes(section[0]||'overzicht'))notFound();
  return <><HubDashboard site={shownSite} section={(section[0]||'overzicht') as HubSection} snapshots={demoSnapshots} workItems={demoWork} uptime={demoUptime} isDemo/>
    <section className="hub-panel hub-extra"><p><a href="/hub/demo">Voorbeeldbedrijf</a> · <a href="/hub/demo/sitesnit">Sitesnit (demo)</a></p><h2>Zo gebruik je de Hub als beheerder.</h2><p>Je maakt een klantwebsite aan, nodigt de juiste klant uit en koppelt de beschikbare bronnen. Daarna leg je taken en een maandterugblik vast. Een klant ziet alleen het eigen dossier.</p><p>Deze demo is alleen om te bekijken. Er worden geen gegevens opgehaald, klanten aangemaakt of berichten verstuurd. Alle getallen en taken hierboven zijn verzonnen.</p><a className="button" href="/hub/login">Inloggen op je eigen account</a><p>Als beheerder ga je na inloggen en tweestapsverificatie naar <a href="/hub/admin">Hub-beheer</a>.</p></section></>;
}
