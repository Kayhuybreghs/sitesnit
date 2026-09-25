# Indexering, websitecheck en Hub — 24 september 2026

**Correctie 25 september:** met SEO-tool bedoelt Kay de afzonderlijke crawler, niet de vijftienvragencheck. Die crawler is nu apart gebouwd. Gebruik voor de actuele inrichting [SEO-audit en Hub](seo-audit-en-hub-25-september.md). De PageSpeed-stappen hieronder gelden uitsluitend voor de bestaande websitecheck.

## Wat dringend was

De live homepage redirect naar www, maar gaf `noindex, follow` en een canonical zonder www. De oude hostcontrole accepteerde alleen sitesnit.nl. De nieuwe hoofd-URL is https://www.sitesnit.nl. Alle 56 openbare routes zijn in de lokale productie-simulatie gecontroleerd op HTTP 200, index/follow, de eigen www-canonical en noncebeveiliging. Hub, accounts, API en previews blijven noindex. Indexeerbaar betekent niet dat Google iedere pagina daadwerkelijk opneemt.

De wijzigingen zijn lokaal gebouwd; nog niet gepubliceerd. Pas na publicatie opnieuw Sitechecker draaien en https://www.sitesnit.nl/sitemap.xml in Search Console indienen. Controleer eerst live de HTML én X-Robots-Tag. Een oude audit verdwijnt niet vanzelf.

Verder aangepast: Content Security Policy met unieke scriptnonces, uitgesteld footerlogo en enkele te algemene/omslachtige metadescriptions. Twitter-metadata was al compleet. Decoratieve afbeeldingen mogen een lege alttekst hebben. Geen kunstmatige links, tekstvulling, Google Tag Manager of sociale accounts toegevoegd voor scannerscores. Een vaste minimale hoeveelheid backlinks, tekst/codeverhouding en tags binnen een heading zijn geen zelfstandige reden om goed werkende inhoud te veranderen.

## Bestaande websitecheck online krijgen

Dit betreft `/tools/website-check`: 15 vragen en een echte mobiele Google Lighthouse-analyse. De aparte uitgebreide crawler met scanaccounts en weekmails is niet opgeleverd en wordt hiermee niet geactiveerd.

1. Activeer PageSpeed Insights API in het Google Cloud-project van de sleutel. Beperk de sleutel tot deze API, bewaar hem uitsluitend op de server en controleer het quota.
2. Voeg in Vercel → Sitesnit → Settings → Environment Variables voor Production `PAGESPEED_API_KEY`, `DATABASE_URL` en een onafhankelijke willekeurige `RATE_LIMIT_SECRET` toe. Voor de bestaande opschoontaak ook `CRON_SECRET`. Zet geen lokale SQLite-instelling aan op Vercel.
3. De PostgreSQL-database moet de publieke tabellen uit `db/postgres/0001_sitesnit.sql` bevatten, inclusief rate limiting. Controleer bestaande tabellen en backup vóór `npm run db:migrate`. Deze productiemigratie is niet uitgevoerd.
4. Publiceer de geteste code en herdeploy na wijzigingen aan productievariabelen. Een sleutel alleen in `.env.local` werkt niet op Vercel.
5. Doorloop op de live website de 15 vragen, geef een echte publieke URL op en controleer de vier categorieën, auditbevindingen, onderzochte URL en meetdatum. Test ook een fout en opnieuw proberen. De lokale logische tests gebruiken opgeslagen echte auditgegevens; zij bewijzen geen actuele productieverbinding.

Contactopslag en daadwerkelijke e-mailaflevering zijn afzonderlijke onderdelen. Zonder mailprovider geen verzonden bericht claimen.

## Hub bekijken en inloggen

- Gevulde demonstratie: http://127.0.0.1:5184/hub/demo. Alle cijfers, taken en metingen zijn nadrukkelijk fictief. Geen externe providers of echte klantdata.
- Lokale login: http://127.0.0.1:5184/hub/login.
- Lokale beheerroute: http://127.0.0.1:5184/hub/admin.
- Twee lokale oefenaccounts staan in `.sites-runtime/hub-demo-accounts.md`: klant en beheerder. Dit bestand en de lokale database zijn uitgesloten van Git en Vercel. De beheerder stelt zelf een authenticator in; de beveiliging is niet omzeild.
- De ingelogde oefenklant heeft één fictief dossier met een oefentaak. Ongekoppelde bronnen blijven daar eerlijk onbekend. Voor gevulde voorbeeldcijfers gebruik je de aparte demo.

Voor echte productieaccounts volg je [Hub-inrichting](setup-hub-integrations.md): PostgreSQL/Hub-tabellen, `HUB_ENABLED`, `HUB_AUTH_URL=https://www.sitesnit.nl`, `HUB_AUTH_SECRET`, Resend met geverifieerd afzenderdomein en een eerste beheeruitnodiging. Daarna zijn de routes https://www.sitesnit.nl/hub/login en https://www.sitesnit.nl/hub/admin. Er bestaat nog geen door ons ingericht echt productiebeheeraccount. GA4, Search Console, Vercel en uptime vereisen elk hun eigen bronconfiguratie.

## Getest

Productiebuild en gerichte ESLint-controle geslaagd. 126 geautomatiseerde tests geslaagd; aanvullende prijs-/vragen-/auditadvieslogica geslaagd. Alle 56 openbare routes gecontroleerd met de productiehost in een aparte lokale server; preview- en privégrenzen blijven dicht. Iedere gerenderde script-tag heeft de juiste CSP-nonce. Zie `reports/seo-production-index.json` en `reports/seo-index-tests.log`. Browsercontroles op de Hub-demo, tabnavigatie, cookie-instellingen en starten van de websitecheck; geen scriptfouten waargenomen. Mobiele controle is browseremulatie, geen fysieke telefoon. Geen productie-uitrol, e-mails of productiegegevens gewijzigd.

Bronnen: [Google over noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing), [Google over descriptions](https://developers.google.com/search/docs/appearance/snippet), [PageSpeed API](https://developers.google.com/speed/docs/insights/v5/get-started), [Vercel-variabelen en nieuwe deployments](https://vercel.com/docs/environment-variables).
