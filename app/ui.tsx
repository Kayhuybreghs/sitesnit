import { Project, site, euro } from "./site-data";
import { grossPrice, minimumHostingYear } from '../lib/business';
import { WebsitePrice } from './website-price';
import { BusinessNotes } from './business-notes';
export function Arrow() {
  return (
    <svg
      className="arrow"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 19 19 5M5 5h14v14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow">
      <span className="snip" aria-hidden="true" />
      {children}
    </p>
  );
}
export function HeroPanels() {
  return (
    <div
      className="hero-art"
      aria-label="Gelaagd webdesignconcept voor Atelier Vorm"
    >
      <div className="art-grid" />
      <span className="art-caption">Van idee naar eigen gezicht.</span>
      <div className="browser-panel back-panel" aria-hidden="true">
        <div className="color-swatches">
          <i />
          <i />
          <i />
        </div>
        <span>Aa</span>
        <small>Karakter in elk detail.</small>
      </div>
      <div className="browser-panel main-panel">
        <div className="browser-top">
          <i />
          <i />
          <i />
          <span>atelier vorm · concept</span>
        </div>
        <div className="mock-nav">
          <b>vorm.</b>
          <span>Collectie &nbsp; Verhaal &nbsp; Contact ↗</span>
        </div>
        <div className="mock-hero">
          <span>GEMAAKT OM TE BLIJVEN</span>
          <h2>
            Ruimte voor
            <br />
            <em>karakter.</em>
          </h2>
          <img
            src="/images/chair-960.webp"
            srcSet="/images/chair-480.webp 480w, /images/chair-640.webp 640w, /images/chair-960.webp 960w, /images/chair-1536.webp 1536w"
            sizes="(max-width: 540px) 80vw, (max-width: 800px) 480px, 42vw"
            width="960"
            height="640"
            alt="Conceptbeeld van een eiken designstoel met bordeaux bekleding"
            fetchPriority="high"
          />
          <span className="mock-button">Ontdek de collectie ↗</span>
        </div>
        <div className="mock-footer">
          <span>
            Mooi van vorm.
            <br />
            Fijn om in te leven.
          </span>
          <span>01 — 03</span>
        </div>
      </div>
      <div className="mobile-panel" aria-hidden="true">
        <b>vorm.</b>
        <img
          src="/images/chair-480.webp"
          srcSet="/images/chair-240.webp 240w, /images/chair-480.webp 480w"
          sizes="(max-width: 540px) 25vw, 160px"
          width="480"
          height="320"
          alt=""
        />
        <span>
          Ruimte voor
          <br />
          <em>karakter.</em>
        </span>
        <i>Ontdek meer ↗</i>
      </div>
      <span className="art-chip">Ook op mobiel. Helemaal raak.</span>
      <span className="art-label">Ontwerpconcept · geen klantopdracht</span>
    </div>
  );
}
export function ProjectMock({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  return (
    <div className={`project-scene ${project.theme} ${large ? "large" : ""}`}>
      <div className="project-browser">
        <div className="project-top">
          <b>{project.name}</b>
          <span>Ontdek &nbsp; Ons verhaal &nbsp; ↗</span>
        </div>
        <div className="project-visual">
          <img
            src={`/images/${project.image}-960.webp`}
            srcSet={`/images/${project.image}-480.webp 480w, /images/${project.image}-640.webp 640w, /images/${project.image}-960.webp 960w, /images/${project.image}-1536.webp 1536w`}
            sizes={
              large
                ? "(max-width: 768px) 90vw, 1000px"
                : "(max-width: 540px) calc(100vw - 88px), (max-width: 800px) 40vw, 600px"
            }
            width="1536"
            height="1024"
            alt={project.image === 'chair' ? 'Designstoel als beeld voor het interieurconcept Atelier Vorm' : project.image === 'matcha' ? 'Matcha als beeld voor het horecaconcept Studio Matcha' : 'Architectuur als beeld voor het ontwerpconcept Buiten Gewoon'}
            loading="lazy"
          />
          <div className="project-type">
            <span>{project.category}</span>
            <p>{project.tagline}</p>
            <i>Ontdek het verhaal ↗</i>
          </div>
        </div>
        <div className="project-browser-bottom">
          <span>Een eigen verhaal, in elke vorm.</span>
          <span>↗</span>
        </div>
      </div>
      <span className="scene-label">Concept</span>
    </div>
  );
}
export function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <div
        className="project-card-link"
        style={{ display: "block" }}
      >
        <div className="project-image-link">
          <div aria-hidden="true">
            <ProjectMock project={project} />
          </div>
        </div>
        <a className="project-meta" href={`/projecten/${project.slug}`}>
          <div>
            <h3>{project.name}</h3>
            <p>
              {project.category} <span>· Ontwerpconcept</span>
            </p>
          </div>
          <span className="icon-link" aria-hidden="true">
            <Arrow />
          </span>
        </a>
      </div>
    </article>
  );
}
export function PriceCards({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`pricing-menu ${compact ? "compact" : ""}`}>
      {site.packages.map((p, i) => (
        <article key={p.id} className={`pricing-route pricing-route-${i}`}>
          <div className="pricing-route-name">
            <span className="pricing-index">0{i + 1}</span>
            <div>
              <span className="eyebrow">{p.pages}</span>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
            </div>
          </div>
          <ul>
            {p.points.map((x) => (
              <li key={x}>
                <span aria-hidden="true">↗</span>
                {x}
              </li>
            ))}
          </ul>
          <div className="pricing-route-action">
            <WebsitePrice net={p.price} from={i === 2} />
            <p className="price-total">Met het eerste hostingjaar: {i === 2 ? 'vanaf' : 'minimaal'} {euro(grossPrice(p.price + minimumHostingYear))} incl. btw.</p>
            <a href={`/contact?pakket=${p.id}`} className="button">
              Bespreek{" "}
              {i === 2 ? "maatwerk" : `je ${i === 0 ? "onepager" : "website"}`}{" "}
              <Arrow />
            </a>
          </div>
        </article>
      ))}
      <div className="pricing-context">
        <span className="pricing-context-mark" aria-hidden="true">
          ↗
        </span>
        <p>
          <strong>Een groter idee? Maatwerk begint vanaf €2.750 excl. btw ({euro(grossPrice(2750))} incl.).</strong>
          <br />
          Grotere maatwerkprojecten komen gemiddeld rond{" "}
          {euro(site.averageProjectCost)} excl. btw ({euro(grossPrice(site.averageProjectCost))} incl.) uit. Dat geeft context; jouw wensen
          bepalen het voorstel.
        </p>
        <a className="text-link" href="/prijscheck">
          Wat past bij jouw idee? <Arrow />
        </a>
      </div>
      <BusinessNotes compact />
    </div>
  );
}
export function Cta({
  title = "Tijd voor een website",
  accent = "die je verder brengt.",
}: {
  title?: string;
  accent?: string;
}) {
  return (
    <section className="cta-section">
      <div className="wrap">
        <Eyebrow>Vertel, wat zijn je plannen?</Eyebrow>
        <a href="/contact" className="cta-link" style={{ display: "block" }}>
          <div className="cta-row">
            <h2>
              {title}
              <br />
              <em>{accent}</em>
            </h2>
            <span className="cta-circle" aria-hidden="true">
              <Arrow />
            </span>
          </div>
          <div className="cta-bottom">
            <p>Een eerste gesprek begint met jouw verhaal.</p>
            <span className="text-link">
              Bespreek je plannen <Arrow />
            </span>
          </div>
        </a>
      </div>
    </section>
  );
}
