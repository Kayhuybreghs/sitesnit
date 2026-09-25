import {ensureOwnHubSite} from '../../../lib/hub/own-site';
import {routeCatalog} from '../../../lib/route-catalog';
import {pageSeo} from '../../page-seo-data';
import {notFound} from 'next/navigation';
import {requireHubUser} from '../../../lib/hub/session';
import {requireHubAdmin} from '../../../lib/hub/access';
import AdminPanel from './admin-panel';
import {HubSignOut} from '../auth-form';
import {AuditUsage} from './audit-usage';
export default async function HubAdminPage(){
  const context=await requireHubUser();const db=context.runtime.connection.db;try{await requireHubAdmin(db,context.user);}catch{notFound();}
  const ownSiteId=await ensureOwnHubSite(db);
  const [sites,workItems,members,reports,integrations]=await Promise.all([
    db.prepare('SELECT s.*,c.name AS client_name FROM hub_sites s INNER JOIN hub_clients c ON c.id=s.client_id ORDER BY s.name').all<{id:string;name:string;origin:string;client_id:string;client_name:string}>(),
    db.prepare('SELECT id,site_id,title,detail,status,evidence FROM hub_work_items ORDER BY updated_at DESC').all<{id:string;site_id:string;title:string;detail:string;status:'open'|'in_progress'|'completed';evidence:string}>(),
    db.prepare('SELECT m.user_id,m.client_id,u.email FROM hub_memberships m INNER JOIN hub_auth_user u ON u.id=m.user_id ORDER BY u.email').all<{user_id:string;client_id:string;email:string}>(),
    db.prepare('SELECT site_id,month,summary FROM hub_monthly_reports ORDER BY month DESC').all<{site_id:string;month:string;summary:string}>(),
    db.prepare('SELECT site_id,provider,config_json FROM hub_integrations').all<{site_id:string;provider:string;config_json:string}>(),
  ]);
  return <section className="wrap section"><div className="hub-page-heading"><div><span className="eyebrow">Sitesnit Hub / Beheer</span><h1>Je klanten. Het overzicht.</h1></div><HubSignOut/></div><p>Werk vastleggen, toegang beheren en meetbronnen aansluiten.</p><p><a className="text-link" href="/hub">← Naar je klantomgeving</a></p><section className="hub-panel"><h2>Sitesnit · je eigen website</h2><p><a className="button" href={`/hub/site/${ownSiteId}?preview=1`}>Bekijk Sitesnit in de Hub ↗</a></p><details><summary>Alle {routeCatalog.length} openbare Sitesnit-pagina’s</summary><p>Dit is het paginaoverzicht van de gepubliceerde code, geen meting van de Google-index.</p><ul>{routeCatalog.map(route=><li key={route.path}><a href={route.path}>{pageSeo[route.path]?.title||route.path}</a></li>)}</ul></details></section><AuditUsage/><AdminPanel sites={sites.results} workItems={workItems.results} members={members.results} reports={reports.results} integrations={integrations.results}/></section>;
}
