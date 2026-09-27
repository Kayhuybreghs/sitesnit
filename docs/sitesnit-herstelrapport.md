# Sitesnit: gericht herstel en actuele controle

27 september 2026. Werkbranch `codex/contact-prijzen-herstel`, uitgangs-HEAD `9756e9c`. De werkboom bevatte veel bestaand werk dat niet in die commit zat. Het is behouden; de auditcommit `59e8390` is niet teruggezet. De actuele broncatalogus bevat 60 publieke routes, tegenover 59 in het historische register. De extra bestaande uitlegroute is geen reden geweest om routes te verwijderen.

Bronnen: het volledige aangeleverde promptbestand, uitvoeringscontract en documenten onder `bronmateriaal/`. De latere uitdrukkelijke gebruikersvraag voegt verbetering van beide case-detailpagina’s en verdere uitwerking van `/diensten` toe. De homepagegrens blijft gelden. **Geen push, merge, productiepromotie, DNS- of abonnementswijziging uitgevoerd.**

## Dekkingsmatrix

| Punt | Actuele bevinding en actie | Bestanden / bewijs | Test en status |
|---|---|---|---|
| A01 | Openbare aanvragen hadden geen complete duurzame tweemailverwerking. Eén transactie bewaart aanvraag, context en twee bevroren taken; eigenaar uitsluitend contact@sitesnit.nl. | `app/api/contact/route.ts`, `lib/contact/*`, `db/postgres/0003_contact_outbox.sql`, `app/contact/contact-form.tsx` | GEÏMPLEMENTEERD / LOKAAL GETEST. Concurrentie, rollback, afzonderlijke ontvangers en foutafhandeling met mocks; twee echte UI-inzendingen naar lokale opslag met mail uit. Productiemigratie en daadwerkelijke ontvangst OPEN. |
| A02 | Opgeslagen aanvraag en contactklik waren niet voldoende apart. `generate_lead` na opslag; `contact_intent` afzonderlijk; geen persoonsgegevens of querystrings. | `lib/analytics-events.ts`, contactformulier, analyticstests | LOKAAL GETEST: toestemming, eenmaal tellen, allowlist en weigering. GA4-key-eventinstelling niet gewijzigd. |
| A03 | Bestaande `/projects`- en `/about`-afbeeldingen doorliepen onnodig HTML-noncebeleid. Exacte lijst bestaande bestanden toegevoegd; onbekende paden blijven beschermd. | `proxy.ts`, `lib/public-asset-paths.ts` | LOKAAL GETEST met echte assets, pagina’s en onbekende `.jpg`-404. Geen brede bestandsextensie-uitzondering. |
| A04 | Requestafhankelijke root en nonce-CSP bestaan; dit bewijst geen fout. Geen rendering-/cachemigratie, uitgeschakelde CSP of gewijzigde hero. | Bestaande `layout`, proxy en lokale Lighthouse-rapporten | METING: zie performanceparagraaf. Geen bewezen snelheidswinst of veld-INP claimen. |
| A05 | Build alleen was geen complete kwaliteitscontrole. Typecheck, lint, tests, build en HTTP-routecontrole als CI toegevoegd. | `.github/workflows/quality.yml`, `package.json`, `scripts/test-public-routes.mjs` | Lokaal uitgevoerd. Workflow nog niet gepusht; verplichte branchstatus/deploymentblokkade extern NIET INGESTELD. Gerenderde browsercontrole is apart uitgevoerd, niet als automatische CI-browserjob ingericht. |
| A06 | Fouten waren onvoldoende herleidbaar. Veilige foutcategorieën, aanvraag-ID in private foutlog en per-mailstatus in adminoverzicht toegevoegd. | `app/hub/admin/aanvragen/*`, `app/api/hub/contact-mail/route.ts`, `lib/contact/admin.ts` | LOKAAL GETEST: aangenomen mails niet opnieuw versturen; providervergelijking controleert ontvanger en bevroren inhoud. Anonieme adminroute stuurt naar login. |
| A07 | Voorbeeld kon eigen offerte-invoer overschrijven. Native bevestigingsdialoog en herstel vorige voorstellen toegevoegd, met bestaande conceptkey behouden. | `app/tools/offertevergelijker/offer-comparer.tsx`, `offer-confirm.css` | BROWSER GETEST: annuleren, bevestigen, terugzetten, ingevuld derde voorstel behouden/verwijderen. Fictieve voorbeelden blijven gelabeld. |
| A08 | Auditcapaciteit is een product-/quota-afspraak, geen aangetoonde rekenfout. Bestaande SSRF-, robots-, timeout- en budgetgrenzen behouden. | Bestaande `lib/seo-audit/*`, scanroutes en testfixtures | Unit-/integratietests geslaagd; volledige nieuwe live scan met alle providerquota NIET GETEST. Geen grotere betaalde crawler toegevoegd. |
| A09 | Webdesign begon te vroeg bij aanverwante diensten. Bedrijfswebsites/pakketkeuze staan nu eerst. Algemene dienstenpagina aanvullend herschreven naar vijf concrete bedrijfsvragen. | `app/service-experience-data.ts`, `app/diensten/page.tsx`, `overview-intents.css` | GEÏMPLEMENTEERD; gerichte browser- en routecontrole na eindbuild. Geen homepage-secties verplaatst. |
| A10 | Dienstenhero’s hadden vooral scrollacties. Primaire aanvraag met gecontroleerde dienstcontext naast secundaire uitleg toegevoegd. | `app/service-experience.tsx`, scoped CSS, contactcontext | LOKAAL GETEST: dienst- en pakketcontext en 60 publieke routechecks. Geen globale hero-aanpassing. |
| A11 | Homepagekritiek blijft een commerciële hypothese. Ontwerp/hero niet gewijzigd. Bestaande link naar interactieve prijscheck gecontroleerd. | `reports/homepage-behoud.json`, `docs/homepage-advies-niet-uitgevoerd.md` | Beschermde hero-/layout-/beeldbronnen bytegelijk aan werkboombaseline. Exact compleet voor/na-screenshotpaar met gelijke animatiestand nog NIET volledig vastgelegd. |
| A12 | Hosting in Venlo was tegenstrijdig; prijsweergave niet overal gelijk. Centrale tarieven en ex-btw eerst toegepast. Alle websitepakketten krijgen eigen ontwerp; namen/ID’s/bedragen behouden. | `lib/business.ts`, `lib/pricing.ts`, `app/service-pricing.tsx`, `care-offers`, kosten, regio, prijscheck | GEÏMPLEMENTEERD / LOKAAL GETEST. Volledige tarieventabel in `aanbod-en-prijzen.md`; hosting 12 maanden, onderhoud/content optioneel. |
| A13 | Toolmetadata bevatte een vast, verouderd aantal. Description zonder vast aantal gemaakt. | `app/page-seo-data.ts` | LOKAAL GETEST: metadata bij alle 60 routes sluit aan op bron. |
| A14 | Concrete SEO-opmaakherhaling verwijderd; specifieke vervolgroute per pagina vastgelegd. Beide cases uitgebreid met opdracht, doelgroep, eigen rol, keuzes, schermen, opgeleverde functies en vervolg. | `docs/pagina-intenties-en-vervolgstappen.md`, service-data, `case-story-data.ts`, `case-components.tsx`, `case-study.css` | GEÏMPLEMENTEERD. Geen verzonnen testimonials, conversiestijgingen of aantallen. Iedere case behoudt één externe nofollow-link; beelden zijn geen externe links. |
| A15 | Historische audit was geen live acceptatie. Nu actuele code, lokale productiebuild, HTTP- en browsercontroles gebruikt. | `reports/routes-na-herstel.json`, tests en logbestanden | Zie onderstaande afbakening. Ontbrekende live verificaties blijven OPEN; geen universele PASS of nieuw rapportcijfer. |

## Nieuwe bewezen bevindingen

- N01: de brede lintopdracht nam gegenereerde `.vinext`- en rapportbestanden mee en liep tijdens de eerste controle vast op geheugen. Deze gegenereerde uitvoer staat nu in de ESLint-ignorelijst; broncode blijft meegenomen. Volledige lintcontrole daarna geslaagd.
- N02: de lokale HTTP-test gebruikte `fetch` met een productie-Host; Node 24 normaliseerde die header, waardoor de test ten onrechte lokale noindex als productiefout zag. Testclient gebruikt nu `http.get` met een expliciete Host. Productie-indexbeleid is niet verzwakt.
- N03: de laatste drie budgetopties in de prijscheck gebruikten nog inclusief-btw-eerst. Omgedraaid naar exclusief btw met het inclusieve bedrag als kleinere toelichting, zonder antwoordwaarden of berekening te veranderen.
- N04: Lighthouse vond te laag contrast in de scrollanimatie van de SEO-uitlegkaarten en een afwijkende toegankelijke naam van de auditcoverlink. De beweging blijft behouden met volledig leesbare tekst; de link gebruikt nu zijn zichtbare tekst als toegankelijke naam. Alleen de auditpagina is aangepast.

N01 en N02 betreffen de controle-inrichting. N03 en N04 zijn concrete inconsistenties in de pagina’s die lokaal zijn aangetoond.

## Uitgevoerde controles en grenzen

- Productiebuild met Next.js 16.3.4/webpack en TypeScript geslaagd; mail uit en geen productiedatabase in de testomgeving.
- Volledige unit-/integratieset op de eindversie: **167 geslaagd, 0 fouten**. Inclusief falende eigenaar-mail met geslaagde bezoekerbevestiging. In-memory contactmigratie geslaagd. Ook gerichte lintcontrole en TypeScript/productiebuild geslaagd. Een eerdere sandboxrun kon de testbundelaar niet bij zijn bron laten komen; de aansluitende lokale run met juiste toegang is volledig afgerond.
- HTTP-controle: 60 publieke routes, geen fouten in status/H1/metadata/canonical/indexbeleid/JSON-LD; interne ankerdoelen, afbeeldingsresponses, oude redirects, echte 404, sitemap en anonieme adminafscherming gecontroleerd. Geen claim dat iedere willekeurige externe link is getest.
- Browserrooktest van alle 60 pagina’s op 1440×900 en 390×844: hoofdinhoud zichtbaar, geen gevonden horizontale overflow of fatale browserfout. Dit is een rooktest, geen handmatige controle van iedere interactie onderaan iedere pagina.
- Contactpagina: lege invoer geweigerd; gemarkeerde lokale test met gekozen contentpakket opgeslagen, referentie en statusfocus zichtbaar. Toolformulier: overzicht aanvankelijk uit, bewust aangevinkt, lokale opslag succesvol. Resend stond uit; geen echte mail verzonden.
- Offertevergelijker: eigen invoer, voorbeeld annuleren/laden, herstel, derde ingevulde offerte annuleren/verwijderen en contact getest. Automatisering: 120 × 5 minuten = 10 uur, plan en concept na herladen behouden. Websitecheck: alle 15 vragen, teruggaan en ongeldig niet-openbaar scanadres getest. Prijscheck: alle 15 vragen, onepagerresultaat €895 excl./€1.082,95 incl., passende pakketselectie in contact en resultaat na herladen gecontroleerd. Ontwerptool: verplichte invoer, zes stappen, resultaat, stijl wisselen, mobiele voorbeeldweergave en interne contactpreview gecontroleerd; die preview verstuurt niets. De volledige externe Lighthouse-resultaatflow en alle overige foutscenario’s zijn niet als complete browser-E2E afgetekend.
- Nieuwe dienstenpagina en beide cases aanvullend op 320×780 en 768×1024 gecontroleerd: hoofdinhoud aanwezig, geen horizontale overflow of defecte geladen afbeeldingen. Desktopvormgeving en de mobiele Beurswatcher-case visueel bekeken. Toetsenbordnavigatie naar de SEO-sectie en de case-opdracht werkte.
- Hub: fixturetests omvatten afzonderlijke accounts, uitnodiging, verificatie, login, herstel, sessie-intrekking, rollen en tenantgrenzen. Geen nieuwe volledige browserronde met twee live klantaccounts gedaan en geen privé-klantgegevens gecrawld.
- Niet volledig uitgevoerd: alle templates op tablet/zoom/reduced motion, browsernetwerkonderbreking per unieke flow, twee echte afgeleverde contactmails, geactiveerde webhook/cron op productie en post-release GSC. Deze punten zijn geen PASS.

## Performance

Ruwe lokale metingen staan onder `reports/lighthouse/`. Iedere fase bewaart build-ID, SHA-256 van gebouwde bestanden, viewport/throttling en alle runs, ook fouten. De eerste fase had geen toegang tot de lokale testbrowser en is ongeldig als snelheidsmeting. De volgende fase werd tijdens de gebruikersinteractie onderbroken; de voltooide homepage-observaties zijn geen volledige meervoudige websitebrede eindmeting. Scores uit localhost zijn geen productie-SEO-cijfer: lokale noindex is daar opzettelijk actief. Geen beste toevallige run als garantie presenteren.

Fase `herstel-delivery` is volledig afgerond: 16 geldige runs, twee per apparaat per route, build `WgvofOKBE3SkOUebXWbdx`, gebouwde bestanden onveranderd tijdens de meting. Windows-laptop met gesimuleerde vertraging; geen velddata of bewezen verbetering tegenover een gelijkwaardige voormeting.

| Route | Mobiele performance, mediaan (bereik) | Desktop, mediaan (bereik) | Mobiele LCP mediaan | CLS mobiel |
|---|---:|---:|---:|---:|
| `/` | 76,5 (75–78) | 97 (96–98) | 3,42 s | 0 |
| `/diensten` | 88 (84–92) | 100 (100–100) | 3,07 s | 0 |
| `/kosten` | 94,5 (94–95) | 100 (100–100) | 2,77 s | 0 |
| `/tools/seo-audit` | 90,5 (87–94) | 100 (100–100) | 2,99 s | 0 |

Desktop-CLS op de homepage was 0,045. Mobiele laadprestaties blijven een aandachtspunt; dit geeft geen toestemming om de beschermde homepageopbouw of animatie in te korten. Deze meetbuild bevat de nieuwe dienstenpagina en cases. N03/N04 zijn erna gecorrigeerd; een gerichte vervolgmeting controleert de auditcorrectie. De tabel wordt niet als meting van een later gebouwde versie voorgesteld.

Die vervolgmeting is afgerond onder `reports/lighthouse/herstel-audit-accessibility/`, build `Lj3Ijxnu5heaiS1DBdflF`: vier geldige runs. De automatische toegankelijkheidsscore voor de auditpagina is bij alle vier 100 (was 96), beide concrete meldingen zijn verdwenen. Dit is geen volledige WCAG-certificering. Performance: mobiel mediaan 84, bereik 79–89; desktop mediaan 99,5, bereik 99–100. Mobiele LCP mediaan 3,23 s en CLS 0. De variatie blijft zichtbaar; deze correctie is geen aangetoonde snelheidswinst. De 60 HTTP-routechecks zijn op deze eindbuild opnieuw geslaagd. Diensten, beide cases en de gecorrigeerde budgetopties zijn ook opnieuw in de browser bekeken.

## Release, open configuratie en vervolg

De exacte mailinrichting en databehoudende rollback staan in `contactmail-inrichting.md`. Voor productie zijn additive migratie, serverflags, eigen Resend-webhook, controle van de bestaande dagelijkse job en echte ontvangst nodig. Geen geheimen in chat delen. De database blijft het bewijs van werkelijk ontvangen aanvragen; GA4 is aanvullend en toestemmingsafhankelijk.

Sitemap blijft `https://www.sitesnit.nl/sitemap.xml`; www, slugs, nuttige redirects en publiek indexbeleid zijn behouden. Geen kunstmatige nieuwe lastmod voor iedere build. Technische controle direct na release, indexering na 1–2 weken, eerste zoekpatronen rond 4 weken en vergelijkbare periodes rond 8 weken; bij weinig data langer. Dit is een werkritme, geen automatische monitoring of verkeersbelofte.
