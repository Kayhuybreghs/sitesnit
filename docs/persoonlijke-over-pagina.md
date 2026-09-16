# Persoonlijke Over Sitesnit-pagina — 16 september 2026

## Uitwerking

- Kay Huybreghs staat als maker achter Sitesnit centraal, met Baarlo als basis.
- Nieuwe persoonlijke teksten over het doel van Sitesnit, de samenwerking, websites/apps en passende vervolgdiensten. Geen verzonnen biografie, ervaring of klantresultaten.
- Drie overlappende vlakken: een naamkaart en twee duidelijk gelabelde beelden van bestaand werk. Echte portretfoto's zijn nog niet aangeleverd; de compositie is daarop voorbereid.
- Bovenaan en onderaan een directe contactroute. Optionele belvoorkeur: werkdagen 18.00–21.30 uur of in het weekend, na bevestiging van een afspraak.
- Eigen paginatitel en metaomschrijving, Person-gegevens voor Kay gekoppeld aan AboutPage en Organization. Geen niet-bestaande portretfoto in structured data.
- Alleen CSS voor de korte entreebeweging; bij verminderde beweging staat de collage direct stil. De twee WebP-beelden zijn samen 37.528 bytes.

## Controle

- ESLint voor de gewijzigde TypeScript-bestanden geslaagd.
- Productiebouw inclusief TypeScript geslaagd.
- Browseremulatie op 360, 390, 768, 1440 en 1920 pixels: geen horizontale documentoverflow of ontbrekende afbeeldingen.
- Mobiele en desktopcompositie visueel beoordeeld. Geen fysieke telefoon beschikbaar voor deze controle.
- Definitieve build: `MNgdHfFOJ5YzFv8LLB1FH`, lokaal actief op poort 5184.
- SEO-crawl van de definitieve build: 35 routes en 2.250 links gecontroleerd, nul gemelde problemen (`reports/seo/personal-about-final/summary.json`).
- Person en AboutPage in de daadwerkelijk gerenderde HTML gecontroleerd: verbonden via dezelfde persoon-ID; paginatitel en omschrijving zijn correct.
- De knop 'Bespreek je idee met Kay' opent het mobiele contactformulier. Geen consolefouten in deze browserroute; geen aanvraag verzonden.
- Definitieve collage op mobiel en desktop bekeken: naam zichtbaar boven de overlap, alle drie onderdelen eindigen volledig zichtbaar. Testviewport na afloop teruggezet.

## Nog nodig

Twee of drie echte foto's van Kay om de tijdelijke naamkaart/werkbeelden te vervangen door de gevraagde persoonlijke fotostapel. Geen stockpersoon of gegenereerd portret als eigenaar gebruikt.
