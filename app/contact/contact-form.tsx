"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Read browser-only URL and session context once after hydration. */
import { useEffect, useState } from "react";
import { Arrow } from "../ui";
import { site } from "../site-data";
import "../tool-direction.css";
import "./contact-extras.css";
const careChoices = [
  {
    id: "onderhoud-hosting",
    label: "Extra websiteonderhoud",
    link: "Onderhoud & maandprijzen",
  },
  {
    id: "content",
    label: "Blogs & content laten verzorgen",
    link: "Blogaanpak & maandprijzen",
  },
  {
    id: "social-media",
    label: "Social media laten bijhouden",
    link: "Kanalen & maandprijzen",
  },
];
const monthlyPlans: Record<string, string> = {
  Hosting: "onderhoud-hosting",
  "Hosting & technisch onderhoud": "onderhoud-hosting",
  "Hosting, onderhoud & SEO": "onderhoud-hosting",
  "2 blogs per maand": "content",
  "4 blogs per maand": "content",
};
export default function ContactForm({
  toolSummary,
  selectedPackage = "",
  website = "",
  embedded = false,
  heading,
  introduction,
}: {
  toolSummary?: string;
  selectedPackage?: string;
  website?: string;
  embedded?: boolean;
  heading?: string;
  introduction?: string;
} = {}) {
  const [packageId, setPackageId] = useState(selectedPackage);
  const [websiteValue, setWebsiteValue] = useState(website);
  const [savedSummary, setSummary] = useState("");
  const summary = toolSummary ?? savedSummary;
  const [includeSummary, setIncludeSummary] = useState(true);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [id, setId] = useState("");
  const [service, setService] = useState("");
  const [projectContext, setProjectContext] = useState("");
  const [rhythm, setRhythm] = useState("");
  const [careInterests, setCareInterests] = useState<string[]>([]);
  const [monthlyPlan, setMonthlyPlan] = useState("");
  const [appointmentWanted, setAppointmentWanted] = useState(false);
  const [preferredDay, setPreferredDay] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const weekend = preferredDay === "Zaterdag" || preferredDay === "Zondag";
  useEffect(() => {
    setId(crypto.randomUUID());
    const p = new URLSearchParams(location.search);
    const serviceNames: Record<string, string> = {
      webdesign: "Webdesign & webshops",
      webshops: "Webshops",
      webapps: "Webapps & klantportalen",
      apps: "Apps voor iPhone & Android",
      branding: "Merk & identiteit",
      seo: "SEO & vindbaarheid",
      content: "Content & copywriting",
      "social-media": "Social media",
      "onderhoud-hosting": "Onderhoud & hosting",
      ai: "AI & automatisering",
      "ai-automatisering": "Tools & automatisering",
      "seo-optimalisatie": "SEO-optimalisatie",
      "formulieren-rekentools": "Formulieren & rekentools",
      "ai-koppelingen": "AI & softwarekoppelingen",
    };
    setService(serviceNames[p.get("dienst") ?? ""] ?? "");
    if (!embedded) {
      const chosenPlan = p.get("maandpakket") ?? "";
      const chosenService = p.get("dienst") ?? "";
      if (Object.hasOwn(monthlyPlans, chosenPlan)) {
        setMonthlyPlan(chosenPlan);
        setCareInterests([monthlyPlans[chosenPlan]]);
      } else if (careChoices.some((choice) => choice.id === chosenService))
        setCareInterests([chosenService]);
    }
    setProjectContext(
      p.get("project") === "beurswijzer"
        ? "Beurswijzer"
        : p.get("project") === "beurswatcher"
          ? "Beurswatcher"
          : "",
    );
    setRhythm(
      p.get("blogs") === "4"
        ? "4 blogs per maand"
        : p.get("blogs") === "2"
          ? "2 blogs per maand"
          : p.get("ritme") === "wekelijks"
            ? "Iedere week"
            : p.get("ritme") === "tweewekelijks"
              ? "Eens per twee weken"
              : "",
    );
    if (!embedded)
      setPackageId(
        site.packages.some((item) => item.id === p.get("pakket"))
          ? p.get("pakket")!
          : "",
      );
    if (p.get("bron"))
      try {
        const c = JSON.parse(
          sessionStorage.getItem("sitesnit-context-v1") ?? "null",
        );
        if (c && typeof c.summary === "string") setSummary(c.summary);
      } catch {}
  }, [embedded]);
  useEffect(() => {
    if (embedded) setPackageId(selectedPackage);
  }, [embedded, selectedPackage]);
  useEffect(() => {
    if (embedded) setWebsiteValue(website);
  }, [embedded, website]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(fd),
          message:
            (fd.get("appointment") === "yes"
              ? "Voorkeur: belafspraak.\n\n"
              : "") +
            (service ? `Interesse: ${service}\n\n` : "") +
            (projectContext ? `Voorbeeldproject: ${projectContext}\n\n` : "") +
            (rhythm ? `Gewenst contentritme: ${rhythm}\n\n` : "") +
            (careInterests.length
              ? `Ook interesse in: ${careChoices
                  .filter((choice) => careInterests.includes(choice.id))
                  .map((choice) => choice.label)
                  .join(", ")}\n\n`
              : "") +
            (monthlyPlan && careInterests.includes(monthlyPlans[monthlyPlan])
              ? `Maandpakket om te bespreken: ${monthlyPlan}\n\n`
              : "") +
            String(fd.get("message")) +
            (fd.get("phone") ? `\n\nTelefoon: ${fd.get("phone")}` : "") +
            (fd.get("appointment") === "yes" && fd.get("preferredDay")
              ? `\nVoorkeursmoment: ${fd.get("preferredDay")}${fd.get("preferredTime") ? ` om ${fd.get("preferredTime")}` : ""} (nog af te stemmen)`
              : ""),
          packageId,
          includeSummary,
          ...(includeSummary ? { toolSummary: summary } : {}),
          requestId: id,
        }),
      });
      const body = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !body.ok)
        throw new Error(body.error ?? "Je aanvraag is niet verzonden.");
      setStatus("success");
      try {
        sessionStorage.removeItem("sitesnit-context-v1");
      } catch {}
    } catch (e) {
      setError((e as Error).message);
      setStatus("idle");
    }
  }
  if (status === "success")
    return (
      <div className="success-box" role="status">
        <span className="eyebrow">Goed ontvangen</span>
        <h2>
          Dank je.
          <br />
          <em>Je verhaal ligt klaar.</em>
        </h2>
        <p>
          Je aanvraag is opgeslagen bij Sitesnit. Je opgegeven e-mailadres is
          het contactpunt voor het vervolg.
        </p>
        <p>
          Je referentie: <strong>{id.slice(0, 8)}</strong>
        </p>
        <a className="text-link" href="/projecten">
          Bekijk ondertussen het werk <Arrow />
        </a>
      </div>
    );
  return (
    <form className="contact-form" onSubmit={submit}>
      <noscript><p className="no-js-note">Dit formulier heeft JavaScript nodig.{site.email && <> Mail je vraag naar <a href={`mailto:${site.email}`}>{site.email}</a>.</>}</p></noscript>
      <h2>{heading ?? (embedded ? "Bespreek je uitkomst" : "Bespreek je plannen")}</h2>
      <p>
        {introduction ?? (embedded
          ? "Vertel wat je wilt bespreken. Wil je bellen? Kies dan hieronder optioneel een voorkeursdag. We stemmen het moment per e-mail af."
          : "Laat je gegevens en een korte toelichting achter. Dan hebben we een goed vertrekpunt voor ons gesprek.")}
      </p>
      {service && (
        <p className="service-interest">
          Je aanvraag gaat over <strong>{service}</strong>.
        </p>
      )}
      {projectContext && (
        <p className="service-interest">
          Je bekijkt een traject zoals <strong>{projectContext}</strong>.
        </p>
      )}
      {rhythm && (
        <p className="service-interest">
          Je gekozen contentritme: <strong>{rhythm.toLowerCase()}</strong>.
        </p>
      )}
      <div className="form-row">
        <div className="field">
          <label htmlFor="name">Je naam</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
        </div>
        <div className="field">
          <label htmlFor="email">Je e-mailadres</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="website">
          Bestaande website <small>(optioneel)</small>
        </label>
        <input
          id="website"
          name="website"
          inputMode="url"
          placeholder="jouwbedrijf.nl"
          value={websiteValue}
          onChange={(e) => setWebsiteValue(e.target.value)}
          maxLength={2000}
        />
      </div>
      <div className="field">
        <label htmlFor="package">
          Websitepakket <small>(als dat al duidelijk is)</small>
        </label>
        <select
          id="package"
          value={packageId}
          onChange={(e) => setPackageId(e.target.value)}
        >
          <option value="">Ik weet het nog niet</option>
          {site.packages.map((p) => (
            <option value={p.id} key={p.id}>
              {p.name} — {p.pages}
            </option>
          ))}
        </select>
      </div>
      <details className="contact-care-disclosure">
        <summary>
          <span>
            <b>Ook laten verzorgen?</b>
            <small>
              {monthlyPlan && careInterests.includes(monthlyPlans[monthlyPlan])
                ? `${monthlyPlan}${careInterests.length > 1 ? ` + ${careInterests.length - 1} extra keuze` : ""}`
                : careInterests.length
                  ? `${careInterests.length} ${careInterests.length === 1 ? "onderwerp" : "onderwerpen"} om te bespreken`
                  : "Optioneel · onderhoud, blogs of social media"}
            </small>
          </span>
          <span className="care-disclosure-icon" aria-hidden="true">
            +
          </span>
        </summary>
        <fieldset className="contact-care-choices">
          <legend className="sr-only">Extra diensten om te bespreken</legend>
          <p>
            Hosting hoort bij een nieuwe website. Extra onderhoud, blogs of social media kun je hier vrijblijvend bespreken; dit is geen bestelling.
          </p>
          {careChoices.map((choice) => (
            <div key={choice.id} className="contact-care-choice">
              <label>
                <input
                  type="checkbox"
                  name="careInterest"
                  value={choice.id}
                  checked={careInterests.includes(choice.id)}
                  onChange={(event) =>
                    setCareInterests((current) =>
                      event.target.checked
                        ? [...current, choice.id]
                        : current.filter((item) => item !== choice.id),
                    )
                  }
                />
                <span>{choice.label}</span>
              </label>
              {monthlyPlan &&
                monthlyPlans[monthlyPlan] === choice.id &&
                careInterests.includes(choice.id) && (
                  <p className="contact-monthly-selection">
                    Gekozen om te bespreken: <b>{monthlyPlan}</b>
                  </p>
                )}
              <a
                href={`/diensten/${choice.id}#maandpakketten`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {choice.link}
                <span className="sr-only"> (opent in een nieuw tabblad)</span>
                <Arrow />
              </a>
            </div>
          ))}
        </fieldset>
      </details>
      <div className="form-row">
        <div className="field">
          <label htmlFor="phone">
            Telefoonnummer <small>(optioneel)</small>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor="message">Vertel kort over je plannen</label>
        <textarea
          id="message"
          name="message"
          required
          minLength={10}
          maxLength={3000}
          placeholder={
            embedded
              ? "Wat wil je graag bespreken of verbeteren? Je overzicht staat hieronder al klaar."
              : "Wat doet je bedrijf en wat wil je bereiken?"
          }
        />
      </div>
      <label className="check-consent">
        <input
          type="checkbox"
          name="appointment"
          value="yes"
          checked={appointmentWanted}
          onChange={(event) => setAppointmentWanted(event.target.checked)}
        />
        Ik wil graag een belafspraak afstemmen (optioneel).
      </label>
      {appointmentWanted && (
        <fieldset className="contact-call-preference">
          <legend>Wanneer komt bellen uit?</legend>
          <p>
            Op werkdagen tussen 18:00 en 21:30. In het weekend kan het de hele
            dag. We bevestigen samen een moment; dit is nog geen reservering.
          </p>
          <div className="form-row">
            <div className="field">
              <label htmlFor="preferredDay">Voorkeursdag <small>(optioneel)</small></label>
              <select
                id="preferredDay"
                name="preferredDay"
                value={preferredDay}
                onChange={(event) => {
                  setPreferredDay(event.target.value);
                  setPreferredTime("");
                }}
              >
                <option value="">Samen een dag afstemmen</option>
                {[
                  "Maandag",
                  "Dinsdag",
                  "Woensdag",
                  "Donderdag",
                  "Vrijdag",
                  "Zaterdag",
                  "Zondag",
                ].map((day) => (
                  <option key={day}>{day}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="preferredTime">
                Voorkeurstijd <small>(optioneel)</small>
              </label>
              <input
                type="time"
                id="preferredTime"
                name="preferredTime"
                min={weekend ? "00:00" : "18:00"}
                max={weekend ? "23:59" : "21:30"}
                value={preferredTime}
                disabled={!preferredDay}
                onInput={(event) => setPreferredTime(event.currentTarget.value)}
                onChange={(event) => setPreferredTime(event.target.value)}
                aria-describedby="call-time-window"
              />
            </div>
          </div>
          <p id="call-time-window">
            {!preferredDay
              ? "Kies eerst een dag om een tijd door te geven."
              : weekend
                ? "Weekend: geef aan welk tijdstip jou uitkomt."
                : "Werkdag: kies een tijd tussen 18:00 en 21:30."}
          </p>
        </fieldset>
      )}
      {summary && (
        <div className="context-box">
          <details>
            <summary>Je overzicht bekijken</summary>
            <pre>{summary}</pre>
          </details>
          <label className="check-consent">
            <input
              type="checkbox"
              checked={includeSummary}
              onChange={(e) => setIncludeSummary(e.target.checked)}
            />
            Stuur mijn antwoorden en uitkomst mee met deze aanvraag.
          </label>
        </div>
      )}
      <div className="hp-field" aria-hidden="true">
        <label htmlFor="companyCheck">Laat dit veld leeg</label>
        <input
          id="companyCheck"
          name="companyCheck"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {error && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      <button
        className="button"
        disabled={status === "sending" || !id}
        type="submit"
      >
        {status === "sending" ? "Aanvraag versturen…" : "Verstuur je aanvraag"}
        <Arrow />
      </button>
      <p className="form-note">
        Dit is een vrijblijvende aanvraag, geen bestelling of abonnement. Je gegevens worden gebruikt om je aanvraag te behandelen.{" "}
        <a href="/privacy">Lees hoe Sitesnit met je gegevens omgaat.</a>
      </p>
    </form>
  );
}
