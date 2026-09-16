import { withPageMetadata, BreadcrumbData } from '../seo';
import { Cta, Eyebrow, ProjectCard, Arrow } from "../ui";
import { projects } from "../site-data";
import { clientCases } from "../portfolio-data";
import { WorkVisual } from "../work-visual";
import { HeroMotion } from '../hero-motion';
import "../work-story.css";
import type { Metadata } from "next";
export const metadata: Metadata = withPageMetadata({alternates: {canonical: "/projecten"}}, '/projecten');
export default function Projecten() {
  return <>
    <HeroMotion />
    <BreadcrumbData items={[{name:'Home',path:'/'},{name:'Projecten',path:'/projecten'}]} />
    <section className="wrap portfolio-opening"><Eyebrow>Geselecteerd werk / Sitesnit</Eyebrow><h1>Een eigen verhaal.<br/><em>Tot in de uitwerking.</em></h1><div className="portfolio-opening-bottom"><p>Een herkenbaar merk, een bruikbare tool en inhoud die blijft groeien. Bekijk het ontwerp én het werk achter twee financiële platforms.</p><span>02 platforms · ontwerp, ontwikkeling & beheer</span></div></section>
    {clientCases.map((p,i)=><section className={`portfolio-feature project-${p.theme}`} id={i===0?"cases":undefined} key={p.slug}><div className="wrap portfolio-feature-grid"><WorkVisual kind={i===0?"design":"watcher"} priority={i===0}/><div className="portfolio-feature-copy"><span>0{i+1} / FINANCIEEL PLATFORM</span><h2>{p.name}</h2><p>{i===0?"Van je maandbudget naar je plannen voor later. Een rustige groene identiteit brengt artikelen, een budgetplanner en scenario’s samen.":"Een eigen gezicht voor financiële verhalen. Diepblauw, geel en een calculator die inleg, tijd en samengestelde groei inzichtelijk maakt."}</p><div className="portfolio-role-list"><span>Merk & webdesign</span><span>{i===0?"Budgetplanner & grafieken":"Rendementcalculator"}</span><span>Wekelijkse blogs & SEO</span><span>Hosting & onderhoud</span></div><a className="button" href={`/projecten/${p.slug}`}>Bekijk de case<Arrow/></a></div></div></section>)}
    <section className="wrap portfolio-service-note"><p>Goed werk stopt niet bij de lancering.</p><h2>Ook de inhoud.<br /><em>Ook het onderhoud.</em></h2><p>Voor beide platforms verzorgen we wekelijkse blogs, de SEO-basis, hosting en websiteonderhoud. Zo blijven ontwerp, techniek en inhoud met elkaar verbonden.</p><a className="text-link" href="/diensten/onderhoud-hosting">Ontdek het doorlopende beheer <Arrow /></a></section>
    <section className="wrap project-concepts-heading"><Eyebrow>Ontwerpstudies</Eyebrow><h2>Andere merken.<br /><em>Andere richtingen.</em></h2><p>Drie zelfstandige ontwerpconcepten voor interieur, horeca en architectuur. Deze studies zijn geen klantopdrachten.</p></section>
    <section className="wrap portfolio-grid">{projects.map(p=><ProjectCard key={p.slug} project={p} />)}</section>
    <Cta title="Wat wil jij neerzetten?" accent="Laten we het uitwerken." />
  </>;
}
import "../expansion.css";
