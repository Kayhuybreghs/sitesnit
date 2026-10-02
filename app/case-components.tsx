import { ProjectPhoneScreen } from "./project-phone-screen";
import { Arrow, Eyebrow } from "./ui";
import { clientCases, type ClientCase } from "./portfolio-data";
import { WorkVisual } from "./work-visual";
import { caseStories } from "./case-story-data";
import "./case-feedback.css";

export function CaseLinks({title = "Van plan naar praktijk."}: {title?: string}) {
  return <section className="wrap related-cases">
    <div className="section-head"><div><Eyebrow>Werk dat doorgaat</Eyebrow><h2>{title}</h2></div><a className="text-link" href="/projecten">Alle projecten <Arrow /></a></div>
    <div className="case-link-grid">{clientCases.map(item => <a className={`case-link case-${item.theme}`} href={`/projecten/${item.slug}`} key={item.slug}>
      <span>Webdesign · tools · doorlopend beheer</span><h3>{item.name}</h3><p>Iedere week nieuwe blogs. SEO, hosting en onderhoud in een traject.</p><b>Bekijk de case <Arrow /></b>
    </a>)}</div>
  </section>;
}
export function PortfolioCard({project, index}: {project:ClientCase;index:number}) {
  return <article className={`portfolio-case case-${project.theme}`} data-reveal>
    <div className="portfolio-case-image">
      <div className="case-browserbar" aria-hidden="true"><span>0{index+1} / {project.name}</span></div>
      <img src={project.image} srcSet={`${project.image} ${project.imageSmallWidth}w, ${project.imageLarge} ${project.imageWidth}w`} sizes="(max-width: 767px) 90vw, 46vw" alt={project.imageAlt} width={project.imageWidth} height={project.imageHeight} loading={index ? "lazy" : "eager"} />
    </div>
    <div className="portfolio-case-copy"><p className="eyebrow">{project.eyebrow}</p><h2><a href={`/projecten/${project.slug}`}>{project.name} <Arrow /></a></h2><p>{project.summary}</p><ul><li>Webdesign & ontwikkeling</li><li>Wekelijkse blogs & SEO</li><li>Hosting & onderhoud</li></ul><a className="text-link" href={`/projecten/${project.slug}`}>Het verhaal achter {project.name} <Arrow /></a></div>
  </article>;
}
export function ClientCasePage({project:p}: {project:ClientCase}) {
  const isWijzer = p.slug === "beurswijzer";
  const story = caseStories[p.slug];
  return <div className={`client-case case-study case-${p.theme}`}>
    <section className="case-study-hero"><div className="wrap">
      <a className="back-link" href="/projecten">← Alle projecten</a>
      <div className="case-study-opening">
        <div className="case-study-intro"><Eyebrow>Project / {p.name}</Eyebrow><h1>{story.heading}<br/><em>{story.accent}</em></h1><p>{story.intro}</p><a className="button" href="#opdracht">Bekijk de uitwerking <Arrow/></a></div>
        <figure className="case-study-preview"><div className="case-study-preview-label"><span>{p.name}</span><span>Ontwerp in gebruik</span></div><img src={p.image} srcSet={`${p.image} ${p.imageSmallWidth}w, ${p.imageLarge} ${p.imageWidth}w`} sizes="(min-width: 1000px) 52vw, 90vw" width={p.imageWidth} height={p.imageHeight} alt={p.imageAlt} loading="eager" fetchPriority="high"/><figcaption>{story.imageCaption}</figcaption></figure>
      </div>
      <div className="case-study-summary"><p>{story.label}</p><a className="text-link" href={p.url} target="_blank" rel="nofollow noopener noreferrer" aria-label={`Bekijk de website van ${p.name} (opent in een nieuw tabblad)`}>Bekijk de website <Arrow/></a></div>
    </div></section>
    <nav className="wrap case-study-nav" aria-label="In deze case"><a href="#opdracht"><span>01</span> De opdracht</a><a href="#ontwerpkeuzes"><span>02</span> De keuzes</a><a href="#opgeleverd"><span>03</span> Wat er staat</a><a href="#na-de-bouw"><span>04</span> Het vervolg</a></nav>
    <section className="wrap case-study-brief" id="opdracht"><div><Eyebrow>01 / De opdracht</Eyebrow><h2>{isWijzer?"Overzicht in een onderwerp met veel cijfers.":"Complexe berekeningen begrijpelijk maken."}</h2><p>{p.challenge}</p></div><dl><div><dt>Voor wie?</dt><dd>{story.audience}</dd></div><div><dt>De opgave</dt><dd>{story.assignment}</dd></div><div><dt>De rol van Sitesnit</dt><dd>{story.role}</dd></div></dl></section>
    <section className="case-study-route" id="ontwerpkeuzes"><div className="wrap"><Eyebrow>02 / De gedachte achter het ontwerp</Eyebrow><h2>Lezen en rekenen.<br/><em>Een logische volgende stap.</em></h2><p>{story.bridge}</p><ol>{story.route.map((step,index)=><li key={step}><span>0{index+1}</span><strong>{step}</strong>{index<2&&<Arrow/>}</li>)}</ol></div></section>
    {isWijzer && <section className="wrap case-picture-story"><WorkVisual kind="editorial"/><div className="case-picture-copy"><Eyebrow>Inhoud & ontwerp</Eyebrow><h2>Een vraag herkennen.<br/><em>Verder willen lezen.</em></h2><p>{p.choices[0][1]}</p><p>{p.choices[1][1]}</p><p className="case-context-link">De terugkerende publicaties vallen onder onze <a href="/diensten/content">blogs en websiteteksten</a>.</p></div></section>}
    <section className="wrap case-picture-story picture-reverse"><WorkVisual kind={isWijzer?"budget":"tools"}/><div className="case-picture-copy"><Eyebrow>Van invoer naar inzicht</Eyebrow><h2>{p.toolTitle}</h2><p>{p.toolText}</p><ul>{(isWijzer?[p.choices[2]]:[p.choices[1],p.choices[2]]).map(([title,text])=><li key={title}><b>{title}</b>{text}</li>)}</ul><p className="case-context-link">Ook een berekening onderdeel maken van je website? Lees hoe we <a href="/diensten/formulieren-rekentools">formulieren en rekentools op maat</a> uitwerken.</p></div></section>
    <section className={`wrap case-mobile-story${isWijzer?"":" mobile-story-text"}`}>
      {isWijzer?<div className="case-phone"><ProjectPhoneScreen project="beurswijzer"/></div>:<div className="case-brand-note"><span>BEURSWATCHER</span><strong>Een eigen gezicht.<br/><em>Op ieder scherm.</em></strong><div className="watcher-palette" aria-label="Diepblauw, geel en gebroken wit"><i/><i/><i/></div></div>}
      <div className="case-picture-copy"><Eyebrow>Ontworpen voor mobiel</Eyebrow><h2>Dezelfde identiteit.<br/><em>Een eigen indeling.</em></h2><p>{p.choices[3][1]}</p>{!isWijzer&&<p>{p.choices[0][1]}</p>}<p className="case-context-link">Lees meer over de aanpak achter ons <a href="/diensten/webdesign">webdesign voor verschillende schermen</a>.</p></div>
    </section>
    <section className="wrap case-study-outcome" id="opgeleverd"><Eyebrow>03 / Wat er staat</Eyebrow><h2>Van ontwerpkeuze<br/><em>naar een werkend onderdeel.</em></h2><div>{story.outcome.map(([title,text],index)=><article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div><p className="case-study-evidence">Deze case laat het gerealiseerde ontwerp en de functies zien. Bezoekcijfers en conversieresultaten zijn hier niet gemeten of onderbouwd.</p></section>
    <section className="case-continuity-band" id="na-de-bouw"><div className="wrap case-continuity-inner"><div><Eyebrow>04 / Het vervolg</Eyebrow><h2>Een levend platform.<br /><em>Iedere week aandacht.</em></h2><p>{p.maintenance}</p></div><dl className="case-followup-list"><div><dt>Content</dt><dd>Iedere week een nieuw blog, met aandacht voor onderwerp, uitleg en een passende volgende stap.</dd></div><div><dt>Vindbaarheid</dt><dd>De SEO-basis en bestaande inhoud blijven onderdeel van het werk aan het platform.</dd></div><div><dt>Beheer</dt><dd>De technische basis blijft verzorgd met <a href="/diensten/onderhoud-hosting">hosting en websiteonderhoud</a>.</dd></div></dl></div></section>
    <section className="wrap case-next"><Eyebrow>Een vergelijkbaar idee?</Eyebrow><h2>Van jouw vraag.<br /><em>Naar een eigen oplossing.</em></h2><p>Een platform, rekentool of website die je verder wilt laten groeien? Bespreek wat je wilt maken én wat je daarna wilt uitbesteden.</p><a className="button" href={`/contact?project=${p.slug}`}>Bespreek jouw project <Arrow /></a></section>
  </div>;
}
