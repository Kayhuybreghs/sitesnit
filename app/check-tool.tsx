"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Restore browser session data after server hydration; it is unavailable during the server render. */
import { useCheckTools } from "../lib/webmcp";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  websiteQuestions,
  priceQuestions,
  type Answers,
} from "../lib/questions";
import { calculatePrice } from "../lib/price";
import { websiteBrief } from "../lib/tool-plans";
import { ToolActions } from "./tools/tool-components";
import "./website-brief.css";
import { buildWebsiteAdvice } from "../lib/advice";
import type { TechnicalResult, Finding } from "../lib/lighthouse";
import { publicWebsiteUrl } from "../lib/url";
import { Eyebrow, Arrow } from "./ui";
import { euro, site } from "./site-data";
import { grossPrice, hostingSummary, minimumHostingYear, paymentSummary } from "../lib/business";
import { BusinessNotes } from "./business-notes";
import ContactForm from "./contact/contact-form";
import "./tools.css";
import "./tool-direction.css";
import "./expansion.css";
type Kind = "websitecheck" | "prijscheck";
type Stage = "intro" | "questions" | "url" | "result";
type Scan = {
  status: "idle" | "running" | "complete" | "failed";
  result: TechnicalResult | null;
  error: string;
};
const blankScan: Scan = { status: "idle", result: null, error: "" };
function track(type: string) {
  void fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  }).catch(() => {});
}
export default function CheckTool({ kind }: { kind: Kind }) {
  const isWeb = kind === "websitecheck";
  const questions = isWeb ? websiteQuestions : priceQuestions;
  const storageKey = `sitesnit-${kind}-v3`;
  const [stage, setStage] = useState<Stage>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [url, setUrl] = useState("");
  const [scan, setScan] = useState<Scan>(blankScan);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [contactMounted, setContactMounted] = useState(false);
  const title = useRef<HTMLDivElement>(null);
  const previousView = useRef<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const scanNumber = useRef(0);
  useEffect(() => {
    try {
      const data = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      if (data) {
        setAnswers(data.answers ?? {});
        setUrl(data.url ?? "");
        setStep(Math.min(14, Math.max(0, data.step ?? 0)));
        setStage(
          ["intro", "questions", "url", "result"].includes(data.stage)
            ? data.stage
            : "intro",
        );
        if (data.scan)
          setScan(
            data.scan.status === "running"
              ? {
                  status: "failed",
                  result: null,
                  error:
                    "De vorige scan is onderbroken. Je antwoorden zijn bewaard; probeer de technische analyse opnieuw.",
                }
              : data.scan,
          );
      }
    } catch {}
    setReady(true);
    return () => controller.current?.abort();
  }, [storageKey]);
  useEffect(() => {
    if (ready)
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ stage, step, answers, url, scan }),
        );
      } catch {}
  }, [ready, storageKey, stage, step, answers, url, scan]);
  useEffect(() => {
    if (!ready) return;
    const target = `/${kind}${stage === "result" ? "?resultaat=1" : ""}`;
    history.replaceState(null, "", target);
    if (stage === "result") setContactMounted(true);
    const view = `${kind}:${stage}:${step}`;
    const changed = previousView.current !== null && previousView.current !== view;
    previousView.current = view;
    if (!changed) return;
    // Move focus without moving the page; scroll only after the new question is laid out.
    title.current?.focus({ preventScroll: true });
    const frame = requestAnimationFrame(() => {
      const heading = title.current?.querySelector("legend, h1");
      if (!heading) return;
      const rect = heading.getBoundingClientRect();
      if (rect.top >= 24 && rect.bottom <= innerHeight * .72) return;
      const anchor = title.current?.closest(".question-card") ?? heading;
      window.scrollTo({
        top: Math.max(0, scrollY + anchor.getBoundingClientRect().top - 24),
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [stage, step, kind, ready]);
  const advice = useMemo(
    () => buildWebsiteAdvice(answers, scan.result),
    [answers, scan.result],
  );
  const price = useMemo(() => calculatePrice(answers), [answers]);
  const question = questions[step];
  const selected = answers[question.id];
  async function startScan(value: string) {
    controller.current?.abort();
    const current = ++scanNumber.current;
    const c = new AbortController();
    controller.current = c;
    setScan({ status: "running", result: null, error: "" });
    try {
      const response = await fetch("/api/lighthouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
        signal: c.signal,
      });
      const data = (await response.json()) as {
        result?: TechnicalResult;
        error?: string;
      };
      if (current !== scanNumber.current) return;
      if (!response.ok || !data.result)
        throw new Error(data.error ?? "De technische analyse is niet gelukt.");
      setScan({ status: "complete", result: data.result, error: "" });
    } catch (e) {
      if (current === scanNumber.current && (e as Error).name !== "AbortError")
        setScan({
          status: "failed",
          result: null,
          error: (e as Error).message,
        });
    }
  }
  function start(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStage("questions");
    track(`${kind}_start`);
  }
  function choose(value: string) {
    setError("");
    setAnswers((prev) => {
      if (!question.multiple) return { ...prev, [question.id]: value };
      const old = Array.isArray(prev[question.id])
        ? (prev[question.id] as string[])
        : [];
      if (value === "none" || value === "unknown")
        return { ...prev, [question.id]: [value] };
      const chosen = old.filter((x) => !["none", "unknown"].includes(x));
      return {
        ...prev,
        [question.id]: chosen.includes(value)
          ? chosen.filter((x) => x !== value)
          : [...chosen, value],
      };
    });
  }
  function next() {
    if (!selected || (Array.isArray(selected) && !selected.length)) {
      setError("Kies een antwoord om verder te gaan.");
      return;
    }
    if (editing || step === 14) {
      const missing = questions.findIndex((q) => {
        const a = answers[q.id];
        return (
          !a ||
          (Array.isArray(a)
            ? a.length === 0 ||
              a.some((v) => !q.options.some((o) => o.value === v))
            : !q.options.some((o) => o.value === a))
        );
      });
      if (missing !== -1) {
        setStep(missing);
        setEditing(false);
        setError("Beantwoord deze vraag om je complete resultaat te bekijken.");
        return;
      }
      setStage(isWeb && !(editing && url) ? "url" : "result");
      setEditing(false);
      if (!isWeb) track(`${kind}_complete`);
    } else setStep((n) => n + 1);
  }
  function reset() {
    controller.current?.abort();
    scanNumber.current++;
    setStage("intro");
    setStep(0);
    setAnswers({});
    setEditing(false);
    setScan(blankScan);
    setUrl("");
    setError("");
    setResetConfirm(false);
    setContactMounted(false);
    try {
      sessionStorage.removeItem(storageKey);
      sessionStorage.removeItem("sitesnit-context-v1");
    } catch {}
  }
  function edit(index: number) {
    setStep(index);
    setEditing(true);
    setStage("questions");
    setError("");
  }
  function summaryText() {
    const answerLines = questions
      .map(
        (q) =>
          `${q.title}\n${(Array.isArray(answers[q.id]) ? (answers[q.id] as string[]) : [answers[q.id]]).map((v) => q.options.find((o) => o.value === v)?.label ?? "Niet beantwoord").join(", ")}`,
      )
      .join("\n\n");
    const summary = isWeb
      ? `Websitecheck: ${url}\nTechnische analyse: ${scan.status === "complete" ? "afgerond" : "onvolledig"}\n${scan.result ? `Pagina: ${scan.result.finalUrl}\nGemeten: ${scan.result.fetchTime}\nMobiele Lighthouse-labtest\n${scan.result.categories.map((c) => `${c.title}: ${c.score ?? "niet beschikbaar"}`).join("\n")}` : ""}\n\n${advice.priorities.map((p) => `${p.title} (${p.source})\n${p.what}\nActie: ${p.action}`).join("\n\n")}\n\nAntwoorden:\n${answerLines}`
      : `Prijscheck: ${price.route}\n${price.fixed ? "Vaste bouwprijs" : price.packageId === "maatwerk" ? "Bouwprijs vanaf" : "Bevestigde bouwprijsbasis"}: ${price.basis === null ? "Nog te bepalen" : `${euro(grossPrice(price.basis))} inclusief 21% btw (${euro(price.basis)} exclusief btw)`}\n${price.reasons.join("\n")}\nNog afstemmen: ${price.pending.join("; ") || "exacte inhoud en planning"}${price.basis !== null ? `\n\nBETALING EN HOSTING\n${paymentSummary}\n${hostingSummary}\nBouw + eerste hostingjaar: minimaal ${euro(grossPrice(price.basis + minimumHostingYear))} inclusief btw (${euro(price.basis + minimumHostingYear)} exclusief btw). Aanvullende scope stemmen we apart af.` : ""}\n\nAntwoorden:\n${answerLines}`;
    if (isWeb) return summary;
    const brief=websiteBrief(answers);
    return `${summary}\n\nWEBSITEPLAN\n${brief.label}: ${brief.pages.join(" / ")}\n${brief.content.join("\n")}\n${brief.note}`;
  }
  function context() {
    const summary = summaryText();
    try {
      sessionStorage.setItem(
        "sitesnit-context-v1",
        JSON.stringify({ kind, summary }),
      );
    } catch {}
  }
  useCheckTools({
    stage,
    question,
    step,
    answers,
    setAnswer: (id, value) => setAnswers((prev) => ({ ...prev, [id]: value })),
  });
  return (
    <div className={`tool-page ${isWeb ? "website-tool" : "price-tool"}`}>
      {stage === "result" && <meta name="robots" content="noindex, follow" />}
      {stage === "intro" ? (
        <section className="wrap tool-intro">
          <div ref={title} tabIndex={-1} aria-labelledby="tool-title" className="tool-intro-copy">
            <Eyebrow>
              {isWeb ? "Websitecheck" : "Prijscheck"} / 15 gerichte vragen
            </Eyebrow>
            <h1 id="tool-title">
              {isWeb ? (
                <>
                  Een frisse blik
                  <br />
                  op <em>je website.</em>
                </>
              ) : (
                <>
                  Jouw plannen.
                  <br />
                  <em>Een passende prijs.</em>
                </>
              )}
            </h1>
            <p>
              {isWeb
                ? "Ontdek wat al goed werkt en wat aandacht verdient. Een echte mobiele Lighthouse-analyse en jouw antwoorden geven samen richting aan de volgende stap."
                : "Wat heb je nodig? En welke investering past daarbij? Beantwoord 15 vragen en ontdek de logische route voor jouw website."}
            </p>
            <ul className="tool-benefits">
              {(isWeb
                ? [
                    "Echte technische metingen van Google",
                    "15 vragen over je inhoud en klantpad",
                    "Gericht advies met de belangrijkste verbeterpunten",
                  ]
                : [
                    "Een vaste pakketprijs waar die past",
                    "Maatwerk alleen met een inhoudelijke reden",
                    "Je budget verandert de prijs niet",
                  ]
              ).map((t) => (
                <li key={t}>
                  <span>↗</span>
                  {t}
                </li>
              ))}
            </ul>
            <p className="small">
              Je resultaat is direct te bekijken. Geen e-mailadres nodig.
            </p>
            <a className="text-link" href="/contact">
              Liever samen kijken? <Arrow />
            </a>
            <details className="check-explanation">
              <summary>{isWeb ? 'Wat onderzoekt deze websitecheck?' : 'Hoe komt je prijsindicatie tot stand?'}</summary>
              {isWeb ? <>
                <p>De 15 vragen gaan over je boodschap, aanbod, vertrouwen, contactroute en mobiel gebruik. Daarna vul je de URL in van de pagina die je wilt laten meten.</p>
                <p>Google Lighthouse voert een gesimuleerde mobiele labtest uit. Je ziet de scores voor prestaties, toegankelijkheid, best practices en technische SEO, met de auditbevindingen die het advies onderbouwen. Dit zijn geen metingen van echte bezoekers en geen volledige audit van alle pagina’s.</p>
                <p>Je antwoorden veranderen de gemeten scores niet. In je resultaat staat wat uit de meting komt en wat uit je antwoorden volgt. Mislukt de meting, dan blijven je antwoorden bewaard en kun je opnieuw proberen.</p>
                <p>Je krijgt een korte conclusie en de belangrijkste verbeterpunten, met uitleg en een passende actie. Wil je hulp bij verbeteren of een redesign? Onder je resultaat kun je een belafspraak aanvragen en je uitkomst meesturen.</p>
              </> : <>
                <p>De 15 vragen brengen je pagina’s, inhoud, functies en koppelingen in kaart. De bouwprijs voor een passende onepager is {euro(grossPrice(site.packages[0].price))} inclusief btw ({euro(site.packages[0].price)} exclusief btw). Bij vijf pagina’s is dat {euro(grossPrice(site.packages[1].price))} inclusief btw ({euro(site.packages[1].price)} exclusief btw). Responsive ontwerp en een standaardcontactformulier maken je aanvraag niet automatisch maatwerk.</p>
                <p>Extra omvang of bijzondere functies kunnen een maatwerkroute vragen. De bouwprijs begint dan bij {euro(grossPrice(site.packages[2].price))} inclusief btw ({euro(site.packages[2].price)} exclusief btw). Je ziet welke wensen daarvoor de reden zijn en welke keuzes nog nodig zijn om een prijs af te spreken. Je budget verandert het tarief voor dezelfde wensen niet.</p>
                <p>{hostingSummary} {paymentSummary}</p>
                <p>Je kunt antwoorden aanpassen en je websiteplan onder het resultaat meenemen naar een belaanvraag. De uitkomst helpt je kiezen; de precieze werkzaamheden worden in een voorstel vastgelegd. <a href="/kosten">Bekijk ook direct alle websitepakketten.</a></p>
              </>}
            </details>
          </div>
          <form className="tool-start-card" onSubmit={start}>
            <span className="tool-card-no">
              {isWeb ? "01" : "02"}
              <span>/ de eerste stap</span>
            </span>
            <h2>
              {isWeb ? (
                <>
                  Eerst jouw blik.
                  <br />
                  <em>Dan de meting.</em>
                </>
              ) : (
                <>
                  Wat wil jij
                  <br />
                  <em>online neerzetten?</em>
                </>
              )}
            </h2>
            <p>
              {isWeb
                ? "Beantwoord eerst 15 vragen over je website. Daarna vul je het websiteadres in voor een echte mobiele Lighthouse-analyse. Je krijgt één overzicht met kansen voor verbetering."
                : "Een onepager, vijf pagina’s of maatwerk? We kijken naar omvang en functies. Normale websitewensen tellen niet onnodig op."}
            </p>
            <div className="tool-route-steps">
              <span>01 · Jouw antwoorden</span>
              <span>
                {isWeb ? "02 · Je website meten" : "02 · Je passende route"}
              </span>
              <span>03 · Samen verder</span>
            </div>
            {error && (
              <p className="error-box" role="alert">
                {error}
              </p>
            )}
            <button className="button" type="submit" disabled={!ready}>
              {isWeb ? "Start je websitecheck" : "Start je prijscheck"}
              <Arrow />
            </button>
            <p className="form-note">
              {isWeb
                ? "Je URL wordt gedeeld met Google; je antwoorden niet. "
                : ""}
              <a href="/privacy">Over je gegevens</a>
            </p>
          </form>
        </section>
      ) : (
        <>
          <div className="wrap tool-topbar">
            <a
              href={`/${kind}`}
              onClick={(e) => {
                e.preventDefault();
                setResetConfirm(true);
              }}
              className="tool-name"
            >
              {isWeb ? "Websitecheck" : "Prijscheck"}
            </a>
            <button
              type="button"
              className="quiet-button"
              onClick={() => setResetConfirm(true)}
            >
              Opnieuw beginnen
            </button>
          </div>
          {resetConfirm && (
            <div className="wrap reset-banner" role="alert">
              <p>
                Je antwoorden en resultaat van deze check worden verwijderd uit
                deze browser.
              </p>
              <div>
                <button className="button" onClick={reset}>
                  Begin opnieuw
                </button>
                <button
                  className="quiet-button"
                  onClick={() => setResetConfirm(false)}
                >
                  Bewaar mijn antwoorden
                </button>
              </div>
            </div>
          )}
          {stage === "url" ? (
            <section className="wrap url-step">
              <div ref={title} tabIndex={-1} aria-labelledby="tool-title">
                <Eyebrow>15 van 15 vragen beantwoord</Eyebrow>
                <h1 id="tool-title">
                  Jouw verhaal is helder.
                  <br />
                  <em>Nu je website meten.</em>
                </h1>
                <p>
                  Vul de pagina in die je wilt onderzoeken. Google meet
                  snelheid, toegankelijkheid, best practices en technische SEO
                  in een gesimuleerde mobiele labtest.
                </p>
              </div>
              <form
                className="url-step-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  setError("");
                  try {
                    const normalized = publicWebsiteUrl(url);
                    setUrl(normalized);
                    void startScan(normalized);
                    setStage("result");
                    track(`${kind}_complete`);
                  } catch (e) {
                    setError((e as Error).message);
                  }
                }}
              >
                <div className="field">
                  <label htmlFor="scan-url">Je websiteadres</label>
                  <input
                    id="scan-url"
                    disabled={!ready}
                    inputMode="url"
                    autoComplete="url"
                    placeholder="jouwbedrijf.nl"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    maxLength={2000}
                  />
                </div>
                <p className="small">
                  Alleen de URL gaat naar Google. Je antwoorden blijven bewaard.
                  De scan kan ongeveer een minuut duren; je inhoudelijke
                  uitkomst is meteen beschikbaar.
                </p>
                {error && (
                  <p className="error-box" role="alert">
                    {error}
                  </p>
                )}
                <button className="button" type="submit">
                  Meet mijn website <Arrow />
                </button>
                <button
                  className="quiet-button"
                  type="button"
                  onClick={() => {
                    setStage("questions");
                    setStep(14);
                    setError("");
                  }}
                >
                  ← Terug naar mijn antwoorden
                </button>
              </form>
            </section>
          ) : stage === "questions" ? (
            <section className="wrap question-layout">
              <aside className="question-sidebar">
                <Eyebrow>
                  {isWeb ? "Een frisse blik" : "Jouw websiteplannen"}
                </Eyebrow>
                <h2>
                  {isWeb ? (
                    <>
                      Laten we kijken
                      <br />
                      wat <em>beter kan.</em>
                    </>
                  ) : (
                    <>
                      Stap voor stap
                      <br />
                      <em>meer duidelijkheid.</em>
                    </>
                  )}
                </h2>
                <p>
                  {isWeb
                    ? "Jij kent je bedrijf. Met je antwoorden geven we de technische meting de juiste context."
                    : "Je hoeft nog niet alles te weten. Onzekere keuzes benoemen we, zonder ze duurder te maken."}
                </p>
                {isWeb && scan.status !== "idle" && (
                  <ScanStatus scan={scan} retry={() => void startScan(url)} />
                )}
                <a className="text-link" href="/contact">
                  Liever meteen bespreken? <Arrow />
                </a>
              </aside>
              <div className="question-card">
                <div className="question-progress">
                  <span>Vraag {step + 1} van 15</span>
                  <span>
                    {question.multiple ? "Meerdere antwoorden" : "Eén antwoord"}
                  </span>
                </div>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-label="Voortgang vragen"
                  aria-valuemin={0}
                  aria-valuemax={15}
                  aria-valuenow={step}
                >
                  <span style={{ width: `${(step / 15) * 100}%` }} />
                </div>
                <div key={question.id} ref={title} tabIndex={-1} className="question-focus" aria-labelledby="tool-title">
                  <fieldset className="question-fieldset">
                    <legend id="tool-title">{question.title}</legend>
                    {question.help && (
                      <p className="question-help">{question.help}</p>
                    )}
                    <div className="answer-options">
                      {question.options.map((option) => {
                        const checked = Array.isArray(selected)
                          ? selected.includes(option.value)
                          : selected === option.value;
                        return (
                          <label
                            key={option.value}
                            className={`answer-option ${checked ? "selected" : ""}`}
                          >
                            <input
                              type={question.multiple ? "checkbox" : "radio"}
                              name={question.id}
                              checked={checked}
                              onChange={() => choose(option.value)}
                              value={option.value}
                            />
                            <span
                              className={
                                question.multiple
                                  ? "answer-box"
                                  : "answer-radio"
                              }
                              aria-hidden="true"
                            >
                              {checked && question.multiple ? "✓" : ""}
                            </span>
                            <span>
                              {option.label}
                              {option.detail && <small>{option.detail}</small>}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                </div>
                {error && (
                  <p className="question-error" role="alert">
                    {error}
                  </p>
                )}
                <div className="question-controls">
                  <button
                    className="quiet-button"
                    onClick={() => {
                      setError("");
                      if (step > 0) setStep((n) => n - 1);
                      else setStage("intro");
                    }}
                  >
                    ← Vorige
                  </button>
                  <button className="button" onClick={next}>
                    {editing
                      ? "Werk resultaat bij"
                      : step === 14
                        ? isWeb
                          ? "Naar de technische scan"
                          : "Bekijk je resultaat"
                        : "Volgende"}
                    <Arrow />
                  </button>
                </div>
                <a href="/contact" className="question-contact">
                  Liever samen kijken? Bespreek je plannen
                </a>
              </div>
            </section>
          ) : (
            <section className="wrap result-layout">
              <div className="result-heading" ref={title} tabIndex={-1} aria-labelledby="tool-title">
                <Eyebrow>
                  Jouw {isWeb ? "websitecheck" : "prijsindicatie"}
                </Eyebrow>
                <h1 id="tool-title">
                  {isWeb ? (
                    <>
                      Een helder beeld.
                      <br />
                      <em>Een gerichte volgende stap.</em>
                    </>
                  ) : (
                    <>
                      {price.fixed
                        ? price.packageId === "onepager"
                          ? "Jouw onepager."
                          : "Jouw website."
                        : price.route}
                      <br />
                      <em>
                        {price.basis === null
                          ? "Eerst samen beoordelen."
                          : price.fixed
                            ? euro(price.basis).replace(',00', '')
                            : price.packageId === "maatwerk"
                              ? `Vanaf ${euro(price.basis).replace(',00', '')}`
                              : `${euro(price.basis).replace(',00', '')} als basis`}
                      </em>
                    </>
                  )}
                </h1>
                {!isWeb&&price.basis!==null&&<p className="price-tax-note">Bouwprijs exclusief btw · {price.packageId==='maatwerk'?'vanaf ':''}{euro(grossPrice(price.basis))} inclusief 21% btw. Hosting komt daar apart bij.</p>}
                <p>{isWeb ? advice.conclusion : price.summary}</p>
                <div className="actions">
                  <a href="#bespreek-uitkomst" className="button">
                    Bespreek je mogelijkheden <Arrow />
                  </a>
                  <a href="#antwoorden" className="text-link">
                    Antwoorden aanpassen <Arrow />
                  </a>
                </div>
                <p className="small">
                  Onderaan staat je aanvraag klaar, met je antwoorden en
                  uitkomst erbij.
                </p>
              </div>
              {isWeb ? (
                <>
                  <div className="result-status-row">
                    <span>
                      {advice.assessed} van 15 onderdelen inhoudelijk beoordeeld
                    </span>
                    <span>{advice.unknown} antwoorden nog onbekend</span>
                  </div>
                  <ScanStatus
                    scan={scan}
                    retry={() => void startScan(url)}
                    expanded
                  />
                  <button
                    className="quiet-button"
                    onClick={() => {
                      setStage("url");
                      setError("");
                    }}
                  >
                    Ander websiteadres meten
                  </button>
                  {advice.priorities.length > 0 && (
                    <div className="advice-section">
                      <Eyebrow>Hier begin je</Eyebrow>
                      <h2>
                        De belangrijkste
                        <br />
                        <em>verbeterpunten.</em>
                      </h2>
                      <div className="advice-list">
                        {advice.priorities.map((f, i) => (
                          <FindingCard
                            key={f.source + f.id}
                            finding={f}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="positive-section">
                    <h2>Dit is een goed vertrekpunt.</h2>
                    {advice.good.length ? (
                      <>
                        <p>
                          Op basis van je antwoorden lijken deze punten op orde:
                        </p>
                        <ul>
                          {advice.good.slice(0, 4).map((g) => (
                            <li key={g}>{g}</li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <p>
                        Je antwoorden geven nog geen duidelijk bevestigde sterke
                        punten. Onbekende antwoorden tellen niet als een
                        tekortkoming.
                      </p>
                    )}
                    {scan.result?.passed.length ? (
                      <details>
                        <summary>
                          Geslaagde technische controles bekijken
                        </summary>
                        <ul>
                          {scan.result.passed.slice(0, 8).map((g) => (
                            <li key={g}>{g}</li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                  {scan.result && <TechnicalDetails result={scan.result} />}
                </>
              ) : (
                <>
                  <div className="price-result-card">
                    <div>
                      <span className="eyebrow">
                        {price.basis === null
                          ? "Bestaande website"
                          : price.fixed
                            ? "Vaste bouwprijs"
                            : price.packageId === "maatwerk"
                              ? "Maatwerk vanaf"
                              : "Bevestigde prijsbasis"}
                      </span>
                      <strong>
                        {price.basis === null
                          ? "Nog te bepalen"
                          : `${price.packageId === "maatwerk" ? "Vanaf " : ""}${euro(price.basis).replace(',00', '')}`}
                      </strong>
                      {price.basis!==null&&<p className="price-tax-note">Exclusief btw · {price.packageId==='maatwerk'?'vanaf ':''}{euro(grossPrice(price.basis))} inclusief 21% btw.</p>}
                      <p>
                        {price.fixed
                          ? "Voor de bouw van de passende standaardwebsite die uit je antwoorden volgt. Hosting staat hieronder apart."
                          : "Nog geen totaalprijs. De ontbrekende keuzes hieronder bepalen de uiteindelijke investering."}
                      </p>
                    </div>
                    <div>
                      <h2>Waarom deze route?</h2>
                      <ul>
                        {price.reasons.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {price.basis!==null&&<BusinessNotes websitePrice={price.basis}/>}
                  {price.packageId === "maatwerk" && (
                    <p className="custom-average">
                      <strong>
                        Grotere maatwerkprojecten komen gemiddeld rond{" "}
                        {euro(grossPrice(site.averageProjectCost))} inclusief btw uit ({euro(site.averageProjectCost)} exclusief btw).
                      </strong>{" "}
                      Dat is context, geen persoonlijke totaalprijs of
                      bovengrens. De omvang en functies van jouw project bepalen
                      het voorstel.
                    </p>
                  )}
                  {price.pending.length > 0 && (
                    <div className="pending-section">
                      <h2>Dit stemmen we nog af.</h2>
                      <ul>
                        {price.pending.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                      <p>
                        Aanvullend werk stemmen we eerst af. Met deze open
                        keuzes is een betrouwbare totaalprijs nog niet mogelijk.
                        Je budgetantwoord heeft deze prijsbasis niet veranderd.
                      </p>
                    </div>
                  )}
                </>
              )}
              {!isWeb&&<section className="price-website-brief" aria-labelledby="brief-title"><Eyebrow>Je wensen, vertaald naar inhoud</Eyebrow><h2 id="brief-title">Je eerste websiteplan.</h2><div><div><h3>{websiteBrief(answers).label}</h3><ol>{websiteBrief(answers).pages.map(p=><li key={p}>{p}</li>)}</ol><p>{websiteBrief(answers).note}</p></div><div><h3>Dit verzamelen we voor je website</h3><ul>{websiteBrief(answers).content.map(p=><li key={p}>{p}</li>)}</ul></div></div><ToolActions summary={summaryText()} filename="prijscheck-en-websiteplan"/><a className="text-link" href="/tools/ontwerp-je-website">Alvast een visuele richting proberen <Arrow/></a></section>}
              <details className="answers-review" id="antwoorden">
                <summary>
                  Bekijk en wijzig je 15 antwoorden <span>+</span>
                </summary>
                <ol>
                  {questions.map((q, i) => (
                    <li key={q.id}>
                      <div>
                        <span>
                          {i + 1}. {q.title}
                        </span>
                        <p>
                          {(Array.isArray(answers[q.id])
                            ? (answers[q.id] as string[])
                            : [answers[q.id]]
                          )
                            .map(
                              (v) =>
                                q.options.find((o) => o.value === v)?.label ??
                                "Nog niet beantwoord",
                            )
                            .join(", ")}
                        </p>
                      </div>
                      <button
                        className="quiet-button"
                        onClick={() => edit(i)}
                        aria-label={`Wijzig antwoord ${i + 1}`}
                      >
                        Wijzig
                      </button>
                    </li>
                  ))}
                </ol>
              </details>
            </section>
          )}
        </>
      )}
      {contactMounted && (
        <section
          id="bespreek-uitkomst"
          className="wrap tool-contact"
          hidden={stage !== "result"}
        >
          <div className="tool-contact-copy">
            <Eyebrow>Van inzicht naar een plan</Eyebrow>
            <h2>
              {isWeb ? (
                <>
                  Wat kan jouw
                  <br />
                  <em>website worden?</em>
                </>
              ) : (
                <>
                  Jouw plannen.
                  <br />
                  <em>Laten we ze bespreken.</em>
                </>
              )}
            </h2>
            <p>
              {isWeb
                ? "Je weet nu waar kansen liggen. Samen bekijken we wat een gerichte verbetering kan oplossen en wanneer een redesign meer ruimte geeft. Je antwoorden en technische bevindingen vormen het vertrekpunt."
                : "Je wensen en passende route liggen klaar. In een belafspraak maken we de open keuzes concreet en bespreken we wat er nodig is om jouw website te bouwen."}
            </p>
            {isWeb && advice.priorities.length > 0 && (
              <div className="conversation-topics">
                <strong>Dit kunnen we samen uitwerken:</strong>
                <ul>
                  {advice.priorities.map((p) => (
                    <li key={p.source + p.id}>{p.action}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="small">
              Je kiest zelf of je alle 15 antwoorden en deze uitkomst meestuurt.
              Je kunt de samenvatting in het formulier eerst bekijken.
            </p>
            {site.email && <a
              className="text-link"
              href={`mailto:${site.email}?subject=${encodeURIComponent(isWeb ? "Mijn website verbeteren of redesign bespreken" : "Mijn websiteplannen bespreken")}&body=${encodeURIComponent(summaryText())}`}
              onClick={context}
            >
              Liever via e-mail <Arrow />
            </a>}
          </div>
          <ContactForm
            embedded
            toolSummary={summaryText()}
            selectedPackage={isWeb ? "" : price.packageId}
            website={isWeb ? url : ""}
          />
        </section>
      )}
    </div>
  );
}
function ScanStatus({
  scan,
  retry,
  expanded = false,
}: {
  scan: Scan;
  retry: () => void;
  expanded?: boolean;
}) {
  return (
    <div
      className={`scan-status ${scan.status}`}
      role="status"
      aria-live="polite"
    >
      <strong>
        {scan.status === "running"
          ? "Google onderzoekt je pagina…"
          : scan.status === "complete"
            ? "Mobiele Lighthouse-analyse afgerond"
            : "Technische analyse onvolledig"}
      </strong>
      <p>
        {scan.status === "running"
          ? "Je inhoudelijke uitkomst staat hieronder al klaar. De technische scores en adviezen verschijnen hier zodra de meting klaar is."
          : scan.status === "complete"
            ? "De gemeten scores staan los van je antwoorden."
            : scan.error || "Er is nog geen technische meting beschikbaar."}
      </p>
      {scan.status === "failed" && (
        <button className="quiet-button" type="button" onClick={retry}>
          Probeer de technische scan opnieuw ↗
        </button>
      )}
      {expanded && scan.result && (
        <>
          <div className="category-scores">
            {scan.result.categories.map((c) => (
              <div key={c.id}>
                <span
                  className={`score ${c.score === null ? "unknown" : c.score >= 90 ? "good" : c.score >= 50 ? "okay" : "poor"}`}
                >
                  {c.score ?? "—"}
                </span>
                <span>{c.title}</span>
              </div>
            ))}
          </div>
          <p className="scan-metadata">
            Onderzochte pagina:{" "}
            <a
              href={scan.result.finalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {scan.result.finalUrl}
            </a>
            <br />
            Gemeten op {new Date(scan.result.fetchTime).toLocaleString("nl-NL")}
            . Lighthouse {scan.result.version}. Gesimuleerde mobiele labtest van
            deze pagina, geen volledige website-audit of meting van echte
            bezoekers.
          </p>
          {scan.result.categories.some((c) => c.score === null) && (
            <p>
              Niet alle categorieën zijn teruggekomen. Ontbrekende scores zijn
              niet beoordeeld.
            </p>
          )}
          {scan.result.warnings.length > 0 && (
            <details>
              <summary>Opmerkingen bij deze meting</summary>
              {scan.result.warnings.map((w) => (
                <p key={w}>{w}</p>
              ))}
            </details>
          )}
        </>
      )}
    </div>
  );
}
function FindingCard({
  finding: f,
  index,
}: {
  finding: Finding;
  index: number;
}) {
  return (
    <article className="finding-card">
      <div className="finding-top">
        <span>0{index + 1}</span>
        <span className="source-badge">{f.source}</span>
      </div>
      <h3>{f.title}</h3>
      <dl>
        <dt>Wat is vastgesteld</dt>
        <dd>{f.what}</dd>
        <dt>Waarom dit telt</dt>
        <dd>{f.why}</dd>
        <dt>Een concrete eerste stap</dt>
        <dd>{f.action}</dd>
      </dl>
      {f.evidence?.length ? (
        <details>
          <summary>Technische onderbouwing</summary>
          <ul>
            {f.evidence.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          <p>Audit: {f.id}</p>
        </details>
      ) : null}
    </article>
  );
}
function TechnicalDetails({ result: r }: { result: TechnicalResult }) {
  return (
    <details className="technical-details">
      <summary>
        Technische metingen en audits bekijken <span>+</span>
      </summary>
      <p>
        Deze waarden komen rechtstreeks uit Google Lighthouse. De technische
        SEO-controles zeggen niets over je positie in Google of je volledige
        vindbaarheid.
      </p>
      <div className="metric-grid">
        {r.metrics.map((m) => (
          <div key={m.id}>
            <span>{m.title}</span>
            <strong>{m.displayValue}</strong>
          </div>
        ))}
      </div>
      <div className="audit-list">
        {r.audits.map((a) => (
          <details key={a.id}>
            <summary>
              {a.title}
              <span>
                {a.score === 1
                  ? "Geslaagd"
                  : a.score === null
                    ? "Niet gescoord"
                    : a.score < 0.9
                      ? "Aandachtspunt"
                      : "Gemeten"}
              </span>
            </summary>
            <p>{a.description}</p>
            {a.displayValue && <p>{a.displayValue}</p>}
            {a.evidence.map((e, i) => (
              <p key={i}>{e}</p>
            ))}
            <small>
              Audit: {a.id} · Weergave: {a.mode}
            </small>
          </details>
        ))}
      </div>
    </details>
  );
}
