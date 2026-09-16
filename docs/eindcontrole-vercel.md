# Sitesnit — eindcontrole en Vercel-overstap

Gecontroleerd op 15 september 2026. Build van deze audit: `-JRSHn_8J7kvAX5vEWCWN`. De latere sticky navigatie, compactere prijskaarten en omgekeerde btw-presentatie zijn afzonderlijk gecontroleerd op build `Z1srPOimHiVhwqlMOg8lT`; zie [navbar en prijzen — laatste controle](navbar-en-prijzen-controle.md). De lokale preview draait op http://127.0.0.1:5184 met `next start`. Dit document beschrijft de gecontroleerde code en lokale uitvoering; er is nog geen publieke Vercel-deployment of echte Neon-productiedatabase geverifieerd.

## Uitkomst

De code gebruikt native Next.js voor Vercel. De uitgevoerde functionele, SEO- en opslagcontroles slagen. Er zijn echte overstap- en mobiele fouten gevonden en hersteld. De resterende livegangpunten staan hieronder expliciet genoemd.

## Wat is aangepast

- De actieve Vinext/Cloudflare-runtime is vervangen door native Next.js, met Vercel-configuratie, Node 24, regio Frankfurt en PostgreSQL-opslag via Neon. De database wordt pas bij een werkelijk databaseverzoek gebruikt, niet bij het renderen van iedere pagina. Lokale SQLite is uitsluitend een expliciete previewoptie en wordt op Vercel geweigerd.
- Een fout in de controle van het aanvraagadres is opgelost: Next gebruikte intern `localhost` terwijl een geldige lokale aanvraag via `127.0.0.1` binnenkwam. De controle vergelijkt nu met de daadwerkelijke publieke Host; vreemde origins blijven geweigerd.
- Onbekende project- en dienstslugs krijgen een echte HTTP 404 met servergerenderde inhoud, navigatie en noindex. De eerdere Next-foutpagina voor deze slugs had vóór JavaScript geen bruikbare inhoud.
- De btw- en hostingteksten in de compacte pakketten staan op mobiel onder elkaar. De oude horizontale rij veroorzaakte overflow op Home en de Venlo-pagina.
- De footer is losgemaakt van gedeelde paginacomponenten. Daardoor laadt de ontwerptool geen homepagechunk met hero-animatie en projectpresentatie meer. Het ontwerpresultaat wordt pas bij het eerste resultaat opgebouwd; teruggaan bewaart daarna de previewstaat.
- Servergeheimen blijven server-side. Aanvragen, scanresultaten en onderhouds-API's gebruiken `no-store`. De database gebruikt gebonden parameters, herhaalde aanvragen overschrijven de eerste niet en misbruikbegrenzing gebruikt een atomaire teller.
- De website heeft uitgewerkte voorwaarden, privacy- en cookiepagina's, een printmogelijkheid en een herroepingsformulier. GA4 en toestemmingsbeheer zijn voorbereid; Analytics blijft uit tot meet-ID, privacyconfiguratie en bezoekerstoestemming aanwezig zijn.
- De bevestigde afspraken staan centraal: prijzen met 21% btw voorop, netto ernaast; 60% vooraf en 40% bij afronding; betaaltermijn 14 dagen; hosting minimaal €6,05 inclusief btw per maand, eerste termijn 12 maanden, daarna maandelijks opzegbaar. Het minimale eerste hostingjaar staat bij de websiteprijzen. Hostingoverdracht vraagt technische afstemming en is geen onbeperkt veto op wettelijke rechten.
- De diensten apps voor iPhone/Android en webapps/klantportalen zijn toegevoegd met eigen inhoud, een scherpe HTML/CSS-portaalillustratie, contactcontext, metadata, JSON-LD en OG-afbeelding. OG's voor kosten, prijscheck en tools zijn prijsloos herontworpen; voorwaarden, cookies, webapps en apps hebben eigen nieuwe beelden. Het dienstenoverzicht heeft een eigen hoofdstuk Apps & webapps. `/diensten/apps` legt ontwerp, werking, testen en voorbereiding voor App Store en Google Play uit; de aanvraag neemt de appdienst mee. De voorwaarden benoemen mobiele apps en afgesproken publicatiestappen afzonderlijk.
- Oude installatie- en SQLite-generatorscripts zijn herkenbaar als `:legacy` gelabeld. Het primaire installatiepad gebruikt standaard `npm ci`; de PostgreSQL-migratie is een afzonderlijke bewuste stap.

## Bewijs en controles

| Controle | Uitkomst | Rapport |
|---|---|---|
| Next-productiebuild en TypeScript | Geslaagd | Build-ID hierboven |
| Volledige ESLint-controle | Geslaagd | `eslint .`, geen fouten |
| Database-, cookie- en toolregressies | 28 geslaagd | `tests/database-runtime.test.mjs`, `tests/consent.test.mjs`, `tests/tool-plans.test.mjs` |
| Werkelijke HTTP-aanvragen en lokale opslag | 14 geslaagd, 0 fouten | `reports/seo/api-release-verified-2026-09-15T19-47-46-509Z-711564cd.json` |
| HTML, metadata, JSON-LD, beelden en interne links | 35 pagina's, 2.248 links, 0 bevindingen | `reports/seo/release-final/summary.json` |
| Randgevallen, 404, headers, sitemap/robots en ongeldige API-aanvragen | 143 verzoeken, 535 controles, 0 fouten | `reports/seo/final-edges/summary.json` |
| Servergeheimen in publieke clientbestanden | 64 bestanden, 0 treffers | `reports/seo/client-secrets-2026-09-15T19-49-33-488Z.json` |

De laatste wijziging betreft uitsluitend twee contrastkleuren en de marge in de appillustratie. De HTML-crawl is op de definitieve build uitgevoerd. De API-, randgeval- en geheimencontroles hierboven zijn uitgevoerd op de voorafgaande appsbuild; de serverlogica en client-JavaScript zijn bij deze laatste CSS-correctie ongewijzigd.

De SEO-rapporten controleren dat het build-ID uit de daadwerkelijk ontvangen homepage overeenkomt met `.next/BUILD_ID`. De hash verwijst naar de native serverartifact. Eerdere rapporten met een hash van `dist/server/index.js` zijn historisch en geen herkomstbewijs voor Next.

Vóór de appsuitbreiding werd de linktelling vier lager nadat de verborgen ontwerpresultaatinhoud uit de eerste HTML is gehaald. Die links zijn bereikbaar zodra het resultaat wordt opgebouwd; dit is geen verlies van hoofdnavigatie of contactmogelijkheden.

De API-tests gebruiken uitsluitend herkenbare synthetische lokale aanvragen. Retentie en verwijderen worden op geïsoleerde testgegevens gecontroleerd. Er zijn geen klantrecords verwijderd of naar Neon overgezet. Bestaande lokale D1/SQLite-bestanden zijn behouden.

## Browser, mobiel en klantpaden

De 34 bestaande routes zijn op 360 en 1440 pixels gecontroleerd op inhoud, horizontale overflow en kapotte geladen beelden. De twee gevonden mobiele pakketproblemen zijn na herstel opnieuw gecontroleerd. Home, kosten, webapps, contact, voorwaarden, de ontwerptool en Beurswijzer zijn daarnaast op 390, 768 en 1920 pixels bekeken. Echte screenshots zijn beoordeeld. De nieuwe appsdienst en het uitgebreide dienstenoverzicht zijn aanvullend op 360, 390, 768, 1440 en 1920 pixels gecontroleerd; de appaanvraag neemt de juiste dienst mee. Er is browseremulatie gebruikt, geen fysieke telefoon.

Daadwerkelijk doorlopen:

- Home → werk → Beurswijzer → contact met projectcontext → terug naar het project.
- Pakket-/prijscheckroute: eenvoudige onepager toont €1.082,95 inclusief btw; aanpassen naar vijf pagina's toont €2.292,95 en selecteert het juiste pakket bij contact.
- Websitecheck: 15 vragen vóór de URL, ongeldige URL, mislukte Google-scan, status ‘technische analyse onvolledig’, opnieuw proberen en behoud van alle antwoorden. De inhoudelijke adviezen en contactroute blijven beschikbaar.
- Een websitecheck-resultaat is via het mobiele formulier daadwerkelijk opgeslagen, met een echte ontvangstbevestiging en referentie voor de synthetische testaanvraag.
- Ontwerptool: zes vragen → voorbeeld → interne voorbeeldnavigatie → Sitesnit-contact → keuzes aanpassen → bewaren/herladen. Het formulier blijft bereikbaar en de preview vergroot niet buiten het mobiele scherm.
- Mobiel menu, focusbegrenzing, Escape met focus terug op de menuknop, paginanavigatie en browser-terug.
- Cookie-instellingen openen/sluiten met Escape; zonder ingerichte GA4 wordt geen Google Analytics-script geladen.
- Optionele belvoorkeur: werkdagen 18:00–21:30, weekend de hele dag; geen verplichte afspraak of automatische agendareservering.
- Snel heen-en-weer scrollen en wisselen naar 844 × 390 bij de geanimeerde homepage. Geen horizontale overflow en geen browserconsolefouten in deze controle.

De `prefers-reduced-motion`-fallbacks zijn in JavaScript en CSS gecontroleerd: de hero en scrollmotion worden uitgezet en de inhoud blijft beschikbaar. De beschikbare browserbediening bood geen aparte emulatie van deze mediavoorkeur; een daadwerkelijke apparaatinstelling is in deze ronde niet bediend. Een echte telefooncontrole en live analytics-netwerkcontrole blijven onderdeel van de livegang.

## Lighthouse en laadstrategie

De Google-koppeling is werkelijk getest via de nieuwe Next-server op een openbare URL: Google leverde vier categoriescores en **153 auditbevindingen**. Adviesprioriteiten verwezen aantoonbaar naar ontvangen bevindingen zoals contrast, beeldlevering en ongebruikte JavaScript. Dit waren metingen van de onderzochte referentiewebsite, geen Sitesnit-scores. Bewijs: `reports/seo/live-scan-verification.json` en `live-scan-result.json`. Antwoorden veranderen de Google-scores niet.

Lokale Lighthouse-metingen gebruiken de werkelijk geserveerde native build en verifiëren ook de bijbehorende statische bestanden. Rapporten: `reports/lighthouse/next-verified` en `reports/lighthouse/next-isolated`, op build `wnCTgbgVB8wgh9TFUVjvg` vóór de aanvullende appsdienst. De onderstaande cijfers horen bij die gemeten build. De toegevoegde appsdienst is afzonderlijk op de actuele build gecontroleerd in `reports/lighthouse/apps-contrast-final`; oude Vinext-scores zijn niet hergebruikt.

| Gemeten route vóór de aanvullende appsdienst | Mobiele prestaties | Desktop |
|---|---|---|
| Home, afzonderlijke herhaling | 94 / 93 / 94; mediaan 94 | 100 |
| Ontwerptool, afzonderlijke herhaling | 95 / 48 / 94; mediaan 94 | 100 |
| Contact, één waarneming | 95 | 100 |
| Venlo, één waarneming | 95 | 100 |

De nieuwe appsdienst scoort op de definitieve build **96 voor mobiele prestaties en 100 op desktop**, met **100 voor toegankelijkheid en best practices** op beide schermformaten. De tekstkleuren in de appillustratie zijn hiervoor gecorrigeerd. Beide metingen hebben CLS 0; mobiel is LCP 2,50 seconden en TBT 124 ms. Dit zijn één mobiele en één desktopwaarneming in een lokale labtest. De ruwe SEO-score van 66 komt uitsluitend door de opzettelijke preview-noindex. Bewijs: `reports/lighthouse/apps-contrast-final/summary.json`.

De afwijkende 48 bij de ontwerptool is bewaard in het rapport, niet weggelaten. Deze meting bevatte circa vier seconden Total Blocking Time en een LCP van 6,1 seconden. De overige twee herhalingen hadden 158–189 ms TBT en ongeveer 2,56 seconden LCP. De afwijkende taak is toegeschreven aan dezelfde Next.js-bundel als in de andere runs. Scripts, bytes, instellingen en DOM waren gelijk en er waren geen consolefouten. Zonder gedetailleerde callstack is de oorzaak niet bewezen; deze meting wordt dus als onverklaarde uitschieter gerapporteerd. Deze spreiding betekent dat de lokale medianen geen garantie voor ieder toestel of live verkeer zijn. Er zijn geen echte bezoekersmetingen of veld-INP beschikbaar.

Toegankelijkheid en best practices scoren 100 in deze metingen. De lagere ruwe SEO-score komt uitsluitend door de bewust actieve `noindex` op de preview; dit is afzonderlijk in de auditbevindingen gecontroleerd. Er wordt geen kunstmatige SEO-score zonder die controle gepresenteerd.

De ontwerptool vraagt na de wijziging ongeveer 5,9 kB minder gecomprimeerde JavaScript op. De documenttransfer daalde circa 15,7%; de aanvankelijke DOM ging van 471 naar 306 elementen. Fonts staan lokaal, het belangrijkste lettertype krijgt prioriteit en bestaande responsive WebP-bronnen behouden hun afmetingen en kwaliteitsniveau. Er zijn geen foto's extra onscherp gecomprimeerd om een getal te verbeteren. Het gedeelde CSS blijft in de geteste cascadevolgorde; een brede herverdeling zou de mobiele composities en animaties kunnen verstoren.

## Regionale SEO: wat het onderzoek betekent

De vergelijking van acht Limburgse bureaus wees vooral op de waarde van echte klantreacties, persoonlijke informatie en concrete cases. Meer gekopieerde plaatsnamenpagina's is niet de belangrijkste volgende stap. De homepage richt zich op Limburg; de Venlo-pagina kan bij livegang mee. Een eigen Baarlo-pagina kan ook meteen wanneer er voldoende zelfstandige lokale inhoud voor is. Wachten tot de website ‘ouder’ is, is geen voorwaarde. Een kopie van de Venlo-pagina voegt weinig toe. Zie `docs/seo-limburg-vergelijking.md` voor de onderzochte bureaus, bronnen en afwegingen; er zijn geen onbewezen zoekvolume- of rankingclaims gedaan.

## Nog nodig vóór openbare livegang

1. Een gekoppeld Vercel-project en echte Neon-database, schema toepassen, productiegeheimen invullen en een echte server-/opslagtest uitvoeren. De lokale tests vervangen dit niet.
2. `sitesnit.nl`, HTTPS en de gewenste www-redirect koppelen. Pas daarna de bedoelde productie-indexering vrijgeven, sitemap/robots opnieuw controleren en Search Console koppelen. De preview blijft terecht buiten de index.
3. Definitieve e-mail, telefoon, KvK en btw-id invullen. Een werkende mailbox-/notificatie- of beheerroute voor aanvragen inrichten; opslag werkt, maar er wordt nog geen aanvraagmail verzonden.
4. GA4-meet-ID en accountinstellingen aanleveren/controleren. Daarna toestemming, weigeren en intrekken met echte netwerkverzoeken testen. Nu staat Analytics uit.
5. Productiecron en bewaartermijnen daadwerkelijk inrichten en bewaken; daarnaast mailboxen, back-ups en factuuradministratie in het beheerproces meenemen.
6. Werkelijke revisie-, oplever- en scopeafspraken per voorstel vastleggen, definitieve bedrijfs-/leveranciersgegevens nalopen en alleen echte klantreacties publiceren. De uitgewerkte voorwaarden vervangen geen controle van de definitieve overeenkomst en bieden geen garantie tegen ieder juridisch risico.

De uitvoerbare stappen staan in `docs/vercel-beheer.md`. De aangescherpte opdracht staat in `docs/eindcontrole-opdracht.md`. Er zijn in deze controle geen publieke deployment, DNS-wijziging, betaalde accountaankoop of verzonden klantmails uitgevoerd.
