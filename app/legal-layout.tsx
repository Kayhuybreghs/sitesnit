import type { ReactNode } from 'react';
import { Breadcrumbs } from './seo';
import { PrintDocument } from './legal-actions';
import './legal.css';

export function LegalLayout({ title, accent, intro, path, label, points, contents, children }: {
  title: string; accent: string; intro: string; path: string; label: string;
  points: string[]; contents: {id:string; title:string}[]; children: ReactNode;
}) {
  return <div className="legal-page">
    <Breadcrumbs items={[{name:'Home',path:'/'},{name:label,path}]} />
    <header className="wrap legal-opening"><span className="eyebrow">Sitesnit / {label}</span><h1>{title}<br/><em>{accent}</em></h1><p>{intro}</p><div className="legal-summary">{points.map((p,i)=><div key={p}><span>0{i+1}</span><p>{p}</p></div>)}</div><PrintDocument /></header>
    <div className="wrap legal-document"><nav className="legal-index" aria-label={`Inhoud ${label}`}><strong>Op deze pagina</strong><ol>{contents.map(c=><li key={c.id}><a href={`#${c.id}`}>{c.title}</a></li>)}</ol></nav><article className="legal-copy">{children}</article></div>
    <section className="wrap legal-contact"><h2>Een vraag over deze afspraken?</h2><p>Geef je vraag door via het contactformulier. We leggen het uit voordat je beslist.</p><a className="button" href="/contact">Neem contact op ↗</a></section>
  </div>;
}
