"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import "./floating-contact.css";

const ContactForm = dynamic(() => import("./contact/contact-form"), {
  ssr: false,
  loading: () => <p role="status">Formulier laden…</p>,
});

function ContactIcon({ call = false }: { call?: boolean }) {
  return <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
    {call ? <><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M8 3v4m8-4v4M4 10h16m-12 5 3 3 5-5" /></> : <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>}
  </svg>;
}

export function FloatingContact({ publicPaths }: { publicPaths: string[] }) {
  const pathname = usePathname();
  // Keep account screens and the existing full contact form free of a second form.
  if (pathname === "/contact" || !publicPaths.includes(pathname)) return null;
  return <ContactDock key={pathname} />;
}

function ContactDock() {
  const [visible, setVisible] = useState(false);
  const [opened, setOpened] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const [mode, setMode] = useState<"email" | "call">("email");
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const update = () => setVisible(window.scrollY > Math.min(window.innerHeight * .55, 460));
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!opened) return;
    const panel = dialog.current;
    const previousOverflow = document.body.style.overflow;
    panel?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      panel?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [opened]);

  function open(nextMode: "email" | "call", button: HTMLButtonElement) {
    opener.current = button;
    setMode(nextMode);
    setMounted(true);
    setOpened(true);
  }

  function close() {
    if (closing) return;
    setClosing(true);
    const delay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 220;
    timer.current = setTimeout(() => {
      dialog.current?.close();
      setOpened(false);
      setClosing(false);
      requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
    }, delay);
  }

  return <>
    <div className="contact-dock" data-visible={visible} inert={!visible} aria-label="Snel contact opnemen">
      <span className="contact-dock-copy"><strong>Even overleggen?</strong><span>Stuur je vraag of plan een belafspraak</span></span>
      <button type="button" className="contact-dock-email" onClick={e => open("email", e.currentTarget)} aria-haspopup="dialog"><ContactIcon />E-mail</button>
      <button type="button" className="contact-dock-call" onClick={e => open("call", e.currentTarget)} aria-haspopup="dialog"><ContactIcon call />Belafspraak</button>
    </div>
    <dialog ref={dialog} className="quick-contact" data-closing={closing} aria-labelledby={titleId} aria-describedby={descriptionId}
      onCancel={e => { e.preventDefault(); close(); }}
      onClick={e => {
        if (e.target !== e.currentTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) close();
      }}>
      <div className="quick-contact-inner">
        <button className="quick-contact-close" type="button" onClick={close} aria-label="Contactvenster sluiten">×</button>
        <header className="quick-contact-heading">
          <span className="quick-contact-eyebrow">Sitesnit · laten we praten</span>
          <h2 id={titleId}>Even contact.</h2>
          <p id={descriptionId}>Stuur je vraag of geef aan wanneer bellen uitkomt. Ik stem het vervolg per e-mail met je af.</p>
        </header>
        {mounted && <ContactForm compact contactMode={mode} />}
      </div>
    </dialog>
  </>;
}
