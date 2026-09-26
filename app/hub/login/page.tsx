import {getHubRuntime} from '../../../lib/hub/runtime';
import {HubAuthForm} from '../auth-form';
export default async function Page(){
  const ready=Boolean(await getHubRuntime());
  return <section className="wrap section hub-auth hub-login-page">
    <span className="eyebrow">Sitesnit Hub / Klantomgeving</span>
    <h1>Inloggen op Sitesnit Hub</h1>
    <p>Log in met je e-mailadres en het wachtwoord dat je zelf hebt ingesteld. Hier vind je het overzicht van jouw website.</p>
    <div className="hub-login-options">
      <HubAuthForm enabled={ready}/>
      <aside className="hub-account-intro" aria-labelledby="hub-new-account">
        <span className="eyebrow">Voor het eerst hier?</span>
        <h2 id="hub-new-account">Nog geen account?</h2>
        <p>Je maakt je account aan via een persoonlijke uitnodiging van Sitesnit. Zo koppelen we je aan de juiste website.</p>
        <ol><li>Open je uitnodigingslink.</li><li>Kies zelf een wachtwoord.</li><li>Bevestig je e-mailadres en log in.</li></ol>
        <a className="button" href="/hub/uitnodiging">Account aanmaken <span aria-hidden="true">↗</span></a>
        <small>Daar lees je hoe je je uitnodiging gebruikt of aanvraagt.</small>
      </aside>
    </div>
  </section>;
}
