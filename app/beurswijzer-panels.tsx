import "./beurswijzer-panels.css";

// Decorative, simplified reconstructions of the inspected Beurswijzer screenshots.
// No inputs, links, event handlers or bitmap assets. The surrounding case supplies context.
function PanelHeader({budget = false}: {budget?: boolean}) {
  return <div className="bwp-navigation"><b><span>↗</span>beurswijzer</b><span>Ontdek　 Geld uitgelegd　 Rekentools　 <strong>{budget ? "Mijn budget" : "Inzichten"}</strong></span><i>☰</i></div>;
}

export function BeurswijzerEditorialPanel() {
  return <div className="bwp-panel" aria-hidden="true"><div className="bwp-surface">
    <PanelHeader />
    <div className="bwp-editorial">
      <small>Uit onze redactie</small><div className="bwp-editorial-heading"><strong>Het verhaal achter je geld.</strong><span>Ook de actualiteit volgen　→</span></div>
      <span className="bwp-search-label">Zoek in onze artikelen</span><div className="bwp-search">Bijvoorbeeld: buffer of beleggen <span>⌕</span></div>
      <div className="bwp-tabs"><b>Eigen artikelen</b><span>Bewaarde artikelen</span></div>
      <div className="bwp-articles">{[
        {tone:"dark",overline:"Klein beginnen. Verder kijken.",headline:"€200 / maand",category:"Beleggen",title:"Wat kan €200 per maand voor je toekomst doen?"},
        {tone:"soft",overline:"Voor de dingen die je niet plant.",headline:"Jouw buffer.",category:"Budgetteren",title:"Hoeveel buffer geeft jou eigenlijk rust?"},
        {tone:"lime",overline:"Een beetje vooruitdenken helpt.",headline:"12 maanden.",category:"Geld uitgelegd",title:"Je maand klopt. Maar klopt je jaar ook?"},
      ].map(article => <div className="bwp-article" key={article.tone}><div className={`bwp-cover bwp-${article.tone}`}><span>{article.overline}</span><strong>{article.headline}</strong><div className="bwp-bars">{[1,2,3,4,5].map(height => <i key={height} style={{height:`${height * 17}%`}} />)}</div></div><small>{article.category}</small><b>{article.title}</b><span className="bwp-byline">Beurswijzer · 4 min lezen <i>→</i></span></div>)}</div>
    </div>
  </div></div>;
}

export function BeurswijzerPlannerPanel() {
  return <div className="bwp-panel" aria-hidden="true"><div className="bwp-surface">
    <PanelHeader budget />
    <div className="bwp-planner">
      <div className="bwp-available"><small>Na je lasten en plannen</small><strong>€378</strong><span>per maand vrij</span><p>Dit blijft over na je woonlasten, overige kosten, jaarreserveringen, aflossingen, sparen en beleggen.</p><div className="bwp-budget-bar"><i/><i/><i/><i/></div><div className="bwp-budget-key"><span>Lasten</span><span>Sparen</span><span>Beleggen</span><span>Vrij</span></div><b className="bwp-adjust">Mijn bedragen aanpassen　→</b></div>
      <div className="bwp-month"><small>Je maand in vier regels</small><div className="bwp-ledger">{[
        ["Inkomsten","Alles wat er binnenkomt","€3.138"],
        ["Lasten & aflossingen","Inclusief jaarrekeningen / 12","€2.260"],
        ["Naar sparen","Algemeen sparen + spaardoelen","€250"],
        ["Naar beleggen","Totale inleg, één keer geteld","€250"],
      ].map(([label,description,amount]) => <div key={label}><span>{label}<small>{description}</small></span><b>{amount}</b></div>)}</div><b className="bwp-month-link">Hoe ging mijn maand echt?　→</b></div>
      <div className="bwp-investment"><b>Jouw beleggingen <span>PLUS</span></b><span>Per belegging　 Extra inleg　 Koersverloop</span></div>
    </div>
  </div></div>;
}
