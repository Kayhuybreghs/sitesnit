import {runtime} from '../../../lib/server';
import {readAuditUsage} from '../../../lib/seo-audit/usage';
import '../../tools/seo-audit/audit.css';
// Render only after requireHubAdmin in the parent page; no public metrics endpoint.
export async function AuditUsage(){
 let usage;try{usage=await readAuditUsage(runtime().DB);}catch{return <section className="hub-panel"><h2>Gebruik van de SEO-audit</h2><p>De gebruiksteller kon niet worden geladen. Er worden geen nulmetingen aangenomen.</p></section>;}
 const labels:Record<string,string>={started:'Gestarte scans',completed:'Rapporten ontvangen',failed:'Mislukte scans'};
 return <section className="hub-panel"><span className="eyebrow">Eigen tools / SEO-audit</span><h2>Hoe vaak wordt de audit gebruikt?</h2><div className="audit-admin-counts">{usage.map(row=><div key={row.outcome}><strong>{row.today}</strong><span>{labels[row.outcome]} vandaag</span><small>{row.total} in de laatste 28 dagen</small></div>)}</div><p className="small">Vandaag loopt van 00:00 tot 24:00 UTC. Tellen begint na het activeren van deze versie. Geweigerde daglimietpogingen tellen niet mee. Een ontvangen rapport kan een gedeeltelijke crawl bevatten. Eerdere scans zijn niet achteraf ingevuld; onafgeronde of niet geregistreerde pogingen kunnen een verschil tussen de tellers verklaren.</p><a className="button" href="/hub/admin/seo-audit">Start een beheerdersaudit ↗</a><p>Je beheeraccount heeft geen dagelijkse scanlimiet. Je scans tellen mee in dit overzicht, maar niet in het publieke dagbudget.</p></section>;
}
