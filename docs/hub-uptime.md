# Afzonderlijke Hub-uptimecontrole

Status 24 september 2026: lokale implementatie met offline fixtures. Niet gedeployed; geen Cloudflare-resources of secrets aangemaakt, geen klantensites aangeroepen. De configuratie staat uit. Dit is HTTP-bereikbaarheidsmonitoring voor vooraf toegewezen Hub-sites, geen publieke crawler en geen browseraudit.

## Bestanden en grenzen

- `workers/uptime/index.ts`: afzonderlijke scheduled Worker; HTTP-verzoeken krijgen altijd 404. Geen URL uit querystring, body, cookie of header wordt opgehaald.
- `workers/uptime/protocol.ts`: wirecontract, vaste limieten, doelvalidatie en statusclassificatie.
- `workers/uptime/wrangler.jsonc`: één vijfminutencron, standaard uit, workers.dev en preview-URLs uit.
- `workers/uptime/worker-configuration.d.ts`: lokaal gegenereerde bindingtypes via Wrangler 4.92.0; voorbeeldsecret is uitsluitend een placeholder.
- `lib/hub/uptime.ts`: Node-serververificatie met `timingSafeEqual` en zuiver analysemodel.
- `tests/hub-uptime.test.mjs`: uitsluitend geïnjecteerde fetch-fixtures; geen externe meetrequests.

De beheerder configureert maximaal vijf unieke site-IDs met exacte canonieke HTTPS-origins, zonder trailing slash, pad, parameters, credentials of afwijkende poort. IP-literals, numerieke/alternatieve IP-notaties en lokale/reserved hostnamen worden geweigerd. Voorbeeld zonder echte klantgegevens:

```json
[{"siteId":"site-a","origin":"https://fixture.example.com"}]
```

Een domeinnaam kan later alsnog naar een private bestemming resolven. De syntaxisvalidatie bewijst geen DNS-rebindingbescherming. Dit component mag alleen door beheer ingerichte, beoordeelde klantorigins gebruiken en mag niet worden ontsloten als willekeurige URL-checker. Voor publieke onbetrouwbare doelen is een bewezen netwerkegressgrens nodig. Er worden geen browsercookies, klantcredentials of databasegeheimen aan doelhosts gestuurd.

## Meetgedrag

Iedere site krijgt één HEAD naar `/`, met `redirect:manual` en één totale deadline van tien seconden. Alleen bij 405/501 volgt één GET naar exact dezelfde URL, met een kleine Range-aanvraag. Responsebodies worden meteen geannuleerd, niet gebufferd of geparseerd. De server kan Range negeren; daarom claimen we geen harde bytegrens op reeds verzonden netwerkdata. De Worker leest geen HTML en houdt geen grote body in geheugen.

| Waarneming | Status |
|---|---|
| 2xx | `up`: de HTTP-probe slaagde |
| 404, 410, 5xx | `down`: deze HTTP-probe faalde |
| Redirect | `unknown/redirect`; bestemming wordt nooit gevolgd |
| 401, 403, 429, `cf-mitigated` | `unknown/blocked` |
| Deadline/netwerkfout | `unknown/timeout` of `unknown/network_error` |
| Andere response | `unknown/unexpected_status` |

Een 200 bewijst geen werkende checkout, inhoud of rendering. CAPTCHA zonder herkenbaar responsekenmerk kan niet betrouwbaar door deze eenvoudige probe worden herkend. Een blokkade is geen bewijs dat bezoekers de site niet kunnen bereiken. Onbekende oorzaakdetails worden niet in payloads of logs gekopieerd.

De vijf probes mogen parallel lopen. Maximaal tien doelrequests (vijf HEAD + vijf fallback-GET) plus één ingestrequest per tick. Geen automatische retry; ook de scheduled handler schakelt platformretry uit. Een mislukte ingest wordt als fout gerapporteerd, niet als opgeslagen meting. De volgende tick meet opnieuw; oude metingen worden niet verzonnen of alsnog met nieuwe timestamps opgevuld.

## Ondertekende serveringest

`UPTIME_INGEST_URL` is een vaste serverconfiguratie naar een eigen HTTPS `/api/...`-endpoint. Ingestredirects worden niet gevolgd. De signing-secret is minimaal 32 en maximaal 512 tekens en hoort in echte secretopslag; `.dev.vars.example` bevat alleen een niet-productieplaceholder.

Headers:

```text
x-sitesnit-timestamp: epoch-milliseconds
x-sitesnit-delivery: UUID-v4
x-sitesnit-signature: v1=<64 lowercase hex characters>
```

HMAC-SHA256 over deze exacte UTF-8 bytes:

```text
sitesnit-uptime-v1\n<TIMESTAMP>\n<DELIVERY_ID>\n<RAW_JSON_BODY>
```

Body:

```ts
type UptimeBatch = {
  version: 1;
  monitorId: string;
  samples: Array<{
    siteId: string;
    origin: string;
    scheduledAt: number; // UTC-slot, veelvoud van 300000 ms
    checkedAt: number;   // echt starttijdstip, epoch-ms
    status: 'up' | 'down' | 'unknown';
    httpStatus: number | null;
    latencyMs: number;
    errorCode: 'http_error' | 'redirect' | 'blocked' | 'timeout' | 'network_error' | 'unexpected_status' | null;
  }>;
};
```

De server leest maximaal 16.384 bytes, bewaart de exacte ruwe tekst en roept aan:

```ts
const delivery = verifyUptimeEnvelope({
  headers: request.headers,
  rawBody,
  secret: configuredSecret,
  allowedSites: serverConfiguredSites, // [{siteId, origin}], nooit uit requestbody
});
```

Dit verifieert HMAC in constante tijd, vijf minuten tijdspeling, UUID, batchgrootte, site/origin-toewijzing, meettijd en statusvorm. Selecteer zo nodig een monitorspecifieke sleutel/allowlist server-side en controleer `monitorId` tegen die configuratie. De verifier retourneert `{deliveryId,monitorId,samples}` en raakt zelf geen database aan.

**Verplichte endpointintegratie:** claim `deliveryId` via een UNIQUE-ledger en sla alle samples op in dezelfde database-transactie. Verwerp duplicaten of antwoord idempotent zonder nieuwe meetrij. Voeg ook UNIQUE `(site_id,scheduled_at)` toe, zodat een opnieuw gedispatchte cron met nieuwe delivery-ID geen extra steekproef vormt. Claim nooit eerst buiten de transactie: een fout tijdens opslag zou dan geldige herbezorging verliezen. Bewaar replay-IDs minimaal langer dan de toegestane signing-tijdspeling; één dag is een bruikbare ondergrens. Autoriseer toegewezen monitor/sitecombinaties opnieuw binnen de transactie. De verifier alleen levert geen persistente replaybescherming.

Ingestresponse: geen klantgegevens, geen volledige ontvangen body, `Cache-Control:no-store` en `X-Robots-Tag:noindex`. Houd raw requestbody en signing-secret uit logs. SQL-schema, route, toegang en persistente replaytests worden door de Hub-integratie geleverd; dit component mag niet zonder die laag live.

## Analyse en eerlijke dekking

`summarizeUptime(samples,{from,to,now?})` accepteert één site en onderzoekt UTC-vijfminutenslots in `[from,to)`. Voor liveweergave gebruik `to <= now - 60000`, zodat een lopende tick niet meteen een gemiste meting wordt. Historische vensters kunnen exact worden gekozen. Geen rij voor een verwacht slot betekent ontbrekende dekking; het is geen uptime of downtime.

De uitkomst bevat `expectedSlots`, `measuredSlots`, `missingSlots`, `unknownSlots`, `upSamples`, `downSamples`, `coveragePercent`, `measuredAvailabilityPercent`, `latestStatus` en `incidents`. `coveragePercent` telt aanwezige meetpogingen inclusief onbekende uitkomsten. `measuredAvailabilityPercent` is uitsluitend `up / (up + down)`, of null als beide ontbreken. Toon de onbekende en ontbrekende aantallen er altijd naast. Het percentage is geen tijdgewogen SLA en sluit onbesliste waarnemingen uit.

Eén down-slot geeft `suspected_down`. Twee direct opeenvolgende down-slots bevestigen een incident. Een gat of unknown tussen twee failures verhindert bevestiging. Het incident bewaart eerste waarneming, bevestiging en eerstvolgende geobserveerde recovery; geen gefingeerd exact begin of duur. Een gat/unknown tijdens een bevestigd incident zet `coverageInterrupted=true`. Als het laatste verwachte slot ontbreekt blijft `latestStatus=unknown`, ook wanneer vroeger alles goed was. Dubbele slots tellen eenmaal; tegenstrijdige samples leveren unknown. Voor tenantselectie moet de caller reeds geautoriseerde sitegegevens laden.

## Cloudflare Free: resource- en kostenvoorwaarden

Actuele documentatie noemt 10 ms CPU per Free-cron, 50 subrequests per uitvoering en zes gelijktijdige uitgaande verbindingen. Wachten op netwerk telt niet als CPU. De kleine vijf-sitesopzet blijft onder de genoemde aantallen, maar **10 ms CPU is nog niet gemeten**; parsing, HMAC, serialisatie en foutafhandeling tellen mee. De cron is een gewenste frequentie, geen gegarandeerde vijfminuten-SLA. [Workers-limieten](https://developers.cloudflare.com/workers/platform/limits/), [Scheduled-handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/).

Vijf sites leveren 1.440 geplande siteprobes/dag bij 288 ticks. HEAD-fallback kan het aantal doelrequests verdubbelen; elke tick kan één extra ingest doen. Bestaande accountbelasting, hostingsquota en databaseopslag blijven afzonderlijke grenzen. Houd Workers Free, verhoog geen plan automatisch en controleer p95/p99 CPU vóór activering. CPU-uitputting of ontbrekende ingest verschijnt als meetgat. Registreer en alarmeer onafhankelijk op monitorstilte; geen succesbericht bij afwezige metingen.

## Lokale controle en open punten

Uitgevoerd met Node 24, volledig offline:

```text
node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs --test tests/hub-uptime.test.mjs
```

De suite controleert signatures/tampering/verval, verkeerde tenant-origin, inputlimieten, lokale/IP-doelen, redirects, bodycancel, fallback, abortdeadline, geen retry, ontbrekende dekking, incidentbevestiging en disabled config. Exacte actuele testuitkomst hoort bij het opleverbericht.

Bindingtypes zijn gegenereerd met de bestaande gepinde Wrangler-installatie en het placeholderbestand. Ophalen van nieuwere npm-types was netwerkgeblokkeerd; er is geen dependency-upgrade gedaan. De officiële runtime-/best-practice-documentatie is gelezen. Een eerste Wrangler-call kon zijn log niet buiten de workspace schrijven; de type-uitvoer zelf is wel gegenereerd. Dit is geen mislukte productieactie, want er is niet gedeployed.

Serverintegratie is op 24 september lokaal gerealiseerd in `app/api/hub/uptime/route.ts` en `lib/hub/ingest.ts`. Atomische opslag, rollback/retry en persistente replay zijn met SQLite-fixtures getest. De dashboardlaag leest geautoriseerde meetreeksen en toont bevestigde incidenten met hun dekkingbeperkingen.

`not_run`: echte Worker-runtime, accounttoegang, 48-uurs meetdekking, Free CPU/quotumgrenzen, echte doelhost-/DNS-/WAF-afhandeling, productie-PostgreSQL en alarmering. Blijft uit totdat deze productiechecks gereed zijn. Benodigd bij latere expliciete activering: bevestigd Workers Free-account, vijf goedgekeurde origins met bijbehorende Hub-site-IDs, eigen ingest-URL, sterke afzonderlijke signing-secret en werkende persistente opslag. Vul echte secrets uitsluitend via de normale beheerprocedure in.
