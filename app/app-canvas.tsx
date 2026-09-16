import './app-canvas.css';

function AppIcon({ kind }: { kind: 'calendar' | 'grid' | 'message' | 'check' | 'arrow' }) {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {kind === 'calendar' ? <><rect x="4" y="5" width="16" height="15" rx="3" /><path d="M8 3v4m8-4v4M4 10h16M8 14h2m4 0h2m-8 3h2" /></>
      : kind === 'grid' ? <><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></>
      : kind === 'message' ? <><path d="M5 18l-1 3 5-3h8a3 3 0 003-3V7a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 001 3Z" /><path d="M8 9h8m-8 4h5" /></>
      : kind === 'check' ? <path d="m5 12 4 4L19 6" />
      : <path d="M5 12h14m-5-5 5 5-5 5" />}
  </svg>;
}

function AppStatusbar() {
  return <div className="app-canvas-statusbar"><span>9:41</span><i /><span className="app-canvas-signal"><b /><b /><b /><b /><em /></span></div>;
}

/** Original illustrative interface. The apparent controls intentionally are not interactive. */
export function AppCanvas() {
  return <div className="app-canvas" data-scene-target>
    <div className="app-canvas-label"><span>Een app voor jouw proces</span><b>Interfacevoorbeeld</b></div>
    <div className="app-canvas-stage" role="img" aria-label="Voorbeeld van een mobiele app: een agenda met afspraken en een tweede scherm waarop een aanvraag wordt bevestigd.">
      <div className="app-canvas-orbit" aria-hidden="true" />
      <div className="app-canvas-phones" aria-hidden="true">
        <div className="app-canvas-phone app-canvas-primary">
          <AppStatusbar />
          <div className="app-canvas-screen">
            <div className="app-canvas-apphead"><span className="app-canvas-symbol"><AppIcon kind="grid" /></span><b>Mijn werkdag</b><span className="app-canvas-avatar">J</span></div>
            <span className="app-canvas-overline">Klaar voor vandaag</span>
            <strong className="app-canvas-heading">Ruimte voor<br />wat telt.</strong>
            <div className="app-canvas-week"><span>MA<b>14</b></span><span>DI<b>15</b></span><span>WO<b>16</b></span><span className="is-selected">DO<b>17</b></span><span>VR<b>18</b></span></div>
            <div className="app-canvas-agenda-title"><b>Jouw afspraken</b><span>02</span></div>
            <div className="app-canvas-appointment"><span className="app-canvas-time">18:30</span><div><b>Kennismaking</b><small>Alles staat voor je klaar</small></div><AppIcon kind="arrow" /></div>
            <div className="app-canvas-appointment app-canvas-appointment-muted"><span className="app-canvas-time">19:00</span><div><b>Project bespreken</b><small>Een volgende stap zetten</small></div></div>
            <div className="app-canvas-action"><span>Nieuwe aanvraag</span><span>+</span></div>
          </div>
          <div className="app-canvas-bottom"><span className="is-selected"><AppIcon kind="calendar" />Agenda</span><span><AppIcon kind="grid" />Overzicht</span><span><AppIcon kind="message" />Berichten</span></div>
          <span className="app-canvas-homebar" />
        </div>
        <div className="app-canvas-phone app-canvas-secondary">
          <AppStatusbar />
          <div className="app-canvas-screen">
            <div className="app-canvas-request-head"><span>←</span><b>Jouw aanvraag</b><span>···</span></div>
            <div className="app-canvas-confirmation"><span className="app-canvas-check"><AppIcon kind="check" /></span><div><strong>Goed geregeld.</strong><p>Je aanvraag is ontvangen.</p></div></div>
            <div className="app-canvas-request-body"><span className="app-canvas-overline">Zo staat het ervoor</span><div className="app-canvas-request-detail"><span>Afspraak</span><b>Kennismaking</b></div><div className="app-canvas-request-detail"><span>Voorkeur</span><b>Donderdag · 18:30</b></div><div className="app-canvas-request-state"><i /><span>Wacht op bevestiging</span></div><p className="app-canvas-request-note">Je vindt de reactie straks hier terug.</p></div>
            <div className="app-canvas-request-back"><span>Naar je overzicht</span><AppIcon kind="arrow" /></div>
          </div>
          <span className="app-canvas-homebar" />
        </div>
      </div>
    </div>
    <p className="app-canvas-caption">Van iets regelen naar overzicht houden.<span>Voorbeeldschermen · geen werkende app</span></p>
  </div>;
}
