# Actuele artikelrender — 24 september 2026

Uitgevoerd door de hoofdtaak in de echte Codex-browser op de lokale Next-productiepreview `http://127.0.0.1:5184`, na de laatste geslaagde webpack/TypeScript-build. Geen productie- of fysieke-telefoontest.

## Concrete correcties

- Bij E2 werden schematische OG-illustraties foutief als ontwerpselecties benoemd. De browser toont nu twee figures met alt `Schematische deelillustratie bij de Beurswijzer-case` respectievelijk Beurswatcher en het zichtbare bijschrift `Schematische illustratie. Bekijk de echte uitwerking in de case.` Een echte mobiele screenshot van de eerste illustratie/bijschrift/CTA is bekeken: leesbaar, zonder overlap.
- Bij de eerste E2-proef was de mobiele documentbreedte 375 px en scrollWidth 386 px: de lange titel dwong de gridkolom breder. `min-width:0` op de introdivs en `overflow-wrap:anywhere;hyphens:auto` op de H1 verhelpen dit. Dit wordt niet gemaskeerd met een overflow-hidden op de pagina.

## Werkelijk doorlopen breedtematrix

Alle 18 artikelroutes hieronder zijn in de browser geladen op elk van 360, 390, 768, 1440 en 1920 px: **90 route/breedtewaarnemingen, nul horizontale overflow** (DOM document.clientWidth vergeleken met scrollWidth; scrollbar niet als inhoud geteld). Op 360 en 390 zijn ook de H1 en reeds geladen afbeeldingen gecontroleerd: nul kapotte geladen afbeeldingen. Lazy images buiten beeld worden door die laatste observatie niet volledig gedekt; E2-beelden zijn daarnaast zichtbaar bekeken.

- `/website-levert-geen-aanvragen-op`
- `/verouderde-website`
- `/website-niet-goed-op-mobiel`
- `/wat-kost-een-website`
- `/maandelijkse-kosten-website`
- `/website-onderhoud-kosten`
- `/website-offerte-aanvragen`
- `/website-offerte-checklist`
- `/bedrijfsprocessen-automatiseren`
- `/website-koppelen-aan-crm`
- `/afspraken-plannen-via-website`
- `/website-structuur`
- `/website-ontwerp-voorbeelden`
- `/seo-audit-checklist`
- `/website-niet-gevonden-google`
- `/website-snelheid-testen`
- `/404-fouten-oplossen`
- `/website-migratie-checklist`

Op 360px was voor alle 18 de inhouds- en scrollbreedte 345px, op 390px beide 375px. De overige drie breedtes gaven eveneens geen verschil groter dan één pixel. Browserautomatisering liep via CUA; alleen readonly-DOM-observaties naast normale navigatie, geen ingevoegde CSS of inhoud en geen aangepaste pagina-runtime.

Dit bewijs is een responsive rendercontrole, geen volledige interactieve/accessibility-/performance-audit van alle widgets, geen inhoudelijke beoordeling en geen eigenaargoedkeuring. Zie de afzonderlijke actuele redactionele review en technische crawl voor andere controles.
