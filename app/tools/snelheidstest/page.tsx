import {Breadcrumbs,FaqData,withPageMetadata} from '../../seo';
import {Arrow} from '../../ui';
import {speedGuides,speedQuestions} from '../../../lib/speed-guides';
import {SpeedClient} from './speed-client';
import './speed.css';
export const metadata=withPageMetadata({},'/tools/snelheidstest');
export default function SpeedPage(){return <div className="speed-page">
  <Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:'Snelheidstest',path:'/tools/snelheidstest'}]}/>
  <header className="wrap speed-hero"><div><p className="eyebrow">Gratis website snelheidstest</p><h1>Weten waar je<br/><em>website op wacht.</em></h1><p>Test een pagina op mobiel of desktop. Bekijk de echte Lighthouse-score, hoe de pagina laadt en welke onderdelen aandacht verdienen.</p><a className="button" href="#snelheid-meten">Meet mijn pagina <Arrow/></a><p className="speed-note">Geen account. Geen e-mailadres. Je uitkomst staat hieronder.</p></div><div className="speed-hero-art" aria-label="Van websiteadres naar meting en verbeterpunt"><span>Van laden naar begrijpen</span><ol><li><b>01</b><div>Jouw pagina<small>Een openbaar websiteadres</small></div></li><li><b>02</b><div>De meetresultaten<small>Score, laadtijden en stabiliteit</small></div></li><li><b>03</b><div>Een gerichte volgende stap<small>Op basis van wat is gevonden</small></div></li></ol><p>Een meting van één pagina. Geen oordeel over je hele bedrijf.</p></div></header>
  <div className="wrap"><SpeedClient/>
    <section className="speed-understand"><div><p className="eyebrow">Je resultaat begrijpen</p><h2>De score is het begin.<br/><em>De oorzaak helpt je verder.</em></h2><p>Een grote afbeelding, late serverreactie of blokkerend script vraagt elk om een andere aanpak. Lees de ontvangen bevindingen voordat je iets aanpast. Wil je ook indexering, interne links en metadata onderzoeken? Gebruik daarvoor de <a href="/tools/seo-audit">technische SEO-audit</a>.</p></div><nav aria-label="Uitleg bij je snelheidstest">{speedGuides.map((guide,index)=><a href={`/tools/snelheidstest/${guide.slug}`} key={guide.slug}><span>0{index+1}</span><div><strong>{guide.label}</strong><small>{guide.title}</small></div><Arrow/></a>)}</nav></section>
    <section className="speed-faq"><h2>Voor je begint</h2>{speedQuestions.map(([question,answer])=><details key={question}><summary>{question}</summary><p>{answer}</p></details>)}<p>Wil je van losse metingen een werkbare aanpak maken? Lees <a href="/website-snelheid-testen">hoe je je website gericht op snelheid onderzoekt</a>.</p></section>
  </div><FaqData path="/tools/snelheidstest" questions={speedQuestions}/>
</div>;}
