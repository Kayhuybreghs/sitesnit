# Lokale HTML-crawl: afgebakend technisch bewijs

Deze beoordeling leest het volledige lokale rapport (`summary.json`, `routes.csv`, `internal-links.csv` en de opgeslagen HTML-responses) naast `scripts/seo-check.py`. De bijbehorende versieerbare snapshot `local-html-crawl-hub-final-2026-09-24.json` bewaart het oorspronkelijke meetmoment, de summary, geaggregeerde CSV-resultaten, rapporthashes en per route de gemeten waarden en HTML-hash. Het bronrapport staat onder de genegeerde map `reports/seo/hub-final/`; de snapshot blijft bestaan wanneer dat pad later wordt overschreven.

## Vastgelegde eindmeting

Meetmoment: **2026-09-24 19:00:07 UTC**. Lokale origin: `http://127.0.0.1:5184`. Native build-ID: `OS2gl1D-6G1eScLpJ_0zr`; de beperkte native-buildcontrole is geslaagd. De summary bevat nul issues volgens de assertions van dit script.

| Gemeten onderdeel | Vastgelegd resultaat |
| --- | --- |
| Catalogusroutes | 56; alle uiteindelijke HTTP-status 200 |
| Interne linkvoorkomens | 3769; alle uiteindelijke HTTP-status 200; nul ontbrekende fragmenten |
| Unieke linkdoelpaden | 58; 293 combinaties van pad, query en fragment |
| Links met query | 65 voorkomens; algemene padcheck test hun querygedrag niet |
| Gevonden lokale resources | 128; alle uiteindelijke HTTP-status 200 |
| H1 en preview-meta | Alle 56 routes één H1 en `noindex, follow` |
| Geregistreerde X-Robots-Tag | Leeg op alle 56 routerijen; geen headerbewijs |
| Bereikbaarheid vanaf home | 1 route diepte 0, 28 diepte 1, 27 diepte 2 |
| Reviewkoppelingen in deze stap | 35 exact gedekte `PAGE-*.json`-records |

De snapshot bewaart de meetgegevens en hashes, niet de volledige oorspronkelijke HTML- en CSV-bestanden. Een later gewijzigde bronmap kan dus niet vanuit alleen deze snapshot opnieuw worden geparseerd; de vastgelegde hashes kunnen een bewaard origineel wel identificeren.

## Wat deze controle aantoont

- De publieke routes uit de lokale gegenereerde catalogus zijn via HTTP op de in de snapshot genoemde localhost-origin opgehaald. De route-CSV bewaart de uiteindelijke status na eventueel gevolgde redirects. Dit is geen onafhankelijke inventarisatie van alle mogelijke applicatieroutes; private Hubroutes vallen buiten deze catalogus.
- Het script parseert de oorspronkelijke volledige HTML-response, zonder JavaScript uit te voeren. De assertions controleren onder meer één niet-lege titel, één niet-lege description, één H1, `lang="nl"`, unieke element-ID's en aanwezigheid van een `alt`-attribuut bij afbeeldingen. Het script controleert geen betekenis of kwaliteit van alternatieve teksten. De parser beperkt metadata niet tot een afzonderlijk browser-geparseerd `<head>`.
- In deze fase controleert het script canonical-URL's tegenover de vastgelegde productie-origin, lokale preview-noindex, verplichte sharingmetadata, unieke sharingafbeeldings-URL's en exacte dubbele titels/descriptions tussen routes. Het controleert parsebare JSON-LD en een afgebakende set relaties tussen paginatype, URL, titel, description, breadcrumb, taal en lokale bedrijfs-/prijsgegevens. Dat is consistentie met lokale configuratie, geen inhoudelijke, juridische of commerciële claimverificatie.
- Interne linkvoorkomens worden gecontroleerd op uiteindelijke HTTP-status en, waar aanwezig, het bestaan van het gedecodeerde fragment-ID. Het totale aantal links telt herhaalde voorkomens op verschillende pagina's mee. Het aantal unieke targets staat afzonderlijk in de snapshot. Voor deze algemene linkcheck haalt het script alleen het URL-pad op: querygedrag is daardoor niet voor iedere link getest.
- Afzonderlijk worden vier queryvarianten opgehaald: de twee historische tools met `resultaat=1`, `/kosten?utm_source=seo-audit` en `/contact?pakket=onepager`. De assertions eisen status 200 en meta-noindex; de canonical wordt opgeslagen maar hier niet zelfstandig op de verwachte waarde getoetst.
- De gevonden lokale afbeeldingen, scripts en stylesheet-/preload-/iconlinks, plus de lokale paden van sharingafbeeldingen, worden als gededupliceerde resources opgehaald. Status, omvang en contenttype staan in de summary. Dit omvat geen recursieve CSS-`url()`/`@import`-analyse, volledige `srcset`-dekking, externe resources of uitsluitend dynamisch geladen assets.
- Het script registreert bereikbaarheid en klikdiepte vanaf de homepage via de gevonden links. Dat kan ook via navigatie of footer zijn; het is geen kwaliteitsbeoordeling van hoofdinhoud of conversieroute.
- Eén onbekend testpad moet 404 teruggeven. Preview-sitemapcontrole zoekt alleen naar afwezigheid van de letterlijke tekst `<loc>`; ze valideert geen XML en heeft geen aparte assertion op de sitemapstatus. De robotscheck zoekt alleen naar afwezigheid van de letterlijke regel `Disallow: /\n`; ze is geen volledige robots-parser. `/kosten/` en `/index.html` worden vastgelegd, maar de betreffende afsluitende code heeft geen aparte assertion op redirecttype of index.html-status.

## Versie-identiteit en bewijsgrenzen

De ingebouwde native-buildcontrole vergelijkt het homepage Flight build-ID met `.next/BUILD_ID` en controleert of dat bestand en de hash van `.next/server/app/page.js` tijdens de crawl gelijk blijven. Een geslaagde controle bewijst deze beperkte lokale build-identiteit. Het is geen hash van alle dependencies, geen cryptografische koppeling aan de vier reviewhashes per pagina en geen deploymentattest. De script-hash in de snapshot hoort bij de tijdens deze bewijsbeoordeling gelezen scriptversie; de oorspronkelijke crawler registreert zelf geen script-hash tijdens zijn run.

De snapshot bevat hashes van de opgeslagen HTML-responses en een zelfstandige kopie van de meetgegevens. Een HTML-hash identificeert dat lokale responsebestand; hij vervangt niet de `contentHash`, `businessHash`, `sourcesHash` of `assetsHash` van het reviewregister. Er wordt geen historische bronhash opnieuw berekend om een review geldig te laten lijken. Nieuwe builds vereisen een nieuwe meting en expliciete versiebeoordeling.

De originele route-CSV registreert het veld `x_robots_tag` afzonderlijk. Een leeg veld is geen bewijs van een actieve HTTP-header. Bovendien leest het script die header via een hoofdlettergevoelige lookup in een gewone dictionary. De vastgelegde meta-noindex biedt hier het aangetoonde preview-signaal; productieheaders zijn niet getest.

Niet aangetoond door deze crawl: live hosting, echte productieheaders en redirects, zoekmachine-indexering/rankings, Lighthouse/Core Web Vitals of andere performance, JavaScript-hydratatie, interactieve tools/formulieren/CTA-resultaten, toetsenbord- en screenreadergebruik, volledige toegankelijkheid, visuele layouts of fysieke telefoons. Een afzonderlijke browserproef kan aanvullende beperkte dekking leveren, maar is geen impliciet onderdeel van dit rapport.

## Gebruik in de reviewrecords

Alleen de `PAGE-*.json`-records waarvan het exacte `path` in de gecontroleerde route-CSV voorkomt, ontvangen verwijzingen naar deze notitie en snapshot met SHA-256. De achttien artikelrecords en de overige niet-PAGE-records worden door deze bewijsstap niet gewijzigd. Bestaand bewijs blijft behouden.

De HTML-subcontrole kan geslaagd zijn terwijl de brede `technicalStatus` **`not_run` blijft**: het schema heeft geen status voor een gedeeltelijk geslaagde technische review, en deze crawl dekt de volledige gebruikersroute en reviewversie niet. Redactionele status, overeenkomstbeoordeling, claimsstatus, reviewhashes, reviewdatum, openstaande punten en eigenaarvrijgave worden niet aangepast. Dit is aanvullend technisch bewijs, geen vrijgave.
