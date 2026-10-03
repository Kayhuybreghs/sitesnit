import {Breadcrumbs,withPageMetadata} from '../seo';
import {overviewSections,websiteOverview,type OverviewEntry} from '../../lib/website-overview';
import './sitemap.css';

export const metadata=withPageMetadata({},'/sitemap');
function Links({entries}:{entries:OverviewEntry[]}){
 return <ul>{entries.filter(entry=>!entry.parent).map(entry=><li key={entry.href}><a href={entry.href}>{entry.label}</a>{entries.some(child=>child.parent===entry.href)&&<ul>{entries.filter(child=>child.parent===entry.href).map(child=><li key={child.href}><a href={child.href}>{child.label}</a></li>)}</ul>}</li>)}</ul>;
}
export default function Page(){
 const entries=websiteOverview();
 return <article className="website-overview">
  <Breadcrumbs items={[{name:'Home',path:'/'},{name:'Websiteoverzicht',path:'/sitemap'}]}/>
  <header className="wrap overview-intro"><span className="eyebrow">Websiteoverzicht</span><h1>Alle pagina’s van Sitesnit.</h1><p>Zoek je een dienst, een gratis tool of uitleg over je website? Hieronder staan de openbare pagina’s per onderwerp bij elkaar.</p></header>
  <nav className="wrap overview-jumps" aria-label="Onderwerpen in het websiteoverzicht">{overviewSections.map(section=><a key={section.id} href={'#'+section.id}>{section.title}</a>)}</nav>
  <div className="wrap overview-tree" data-sitemap-tree>{overviewSections.map(section=>{
   const items=entries.filter(entry=>entry.group===section.id),topics=[...new Set(items.map(entry=>entry.topic).filter(Boolean))];
   return <section id={section.id} key={section.id} data-sitemap-group={section.id} tabIndex={-1}><h2>{section.title}</h2><Links entries={items.filter(entry=>!entry.topic)}/>{topics.length>0&&<div className="overview-topics">{topics.map(topic=><div key={topic}>{section.id!=='tools'&&<h3>{topic}</h3>}<Links entries={items.filter(entry=>entry.topic===topic)}/></div>)}</div>}</section>;
  })}</div>
  <p className="wrap overview-end">Niet gevonden wat je zoekt? <a href="/contact">Bespreek je vraag met Kay.</a></p>
 </article>;
}
