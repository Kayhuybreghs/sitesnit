import "./project-phone-screen.css";

type PhoneProject = "beurswijzer" | "beurswatcher";

function BrandMark({watcher = false}: {watcher?: boolean}) {
  return <span className="pps-brand-mark">{watcher
    ? <svg viewBox="0 0 32 32" fill="none"><circle cx="10" cy="21" r="5"/><circle cx="23" cy="21" r="5"/><path d="M6 18L9 8H13L15 19M19 19L21 8H25L28 19M15 21H18"/></svg>
    : <svg viewBox="0 0 32 32" fill="none"><path d="M6 26V19H10V26M14 26V14H18V26M22 26V9H26V26M5 14L13 7L18 11L27 3M21 3H27V9"/></svg>}
  </span>;
}
function Wijzer() {
  return <div className="pps-wijzer">
    <div className="pps-wijzer-nav"><b><BrandMark/>beurswijzer</b><span>Ⅱ</span><span>♙</span><i>☰</i></div>
    <div className="pps-wijzer-main">
      <span className="pps-wijzer-eyebrow">—　DE CIJFERS ACHTER JOUW GELD</span>
      <strong className="pps-wijzer-title">Begrijp wat er met<br/>je <em>geld</em> gebeurt.</strong>
      <p>Wat houd je over? Wat past bij jou? En wat kun je opbouwen? Van een goed verhaal naar jouw volgende stap.</p>
      <div className="pps-wijzer-actions"><b>Ontdek de<br/>inzichten <span>→</span></b><span>Bekijk mijn<br/>maandruimte <i>→</i></span></div>
      <div className="pps-future"><div>Een klein begin. Een lange adem.<span>↗</span></div><div className="pps-future-value"><span><b>€81.161</b><small>mogelijke waarde</small></span><svg viewBox="0 0 160 65" fill="none"><path d="M2 57H157M2 34H157M2 10H157" stroke="#e3ebd9"/><path d="M3 57C40 51 110 34 157 9V58H3Z" fill="#d9e6cf"/><path d="M3 57C40 51 110 34 157 9" stroke="#285747" strokeWidth="1.7"/><circle cx="157" cy="9" r="2.4" fill="#285747"/></svg></div><div className="pps-invest-label"><span>Maandelijks inleggen</span><b>€200</b></div><div className="pps-range"><i/></div><div className="pps-years"><span>5 jaar</span><span>10 jaar</span><b>20 jaar</b></div><small>Rekenvoorbeeld · 5% per jaar, geen kosten of belasting. Geen voorspelling.</small></div>
    </div>
    <div className="pps-bottom-nav"><span><svg viewBox="0 0 24 24" fill="none"><path d="M12 5C8 2 3 4 3 4V19C7 17 10 18 12 20M12 5C16 2 21 4 21 4V19C17 17 14 18 12 20V5"/></svg>Ontdek</span><span><svg viewBox="0 0 24 24" fill="none"><path d="M3 3H10V10H3ZM14 3H21V10H14ZM3 14H10V21H3ZM14 14H21V21H14Z"/></svg>Rekentools</span><span><svg viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9H21M16 13H21"/></svg>Mijn budget</span></div>
  </div>;
}
function Watcher() {
  return <div className="pps-watcher">
    <div className="pps-ticker"><span>VOORBEELDKOERSEN</span><b>AEX　934,21 <i>+0,42%</i></b><b>S&P　Ⅱ</b></div>
    <div className="pps-watcher-nav"><b><BrandMark watcher/><span>beurs<br/>watcher<span>.</span></span></b><span>⌕</span><i>☰</i></div>
    <div className="pps-watcher-main"><span className="pps-watcher-eyebrow">Voor de nieuwe generatie beleggers</span><strong className="pps-watcher-title">Kijk verder.<br/><em>Kom verder.</em></strong><p>De beurs. Je geld. Jouw toekomst.<br/>Ontdek wat ertoe doet en reken zelf door wat bij jouw plannen past.</p><div className="pps-stories">Ontdek de verhalen <span>↓</span></div><span className="pps-social">◎　Dagelijks op Instagram　↗</span><div className="pps-author"><BrandMark watcher/><span>Van Daniel. Voor nieuwsgierige beleggers.<small>Korte inzichten op social. Meer diepgang hier.</small></span></div></div>
    <div className="pps-radar"><div className="pps-radar-card"><b><span>●</span> OP JOUW RADAR <i>↗</i></b><div className="pps-radar-tabs"><span>De beurs</span><b>Vermogen</b><span>Later</span></div><small>JE EERSTE</small><strong>€100.000 <span>→</span></strong><p>Een doel wordt concreter als je de cijfers begrijpt.</p></div></div>
  </div>;
}

// Reconstructed from the inspected, user-supplied 360 × 811 project screenshots.
// Static project imagery only: no interactive controls or data requests.
export function ProjectPhoneScreen({project}: {project: PhoneProject}) {
  return <div className={`pps-screen pps-${project}`} role="img" aria-label={`Vereenvoudigde weergave van het mobiele ontwerp van ${project === "beurswijzer" ? "Beurswijzer" : "Beurswatcher"}`}><div className="pps-content" aria-hidden="true">{project === "beurswijzer" ? <Wijzer/> : <Watcher/>}</div></div>;
}
