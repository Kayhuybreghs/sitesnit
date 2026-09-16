import { notFound } from "next/navigation";
import { Cta, Eyebrow, Arrow, ProjectMock } from "../../ui";
import { projects } from "../../site-data";
import { clientCases } from "../../portfolio-data";
import { ClientCasePage } from "../../case-components";
import "../../work-story.css";
import { withPageMetadata, Breadcrumbs, BreadcrumbData } from '../../seo';
export function generateStaticParams() {
  return [...projects, ...clientCases].map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = clientCases.find(p => p.slug === slug);
  if (client) return withPageMetadata({}, `/projecten/${slug}`);
  const p = projects.find((p) => p.slug === slug);
  return p
    ? withPageMetadata({alternates: { canonical: `/projecten/${slug}` }, robots: { index: false, follow: true }}, `/projecten/${slug}`)
    : notFound();
}
export default async function Project({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const client = clientCases.find(p => p.slug === slug);
  if (client) return <><Breadcrumbs items={[{name:'Home',path:'/'},{name:'Projecten',path:'/projecten'},{name:client.name,path:`/projecten/${slug}`}]} /><ClientCasePage project={client} /></>;
  const p = projects.find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <>
      <BreadcrumbData items={[{name:'Home',path:'/'},{name:'Projecten',path:'/projecten'},{name:p.name,path:`/projecten/${slug}`}]} />
      <section className="page-intro project-intro wrap">
        <a className="back-link" href="/projecten">
          ← Alle projecten
        </a>
        <Eyebrow>{p.category} / Ontwerpconcept</Eyebrow>
        <h1>
          {p.name}
          <br />
          <em>{p.tagline}</em>
        </h1>
        <p>
          {p.summary} Zelfstandig ontwikkeld door Sitesnit, geen klantopdracht.
          De fotografie is voor dit concept gegenereerd.
        </p>
      </section>
      <div className="wrap concept-showcase">
        <ProjectMock project={p} large />
      </div>
      <section className="section wrap project-story">
        <div>
          <Eyebrow>Het vertrekpunt</Eyebrow>
          <h2>
            Een duidelijke vraag.
            <br />
            <em>Bewuste keuzes.</em>
          </h2>
        </div>
        <div>
          <h3>{p.challenge}</h3>
          <p>
            Het doel van dit concept is een aanbod begrijpelijk maken, een
            herkenbare sfeer neerzetten en bezoekers naar een relevante
            vervolgstap begeleiden.
          </p>
          <ol className="choice-list">
            {p.choices.map((c, i) => (
              <li key={c}>
                <span>0{i + 1}</span>
                {c}
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="device-section">
        <div className="wrap device-grid">
          <div className="detail-phone">
            <div className="phone-speaker" />
            <b>{p.name}</b>
            <img
              src={`/images/${p.image}-480.webp`}
              alt={`Mobiele beelduitsnede voor ${p.name}`}
              width="480"
              height="320"
              loading="lazy"
            />
            <div>
              <h3>{p.tagline}</h3>
              <p>Een eigen verhaal verdient aandacht.</p>
              <span>Ontdek meer ↗</span>
            </div>
          </div>
          <div>
            <Eyebrow>Op ieder scherm</Eyebrow>
            <h2>
              Dezelfde aandacht.
              <br />
              <em>Een andere compositie.</em>
            </h2>
            <p>
              Op mobiel krijgt het beeld een eigen uitsnede. Teksten worden
              korter in breedte, de volgorde blijft logisch en belangrijke
              acties zijn direct herkenbaar.
            </p>
            <p>
              Dit is een ontwerpconcept. Er zijn geen gemeten conversie- of
              omzetresultaten aan verbonden.
            </p>
            <a className="text-link" href="/diensten">
              Ontdek wat bij jouw website past <Arrow />
            </a>
          </div>
        </div>
      </section>
      <Cta title="Een eigen richting" accent="voor jouw bedrijf?" />
    </>
  );
}
import "../../expansion.css";
