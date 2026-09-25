import {requireHubUser} from '../../../../lib/hub/session';
import {requireHubAdmin} from '../../../../lib/hub/access';
import {notFound} from 'next/navigation';
import {AuditClient} from '../../../tools/seo-audit/audit-client';
import '../../../tools/seo-audit/audit.css';

export default async function AdminAudit(){
 const context=await requireHubUser();try{await requireHubAdmin(context.runtime.connection.db,context.user);}catch{notFound();}
 return <section className="audit-page wrap section"><a href="/hub/admin">← Terug naar beheer</a><span className="eyebrow">Sitesnit Hub / Beheerdersaudit</span><h1>Zelf controleren.<br/>Zo vaak als nodig.</h1><p>Je ingelogde beheeraccount heeft geen dagelijkse scanlimiet en gebruikt het publieke dagbudget niet. Iedere scan onderzoekt maximaal 20 pagina’s binnen het beschikbare uitvoerbudget. De veiligheidscontroles blijven actief.</p><AuditClient admin/></section>;
}
