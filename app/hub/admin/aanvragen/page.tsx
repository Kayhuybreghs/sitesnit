import {requireHubUser} from '../../../../lib/hub/session';
import {requireHubAdmin} from '../../../../lib/hub/access';
import {contactConnection} from '../../../../lib/contact/runtime';
import {contactReference} from '../../../../lib/contact/input';
import {contactOperationalHealth} from '../../../../lib/contact/health';
import {CONTACT_SAFE_RETRY_MS} from '../../../../lib/contact/limits';
import {notFound} from 'next/navigation';
import {RetryMail} from './retry';
export const dynamic='force-dynamic';
const labels:Record<string,string>={pending:'Wacht op verwerking',processing:'Wordt verwerkt',provider_accepted:'Aangenomen door mailprovider',retryable_failed:'Nieuwe poging nodig',permanent_failed:'Afgewezen; handmatige controle',delivery_unknown:'Uitkomst onzeker; controleer providerlog'};
export default async function ContactAdmin(){
  const context=await requireHubUser();try{await requireHubAdmin(context.runtime.connection.db,context.user);}catch{notFound();}
  const {db}=await contactConnection();
  const health=await contactOperationalHealth(db);
  const result=await db.prepare(`SELECT i.id,i.name,i.email,i.message,i.website,i.tool_summary,i.created_at,c.context_json FROM inquiries i JOIN contact_requests c ON c.inquiry_id=i.id ORDER BY CASE WHEN EXISTS (SELECT 1 FROM contact_outbox o WHERE o.inquiry_id=i.id AND (o.state<>'provider_accepted' OR o.delivery_state IN ('bounced','complained','failed'))) THEN 0 ELSE 1 END,i.created_at DESC LIMIT 50`).all<{id:string;name:string;email:string;message:string;website:string;tool_summary:string;created_at:number;context_json:string}>();
  const inquiryIds=result.results.map(row=>row.id);
  const tasks=inquiryIds.length?await db.prepare(`SELECT id,inquiry_id,kind,state,provider_id,attempts,error_code,delivery_state,first_attempt_at,lease_until FROM contact_outbox WHERE inquiry_id IN (${inquiryIds.map(()=>'?').join(',')}) ORDER BY created_at DESC`).bind(...inquiryIds).all<{id:string;inquiry_id:string;kind:string;state:string;provider_id:string;attempts:number;error_code:string;delivery_state:string;first_attempt_at:number|null;lease_until:number|null}>():{results:[]};
  return <main className="section wrap"><a className="text-link" href="/hub/admin">Terug naar beheer</a><p className="eyebrow">Sitesnit beheer</p><h1>Aanvragen & mailstatus</h1><p>Tot 50 opgeslagen aanvragen, met open of mislukte mailtaken bovenaan. De zakelijke notificatie en bezoekersbevestiging hebben elk een eigen status. Aangenomen door de provider betekent nog niet dat de mail in de inbox staat.</p>
    <section className="context-box" aria-labelledby="contact-operations"><h2 id="contact-operations">Verwerking van alle mailtaken</h2>
      <p>{health.due} taken klaar voor een poging · {health.stalled} verlopen verwerkingsleases · {health.review} taken voor handmatige controle · {health.deliveryFailed} negatieve aflevermeldingen.</p>
      {health.oldestDueAt!==null&&<p>Oudste wachtende poging: {new Date(health.oldestDueAt).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'})}.</p>}
      {health.retryWindowRisk>0&&<p role="alert"><strong>{health.retryWindowRisk} taken naderen of overschrijden het veilige herhaalvenster.</strong> Controleer de providerlog; verruim het venster niet en verstuur geen onzekere mail opnieuw zonder controle.</p>}
      {health.configurationBlocked>0&&<p role="alert">{health.configurationBlocked} taken wachten op herstel van de mailinstellingen.</p>}
      {health.budgetBlocked>0&&<p role="alert">{health.budgetBlocked} taken wachten wegens het verzendbudget. De aanvraag blijft opgeslagen.</p>}
      <p>{health.lastBackgroundAt===null?'Nog geen afgeronde achtergrondverwerking geregistreerd. Dit bewijst niet dat een externe planner ontbreekt.':`Laatste geregistreerde achtergrondverwerking: ${new Date(health.lastBackgroundAt).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'})}.`}</p>
      {health.heartbeatState!=='recorded'&&<p role="alert"><strong>Controleer de planner en de joblogs.</strong> Er is geen geregistreerde achtergrondbatch binnen het veilige herhaalvenster van 23 uur. Een dagelijkse batch alleen garandeert geen tijdige herpoging.</p>}
      <p>Een heartbeat bevestigt één afgeronde batch; controleer ook de wachtende taken. Deze telling omvat ook aanvragen buiten de lijst hieronder.</p>
      <h3>Gereserveerde verzendpogingen</h3>
      <ul>{health.budgets.map(budget=><li key={budget.label}>{budget.label}: {budget.daily.used}/{budget.daily.limit} vandaag (UTC), {budget.monthly.used}/{budget.monthly.limit} deze maand (UTC).{(budget.daily.used>=budget.daily.limit||budget.monthly.used>=budget.monthly.limit)&&<strong> Budget bereikt.</strong>}</li>)}</ul>
      <p>Dit zijn de eigen toepassingsgrenzen. Controleer actuele providerquota in het provideraccount.</p>
    </section>
    {!result.results.length&&<p>Er zijn nog geen aanvragen via de nieuwe verzendroute.</p>}
    {result.results.map(row=><article className="context-box" key={row.id}><h2>{row.name}</h2><p>{new Date(Number(row.created_at)).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'})} · <a href={`mailto:${row.email}`}>{row.email}</a></p><p style={{overflowWrap:'anywhere'}}>{contactReference(row.id)}</p><details><summary>Aanvraag bekijken</summary><pre style={{whiteSpace:'pre-wrap'}}>{row.message}</pre><p>{row.website}</p><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(JSON.parse(row.context_json),null,2)}</pre>{row.tool_summary&&<pre style={{whiteSpace:'pre-wrap'}}>{row.tool_summary}</pre>}</details>
    {tasks.results.filter(task=>task.inquiry_id===row.id).map(task=><section key={task.id}><h3>{task.kind==='owner'?'Notificatie aan contact@sitesnit.nl':'Bevestiging aan bezoeker'}</h3><p>{labels[task.state]} · {task.attempts} pogingen</p><p>Afleverstatus: {task.delivery_state||'Nog niet bevestigd'}{task.provider_id&&` · Provider-ID: ${task.provider_id}`}{task.error_code&&` · Foutcategorie: ${task.error_code}`}</p>{task.state!=='provider_accepted'&&(task.state!=='processing'||task.lease_until===null||Number(task.lease_until)<=Date.now())&&<RetryMail taskId={task.id} manual={['delivery_unknown','permanent_failed'].includes(task.state)||(task.first_attempt_at!==null&&Date.now()-Number(task.first_attempt_at)>=CONTACT_SAFE_RETRY_MS)}/>}</section>)}</article>)}
  </main>;
}
