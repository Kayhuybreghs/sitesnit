import { Arrow, Eyebrow } from "./ui";
import { WorkVisual, type WorkKind } from "./work-visual";
import type { Service } from "./diensten/service-data";

const scenes:Record<string,[WorkKind,WorkKind]>={webdesign:["design","editorial"],webshops:["shop","design"],branding:["brand","editorial"],seo:["editorial","design"],content:["editorial","care"],"social-media":["social","care"],"onderhoud-hosting":["care","editorial"],"ai-automatisering":["tools","budget"]};
const topicLinks:Record<string,[string,string][]>= {
  webdesign:[["Websitepakketten","/diensten/webdesign/pakketten"],["Webshops","/diensten/webshops"],["Merk & identiteit","/diensten/branding"],["Formulieren & functies","/diensten/ai-automatisering#formulieren"]],
  seo:[["SEO-aanpak","#aanpak"],["Blogs & copywriting","/diensten/content"],["Social media","/diensten/social-media"],["Doorlopende SEO","/diensten/onderhoud-hosting"]],
  "ai-automatisering":[["Rekentools","#rekentools"],["Formulieren","#formulieren"],["AI-assistenten","#ai-assistenten"],["Softwarekoppelingen","#koppelingen"]],
};
export function ServiceTopicNav({slug}:{slug:string}) {
  const links=topicLinks[slug];
  if(!links) return null;
  return <nav className="wrap service-topic-nav" aria-label="Verdiep je in deze dienst"><span>Lees verder over</span><div>{links.map(([label,href])=><a href={href} key={href}>{label}<Arrow/></a>)}</div></nav>;
}
export function ServiceNarrativeHero({service:s}:{service:Service}) {
  const parent=["webshops","branding"].includes(s.slug)?["/diensten/webdesign","Webdesign & merk"]:["content","social-media"].includes(s.slug)?["/diensten/seo","SEO & content"]:["/diensten","Wat we doen"];
  return <section className={`service-narrative-hero narrative-${s.slug}`}><div className="wrap narrative-hero-grid"><div className="narrative-hero-copy"><a className="back-link" href={parent[0]}>← {parent[1]}</a><Eyebrow>{s.name} / Sitesnit</Eyebrow><h1>{s.title}<br/><em>{s.accent}</em></h1><p>{s.summary}</p><div className="narrative-hero-actions"><a className="button" href={s.contact}>{s.cta}<Arrow/></a><a className="text-link" href="#aanpak">Bekijk de aanpak ↓</a></div></div><WorkVisual kind={scenes[s.slug][0]} priority compact/></div></section>;
}
export function ServiceDemonstration({service:s}:{service:Service}) {
  return <section className="wrap service-demonstration" id="aanpak"><div className="demonstration-heading"><Eyebrow>De keuzes achter het werk</Eyebrow><h2>{s.introTitle}<br/><em>{s.introAccent}</em></h2><p>{s.intro}</p></div><div className="demonstration-grid"><WorkVisual kind={scenes[s.slug][1]}/><div className="demonstration-steps">{s.methods.map(([title,text],i)=><details key={title} id={s.slug==="ai-automatisering"&&i===2?"ai-assistenten":undefined} open={i===0||s.slug==="ai-automatisering"}><summary><span>0{i+1}</span><h3>{title}</h3><b aria-hidden="true">+</b></summary><p>{text}</p></details>)}<span className="demonstration-hint">{s.slug==="ai-automatisering"?"Open of sluit een onderdeel om je te richten op jouw vraag.":"Open een onderdeel voor de uitwerking."}</span></div></div></section>;
}
export function ServiceRoutes({service:s}:{service:Service}) {
  return <section className="service-paths" id={s.slug==="ai-automatisering"?"rekentools":undefined}><div className="wrap"><div className="section-head"><div><Eyebrow>De mogelijkheden</Eyebrow><h2>{s.optionsTitle}<br/><em>{s.optionsAccent}</em></h2></div></div><div className="service-path-list">{s.options.map(([title,text,label,href],i)=><a href={href} key={title}><span className="path-no">0{i+1}</span><div><h3>{title}</h3><p>{text}</p></div><span className="path-action">{label}<Arrow/></span></a>)}</div></div></section>;
}
