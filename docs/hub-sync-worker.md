# Optionele Hub-syncworker

De afzonderlijke Cloudflare Worker in `workers/hub-sync` roept maximaal één keer per uur de vaste URL `https://www.sitesnit.nl/api/hub/sync` aan. Hij staat standaard uit (`HUB_SYNC_ENABLED=false`) en is niet gedeployd. Er is geen publiek Workers.dev-adres, previewadres, route of HTTP-trigger ingesteld. Handmatige HTTP-verzoeken geven 404.

De worker bevat geen Google-, Vercel- of databasecredentials en ontvangt geen te scannen URLs. Alleen `HUB_SYNC_SECRET` gaat als bearerheader naar de vaste Sitesnit-endpoint. Redirects worden geweigerd; na 55 seconden stopt de request. Antwoorden zijn begrensd op 8 KiB. Er zijn geen automatische retries. Logs bevatten alleen uit/afgehandeld en aantal behandelde sites, nooit klantnamen, tokens of brondata.

De endpoint behandelt één site per run en kiest via een afzonderlijke server-side pogingentabel welke site het langst niet aan bod kwam. De worker kiest geen site. Bij meerdere sites komt elke site daarom minder vaak dan ieder uur aan bod; de Hub toont steeds de echte bron- en ophaaltijden. Provider-TTLs zijn cachegrenzen, geen beloofde synchronisatiefrequentie. Een afgehandelde syncaanvraag betekent niet dat alle bronnen gekoppeld of bereikbaar waren: de snapshots bevatten daarvoor afzonderlijke statussen.

## Eerst inrichten, daarna pas activeren

Controleer vóór activering de ingelogde Cloudflare-account en het Free-plan, de beschikbaarheid van Cron Triggers en de gebruikslimieten. Deze worker doet ongeveer 24 verzoeken per dag; Google API-, Vercel- en databasediensten houden hun eigen toegangs- en planlimieten. Er wordt geen betaald abonnement of betaalde overschrijding geactiveerd.

De beheerder zet dezelfde willekeurige secret van minstens 32 tekens in Vercel `HUB_SYNC_SECRET` en de Cloudflare secretbinding. Gebruik een geheimenbeheerder; deel de waarde niet in chat, logs of configuratiebestanden. `wrangler secret put HUB_SYNC_SECRET --config workers/hub-sync/wrangler.jsonc` en deployment zijn afzonderlijke beheerhandelingen die nog niet zijn uitgevoerd. De source bevat uitsluitend `.dev.vars.example`; echte `.dev.vars` en lokale Wranglerstate zijn genegeerd.

De optionele cron staat op minuut 15 van ieder uur (UTC). Houd `HUB_SYNC_ENABLED=false` totdat de productie-endpoint, database, Hub-configuratie en beperkte credentials getest zijn. Daarna kan de beheerder bewust activeren. Geen extern verzoek is tijdens deze implementatie uitgevoerd.

## Verificatie

Offline fixtures: `node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs --test tests/hub-sync-worker.test.mjs`. Tests controleren disabled/public404, vaste endpoint, redirectweigering, timeoutinstelling, secretvalidatie, responsegrens, fouten en hourlyconfiguratie. Typebinding wordt door de geïnstalleerde Wrangler gegenereerd; geen runtime-app aangepast.

Officiële bronnen, geraadpleegd 24 september 2026: [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/), [Scheduled Handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/scheduled/), [Workers best practices](https://developers.cloudflare.com/workers/best-practices/workers-best-practices/).
