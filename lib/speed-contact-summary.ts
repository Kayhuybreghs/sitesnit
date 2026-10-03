import {CONTACT_SUMMARY_MAX_LENGTH} from './contact/limits';
import {deviceName,type SpeedDevice,type SpeedState} from './speed-report';
import {speedMetrics} from './speed-test';

const notice='Dit is een samenvatting. Het volledige rapport blijft beschikbaar in de tool en via kopiëren of tekstdownload.';
// Leave room for the visitor's unchanged message and all other contact fields.
const summaryJsonByteBudget=32000;
function safeText(value:string){
  if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))return false;
  for(const char of value){const point=char.codePointAt(0)!;if(point>=0xd800&&point<=0xdfff)return false;}
  return true;
}
function fits(value:string){return value.length<=CONTACT_SUMMARY_MAX_LENGTH&&new TextEncoder().encode(JSON.stringify(value)).length<=summaryJsonByteBudget&&safeText(value);}
export type SpeedContactSummary={text:string;notice:string;unavailable:string};
/** Select whole evidence items in received order. Never slice a URL or Unicode pair. */
export function speedContactSummary(url:string,states:Partial<Record<SpeedDevice,SpeedState>>):SpeedContactSummary {
  const intro=['Sitesnit — contactsamenvatting snelheid','Aangevraagde pagina: '+url,'Bron: Google PageSpeed Insights / Lighthouse; afzonderlijke labtests, geen gemiddelde of oordeel over echte bezoekers.'];
  const mobile=states.mobile?.result,desktop=states.desktop?.result;
  if(mobile&&desktop&&mobile.finalUrl!==desktop.finalUrl)intro.push('Let op: de eindadressen verschillen; dit zijn verschillende eindpagina’s.');
  if(Object.values(states).some(s=>s.status==='success')&&Object.values(states).some(s=>s.status!=='success'))intro.push('Deelsucces: niet alle laatste pogingen zijn succesvol afgerond.');
  const sections=(['mobile','desktop'] as const).map(device=>{
    const state=states[device],r=state?.result,lines=[deviceName(device)];
    if(!r){lines.push('Geen meting beschikbaar'+(state?.status==='error'?'; laatste poging mislukt.':state?.status==='cancelled'?'; laatste poging afgebroken.':state?.status==='loading'?'; meting loopt nog.':'.'));return {device,lines,details:[] as string[],selected:0,total:0,result:r};}
    lines.push(state.status==='success'?'Ontvangen meting.':state.status==='loading'?'Eerdere meting; een nieuwe poging loopt nog.':state.status==='cancelled'?'Eerdere meting; de laatste poging is afgebroken.':'Eerdere meting; de laatste poging is mislukt.');
    lines.push('Eindadres: '+(r.finalUrl===url?'gelijk aan aangevraagde pagina':device==='desktop'&&r.finalUrl===mobile?.finalUrl?'gelijk aan het eindadres van Mobiel':r.finalUrl),'Meetmoment: '+r.fetchTime,'Prestaties: '+r.score+'/100');
    for(const metric of r.metrics)lines.push((speedMetrics.find(m=>m.id===metric.id)?.short??metric.id)+': '+metric.displayValue);
    return {device,lines,details:[] as string[],selected:0,total:r.findings.length,result:r};
  });
  const render=()=>[...intro,...sections.flatMap(s=>['',...s.lines,...s.details,...(s.result?['Bevindingen in deze samenvatting: '+s.selected+' van '+s.total+'.']:[])]),'',notice].join('\n');
  const required=render();
  if(!fits(required))return {text:'',notice,unavailable:'De meetcontext is te groot of bevat onleesbare tekst voor deze aanvraag. Het volledige rapport blijft in de tool. Je kunt hieronder bewust je vraag zonder rapport versturen.'};
  const perDeviceBudget=Math.floor((CONTACT_SUMMARY_MAX_LENGTH-required.length)/2);
  for(const section of sections){
    const r=section.result;if(!r)continue;let used=0;
    const add=(text:string)=>{if(text.length>perDeviceBudget-used||!safeText(text))return false;section.details.push(text);if(!fits(render())){section.details.pop();return false;}used+=text.length;return true;};
    for(const warning of r.warnings.slice(0,2))add('Beperking: '+warning);
    for(const finding of r.findings){
      if(section.selected===3)break;
      // Reserve the updated selection counter before checking the final string.
      section.selected++;
      if(!add('Bevinding: '+finding.title+'\nGevonden: '+finding.what+'\nControle: '+finding.action)&&!add('Bevinding: '+finding.title+'\nToelichting en bewijs staan in het volledige rapport.'))section.selected--;
    }
  }
  return {text:render(),notice,unavailable:''};
}
