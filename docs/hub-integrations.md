# Hub-integraties: serverconfiguratie en snapshots

`lib/hub/integrations.ts` verbindt de drie providers met een injecteerbare server-secretresolver en snapshotopslag. De module maakt geen accounts, infrastructuur, databaseverbinding, scheduler of browserendpoint aan. Er zijn uitsluitend offline fixtures gebruikt; echte GA4-, Search Console- en Vercel-credentials zijn nog nodig voor een livevalidatie.

## Servercontract

`syncSiteProviders({siteId, configs, store, deps})` ontvangt uitsluitend configuraties uit de serverdatabase, nadat de aanroepende serverlaag rechten heeft gecontroleerd. Nooit rechtstreeks `configs`, property/project of credentialRef uit een klantrequest doorgeven.

```ts
const configs = rows.map(row => parseIntegrationConfig(row.site_id, row.provider, row.config_json));
const snapshots = await syncSiteProviders({ siteId, configs, store, deps });
```

Een DB-configuratie is bijvoorbeeld `{ "credentialRef": "google-klant-a", "propertyId": "123456789" }`. Voor GSC is de eigenschap `siteUrl` (`sc-domain:example.nl` of de precieze URL-prefixproperty); voor Vercel `projectId` en optioneel `teamId`. `enabled:false` schakelt een integratie uit. Optioneel kan een expliciete `{startDate,endDate}`-periode worden ingesteld. Andere instellingen, inline tokens en geheime sleutels worden geweigerd.

Zonder expliciete periode worden 28 dagen opgevraagd met twee dagen vertraging. De datums zijn periode-labels; elke bron interpreteert die in de gerapporteerde tijdzone. GSC kan ook dan nog vertraging hebben: de UI moet dit blijven vermelden. De integratie telt bronnen of daggebruikers nooit op.

## Credentials

De aanroepende laag leest één serveromgevingvariabele en geeft de inhoud aan `createEnvCredentialResolver(json)`. Deze module leest geen environmentvariabelen zelf. Voorbeeldstructuur, uitsluitend placeholders:

```json
{
  "google-klant-a": {
    "kind": "google-service-account",
    "allowedSites": ["hub-site-id"],
    "clientEmail": "service-account@project.iam.gserviceaccount.com",
    "privateKey": "<server-side Google PEM private key>",
    "privateKeyId": "<key-id>"
  },
  "vercel-klant-a": {
    "kind": "vercel-token",
    "allowedSites": ["hub-site-id"],
    "token": "<server-side Vercel access token>"
  }
}
```

De secretresolver vereist een expliciete match van referentie én site-ID. Gebruik geen `NEXT_PUBLIC_`-variabele. Databaseconfiguraties bevatten alleen de referentie. Geheimen, JWT-asserties en tokens worden niet in snapshots, errors of logs gezet. Verwijdering van een secretreferentie maakt bestaande data bij de volgende sync onbeschikbaar. Lidmaatschapscontrole moet ook bij het lezen van snapshots plaatsvinden; een achtergrondcontrole vervangt die niet.

Google gebruikt het gedocumenteerde service-account JWT-bearerproces: RS256 met een RSA-sleutel van minstens 2048 bits, vaste Google-tokenendpoint, vijf minuten geldige assertie, geen impersonatie. GA4 vraagt alleen `analytics.readonly`; GSC alleen `webmasters.readonly`. Het serviceaccount moet daarnaast expliciet toegang krijgen tot de juiste property. Tokenhergebruik is maximaal vijf minuten en eindigt minimaal één minuut vóór providerverval. Parallelle tokenaanvragen worden binnen één resolverinstantie samengevoegd. Hergebruik `createGoogleTokenResolver(deps)` in de serverlaag via `deps.googleTokens` om deze korte cache tussen syncs te behouden. Er is geen dependency toegevoegd.

Google adviseert in het algemeen zijn onderhouden authbibliotheek. Hier is de beperkte gedocumenteerde HTTP-variant geïmplementeerd met Node crypto; fixtures verifiëren de werkelijke RSA-handtekening, audience, scope en vervaltijd. Dit is **geen** gebruikerslogin, OAuth-consentflow of algemeen tokenendpoint. Bij uitbreiding naar gedelegeerde OAuth-authenticatie een officiële bibliotheek gebruiken.

## Opslag en lock

`IntegrationStore` vereist:

- `read(siteId, provider)`: opgeslagen envelope of null.
- `write(snapshot)`: atomair opslaan per site/provider.
- `withLock(siteId, provider, work)`: exclusieve, procesoverstijgende lock rond read, verversing en write; altijd vrijgeven bij fouten. Gebruik bijvoorbeeld PostgreSQL advisory locking op dezelfde vastgehouden connectie. Een lokale JS-Map is uitsluitend een testfixture.

Een snapshot heeft `siteId`, `provider`, `configFingerprint`, `period`, `attemptedAt`, `nextAttemptAt`, `reports`, `staleReports` en `refreshCodes`. De fingerprint bindt site, provider, instellingen en periode. Verandert een property/project of periode, dan worden oude cijfers nooit als fallback voor de nieuwe configuratie gebruikt.

Rapporten hebben afzonderlijk hun originele `fetchedAt`, bron, tijdzone, status en data. Bij een technische providerfout blijft een eerder succesvol rapport beschikbaar met zijn oude timestamp en een marker in `staleReports`. Bij geweigerde authenticatie, uitgeschakelde integratie of ontbrekend geheim blijft geen oude ready-status zichtbaar. Een lege succesvolle bronrespons wordt als geen gegevens gepresenteerd, nooit geconstrueerd als nul.

Start-TTL: GA4 één uur, GSC één dag, deployments vijf minuten. Configureerbaar via `deps.ttlMs`, minimaal één minuut. Mislukte syncs hebben een terugvalinterval van maximaal vijf minuten om herhaalde refreshes te beperken. De lock leest de snapshot opnieuw: gelijktijdige jobs doen daardoor geen dubbel providerwerk. De Hub-UI leest opgeslagen snapshots; de aanroep van deze synchronisatie hoort bij een beschermde beheeractie of ingerichte scheduler.

Elke provider wordt onafhankelijk verwerkt. Een fout in provider of opslag wordt beperkt weergegeven zonder ruwe exception. De opslaglaag moet operationele fouten intern via een eigen veilige errorcode kunnen signaleren. Er wordt niet beweerd dat een mislukte write toch is opgeslagen.

## Testen en nog aansluiten

Offline testcommando: `node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs --test tests/hub-integrations.test.mjs tests/hub-providers.test.mjs`.

De integrerende serverlaag is op 24 september lokaal toegevoegd: geautoriseerde configuratielading, SQL-snapshotopslag met lease, server-secretconfiguratie, beschermde sync-trigger, optionele disabled scheduler en zichtbare stale/onbeschikbare UI-statussen. De dashboardread controleert de actuele configuratiefingerprint en credentialtoewijzing opnieuw. Zie `setup-hub-integrations.md`. Geen live providercontrole uitgevoerd.

Officiële bron: [Google OAuth 2.0 voor serviceaccounts](https://developers.google.com/identity/protocols/oauth2/service-account), geraadpleegd 24 september 2026. Providerbetekenis en API-bronnen staan in `hub-providers.md`.
