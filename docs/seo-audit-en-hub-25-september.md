# De afzonderlijke SEO-audit en de Hub

## Verbeterde opdracht

Bouw naast de bestaande websitecheck een zelfstandige, begrensde SEO-crawler. Alleen een openbaar websiteadres is nodig. Toon per onderzochte pagina aantoonbare problemen, hun prioriteit, het ontvangen bewijs en een concrete vervolgstap. Scheid technische waarnemingen van handmatige beoordeling en vermeld wat niet is onderzocht. Maak zes inhoudelijk verschillende uitlegpagina’s met eigen metadata, canonicals, schema, afbeeldingen en een rustige visuele opbouw. Maak ze vindbaar vanuit het tooloverzicht. Houd de gratis limieten expliciet.

Verduidelijk de Hub met bezoekersgrafieken, bron/medium zoals Google en Instagram, unieke maandtotalen en vergelijking van twee afgesloten maanden. Toon Sitesnit herkenbaar als eigen dossier en als afzonderlijk gelabelde demo. Vul niet-gekoppelde echte bronnen nooit met fictieve cijfers. Test crawlerveiligheid, limieten, metadata, contactoverdracht, Hub-tabbladen en mobiele bediening. Publiceer niet automatisch.

## Welke tool bedoelen we?

**SEO-audit:** `/tools/seo-audit`. Dit is de nieuwe HTML-crawler, zonder vragenlijst en zonder Google API-key. Hij bezoekt maximaal twintig URL’s via interne links, op één origin. Robots.txt wordt gerespecteerd. Een crawl heeft een beperkt tijd-/bytebudget, volgt geen bestanden, privé-routes, query-URLs of nofollow-links en voert geen JavaScript uit. Het resultaat geeft onder meer HTTP-fouten, noindex, canonicals, titels/descriptions, duplicaten binnen de steekproef, ontbrekende alt-attributen, JSON-LD-syntaxisfouten en gevonden interne verwijzingen naar een 404/410.

**Websitecheck:** `/tools/website-check`. Dit is de bestaande vijftienvragenroute plus één Lighthouse-meting. Daarvoor is wél `PAGESPEED_API_KEY` nodig. De oude handleiding beschreef deze route, terwijl Kay met SEO-tool de nieuwe crawler bedoelde.

De nieuwe audit is geen volledige Sitechecker-kopie. Hij heeft geen zoekwoordtracking, backlinkindex, browserrendering, sitebrede Lighthouse-metingen, automatische reparaties of wekelijkse e-mailrapporten. Geen verzonnen score of claim dat alle problemen zijn gevonden.

## Nieuwe SEO-audit online zetten

1. Gebruik de bestaande Vercel-app en PostgreSQL-database. De bestaande `rate_limits`-tabel is vereist; controleer vóór een eventuele migratie de aanwezige tabellen en backup. Er is voor deze crawler geen nieuwe databasekolom nodig.
2. Zet een onafhankelijke, sterke `RATE_LIMIT_SECRET` als servervariabele in Production. `DATABASE_URL` moet naar de juiste database wijzen. Geen `NEXT_PUBLIC_`-prefix; geen sleutels in Git.
3. Zet `SEO_AUDIT_ENABLED=true` in Vercel wanneer je de begrensde crawler wilt activeren. Zonder deze vlag blijft hij in productie uit. Lokaal is de crawler beschikbaar.
4. Publiceer de nieuwe code en maak een nieuwe deployment nadat variabelen zijn gewijzigd. Dit is nog niet uitgevoerd.
5. Scan een toegestane openbare website. Controleer dat het rapport echte URL’s, datum en bewijs bevat. Een tweede poging op hetzelfde netwerk op dezelfde UTC-dag moet 429 geven. Controleer daarna usage en logs in Vercel voordat je het dagbudget verhoogt.

Geen Cloudflare-account, aparte worker of betaalde scandienst nodig voor deze beperkte HTML-versie. Het gebruikt wel de bestaande Vercel-/databasecapaciteit: dat is geen garantie dat het volledige hostingaccount gratis blijft. Controleer het eigen plan en gebruik. Er is geen automatisch betaalde fallback.

Limieten: één poging per netwerk per UTC-dag (reset 00:00 UTC), maximaal 25 pogingen per dag voor de hele installatie, maximaal twintig URL’s per audit. Een foutpoging telt mee om herhaald misbruik te begrenzen. Mensen op dezelfde wifi delen de limiet; wisselen van netwerk kan een persoon opnieuw toelaten. Zonder identiteit/account is “één per persoon” niet betrouwbaar afdwingbaar. Er wordt geen trackingcookie geplaatst.

## Waar staan de pagina’s?

Alle zes tools staan op `/tools` en in Tools & checks in het menu. Onder “Meer uitleg bij iedere tool” staan uitklapbare lijsten met de bestaande achttien uitlegartikelen en de zes nieuwe auditartikelen:

- `/tools/seo-audit/indexering-controleren`
- `/tools/seo-audit/interne-links-controleren`
- `/tools/seo-audit/canonical-controleren`
- `/tools/seo-audit/dubbele-metadata`
- `/tools/seo-audit/afbeeldingen-en-alttekst`
- `/tools/seo-audit/rapport-naar-actie`

Deze zes pagina’s leggen de ontvangen auditbevindingen uit. Bestaande bredere artikelen over bijvoorbeeld niet gevonden worden in Google en migraties blijven afzonderlijk en worden gericht gelinkt. Geen paginascore of minimumwoordenaantal geldt als bewijs van SEO-kwaliteit. Alle zeven nieuwe openbare routes staan in de publieke sitemap/catalogus en gebruiken de eigen www-canonical. Auditresultaten krijgen geen publieke rapport-URL.

## Hub bekijken

- `/hub/demo`: fictief voorbeeldbedrijf.
- `/hub/demo/sitesnit`: Sitesnit als duidelijk gelabelde fictieve demonstratie. Geen echte bezoekerscijfers.
- `/hub/login`: lokale oefenaccounts in `.sites-runtime/hub-demo-accounts.md`.
- `/hub/admin`: na login en authenticator-inrichting. Het eigen dossier **Sitesnit**, id `sitesnit-own`, is lokaal toegevoegd met `https://www.sitesnit.nl`. Er zijn geen providercredentials of fictieve meetwaarden aan dat echte dossier toegevoegd. Het is niet aan het oefenklantaccount toegewezen.

De Hub vraagt nu `sessionSourceMedium` op voor herkomst. Instagram verschijnt als GA4 die bron heeft vastgelegd; geen geforceerde toewijzing van onbekend verkeer. De daggrafiek toont gebruikers per dag. Het unieke totaal komt uit een afzonderlijk totaalrapport. Maandvergelijkingen gebruiken `yearMonth`-rapporten voor zes afgesloten kalendermaanden, met afzonderlijke gebruikers-/sessie-/weergavetotalen. Een nul als vergelijkingsbasis levert geen oneindige procentuele stijging op. Onbekende historie blijft onbekend. Providerconfiguratie en echte login op productie staan in `setup-hub-integrations.md`.

## Status technische problemen

Noindex/www-canonical en de eerdere CSP-aanpassing zijn lokaal opgelost, maar nog niet live. De echte crawl op 25 september onderzocht twintig live Sitesnit-pagina’s en vond daar nog noindex en non-www canonicals. Dit is dus een noodzakelijke publicatiestap, geen afgeronde live reparatie. Overige scannerheuristieken zoals verplichte GTM, tien interne backlinks of tekst/codeverhouding zijn niet blind geïmplementeerd.

Bronnen: [GA4-dimensies](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema), [robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro), [canonical-keuzes](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

## Uitgevoerde verificatie

- Definitieve Next.js-productiebuild geslaagd; gerichte ESLint-controle zonder meldingen.
- 132 geautomatiseerde tests geslaagd, inclusief veilige crawl, rate limits, bronintegraties en indexeringsbeleid.
- Lokale SEO-controle: 63 openbare routes en 4.377 links, nul meldingen binnen die controle. Productiehost-simulatie controleerde www-canonicals, index/follow en scriptnonces. Dit bewijst niet dat Google iedere pagina zal opnemen.
- Echte audit van www.sitesnit.nl: 20 pagina’s, ontvangen noindex/canonical-bevindingen zichtbaar in rapport en contactcontext. Tweede poging gaf de verwachte 429-daglimiet.
- Browsercontrole van audit, contactroute, zes uitlegpagina’s-template, uitklapbaar tooloverzicht en Hub-maandkeuze. Canonical-uitlegpagina gecontroleerd op 360, 390, 768, 1440 en 1920 pixels: geen horizontale overflow. Screenshots van desktop en mobiele weergave beoordeeld. Alleen browseremulatie, geen fysieke telefoon.
- Scrollovergangen gebruiken CSS view timelines met zichtbare statische fallback en reduced-motion-uitzondering; geen scroll hijacking.
- Laatste resultaatgroepering is door build/typechecks gedekt; niet opnieuw met een tweede volledige browsercrawl getest vanwege de daglimiet. De echte end-to-end-scan is vóór die presentatiewijziging getest.
- Preview draait op http://127.0.0.1:5184. Er is niet gepubliceerd, geen productiemigratie uitgevoerd en geen echte e-mail verzonden.
