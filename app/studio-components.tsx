import { Arrow, Eyebrow } from "./ui";

export type ServiceKind = "webdesign" | "webshops" | "branding" | "seo" | "content" | "social-media" | "onderhoud-hosting" | "ai-automatisering";

export function ServiceVisual({ kind = "webdesign" }: { kind?: string }) {
  return <div className={`service-visual visual-${kind}`} data-scroll-scene aria-hidden="true">
    <div className="service-orbit" />
    {["content", "social-media", "onderhoud-hosting"].includes(kind) ? <div className="care-study">
      <div className="study-toolbar"><b>{kind === "onderhoud-hosting" ? "jouw website." : "jouw verhaal."}</b><span>Goed geregeld ↗</span></div>
      <strong>{kind === "onderhoud-hosting" ? "Een basis om op door te bouwen." : "Een goed ritme. Een herkenbaar verhaal."}</strong>
      {(kind === "onderhoud-hosting" ? ["Hosting & techniek", "Inhoud bijhouden", "Gericht verder ontwikkelen"] : ["Onderwerpen & planning", "Tekst, beeld & redactie", "Klaar voor publicatie"]).map((item,i)=><div className="care-study-row" key={item}><span>0{i+1}</span><b>{item}</b><i>↗</i></div>)}
    </div> : ["webdesign", "webshops", "branding"].includes(kind) ? <div className="design-study">
      <div className="study-toolbar"><b>jouw merk.</b><span>Menu ↗</span></div>
      <strong>{kind === "webshops" ? "Jouw producten." : "Een goed verhaal."}<br /><em>{kind === "webshops" ? "Een eigen winkel." : "Een eigen gezicht."}</em></strong>
      <div className="study-composition"><span /><span /><span /></div>
      <div className="study-caption"><span>Herkenbaar. Op ieder scherm.</span><i>↗</i></div>
      <div className="study-phone"><b>jouw merk.</b><strong>Ook<br />hier.</strong><span>Ontdek ↗</span></div>
    </div> : kind === "seo" ? <div className="search-study">
      <div className="search-study-query">⌕ <span>Waar zoekt jouw klant naar?</span></div>
      <div className="search-study-answer"><span>JOUW BEDRIJF / JOUW EXPERTISE</span><strong>Het antwoord dat past.</strong><p>Een duidelijke pagina voor een concrete vraag.</p><i /><i /></div>
      <div className="search-study-route"><span>Zoekvraag</span><span>Antwoord</span><b>Contact ↗</b></div>
    </div> : <div className="flow-study">
      <div><span>01</span><p>Aanvraag ontvangen<small>De informatie komt binnen.</small></p><b>↙</b></div>
      <i />
      <div><span>02</span><p>Alles op de juiste plek<small>Ordenen, koppelen, voorbereiden.</small></p><b>↙</b></div>
      <i />
      <div><span>03</span><p>Jouw controle<small>Klaar voor de volgende stap.</small></p><b>✓</b></div>
    </div>}
  </div>;
}

export function PageHero({ eyebrow, title, accent, description, children, visual, tone = "blue" }: {
  eyebrow: string; title: string; accent: string; description: string;
  children?: React.ReactNode; visual?: React.ReactNode; tone?: "blue" | "green" | "peach";
}) {
  return <section className={`studio-hero tone-${tone}`}>
    <div className={`wrap studio-hero-grid ${visual ? "with-visual" : ""}`}>
      <div className="studio-hero-copy"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}<br /><em>{accent}</em></h1><p>{description}</p>{children && <div className="studio-hero-actions">{children}</div>}</div>
      {visual && <div className="studio-hero-art">{visual}</div>}
    </div>
  </section>;
}

export function WorkingTogether() {
  return <section className="together-section section">
    <div className="wrap together-grid">
      <div className="together-copy"><Eyebrow>Samen aan de slag</Eyebrow><h2>Jij hebt een idee.<br /><em>We maken het concreet.</em></h2><p>Je hoeft nog geen uitgewerkt plan te hebben. Vertel wat je wilt bereiken, wat er beter kan en waar je over twijfelt.</p><a className="button" href="/contact">Bespreek je plannen <Arrow /></a><small>Vertel over je idee of vraag een belafspraak aan.</small></div>
      <ol className="together-steps">
        {[
          ["Kennismaken", "We bespreken je bedrijf, je bezoekers en de vraag waarmee je rondloopt."],
          ["Een plan afspreken", "Inhoud, aanpak en afspraken worden concreet. Je weet wat we gaan maken."],
          ["Uitwerken & testen", "We werken de afgesproken onderdelen uit, bespreken de keuzes en controleren hoe het werkt."],
          ["Opleveren & verder", "We controleren het resultaat en spreken af hoe je ermee verdergaat."],
        ].map(([title, text], index) => <li key={title}><span>0{index + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}
      </ol>
    </div>
  </section>;
}
