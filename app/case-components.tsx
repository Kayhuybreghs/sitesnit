import { ProjectPhoneScreen } from "./project-phone-screen";
import { Arrow, Eyebrow } from "./ui";
import { clientCases, type ClientCase } from "./portfolio-data";
import { WorkVisual } from "./work-visual";
import { caseFeedbackPlaceholders } from "./case-feedback-placeholders";
import "./case-feedback.css";

export function CaseLinks({title = "Van plan naar praktijk."}: {title?: string}) {
  return <section className="wrap related-cases">
    <div className="section-head"><div><Eyebrow>Werk dat doorgaat</Eyebrow><h2>{title}</h2></div><a className="text-link" href="/projecten">Alle projecten <Arrow /></a></div>
    <div className="case-link-grid">{clientCases.map(item => <a className={`case-link case-${item.theme}`} href={`/projecten/${item.slug}`} key={item.slug}>
      <span>Webdesign · tools · doorlopend beheer</span><h3>{item.name}</h3><p>Iedere week nieuwe blogs. SEO, hosting en onderhoud in één traject.</p><b>Bekijk de case <Arrow /></b>
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
  const feedback = caseFeedbackPlaceholders[isWijzer?"beurswijzer":"beurswatcher"];
  return <div className={`client-case case-${p.theme}`}>
    <section className="wrap case-hero">
      <a className="back-link" href="/projecten">← Alle projecten</a>
      <div className="case-hero-grid"><div><Eyebrow>{p.name} / Een doorlopend project</Eyebrow><h1>{p.title}<br /><em>{p.accent}</em></h1></div><div><p>{p.summary}</p><a className="text-link" href={p.url} target="_blank" rel="nofollow noopener noreferrer" aria-label={`Bekijk ${p.name} (opent in een nieuw tabblad)`}>Bekijk {p.name} <Arrow /></a></div></div>
      <dl className="case-facts"><div><dt>Het platform</dt><dd>{p.name}</dd></div><div><dt>De uitwerking</dt><dd>Merk, website & rekentools</dd></div><div><dt>Daarna</dt><dd>Wekelijkse blogs, SEO & beheer</dd></div></dl>
    </section>
    <div className="wrap case-visual-cover"><WorkVisual kind={isWijzer?"brand":"watcher"} priority sizes="(max-width: 899px) 88vw, 800px"/></div>
    <section className="wrap case-brief"><div><Eyebrow>Het vertrekpunt</Eyebrow><h2>{isWijzer?"Grip op je geld.":"Ruimte om te begrijpen."}<br/><em>Begint bij overzicht.</em></h2></div><p>{p.challenge}</p></section>
    {isWijzer && <section className="wrap case-picture-story"><WorkVisual kind="editorial"/><div className="case-picture-copy"><Eyebrow>01 / Inhoud & ontwerp</Eyebrow><h2>Een vraag herkennen.<br/><em>Verder willen lezen.</em></h2><p>{p.choices[0][1]}</p><p>{p.choices[1][1]}</p><a className="text-link" href="/diensten/content">Zo verzorgen we de inhoud<Arrow/></a></div></section>}
    <section className="wrap case-picture-story picture-reverse"><WorkVisual kind={isWijzer?"budget":"tools"}/><div className="case-picture-copy"><Eyebrow>{isWijzer?"02":"01"} / Van invoer naar inzicht</Eyebrow><h2>{p.toolTitle}</h2><p>{p.toolText}</p><ul>{(isWijzer?[p.choices[2]]:[p.choices[1],p.choices[2]]).map(([title,text])=><li key={title}><b>{title}</b>{text}</li>)}</ul><a className="text-link" href="/diensten/ai-automatisering">Tools die jouw werk eenvoudiger maken<Arrow/></a></div></section>
    <section className={`wrap case-mobile-story${isWijzer?"":" mobile-story-text"}`}>
      {isWijzer?<div className="case-phone"><ProjectPhoneScreen project="beurswijzer"/></div>:<div className="case-brand-note"><span>BEURSWATCHER</span><strong>Een eigen gezicht.<br/><em>Op ieder scherm.</em></strong><div className="watcher-palette" aria-label="Diepblauw, geel en gebroken wit"><i/><i/><i/></div></div>}
      <div className="case-picture-copy"><Eyebrow>{isWijzer?"03":"02"} / Mobile first</Eyebrow><h2>Dezelfde identiteit.<br/><em>Een eigen indeling.</em></h2><p>{p.choices[3][1]}</p>{!isWijzer&&<p>{p.choices[0][1]}</p>}<a className="text-link" href="/diensten/webdesign">Meer over ons webdesign<Arrow/></a></div>
    </section>
    <section className="case-continuity-band"><div className="wrap case-continuity-inner"><div><Eyebrow>Ook na de bouw</Eyebrow><h2>Een levend platform.<br /><em>Iedere week aandacht.</em></h2><p>{p.maintenance}</p></div><div className="case-maintenance-list"><a href="/diensten/content"><b>01 / Content</b>Iedere week een nieuw blog <Arrow /></a><a href="/diensten/seo"><b>02 / Vindbaarheid</b>SEO-basis en inhoud bijhouden <Arrow /></a><a href="/diensten/onderhoud-hosting"><b>03 / Beheer</b>Hosting en websiteonderhoud <Arrow /></a></div></div></section>
    <section className="wrap case-feedback-example"><div><Eyebrow>{feedback.label}</Eyebrow><h2>{feedback.heading}</h2><p>{feedback.note}</p></div><blockquote>{feedback.paragraphs.map(text=><p key={text}>{text}</p>)}</blockquote></section>
    <section className="wrap case-next"><Eyebrow>Een vergelijkbaar idee?</Eyebrow><h2>Van jouw vraag.<br /><em>Naar een eigen oplossing.</em></h2><p>Een platform, rekentool of website die je verder wilt laten groeien? Bespreek wat je wilt maken én wat je daarna wilt uitbesteden.</p><a className="button" href={`/contact?project=${p.slug}`}>Bespreek jouw project <Arrow /></a></section>
  </div>;
}
