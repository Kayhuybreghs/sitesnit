import {notFound} from 'next/navigation';
import {Breadcrumbs,FaqData,withPageMetadata} from '../../../seo';
import {speedGuides} from '../../../../lib/speed-guides';
import '../speed.css';
export function generateStaticParams(){return speedGuides.map(({slug})=>({slug}));}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const guide=speedGuides.find(item=>item.slug===slug);if(!guide)notFound();return withPageMetadata({},`/tools/snelheidstest/${slug}`);}
export default async function SpeedGuide({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params,guide=speedGuides.find(item=>item.slug===slug);if(!guide)notFound();
  const path=`/tools/snelheidstest/${slug}`;
  return <div className="speed-page"><Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:'Snelheidstest',path:'/tools/snelheidstest'},{name:guide.label,path}]}/>
    <article className="wrap speed-guide"><header><p className="eyebrow">Snelheidstest / {guide.label}</p><h1>{guide.title}</h1><p className="speed-answer">{guide.answer}</p><p>Onderzoek je eigen pagina met de <a href="/tools/snelheidstest#snelheid-meten">gratis snelheidstest</a> en gebruik deze uitleg naast de uitkomst.</p></header>
      <ol className="speed-reading-line" aria-label="Drie kernpunten">{guide.steps.map((step,i)=><li key={step}><span>0{i+1}</span><strong>{step}</strong></li>)}</ol>
      <div className="speed-guide-sections">{guide.sections.map((section,i)=><section key={section.title}><span className="speed-section-number">0{i+1}</span><div><h2>{section.title}</h2><p>{section.text}</p>{i===1&&<p>Lees ook: <a href={`/tools/snelheidstest/${guide.related}`}>{guide.relatedLabel.toLocaleLowerCase('nl-NL')}</a>.</p>}</div></section>)}</div>
      <section className="speed-faq"><h2>Vragen bij dit onderwerp</h2>{guide.questions.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
      <footer className="speed-guide-footer"><p>Bron: <a href={guide.source}>de technische uitleg van Google</a>. Een meting is een hulpmiddel voor onderzoek, geen garantie voor zoekposities.</p><p>Loop je vast bij de oorzaak? Op <a href="/diensten/seo-optimalisatie">SEO-optimalisatie</a> lees je hoe Sitesnit inhoud en techniek gericht beoordeelt.</p></footer>
    </article><FaqData path={path} questions={guide.questions}/>
  </div>;
}
