import {guideAnswers} from '../lib/guide-answers';
import type { Guide, GuideSection } from '../lib/guides';
import { guides } from '../lib/guides';
import { contentSources } from '../lib/content-sources';
import { site, euro } from './site-data';
import { business, grossPrice, minimumHostingYear } from '../lib/business';
import { Breadcrumbs, FaqData } from './seo';
import { Arrow, Eyebrow } from './ui';
import { GuideWidget } from './guide-widgets';
import './guides.css';
import './guide-refinements.css';

// Individually authored contextual links, never a sitewide keyword autolinker.
function Paragraph({text,links=[]}:{text:string;links?:GuideSection['links']}) {
  const link=links.find(item=>text.includes(item.phrase));
  if(!link)return <p>{text}</p>;
  const start=text.indexOf(link.phrase);
  return <p>{text.slice(0,start)}<a className="inline-context-link" href={link.href}>{link.phrase}</a>{text.slice(start+link.phrase.length)}</p>;
}

export default function GuidePage({guide}:{guide:Guide}) {
  const editorial = guideAnswers[guide.slug];
  const path = `/${guide.slug}`;
  const contextualTargets=new Set(guide.sections.flatMap(section=>(section.links||[]).filter(link=>section.paragraphs?.some(p=>p.includes(link.phrase))).map(link=>link.href)));
  return <article className="guide-page" data-content-id={guide.id}>
    <Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:guide.title,path}]}/>
    <header className="wrap guide-intro"><div><Eyebrow>Sitesnit / Praktische uitleg</Eyebrow><h1>{guide.title}</h1><p>{guide.intro}</p></div><div className="guide-takeaway"><span>Het korte antwoord</span><strong>{editorial?.answer || guide.outcome}</strong><div aria-hidden="true">A<span>→</span>B</div></div></header>
    <div className="wrap guide-layout"><aside className="guide-contents"><nav aria-label="Op deze pagina"><strong>Op deze pagina</strong>{guide.sections.map((s,i)=><a href={`#stap-${i+1}`} key={s.heading}><span>0{i+1}</span>{s.heading}</a>)}</nav><a className="text-link" href={guide.tool}>Maak het concreet met een tool <Arrow/></a></aside>
    <div className="guide-body">{guide.sections.map((section,index)=><section id={`stap-${index+1}`} key={section.heading} data-paragraph-id={`${guide.id}-${index+1}`}>
      <h2>{section.heading}</h2>
      {section.table&&<div className="guide-comparison" role="table" aria-label={section.heading}><div role="row" className="guide-comparison-head">{section.table.headers.map(h=><b role="columnheader" key={h}>{h}</b>)}</div>{section.table.rows.map((row,i)=><div role="row" key={i}>{row.map((cell,j)=><div role="cell" key={j}><span aria-hidden="true" className="guide-cell-label">{section.table!.headers[j]}</span>{cell}</div>)}</div>)}</div>}
      {section.checklist&&<ol className="guide-steps">{section.checklist.map(text=><li key={text}>{text}</li>)}</ol>}
      {section.paragraphs?.map((p,i)=><Paragraph key={i} text={p} links={section.links}/>)}
    </section>)}
    {guide.widget==='packages'&&<section className="guide-widget"><h2>De actuele Sitesnit-pakketbasis</h2><div className="guide-price-list">{site.packages.map(p=><div key={p.id}><strong>{p.name}</strong><span>{p.pages}</span><b>{p.id==='maatwerk'?'Vanaf ':''}{euro(p.price)} excl. btw</b><span>{p.id==='maatwerk'?'Vanaf ':''}{euro(grossPrice(p.price))} incl. btw</span></div>)}</div><p>Naast de bouwprijs: hosting vanaf {euro(business.hostingMonthly)} excl. btw per maand ({euro(grossPrice(business.hostingMonthly))} incl. btw), voor minimaal {business.hostingInitialMonths} maanden. Eerste hostingjaar minimaal {euro(grossPrice(minimumHostingYear))} incl. btw.</p><a href="/kosten" className="text-link">Pakketten en afspraken bekijken <Arrow/></a></section>}
    {guide.widget==='cost-inventory'&&<p className="guide-business-note">Hosting bij een nieuwe Sitesnit-website: vanaf {euro(business.hostingMonthly)} excl. btw / {euro(grossPrice(business.hostingMonthly))} incl. btw per maand. Eerste looptijd: {business.hostingInitialMonths} maanden, minimaal {euro(grossPrice(minimumHostingYear))} incl. btw voor dat jaar.</p>}
    {guide.widget&&<GuideWidget kind={guide.widget}/>}
    {guide.widget==='migration'&&<section className="guide-widget"><h2>Bewaar je URL-mapping</h2><p>Gebruik een rij per oud adres. Vul de nieuwe bestemming, de gekozen actie en het resultaat van je hercontrole in.</p><a className="button" href="/downloads/website-migratie-mapping.csv" download>Download lege URL-mapping <Arrow/></a></section>}
    {guide.widget==='structures'&&<section className="guide-widget"><h2>Drie voorbeeldstructuren</h2><div className="guide-trees">{[
      {name:'Vakbedrijf',branches:[['Diensten','Renovatie','Onderhoud'],['Projecten','Uitgevoerde opdracht'],['Werkwijze'],['Contact']]},
      {name:'Adviseur',branches:[['Vraagstukken','Starten','Groeien'],['Aanpak','Kennismaking'],['Over'],['Contact']]},
      {name:'Inhoudelijk platform',branches:[['Onderwerpen','Uitleg per onderwerp'],['Hulpmiddelen','Een passende berekening'],['Over'],['Contact']]},
    ].map(tree=><div key={tree.name}><h3>{tree.name}</h3><b>Home</b><ul>{tree.branches.map(branch=><li key={branch[0]}>{branch[0]}{branch.length>1&&<ul>{branch.slice(1).map(leaf=><li key={leaf}>{leaf}</li>)}</ul>}</li>)}</ul></div>)}</div></section>}
    {guide.widget==='lab-example'&&<section className="guide-widget"><h2>Zo lees je een meting</h2><p><strong>Dit is een fictief rapportvoorbeeld, geen uitgevoerde scan.</strong></p><dl><dt>Voorbeeldpagina</dt><dd>https://example.com/diensten</dd><dt>Voorbeeldmeetmoment</dt><dd>22 september 2026, 10:00 UTC</dd><dt>Omstandigheden</dt><dd>Mobiele labtest met gesimuleerde netwerk- en CPU-vertraging</dd><dt>Voorbeeldwaarde</dt><dd>LCP: 3,8 seconden</dd><dt>Bijbehorende observatie</dt><dd>Het grootste zichtbare beeld wordt pas laat als resource ontdekt.</dd><dt>Gerichte vervolgstap</dt><dd>Controleer of dit zichtbare beeld via JavaScript of lazy loading wordt uitgesteld. Pas alleen aan als dat in de echte audit is vastgesteld. Meet daarna opnieuw.</dd></dl><a className="text-link" href="/tools/snelheidstest#snelheid-meten">Meet je eigen pagina <Arrow/></a></section>}
    {guide.widget==='cases'&&<section className="guide-case-grid">{['beurswijzer','beurswatcher'].map((slug)=><div key={slug}><figure className="guide-case-illustration"><img src={`/og/${slug}.png`} alt={`Schematische deelillustratie bij de ${slug==='beurswijzer'?'Beurswijzer':'Beurswatcher'}-case`} width="1200" height="630" loading="lazy"/><figcaption>Schematische illustratie. Bekijk de echte uitwerking in de case.</figcaption></figure><h3>{slug==='beurswijzer'?'Beurswijzer':'Beurswatcher'}</h3><ul>{(slug==='beurswijzer'?['Groene identiteit verbindt uitleg en hulpmiddelen.','De budgetplanner onderscheidt inkomsten, uitgaven, reserveringen en doelen.','Op mobiel krijgen de onderdelen een eigen leesvolgorde.']:['Diepblauw en geel maken de belangrijkste elementen herkenbaar.','Stevige typografie geeft bedragen en uitleg een verschillende rol.','Eigen inleg, samengestelde groei en koopkracht blijven afzonderlijk leesbaar.']).map(text=><li key={text}>{text}</li>)}</ul><a className="text-link" href={`/projecten/${slug}`}>Bekijk de volledige case <Arrow/></a><a href={guide.tool}>Werk je eigen richting uit</a></div>)}</section>}
    {guide.sources.length>0&&<section className="guide-sources"><h2>Verder lezen bij de bron</h2><ul>{guide.sources.map(id=><li key={id}><a href={contentSources[id].url}>{contentSources[id].name}</a></li>)}</ul></section>}
    {editorial && <section className="guide-faq"><FaqData path={path} questions={editorial.questions}/><Eyebrow>Voor je verdergaat</Eyebrow><h2>Veelgestelde vragen.</h2>{editorial.questions.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>}
    </div></div>
    <nav className="wrap guide-related" aria-label="Verder met dit onderwerp"><h2>Dit helpt je ook verder</h2>{guide.related.filter(path=>!contextualTargets.has(path)).map(path=><a href={path} key={path}>{guides.find(g=>`/${g.slug}`===path)?.title||({'/kosten':'Pakketten en kosten','/projecten':'Bekijk het werk van Sitesnit','/contact':'Vraag een belafspraak aan','/projecten/beurswijzer':'De Beurswijzer-case','/projecten/beurswatcher':'De Beurswatcher-case','/seo-venlo':'SEO voor bedrijven in Venlo'} as Record<string,string>)[path]||path.split('/').at(-1)?.replaceAll('-',' ')}<Arrow/></a>)}</nav>
    <section className="wrap guide-next"><Eyebrow>Van uitleg naar jouw website</Eyebrow><h2>Wat betekent dit voor jouw plannen?</h2><p>Onderzoek je eigen situatie met de bijpassende tool. Of bespreek direct met Kay welke werkzaamheden bij je vraag passen.</p><div><a className="button" href={guide.tool}>Gebruik de bijpassende tool <Arrow/></a><a className="text-link" href={`/contact?dienst=${encodeURIComponent(guide.service.slice("/diensten/".length))}`}>Bespreek je vraag <Arrow/></a></div><a href={guide.service}>Bekijk de bijbehorende dienst</a></section>

  </article>;
}
