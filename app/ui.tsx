import { InlineArrow } from './inline-arrow';
import { site, euro } from "./site-data";
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
export function PriceCards({ compact = false }: { compact?: boolean }) {
  const customPrice = site.packages.find(p => p.id === 'maatwerk')!.price;
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
                <span aria-hidden="true"><InlineArrow /></span>
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
          <InlineArrow />
        </span>
        <p>
          <strong>Een groter idee? Maatwerk begint vanaf {euro(customPrice)} excl. btw ({euro(grossPrice(customPrice))} incl.).</strong>
          <br />
          De paginaomvang, gewenste functies, koppelingen en beschikbare inhoud bepalen het voorstel.
        </p>
        <a className="text-link" href="/tools/website-kosten-berekenen">
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
