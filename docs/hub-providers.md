# Hub provider-adapters

Implementatie: `lib/hub/providers`. Dit zijn echte HTTP-adapters met geïnjecteerde `fetch` en server-side tokenresolver. Er zijn geen live credentials gebruikt en er is geen werkende klantkoppeling geclaimd. Offline fixtures zijn expliciet synthetisch.

## Aansluiten

De server controleert eerst identiteit, Hub-lidmaatschap en siterechten. Daarna haalt hij de **vastgelegde** property/projectconfiguratie en credentials van die integratie op. Geef nooit een door de browser gekozen property/project samen met een algemeen accounttoken door. Modules horen uitsluitend in servercode; importeer ze niet uit clientcomponenten.

```ts
const deps = { fetch, getAccessToken: async () => /* tenantgebonden secretresolver */ null };
const ga4 = await fetchGa4({ propertyId: "123456789", period: { startDate: "2026-08-01", endDate: "2026-08-31" } }, deps);
```

`fetchGa4`, `fetchSearchConsole` en `fetchVercelDeployments` doen alleen leesaanvragen. De Google APIs gebruiken POST als rapportquery, niet als wijziging. Requests volgen geen redirects; tokens komen uitsluitend in de Authorization-header. Netwerk-, authenticatie-, quotum- en responsefouten leveren een beperkte foutcode op, nooit de providertekst, exception, URL of token.

Alle deelresultaten bevatten `state`, `source`, `period`, `timeZone`, `fetchedAt`, `data` en `warnings`. `unavailable` betekent geen geconfigureerde koppeling of geen gegevens; de UI mag dat niet als nul tonen. `error` betekent een mislukte query. Een succesvolle nulmeting blijft wel nul. Iedere rapportquery heeft een eigen status zodat een mislukte uitsplitsing bruikbare totalen niet uitwist.

## Betekenis

- GA4: aparte query zonder dimensies voor periode-totalen; `totalUsers` nooit over dagen optellen. Dag-, kanaal-, landingspagina-, apparaat-, land- en eventrapporten blijven afzonderlijk. Google bepaalt de unieke gebruikers. Landrapport is geaggregeerd, zonder persoonsinformatie. Events zijn strikt beperkt tot `tool_start`, `tool_complete` en `cta_click`; geen claims over niet-gemeten gebeurtenissen. Labels voor tool/knop zijn nog geen ingerichte custom dimensions.
- GA4: tijdzone komt uit responsemetadata. Drempels, steekproeven, samengevoegde rijen, truncatie en beperkingen komen als waarschuwing mee. Ontbrekende dagen worden niet aangevuld als nul. Topuitsplitsingen maximaal 50 rijen; dagen maximaal 400. De response meldt afkapping.
- Search Console: `web`, definitieve data, tijdzone `America/Los_Angeles`. Totalen en dag/zoekvraaguitsplitsingen gebruiken `byProperty`; pagina's gebruiken `byPage`. Zoekvraag- en paginarijen zijn toprijen, geen volledige dataset. CTR volgt klikken/vertoningen van dezelfde rij. Gemiddelde positie blijft het door Google gewogen cijfer van de afzonderlijke totaalquery; nooit een gemiddelde van toprijen. Nul vertoningen levert geen betekenisvolle CTR/positie op. Geen gegarandeerde ranking of volledige recente dekking suggereren.
- Vercel: officiële `/v7/deployments`, één project, productie, maximaal tien laatste deployments. Team-ID alleen wanneer ingesteld. Alleen id, status, aanmaaktijd, gereedtijd en omgeving worden doorgegeven; geen buildlogs, env, auteursgegevens of preview-URLs. Deployments zijn **geen uptimebewijs**. Dit is de laatst bekende productiedeployment, niet een garantie dat die nog aan ieder domein hangt.

## Cache en verversing

Startwaarden: GA4 één uur, GSC één dag, Vercel vijf minuten. Dit zijn configureerbare ontwerpkeuzes, geen providervoorwaarden. `readSnapshot` krijgt een opslagadapter; `snapshotKey` neemt tenant, site, integration, rapport en periode op. Ververs alleen via een beheer-/synclaag met distributed locking. Een Hub-pagina leest snapshots en mag niet bij elke bezoeker alle providers ophalen.

Bij mislukte verversing blijft een eerder geldig snapshot beschikbaar met `stale: true`, oorspronkelijke `fetchedAt` en beperkte refreshcode. De UI moet die status zichtbaar maken. Een ingetrokken integratie of verwijderd lidmaatschap moet vóór snapshottoegang worden afgewezen; cache is geen autorisatie. Deze module maakt zelf geen scheduler, database of locks aan.

## Rechten, configuratie en nog uit te voeren livecheck

Google GA4 OAuth-scope: `https://www.googleapis.com/auth/analytics.readonly`; een serviceaccount heeft minimaal leesrechten op de toegewezen property nodig. GSC OAuth-scope: `https://www.googleapis.com/auth/webmasters.readonly`. Serverauth/tokenverversing en veilige opslag worden door de Hub-integratielaag geleverd. Vercel-token heeft alleen toegang nodig tot het gekozen project/team voor deployments. Vercel Web Analytics is hier niet geïmplementeerd en mag niet als aangesloten worden getoond.

Na echte toestemming/credentials: test iedere gekoppelde property, vergelijk dezelfde periode/tijdzone met de bron en controleer beperkte rechten, verlopen tokens, quota, geen data, privacydrempels en stale snapshots. Die livecontrole is nog niet uitgevoerd.

## Verificatie en bronnen

Offline: `node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs --test tests/hub-providers.test.mjs`.

Geraadpleegde officiële documentatie op 22 september 2026:

- [GA4 runReport](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport)
- [GA4 responsemetadata](https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/ResponseMetaData)
- [GA4 rapporten en optionele dimensies](https://developers.google.com/analytics/devguides/reporting/data/v1/basics)
- [Search Console query en aggregatie](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)
- [Vercel deployments endpoint](https://vercel.com/docs/rest-api/deployments/list-deployments)
