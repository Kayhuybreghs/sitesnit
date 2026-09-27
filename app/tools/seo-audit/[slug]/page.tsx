import { InlineArrow } from '../../../inline-arrow';
import {FaqData} from '../../../seo';
import {productionOrigin} from '../../../../lib/seo-policy';
import {notFound} from 'next/navigation';
import {auditGuides} from '../../../../lib/seo-audit/guides';
import {auditEditorial} from '../../../../lib/seo-audit/editorial';
import {withPageMetadata,Breadcrumbs,JsonLd} from '../../../seo';
import '../audit.css';
import '../editorial.css';
export function generateStaticParams(){return auditGuides.map(g=>({slug:g.slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const g=auditGuides.find(g=>g.slug===slug);return g?withPageMetadata({title:g.title,description:g.description},`/tools/seo-audit/${slug}`):{};}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;const g=auditGuides.find(g=>g.slug===slug);if(!g)notFound();const e=auditEditorial[slug];
 return <article className="audit-page audit-editorial">
  <JsonLd data={{'@context':'https://schema.org','@type':'Article',headline:g.title,description:g.description,inLanguage:'nl-NL',mainEntityOfPage:productionOrigin+`/tools/seo-audit/${slug}`,author:{'@id':productionOrigin+'/#organization'},publisher:{'@id':productionOrigin+'/#organization'}}}/>
  <Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools',path:'/tools'},{name:'SEO-audit',path:'/tools/seo-audit'},{name:g.title,path:`/tools/seo-audit/${slug}`}]}/>
  <header className="audit-hero"><div className="wrap"><div><span className="eyebrow">SEO uitgelegd / {e.label}</span><h1>{g.title}</h1><p>{g.intro}</p><a className="text-link" href="#kort-antwoord">Eerst het korte antwoord ↓</a></div><div className="audit-schematic"><header><strong>Hier let je op</strong><span>01 → 03</span></header><ol>{g.diagram.map((step,i)=><li key={step}><b>0{i+1}</b>{step}</li>)}</ol><a href="/tools/seo-audit#start-audit">Controleer je eigen website <InlineArrow /></a></div></div></header>
  <div className="wrap audit-body"><section className="audit-answer" id="kort-antwoord"><span className="eyebrow">Het korte antwoord</span><p>{e.answer}</p></section>
  <div className="audit-reading-layout"><aside><nav aria-label="In dit artikel"><strong>Van begrijpen naar oplossen</strong>{g.sections.map((s,i)=><a key={s.title} href={`#uitleg-${i}`}>{s.title}</a>)}<a href="#voorbeeld">Een praktisch voorbeeld</a><a href="#zelf-controleren">Zelf controleren</a><a href="#vragen">Veelgestelde vragen</a></nav></aside><div>
  {g.sections.map((s,i)=><section id={`uitleg-${i}`} className="audit-chapter audit-motion" key={s.title}><span aria-hidden="true">0{i+1}</span><div><h2>{s.title}</h2><p>{s.text}</p>{'items' in s&&<ul>{s.items.map(item=><li key={item}>{item}</li>)}</ul>}</div></section>)}
  </div></div>
  <section className="audit-case-study audit-motion" id="voorbeeld"><header><span className="eyebrow">Uitgewerkt voorbeeld · fictieve situatie</span><h2>{e.example.title}</h2></header><div className="audit-case-flow"><article><span>01 / Wat je aantreft</span><p>{e.example.before}</p></article><article><span>02 / Wat het betekent</span><p>{e.example.decision}</p></article><article><span>03 / Wat je aanpast</span><p>{e.example.after}</p></article></div></section>
  <div className="audit-decision-grid"><section id="zelf-controleren"><span className="eyebrow">Van lezen naar doen</span><h2>Zo controleer je het zelf.</h2><ol>{e.steps.map(step=><li key={step}>{step}</li>)}</ol></section><aside className="audit-caution audit-motion"><span className="eyebrow">Voorkom een verkeerde reparatie</span><h2>Dit verdient aandacht.</h2><p>{e.pitfalls}</p><a href={e.source.href}>{e.source.label} <InlineArrow /></a></aside></div>
  <section className="audit-faq" id="vragen"><FaqData path={`/tools/seo-audit/${g.slug}`} questions={e.faqs.map(f=>[f.question,f.answer])}/><span className="eyebrow">Nog even dit</span><h2>Vragen die hierbij horen.</h2>{e.faqs.map(f=><details key={f.question}><summary>{f.question}</summary><p>{f.answer}{f.href&&<> <a href={f.href}>{f.link} <InlineArrow /></a></>}</p></details>)}</section>
  <nav className="audit-next-reading" aria-label="Gericht verder lezen"><h2>Welke vraag speelt er nog?</h2>{e.next.map(next=>{const other=auditGuides.find(g=>g.slug===next)!;return <a key={next} href={`/tools/seo-audit/${next}`}><strong>{other.title}</strong><span>{other.description}</span><b aria-hidden="true"><InlineArrow /></b></a>;})}</nav>
  <section className="audit-workbench audit-motion"><span className="eyebrow">Jouw website als volgende stap</span><h2>Eerst weten wat er speelt.<br/>Dan gericht verbeteren.</h2><p>De gratis audit onderzoekt maximaal twintig URL’s en laat het gevonden bewijs zien. Wil je weten wat het herstel voor jouw website vraagt? Bespreek je uitkomst met Kay.</p><div className="audit-final-actions"><a className="button" href="/tools/seo-audit#start-audit">Start de gratis SEO-audit <InlineArrow /></a><a className="text-link" href="/contact?dienst=seo-optimalisatie">Bespreek de verbeterpunten <InlineArrow /></a></div><p className="small">Meer over uitvoering: <a href="/diensten/seo">SEO en vindbaarheid bij Sitesnit</a>.</p></section>
  </div></article>;
}
