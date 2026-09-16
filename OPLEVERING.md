# Definitieve lokale controle — 15 september 2026

De huidige build bevat ook een eigen dienst voor apps voor iPhone en Android, naast webapps, met een nieuw hoofdstuk op het dienstenoverzicht en eigen HTML/CSS-illustraties en OG-beeld. De definitieve crawl controleert 35 pagina’s en 2.248 interne links zonder bevindingen. De technische randgevallentest telt 535 geslaagde controles; de formulier-/opslagtest 14 geslaagde groepen.

Zie [het actuele eindrapport](docs/eindcontrole-vercel.md) voor de build, regressies, mobiele controles, volledige snelheidsmetingen en ontbrekende liveganggegevens. Lokale werking is gecontroleerd; Vercel en Neon zijn nog niet live gekoppeld. Eerdere tellingen en prestatiemetingen hieronder blijven historie.

---

## Actuele technische richting — native Next en Vercel

De huidige uitvoeringsroute is **Next.js 16.3.4 met React 19.2.6 en Node.js 24**. Het bevestigde hostingdoel is Vercel met Neon PostgreSQL. De oude Vinext/Workers/D1-startinstructies en historische buildmetingen hieronder blijven uitsluitend historie. Gebruik [README.md](README.md) en [docs/vercel-beheer.md](docs/vercel-beheer.md) voor het actuele starten, schema, omgevingsvariabelen en beheer.

De productie-adapter gebruikt parametergebonden Neon HTTP-query's. De lokale preview kan uitsluitend met de expliciete lokale vlag SQLite gebruiken; op Vercel is dat geen fallback. Publieke paginaweergave opent geen databaseverbinding. De nieuwe PostgreSQL-migratie wordt afzonderlijk uitgevoerd en draait niet stilzwijgend tijdens een build.

De applicatie bewaart aanvragen twaalf kalendermaanden vanaf ontvangst en checkgebeurtenissen negentig dagen. Een geautoriseerd onderhoudsendpoint verwijdert verlopen gegevens; Vercel-cron is hiervoor dagelijks om 03:15 UTC geconfigureerd. De planner moet op de echte deployment nog worden geactiveerd en gecontroleerd. De opschoning betreft actieve applicatiedata, niet automatisch mailboxen, klantdossiers of back-ups.

Analytics blijft uit zonder geldige property-ID, gecontroleerde privacyconfiguratie en expliciete toestemming van de bezoeker. Het meet geen toolantwoorden of formulierinhoud. Queryparameters en fragmenten worden uit meetadressen gehouden. Intrekken verwijdert Analytics-cookies en stopt meting door de geladen pagina opnieuw te openen. De cookiekeuze geldt maximaal 180 dagen. De vereiste Google-propertyinstellingen moeten vóór activering nog werkelijk worden ingesteld en getest.

De nieuwe API-verificatie controleert echte lokale HTTP-aanvragen en uitsluitend de eigen synthetische SQLite-records, samenvattingstoestemming, dubbele aanvraag-ID's, foutstatussen, requestgrootte, Origin/Host en geautoriseerde opslagcontrole. Retentie en atomische beveiligingstellers hebben afzonderlijke tests met in-memory data. De definitieve pass/fail-uitkomst, build-ID en datum staan in het uiteindelijke rapport onder `reports/seo/`; eerdere crawls en scores zijn geen automatische goedkeuring van latere wijzigingen. Een lokale test bewijst geen live Neon-opslag of Vercel-deployment.

**Aantoonbaar gecontroleerd op 15 september 2026:** de native Next-API-test van 19:09 UTC slaagt met **14 testgroepen en nul fouten**, inclusief de acht geïsoleerde runtimegevallen. Het rapport noemt build-ID `mZUGafEWVBAlR3rA5mg_D`: [API-bewijs](reports/seo/api-final-migration-2026-09-15T19-09-20-824Z-1e1fc99a.json). De aansluitende native HTML-crawl controleert **34 routes en 2.153 interne linkverwijzingen zonder bevindingen**: [crawlrapport](reports/seo/final-native/summary.json). Dit betreft de lokale productiebuild. De werkelijke runtime-exemplaar-ID wordt niet door de API gepubliceerd; het API-rapport legt de bij de test aanwezige buildbestanden vast.

Nog open voor de openbare oplevering: daadwerkelijke Vercel- en Neon-inrichting, productieschema en geheimen, domein/DNS, controle van de eerste cronuitvoering, Analytics-property, e-mailmelding of een andere aantoonbare aanvraagopvolging, en ontbrekende KvK-/btw-/contactgegevens. Een succesvolle formuliermelding bevestigt opslag van de aanvraag; er is nog geen e-mailbezorging of definitief geboekt tijdslot. De bevestigde 60/40-betaling, btw-presentatie en minimale eerste hostingperiode staan centraal in `lib/business.ts` en worden op de relevante pagina's gebruikt.


---

# Sitesnit — oplevering

## Actuele aanvulling — 15 september 2026, Limburg en pagina-SEO

Zie [de regionale vergelijking en besluiten](docs/seo-limburg-vergelijking.md). Acht bureauwebsites uit Noord-, Midden- en Zuid-Limburg zijn inhoudelijk vergeleken. Startadvies: homepage voor Limburg, bestaande Venlo-pagina bij livegang, Baarlo alleen als eigen verdieping met aanvullende inhoud; geen wachttijd op basis van websiteleeftijd en geen gekopieerde stadspagina’s.

Alle 31 routes hebben nu pagina-specifieke JSON-LD, unieke metadata en een eigen OG-beeld. Titles, descriptions en pagina-JSON komen uit dezelfde bron; diensttitels zijn concreter gemaakt. De checks leggen hun onderzoek en uitkomst beter uit. Baarlo en de optionele belafspraak zijn duidelijker zichtbaar. De navigatie in het ontwerpvoorbeeld blijft binnen het voorbeeld, met een terugknop en vaste Sitesnit-acties naar keuzes, tools en contact.

**Getest op de nieuwe build:** TypeScript, gerichte ESLint-controle en productiebuild PASS. De uitgebreide HTML-crawl controleerde 31 routes en 1.777 interne links, zonder bevindingen. Bewijs: [reports/seo/limburg-review/summary.json](reports/seo/limburg-review/summary.json) en de CSV-bestanden ernaast. Browsercontrole: desktop, mobiele onepager en contactoverdracht, 390 en 320 pixels zonder horizontale overflow; opengeklapte checkuitleg op 390 pixels. Alleen browseremulatie, geen echte telefoon. Geen nieuwe Lighthouse-meting of externe contactverzending uitgevoerd; eerdere metingen hieronder blijven historische metingen.

De preview draait op `http://127.0.0.1:5184/` en blijft noindex. Nog open: echte persoon/foto en klantreviews, definitieve eenmalige pakketvoorwaarden en btw-vermelding, automatische e-mailmelding voor aanvragen en livegang/zoekmachineaccounts. Er is niet gepubliceerd.

## Vorige versie — 14 september 2026, SEO, OG en toolcontact

Het actuele bewijs en de open livegangpunten staan in [docs/seo-release.md](docs/seo-release.md). De lokale preview blijft `http://127.0.0.1:5184/`; het bevestigde toekomstige domein is `https://sitesnit.nl`. De website bevat 31 pagina's met unieke zelfontworpen OG-beelden, de Venlo-pagina en een sterker contactpad vanuit de ontwerptool. Google PageSpeed en lokale aanvraagopslag zijn echt getest. De preview blijft noindex. Er is niet gepubliceerd.

De oudere versies hieronder bewaren de ontstaansgeschiedenis. Hun eerdere screenshots, scores, open domeinvraag en beschrijving van het fotografische laptopkader zijn niet de actuele stand; het kader is inmiddels CSS. Gebruik het nieuwe SEO-rapport en de daarin genoemde buildhash voor de eindcontrole.

## Eerdere versie — 13 september 2026, diensten en visuele verdieping

De onderstaande beschrijving hoort bij de versie van 13 september. Het overzicht van 14 september en het SEO-rapport zijn leidend.

**Diensten en klantpad.** Het dienstenoverzicht heeft vier hoofdstukken, inclusief een volledig ontworpen onderdeel ‘Ook na de lancering’. Webdesign, SEO/content/social en tools/automatisering leiden naar drie gelijk ingedeelde hoofdpagina’s. Daaronder staan acht inhoudelijk eigen subpagina’s voor webshops, merk/identiteit, SEO-optimalisatie, content, social media, hosting/onderhoud, formulieren/rekentools en AI/koppelingen. Uitleg, stappen en veelgestelde vragen staan direct zichtbaar. De prijsloze websitepakketgids blijft een aparte uitlegroute.

**Rust en beweging.** Nieuwe illustraties in HTML/CSS maken huisstijltoepassingen, artikelopbouw, contentvariatie, technische controles, interne links, bestellingen en gegevensoverdracht zichtbaar. Tussen de tweede en derde uitlegsectie van de subpagina’s staat een onderwerpgebonden visuele onderbreking; bij rekentools is dit een bedienbare tijdberekening. Dubbele toelichtingen zijn geschrapt. De voortgang volgt het scrollen over een stilstaand meetelement. Kleine onderdelen bewegen, tekst blijft leesbaar. Onderhoudsillustraties en andere scènes worden alleen nabij het scherm bijgewerkt, zonder permanente animatielus. De hero-animatie start niet meer op routes zonder hero of projectkaarten.

**Projecten en beeldkwaliteit.** Beurswijzer en Beurswatcher staan samen in het eerste webdesignhoofdstuk van het overzicht. De dienstenverdiepingen gebruiken vooral eigen illustraties; formulieren/rekentools heeft één korte tekstverwijzing naar een case. De zijpanelen van de hero en mobiele projectweergaven zijn nu in code getekend, op basis van de bekeken originele schermen. Het fotorealistische laptopkader blijft WebP. Grafieken en brede case-opnamen blijven echte responsieve WebP. De telefoonillustraties zijn als ontwerpbeeld gelabeld en de preview is bereikbaar via de expliciete previewlink.

**Prijzen op de juiste plek.** De onderhoudspagina toont de bevestigde maandpakketten van €5, €29,99 en €69,99. Content toont twee blogs voor €175 en vier voor €325 per maand. Social media toont de volledige matrix voor 4/6/8 basisposts op 1/2/3 platforms. Alle maandbedragen vermelden exclusief btw en hebben zichtbare scope en vervolgactie. De kostenpagina blijft bij websitebouw: €895, €1.895, maatwerk vanaf €2.750 en circa €4.000 als eigenaarbevestigde context voor een groter project. Maanddiensten worden daar alleen met relevante links genoemd.

**Contact.** ‘Ook laten verzorgen?’ is optioneel en standaard ingeklapt. Keuzes blijven behouden en de samenvatting toont wat geselecteerd is. Links naar de dienstprijzen openen apart, zodat de invoer behouden blijft. Een gekozen maandpakket wordt meegenomen zonder het websitepakket te overschrijven. Bellen is optioneel; de bezoeker kiest een dag en eventueel tijd. Werkdagen ondersteunen 18:00–21:30, weekenden de hele dag. Dit is een voorkeur, geen gereserveerde afspraak. De uiteindelijke aanvraag met vier blogs, socialmedia-interesse en vrijdag 18:30 is lokaal in D1 gecontroleerd; de twee eigen testaanvragen zijn daarna op exacte test-ID en testadres verwijderd. API en databaseschema zijn behouden. Automatische e-mailnotificaties zijn nog niet gekoppeld.

**Casefeedback.** Op verzoek zijn voorbeeldreacties vormgegeven. Ze dragen zichtbaar het label ‘Voorbeeldreactie’ en de toelichting dat de echte klantreactie volgt. Er zijn geen namen, Google-beoordelingen, sterren of review-structured-data verzonnen.

**Verificatie.** Productiebuild, TypeScript en gerichte ESLint-controles slagen. De HTTP-crawl controleerde 26 routes en 1.089 interne verwijzingen zonder ontbrekende pagina’s of ankers. De laatste bronwijzigingen verwijderen dubbele tekst, overbodige animatie-initialisatie en een redundante telefoonlink; ze veranderen de dienstenstructuur niet. CUA-browsercontrole omvat 320/390 pixels, 768 en 1440 pixels, de nieuwe visuele onderbrekingen, prijzen, contactkeuzes, dag/tijdvalidatie, rekendemo, hero en telefooncomposities. Gevonden legacy CSS die de hele subpagina in twee kolommen zette is verholpen. Geen horizontale overflow of consolefouten in de gecontroleerde staten. Browseremulatie, geen fysieke telefoontest.

De mobiele Lighthouse-meting van het dienstenoverzicht geeft **97 / 100 / 100 / 100**, LCP 2,2 s, TBT 80 ms en CLS 0. De onderhoudspagina geeft na de correcties **98 / 100 / 100 / 100**, LCP 2,1 s, TBT 40 ms en CLS 0. De eerste onderhoudsmeting gaf 78 en is als eerdere meting bewaard; meetvariatie maakt het onjuist de volledige verbetering aan één wijziging toe te schrijven. Rapporten en actuele previewgegevens staan in `.sites-runtime/PREVIEW.md`. Labmetingen zijn geen garantie voor iedere bezoeker; gedeelde frameworkcode en blokkerende CSS blijven aandachtspunten.

De homepage geeft in de laatste meting **86 / 100 / 100 / 100**, LCP 2,9 s, TBT 340 ms en CLS 0. De voorafgaande meting gaf 95 prestaties, LCP 2,7 s en TBT 70 ms. Tussen deze metingen is alleen de redundante telefoonlink verwijderd om een label/name-mismatch op te lossen; deze toegankelijkheidsmelding is in de laatste meting verdwenen. De opstarttijd van home varieert in de lokale labmetingen en blijft een aandachtspunt. Er wordt geen vaste 95+-score of volledige afwezigheid van haperingen beloofd.

Er is alleen lokaal gewerkt en niet gepubliceerd. Echte Google-klantreviews, definitieve bedrijfsgegevens, e-mailnotificaties en publicatie blijven afzonderlijke vervolgstappen.

## Historie van eerdere werkversies

Onderstaande notities beschrijven eerdere stappen. Historische afbeeldingen, prijsplaatsing, routeaantallen en Lighthouse-scores kunnen afwijken van het actuele overzicht hierboven.

De aangescherpte richting gebruikt een warme lichte basis, diep petrol, helder blauw, botergeel, abrikoos en zachte blauwgroene vlakken. Stevige Manrope-typografie, ronde vormen en openvouwende websitepanelen verbinden de pagina’s. Het scrollverhaal is opnieuw ontworpen; drie ruimere hoofdstukken maken webdesign, SEO en AI-automatisering concreet. De boogvorm vult mee tijdens scrollen. De hero gebruikt nu de headline **WE BUILD BRANDS.** en één samenhangend Beurswijzer-project.

Webfluencer, Whello en de aangeleverde video zijn daadwerkelijk bekeken. De video is lokaal via beeldfragmenten beoordeeld. Er zijn geen oude Sitesnit-layouts, kleuren of marketingteksten overgenomen.

## Pagina’s en tools

Home, diensten, drie dienstenverdiepingen, projecten, drie projectdetails, kosten, over Sitesnit, contact, privacy, websitecheck en prijscheck zijn uitgewerkt. De hero toont het aangewezen Beurswijzer-platform: een lichte HTML/SVG-reconstructie van de homepage in de laptop, met echte schermopnamen van artikelen en de budgetplanner ernaast. De projectsectie op home en projecten laat bezoekers zelf wisselen tussen Beurswijzer en Beurswatcher, met andere grafiekbeelden en echte mobiele opnamen. Daarnaast blijven drie duidelijk gelabelde ontwerpconcepten beschikbaar. De projectteksten beschrijven zichtbare functies en ontwerpkeuzes, zonder onbevestigde klantrelatie of meetbare resultaten te claimen. Zie BEURSWIJZER_ASSETS.md voor beeldbronnen.

Het dienstenoverzicht verwijst naar eigen pagina’s voor webdesign, SEO en AI-automatisering. Elke pagina heeft een herkenbare hero, een lichte illustratie in code, concrete stappen, mogelijke toepassingen en veelgestelde vragen. De keuze voor een dienst gaat mee naar het contactformulier. Voor losse diensten zijn geen onbevestigde tarieven of resultaten toegevoegd.

Pakketten: één pagina **€895**, vijf pagina’s **€1.895**, maatwerk **vanaf €2.750**. De 15-vragenprijscheck geeft vaste prijzen waar ze passen. Bij aanvullende wensen volgt de bevestigde basis met concrete open keuzes; onbevestigde toeslagen en bovengrenzen worden niet berekend. Budget verandert dezelfde scope niet. Verbeterwerk aan een bestaande website krijgt geen nieuwbouwprijs. De kostenpagina toont drie vergelijkbare kaarten met doelgroep, indeling, voorbeelden en een eigen contactroute. Op mobiel staan ze onder elkaar. Vragen over inhoud, kosten en vervolg worden uitgebreider toegelicht. Het door de eigenaar bevestigde gemiddelde van eerdere projecten, circa €4.000, staat als context bij maatwerk. Het is geen automatische prijs, minimum of bovengrens.

De beide vraagsets zijn voor deze website opnieuw samengesteld op basis van de briefing. De huidige rekenregels gebruiken uitsluitend de vastgestelde pakketprijzen.

De websitecheck stelt eerst alle 15 inhoudelijke vragen. Daarna volgt een aparte URL-stap en start Google PageSpeed Insights voor mobiel met vier categorieën. Een ander websiteadres meten kan zonder antwoorden te wissen. De sleutel blijft op de server. Echte audit-ID’s, metingen en onderbouwing bepalen technische adviezen. Antwoorden veranderen geen Lighthouse-score. URL, meetmoment en beperkingen van de mobiele labtest blijven zichtbaar.

Een echte analyse van **https://webfluencer.nl/** leverde contrast-, afbeeldings- en JavaScriptbevindingen op. In de browser is gecontroleerd dat deze daadwerkelijk in de belangrijkste adviezen terechtkomen. Ook een niet-bestaande openbare URL is echt aan Google aangeboden: de fout wordt zonder nepresultaat afgehandeld.

## Contact

Onder beide resultaten staat een volledig contactformulier om een belafspraak aan te vragen. Het gebruikt de actuele antwoorden, uitkomst, pakketkeuze en website. Eigen formulierinvoer blijft behouden bij antwoordwijzigingen of een later afgeronde scan. De gebruiker kan de samenvatting bekijken en meesturen uitschakelen; in dat laatste geval zit de samenvatting ook niet in de netwerkpayload. Een mailto-link kan de uitkomst in een eigen e-mailconcept meenemen. Er is geen bevestigd WhatsApp-nummer en geen externe boekingsagenda gekoppeld.

Aanvragen, pakketkeuze en optioneel de checkuitkomst worden werkelijk opgeslagen in D1. Alleen na geslaagde opslag volgt een bevestiging. Lokale testaanvragen en hun samenvatting zijn rechtstreeks in de database gecontroleerd. **Automatische e-mailnotificaties aan de eigenaar zijn nog niet gekoppeld.** De e-mailroute gebruikt het eerder beschikbare adres `info@sitesnit.nl`. Bellen wordt op afspraak afgestemd; er wordt geen geboekt tijdslot beloofd.

## Eerdere verificatie

- Twaalf pagina’s op 360, 390, 768, 1440 en 1920 pixels gecontroleerd: statuscode, titel, hoofdheading, beschrijving, canonical, afbeeldingen en overflow.
- Projectroute, pakketselectie, beide 15-stappenroutes, teruggaan, herladen, wijzigen, resetten en context in contact doorlopen.
- Echte geslaagde en mislukte Google-aanvraag getest. Tijdelijke onbeschikbaarheid en opnieuw proberen ook getest met een gesimuleerde serverfout, met behoud van antwoorden.
- Aanvraagfout getest zonder succesmelding; echte lokale opslag en de meegenomen samenvatting gecontroleerd.
- Mobiel menu met toetsenbord, focusbehoud, Escape, terugnavigatie, snel scrollen, schermrotatie en verminderde beweging getest.
- Screenshots van desktop, mobiel, formulieren en resultaten bekeken; gevonden contrast-, metadata- en compositieproblemen hersteld.

Er was alleen **browseremulatie**, geen fysieke telefoon. Automatische toegankelijkheidscontroles vervangen geen volledige handmatige WCAG-audit.

De prijzen en toolwijzigingen zijn eerder getest met de echte Google-koppeling. De oorspronkelijke versie, vóór de fotorealistische laptop en projectslider, behaalde in een lokale mobiele Lighthouse-meting **94 prestaties, 100 toegankelijkheid, 100 best practices en 100 SEO**. FCP was 1,7 s, LCP 2,9 s, totale blokkeertijd 40 ms en CLS 0. Deze historische score hoort niet bij de huidige hero. Axe vond toen geen overtredingen op de gecontroleerde pagina’s, het mobiele menu en de vraagstap. De actuele metingen staan hieronder.

De volledige oorspronkelijke gebouwde versie is op twaalf pagina’s en vijf schermbreedtes gecontroleerd. De 3D-opening is daarbij aanvullend op meerdere scrollposities, bij verminderde beweging en met de directe projectlink getest.

De daaropvolgende Beurswijzer-hero is opnieuw in de browser beoordeeld op 360, 390, 768, 900, 1280, 1440 en 1920 pixels breed. De homepage in de laptop, uitklappende artikelen en budgetplanner zijn verschillende echte schermbeelden. Op desktop sluiten de panelen voordat de laptop naar de groene Beurswijzer-projectsectie doorzoomt. Op mobiel verschijnen de extra schermen compacter onder de laptop en blijft de uitleg in normale leesvolgorde staan. Gevonden mobiele clipping en overlap met het projectlabel zijn hersteld. De projectlink, terugscrollen, afbeeldingen en het bijgewerkte projectenoverzicht zijn gecontroleerd; geen browserfouten gezien. De bestaande statische variant bij verminderde beweging blijft in de broncode behouden. Er is voor deze laatste hero-wijziging geen nieuwe Lighthouse-score gemeten.

Aanvullende WebMCP-acties gebruiken dezelfde antwoordstatus als de interface. Geldige en ongeldige invoer zijn via een testregistratie gecontroleerd. Een echte ondersteunde WebMCP-browsercontext was niet beschikbaar; die specifieke integratie is niet als volledig geverifieerd aangemerkt.

### Eerdere verfijning: laptop, grafieken en projectslider

De laptop gebruikt nu een fotorealistisch, merkloos apparaatkader met een afzonderlijk echt schermbeeld. Een groene ovale vorm verbindt de drie hero-beelden. De beperktere zoom, nieuwe schermopname en minder gecomprimeerde zijpanelen beperken zichtbaar kwaliteitsverlies. De projectsectie toont nieuwe grafieken en een telefoonweergave, met eigen uitleg per beeld. Beurswatcher is toegevoegd via de door de gebruiker bevestigde tijdelijke preview-URL. Projectwissels veranderen de hele sectie geleidelijk van groen naar blauwgeel, zonder automatisch afspelen.

De laatste versie is in de browser bekeken op 360, 390, 768, 1440 en 1920 pixels. De uitklapfase, terugscrollen, mobiele telefooncompositie, projectknoppen, pijlen, toetsenbordbediening en horizontaal terugschuiven zijn gecontroleerd. De aparte projectenpagina wisselt eveneens correct. Geen horizontale pagina-overflow of ontbrekende beelden gevonden. Een laadfout in de eerste carouseluitwerking is opgelost door native horizontaal scrollen met CSS-snap te gebruiken. Kleine tussenbeelden op tablet en overlap van kleurverlopen met tekst zijn hersteld. TypeScript en de volledige productiebuild slagen. Er is geen nieuwe Lighthouse-meting gedaan; verminderde beweging is in de implementatie behouden, maar in deze laatste ronde niet opnieuw via een browserinstelling getest.

## Huidige verfijning: mobiel, lichtere hero en verdiepende pagina’s

De headline WE BUILD BRANDS is zwaarder gezet. De hero gebruikt een platte compositie van het laptopkader, de in code getekende homepage en twee echte screenshotpanelen. De groene vorm groeit minder ver. Muisgestuurde beweging van de hero is verwijderd; scrollmetingen worden gecachet en alleen veranderde waarden worden geschreven. Onderliggende scrollscènes worden alleen dichtbij het scherm bijgewerkt. Er is geen constante animatielus wanneer niets beweegt. De bestaande statische variant bij verminderde beweging blijft beschikbaar.

Het projectblok is ingekort tot circa 600 pixels op een desktop van 1440 pixels en circa 815 pixels op een telefoon van 390 pixels. Grafiek en telefoon vormen één compositie, met twee korte verklaringen. De native slider heeft knoppen, pijlen, swipe en toetsenbordbediening. De hero-eindlaag bedekt de volgende sectie niet meer; de projectkleur vervaagt daar over de juiste achtergrond.

De animatie van ‘Waar sta jij?’ begint wanneer de illustratie 78% van de schermhoogte bereikt en is voltooid bij 22%. In de browser is de voortgang bij 70% en 50% schermhoogte gecontroleerd: respectievelijk circa 0,055 en 0,499. Diensten, projecten en over Sitesnit hebben een sterkere hero. ‘Samen aan de slag’ beschrijft vier concrete stappen en verwijst naar contact. De nieuwe footer bundelt diensten, werk, kosten en contact met een duidelijke uitnodiging.

De nieuwe versie is visueel gecontroleerd op telefoon (360 en 390 pixels), tablet (768 pixels) en desktop (1440 en 1920 pixels). De hero-uitklapfase, doorzoom, nieuwe codepreview, compacte projectcompositie, projectwisseling, dienstenpagina’s, kostenkaarten, FAQ en footer zijn beoordeeld. De pakketroute kiest het juiste pakket op contact. TypeScript, gerichte ESLint-controle en de volledige productiebuild slagen. Deze ronde gebruikt browseremulatie; er is geen fysieke telefoon of afzonderlijke GPU-frametijdmeting gebruikt. Verminderde beweging is in deze ronde in de implementatie nagekeken, niet opnieuw met een browserinstelling getest.

Actuele lokale Lighthouse-meting op de productiebuild (mobiele simulatie, 13 september 2026): de home behaalt **93 prestaties / 100 toegankelijkheid / 100 best practices / 100 SEO**, met FCP 1,8 s, LCP 2,9 s, TBT 150 ms en CLS 0. De eerste meting in deze verfijningsronde gaf 88 prestaties en LCP 3,7 s. Geladen beelddata daalde van 515.283 naar 165.026 bytes (circa 68%); de totale overdracht daalde van 723.996 naar 353.916 bytes. Dit zijn labmetingen, geen garantie voor elk apparaat of de uiteindelijke hosting. Resterende aandachtspunten zijn gedeelde frameworkcode en blokkerende CSS.

De kostenpagina behaalt **98 / 100 / 100 / 100**, met FCP 1,6 s, LCP 2,2 s, TBT 30 ms en CLS 0. De webdesignpagina behaalt eveneens **98 / 100 / 100 / 100**, met FCP 1,6 s, LCP 2,1 s, TBT 20 ms en CLS 0. De rapporten staan lokaal in `.sites-runtime/qa/mobile-home-light.html`, `mobile-kosten-refined.html` en `mobile-webdesign-refined.html`. De andere twee dienstenpagina’s delen dezelfde opbouw en zijn visueel gecontroleerd, maar kregen geen eigen Lighthouse-meting.

## SEO en regio

De homepage draagt webdesign en website laten maken in **Nederlands Limburg**. De gecontroleerde zoekresultaten voor Limburg en Venlo tonen vooral commerciële bureau-, werk- en prijspagina’s. Dit ondersteunt één samenhangende commerciële pagina per regio. Er zijn geen zoekvolumes of concurrentiecijfers aangenomen. Voorbeelden van gecontroleerde resultaten: [MIHERA](https://mihera.nl/) en [Webdesign Venlo](https://www.webdesign-venlo.nl/index.php).

Unieke paginatitels, beschrijvingen, canonicals, sitemap, robots.txt, echte HTML-links, servergerenderde inhoud en bedrijfsgegevens zonder verzonnen vestiging zijn aanwezig. Metadata staat direct in de HTML-head. Persoonlijke resultaten en API-antwoorden worden niet geïndexeerd. Toolstarts en afrondingen worden zonder persoonsgegevens apart opgeslagen; echte aanvragen staan in de aanvraagregistratie. Search Console-verificatie is voorbereid via `GOOGLE_SITE_VERIFICATION`.

**Een zelfstandige Venlo-pagina wacht op echte lokale inhoud.** Er zijn geen fictieve lokale klanten, kantooradressen of gekopieerde plaatsnaamlandingspagina’s gemaakt. Redirects voor oude URL’s wachten op een bevestigde URL-lijst.

De werkende preview draait lokaal op http://127.0.0.1:5184/. Er is nog niet gepubliceerd: automatische review blokkeerde de export van de volledige broncode naar de Sites-Git-repository. Expliciete toestemming voor die export staat nog open. De aangemaakte Sites-omgeving is ingesteld voor alleen de eigenaar. Zoekposities, Search Console-data en Core Web Vitals van echte bezoekers zijn pas na openbare publicatie te beoordelen. De lokale Lighthouse-test is een gesimuleerde mobiele labmeting; [Google licht deze testmethode toe](https://developer.chrome.com/docs/lighthouse/overview/).

## Nog te bevestigen

- Btw-vermelding bij eenmalige websitebouw, revisierondes en levertijd. De maandprijzen en hun inbegrepen werkzaamheden zijn inmiddels bevestigd; zie de uitbreiding hieronder.
- Handelsadres, KvK-nummer, btw-nummer en definitieve contactgegevens.
- Persoonlijke naam/foto en aantoonbare resultaten of echte klantquotes. Beurswijzer en Beurswatcher zijn uitgewerkt als bevestigde projecten.
- Bewaartermijnen en verdere privacy-inrichting; de huidige uitleg beschrijft de gebouwde gegevensstromen.
- E-mailnotificaties, gewenste afsprakenroute, eigen domein en Search Console-verificatie.
- Lokale aanknopingspunten voor Venlo en een lijst met oude URL’s voor redirects.

Deze open punten staan in de oplevering, niet als interne opmerkingen tussen de commerciële websiteteksten.

## Uitbreiding diensten, cases en maandpakketten — 13 september 2026

De dienstenhub groepeert acht eigen verdiepingen: webdesign, webshops, merk/identiteit, SEO, content/copywriting, social media, onderhoud/hosting en AI/automatisering. De prijsloze pakketgids staat op /diensten/webdesign/pakketten en verwijst voor kiezen en aanvragen naar /kosten. De projectenpagina heeft een eigen overzicht met twee volledige casepagina’s voor Beurswijzer en Beurswatcher. De eerder bevestigde wekelijkse blogwerkzaamheden, SEO-basis, hosting en onderhoud staan bij deze cases. Er zijn geen verzonnen resultaten, Google-reviews of vestigingen toegevoegd.

Bevestigde maandprijzen, exclusief btw: hosting €5; hosting met technisch onderhoud €29,99; hosting, onderhoud en SEO €69,99. De onderhoudsniveaus bevatten maandelijkse controle op snelheid en technische fouten en herstel binnen de bestaande website. Het hoogste niveau omvat daarnaast doorlopende SEO-aanpassingen aan bestaande teksten en code. Nieuwe artikelen zijn aparte contentpakketten: 2 blogs per maand €175 of 4 blogs per maand €325, inclusief onderwerpenonderzoek, schrijven, SEO-opmaak en publicatie. Vier blogs per maand betekent een exact maandaantal, geen garantie van 52 artikelen per jaar.

Social media betreft Instagram, Facebook en LinkedIn. Dezelfde basisposts worden aangepast en geplaatst per gekozen platform. Voor 4 posts per platform per maand kosten 1/2/3 platforms €149/€174/€199; voor 6 posts €199/€234/€269; voor 8 posts €249/€294/€339. De kostenpagina en socialmediadienst tonen de volledige matrix. Vier basisposts op drie platforms betekenen twaalf plaatsingen, geen twaalf afzonderlijke onderwerpen. Aanvullende beeldproductie, advertenties en reactiebeheer worden afzonderlijk afgestemd.

De contactpagina neemt de gekozen dienst, een voorbeeldproject of het gekozen aantal blogs mee in de aanvraag. De bestaande D1-opslag en API zijn behouden. De checks gebruiken focus met preventScroll en scrollen alleen bij een daadwerkelijke stapwisseling rustig naar een vraag die buiten beeld staat. Antwoorden en een al geopend contactformulier blijven gemonteerd. Bij verminderde beweging wordt direct gescrold. De decoratieve startkaart veroorzaakt geen horizontale scroll en het contrast is hersteld na controle van de eerder geladen toolstijlen.

AI-voorbeelden maken onderscheid tussen bestaande rekentools en mogelijke uitbreidingen. Beurswijzer vergelijkt zelf ingevulde offertes; een actuele aanbiedersvergelijking vereist een passende databron en API-toegang. De Beurswatcher-calculator rekent met vaste regels; er is niet beweerd dat de bestaande calculator AI gebruikt. Achtergronden zijn gecontroleerd op de openbare projectdemo’s, de officiële API-documentatie van Daisycon, HubSpot, Mollie en Moneybird en Googles Search Central-documentatie over nuttige inhoud en interne links.

Gecontroleerd: TypeScript, gerichte ESLint-controle en volledige productiebuild. De bestaande tests voor prijsregels, de twee sets van 15 vragen en Lighthouse-adviezen slagen. Negentien nieuwe/aangepaste routes inclusief sitemap geven HTTP 200 met eigen paginatitels. Browsercontrole op 360/390 pixels, tablet 768 en desktop 1440 omvat onder meer de dienstenhub, AI-hero, cases, kostenmatrix, contactcontext en beide checks. Volgende/vorige bewaren de selectie en plaatsen de focus bij de nieuwe vraag; de websitecheck is ook met Enter bediend. De gecontroleerde browserconsole bevat geen fouten. De technische Google-scan en het extern versturen van aanvragen zijn deze ronde niet opnieuw uitgevoerd: de API-logica is niet gewijzigd.
De laatste CSS-optimalisatie laadt de extra stijlen uitsluitend op diensten-, case-, kosten-, over-, contact- en checkroutes. De homepage gebruikt dezelfde CSS-bundel als vóór de uitbreiding: 19.972 bytes overdracht. Totale homepageoverdracht is 354.240 bytes. De hero houdt zijn bestaande lichte codepreview en WebP-varianten.

Actuele Lighthouse-metingen van de uiteindelijke productiebuild: home **88 prestaties / 100 toegankelijkheid / 100 best practices / 100 SEO**, FCP 1,9 s, LCP 3,0 s, TBT 250 ms, CLS 0. Prijscheck **95 / 100 / 100 / 100**, FCP 1,9 s, LCP 2,4 s, TBT 170 ms, CLS 0. Rapporten: `.sites-runtime/qa/mobile-home-scoped.html` en `mobile-prijscheck-scoped.html`. De eerdere homepage93- en kosten/webdesign98-scores hierboven horen bij de toenmalige build; deze ronde zijn niet alle subpagina’s apart met Lighthouse gemeten. De resterende homepagepunten zijn uitvoering van gedeelde frameworkcode, blokkerende CSS en beeldlevering. Dit zijn mobiele labmetingen op deze werkplek, geen veldmetingen op fysieke telefoons of garantie voor alle apparaten.

## Visuele herwerking diensten en projecten — 13 september 2026

Na de laatste bijsturing geeft de dienstenpagina een beknopte introductie van drie hoofdroutes: webdesign/webshops, SEO/content en tools/automatisering. Onderhoud staat in een kort aansluitend onderdeel. Er is nog één ontwerpvoorbeeld; uitgebreide financiële projectvoorbeelden blijven op de verdiepingen. De hoofddiensten verdelen daarna de bijbehorende specialismen. Webdesign verwijst naar pakketten, branding, webshops en formulieren; SEO naar content, social media en doorlopend onderhoud. AI/automatisering heeft herkenbare ankers voor rekentools, formulieren, assistenten en koppelingen. De verdiepingen linken terug naar hun hoofddienst; gerelateerde diensten en contact blijven bereikbaar. Bestaande URL's, bevestigde prijzen en formulierlogica blijven behouden.

De acht dienstenverdiepingen hebben een visuele hero en een tweede voorbeeld naast uitklapbare uitleg. Echte WebP-schermbeelden tonen onder meer de mobiele Beurswijzer-indeling, artikelen, budgetplanner en de Beurswatcher-calculator. Webshops gebruikt een functioneel schema van kiezen, bestellen en verwerken; dit wordt niet als bestaande klantwinkel gepresenteerd. De pakketgids heeft eveneens een echt ontwerp als visuele introductie.

Het projectenoverzicht heeft twee eigen, ruime portfolio-presentaties in plaats van de homepage-slider of compacte tekstkaarten. De casepagina's verbinden verschillende schermbeelden met concrete ontwerpkeuzes, tools, mobiel gebruik en het bevestigde doorlopende beheer. De Beurswatcher-calculator verschijnt niet langer ook als openingsbeeld.

De scrollcomposities meten een vaste wrapper en verplaatsen alleen de onderdelen binnen die wrapper. Er is geen nieuwe animatiebibliotheek, permanente animatielus of vervagingsfilter toegevoegd. De hero staat direct open; verdere beeldlagen schuiven bij binnenkomst uiteen. Telefoon en beheertekst gebruiken een grid dat in hoogte meegroeit, zodat ook tabletbreedtes en grotere tekst passen. Bij verminderde beweging zijn de beelden volledig open en is de extra beweging uitgeschakeld. Afbeeldingen houden de juiste intrinsieke maten en gebruiken passende WebP-varianten.

Gecontroleerd in deze ronde: TypeScript, gerichte ESLint en productiebuild. Browsercontrole omvat de dienstenopbouw en een uitgeklapte aanpak op desktop, onderhoud op 768 pixels en alle acht diensten plus het projectenoverzicht en beide cases op 360 pixels. Deze routes hebben één hoofdkop en geen horizontale overflow. Op 390 pixels zijn de beeldcomposities en bijschriften visueel beoordeeld. Een echte doorklik naar de Beurswatcher-case start bovenaan. Verminderde beweging is in deze ronde in de implementatie beoordeeld, niet op een fysiek apparaat gemeten.


De definitieve overzichtsversie is bovendien gecontroleerd op 320 pixels, 390 pixels, de 700px-overgang en 1440 pixels. Er is één visuele projectcompositie op de dienstenpagina. De mobiele volgorde is label, kop, ontwerpvoorbeeld en korte uitwerking. De lokale ankers voor formulieren, rekentools, assistenten en koppelingen bestaan en zijn bereikbaar. De browserconsole van de gecontroleerde eindversie bevat geen fouten. Een gemeten contrasttekort in de eerdere beheervisual is gecorrigeerd van #506b79 naar #365364.

De interne linkcontrole volgde alle lokale HTML-links vanaf diensten en projecten: 23 pagina’s en 1.013 linkverwijzingen, zonder ontbrekende pagina of anker. Het rapport staat in `.sites-runtime/qa/internal-links-final.json`. Ook tekst tijdens de aanvraaganimatie behoudt nu volledig contrast; alleen de positie beweegt.

Laatste mobiele Lighthouse-meting van de definitieve dienstenpagina: **97 prestaties / 100 toegankelijkheid / 100 best practices / 100 SEO**. FCP 1,8 s, LCP 2,3 s, TBT 60 ms en CLS 0. Rapport: `.sites-runtime/qa/mobile-diensten-accessible-final.html`. De eerdere scores van 94/96 en 98/96 horen bij tussenversies vóór de contrastcorrecties. Dit is een lokale mobiele labmeting, geen garantie voor iedere verbinding of apparaat. De browserpreview staat na het herstellen van de normale viewport op `/diensten` in tab 14; de oude foutmeldingstab 12 kon door het data-URL-beleid van de browsertool niet opnieuw worden gebruikt of gesloten.

