# Laatste aanpassing: navigatie en pakketprijzen

15 september 2026. Native Next-productiebuild `Z1srPOimHiVhwqlMOg8lT`, lokaal via `next start` op poort 5184.

## Aangepast

- De navigatie blijft op laptop en desktop bovenaan staan vanaf 801 pixels. Dit gebruikt native CSS `position: sticky`, zonder extra scrolllistener. De bestaande lichte achtergrond en een subtiele scheidingslijn houden de inhoud leesbaar.
- Ankerlinks, de juridische inhoudsopgave, de vragenzijbalk en de ontwerptool houden rekening met de navigatiehoogte. De geanimeerde homepage gebruikt de overblijvende schermhoogte; bij onvoldoende hoogte blijft de statische compositie beschikbaar.
- De oorzaak van de uitgerekte prijskaarten was een minimumhoogte van 104 pixels op iedere losse alinea. Die is verwijderd, samen met de onnodige minimumhoogte voor de pakkettitels. Op tablet staan de kaarten onder elkaar in een leesbare breedte in plaats van drie smalle kolommen.
- Onepager €895, Website €1.895 en maatwerk vanaf €2.750 staan voorop, uitdrukkelijk exclusief btw. Direct eronder staan €1.082,95, €2.292,95 en vanaf €3.327,50 inclusief 21% btw, in leesbare tekst van 16 pixels. De minimale investering inclusief het eerste hostingjaar blijft zichtbaar. Kosten, Home, Webdesign en de prijscheck gebruiken dezelfde volgorde. De rekenregels en pakketbedragen zijn niet gewijzigd.
- JSON-LD behoudt de werkelijk zichtbare consumentenbedragen met `valueAddedTaxIncluded: true`. De prijzen inclusief btw zijn niet verborgen achter een toggle of interactie. De [ACM-uitleg over prijsvermelding](https://www.acm.nl/nl/verkoop-aan-consumenten/consumenten-informeren/prijzen-vermelden) is bij deze presentatie opnieuw geraadpleegd.

## Gecontroleerd

- Productiebuild, TypeScript en ESLint van de gewijzigde componenten slagen.
- De bestaande prijs- en adviescontroles slagen: eenvoudige pakketten, extra pagina's, functies/koppelingen, budgetneutraliteit, bestaande verbeteropdrachten en beide sets van 15 vragen.
- De definitieve HTML-crawl controleert 35 pagina's en 2.248 interne links zonder bevindingen. Alle 89 gecontroleerde bestanden antwoorden met HTTP 200, waaronder 16 CSS- en 24 JavaScript-bestanden verspreid over de hele website. Dit zijn geen aantallen per pagina. Bewijs: `reports/seo/navbar-pricing-final/summary.json`.
- Home, Kosten en de ontwerptool laden hun moderne externe scripts asynchroon. De aparte Next-polyfill gebruikt `nomodule` en wordt door moderne browsers overgeslagen. Er zijn geen moderne parserblokkerende externe scripts in deze drie HTML-documenten. De belangrijkste lokale font is vooraf geladen; GA4 staat uit. Bewijs: `reports/seo/navbar-pricing-final/loading.json`.
- De noodzakelijke CSS staat in de eerste HTML, zodat bezoekers direct de juiste opmaak zien. Er is geen kunstmatige vertraging toegevoegd om een auditcijfer te verhogen. De eerder uitgevoerde splitsing van de ontwerptool en de footer blijft behouden.
- De prijskaarten zijn bekeken op 360, 390, 768, 1024, 1440 en 1920 pixels. Geen horizontale overflow of afgekapte kaartinhoud. De tabletcorrectie is op de definitieve build opnieuw bekeken: kaarten zijn 640 pixels breed en circa 606 pixels hoog. Desktopkaarten op 1440 pixels zijn circa 693 pixels hoog; losse korte btwregels krijgen geen lege rij meer.
- De sticky navigatie blijft bij scrollen op positie 0. Het tools-dropdownmenu opent binnen het scherm en Escape sluit het met focus terug op de menukop.
- De ontwerptool is opnieuw doorlopen tot het voorbeeld: de resultaatknoppen blijven op 102 pixels, onder de 94 pixels hoge navigatie. De contactactie komt uit bij het zichtbare formulier op circa 130 pixels. De bewaarde prijscheck toont de juiste vijfpaginawebsite, de beide btw-bedragen en het gekozen pakket bij contact.
- De homepageopening, de scrollscène en verder scrollen werken met de sticky navigatie. De mobiele navigatie opent als modal; Escape sluit het menu en zet de focus terug op Menu openen. Dit is browseremulatie, geen fysieke telefooncontrole.

## Snelheidsmeting

De definitieve build is opnieuw lokaal gemeten met Lighthouse. Home: 93 mobiel en 99 desktop. Kosten: 81 mobiel in de eerste waarneming en 100 desktop. Alle vier metingen hebben toegankelijkheid en best practices 100. De lagere ruwe SEO-score komt door de opzettelijke preview-noindex.

De eerste mobiele Kosten-meting bevat een lange niet aan een specifieke bron toegewezen taak. Daarom is Kosten afzonderlijk herhaald: **92 en 93 mobiel**, met TBT 215 en 175 ms, LCP 2,80 en 2,75 seconden en CLS 0. De drie mobiele waarnemingen samen zijn 81/92/93, mediaan 92. Desktop scoort opnieuw 100. Toegankelijkheid en best practices blijven in alle herhalingen 100. De oorzaak van de eerste lagere waarneming is niet bewezen; deze blijft bewaard in `reports/lighthouse/navbar-pricing-final`. De herhaling staat in `reports/lighthouse/navbar-pricing-repeat`. Dit zijn lokale labmetingen, geen garantie voor alle apparaten of metingen van echte bezoekers.

## Status voor livegang

De lokale controles vervangen geen controle van een echte Vercel-deployment en Neon-productiedatabase. De eerder gemelde ontbrekende bedrijfsgegevens, aanvraagmail, GA4-inrichting en domein-/productieconfiguratie blijven van toepassing. Zie `eindcontrole-vercel.md` en `vercel-beheer.md`.

## Aanvulling 16 september: projectlinks

Build `ImFRwGRiHIvzeecRYzNHK`: projectafbeeldingen zijn geen links meer. Beurswijzer en Beurswatcher hebben ieder uitsluitend op hun eigen casepagina één externe tekstlink, met `rel="nofollow noopener noreferrer"` en een toegankelijke melding voor het nieuwe tabblad. Interne tekstlinks naar de cases blijven behouden.

Build, TypeScript en ESLint slagen. De volledige lokale crawl controleert opnieuw 35 pagina's en 2.248 interne links zonder bevindingen. Een aanvullende HTML-controle op alle 35 pagina's bevestigt precies twee externe projectlinks in totaal, uitsluitend op de juiste cases, beide nofollow, en nul gelinkte projectafbeeldingen. De plaatsing is in de browser bekeken; geen consolefouten. Bewijs: `reports/seo/project-links-final/summary.json` en `reports/seo/project-links-final/project-link-policy.json`. Er is voor deze linkwijziging geen nieuwe snelheidsmeting gedaan; eerdere Lighthouse-resultaten horen bij de hierboven vermelde eerdere builds.
