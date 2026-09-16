"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Session drafts can only be restored after hydration. */
import { useEffect, useState } from "react";
import ContactForm from "../contact/contact-form";
import { Arrow, Eyebrow } from "../ui";
export const money = (cents: number | null) =>
  cents === null
    ? "—"
    : new Intl.NumberFormat("nl-NL", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(cents / 100);
export function useToolDraft<T>(
  key: string,
  initial: T,
  validate: (data: unknown) => data is T,
) {
  const [value, setValue] = useState(initial),
    [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = JSON.parse(sessionStorage.getItem(key) ?? "null");
      if (validate(raw)) setValue(raw);
    } catch {}
    setReady(true);
  }, [key, validate]);
  useEffect(() => {
    if (ready)
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
      } catch {}
  }, [key, value, ready]);
  return [value, setValue, ready] as const;
}
export function ToolLead({
  eyebrow,
  title,
  accent,
  children,
}: {
  eyebrow: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <header className="wrap tool-lead">
      <a className="tool-back" href="/tools">
        ← Alle tools & checks
      </a>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>
        {title}
        <br />
        <em>{accent}</em>
      </h1>
      <p>{children}</p>
      <noscript><p className="no-js-note">Voor het invullen van deze tool is JavaScript nodig. Je kunt je vraag ook <a href="/contact">rechtstreeks met Sitesnit bespreken</a>.</p></noscript>
    </header>
  );
}
export function ToolActions({
  summary,
  filename,
  print = false,
}: {
  summary: string;
  filename: string;
  print?: boolean;
}) {
  const [status, setStatus] = useState("");
  function download() {
    const url = URL.createObjectURL(
      new Blob([summary], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `sitesnit-${filename}.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus("Je overzicht is klaargezet als tekstbestand.");
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(summary);
      setStatus("Je overzicht is gekopieerd.");
    } catch {
      setStatus("Kopiëren lukt niet in deze browser. Gebruik de downloadknop.");
    }
  }
  return (
    <div className="tool-actions">
      <div>
        <button
          className="button button-secondary"
          type="button"
          onClick={download}
        >
          Bewaar je overzicht <Arrow />
        </button>
        <button className="text-link" type="button" onClick={copy}>
          Kopieer tekst
        </button>
        {print && (
          <button
            className="text-link"
            type="button"
            onClick={() => window.print()}
          >
            Print / bewaar als PDF
          </button>
        )}
      </div>
      <p role="status">{status}</p>
    </div>
  );
}
export function ToolContact({
  summary,
  title = "Dit samen verder uitwerken?",
  text = "Bespreek je uitkomst en wat ervoor nodig is om je plan uit te voeren.",
  id = "bespreken",
  alwaysOpen = false,
  formTitle,
}: {
  summary: string;
  title?: string;
  text?: string;
  id?: string;
  alwaysOpen?: boolean;
  formTitle?: string;
}) {
  const [open, setOpen] = useState(alwaysOpen),
    [mounted, setMounted] = useState(alwaysOpen);
  return (
    <section className="tool-contact" id={id} tabIndex={-1}>
      <div className="tool-contact-intro">
        <div>
          <Eyebrow>Van inzicht naar uitvoering</Eyebrow>
          <h2>{title}</h2>
          <p>{text} {summary && 'Je kiest zelf of je dit overzicht meestuurt.'}</p>
        </div>
        {!alwaysOpen && <button
          className="button"
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-form`}
          onClick={() => {
            setMounted(true);
            setOpen(!open);
          }}
        >
          {open ? "Aanvraag inklappen" : "Bespreek mijn uitkomst"}
          <Arrow />
        </button>}
      </div>
      {mounted && (
        <div id={`${id}-form`} hidden={!open} className="tool-contact-form">
          <ContactForm embedded toolSummary={summary} heading={formTitle} />
        </div>
      )}
    </section>
  );
}
export function ToolHelp({
  title,
  items,
}: {
  title: string;
  items: [string, string][];
}) {
  return (
    <section className="wrap tool-help">
      <h2>{title}</h2>
      <div>
        {items.map(([question, answer]) => (
          <article key={question}>
            <h3>{question}</h3>
            <p>{answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
