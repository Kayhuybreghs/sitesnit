import {publicWebsiteUrl} from './url';
import {validSpeedResult,type SpeedResult} from './speed-test';
export type SpeedDevice=SpeedResult['device'];
export type SpeedState={status:'idle'|'loading'|'success'|'error'|'cancelled';result?:SpeedResult;error?:string};
export const deviceName=(device:SpeedDevice)=>device==='mobile'?'Mobiel':'Desktop';
export function speedResultMatches(value:unknown,url:string,device:SpeedDevice):value is SpeedResult {
  if(!validSpeedResult(value)||value.device!==device)return false;
  try{return publicWebsiteUrl(value.requestedUrl)===publicWebsiteUrl(url)&&publicWebsiteUrl(value.finalUrl)===value.finalUrl;}catch{return false;}
}
export function speedReportText(url:string,states:Partial<Record<SpeedDevice,SpeedState>>){
  const lines=['Sitesnit — meetrapport snelheid','Aangevraagde pagina: '+url,'Bron: Google PageSpeed Insights / Lighthouse (labtest).'];
  for(const device of ['mobile','desktop'] as const){
    const state=states[device];lines.push('',deviceName(device));
    if(!state?.result){lines.push('Geen meting beschikbaar'+(state?.error?': '+state.error:'.'));continue;}
    const r=state.result;
    lines.push(state.status==='success'?'Ontvangen meting.':'Eerdere meting; de laatste poging is niet succesvol afgerond.','Aangevraagd: '+r.requestedUrl,'Eindadres: '+r.finalUrl,'Meetmoment: '+r.fetchTime,'Lighthouse: '+(r.version||'onbekend'),'Prestaties: '+r.score+'/100');
    for(const m of r.metrics)lines.push(m.id+': '+m.displayValue);
    for(const warning of r.warnings)lines.push('Beperking: '+warning);
    for(const f of r.findings)lines.push(f.title,'Gevonden: '+f.what,f.why,'Controle: '+f.action,...(f.evidence??[]));
    for(const p of r.passed)lines.push('Geslaagde controle: '+p.title,p.description,...p.evidence);
  }
  lines.push('','Afzonderlijke meetomstandigheden en tijdstippen; geen gemiddelde score, geen oordeel over Core Web Vitals bij echte bezoekers.');
  if(states.mobile?.result&&states.desktop?.result&&states.mobile.result.finalUrl!==states.desktop.result.finalUrl)lines.push('Let op: de eindadressen verschillen. Dit is geen vergelijking van dezelfde eindpagina.');
  return lines.join('\n');
}
