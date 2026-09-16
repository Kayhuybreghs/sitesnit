"use client";
import { useState, useRef, type CSSProperties } from "react";
import {
  designPlan,
  designPalettes,
  type DesignInput,
} from "../../../lib/tool-plans";
type View = "home" | "services" | "work" | "about" | "contact";
export default function DesignPreview({
  input,
  device,
}: {
  input: DesignInput;
  device: "desktop" | "mobile";
}) {
  const [view, setView] = useState<View>("home");
  const [trail, setTrail] = useState<View[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const plan = designPlan(input),
    colors = designPalettes[input.palette];
  const style = {
    "--ds-accent": colors.accent,
    "--ds-paper": colors.paper,
    "--ds-ink": colors.ink,
    "--ds-soft": colors.soft,
  } as CSSProperties;
  const nav: [View, string][] = [
    ["home", "Home"],
    ...(input.goal === 'work' ? [['work',plan.pages[2]],['services',plan.pages[1]]] as [View,string][] : [['services',plan.pages[1]],['work',plan.pages[2]]] as [View,string][]),
    ["about", "Over"],
    ["contact", "Contact"],
  ];
  const target =
    input.goal === "work"
      ? "work"
      : input.goal === "shop"
        ? "services"
        : "contact";
  function go(next: View, remember = true) {
    if (remember && next !== view) setTrail(previous => [...previous, view]);
    setView(next);
    requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      const section = contentRef.current?.querySelector<HTMLElement>(
        `#ds-${next}`,
      );
      // Preview navigation must never scroll the surrounding Sitesnit page.
      if (canvas && section) {
        const headerHeight = canvas.querySelector('header')?.getBoundingClientRect().height ?? 0;
        const top = input.pages === 'one'
          ? canvas.scrollTop + section.getBoundingClientRect().top - canvas.getBoundingClientRect().top - headerHeight
          : 0;
        canvas.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
      }
      section
        ?.querySelector<HTMLHeadingElement>("h2")
        ?.focus({ preventScroll: true });
    });
  }
  const show = (section: View) => input.pages === "one" || view === section;
  return (
    <div className={`ds-device ds-device-${device}`}>
      <div className={`ds-site ds-style-${input.style}`} style={style}>
        <div className="ds-topbar">
          <i />
          <i />
          <i />
          <span>{plan.name} · ontwerpvoorbeeld</span>
          <button type="button" disabled={!trail.length} onClick={() => {
            const previous = trail.at(-1);
            if (!previous) return;
            setTrail(trail.slice(0, -1));
            go(previous, false);
          }} aria-label="Vorige voorbeeldpagina">← Terug</button>
        </div>
        <div className="ds-canvas" ref={canvasRef}>
          <header className="ds-nav">
            <button
              type="button"
              className="ds-brand"
              onClick={() => go("home")}
            >
              {plan.name}
              <span>↗</span>
            </button>
            <nav aria-label="Navigatie binnen je ontwerpvoorbeeld">
              {nav.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => go(key)}
                  aria-current={
                    input.pages !== "one" && view === key ? "page" : undefined
                  }
                >
                  {label}
                </button>
              ))}
            </nav>
          </header>
            <div className={`ds-content ds-goal-${input.goal}`} ref={contentRef}>
            {show("home") && (
              <section className="ds-hero" id="ds-home">
                <div className="ds-hero-copy">
                  <span className="ds-kicker">
                    {input.audience.trim()
                      ? `Voor ${input.audience}`
                      : input.activity || "Een eigen verhaal"}
                  </span>
                  <h2 tabIndex={-1}>{plan.headline}</h2>
                  <p>{plan.intro}</p>
                  <button
                    className="ds-button"
                    type="button"
                    onClick={() => go(target)}
                  >
                    {plan.action}
                    <span>↗</span>
                  </button>
                </div>
                <div
                  className="ds-art"
                  role="img"
                  aria-label="Grafische compositie als plek voor jouw eigen beeld"
                >
                  <div className="ds-art-ring" />
                  <div className="ds-art-block">
                    <b>{plan.name.slice(0, 1).toUpperCase()}</b>
                    <span>{input.activity || "Jouw verhaal"}</span>
                  </div>
                  <span className="ds-art-label">
                    Ruimte voor jouw eigen beeld
                  </span>
                  <span className="ds-art-mark">↗</span>
                </div>
                <div className="ds-hero-bottom">
                  <span>{plan.services.slice(0, 3).join(" / ")}</span>
                  <button type="button" onClick={() => go(input.goal === 'work' ? 'work' : 'services')}>{input.goal === 'work' ? 'Bekijk het werk' : 'Ontdek het aanbod'} ↓</button>
                </div>
              </section>
            )}
            {input.pages !== 'one' && view === 'home' && <section className="ds-intent-preview" aria-label="Voorbeeld van de vervolgstap">
              <span className="ds-kicker">{input.goal === 'work' ? 'Een eerste indruk van het werk' : input.goal === 'booking' ? 'Van kennismaking naar afspraak' : input.goal === 'shop' ? 'Ontdek de collectie' : 'Van jouw vraag naar een oplossing'}</span>
              {input.goal === 'work' ? <div className="ds-intent-projects">{[1,2].map(n=><button type="button" key={n} onClick={()=>go('work')}><i aria-hidden="true">{n===1?'↗':'Aa'}</i><span>Eigen project {n} · voorbeeldplek</span></button>)}</div> : <div className="ds-intent-offers">{plan.services.slice(0,3).map((service,i)=><button type="button" key={`${service}-${i}`} onClick={()=>go(input.goal === 'booking' ? 'contact' : 'services')}><span>0{i+1}</span><strong>{service}</strong><span aria-hidden="true">↗</span></button>)}</div>}
            </section>}
            {show("services") && (
              <section className="ds-section" id="ds-services">
                <span className="ds-kicker">Het aanbod</span>
                <h2 tabIndex={-1}>
                  {input.goal === "shop"
                    ? "Ontdek wat bij je past."
                    : "Waarmee kunnen we je helpen?"}
                </h2>
                <div className="ds-services">
                  {plan.services.map((service, i) => (
                    <article key={`${service}-${i}`}>
                      <span>0{i + 1}</span>
                      <h3>{service}</h3>
                      <p>
                        Hier vertel je wat {service} inhoudt, voor
                        wie het is en wat iemand kan verwachten.
                      </p>
                      <button type="button" onClick={() => go("contact")}>
                        Bespreek je vraag ↗
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {show("work") && (
              <section className="ds-section" id="ds-work">
                <span className="ds-kicker">Werk & voorbeelden</span>
                <h2 tabIndex={-1}>Laat je werk voor zich spreken.</h2>
                <div className="ds-projects">
                  {[1, 2].map((n) => (
                    <article key={n}>
                      <div className={`ds-project-art ds-project-${n}`}>
                        <span>{n === 1 ? "Aa" : "↗"}</span>
                        <i />
                        <b>Jouw eigen projectbeeld</b>
                      </div>
                      <h3>Ruimte voor een eigen project</h3>
                      <p>
                        Voeg een echte opdracht toe, met je aanpak en het werk
                        dat je hebt gemaakt.
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            )}
            {show("about") && (
              <section className="ds-section ds-about" id="ds-about">
                <div className="ds-about-art" aria-hidden="true">
                  <span>{plan.name.slice(0, 1).toUpperCase()}</span>
                </div>
                <div>
                  <span className="ds-kicker">
                    Het verhaal achter {plan.name}
                  </span>
                  <h2 tabIndex={-1}>Een bedrijf met een eigen gezicht.</h2>
                  <p>
                    Hier komt jouw persoonlijke verhaal: waarom je dit werk
                    doet, hoe je samenwerkt en wat klanten bij je kunnen
                    verwachten.
                  </p>
                  <button
                    className="ds-button"
                    type="button"
                    onClick={() => go("contact")}
                  >
                    Maak kennis ↗
                  </button>
                </div>
              </section>
            )}
            {show("contact") && (
              <section className="ds-section ds-contact" id="ds-contact">
                <span className="ds-kicker">De volgende stap</span>
                <h2 tabIndex={-1}>Vertel waar je mee bezig bent.</h2>
                <p>
                  Op je eigen website komen hier je contactgegevens en een
                  passend formulier
                  {input.goal === "booking"
                    ? " of een afgesproken boekingsoplossing"
                    : ""}
                  .
                </p>
                <div className="ds-example-form">
                  <span>Je naam</span>
                  <span>Je e-mailadres</span>
                  <span>Waar kunnen we je mee helpen?</span>
                  <b>Formuliervoorbeeld · verstuurt niets</b>
                </div>
              </section>
            )}
          </div>
          <footer className="ds-footer">
            <strong>{plan.name}</strong>
            <span>Ontwerpvoorbeeld · inhoud om samen uit te werken</span>
          </footer>
        </div>
      </div>
    </div>
  );
}
