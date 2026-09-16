import { Arrow, Eyebrow } from "./ui";

export function BuildStory() {
  return (
    <section className="build-story" data-scroll-scene>
      <div className="wrap build-grid">
        <div className="build-copy">
          <Eyebrow>Elke keuze heeft een taak</Eyebrow>
          <h2>
            Niet zomaar mooi.
            <br />
            <em>Mooi doordacht.</em>
          </h2>
          <p>
            Wat doe je? Waarom past dat bij mij? Hoe gaan we verder?
            Een goed ontwerp beantwoordt die vragen in de juiste volgorde.
          </p>
          <ol className="build-points">
            <li>
              <span>01</span>
              <div>
                <h3>Meteen begrijpen.</h3>
                <p>
                  Je aanbod en doelgroep zijn direct duidelijk. Je bezoeker weet waar die is.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Vertrouwen opbouwen.</h3>
                <p>Werk en concrete voorbeelden laten zien wat je aanpak betekent.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Verder kunnen.</h3>
                <p>
                  Een herkenbare contactactie maakt de volgende stap eenvoudig.
                </p>
              </div>
            </li>
          </ol>
          <a className="text-link" href="/diensten/webdesign">
            Zo bouwen we jouw website <Arrow />
          </a>
        </div>
        <div className="fold-stage" aria-hidden="true">
          <div className="fold-orbit" />
          <span className="fold-caption">Van eerste indruk naar contact</span>
          <div className="fold-site">
            <div className="fold-panel fold-top">
              <div className="fold-nav">
                <b>jouw merk.</b>
                <span>Ontdek &nbsp; Over &nbsp; Contact ↗</span>
              </div>
              <small>VOOR MENSEN MET PLANNEN</small>
              <strong>
                Een goed verhaal.
                <br />
                <em>Helemaal van jou.</em>
              </strong>
            </div>
            <div className="fold-panel fold-middle">
              <img
                  src="/images/architecture-480.webp"
                  srcSet="/images/architecture-240.webp 240w, /images/architecture-480.webp 480w, /images/architecture-640.webp 640w"
                  sizes="(max-width: 767px) 40vw, (max-width: 1000px) 18vw, 240px"
                width="640"
                height="427"
                loading="lazy"
                alt=""
              />
              <div>
                <small>WERK DAT VOOR ZICH SPREEKT</small>
                <b>
                  Van idee
                  <br />
                  naar iets echts.
                </b>
                <span>Bekijk het project ↗</span>
              </div>
            </div>
            <div className="fold-panel fold-bottom">
              <div>
                <b>Jouw plannen?</b>
                <span>Daar maken we graag ruimte voor.</span>
              </div>
              <span className="fold-contact">Laten we praten ↗</span>
            </div>
          </div>
          <div className="fold-labels">
            <span>Verhaal</span>
            <span>Vertrouwen</span>
            <span>Contact ↗</span>
          </div>
          <p className="fold-note">Schematisch webdesignvoorbeeld</p>
        </div>
      </div>
    </section>
  );
}

const routes = [
  {
    id: "nieuwe-website",
    label: "Een website die bij je past",
    title: "Goed voor de dag komen.",
    text: "Je bent goed in wat je doet. Dat mag je website ook uitstralen. Van een heldere onepager tot een compleet eigen ontwerp: we maken je aanbod begrijpelijk en je werk zichtbaar.",
    tags: ["Webdesign", "Mobiel op maat", "Redesign"],
    link: "Ontdek webdesign",
    visual: "design",
  },
  {
    id: "seo",
    label: "Meer ruimte om gevonden te worden",
    title: "In beeld bij de juiste mensen.",
    text: "Je wilt gevonden worden door mensen die zoeken naar wat jij doet. We verbinden zoekvragen met sterke dienstenpagina’s, een logische structuur en een technische basis die klopt. Met Limburg als vertrekpunt waar dat bij jouw bedrijf past.",
    tags: ["SEO", "Inhoud & structuur", "Lokale vindbaarheid"],
    link: "Bekijk wat SEO kan doen",
    visual: "search",
  },
  {
    id: "ai-automatisering",
    label: "Meer tijd voor je echte werk",
    title: "Laat het handwerk los.",
    text: "Steeds dezelfde vragen beantwoorden, gegevens overtypen of facturen voorbereiden? Met AI en slimme koppelingen maken we daar een duidelijk proces van. Jij houdt overzicht en bepaalt waar controle nodig is.",
    tags: ["AI-chatbots", "Factuurprocessen", "Slimme koppelingen"],
    link: "Verken AI-automatisering",
    visual: "ai",
  },
];
export function Possibilities() {
  return (
    <section className="possibilities section wrap">
      <div className="section-head">
        <div>
          <Eyebrow>Waar sta jij?</Eyebrow>
          <h2>
            Je volgende stap.
            <br />
            <em>Meer is mogelijk.</em>
          </h2>
        </div>
        <p className="head-aside">
          Een goede website is het begin. Maak jezelf beter vindbaar of geef
          tijdrovend werk uit handen.
        </p>
      </div>
      <div className="route-chapters">
        {routes.map((r, i) => (
          <article
            className={`route-chapter route-${r.visual}`}
            key={r.id}
            data-scroll-scene
          >
            <div className="route-art" aria-hidden="true">
              <div className="route-fill" />
              <span className="route-number">0{i + 1}</span>
              {r.visual === "design" ? (
                <div className="route-window">
                  <div>
                    <i />
                    <i />
                    <i />
                  </div>
                  <b>
                    Jouw verhaal.
                    <br />
                    <em>Jouw gezicht.</em>
                  </b>
                  <div className="route-window-bottom">
                    <span />
                    <strong>Ontdek meer ↗</strong>
                  </div>
                </div>
              ) : r.visual === "search" ? (
                <div className="search-demo">
                  <span>⌕ &nbsp; wat jouw klant zoekt</span>
                  <div>
                    <small>JOUW BEDRIJF</small>
                    <b>Precies wat je zoekt.</b>
                    <p>Een duidelijk antwoord op een echte vraag.</p>
                  </div>
                  <div className="search-lines">
                    <i />
                    <i />
                  </div>
                </div>
              ) : (
                <div className="automation-demo">
                  <span>Aanvraag ontvangen ↗</span>
                  <i>↓</i>
                  <span>Gegevens op de juiste plek</span>
                  <i>↓</i>
                  <strong>
                    Factuurconcept klaar <b>✓</b>
                  </strong>
                  <small>Jij controleert en verstuurt.</small>
                </div>
              )}
            </div>
            <div className="route-copy">
              <Eyebrow>{r.label}</Eyebrow>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
              <ul>
                {r.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <a className="text-link" href={`/diensten/${r.id === "nieuwe-website" ? "webdesign" : r.id}`}>
                {r.link}
                <Arrow />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function VisitorShape() {
  return (
    <div className="visitor-shape" data-scroll-scene>
      <div className="visitor-fill" aria-hidden="true" />
      <span>Een bezoeker wil weten:</span>
      <p>
        Is dit voor mij?
        <br />
        Kan ik je vertrouwen?
        <br />
        <em>Wat doe ik nu?</em>
      </p>
      <small>
        Een goed verhaal geeft antwoord.
        <br />
        Een goed ontwerp wijst de weg.
      </small>
      <span className="visitor-arrow" aria-hidden="true">
        ↗
      </span>
    </div>
  );
}
