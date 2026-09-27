export function AuditIntro(){
 return <section className="audit-hero audit-hero-clear"><div className="wrap">
  <div className="audit-hero-copy"><span className="eyebrow">Gratis SEO-audit van je website</span>
   <h1>Vind SEO-fouten.<br/><em>Weet waar je begint.</em></h1>
   <p>Vul je websiteadres in. Je krijgt een overzicht van technische problemen, de pagina’s waar ze voorkomen en wat je eraan kunt doen.</p>
   <a className="button audit-start-button" href="#audit-url">Start mijn gratis SEO-audit <span aria-hidden="true">↗</span></a>
   <span className="audit-start-hint">Je gaat direct naar het invoerveld hieronder.</span>
   <ul className="audit-hero-facts"><li>Tot 20 pagina’s</li><li>Tot ongeveer 3 minuten</li><li>Geen account nodig</li></ul>
  </div>
  <a className="audit-report-invite" href="#audit-url">
   <div className="audit-report-top"><span className="audit-mini-brand" aria-hidden="true">S↗</span><span>Jouw website doorgelicht</span><span className="audit-report-arrow" aria-hidden="true">↗</span></div>
   <div className="audit-report-heading"><span>Dit krijg je terug</span><strong>Van een URL<br/>naar een actieplan.</strong></div>
   <div className="audit-deliverables">
    <div><span className="audit-deliverable-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M5 25a13 13 0 1 1 22 0M16 18l8-8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/><circle cx="16" cy="18" r="3" fill="currentColor"/></svg></span><span><strong>Een technisch overzicht</strong><small>HTML-controles en een echte mobiele Lighthouse-test.</small></span></div>
    <div><span className="audit-deliverable-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><rect x="5" y="4" width="22" height="24" rx="4" stroke="currentColor" strokeWidth="2"/><path d="M10 11h12M10 17h7M10 23h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></span><span><strong>Problemen per pagina</strong><small>Zie welke URL aandacht nodig heeft en waarom.</small></span></div>
    <div><span className="audit-deliverable-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="m5 16 7 7L27 8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>Een logische volgende stap</strong><small>Concrete verbeteracties, op volgorde van prioriteit.</small></span></div>
   </div>
   <div className="audit-report-bottom"><span>Begin met jouw websiteadres</span><span aria-hidden="true">→</span></div>
  </a>
 </div></section>;
}
