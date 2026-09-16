export function WebappCanvas() {
  return <div className="webapp-canvas" data-scene-target>
    <div className="webapp-top"><strong>jouw portaal<span>.</span></strong><span>Voorbeeld · geen live omgeving</span></div>
    <div className="webapp-workspace"><div className="webapp-sidebar"><span>Overzicht</span><b>Aanvragen</b><span>Documenten</span><span>Instellingen</span></div><div className="webapp-main"><span className="webapp-access">● Medewerker · passende toegang</span><strong>Alles op zijn plek.</strong><p>Wie doet wat? En wat kan verder?</p><div className="webapp-stats"><div><b>03</b><span>Nieuw</span></div><div><b>02</b><span>In behandeling</span></div><div><b>08</b><span>Afgerond</span></div></div><div className="webapp-task"><span><b>Aanvraag #012</b><small>Informatie ontvangen</small></span><em>Controleren ↗</em></div><div className="webapp-task"><span><b>Aanvraag #011</b><small>Document ontbreekt</small></span><em>In afwachting</em></div></div></div>
    <div className="webapp-caption"><span>Klanten zien hun eigen dossier.</span><b>Jij houdt overzicht. ↗</b></div>
  </div>;
}
