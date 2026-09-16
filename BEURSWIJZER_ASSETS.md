# Beurswijzer-projectbeelden

De gebruiker heeft https://beurswijzer.vercel.app/ op 13 september 2026 aangewezen als het enige project voor de hero. Het centrale laptopscherm is inmiddels een lichte visuele reconstructie in HTML en SVG. De uitklappende artikelen en budgetplanner blijven echte browseropnamen van deze website.

| Bestanden in public/projects/beurswijzer | Bron | Inhoud |
| --- | --- | --- |
| home-800.webp, home-1250.webp | https://beurswijzer.vercel.app/ | Homepage en merkidentiteit |
| insights-800.webp, insights-1250.webp | https://beurswijzer.vercel.app/inzichten/#nieuwste | Zoekfunctie en redactionele artikelen |
| planner-800.webp, planner-1250.webp | https://beurswijzer.vercel.app/budgetplanner/?example=marek | Openbaar fictief voorbeeldbudget; geen persoonlijke financiële gegevens |

Vastgelegd op 13 september 2026. De browserstrook is buiten de opname gehouden; de scrollbar is bij optimalisatie weggesneden. De screenshots zijn gecomprimeerd naar WebP in twee breedtes. Er zijn geen inhoudelijke wijzigingen aan de schermbeelden gemaakt.

De projectteksten beschrijven zichtbare ontwerpkeuzes en functies. Ze claimen geen onbevestigde klantrelatie, eigenaarschap van de website of gemeten bedrijfsresultaten. De andere drie portfolio-items blijven afzonderlijk als ontwerpconcepten gelabeld.

## Aanvulling: laptop en projectslider

De hero blijft uitsluitend Beurswijzer tonen. De volgende sectie gebruikt andere beelden en laat de bezoeker zelf tussen Beurswijzer en Beurswatcher wisselen. De gebruiker bevestigde https://beurswatcher.vercel.app/ als tijdelijke preview-URL, niet als definitief domein.

| Nieuw bestand in public/projects | Bron | Inhoud |
| --- | --- | --- |
| beurswijzer/home-sharp.webp | https://beurswijzer.vercel.app/ | Nieuwe desktopopname, 1410 × 754 pixels, voor het laptopscherm |
| beurswijzer/growth.webp | https://beurswijzer.vercel.app/budgetplanner/?example=marek | Andere uitsnede: grafiek met drie beleggingsscenario’s uit het openbare fictieve voorbeeldbudget |
| beurswijzer/mobile.webp | https://beurswijzer.vercel.app/ | Echte browseropname op telefoonformaat; geen verkleinde desktopweergave |
| beurswatcher/calculator.webp | https://beurswatcher.vercel.app/tools/rendement | Rendementcalculator met de openbare voorbeeldinvoer |
| beurswatcher/mobile.webp | https://beurswatcher.vercel.app/ | Echte mobiele homepage met blauwgele identiteit |
| laptop-frame.webp | Imagegen, gegenereerd op 13 september 2026 | Merkloos fotorealistisch laptopkader, transparante achtergrond, 1536 × 1024 pixels |

De oorspronkelijke telefoonopnamen zijn 360 × 811 pixels. Alle rasterbeelden van websites zijn echte screenshots; alleen het apparaatkader is gegenereerd. Het originele laptopbeeld en de generatiegegevens staan in `../laptop-asset/laptop-frame.png` en `../laptop-asset/laptop-frame.json`. Het scherm wordt in HTML afzonderlijk over het kader gelegd (x 132, y 77, breedte 1272, hoogte 680 in het originele kader), zodat de website niet in een gegenereerd beeld is ingebakken.

De grote artikel- en plannerbeelden zijn met minder compressieverlies opgeslagen. De maximale zoom is teruggebracht van 7× naar 2,7×; een groeiende groene vorm en kleurverloop verbinden de hero met de projectsectie zonder extreme uitvergroting van screenshotpixels.

## Eerdere lichte versie

`app/beurswijzer-screen.tsx` bouwt de centrale homepage visueel na met gewone HTML, CSS en één SVG-grafiek. Het gebruikt geen iframe, gekopieerde applicatiebundel, externe aanvragen of interactieve financiële berekening. De cijfers horen bij het decoratieve rekenvoorbeeld; deze preview is voor schermlezers verborgen. De schaalbare tekst vervangt de centrale rasteropname. De originele opname blijft als bronbestand bewaard.

De overige beelden gebruiken responsieve WebP-varianten. De browser kiest op basis van schermbreedte en pixeldichtheid; de grotere bronnen blijven beschikbaar voor scherpe weergave op grote en dichte schermen.

| Variant | Bestandsgrootte | Gebruik |
| --- | --- | --- |
| laptop-frame-800.webp | 31.200 bytes | Kleinere laptop; originele 1536-pixelversie blijft voor desktopzoom |
| beurswijzer/insights-480.webp | 15.696 bytes | Klein artikelpaneel; 800 en 1250 pixels blijven beschikbaar |
| beurswijzer/planner-480.webp | 10.864 bytes | Klein budgetpaneel; 800 en 1250 pixels blijven beschikbaar |
| beurswijzer/growth-640.webp | 18.652 bytes | Grafiek in de compacte projectsectie |
| beurswatcher/calculator-640.webp | 10.454 bytes | Grafiek in de tweede projectslide |
| beurswijzer/mobile-180.webp / mobile-270.webp | 12.992 / 22.482 bytes | Responsieve telefoonopname; origineel blijft beschikbaar |
| beurswatcher/mobile-180.webp / mobile-270.webp | 14.802 / 24.980 bytes | Responsieve telefoonopname; origineel blijft beschikbaar |

Nieuwe kleine varianten zijn met WebP-kwaliteit 90 opgeslagen; het laptopkader met kwaliteit 94 en alfakwaliteit 100. De beelden zijn samen met de codepreview op telefoon- en desktopformaat visueel gecontroleerd. Dit is verliesgevende compressie met behoud van de grote bronbestanden, geen claim van bit-identieke beeldkwaliteit.

## Actueel: schaalbare schermen — 13 september 2026

De twee zijpanelen in de hero worden nu door `app/beurswijzer-panels.tsx` in HTML, CSS en SVG opgebouwd, op basis van de genoemde artikel- en planneropnamen. De centrale homepage was al in code gemaakt. Het fotorealistische WebP-laptopkader blijft behouden. De drie schermen hoeven bij de zoom geen kleine rasterafbeelding uit te vergroten.

`app/project-phone-screen.tsx` tekent beide mobiele projectvoorbeelden in code, gebaseerd op de originele telefoonopnamen. Deze vereenvoudigde ontwerpweergaven staan in de projectslider, de combinatie op het dienstenoverzicht en bij toepasselijke casebeelden. Het zijn illustraties, geen live websites of actuele koersgegevens. De kaarten bevatten geen schijnbaar bedienbare knoppen. De eigenlijke projectgrafieken en brede case-opnamen blijven echte responsieve WebP-beelden; de casecovers hebben een aanvullende 1100-pixelkeuze en passende `sizes`.

Op de dienstenverdiepingen worden hoofdzakelijk eigen onderwerpillustraties gebruikt. Alleen op het dienstenoverzicht staan Beurswijzer en Beurswatcher samen in het webdesignhoofdstuk. De originele screenshots en varianten blijven als bronmateriaal bewaard, ook wanneer ze niet meer in de actuele hero of telefoonillustraties worden geladen.
