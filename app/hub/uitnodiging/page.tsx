import {getHubRuntime} from '../../../lib/hub/runtime';
import {HubAuthForm,AcceptHubInvitation} from '../auth-form';
import {hubSession} from '../../../lib/hub/session';
export default async function Page({searchParams}:{searchParams:Promise<{token?:string|string[]}>}){
  const {token}=await searchParams;
  const hasToken=typeof token==='string'&&/^[a-f0-9]{64}$/.test(token);
  const session=hasToken?await hubSession():null;
  return <section className="wrap section hub-auth">
    <span className="eyebrow">Sitesnit Hub / Je eerste toegang</span>
    <h1>Account aanmaken</h1>
    {!hasToken?<div className="hub-account-intro hub-invitation-help">
      <h2>Begin met je persoonlijke uitnodiging.</h2>
      <p>Heb je een uitnodigingslink van Sitesnit ontvangen? Open die link om je naam, e-mailadres en een zelfgekozen wachtwoord in te vullen. Daarna bevestig je je e-mailadres via de verificatiemail.</p>
      <p>Geen uitnodiging ontvangen of is je link verlopen? Vraag Kay om een nieuwe link voor jouw website.</p>
      <a className="button" href="mailto:contact@sitesnit.nl?subject=Uitnodiging%20voor%20Sitesnit%20Hub">Uitnodiging aanvragen <span aria-hidden="true">↗</span></a>
      <a className="text-link" href="/hub/login">Heb je al een account? Inloggen</a>
    </div>:session?<AcceptHubInvitation/>:<>
      <p>Vul hieronder je naam en het uitgenodigde e-mailadres in. Kies zelf een wachtwoord van minimaal 12 tekens. Bevestig daarna je e-mailadres via de mail die je ontvangt; vervolgens kun je inloggen.</p>
      <HubAuthForm mode="invite" enabled={Boolean(await getHubRuntime())}/>
      <p>Heb je al een account? <a href="/hub/login">Log in</a> en open daarna je uitnodigingslink opnieuw.</p>
    </>}
  </section>;
}
