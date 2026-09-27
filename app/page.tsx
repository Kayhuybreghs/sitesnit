import { InlineArrow } from './inline-arrow';
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
            Laat maximaal 20 pagina’s onderzoeken op technische aandachtspunten,
            aangevuld met een mobiele Lighthouse-test van je startpagina.
            Bekijk het bewijs en ontdek wat je gericht kunt verbeteren.
          </p>
          <a className="button" href="/tools/seo-audit">
            Start je gratis SEO-audit <Arrow />
          </a>
          <p className="small">Alleen je websiteadres. Geen vragenlijst of account nodig.</p>
        </div>
        <div className="question-preview">
          <span className="example-tag">Zo werkt de SEO-audit</span>
          <p className="question-counter">
            100 <span>controlepunten</span>
          </p>
          <h3>
            Van je websiteadres
            <br />
            naar concrete verbeterpunten.
          </h3>
          {[
            "Pagina’s en technische signalen onderzoeken",
            "Je startpagina mobiel meten met Lighthouse",
            "Bewijs bekijken en verbeteringen bespreken",
          ].map((t,i) => (
            <div className="preview-answer" key={t}>
              <b aria-hidden="true">0{i+1}</b>
              {t}
            </div>
          ))}
          <span className="preview-bottom">
            Je ziet ook wat niet onderzocht kon worden.
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
            snit<sup><InlineArrow /></sup>
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
            Ik ben Kay, de maker achter Sitesnit in Baarlo. Wat maakt jouw
            bedrijf bijzonder? En wat moet je website voor je doen? Daar begint
            ons gesprek. Met aandacht voor je verhaal en heldere keuzes onderweg.
          </p>
          <div className="home-mascot">
            <img src="/about/nova-sitesnit-hond-320.webp" alt="Nova, de mascotte van Sitesnit" width="900" height="1600" loading="lazy" decoding="async" />
            <div><span>De kleinste collega</span><h3>Nova, de Sitesnit-mascotte.</h3><p>Kay bouwt. Nova bewaakt de gezelligheid.</p></div>
          </div>
          <a className="text-link" href="/over-sitesnit">
            Maak kennis met Kay en Sitesnit <Arrow />
          </a>
        </div>
      </section>
      <RegionSection />
      <Cta />
    </>
  );
}
