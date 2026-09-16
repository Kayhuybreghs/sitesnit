# Sitesnit — SEO-audit en livegangvoorbereiding

**Aanvulling 15 september 2026:** de nieuwste tekst-, JSON-LD- en navigatiecontrole staat in [seo-limburg-vergelijking.md](seo-limburg-vergelijking.md) en `reports/seo/limburg-review/`. Alle 31 routes en 1.777 interne links zijn opnieuw gecontroleerd zonder fouten; TypeScript, gerichte lint en build slagen. De Lighthouse-metingen hieronder horen bij de build van 14 september en zijn niet opnieuw gemeten na deze aanvulling.

Werkversie: 14 september 2026. Preview: <http://127.0.0.1:5184/>. Bevestigd toekomstig productiedomein: **https://sitesnit.nl**. De metingen hieronder gaan over de lokale productiebuild, tenzij een andere onderzochte URL expliciet is genoemd. Er is niet gepubliceerd, gepusht of gemerged; DNS en accounts zijn niet gewijzigd.

Bewijslabels: **aangetroffen in code**, **daadwerkelijk getest**, **nog te verifiëren** en **niet toegankelijk**. PASS geldt alleen voor de beschreven controle, niet voor de volledige website, Google-indexering of een ranking.

## A. Uitgevoerd

**SEO-basis en oorspronkelijke HTML.** Metadata is centraal uitgewerkt in `app/seo.tsx`: unieke titles en descriptions, self-canonicals, OG/Twitter-gegevens en veilige JSON-LD-serialisatie. `app/layout.tsx`, `app/page.tsx`, dienst- en casepagina's verbinden Organization, WebSite, Service en relevante BreadcrumbList-gegevens. De kostenpagina beschrijft diensten als diensten; maatwerk gebruikt een minimumprijs en wordt niet als vaste prijs of Product vermomd.

**Indexering gescheiden van de preview.** `lib/seo-policy.ts` vereist zowel de echte productiehost als `SITESNIT_INDEXING_ENABLED=true`. De preview blijft `noindex, follow`; `robots.txt` laat de crawler die instructie lezen. Noindex is geen toegangsbeveiliging. De previewsitemap bevat geen URLs. De productie-routekaart staat in `lib/route-catalog.ts`; `app/sitemap.ts` publiceert alleen de releasekandidaten zodra de expliciete poort openstaat. Geen gefingeerde lastmod, priority, hreflang of lokale vestigingen toegevoegd.

**Lokale inhoud en links.** De nieuwe Venlo-pagina, de regionale passages op home/webdesign en de gecorrigeerde vermelding van Baarlo maken het werkgebied concreet. Bestaande goede routes zijn behouden, waaronder `/kosten`; er is geen nieuwe synoniemroute `/prijzen` nodig. Pakketprijzen blijven **€895**, **€1.895** en **vanaf €2.750**. Circa **€4.000** blijft uitsluitend context voor grotere maatwerkprojecten, geen vaste prijs of bovengrens. De onbevestigde btw-vermelding bij websitepakketten is uit de bron verwijderd; de bevestigde maandprijzen en hun btw-vermelding blijven behouden.

**Tool naar contact.** ‘Ontwerp je website’ legt duidelijker uit dat iemand een bewerkbaar voorbeeld en plan krijgt. Zes vragen leiden naar een eigen desktop/mobielvoorbeeld; het resultaat verwijst duidelijk naar bespreken. Een aangepast ontwerp en antwoorden kunnen met toestemming naar de aanvraag mee. De tool staat onderaan het tooloverzicht, met een direct contactpunt op die pagina. De bestaande checks blijven rechtstreeks bereikbaar en hun resultaat is niet afhankelijk van het afgeven van contactgegevens.

**Eigen deelbeelden.** Alle **31 routes** hebben een eigen **1200 × 630 PNG**. De composities zijn specifiek voor de pagina en zelf met code getekend; er zijn geen websitefoto's of screenshots hergebruikt. `lib/social-images.ts` koppelt beeld, alttekst en afmetingen aan de route. `reports/seo/social-images.json` beschrijft de assets. De vijf toolbeelden laten afzonderlijk hun werking zien; voorbeeldgegevens zijn gelabeld. Bestanden zijn lossless gecontroleerd en visueel beoordeeld. De contactkaart onderscheidt werkdagen en weekend; de projectkaart labelt schematische voorbeelden. Alle 31 uiteindelijke beelden zijn uniek en samen 2.438.706 bytes; ze worden niet als zichtbare afbeeldingen op iedere gewone pagina geladen.

**Scan en onderhoudbare controles.** De PageSpeed-integratie verwerkt echte audits in de advieslogica. Ongeldige requestvormen en private/lokale websiteadressen krijgen begrijpelijke fouten. Er zijn reproduceerbare route-, link-, logica- en performancetests toegevoegd/gebruikt; rapporten blijven buiten `public` en zijn geen publieke webcontent. Bestaande vormgeving, tools, framework en animaties zijn behouden.

## B. Paginabesluit

| Bestemming | Besluit en eigen taak |
|---|---|
| `/` | Limburg als brede commerciële ingang: aanbod, werk, pakketten, tools en contact. |
| `/diensten/webdesign` | Verdieping in omvang, ontwerp, inhoud, mobiele uitvoering en werkwijze. |
| `/webdesign-venlo` | Nieuwe zelfstandige koopkeuzepagina: voor ondernemers in Venlo, vanuit Baarlo; situaties, proces, echt werk, prijscontext en aankoopvragen. |
| `/kosten` | Behouden als centrale prijsbestemming, inclusief afbakening en afzonderlijke doorlopende diensten. |
| `/projecten/beurswijzer` en `/projecten/beurswatcher` | Echte, direct bereikbare cases als bewijs van ontwerp- en ontwikkelkeuzes. Geen verzonnen lokale klantrelatie of omzetresultaten. |
| `/tools` en toolroutes | Bruikbare eigen functies met een passende contactroute; geen nieuwe tools alleen om meer SEO-pagina's te maken. |
| Drie ontwerpconcepten | Behouden met expliciet conceptlabel; `noindex` en uitgesloten van de productiesitemap. |

**Venlo is inhoudelijk gereed als releasekandidaat.** De pagina is zelfstandig bruikbaar, heeft passende contextlinks vanuit home en webdesign en verwijst naar prijzen, werk en contact. Er wordt geen kantoor of bezoekmogelijkheid in Venlo geclaimd.

**Peel en Maas krijgt nu geen eigen pagina.** Er is nog onvoldoende andere praktijkinformatie of een aparte klantvraag voor een nuttig tweede lokaal verhaal. Een eerlijke werkgebiedpassage over de omgeving van Baarlo volstaat. Geen kopieën voor ieder dorp of iedere dienst/plaats-combinatie.

De routekaart bevat **31 bedoelde pagina's: 28 releasekandidaten en 3 uitgesloten concepten**. Titels, descriptions, H1's, canonicals, status, indexeerbaarheid, klikdiepte en inhoudelijke inlinks staan in `reports/seo/routes.csv`. `reports/seo/internal-links.csv` houdt bestemmingen, ankers en plaatsing bij. De HTML-snapshots en fasegegevens staan in `reports/seo/before/` en `reports/seo/after/`.

Een beperkte webzoekverkenning voor webdesign Venlo en website laten maken Limburg onderstreept de commerciële vraag naar aanbod, prijs, proces, voorbeelden en contact. Deze verkenning is geen lokaal gecontroleerde Google-SERP, volumeonderzoek of rankingmeting. De keuze voor Venlo volgt vooral uit de bevestigde bedrijfscontext en beschikbare nuttige inhoud.

## C. Technische controles

| Controle | Status | Bewijs en beperking |
|---|---|---|
| TypeScript | PASS | Volledige typecontrole uitgevoerd door de uitvoerende agent. |
| ESLint `app` en `lib` | PASS | Geen resterende fouten in de gecontroleerde bron. |
| Productiebuild | PASS | De laatste Vinext/Worker-build, inclusief de OG-labelcorrecties en de centrale pakketgegevens, slaagt. Buildhash `987df7e37312aa8c972b24f6d18e85b06c8e521e4c0fe810a5b41af398f58d88`. De HTML-crawl is op deze build herhaald. |
| Routes en interne verwijzingen | PASS | `reports/seo/after/summary.json`: **31 routes, 1775 linkverwijzingen, 0 issues**. Getest in oorspronkelijke HTML. Herhaalde navigatie/footerlinks zijn geen 1775 onafhankelijke inhoudelijke aanbevelingen. |
| Canonicals, metadata, H1's, JSON-LD en assets | PASS | Lokale HTML-controles, `routes.csv` en het assetoverzicht; één passende canonical per gecontroleerde route. Geldige beschrijvende schema.org-data garandeert geen rich result. |
| Privébestanden buiten de webroot | PASS | `.env.local`, `.dev.vars`, het auditrapport en de release-documentatie geven lokaal 404; alleen publieke assets worden geleverd. Bewijs: `reports/seo/private-files-check.json`. |
| Onbekende URL en URL-varianten | PASS | Echte 404; `/index.html` geeft 404. De slashvariant eindigt lokaal op `/kosten`. Parameters behouden de schone canonical. Productiehost/HTTPS-redirects vallen buiten deze lokale test. |
| Preview en persoonlijke resultaten | PASS | Preview-noindex, lege previewsitemap en leesbare robotsinstructie getest. `?resultaat=1` bij beide checks blijft noindex met canonical naar de tool. |
| Ontwerptool en aanvraag | PASS | Zes vragen, resultaat, tekst/stijl aanpassen, formulierbehoud en juiste context getest. `reports/seo/contact-local-result.json` bevestigt lokale D1-opslag van aangepast ontwerp, antwoorden en belvoorkeur. Geen e-mail of productieaanvraag verstuurd. |
| Werkelijke PageSpeed-koppeling | PASS | `reports/seo/live-scan-verification.json`: echte mobiele scan van `https://webfluencer.nl/`, HTTP 200, **153 ontvangen audits**. Advies-IDs komen aantoonbaar uit ontvangen mislukte audits. Dit zijn geen Sitesnit-prestaties. |
| Scaninvoer | PASS | Null, arrays, fout URL-type en lokale/private adressen geven 400 in het verificatierapport. Vragenlogica behoudt antwoorden onafhankelijk van de scanstatus. |
| Alle externe scanfouten in de browser | BLOCKED | De niet-geconfigureerde API is daadwerkelijk met HTTP 503 geconstateerd en daarna hersteld; Google-quota, timeout en onbereikbare doelpagina zijn in deze eindronde niet elk met een gecontroleerde browsermock doorlopen. Bestaande fout- en opnieuw-proberenpaden zijn in code beoordeeld. |
| Mobiele composities en kernbediening | PASS | Browseremulatie op **320, 360, 390, 768, 1440 en 1920 px**; ontwerptool/resultaat/contact en navigatie beoordeeld. Menu-Escape en focusterugkeer getest. Geen echte telefoon of Safari/WebKit getest. |
| Verminderde beweging in de browser | BLOCKED | Fallbacks aangetroffen en beoordeeld in broncode; de beschikbare browseremulatie biedt geen instelling voor reduced motion. Geen volledige runtime-doorloop geclaimd. |
| Search Console-connector | BLOCKED | Niet toegankelijk: `payment_required` / verlopen trial. Geen betaling of accountwijziging uitgevoerd; geen live-indexering of zoekresultaatdata vastgesteld. |
| Productiehosting en live-indexering | BLOCKED | Geen geautoriseerde publicatie uitgevoerd. Publieke HTTPS, redirects, caching, compressie, headers, crawlerweergave en indexering moeten na afzonderlijk goedgekeurde livegang worden getest. |

De nulmeting in `reports/seo/before/summary.json` telde 30 routes en 1518 linkverwijzingen zonder gebroken bestemmingen. Wel stonden de preview, canonicals en sitemap nog op de oude publicatiecontext en ontbrak de nieuwe Venlo-route. Een foutloze linkcrawl was dus niet hetzelfde als een afgeronde SEO-configuratie.

De browserbeelden zijn tijdens de controles werkelijk bekeken. De acht bestanden in `reports/seo/screenshots/` zijn aanvullend met Pillow geopend en als geldige beelden bevestigd. De opgeslagen contentbreedte kan 15 px smaller zijn dan de ingestelde viewport door de browser-scrollbar; zo is de opname van 390 px 375 px breed. Dit is browseremulatie, geen echte telefoonmeting.

### Reproduceerbaar uitvoeren

Voer vanuit de projectmap met de bestaande installatie uit; geen frameworkwissel of nieuw betaald abonnement nodig. Gebruik de bestaande Node-runtime (minimaal de versie uit `package.json`) en voer zware tests sequentieel uit.

```text
npm run build
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js app lib
npm run test:logic
npm run seo:check
npm run test:links
node scripts/verify-live-scan.mjs
```

`seo:check` en `test:links` zijn aliassen voor dezelfde gerichte controle. Ze lezen de lokale preview op poort 5184; start de gebouwde Worker met `npm run start -- --port 5184`. `scripts/sites-env.mjs` maakt het pad naar `.env.local` absoluut, zodat Wrangler de bestaande sleutel ook naast de gebouwde configuratie correct vindt. Er worden geen geheimen naar de publieke assets gekopieerd. De crawl gebruikt een kleine Python-parser, configureerbaar met `SEO_PYTHON`. De live scan is een echte Google PageSpeed-aanroep op een openbare URL; houd rekening met de bestaande API-rate-limit en stuur geen privé-URL naar Google.

Voor een nieuwe performanceronde, na een gecontroleerde build en met de lokale preview gereed:

```text
node scripts/test-performance.mjs after
```

Het script gebruikt de aanwezige lokale Lighthouse-installatie en Edge. `CHROME_PATH` en `SEO_TEST_ORIGIN` zijn configureerbaar; het weigert een niet-lokale testhost en overschrijft bestaande runbestanden niet. Voor herhalen gebruik je een unieke fasenaam en geef je de gewenste routes expliciet mee, inclusief `/webdesign-venlo`. De contactverificatie leest alleen de daarvoor aangemaakte lokale testaanvraag; geen testleads naar productie sturen.

De vastgelegde kwaliteitsruntime staat in `.sites-runtime/quality/node_modules` (Lighthouse 13.4.1 en chrome-launcher). `node scripts/summarize-performance.mjs` maakt na voltooide before/after-rondes `reports/lighthouse/comparison.md` en `comparison.json`. De OG-bronnen staan onder `../sitesnit-support/og-assets`; de vier renderers bewaren hun eigen composities en fonts. `scripts/prepare-social-images.py` integreert de beoordeelde PNG's zonder verliescompressie en vernieuwt de routekoppeling en het manifest.

## D. Lighthouse — werkelijke resultaten

Lokale labomgeving: gebouwde Vinext Worker via Wrangler op Windows, Lighthouse **13.4.1**, headless Edge **152**, gesimuleerde throttling en een nieuw geïsoleerd browserprofiel per run. Testen draaien sequentieel: **drie mobiele runs en één desktoprun per gekozen template**. Exacte tijden, browser-/Node-versie, instellingen, commit, bronhash en gemeten buildhash staan per fase in `reports/lighthouse/*/summary.json`; alle JSON- en HTML-runs blijven bewaard.

Bestaande templates: home, webdesign, kosten, Beurswijzer-case, websitecheck en ontwerptool. Venlo wordt na bouw toegevoegd; deze nieuwe pagina heeft geen historische nulmeting. De tabel vermeldt voor mobiele groepen de mediaan en bewaart min/max-spreiding in de onderliggende rapporten. Ontbrekende metingen worden expliciet als niet gemeten gemarkeerd en tellen niet als PASS.

Mediaan met minimum–maximum tussen haakjes: drie mobiele runs en één desktoprun per route en fase. Alle tijden in milliseconden; CLS heeft geen eenheid.

| URL | Apparaat | Fase | P | A | BP | SEO | FCP | LCP | CLS | TBT | Speed Index | TTFB |
|---|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| / | mobile | before | 90 (89–94) | 100 (100–100) | 100 (100–100) | 100 (100–100) | 2.037 (1.970–2.108) | 2.892 (2.830–2.956) | 0 (0–0) | 179 (25–190) | 3.146 (2.382–3.486) | 154 (107–468) |
| / | mobile | after | 95 (95–95) | 100 (100–100) | 100 (100–100) | 69 (69–69) | 1.975 (1.964–1.986) | 2.639 (2.620–2.670) | 0 (0–0) | 69 (30–104) | 2.187 (2.165–2.210) | 58 (53–64) |
| / | desktop | before | 99 | 100 | 100 | 100 | 543 | 735 | 0,026 | 0 | 982 | 68 |
| / | desktop | after | 100 | 100 | 100 | 69 | 504 | 630 | 0,018 | 0 | 850 | 52 |
| /diensten/webdesign | mobile | before | 96 (94–97) | 100 (100–100) | 100 (100–100) | 100 (100–100) | 1.719 (1.711–1.803) | 2.339 (2.314–2.351) | 0 (0–0) | 118 (82–189) | 1.719 (1.711–1.803) | 77 (70–78) |
| /diensten/webdesign | mobile | after | 98 (98–98) | 100 (100–100) | 100 (100–100) | 66 (66–66) | 1.637 (1.630–1.647) | 2.251 (2.214–2.256) | 0 (0–0) | 64 (9–67) | 1.637 (1.630–1.647) | 50 (38–50) |
| /diensten/webdesign | desktop | before | 100 | 100 | 100 | 100 | 501 | 603 | 0 | 0 | 528 | 46 |
| /diensten/webdesign | desktop | after | 100 | 100 | 100 | 66 | 512 | 611 | 0 | 0 | 596 | 71 |
| /kosten | mobile | before | 98 (97–98) | 100 (100–100) | 100 (100–100) | 100 (100–100) | 1.677 (1.676–1.701) | 2.256 (2.240–2.321) | 0 (0–0) | 8 (6–42) | 1.677 (1.676–1.701) | 61 (59–80) |
| /kosten | mobile | after | 96 (95–98) | 100 (100–100) | 100 (100–100) | 66 (66–66) | 1.702 (1.633–1.729) | 2.291 (2.238–2.358) | 0 (0–0) | 123 (10–189) | 1.702 (1.633–1.729) | 58 (49–74) |
| /kosten | desktop | before | 100 | 100 | 100 | 100 | 480 | 570 | 0 | 0 | 496 | 43 |
| /kosten | desktop | after | 100 | 100 | 100 | 66 | 524 | 642 | 0 | 0 | 614 | 64 |
| /projecten/beurswijzer | mobile | before | 96 (94–96) | 93 (93–93) | 100 (100–100) | 100 (100–100) | 1.763 (1.725–1.834) | 2.626 (2.550–2.768) | 0 (0–0) | 36 (22–99) | 1.763 (1.725–2.013) | 54 (52–70) |
| /projecten/beurswijzer | mobile | after | 96 (96–96) | 100 (100–100) | 100 (100–100) | 69 (69–69) | 1.773 (1.755–1.793) | 2.645 (2.610–2.686) | 0 (0–0) | 51 (11–53) | 1.773 (1.755–1.793) | 56 (55–122) |
| /projecten/beurswijzer | desktop | before | 100 | 92 | 100 | 100 | 526 | 643 | 0 | 0 | 589 | 45 |
| /projecten/beurswijzer | desktop | after | 100 | 100 | 100 | 69 | 533 | 655 | 0 | 0 | 675 | 57 |
| /websitecheck | mobile | before | 97 (96–97) | 100 (100–100) | 100 (100–100) | 100 (100–100) | 1.945 (1.922–1.977) | 2.368 (2.334–2.423) | 0 (0–0) | 53 (11–107) | 1.945 (1.922–1.977) | 46 (45–48) |
| /websitecheck | mobile | after | 96 (93–96) | 100 (100–100) | 100 (100–100) | 66 (66–66) | 1.978 (1.822–2.072) | 2.548 (2.495–2.558) | 0 (0–0) | 76 (53–170) | 1.978 (1.822–2.072) | 53 (50–65) |
| /websitecheck | desktop | before | 100 | 100 | 100 | 100 | 514 | 610 | 0 | 0 | 552 | 36 |
| /websitecheck | desktop | after | 100 | 100 | 100 | 66 | 536 | 668 | 0 | 0 | 584 | 40 |
| /tools/ontwerp-je-website | mobile | before | 97 (97–97) | 100 (100–100) | 100 (100–100) | 100 (100–100) | 1.930 (1.796–1.942) | 2.342 (2.329–2.361) | 0 (0–0) | 12 (11–14) | 1.930 (1.796–1.942) | 47 (42–54) |
| /tools/ontwerp-je-website | mobile | after | 97 (92–97) | 100 (100–100) | 100 (100–100) | 66 (66–66) | 1.811 (1.790–1.989) | 2.415 (2.330–2.540) | 0 (0–0) | 52 (15–215) | 1.811 (1.790–1.989) | 51 (50–62) |
| /tools/ontwerp-je-website | desktop | before | 100 | 100 | 100 | 100 | 523 | 617 | 0 | 0 | 575 | 47 |
| /tools/ontwerp-je-website | desktop | after | 99 | 100 | 100 | 66 | 723 | 845 | 0 | 47 | 949 | 72 |
| /webdesign-venlo | mobile | before | N.V.T. — nieuwe pagina | — | — | — | — | — | — | — | — | — |
| /webdesign-venlo | mobile | after | 98 (98–98) | 100 (100–100) | 100 (100–100) | 66 (66–66) | 1.677 (1.675–1.689) | 2.226 (2.217–2.230) | 0 (0–0) | 37 (10–46) | 1.677 (1.675–1.689) | 63 (60–90) |
| /webdesign-venlo | desktop | before | N.V.T. — nieuwe pagina | — | — | — | — | — | — | — | — | — |
| /webdesign-venlo | desktop | after | 100 | 100 | 100 | 66 | 492 | 595 | 0 | 0 | 568 | 39 |


**PASS — meetronde afgerond:** 24 voor-runs en 28 na-runs, ieder met een werkelijk JSON- en HTML-rapport. Mobiele Performance-mediaan 95–98, desktop 99–100; Accessibility en Best Practices zijn in alle na-runs 100. De SEO-score is 66 of 69 door uitsluitend de mislukte `is-crawlable`-audit: de bewust aanwezige preview-noindex. Die bescherming is niet verwijderd om een hoger cijfer te krijgen.

**Aantoonbaar verbeterd:** het LCP-element van de homepage was het fotografische laptopkader. Dat kader is nu CSS, waardoor die beeldrequest verdwijnt. De eerste mobiele run draagt 279.449 in plaats van 309.196 bytes over; de herhaalde mediane LCP daalt van 2.892 naar 2.639 ms en TBT van 179 naar 69 ms. De nieuwe LCP is de direct zichtbare introductietekst. Timingverschillen zijn mede afhankelijk van de lokale uitvoeromgeving: de totale winst kan niet uitsluitend aan één CSS-wijziging worden toegeschreven. De Beurswijzer-case ging na contrast- en ARIA-correcties van Accessibility 93 mobiel/92 desktop naar 100.

**Resterende aandachtspunten:** LCP blijft in deze mobiele labtest op home en case circa 2,64 s en op de websitecheck circa 2,55 s. Kosten daalt qua Performance-mediaan van 98 naar 96, met een na-spreiding van 95–98; de TBT-spreiding laat uitvoervariatie zien. De ontwerptool varieert 92–97 bij een mediaan van 97. Deze lagere individuele runs blijven zichtbaar en zijn niet vervangen door gunstigere herhalingen. Er is geen meetreden voor een frameworkwissel of het weghalen van de gewenste beweging.

De bewaakte ambities — mobiel Performance minimaal 90, desktop 95 en Accessibility/Best Practices 95 — zijn in de eindmeting gehaald. Voor nieuwe wijzigingen: onderzoek een mediane Performance-daling van meer dan 5 punten of meer dan 10% extra overdracht tegenover deze vastgelegde build, en beoordeel LCP boven 2,5 s gericht. Dat zijn engineeringafspraken, geen rankingdrempels. Streef naar verbetering zonder vormgeving of contactfunctionaliteit op te offeren. `reports/lighthouse/comparison.json` bewaart ook bytes en requestaantallen; de ruwe audits geven de oorzaak, niet alleen een cijfer.

**Veldgegevens: niet gemeten.** Lighthouse is een gesimuleerde mobiele/desktoplabtest; geen real-user INP en geen volledige toegankelijkheidsaudit. Er zijn geen CrUX-conclusies over Sitesnit beschikbaar. Lokale TTFB zegt niets over toekomstige productiehosting. De aparte PageSpeed-scan van Webfluencer verifieert de toolkoppeling en mag niet als Sitesnit-score in deze tabel terechtkomen.

## E. Nog open

### Voor een verantwoord afgeronde release

1. **Aanvraagopvolging:** D1-opslag is getest; e-mailnotificaties ontbreken. Configureer en test een echte ontvanger/verzendkoppeling, of leg vóór livegang een aantoonbaar werkende alternatieve opvolging van de opgeslagen aanvragen vast. Alleen opslaan garandeert niet dat de eigenaar een nieuwe aanvraag ziet.
2. **Zakelijke pakketafspraken:** btw-status van de websitepakketten, revisies en overige voorwaarden zijn nog niet bevestigd. De onterecht vaststaande btw-vermelding bij websitepakketten is hersteld; leg de definitieve zakelijke afspraken vóór publicatie vast. De reeds bevestigde maandprijzen en hun btw-vermelding behouden. Geen nieuwe prijsvoorwaarden uit deze audit afleiden.
3. **Laatste output — afgerond:** herbouw, HTML-crawl, OG-controle en alle 28 na-metingen zijn voltooid op de genoemde build. De resterende meetaandachtspunten staan onder D; dit onderdeel blokkeert de lokale oplevering niet.
4. **Contactkanalen:** WhatsApp-nummer is onbevestigd; geen fictieve WhatsApp-route publiceren. De aanwezigheid van een link of e-mailadres bewijst geen werkende e-mailbezorging.
5. **Klantreacties:** bestaande voorbeeldreacties zijn geen echte Google-reviews. Voor publicatie als klantbewijs vervangen door goedgekeurde echte tekst; anders zichtbaar als voorbeeld houden of weglaten. Geen namen, sterren of reviewmarkup verzinnen.

### Kleine verbeterpunten en aanvullende controles

- Bewaar de geldige voor/na-screenshots samen met de rapporten; nieuwe visuele wijzigingen vragen alleen gerichte nieuwe opnames.
- Reduced motion als volledige runtimeflow en mobiele Safari/een echte telefoon testen zodra beschikbaar. De huidige controle was browseremulatie.
- Een complete handmatige toegankelijkheidscontrole, daadwerkelijk bestand ontvangen na downloaden en printer/PDF-dialoog vallen buiten de hierboven bewezen tests.
- Nieuwe content of regiopagina's alleen toevoegen bij een eigen nuttige vraag en bewijs; geen maandquotum voor blogs of tools instellen.

### Alleen na afzonderlijk goedgekeurde publicatie

- Productiehost, HTTPS en host-/slashredirects, echte 404, cache/compressie, robots, X-Robots-Tag/meta, canonicals, sitemap en assets opnieuw ophalen op de echte host. Open de indexeringspoort alleen voor de goedgekeurde productieconfiguratie; previews blijven dicht.
- Aanvraag daadwerkelijk ontvangen en correct opvolgen; tools inclusief scanfouten doorlopen. Geen persoonsgegevens of formulierinhoud naar analytics. Verzendklik, WhatsApp-klik en werkelijk verwerkte aanvraag gescheiden houden.
- Eigendom in Google Search Console en Bing Webmaster Tools verifiëren, sitemap indienen en belangrijke URLs controleren met geautoriseerde toegang. Een connectorblokkade verhindert de lokale oplevering niet. Geen Indexing API gebruiken als algemene bedrijfssite-indieningstruc.
- Na voldoende data merk/niet-merk, apparaten, aanvragen en echte zoekvragen beoordelen. Geen vaste Venlose ranking afleiden uit een gemiddelde positie. Google Bedrijfsprofiel alleen gebruiken wanneer Sitesnit feitelijk aan de voorwaarden voldoet; geen fictieve vestiging maken.

## F. Releasestatus

**Lokaal gereed voor livegangvoorbereiding.** De paginastructuur, eigen OG-beelden, lokale inhoud, toolcontactroute en SEO-basis zijn geïntegreerd, gebouwd en gecontroleerd. De build-/performanceronde is afgerond. Zakelijke bevestigingen en werkelijke aanvraagopvolging uit E moeten vóór publicatie worden geregeld; productiecontroles volgen pas na afzonderlijk goedgekeurde livegang. Dit is geen publicatiegoedkeuring en geen bewijs dat de website live geïndexeerd is.

De gekozen aanpak sluit aan op de actuele officiële uitleg over [crawlbare links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable), [noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing), [canonicals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap) en [nuttige lokale inhoud zonder doorway-kopieën](https://developers.google.com/search/docs/essentials/spam-policies). FAQ-rich-results zijn volgens [Googles updateoverzicht](https://developers.google.com/search/updates) sinds 7 mei 2026 vervallen; normale aankoopvragen blijven zinvol. [Google bevestigt](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) dat llms.txt of speciale AI-markup geen zichtbaarheid of ranking oplevert in Google Search. Er zijn geen ranking-, snippet- of omzetgaranties afgegeven.
