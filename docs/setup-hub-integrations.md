# Sitesnit Hub — inrichting en overdracht

Bijgewerkt 24 september 2026. De Hub is lokaal geïmplementeerd en getest. Er is geen productieaccount, productiemigratie, live Google-/Vercelkoppeling, echte mailverzending of Cloudflare-deployment uitgevoerd.

## Wat er staat

- `/hub/login`, uitnodiging, e-mailbevestiging, wachtwoordherstel, uitloggen en optionele klant-MFA. Beheer vereist een bevestigde tweede factor in de huidige sessie.
- `/hub`: uitsluitend toegewezen klantwebsites. `/hub/site/[siteId]` met bezoekers, Google, status, werkzaamheden en SEO-context.
- `/hub/admin`: klantwebsite, uitnodiging, toegang intrekken, werklog bewerken, maandrapport, broninstellingen en handmatig verversen. Beheerpreview wordt onder de eigen identiteit gelogd.
- GA4-, Search Console- en Vercel Deployments-adapters met snapshots, afzonderlijke foutstatus en datum/tijdzone. Het dashboard vraagt bij openen geen nieuwe providerdata op.
- HMAC-ingest, persistente replaybescherming en incidentanalyse voor een afzonderlijke vijfminuten-uptimeworker. Een tweede, optionele worker start één begrensde bronverversing per uur.
- Publieke dienstpagina `/diensten/website-monitoring`, eigen OG, interne verwijzingen, metadata en Service-schema. Geen verzonnen maandtarief.

Dit is geen scanaccount, uitgebreide crawler, automatische reparatiedienst of abonnementenfacturatiesysteem. Vercel Web Analytics is niet aangesloten; Vercel Deployments wel als adapter beschikbaar.

## Lokale inrichting

Werk vanuit `site`, met Node 24:

```text
node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs scripts/hub-admin.mjs init-local
```

Dit maakt alleen de afzonderlijke `.sites-runtime/storage/hub.sqlite` en genegeerde lokale secretconfiguratie aan. Het bestaande contact-/toolbestand wordt niet vervangen. Auth-tabellen komen uit de gepinde Better Auth-migraties; Hub-tabellen zijn aanvullend. Herstart na eerste initialisatie de lokale preview. Deze fallback werkt nooit op Vercel.

De browserproeven gebruikten uitsluitend tijdelijke `@example.test`-accounts en gelabelde fictieve taken. Deze fixtures zijn geen onderdeel van de site of productie-inrichting. Maak echte accounts pas met een werkelijk werkende mailroute aan.

## Productievoorwaarden — nog niet uitgevoerd

1. Kies/verifieer het bestaande PostgreSQL-project en maak eerst een herstelbare backup of testbranch. Controleer toegangsrechten en het werkelijke hostingplan. Gratis Cloudflare-onderdelen maken andere diensten niet automatisch gratis.
2. Zet `DATABASE_URL`, een onafhankelijke willekeurige `HUB_AUTH_SECRET` (minstens 32 tekens), `HUB_AUTH_URL=https://www.sitesnit.nl` en uiteindelijk `HUB_ENABLED=true` in servergeheimen. Geen `NEXT_PUBLIC_`-namen. Het bestaande domein is niet gewijzigd.
3. `scripts/hub-admin.mjs plan-production --production` maakt met de expliciet ingestelde productievariabelen alleen een SQL-voorstel in `.sites-runtime/hub-migration-review.sql`. Het leest de database om het verschil te bepalen. Controleer het voorstel, voer het eerst op een testbranch uit en test opnieuw. Het script voert geen productiemigratie uit. Een echte migratie blijft een aparte, nog niet geautoriseerde actie.
4. Verifieer je afzenderdomein bij de gekozen mailprovider. De adapter is ingericht voor Resend met `RESEND_API_KEY`, `HUB_EMAIL_FROM` en `HUB_EMAIL_ENABLED=true`. Er wordt zonder deze combinatie niets verzonden. De lokale app reserveert maximaal 90 berichten per UTC-dag en 2.800 per maand; fouten verbruiken ook reservering. Dit is een eigen hardstop onder de onderzochte Free-limieten, geen garantie over de actuele accountkosten of aflevering.
5. Maak de eerste echte beheeruitnodiging uitsluitend via `scripts/hub-admin.mjs bootstrap-admin --production --email=<bevestigd-e-mailadres>`. Alleen mogelijk als nog geen beheerder bestaat. De link wordt lokaal in een genegeerd bestand bewaard, niet gelogd of automatisch verstuurd. Open hem zelf, bevestig e-mail en stel een authenticator in. Bewaar herstelcodes veilig. Het echte beheerdersadres is nog niet aangeleverd.

## Bronnen aansluiten

Maak via beheer eerst het klantdossier. Geef alleen de juiste mensen toegang. De secretresolver vereist per credential een expliciete lijst `allowedSites` met interne Hub-site-IDs.

`HUB_PROVIDER_CREDENTIALS` is uitsluitend een servervariabele met de structuur uit [hub-integrations.md](hub-integrations.md). Geheimen horen daar, niet in beheerformulieren, screenshots, chat of Git. Het beheerformulier bewaart alleen een credentialreferentie en property-/project-ID.

| Bron | Nog nodig | Controle na aansluiten |
| --- | --- | --- |
| GA4 | serviceaccount met leesrechten op de juiste property; Data API ingeschakeld; property-ID | Vergelijk uniek periodetotaal, kanaal/apparaat, dagreeks en events met dezelfde periode/tijdzone. |
| Search Console | bevoegde propertytoegang voor serviceaccount; exact property-ID | Vergelijk klikken/vertoningen, zoekvragen en pagina’s; toprijen zijn geen totaaltelling. |
| Vercel | beperkt team-/projecttoken en project-ID | Alleen productiedeployments van de gekozen site. Geen logs, privé-URLs of tokens naar de klant. |

Gebruik daarna ‘Gegevens ophalen’. Ontbrekende bronnen blijven onbekend. Bronlimieten blijven gelden. Gewijzigde configuratie en ingetrokken credentials mogen geen oude cijfers onder een nieuwe toewijzing laten zien. Een oude in-flight sync wordt daarom ook bij lezen op configuratiefingerprint gecontroleerd.

Publieke tool- en knopgebeurtenissen op Sitesnit starten alleen na expliciete analytics-toestemming en correcte GA4-configuratie. Er worden vaste eventnamen en identifiers gebruikt, geen antwoorden, ingevoerde URLs, e-mailadressen, URL-queries of Hub-gegevens. Klantsites hebben hun eigen meetinrichting nodig. Een klik is geen ontvangen aanvraag.

## Gratis workercomponenten

Beide configuraties staan uit en gebruiken de bestaande Wrangler-versie. Geen DNS-omzetting nodig om ze later afzonderlijk te deployen. Deployment en echte secrets zijn niet uitgevoerd.

- [Uptimeworker](hub-uptime.md): maximaal vijf vooraf beoordeelde canonieke HTTPS-origins. `UPTIME_INGEST_URL=https://www.sitesnit.nl/api/hub/uptime`; dezelfde onafhankelijke signing-secret in worker `UPTIME_INGEST_SECRET` en Vercel `HUB_UPTIME_SECRET`. Vijfminutencron, geen redirects/browser, onbekende/blokkerende responses als onbekend. De eerste 48 uur meetdekking en Free-CPU verifiëren vóór een meetbelofte.
- [Syncworker](hub-sync-worker.md): vaste `/api/hub/sync`; gelijke onafhankelijke `HUB_SYNC_SECRET` aan beide kanten. Eén site per uur, met eerlijke selectie op vorige poging. Bij vijf sites betekent dit ongeveer één geplande beurt per vijf uur, niet vijfminutenverversing van alle statistieken. Handmatige verversing blijft beschikbaar binnen provider-TTLs.

De publieke willekeurige browseraudit blijft uit. [Capaciteitsonderzoek](gratis-audit-capaciteit.md) beschrijft de kleine mogelijke Free-pilot en de nog onbewezen netwerkisolatie. Er is geen complete audit/wekelijkse-mailfunctie beloofd of ingeschakeld.

## Beveiliging, bewaren en beheer

Privé-Hub/API-routes krijgen `noindex, nofollow` en `private, no-store`. Iedere pagina en mutatie controleert zelf de rechten. Een website verifiëren of gratis tool gebruiken geeft nooit Hub-toegang. Beheerrechten steunen op actuele sessie, e-mailbevestiging, MFA-bewijs en beheerrol; niet alleen op een profielvlag.

HTTP-uptimemetingen ouder dan 90 dagen en replay-IDs ouder dan één dag worden tijdens ingest verwijderd. Authverval is geen automatische verwijdering van alle databaserijen. Zie [privacy-inrichtingspunten](hub-privacy-check.md) voor dossierverwijdering, logretentie en verwerkersafspraken vóór ingebruikname.

Een klant krijgt alleen overeengekomen werk en een vastgelegde maandterugblik. ‘Afgerond’ vereist een toelichting op de hercontrole. Er zijn geen onbeperkte reparaties, rankings, exacte uitvalminuten of SLA’s ingevoerd. Maandbedrag en concrete dienstvoorwaarden worden nog door Kay vastgesteld.

## Verificatie

Geautomatiseerde fixtures gebruiken Node 24, SQLite en geïnjecteerde providerresponses. De productiebuild is lokaal uitgevoerd. Browserproeven gebruiken emulatie op 360/390/768/1440/1920 pixels; geen echte telefoon. Actuele aantallen en details staan in `docs/hub-verificatie-2026-09-24.md`.

Nog noodzakelijk voor echte ingebruikname: PostgreSQL-migratie testen, HTTPS-auth op de definitieve host, echte mailaflevering, alle drie providervergelijkingen, Cloudflare-account/limieten en continue monitorproef. Een lokale groene test vervangt die controles niet.
