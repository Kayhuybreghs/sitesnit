import {getHubRuntime} from '../../../lib/hub/runtime';
import {HubAuthForm} from '../auth-form';
import {hubSession} from '../../../lib/hub/session';
import {redirect} from 'next/navigation';
export default async function Page(){
  if(await hubSession())redirect('/hub');
  const ready=Boolean(await getHubRuntime());
  return <section className="wrap section hub-auth hub-login-page">
    <span className="eyebrow">Sitesnit Hub / Klantomgeving</span>
    <h1>Inloggen op Sitesnit Hub</h1>
    <p>Je eigen plek voor websitecijfers, Google-resultaten en afgesproken werkzaamheden. Sitesnit Hub is een betaalde aanvulling op je website; toegang en aangesloten bronnen spreken we vooraf af.</p>
    <p><a href="/diensten/website-monitoring">Wat krijg je met Sitesnit Hub? Bekijk de uitleg →</a></p>
    <div className="hub-login-options">
      <HubAuthForm enabled={ready}/>
      <aside className="hub-account-intro" aria-labelledby="hub-new-account">
        <span className="eyebrow">Voor het eerst hier?</span>
        <h2 id="hub-new-account">Nog geen account?</h2>
        <p>Heb je Sitesnit Hub afgesproken? Je ontvangt een persoonlijke uitnodiging, zodat je alleen toegang krijgt tot jouw websitegegevens. Een account aanmaken op zichzelf activeert geen abonnement.</p>
        <ol><li>Open je uitnodigingslink.</li><li>Kies zelf een wachtwoord.</li><li>Bevestig je e-mailadres en log in.</li></ol>
        <a className="button" href="/hub/uitnodiging">Account aanmaken <span aria-hidden="true">↗</span></a>
        <small>Daar lees je hoe je je uitnodiging gebruikt of aanvraagt.</small>
      </aside>
    </div>
  </section>;
}
