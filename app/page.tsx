import { withPageMetadata, PageData } from './seo';
import { WorkingTogether } from "./studio-components";
import { BuildStory, Possibilities } from "./scroll-scenes";
import { PriceCards, Cta, Eyebrow, Arrow } from "./ui";
import { Hero } from "./hero";
import { HeroMotion } from './hero-motion';
import { FeaturedProject } from "./featured-project";
import type { Metadata } from "next";
import { RegionSection } from './region-section';
import { JsonLd } from './seo';
import { site } from './site-data';
export const metadata: Metadata = withPageMetadata({alternates: { canonical: "/" }}, '/');
export default function Home() {
  return (
    <>
      <PageData path="/" />
      <JsonLd data={{'@context':'https://schema.org','@type':'WebSite','@id':`${site.origin}/#website`,name:site.name,url:site.origin,inLanguage:'nl-NL',publisher:{'@id':`${site.origin}/#organization`}}}/>
      <Hero />
      <HeroMotion />
      <FeaturedProject />
      <BuildStory />
      <Possibilities />
      <section className="wrap tool-feature">
        <div>
          <Eyebrow>Je bestaande website, onder de loep</Eyebrow>
          <h2>
            Waar kan
            <br />
            <em>je website beter?</em>
          </h2>
          <p>
            Combineer een echte mobiele Lighthouse-analyse met 15 vragen over je
            verhaal en klantpad. Ontdek wat goed gaat en welke verbeteringen
            aandacht verdienen.
          </p>
          <a className="button" href="/websitecheck">
            Check je website <Arrow />
          </a>
          <p className="small">Je resultaat bekijken kan zonder e-mailadres.</p>
        </div>
        <div className="question-preview">
          <span className="example-tag">Voorbeeldvraag</span>
          <p className="question-counter">
            01 <span>/ 15</span>
          </p>
          <h3>
            Is meteen duidelijk
            <br />
            wat je bedrijf doet?
          </h3>
          {[
            "Ja, in één oogopslag",
            "Je moet even verder lezen",
            "Dat weet ik niet zeker",
          ].map((t) => (
            <div className="preview-answer" key={t}>
              <span className="radio-mark" />
              {t}
            </div>
          ))}
          <span className="preview-bottom">
            Jouw antwoorden + echte metingen
          </span>
        </div>
      </section>
      <WorkingTogether />
      <section className="pricing-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <Eyebrow>Een helder vertrekpunt</Eyebrow>
              <h2>
                Een website die past.
                <br />
                <em>Ook bij je plannen.</em>
              </h2>
            </div>
            <a className="text-link" href="/kosten">
              Vergelijk de pakketten <Arrow />
            </a>
          </div>
          <PriceCards compact />
          <div className="price-check-link">
            <p>Nog niet zeker wat je nodig hebt?</p>
            <a className="text-link" href="/tools">
              Ontdek welke tool je verder helpt <Arrow />
            </a>
          </div>
        </div>
      </section>
      <section className="section wrap personal-strip">
        <div className="personal-mark" aria-hidden="true">
          <span>site</span>
          <span>
            snit<sup>↗</sup>
          </span>
        </div>
        <div>
          <Eyebrow>Achter Sitesnit</Eyebrow>
          <h2>
            Goed werk begint
            <br />
            <em>met goed luisteren.</em>
          </h2>
          <p>
            Wat maakt jouw bedrijf bijzonder? En wat moet je website voor je
            doen? Daar begint het gesprek. Met aandacht voor je verhaal en
            heldere keuzes onderweg.
          </p>
          <a className="text-link" href="/over-sitesnit">
            Meer over Sitesnit <Arrow />
          </a>
        </div>
      </section>
      <RegionSection />
      <Cta />
    </>
  );
}
