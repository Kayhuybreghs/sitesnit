import type { Service } from "./diensten/service-data";
import { Arrow, Eyebrow } from "./ui";
import { ServiceCanvas } from "./service-canvas";
import { ServiceToolDemo } from "./service-tool-demo";
import { ServicePricing } from "./service-pricing";
import { ServiceChapterBreak } from "./service-chapter-break";
import { hubScopes, serviceJourneys, specialistParents, serviceRelated, detailNotes } from "./service-experience-data";
import { RegionSection } from './region-section';

function Breadcrumb({service,detail=false}:{service:Service;detail?:boolean}) {
  const parent=detail?specialistParents[service.slug]:null;
  return <nav className="experience-breadcrumb" aria-label="Broodkruimel"><a href="/diensten">Diensten</a><span aria-hidden="true">/</span>{parent&&<><a href={`/diensten/${parent[1]}`}>{parent[0]}</a><span aria-hidden="true">/</span></>}<span aria-current="page">{service.name}</span></nav>;
}
function Journey({service}:{service:Service}) {
  return <section className="wrap experience-journey" id="samenwerking"><div className="experience-section-head"><div><Eyebrow>Zo werken we samen</Eyebrow><h2>Van jouw vraag.<br/><em>Naar dagelijks gebruik.</em></h2></div><p>Je hoeft geen uitgewerkt plan klaar te hebben. We maken stap voor stap duidelijk wat nodig is, wie wat verzorgt en wat je ontvangt.</p></div><ol>{serviceJourneys[service.slug].map((text,i)=><li key={text} data-reveal><span>0{i+1}</span><h3>{["Jij brengt je vraag.","We werken het uit.","Je kunt ermee verder."][i]}</h3><p>{text}</p></li>)}</ol></section>;
}
function Questions({service}:{service:Service}) {
  const questions=service.faqs.filter(([q])=>![/^Wat kost/,/^Wat is de maandprijs/,/^Wat bepaalt de investering/,/^Waar vind ik de prijzen/].some(pattern=>pattern.test(q)));
  return <section className="wrap experience-questions"><Eyebrow>Voor je begint</Eyebrow><h2>Goed om te weten.</h2><div>{questions.map(([q,a])=><article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div></section>;
}
function Closing({service}:{service:Service}) {
  return <section className="experience-closing"><div className="wrap"><div className="experience-closing-main"><div><Eyebrow>Jouw volgende stap / Sitesnit</Eyebrow><h2>Vertel waar je<br/><em>mee verder wilt.</em></h2></div><div><p>Een nieuw idee of iets dat nu niet lekker werkt: daar begint ons gesprek. Vanuit Baarlo werken we voor ondernemers in Venlo en Limburg. We denken mee over een passende aanpak en maken duidelijk wat je kunt laten verzorgen.</p><a className="button" href={service.contact}>{service.cta}<Arrow/></a></div></div><div className="experience-related"><span>Sluit hierop aan</span>{serviceRelated[service.slug].map(([title,text,slug])=><a href={`/diensten/${slug}`} key={slug}><div><b>{title}</b><span>{text}</span></div><Arrow/></a>)}</div></div></section>;
}

export function ServiceHub({service}:{service:Service}) {
  return <div className={`service-experience service-hub experience-${service.tone}`}>
    <header className="wrap experience-hub-hero"><Breadcrumb service={service}/><div className="hub-hero-grid"><div><Eyebrow>{service.name} / Venlo & Limburg</Eyebrow><h1>{service.title}<br/><em>{service.accent}</em></h1><p>{service.summary}</p><a className="text-link" href="#mogelijkheden">Dit kun je laten maken<Arrow/></a></div><ServiceCanvas kind={service.slug}/></div></header>
    <section className="wrap experience-scopes" id="mogelijkheden"><div className="experience-section-head"><div><Eyebrow>De mogelijkheden</Eyebrow><h2>{service.introTitle}<br/><em>{service.introAccent}</em></h2></div><p>{service.intro}</p></div><div className="hub-scope-list">{hubScopes[service.slug].map((scope,i)=><article key={scope.id} id={scope.id} data-reveal><span className="scope-number">0{i+1}</span><div><h3>{scope.title}</h3><p>{scope.text}</p></div><div><ul>{scope.includes.map(item=><li key={item}>{item}</li>)}</ul><a className="text-link" href={scope.href}>{scope.link}<Arrow/></a></div></article>)}</div>{service.slug==="ai-automatisering"&&<p className="experience-small-note" id="rekentools">Een budgetplanner kan ingevoerde kosten en zelf aangeleverde offertes vergelijken. Automatisch actuele aanbieders vergelijken vraagt daarnaast om toegestane, actuele gegevensbronnen. We bespreken eerst welke gegevens beschikbaar zijn.</p>}</section>
    <section className="wrap experience-tool-route"><div><Eyebrow>Zelf alvast verkennen</Eyebrow><h2>{service.slug==="webdesign"?"Geef je idee een eerste gezicht.":service.slug==="ai-automatisering"?"Breng één terugkerende taak in kaart.":"Ontdek waar je website sterker kan."}</h2><p>{service.slug==="webdesign"?"Kies inhoud, stijl en kleur. Bekijk een interactief websitevoorbeeld en neem je richting mee naar ons gesprek.":service.slug==="ai-automatisering"?"Maak een procesvoorstel, bereken je huidige handwerk en zie welke keuzes nog openstaan.":"Combineer vragen over je website met een echte mobiele Lighthouse-analyse. Je ontvangt concrete verbeterpunten."}</p></div><a className="button" href={service.slug==="webdesign"?"/tools/ontwerp-je-website":service.slug==="ai-automatisering"?"/tools/automatiseringsplan":"/websitecheck"}>{service.slug==="webdesign"?"Ontwerp je website":service.slug==="ai-automatisering"?"Maak je procesplan":"Check je website"}<Arrow/></a></section><Journey service={service}/><ServicePricing slug={service.slug}/><Questions service={service}/><Closing service={service}/>
    {service.slug === 'webdesign' && <RegionSection/>}
  </div>;
}

export function ServiceDetail({service}:{service:Service}) {
  const monthly=["onderhoud-hosting","content","social-media"].includes(service.slug);
  return <div className={`service-experience experience-detail-page detail-${service.slug} experience-${service.tone}`}>
    <header className="wrap experience-detail-hero"><Breadcrumb service={service} detail/><Eyebrow>{service.name} / De verdieping</Eyebrow><div><h1>{service.title}<br/><em>{service.accent}</em></h1><div><p>{service.summary}</p><a className="text-link" href={monthly?"#maandpakketten":"#aanpak"}>{monthly?"Bekijk pakketten & wat erbij hoort":"Van idee naar uitvoering"}<Arrow/></a></div></div><ul className="experience-tags">{service.tags.map(tag=><li key={tag}>{tag}</li>)}</ul></header>
    {monthly&&<ServicePricing slug={service.slug}/>}
    <section className="wrap experience-depth" id="aanpak"><div className="experience-depth-intro"><div><Eyebrow>Wat erachter zit</Eyebrow><h2>{service.introTitle}<br/><em>{service.introAccent}</em></h2><p>{service.intro}</p></div><ServiceCanvas kind={service.slug} animated/></div><div className="experience-chapters">{service.methods.flatMap(([title,text],i)=>[...(i===2?[service.slug==="formulieren-rekentools"?<div className="chapter-demo-break" key="interactive-demo"><ServiceToolDemo/></div>:<ServiceChapterBreak key="visual-break" kind={service.slug}/>]:[]),<article key={title} id={service.slug==="ai-koppelingen"?(i===1?"taal-documenten":i===2?"software":undefined):undefined} data-reveal><div className="chapter-index"><span>0{i+1}</span><i aria-hidden="true"/></div><div><h3>{title}</h3><p>{text}</p>{detailNotes[service.slug]?.[i]&&<p>{detailNotes[service.slug][i]}</p>}</div></article>])}</div></section>
    {service.slug==="formulieren-rekentools"&&<section className="wrap experience-demo-section"><aside className="experience-case-note"><span>Een voorbeeld uit ons werk</span><p>Voor Beurswatcher maakten we interactieve berekeningen waarin inleg, looptijd en rendement een grafiek worden. De cijfers volgen vaste rekenregels.</p><a className="text-link" href="/projecten/beurswatcher">Bekijk de rekentool in de case<Arrow/></a></aside></section>}
    {service.slug==="content"&&<section className="wrap experience-copy-note"><Eyebrow>Ook als eenmalige opdracht</Eyebrow><h2>De juiste woorden.<br/><em>Op je belangrijkste pagina’s.</em></h2><p>Nieuwe webteksten, een dienstenpagina die duidelijker moet of producten die betere uitleg verdienen: copywriting kan ook zonder blogabonnement. We bepalen de benodigde pagina’s, beschikbare informatie en gewenste toon. Je ontvangt vooraf een voorstel voor die opdracht.</p><a className="text-link" href="/contact?dienst=content">Bespreek je webteksten<Arrow/></a></section>}
    <Journey service={service}/>{!monthly&&<ServicePricing slug={service.slug}/>}<Questions service={service}/><Closing service={service}/>
  </div>;
}
