import {Breadcrumbs,FaqData,withPageMetadata} from '../../seo';
import {Arrow} from '../../ui';
import {speedGuides,speedQuestions} from '../../../lib/speed-guides';
import {SpeedClient} from './speed-client';
import './speed.css';
export const metadata=withPageMetadata({},'/tools/snelheidstest');
export default function SpeedPage(){return <div className="speed-page">
  <Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:'Snelheidstest',path:'/tools/snelheidstest'}]}/>
  <header className="wrap speed-hero speed-hero-compact"><div><p className="eyebrow">Gratis website snelheidstest</p><h1>Test de snelheid<br/><em>van je website.</em></h1><p>Meet één openbare pagina op mobiel, desktop of beide. Je krijgt de Lighthouse-score, laadmetingen en concrete bevindingen. Gratis, zonder account of e-mailadres.</p></div></header>
  <div className="wrap"><SpeedClient/>
    <section className="speed-understand"><div><p className="eyebrow">Je resultaat begrijpen</p><h2>De score is het begin.<br/><em>De oorzaak helpt je verder.</em></h2><p>Een grote afbeelding, late serverreactie of blokkerend script vraagt elk om een andere aanpak. Lees de ontvangen bevindingen voordat je iets aanpast. Wil je ook indexering, interne links en metadata onderzoeken? Gebruik daarvoor de <a href="/tools/seo-audit">technische SEO-audit</a>.</p></div><nav aria-label="Uitleg bij je snelheidstest">{speedGuides.map((guide,index)=><a href={`/tools/snelheidstest/${guide.slug}`} key={guide.slug} target="_blank" rel="noopener noreferrer"><span>0{index+1}</span><div><strong>{guide.label}</strong><small>{guide.title} (nieuw tabblad)</small></div><Arrow/></a>)}</nav></section>
    <section className="speed-faq"><h2>Voor je begint</h2>{speedQuestions.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}<p>Wil je van losse metingen een werkbare aanpak maken? Lees <a href="/website-snelheid-testen" target="_blank" rel="noopener noreferrer">hoe je je website gericht op snelheid onderzoekt (nieuw tabblad)</a>.</p></section>
  </div><FaqData path="/tools/snelheidstest" questions={speedQuestions}/>
</div>;}
