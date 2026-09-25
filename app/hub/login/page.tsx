import {getHubRuntime} from '../../../lib/hub/runtime';
import {HubAuthForm} from '../auth-form';
export default async function Page(){const ready=Boolean(await getHubRuntime());return <section className="wrap section hub-auth"><span className="eyebrow">Sitesnit Hub / Klantomgeving</span><h1>Welkom terug.</h1><p>Bekijk de cijfers, bereikbaarheid en werkzaamheden van jouw website. Toegang krijg je via een uitnodiging van Sitesnit.</p><HubAuthForm enabled={ready}/><a href="/contact">Bespreek je website</a></section>;}
