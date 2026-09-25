import {getHubRuntime} from '../../../lib/hub/runtime';
import {HubAuthForm,AcceptHubInvitation} from '../auth-form';
import {hubSession} from '../../../lib/hub/session';
export default async function Page(){const session=await hubSession();return <section className="wrap section hub-auth"><span className="eyebrow">Je persoonlijke uitnodiging</span><h1>Jouw website.<br/>Jouw overzicht.</h1>{session?<AcceptHubInvitation/>:<><p>Maak je account aan met het e-mailadres waarop je bent uitgenodigd. Bevestig daarna je e-mailadres. Heb je al een account? Log eerst in en open je uitnodigingslink opnieuw.</p><HubAuthForm mode="invite" enabled={Boolean(await getHubRuntime())}/></>}</section>;}
