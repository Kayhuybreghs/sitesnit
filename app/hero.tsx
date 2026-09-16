import { Arrow, Eyebrow } from "./ui";
import { BeurswijzerScreen } from "./beurswijzer-screen";
import { BeurswijzerEditorialPanel, BeurswijzerPlannerPanel } from "./beurswijzer-panels";

export function Hero() {
  return (
    <section className="hero-journey" data-hero-journey aria-label="We build brands">
      <div className="hero-pin">
        <div className="hero-intro wrap">
          <div className="hero-intro-copy">
            <Eyebrow>Sitesnit · Websites ontwerpen & bouwen</Eyebrow>
            <h1><span>WE BUILD</span><span className="hero-brand-word">BRANDS<span className="hero-brand-dot">.</span></span></h1>
            <p className="hero-intro-lead">Sitesnit ontwerpt en bouwt websites voor ondernemers in Limburg. Een herkenbaar merk, een helder verhaal en een logische route naar contact.</p>
            <div className="actions">
              <a className="button" href="/contact">Bouw met ons <Arrow /></a>
              <a className="text-link" href="#werk">Ontdek Beurswijzer <Arrow /></a>
            </div>
            <p className="hero-intro-services">Strategie <span>/</span> Webdesign <span>/</span> Development</p>
          </div>
        </div>

        <div className="hero-stage" data-hero-stage aria-hidden="true">
          <div className="hero-blob" />
          <div className="hero-rig">
            <div className="hero-camera">
              <figure className="hero-fragment hero-fragment-editorial">
                <div className="hero-fragment-bar"><span>02</span> Inzichten & verhalen</div>
                <BeurswijzerEditorialPanel />
              </figure>
              <figure className="hero-fragment hero-fragment-planner">
                <div className="hero-fragment-bar"><span>03</span> De budgetplanner</div>
                <BeurswijzerPlannerPanel />
              </figure>
              <div className="hero-laptop">
                <div className="hero-laptop-frame" />
                <div className="hero-window">
                  <div className="hero-window-image">
                    <BeurswijzerScreen />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-project-label"><span>In de spotlight</span><strong>Beurswijzer</strong><span>Een platform voor financieel inzicht</span></div>
        </div>

        <div className="hero-insights wrap">
          <div className="hero-insights-title"><span>BEURSWIJZER / VAN MERK NAAR GEBRUIK</span><p>Een herkenbaar geheel.<br /><em>Tot in de details.</em></p></div>
          <div className="hero-insights-grid">
            <div><span className="hero-note-number">02 / VERDIEPEN</span><h2>Een verhaal achter de cijfers.</h2><p>Artikelen over geld, wonen en beleggen. Herkenbare thema’s maken verder lezen vanzelfsprekend.</p></div>
            <div><span className="hero-note-number">01 / BINNENKOMEN</span><h2>Meteen weten waar je bent.</h2><p>Een heldere belofte, een eigen groene identiteit en twee logische routes: ontdekken of zelf rekenen.</p></div>
            <div><span className="hero-note-number">03 / ZELF DOEN</span><h2>Van lezen naar eigen inzicht.</h2><p>De budgetplanner brengt inkomsten, uitgaven en plannen samen in één persoonlijk overzicht.</p></div>
          </div>
        </div>
        <div className="hero-portal-veil" aria-hidden="true" />
        <a className="hero-scroll-cue" href="#werk"><span className="hero-scroll-line" aria-hidden="true" /><span>Scroll. Ontdek wat erachter zit.</span><span aria-hidden="true">↓</span></a>
      </div>
    </section>
  );
}
