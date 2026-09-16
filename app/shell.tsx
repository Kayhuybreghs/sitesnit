"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Arrow } from "./ui";
import { toolCatalog } from "./tools/tool-catalog";
import { BrandLogo } from './brand-logo';
export function Navigation() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) {
      dialog.current?.showModal();
      document.body.style.overflow = "hidden";
    } else {
      dialog.current?.close();
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  const links = [
    ["/diensten", "Diensten"],
    ["/projecten", "Projecten"],
    ["/kosten", "Kosten"],
    ["/over-sitesnit", "Over Sitesnit"],
  ];
  return (
    <>
      <header className="header">
        <div className="nav-inner wrap">
          <a className="logo" href="/" aria-label="Sitesnit home">
            <BrandLogo />
          </a>
          <nav className="desktop-nav" aria-label="Hoofdnavigatie">
            {links.map(([href, label]) => (
              <a
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
              >
                {label}
              </a>
            ))}
            <details className="tools-menu tools-catalog-menu" onKeyDown={e=>{if(e.key==="Escape"){e.currentTarget.open=false;e.currentTarget.querySelector("summary")?.focus();}}} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))e.currentTarget.open=false;}}>
              <summary>
                Tools & checks <span>⌄</span>
              </summary>
              <div>
                <a className="tools-overview-link" href="/tools">Alle tools & checks <span>Vind je vertrekpunt →</span></a>
                {toolCatalog.map(tool=><a key={tool.slug} href={tool.href}>{tool.name}<span>{tool.label}</span></a>)}
              </div>
            </details>
          </nav>
          <a className="nav-contact" href="/contact">
            Laten we praten <Arrow />
          </a>
          <button
            ref={trigger}
            type="button"
            className="menu-trigger"
            aria-label="Menu openen"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <span />
            <span />
          </button>
        </div>
      </header>
      <noscript><nav className="no-js-nav wrap" aria-label="Navigatie zonder JavaScript">{links.map(([href,label])=><a key={href} href={href}>{label}</a>)}<a href="/tools">Tools & checks</a><a href="/contact">Contact</a></nav></noscript>
      <dialog
        ref={dialog}
        className="mobile-menu"
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const items = Array.from(
            e.currentTarget.querySelectorAll<HTMLElement>(
              "a[href],button:not(:disabled)",
            ),
          );
          const first = items[0],
            last = items.at(-1);
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
        onCancel={() => setOpen(false)}
        onClose={() => {
          setOpen(false);
          trigger.current?.focus();
        }}
        aria-label="Navigatiemenu"
      >
        <div className="mobile-menu-head">
          <a className="logo" href="/">
            <BrandLogo />
          </a>
          <button
            className="close-menu"
            aria-label="Menu sluiten"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <nav aria-label="Mobiele hoofdnavigatie">
          {[...links, ["/contact", "Contact"]].map(([href, label], i) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>
              <span>0{i + 1}</span>
              {label}
              <Arrow />
            </a>
          ))}
        </nav>
        <div className="mobile-tool-links mobile-tools-catalog">
          <a href="/tools" onClick={()=>setOpen(false)}><strong>Alle tools & checks</strong><Arrow/></a>
          {toolCatalog.map(tool=><a href={tool.href} key={tool.slug} onClick={()=>setOpen(false)}>{tool.name}<Arrow/></a>)}
        </div>
        <p>Een nieuwe website begint met een gesprek.</p>
      </dialog>
    </>
  );
}
export function Motion() {
  const path = usePathname();
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    let dispose: (() => void) | undefined;
    const mount = () => {
      dispose?.();
      if (media.matches) return;
      const elements = [...document.querySelectorAll(".section-head,.project-card,.process>div,.personal-strip,.tool-feature,.cta-row,.together-steps>li,.service-method>li,[data-reveal]")];
      if (!elements.length && !document.querySelector('[data-scroll-scene]')) return;
      const reveal = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add("seen"); reveal.unobserve(entry.target); }
      }), { threshold: .12 });
      elements.filter(el => el.getBoundingClientRect().top > innerHeight).forEach(el => { el.classList.add("reveal"); reveal.observe(el); });
      const scenes = [...document.querySelectorAll<HTMLElement>("[data-scroll-scene]")].map(scene => ({
        scene, target: scene.querySelector("[data-scene-target],.fold-stage,.route-art") ?? scene,
        delayed: scene.matches('.route-chapter,.service-visual,[data-scroll-scene="unfold"]'), previous: "", nearby: false,
      }));
      const byTarget = new Map(scenes.map(entry => [entry.target, entry]));
      let frame = 0;
      const update = () => {
        frame = 0;
        const measured = scenes.filter(entry => entry.nearby).map(entry => ({entry, rect: entry.target.getBoundingClientRect()}));
        for (const {entry, rect} of measured) {
          const raw = Math.max(0, Math.min(1, entry.delayed
            ? (innerHeight * .78 - rect.top) / (innerHeight * .56)
            : (innerHeight * .9 - rect.top) / Math.max(1, Math.min(rect.height * .8, innerHeight * .95))));
          const progress = entry.delayed ? raw * raw * (3 - 2 * raw) : raw;
          const value = progress.toFixed(3);
          if (entry.previous === value) continue;
          entry.scene.style.setProperty("--progress", value);
          entry.scene.dataset.phase = progress > .76 ? "3" : progress > .35 ? "2" : "1";
          entry.previous = value;
        }
      };
      const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
      const nearby = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          const item = byTarget.get(entry.target);
          if (!item) return;
          item.nearby = entry.isIntersecting;
          if (!item.nearby) {
            const value = entry.boundingClientRect.top < 0 ? "1" : "0";
            if (item.previous !== value) { item.scene.style.setProperty("--progress", value); item.scene.dataset.phase = value === "1" ? "3" : "1"; item.previous = value; }
          }
        });
        schedule();
      }, {rootMargin: "20% 0px"});
      scenes.forEach(entry => nearby.observe(entry.target));
      addEventListener("scroll", schedule, {passive: true});
      addEventListener("resize", schedule);
      dispose = () => {
        reveal.disconnect(); nearby.disconnect(); cancelAnimationFrame(frame);
        removeEventListener("scroll", schedule); removeEventListener("resize", schedule);
        elements.forEach(el => el.classList.remove("reveal", "seen"));
        scenes.forEach(({scene}) => { scene.style.removeProperty("--progress"); delete scene.dataset.phase; });
      };
    };
    mount(); media.addEventListener("change", mount);
    return () => { dispose?.(); media.removeEventListener("change", mount); };
  }, [path]);
  return null;
}
