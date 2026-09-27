import {requireHubUser} from '../../../../lib/hub/session';
import {requireHubAdmin} from '../../../../lib/hub/access';
import {contactConnection} from '../../../../lib/contact/runtime';
import {contactReference} from '../../../../lib/contact/input';
import {notFound} from 'next/navigation';
import {RetryMail} from './retry';
export const dynamic='force-dynamic';
const labels:Record<string,string>={pending:'Wacht op verwerking',processing:'Wordt verwerkt',provider_accepted:'Aangenomen door mailprovider',retryable_failed:'Nieuwe poging nodig',permanent_failed:'Afgewezen; handmatige controle',delivery_unknown:'Uitkomst onzeker; controleer providerlog'};
export default async function ContactAdmin(){
  const context=await requireHubUser();try{await requireHubAdmin(context.runtime.connection.db,context.user);}catch{notFound();}
  const {db}=await contactConnection();
  const result=await db.prepare('SELECT i.id,i.name,i.email,i.message,i.website,i.tool_summary,i.created_at,c.context_json FROM inquiries i JOIN contact_requests c ON c.inquiry_id=i.id ORDER BY i.created_at DESC LIMIT 50').all<{id:string;name:string;email:string;message:string;website:string;tool_summary:string;created_at:number;context_json:string}>();
  const tasks=await db.prepare('SELECT id,inquiry_id,kind,state,provider_id,attempts,error_code,delivery_state,first_attempt_at FROM contact_outbox ORDER BY created_at DESC LIMIT 100').all<{id:string;inquiry_id:string;kind:string;state:string;provider_id:string;attempts:number;error_code:string;delivery_state:string;first_attempt_at:number|null}>();
  return <main className="section wrap"><a className="text-link" href="/hub/admin">Terug naar beheer</a><p className="eyebrow">Sitesnit beheer</p><h1>Aanvragen & mailstatus</h1><p>De laatste 50 opgeslagen aanvragen. De zakelijke notificatie en bezoekersbevestiging hebben elk een eigen status. Aangenomen door de provider betekent nog niet dat de mail in de inbox staat.</p>{!result.results.length&&<p>Er zijn nog geen aanvragen via de nieuwe verzendroute.</p>}
    {result.results.map(row=><article className="context-box" key={row.id}><h2>{row.name}</h2><p>{new Date(Number(row.created_at)).toLocaleString('nl-NL',{timeZone:'Europe/Amsterdam'})} · <a href={`mailto:${row.email}`}>{row.email}</a></p><p style={{overflowWrap:'anywhere'}}>{contactReference(row.id)}</p><details><summary>Aanvraag bekijken</summary><pre style={{whiteSpace:'pre-wrap'}}>{row.message}</pre><p>{row.website}</p><pre style={{whiteSpace:'pre-wrap'}}>{JSON.stringify(JSON.parse(row.context_json),null,2)}</pre>{row.tool_summary&&<pre style={{whiteSpace:'pre-wrap'}}>{row.tool_summary}</pre>}</details>
    {tasks.results.filter(task=>task.inquiry_id===row.id).map(task=><section key={task.id}><h3>{task.kind==='owner'?'Notificatie aan contact@sitesnit.nl':'Bevestiging aan bezoeker'}</h3><p>{labels[task.state]} · {task.attempts} pogingen</p><p>Afleverstatus: {task.delivery_state||'Nog niet bevestigd'}{task.provider_id&&` · Provider-ID: ${task.provider_id}`}{task.error_code&&` · Foutcategorie: ${task.error_code}`}</p>{task.state!=='provider_accepted'&&task.state!=='processing'&&<RetryMail taskId={task.id} manual={['delivery_unknown','permanent_failed'].includes(task.state)||(task.first_attempt_at!==null&&Date.now()-Number(task.first_attempt_at)>=23*3600000)}/>}</section>)}</article>)}
  </main>;
}
