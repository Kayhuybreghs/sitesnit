"use client";
import { useRef, useState } from "react";
import {
  emptyDesign,
  designPlan,
  designStyles,
  designPalettes,
  type DesignInput,
} from "../../../lib/tool-plans";
import {
  ToolLead,
  ToolActions,
  ToolContact,
  ToolHelp,
  useToolDraft,
} from "../tool-components";
import DesignPreview from "./design-preview";
type Draft = { input: DesignInput; step: number; done: boolean };
const initial: Draft = { input: emptyDesign, step: 0, done: false };
function valid(data: unknown): data is Draft {
  if (!data || typeof data !== "object") return false;
  const d = data as Draft,
    i = d.input;
  return (
    typeof d.done === "boolean" &&
    Number.isInteger(d.step) &&
    d.step >= 0 &&
    d.step < 6 &&
    !!i &&
    [
      "name",
      "activity",
      "audience",
      "services",
      "headline",
      "intro",
      "cta",
    ].every(
      (key) =>
        typeof i[key as keyof DesignInput] === "string" &&
        i[key as keyof DesignInput].length <= 1200,
    ) &&
    ["contact", "booking", "shop", "work"].includes(i.goal) &&
    Object.hasOwn(designStyles, i.style) &&
    Object.hasOwn(designPalettes, i.palette) &&
    ["one", "five", "more", "unknown"].includes(i.pages)
  );
}
const goals = [
  [
    "contact",
    "Meer aanvragen",
    "Een duidelijk verhaal met een uitnodiging om contact op te nemen.",
  ],
  [
    "booking",
    "Afspraken bespreken",
    "Het aanbod en de stap naar een afspraak staan centraal.",
  ],
  [
    "shop",
    "Mijn aanbod laten zien",
    "Producten of collecties een duidelijke plek geven.",
  ],
  [
    "work",
    "Mijn werk laten spreken",
    "Projecten en voorbeelden krijgen de hoofdrol.",
  ],
] as const;
const pageOptions = [
  [
    "one",
    "Eén overzichtelijke pagina",
    "Een compact verhaal, met onderdelen op dezelfde pagina.",
  ],
  [
    "five",
    "Een website met vijf pagina’s",
    "Ruimte voor aanbod, werk, een persoonlijk verhaal en contact.",
  ],
  [
    "more",
    "Meer ruimte nodig",
    "Gebruik dit voorbeeld als start voor een uitgebreidere site.",
  ],
  [
    "unknown",
    "Dat weet ik nog niet",
    "Verken eerst de richting; de precieze omvang volgt later.",
  ],
] as const;
const titles = [
  "Vertel iets over je bedrijf.",
  "Wat wil je laten zien?",
  "Wat moet je website opleveren?",
  "Welke uitstraling past bij je?",
  "Geef je idee kleur.",
  "Hoeveel ruimte heeft je verhaal nodig?",
];
export default function WebsiteDesigner() {
  const [draft, setDraft, ready] = useToolDraft(
    "sitesnit-designer-v1",
    initial,
    valid,
  );
  const [error, setError] = useState(""),
    [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const resultRef = useRef<HTMLElement>(null),
    questionRef = useRef<HTMLHeadingElement>(null);
  const { input, step, done } = draft,
    plan = designPlan(input);
  // Mount the result on first use; preserve its navigation when editing answers.
  const [hasShownResult, setHasShownResult] = useState(false);
  const renderResult = done || hasShownResult;
  const change = (update: Partial<DesignInput>) =>
    setDraft({ ...draft, input: { ...input, ...update } });
  function focusQuestion() {
    questionRef.current
      ?.closest("form")
      ?.scrollIntoView({ block: "start", behavior: "instant" });
    questionRef.current?.focus({ preventScroll: true });
  }
  function next(e: React.FormEvent) {
    e.preventDefault();
    if (step === 0 && !input.activity.trim()) {
      setError(
        "Vertel kort wat je bedrijf doet, zodat je voorbeeld bij je past.",
      );
      document.getElementById("design-activity")?.focus();
      return;
    }
    setError("");
    if (step === 5) {
      setHasShownResult(true);
      setDraft({ ...draft, done: true });
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({
          block: "start",
          behavior: "instant",
        });
        resultRef.current?.focus({ preventScroll: true });
      });
    } else {
      setDraft({ ...draft, step: step + 1 });
      requestAnimationFrame(focusQuestion);
    }
  }
  const summary = `JOUW WEBSITEPLAN — SITESNIT\n\nBedrijf: ${plan.name}\nActiviteit: ${input.activity || "Nog invullen"}\nVoor wie: ${input.audience || "Nog afstemmen"}\nAanbod: ${plan.services.join(", ")}\nDoel: ${goals.find((g) => g[0] === input.goal)?.[1]}\nStijl: ${designStyles[input.style]}\nKleuren: ${designPalettes[input.palette].name}\nOmvang: ${pageOptions.find((p) => p[0] === input.pages)?.[1]}\n\nOPENING VAN JE VOORBEELD\n${plan.headline}\n${plan.intro}\nKnop: ${plan.action}\n\n${input.pages === "one" ? "ONDERDELEN OP ÉÉN PAGINA" : "VOORGESTELDE PAGINA’S"}\n${plan.pages.map((p) => `• ${p}`).join("\n")}\n\nINHOUD OM TE VERZAMELEN\n${plan.content.map((p) => `• ${p}`).join("\n")}\n\nNOG AF TE STEMMEN\n${plan.pending.map((p) => `• ${p}`).join("\n")}\n\nDit is een bewerkbaar ontwerpvoorbeeld op basis van je keuzes. Geen complete website, offerte of technische beoordeling. Voorbeelden van projecten en formulieren zijn als zodanig gelabeld.`;
  return (
    <div className="tool-workbench designer-workbench">
      <ToolLead
        eyebrow="Zes keuzes / Een eerste richting"
        title="Ontwerp je website."
        accent="Maak je idee bespreekbaar."
      >
        Kies je inhoud, uitstraling en kleuren. Bekijk je eigen websitevoorbeeld
        en pas het aan. Tevreden met de richting? Bespreek met Sitesnit hoe we
        er jouw website van maken.
      </ToolLead>
      <div className="wrap">
        <div className="designer-question-layout" hidden={done}>
          <form className="tool-form designer-form" onSubmit={next} noValidate>
            <div className="designer-progress">
              <span>Vraag {step + 1} van 6</span>
              <span>
                {
                  [
                    "Je bedrijf",
                    "Je aanbod",
                    "Je doel",
                    "Je stijl",
                    "Je kleuren",
                    "Je omvang",
                  ][step]
                }
              </span>
              <div
                role="progressbar"
                aria-label="Voortgang ontwerpvragen"
                aria-valuemin={0}
                aria-valuemax={6}
                aria-valuenow={step + 1}
              >
                <i style={{ width: `${((step + 1) / 6) * 100}%` }} />
              </div>
            </div>
            <h2 ref={questionRef} tabIndex={-1}>
              {titles[step]}
            </h2>
            <div className="designer-question-body" key={step}>
              {step === 0 && (
                <>
                  <div className="field">
                    <label htmlFor="design-name">
                      Hoe heet je bedrijf? <small>Optioneel</small>
                    </label>
                    <input
                      id="design-name"
                      maxLength={70}
                      value={input.name}
                      onChange={(e) => change({ name: e.target.value })}
                      placeholder="Jouw bedrijfsnaam"
                      autoComplete="organization"
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="design-activity">Wat bied je aan?</label>
                    <input
                      id="design-activity"
                      maxLength={100}
                      value={input.activity}
                      onChange={(e) => {
                        change({ activity: e.target.value });
                        setError("");
                      }}
                      placeholder="Bijvoorbeeld interieuradvies of tuinontwerp"
                      required
                      aria-invalid={!!error}
                      aria-describedby={error ? "designer-error" : undefined}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="design-audience">
                      Voor wie werk je? <small>Optioneel</small>
                    </label>
                    <input
                      id="design-audience"
                      maxLength={100}
                      value={input.audience}
                      onChange={(e) => change({ audience: e.target.value })}
                      placeholder="Bijvoorbeeld ondernemers in Limburg"
                    />
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <p>
                    Geef je belangrijkste diensten of productgroepen een naam.
                    We gebruiken ze meteen in je voorbeeld.
                  </p>
                  <div className="field">
                    <label htmlFor="design-services">
                      Je aanbod <small>Optioneel · maximaal 6 onderdelen</small>
                    </label>
                    <textarea
                      id="design-services"
                      rows={6}
                      value={input.services}
                      maxLength={600}
                      onChange={(e) => change({ services: e.target.value })}
                      placeholder={
                        "Bijvoorbeeld:\nInterieuradvies\nLichtplan\nComplete inrichting"
                      }
                    />
                    <small>
                      Één per regel, of gescheiden door komma’s. Leeg laten kan;
                      je ziet dan herkenbare voorbeeldnamen.
                    </small>
                  </div>
                </>
              )}
              {step === 2 && (
                <fieldset className="design-choice-list">
                  <legend className="sr-only">Het doel van je website</legend>
                  {goals.map(([key, label, detail]) => (
                    <label
                      className={input.goal === key ? "selected" : ""}
                      key={key}
                    >
                      <input
                        type="radio"
                        name="design-goal"
                        value={key}
                        checked={input.goal === key}
                        onChange={() => change({ goal: key })}
                      />
                      <span>
                        <strong>{label}</strong>
                        <small>{detail}</small>
                      </span>
                      <b aria-hidden="true">↗</b>
                    </label>
                  ))}
                </fieldset>
              )}
              {step === 3 && (
                <fieldset className="design-style-options">
                  <legend className="sr-only">Je ontwerpstijl</legend>
                  {Object.entries(designStyles).map(([key, name]) => (
                    <label
                      className={`${input.style === key ? "selected" : ""} style-option-${key}`}
                      key={key}
                    >
                      <input
                        type="radio"
                        name="design-style"
                        value={key}
                        checked={input.style === key}
                        onChange={() =>
                          change({ style: key as DesignInput["style"] })
                        }
                      />
                      <span className="style-thumbnail" aria-hidden="true">
                        <b>Aa.</b>
                        <i />
                        <em />
                        <small>Een eigen gezicht.</small>
                      </span>
                      <strong>{name}</strong>
                      <small>
                        {key === "bold"
                          ? "Grote letters, duidelijke vlakken en een uitgesproken compositie."
                          : key === "editorial"
                            ? "Verfijnde letters, rustige lijnen en ruimte voor het verhaal."
                            : "Ronde vormen, zachte vlakken en een uitnodigende indeling."}
                      </small>
                    </label>
                  ))}
                </fieldset>
              )}
              {step === 4 && (
                <>
                  <p>
                    Vier richtingen met leesbare combinaties. Je kunt na het
                    bekijken eenvoudig wisselen.
                  </p>
                  <fieldset className="design-palette-options">
                    <legend className="sr-only">Kies een kleurenpalet</legend>
                    {Object.entries(designPalettes).map(([key, c]) => (
                      <label
                        className={input.palette === key ? "selected" : ""}
                        key={key}
                      >
                        <input
                          type="radio"
                          name="design-palette"
                          value={key}
                          checked={input.palette === key}
                          onChange={() =>
                            change({ palette: key as DesignInput["palette"] })
                          }
                        />
                        <span className="palette-swatch" aria-hidden="true">
                          <i style={{ background: c.accent }} />
                          <i style={{ background: c.paper }} />
                          <i style={{ background: c.soft }} />
                        </span>
                        <strong>{c.name}</strong>
                      </label>
                    ))}
                  </fieldset>
                </>
              )}
              {step === 5 && (
                <fieldset className="design-choice-list">
                  <legend className="sr-only">De omvang van je website</legend>
                  {pageOptions.map(([key, label, detail]) => (
                    <label
                      className={input.pages === key ? "selected" : ""}
                      key={key}
                    >
                      <input
                        type="radio"
                        name="design-pages"
                        value={key}
                        checked={input.pages === key}
                        onChange={() => change({ pages: key })}
                      />
                      <span>
                        <strong>{label}</strong>
                        <small>{detail}</small>
                      </span>
                      <b aria-hidden="true">↗</b>
                    </label>
                  ))}
                </fieldset>
              )}
            </div>
            {error && (
              <p id="designer-error" className="error-box" role="alert">
                {error}
              </p>
            )}
            <div className="designer-step-actions">
              <button
                className="text-link"
                type="button"
                disabled={step === 0}
                onClick={() => {
                  setError("");
                  setDraft({ ...draft, step: step - 1 });
                  requestAnimationFrame(focusQuestion);
                }}
              >
                ← Vorige
              </button>
              <button className="button" type="submit" disabled={!ready}>
                {step === 5 ? "Bekijk mijn voorbeeld" : "Volgende"} ↗
              </button>
            </div>
            <a href="#ontwerp-bespreken" className="tool-direct-contact">
              Liever samen kiezen? Bespreek je idee.
            </a>
          </form>
          <aside className="designer-side-note">
            <span className="eyebrow">Van jouw antwoorden naar een website</span>
            <div className="designer-note-art" aria-hidden="true">
              <span>Aa</span>
              <i />
              <b>
                {input.name.trim() || 'Jouw bedrijf.'}
              </b>
            </div>
            <h3>Dit krijg je zo te zien.</h3>
            <p>
              Een eerste indeling met je eigen aanbod. Probeer drie stijlen,
              wissel kleuren en bekijk welke opening bij je past.
            </p>
            <p>
              Je resultaat is vrij te bekijken. Daarna kun je je keuzes en
              ontwerpteksten meesturen om de echte website te bespreken.
            </p>
          </aside>
        </div>
        <section
          hidden={!done}
          ref={resultRef}
          tabIndex={-1}
          className="designer-result"
          id="jouw-ontwerp"
        >
          {renderResult && <>
          <div className="designer-result-heading">
            <div>
              <span className="eyebrow">Je eerste richting</span>
              <h2>Jouw eerste websiteontwerp.</h2>
              <p>
                Dit is de richting voor {plan.name}. Probeer de navigatie,
                wissel van stijl of pas je teksten aan. Het is een vertrekpunt
                voor de website die we samen uitwerken.
              </p>
            </div>
          </div>
          <nav className="designer-result-actions" aria-label="Verder met Sitesnit">
            <a className="designer-site-link" href="/tools" aria-label="Terug naar de tools van Sitesnit">sitesnit<span>← Alle tools</span></a>
            <button
              className="text-link"
              type="button"
              onClick={() => {
                // A restored completed draft may not have set this local flag yet.
                setHasShownResult(true);
                setDraft({ ...draft, done: false, step: 0 });
                requestAnimationFrame(focusQuestion);
              }}
            >
              ← Keuzes aanpassen
            </button>
            <a className="button" href="#ontwerp-bespreken">Bespreek ontwerp ↗</a>
          </nav>
          <div className="designer-controls">
            <div className="field">
              <label htmlFor="result-style">Uitstraling</label>
              <select
                id="result-style"
                value={input.style}
                onChange={(e) =>
                  change({ style: e.target.value as DesignInput["style"] })
                }
              >
                {Object.entries(designStyles).map(([key, name]) => (
                  <option key={key} value={key}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="result-palette">Kleur</label>
              <select
                id="result-palette"
                value={input.palette}
                onChange={(e) =>
                  change({ palette: e.target.value as DesignInput["palette"] })
                }
              >
                {Object.entries(designPalettes).map(([key, c]) => (
                  <option key={key} value={key}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div
              className="device-switch"
              role="group"
              aria-label="Formaat van het ontwerpvoorbeeld"
            >
              <button
                type="button"
                aria-pressed={device === "desktop"}
                onClick={() => setDevice("desktop")}
              >
                Desktop
              </button>
              <button
                type="button"
                aria-pressed={device === "mobile"}
                onClick={() => setDevice("mobile")}
              >
                Mobiel
              </button>
            </div>
          </div>
          <div className="designer-preview-stage">
            <DesignPreview input={input} device={device} />
          </div>
          <p className="preview-caption">
            Interactief ontwerpvoorbeeld · op een klein scherm past ook de
            desktopweergave zich aan. Dit voorbeeld heeft nog geen echt
            contactformulier, boekingen of betaalfunctie.
          </p>
          <details className="designer-copy-editor">
            <summary>
              Maak de opening nog meer van jou <span>Teksten aanpassen +</span>
            </summary>
            <div>
              <div className="field">
                <label htmlFor="design-headline">Grote titel</label>
                <textarea
                  id="design-headline"
                  rows={2}
                  maxLength={180}
                  value={input.headline}
                  placeholder={plan.headline}
                  onChange={(e) => change({ headline: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="design-intro">Korte introductie</label>
                <textarea
                  id="design-intro"
                  rows={3}
                  maxLength={600}
                  value={input.intro}
                  placeholder={plan.intro}
                  onChange={(e) => change({ intro: e.target.value })}
                />
              </div>
              <div className="field">
                <label htmlFor="design-cta">Tekst op de hoofdknop</label>
                <input
                  id="design-cta"
                  maxLength={60}
                  value={input.cta}
                  placeholder={plan.action}
                  onChange={(e) => change({ cta: e.target.value })}
                />
              </div>
              <p>
                Laat een veld leeg om de voorgestelde tekst weer te gebruiken.
                Jouw eigen teksten blijven staan wanneer je de stijl of kleur
                wijzigt.
              </p>
            </div>
          </details>
          <div className="designer-next-step">
            <div><span className="eyebrow">Mooi begin. Nu jouw echte website.</span><h3>Wat wil je hiervan laten maken?</h3><p>We bespreken je ontwerpkeuzes, de inhoud en de functies die je nodig hebt. Jouw antwoorden staan klaar bij de aanvraag hieronder.</p></div>
            <a className="button" href="#ontwerp-bespreken">Werk dit met Sitesnit uit ↗</a>
          </div>
          <details className="designer-brief print-summary">
            <summary><span>Bekijk je websiteplan <small>Je keuzes, teksten en open punten</small></span><span aria-hidden="true">+</span></summary>
            <div className="designer-brief-content">
            <span className="eyebrow">Van voorbeeld naar websiteplan</span>
            <h2>Je richting, op één plek.</h2>
            <div className="brief-choices">
              <p>
                <b>{plan.name}</b>
                <span>{input.activity}</span>
              </p>
              <p>
                <b>{designStyles[input.style]}</b>
                <span>{designPalettes[input.palette].name}</span>
              </p>
              <p>
                <b>{pageOptions.find((p) => p[0] === input.pages)?.[1]}</b>
                <span>{goals.find((g) => g[0] === input.goal)?.[1]}</span>
              </p>
            </div>
            <div className="brief-own-content">
              <div>
                <h3>Jouw bedrijf & aanbod</h3>
                <p>
                  <b>Voor wie:</b> {input.audience || "Nog samen bepalen"}
                </p>
                <p>
                  <b>Aanbod:</b> {plan.services.join(" / ")}
                </p>
              </div>
              <div>
                <h3>De opening van je voorbeeld</h3>
                <p>
                  <b>{plan.headline}</b>
                </p>
                <p>{plan.intro}</p>
                <p>
                  <b>Hoofdactie:</b> {plan.action}
                </p>
              </div>
            </div>
            <div className="brief-columns">
              <div>
                <h3>
                  {input.pages === "one"
                    ? "Onderdelen op één pagina"
                    : "Voorgestelde pagina’s"}
                </h3>
                <ol>
                  {plan.pages.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ol>
                {["more", "unknown"].includes(input.pages) && (
                  <p>
                    Dit is een beginindeling. De definitieve omvang stemmen we
                    af.
                  </p>
                )}
              </div>
              <div>
                <h3>Dit heb je aan inhoud nodig</h3>
                <ul>
                  {plan.content.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Nog samen uitwerken</h3>
                <ul>
                  {plan.pending.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
            <ToolActions summary={summary} filename="mijn-websiteplan" print />
            <a className="text-link" href="/prijscheck">
              Ook weten welk pakket bij je wensen past? Doe de prijscheck ↗
            </a>
            </div>
          </details>
          </>}
        </section>
      </div>
      <ToolHelp
        title="Zelf je website ontwerpen: begin met richting"
        items={[
          [
            "Wat maak ik met deze ontwerptool?",
            "Je maakt een eerste visuele richting met je eigen bedrijf, aanbod en voorkeuren. De preview bestaat uit echte tekst en vormgeving, zodat je verschillende stijlen en schermformaten kunt verkennen.",
          ],
          [
            "Is dit al mijn definitieve website?",
            "Dit is een startpunt. Eigen beelden, specifieke functies en een volledige mobiele uitwerking stemmen we bij het bouwen af. Je kunt je keuzes en teksten meenemen in een aanvraag.",
          ],
          [
            "Kan ik mijn voorbeeld later aanpassen?",
            "Tijdens dezelfde browsersessie blijven je keuzes bewaard. Download je websiteplan om de inhoud en richting ook daarna te bewaren. Je hoeft geen contactgegevens achter te laten om je resultaat te bekijken.",
          ],
        ]}
      />
      <div className="wrap"><ToolContact
        id="ontwerp-bespreken"
        alwaysOpen
        summary={done ? summary : input.activity.trim() ? `EERSTE ONTWERPRICHTING — NOG NIET AFGEROND\nBedrijf: ${input.name || 'Nog invullen'}\nAanbod: ${input.activity}\nVoor wie: ${input.audience || 'Nog afstemmen'}\nDiensten of producten: ${input.services || 'Nog afstemmen'}\nDe bezoeker wil de richting samen bespreken; het ontwerpvoorbeeld is nog niet afgerond.` : ''}
        title={done ? 'Van dit voorbeeld naar jouw website.' : 'Liever samen je richting bepalen?'}
        text={done ? 'Vertel wat je wilt behouden, aanpassen of toevoegen. We bespreken wat er nodig is om jouw ontwerp, inhoud en functies uit te werken.' : 'Ook zonder afgerond voorbeeld kun je je idee bespreken. Een korte toelichting is genoeg om te beginnen.'}
        formTitle="Bespreek je websiteontwerp"
      /></div>
    </div>
  );
}
