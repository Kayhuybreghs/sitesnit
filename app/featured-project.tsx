"use client";
import { ProjectPhoneScreen } from "./project-phone-screen";

import { useEffect, useRef, useState } from "react";
import { Arrow } from "./ui";

const featured = [
  {
    name: "Beurswijzer", theme: "wijzer",
    heading: "Inzicht op groot scherm.", accent: "Gemaakt voor je hand.",
    intro: "Van maandbudget naar toekomstplan. Heldere grafieken, een eigen identiteit en alle ruimte voor mobiel.",
    tags: ["Financieel platform", "Interactieve grafieken", "Mobile first"],
    desktop: "/projects/beurswijzer/growth.webp", desktopWidth: 1185, desktopHeight: 620,
    desktopAlt: "Beurswijzer-grafiek met drie beleggingsscenario’s uit het fictieve voorbeeldbudget",
    desktopTitle: "Cijfers die iets vertellen.",
    desktopText: "Vergelijk scenario’s in één leesbare grafiek.",
    mobileTitle: "Mobile first.",
    mobileText: "De belangrijkste routes direct onder je duim.",
  },
  {
    name: "Beurswatcher", theme: "watcher",
    heading: "Verder kijken.", accent: "Op ieder scherm.",
    intro: "Een blauwgele wereld voor nieuwsgierige beleggers. Verhalen en rekentools, herkenbaar op elk scherm.",
    tags: ["Beleggingsplatform", "Rekentools", "Mobile first"],
    desktop: "/projects/beurswatcher/calculator.webp", desktopWidth: 1150, desktopHeight: 585,
    desktopAlt: "Beurswatcher-rendementcalculator met invoervelden en een grafiek van scenario en eigen inleg",
    desktopTitle: "Inzicht door interactie.",
    desktopText: "Bekijk wat inleg en tijd in een scenario doen.",
    mobileTitle: "Klein scherm. Eigen karakter.",
    mobileText: "Dezelfde identiteit, met een mobiele indeling.",
  },
];

export function FeaturedProject({ id = "werk", showMore = true }: { id?: string; showMore?: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync(); media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  const select = (index: number) => {
    const element = viewport.current;
    if (!element) return;
    element.scrollTo({ left: Math.max(0, Math.min(featured.length - 1, index)) * element.clientWidth, behavior: reduced ? "instant" : "smooth" });
  };

  return (
    <section className="featured-projects" id={id} data-project-theme={featured[active].theme} aria-label="Uitgelichte websiteprojecten">
      <div role="region" aria-roledescription="carrousel" aria-label="Bekijk Beurswijzer en Beurswatcher" onKeyDown={event => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          select(active + (event.key === "ArrowRight" ? 1 : -1));
        }
      }}>
        <div className="project-selector wrap">
          <div className="project-selector-names" aria-label="Kies een project">
            {featured.map((project, index) => <button key={project.theme} type="button" aria-pressed={active === index} onClick={() => select(index)}><span>0{index + 1}</span>{project.name}</button>)}
          </div>
          <div className="project-selector-arrows">
            <button type="button" onClick={() => select(active - 1)} disabled={active === 0} aria-label="Vorig project">←</button>
            <button type="button" onClick={() => select(active + 1)} disabled={active === featured.length - 1} aria-label="Volgend project">→</button>
          </div>
        </div>
        <div ref={viewport} className="project-carousel-viewport" onScroll={event => {
          const element = event.currentTarget;
          setActive(Math.max(0, Math.min(featured.length - 1, Math.round(element.scrollLeft / element.clientWidth))));
        }}>
        <div className="project-carousel-track">
          {featured.map((project, index) => (
            <div key={project.theme} className="project-carousel-slide" role="group" aria-roledescription="slide" aria-label={`${index + 1} van ${featured.length}: ${project.name}`} aria-hidden={active !== index} inert={active !== index}>
              <article className="wrap project-slide-inner">
                <div className="project-slide-header">
                  <div><p className="project-kicker">Uitgelicht / {project.name}</p><h2>{project.heading}<br /><em>{project.accent}</em></h2></div>
                  <div className="project-slide-intro"><p>{project.intro}</p></div>
                </div>
                <div className="project-showcase">
                  <figure className="project-desktop-feature">
                    <div className="project-detail-image">
                      <img src={project.desktop} srcSet={`${project.desktop.replace('.webp', '-640.webp')} 640w, ${project.desktop} ${project.desktopWidth}w`} sizes="(max-width: 899px) 75vw, 640px" width={project.desktopWidth} height={project.desktopHeight} alt={project.desktopAlt} loading="lazy" decoding="async" draggable={false} />
                    </div>
                  </figure>
                  <figure className="project-mobile-feature">
                    <div className="project-phone">
                      <span className="project-phone-top" aria-hidden="true"><i /><i /></span>
                      <ProjectPhoneScreen project={project.theme === "wijzer" ? "beurswijzer" : "beurswatcher"}/>
                      <span className="project-phone-bottom" aria-hidden="true" />
                    </div>
                  </figure>
                </div>
                <div className="project-essentials">
                  <div><h3>{project.desktopTitle}</h3><p>{project.desktopText}</p></div>
                  <div><h3>{project.mobileTitle}</h3><p>{project.mobileText}</p></div>
                  <a className="text-link" href={`/projecten/${project.theme === "wijzer" ? "beurswijzer" : "beurswatcher"}`}>Bekijk de case <Arrow /></a>
                </div>
              </article>
            </div>
          ))}
        </div>
        </div>
        <div className="project-slider-footer wrap">
          <p aria-live="polite" aria-atomic="true"><strong>0{active + 1}</strong> / 02 <span>{featured[active].name}</span></p>
          {showMore && <a className="text-link" href="/projecten">Meer werk <Arrow /></a>}
        </div>
      </div>
    </section>
  );
}
