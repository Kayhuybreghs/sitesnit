import { AppCanvas } from './app-canvas';
import { WebappCanvas } from './webapp-canvas';
import { Arrow } from "./ui";

const routeCopy:Record<string,{label:string;title:string;accent:string;steps:[string,string][]}>={
  webdesign:{label:"De route van je bezoeker",title:"Begrijpen.",accent:"Vertrouwen. Contact.",steps:[["Je aanbod","Meteen weten wat je doet."],["Je verhaal","Werk en uitleg die vertrouwen geven."],["De volgende stap","Een aanvraag die logisch volgt."]]},
  webshops:{label:"Van product naar verwerking",title:"Een winkel die",accent:"samenhangt.",steps:[["Kiezen","Product, variant en beschikbaarheid."],["Bestellen","Winkelmand, bezorgen en betalen."],["Verwerken","Bevestiging, voorraad en ordergegevens."]]},
  seo:{label:"Zoekvraag → antwoord → volgende stap",title:"Een echte vraag.",accent:"Jouw antwoord.",steps:[["Zoeken","Wat wil je toekomstige klant weten?"],["Begrijpen","Een relevante pagina met duidelijke uitleg."],["Verder kunnen","Naar een dienst, voorbeeld of contact."]]},
  "seo-optimalisatie":{label:"De onderdelen van vindbaarheid",title:"Inhoud en techniek.",accent:"Op elkaar afgestemd.",steps:[["Zoekvraag & pagina","Een eigen antwoord per relevant onderwerp."],["Structuur & techniek","Pagina’s die bereikbaar en goed verbonden zijn."],["Meten & bijwerken","Beschikbare gegevens bepalen de volgende stap."]]},
  "ai-automatisering":{label:"Een proces met duidelijke overdrachten",title:"Invoer wordt",accent:"bruikbaar werk.",steps:[["Ontvangen","Een aanvraag, document of berekening."],["Verwerken","Controleren, rekenen, ordenen of koppelen."],["Verder werken","Een uitkomst, taak of concept voor jouw controle."]]},
  "ai-koppelingen":{label:"Voorbeeld / Van aanvraag naar klantdossier",title:"De informatie reist.",accent:"Jij houdt overzicht.",steps:[["Formulier of e-mail","De vraag en contactgegevens komen binnen."],["Regels & AI","Vaste controles; AI waar taal moet worden begrepen."],["Je bestaande software","Een dossier en conceptantwoord, met controle."]]},
  "formulieren-rekentools":{label:"Een interface met een duidelijke taak",title:"De juiste invoer.",accent:"Een bruikbare uitkomst.",steps:[["Invullen","Alleen vragen wat voor de taak nodig is."],["Controleren","Velden, eenheden en rekenregels kloppen."],["Gebruiken","Een complete aanvraag of begrijpelijk resultaat."]]},
};

export function ServiceCanvas({kind,animated=false}:{kind:string;animated?:boolean}) {
  const editorial=kind==="content",social=kind==="social-media",brand=kind==="branding",care=kind==="onderhoud-hosting";
  const route=routeCopy[kind]??routeCopy.webdesign;
  return <figure className={`service-canvas canvas-${kind}`} data-scroll-scene={animated?"unfold":undefined}>
    <div className="canvas-stage" data-scene-target={brand||editorial||social?true:undefined}>
      {kind === "apps" ? <AppCanvas /> : kind === "webapps" ? <WebappCanvas /> : brand?<div className="canvas-identity"><span>De bouwstenen van je merk</span><div className="identity-type" aria-hidden="true">Aa<span>↗</span></div><strong>Herkenbaar.<br/><em>Ook in de details.</em></strong><div className="identity-colors" aria-label="Illustratie van een basis-, accent- en achtergrondkleur"><span>Basis</span><span>Accent</span><span>Ruimte</span></div><p>Logo · typografie · kleur · beeld · toon</p></div>
      : editorial?<div className="canvas-editorial"><span>Van vakkennis naar een leesbaar verhaal</span><strong>Een goede vraag.<br/><em>Een helder antwoord.</em></strong><div className="editorial-outline"><div><b>01</b><span>De vraag van je klant</span></div><div><b>02</b><span>Uitleg vanuit jouw expertise</span></div><div><b>03</b><span>Een passende volgende stap</span></div></div><p>Onderzoeken → schrijven → opmaken → publiceren</p></div>
      : social?<div className="canvas-social"><span>Zo werkt hergebruik van content</span><strong>Eén onderwerp.<br/><em>Drie passende vormen.</em></strong><div className="social-source">Jouw kennis, nieuws of project</div><div className="social-branches">{["Instagram","Facebook","LinkedIn"].map(item=><div key={item}><Arrow/><b>{item}</b></div>)}</div><p>De basis blijft gelijk. Tekst en vorm passen we aan per gekozen platform.</p></div>
      : care?<div className="canvas-maintenance"><span>Bij technisch onderhoud / Iedere maand</span><strong>Aandacht die<br/><em>terugkomt.</em></strong><ol data-scene-target>{[["Controleren","Snelheid en technische fouten nalopen."],["Herstellen","Fouten binnen de bestaande website oplossen."],["Bijwerken","Met SEO erbij: bestaande teksten en code verbeteren."]].map(([title,text],i)=><li key={title}><span>0{i+1}</span><div><b>{title}</b><p>{text}</p></div></li>)}</ol><small>Alleen hosting houdt je website online; onderhoud kies je erbij.</small></div>
      : <div className="canvas-route"><span>{route.label}</span><strong>{route.title}<br/><em>{route.accent}</em></strong><ol data-scene-target>{route.steps.map(([title,text],i)=><li key={title}><span>0{i+1}</span><div><b>{title}</b><p>{text}</p></div>{i<2&&<Arrow/>}</li>)}</ol></div>}
    </div>
  </figure>;
}
