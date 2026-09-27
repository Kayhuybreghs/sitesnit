"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Read browser-only URL and session context once after hydration. */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { ANALYTICS_TOOL_PATHS, trackPublicEvent } from '../../lib/analytics-events';
import { contactServiceNames } from '../../lib/contact/options';
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
  const [includeSummary, setIncludeSummary] = useState(false);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [id, setId] = useState("");
  const uid = useId();
  const fieldId = (name:string) => `${uid}-${name}`;
  const inFlight = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<Record<string,unknown>|null>(null);
  const [receipt, setReceipt] = useState({reference:'',confirmation:'pending',localOnly:false});
  const [localPreview, setLocalPreview] = useState(false);
  const pendingKey = useCallback(() => `sitesnit-contact-pending:${location.pathname}:${embedded?'tool':'contact'}`, [embedded]);
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
    setLocalPreview(['localhost','127.0.0.1','[::1]'].includes(location.hostname));
    setId(crypto.randomUUID());
    try {
      const saved=JSON.parse(sessionStorage.getItem(pendingKey())??'null');
      if(saved&&typeof saved.requestId==='string') {setPending(saved);setId(saved.requestId);}
    } catch {}
    const p = new URLSearchParams(location.search);
    setService(Object.hasOwn(contactServiceNames,p.get('dienst')??'') ? p.get('dienst')! : '');
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
  }, [embedded,pendingKey]);
  useEffect(() => {
    if (embedded) setPackageId(selectedPackage);
  }, [embedded, selectedPackage]);
  useEffect(() => {
    if (embedded) setWebsiteValue(website);
  }, [embedded, website]);
  useEffect(() => { if(error||status==='success') feedback.current?.focus(); }, [error,status]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(inFlight.current) return;
    inFlight.current=true;
    setStatus("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload=pending??{
      name:fd.get('name'),email:fd.get('email'),website:websiteValue,phone:fd.get('phone'),
      message:fd.get('message'),companyCheck:fd.get('companyCheck'),requestId:id,packageId,
      serviceId:service,sourcePage:location.pathname,formId:embedded?'tool_contact':'contact',
      project:projectContext.toLowerCase(),rhythm,careInterests,
      monthlyPlan:careInterests.includes(monthlyPlans[monthlyPlan])?monthlyPlan:'',
      appointment:appointmentWanted,preferredDay,preferredTime,includeSummary,
      toolSummary:includeSummary?summary:'',
    };
    setPending(payload);
    try {sessionStorage.setItem(pendingKey(),JSON.stringify(payload));} catch {}
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(25000),
      });
      const body = (await response.json()) as {ok?:boolean;error?:string;id?:string;reference?:string;mail?:{confirmation?:string};localOnly?:boolean};
      if (!response.ok || !body.ok || body.id!==payload.requestId || !body.reference){
        if([400,403,413,429].includes(response.status)){
          setPending(null);try{sessionStorage.removeItem(pendingKey());}catch{}
        }
        throw new Error(body.error ?? "Je aanvraag is niet verzonden.");
      }
      setReceipt({reference:body.reference,confirmation:body.mail?.confirmation??'pending',localOnly:body.localOnly===true});
      setStatus("success");
      const leadKey=`sitesnit-lead-confirmed:${body.id}`;
      try {
        sessionStorage.removeItem("sitesnit-context-v1");
        sessionStorage.removeItem(pendingKey());
        if(!sessionStorage.getItem(leadKey)){
          // Mark even without consent: never replay a past request after later consent.
          sessionStorage.setItem(leadKey,'1');
          trackPublicEvent({name:'generate_lead',form_id:embedded?'tool_contact':'contact',...(ANALYTICS_TOOL_PATHS[location.pathname]?{tool_id:ANALYTICS_TOOL_PATHS[location.pathname]}:{})});
        }
      } catch {}
    } catch (e) {
      setError(e instanceof Error&&e.name!=='TimeoutError'&&e.name!=='TypeError'?e.message:'De verbinding is onderbroken. Probeer dezelfde aanvraag opnieuw; die wordt niet dubbel opgeslagen.');
      setStatus("idle");
    } finally {inFlight.current=false;}
  }
  if (status === "success")
    return (
      <div className="success-box" role="status" ref={feedback} tabIndex={-1}>
        <span className="eyebrow">{receipt.localOnly?'Lokale testaanvraag':'Goed ontvangen'}</span>
        <h2>
          Dank je.
          <br />
          <em>{receipt.localOnly?'Je test is opgeslagen.':'Je verhaal ligt klaar.'}</em>
        </h2>
        <p>
          {receipt.localOnly?'Je aanvraag is alleen op deze computer opgeslagen. Hij staat niet in de live klantomgeving van Sitesnit.':'Je aanvraag is opgeslagen bij Sitesnit. Je opgegeven e-mailadres is het contactpunt voor het vervolg.'}
        </p>
        <p>
          Je referentie: <strong className="contact-reference">{receipt.reference}</strong>
        </p>
        <p>{receipt.confirmation==='provider_accepted'
          ?'De e-mailprovider heeft je bevestiging aangenomen. Controleer ook je spammap.'
          :receipt.confirmation==='unavailable'
            ?'Er is geen bevestigingsmail verstuurd: de mailkoppeling is hier niet actief of niet beschikbaar. Je hoeft de aanvraag niet opnieuw in te dienen.'
            :receipt.confirmation==='needs_review'
              ?'Je aanvraag is bewaard, maar de mailbezorging moet worden gecontroleerd. We kunnen de ontvangst van je bevestigingsmail nog niet bevestigen.'
              :'Je aanvraag is veilig opgeslagen. De bevestigingsmail wordt afzonderlijk verwerkt en kan later aankomen.'}</p>
        <a className="text-link" href="/projecten">
          Bekijk ondertussen het werk <Arrow />
        </a>
      </div>
    );
  return (
    <form className="contact-form" onSubmit={submit} aria-busy={status==='sending'}>
      <noscript><p className="no-js-note">Dit formulier heeft JavaScript nodig.{site.email && <> Mail je vraag naar <a href={`mailto:${site.email}`}>{site.email}</a>.</>}</p></noscript>
      <h2>{heading ?? (embedded ? "Bespreek je uitkomst" : "Bespreek je plannen")}</h2>
      {localPreview&&<aside className="context-box"><strong>Je bekijkt een lokale testversie</strong><p>Een aanvraag hier is geen aanvraag via de live website. In deze testomgeving kan mailverzending uitstaan. De melding na het versturen vertelt of een bevestiging naar de mailprovider is gestuurd.</p></aside>}
      <p>
        {introduction ?? (embedded
          ? "Vertel wat je wilt bespreken. Wil je bellen? Kies dan hieronder optioneel een voorkeursdag. We stemmen het moment per e-mail af."
          : "Laat je gegevens en een korte toelichting achter. Dan hebben we een goed vertrekpunt voor ons gesprek.")}
      </p>
      {service && (
        <p className="service-interest">
          Je aanvraag gaat over <strong>{contactServiceNames[service]}</strong>.
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
      <fieldset className="contact-fields" disabled={Boolean(pending)}>
      <legend className="sr-only">Je aanvraag</legend>
      <div className="form-row">
        <div className="field">
          <label htmlFor={fieldId("name")}>Je naam</label>
          <input
            id={fieldId("name")}
            name="name"
            defaultValue={pending ? String(pending.name) : undefined}
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
        </div>
        <div className="field">
          <label htmlFor={fieldId("email")}>Je e-mailadres</label>
          <input
            id={fieldId("email")}
            name="email"
            defaultValue={pending ? String(pending.email) : undefined}
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor={fieldId("website")}>
          Bestaande website <small>(optioneel)</small>
        </label>
        <input
          id={fieldId("website")}
          name="website"
          inputMode="url"
          placeholder="jouwbedrijf.nl"
          value={websiteValue}
          onChange={(e) => setWebsiteValue(e.target.value)}
          maxLength={2000}
        />
      </div>
      <div className="field">
        <label htmlFor={fieldId("package")}>
          Websitepakket <small>(als dat al duidelijk is)</small>
        </label>
        <select
          id={fieldId("package")}
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
          <label htmlFor={fieldId("phone")}>
            Telefoonnummer <small>(optioneel)</small>
          </label>
          <input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={40}
          />
        </div>
      </div>
      <div className="field">
        <label htmlFor={fieldId("message")}>Vertel kort over je plannen</label>
        <textarea
          id={fieldId("message")}
          name="message"
          defaultValue={pending ? String(pending.message) : undefined}
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
              <label htmlFor={fieldId("preferredDay")}>Voorkeursdag <small>(optioneel)</small></label>
              <select
                id={fieldId("preferredDay")}
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
              <label htmlFor={fieldId("preferredTime")}>
                Voorkeurstijd <small>(optioneel)</small>
              </label>
              <input
                type="time"
                id={fieldId("preferredTime")}
                name="preferredTime"
                min={weekend ? "00:00" : "18:00"}
                max={weekend ? "23:59" : "21:30"}
                value={preferredTime}
                disabled={!preferredDay}
                onInput={(event) => setPreferredTime(event.currentTarget.value)}
                onChange={(event) => setPreferredTime(event.target.value)}
                aria-describedby={fieldId("call-time-window")}
              />
            </div>
          </div>
          <p id={fieldId("call-time-window")}>
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
        <label htmlFor={fieldId("companyCheck")}>Laat dit veld leeg</label>
        <input
          id={fieldId("companyCheck")}
          name="companyCheck"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      </fieldset>
      {pending && <div className="context-box"><strong>Deze aanvraag wordt gecontroleerd</strong><p>We versturen bij opnieuw proberen exact dezelfde gegevens. Zo ontstaat geen dubbele aanvraag.</p><details><summary>Je verzendpoging bekijken</summary><p>{String(pending.name)} · {String(pending.email)}</p><pre>{String(pending.message)}</pre></details></div>}
      {error && (
        <div className="error-box" role="alert" ref={feedback} tabIndex={-1}>
          {error}
        </div>
      )}
      <button
        className="button"
        disabled={status === "sending" || !id}
        type="submit"
      >
        {status === "sending" ? "Aanvraag versturen…" : pending ? "Controleer en probeer opnieuw" : "Verstuur je aanvraag"}
        <Arrow />
      </button>
      <p className="form-note">
        Dit is een vrijblijvende aanvraag, geen bestelling of abonnement. Je gegevens worden gebruikt om je aanvraag te behandelen.{" "}
        <a href="/privacy">Lees hoe Sitesnit met je gegevens omgaat.</a>
      </p>
    </form>
  );
}
