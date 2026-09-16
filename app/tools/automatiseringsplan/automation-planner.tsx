"use client";
import { useRef, useState } from "react";
import {
  automationTasks,
  automationPlan,
  type AutomationInput,
} from "../../../lib/tool-plans";
import {
  ToolLead,
  ToolActions,
  ToolContact,
  ToolHelp,
  useToolDraft,
} from "../tool-components";
const initial: AutomationInput = {
  task: "invoice",
  source: "",
  destination: "",
  count: "",
  minutes: "",
  control: "unknown",
};
function valid(data: unknown): data is AutomationInput {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  return (
    typeof d.task === "string" &&
    Object.hasOwn(automationTasks, d.task) &&
    ["source", "destination", "count", "minutes"].every(
      (k) => typeof d[k] === "string" && (d[k] as string).length <= 160,
    ) &&
    ["each", "exceptions", "unknown"].includes(d.control as string)
  );
}
const format = (n: number) =>
  new Intl.NumberFormat("nl-NL", { maximumFractionDigits: 1 }).format(n);
export default function AutomationPlanner() {
  const [input, setInput] = useToolDraft(
    "sitesnit-automation-v1",
    initial,
    valid,
  );
  const [shown, setShown] = useState(false),
    [submitted, setSubmitted] = useState(false);
  const resultRef = useRef<HTMLElement>(null),
    plan = automationPlan(input);
  const change = (update: Partial<AutomationInput>) =>
    setInput({ ...input, ...update });
  const duration =
    plan.hours === null
      ? "Nog niet berekend"
      : plan.hours < 1
        ? `${format(plan.hours * 60)} minuten per maand`
        : `${format(plan.hours)} uur per maand`;
  const summary = `AUTOMATISERINGSPLAN — SITESNIT\n\nTaak: ${plan.task.name}\nBron: ${input.source || "Nog afstemmen"}\nBestemming: ${input.destination || "Nog afstemmen"}\nAantal per maand: ${input.count || "Onbekend"}\nMinuten per keer: ${input.minutes || "Onbekend"}\nHuidige tijdsbesteding: ${duration}\nGeen voorspelde besparing; dit is de huidige handmatige tijd op basis van je invoer.\n\nVOORGESTELD PROCES\n${plan.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nNOG UITWERKEN\n${plan.pending.map((s) => `• ${s}`).join("\n")}\n\nDe genoemde systemen zijn nog niet technisch onderzocht. Een deel van de oplossing kan gewone automatisering zijn; AI is alleen zinvol waar interpretatie nodig is.`;
  function showResult(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (plan.invalid) return;
    setShown(true);
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "start",
      });
      resultRef.current?.focus({ preventScroll: true });
    });
  }
  return (
    <div className="tool-workbench">
      <ToolLead
        eyebrow="Verbeteren / Automatisering"
        title="Minder overtypen."
        accent="Meer overzicht."
      >
        Kies één terugkerende taak. Je krijgt een voorstel voor het proces,
        inzicht in je huidige tijdsbesteding en de keuzes die we samen moeten
        uitwerken.
      </ToolLead>
      <div className="wrap automation-workspace">
        <form className="tool-form" onSubmit={showResult} noValidate>
          <fieldset className="task-picker">
            <legend>
              <span className="tool-step-number">01</span> Welk werk komt steeds
              terug?
            </legend>
            <div>
              {Object.entries(automationTasks).map(([key, task], i) => (
                <label
                  className={`task-option ${input.task === key ? "selected" : ""}`}
                  key={key}
                >
                  <input
                    type="radio"
                    name="automation-task"
                    value={key}
                    checked={input.task === key}
                    onChange={() =>
                      change({ task: key as AutomationInput["task"] })
                    }
                  />
                  <span className="task-symbol" aria-hidden="true">
                    {["≡", "↳", "…", "⇄"][i]}
                  </span>
                  <strong>{task.name}</strong>
                  <span>{task.intro}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="automation-fields">
            <fieldset>
              <legend>
                <span className="tool-step-number">02</span> Hoe loopt het nu?
              </legend>
              <p className="field-help">
                Noem de systemen of plekken die je gebruikt. Dat mag ook een
                mailbox of spreadsheet zijn.
              </p>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="auto-source">
                    Waar komt de informatie binnen?
                  </label>
                  <input
                    id="auto-source"
                    value={input.source}
                    maxLength={160}
                    onChange={(e) => change({ source: e.target.value })}
                    placeholder="Bijvoorbeeld je e-mail of websiteformulier"
                  />
                </div>
                <div className="field">
                  <label htmlFor="auto-destination">
                    Waar moet het terechtkomen?
                  </label>
                  <input
                    id="auto-destination"
                    value={input.destination}
                    maxLength={160}
                    onChange={(e) => change({ destination: e.target.value })}
                    placeholder="Bijvoorbeeld je boekhoudpakket of CRM"
                  />
                </div>
              </div>
            </fieldset>
            <fieldset>
              <legend>
                <span className="tool-step-number">03</span> Hoeveel tijd gaat
                erin zitten? <small>Optioneel</small>
              </legend>
              <p className="field-help">
                Een schatting is prima. We berekenen je huidige handwerk, geen
                beloofde tijdwinst.
              </p>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="auto-count">Aantal keer per maand</label>
                  <input
                    id="auto-count"
                    inputMode="decimal"
                    value={input.count}
                    maxLength={10}
                    onChange={(e) => change({ count: e.target.value })}
                    placeholder="Bijvoorbeeld 120"
                    aria-invalid={submitted && plan.invalid}
                  />
                </div>
                <div className="field">
                  <label htmlFor="auto-minutes">Minuten per keer</label>
                  <input
                    id="auto-minutes"
                    inputMode="decimal"
                    value={input.minutes}
                    maxLength={8}
                    onChange={(e) => change({ minutes: e.target.value })}
                    placeholder="Bijvoorbeeld 5"
                    aria-invalid={submitted && plan.invalid}
                  />
                </div>
              </div>
              {submitted && plan.invalid && (
                <p role="alert" className="error-box">
                  Vul een getal vanaf 0 in, bijvoorbeeld 120 en 2,5. Maximaal
                  1.000.000 keer per maand en 1.440 minuten per keer. Je kunt
                  deze velden ook leeg laten.
                </p>
              )}
            </fieldset>
            <fieldset>
              <legend>
                <span className="tool-step-number">04</span> Hoe wil je blijven
                controleren?
              </legend>
              <div className="field">
                <label htmlFor="auto-control" className="sr-only">
                  Gewenste controle
                </label>
                <select
                  id="auto-control"
                  value={input.control}
                  onChange={(e) =>
                    change({
                      control: e.target.value as AutomationInput["control"],
                    })
                  }
                >
                  <option value="unknown">
                    Samen bepalen wat verstandig is
                  </option>
                  <option value="each">
                    Iedere uitkomst eerst zelf controleren
                  </option>
                  <option value="exceptions">
                    Vooral uitzonderingen controleren
                  </option>
                </select>
              </div>
              <p className="field-help">
                Bij facturen en antwoorden spreken we af wanneer een concept
                goedkeuring nodig heeft.
              </p>
            </fieldset>
          </div>
          <button className="button" type="submit">
            Maak mijn procesplan ↗
          </button>
        </form>
        {shown && (
          <section
            className="tool-result automation-result print-summary"
            id="procesplan"
            tabIndex={-1}
            ref={resultRef}
          >
            <div className="automation-result-title">
              <div>
                <span className="eyebrow">Jouw eerste procesplan</span>
                <h2>{plan.task.name}</h2>
                <p>
                  {plan.task.intro} Dit is een vertrekpunt voor de uitvoering.
                </p>
              </div>
              <div className="time-result">
                <span>Je huidige handwerk</span>
                <strong>
                  {plan.invalid ? "Controleer je invoer" : duration}
                </strong>
                <small>
                  {plan.hours !== null
                    ? `${input.count} × ${input.minutes} minuten ÷ 60. Dit is geen besparingsprognose.`
                    : "Vul aantal en minuten in als je dit wilt berekenen."}
                </small>
              </div>
            </div>
            <ol className="process-plan">
              {plan.steps.map((step, i) => (
                <li key={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                  <p>
                    {
                      [
                        "Het moment waarop de taak begint.",
                        "Ontbrekende of onduidelijke informatie herkennen.",
                        "Een bruikbare uitkomst klaarzetten.",
                        "Afwijkingen opvangen en verantwoordelijkheid vastleggen.",
                        "De gecontroleerde uitkomst op de juiste plek zetten.",
                      ][i]
                    }
                  </p>
                </li>
              ))}
            </ol>
            <div className="automation-notes">
              <div>
                <h3>Dit moeten we nog uitwerken</h3>
                <ul>
                  {plan.pending.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>Waar helpt AI?</h3>
                <p>
                  AI kan helpen bij het begrijpen en ordenen van tekst. Gegevens
                  doorzetten of vaste regels uitvoeren kan vaak met gewone
                  automatisering. De taak bepaalt wat past.
                </p>
                <p>
                  De genoemde systemen zijn nog niet onderzocht op
                  toegangsrechten of beschikbare koppelingen.
                </p>
              </div>
            </div>
            {!plan.invalid && (
              <ToolActions
                summary={summary}
                filename="automatiseringsplan"
                print
              />
            )}
            {plan.invalid && (
              <p role="alert" className="error-box">
                Controleer eerst de ingevulde aantallen en minuten. Daarna kun
                je het plan weer bewaren of bespreken.
              </p>
            )}
          </section>
        )}
        {shown && (
          <div hidden={plan.invalid}>
            <ToolContact
              summary={summary}
              title="Maak dit proces werkbaar."
              text="Bespreek welke stap slim te automatiseren is en wat daarvoor nodig is."
            />
          </div>
        )}
      </div>
      <ToolHelp
        title="Beginnen met automatiseren"
        items={[
          [
            "Welke taak is een goed begin?",
            "Begin met iets dat vaak terugkomt, een herkenbaar begin heeft en een duidelijke uitkomst nodig heeft. Denk aan aanvragen ordenen of factuurconcepten voorbereiden.",
          ],
          [
            "Is voor iedere automatisering AI nodig?",
            "Nee. Vaste invoer en duidelijke regels zijn vaak met gewone automatisering op te lossen. AI kan nuttig zijn als informatie uit vrije tekst moet worden begrepen of samengevat.",
          ],
          [
            "Kan ik hiermee mijn besparing berekenen?",
            "De tool rekent alleen je huidige handmatige tijd uit. Werkelijke tijdwinst hangt af van kwaliteit, uitzonderingen en de controle die nodig blijft. Dat onderzoeken we bij het uitwerken.",
          ],
        ]}
      />
    </div>
  );
}
