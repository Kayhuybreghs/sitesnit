# Verbeterbriefing — audit, navigatie en pagina-afwerking

Werk in de bestaande Sitesnit-site en bescherm bestaande functies. Maak de SEO-audit overzichtelijk met een uitlegbare totaalscore, afzonderlijke prioriteiten, aantallen onderzochte pagina’s en inhoudelijke categorieën. Bereken alleen op uitgevoerde controles; redirects, onbekende resultaten en handmatige aandachtspunten mogen niet automatisch fouten worden. Benoem de beperkte crawl en maak duidelijk dat dit geen Google-score of bewijs van indexering is. Behoud voorbeeldrapport, filters, bewijs en aanvraagroute.

Gebruik uitsluitend het bestaande beeldmerk in de navigatie. Geef WhatsApp en LinkedIn herkenbare, toegankelijke knoppen. Maak de foto’s op Over Sitesnit vooral op desktop groter, met behoud van de scrollinteractie en een bruikbare mobiele compositie. Verberg straat, huisnummer en postcode op Contact; behoud bedrijfsidentificatie in juridische informatie.

Geef Diensten een eigen visuele ingang naar het complete tooloverzicht. Verminder dubbele contactacties, zonder relevante vervolgstappen weg te nemen. Controleer publieke pagina’s op unieke titels, descriptions, canonicals, OG- en Twitterbeelden en passende JSON-LD. Breadcrumbs moeten de werkelijke paginaopbouw volgen, prijzen moeten met de zichtbare prijzen overeenkomen en FAQ-markup mag alleen bij zichtbare antwoorden horen. Geen verzonnen reviews, garanties op rich results of extra schema alleen om meer schema te hebben.

Controleer logica met tests, bouw de site en controleer de echte uitvoer en mobiele/desktopweergave. Publiceer deze wijzigingen niet automatisch. Meld eerlijk welke controles zijn gedaan en wat alleen lokaal is aangepast.
## Uitvoering en controles

- Audit: gewogen technische basisscore v1, zes prioriteit-/bereiktellers, categorieoverzicht en bestaande bewijsfilters. Geen aftrek voor handmatige beoordelingen; geen gefingeerde geslaagde controles bij overgeslagen URL’s. Voorbeeldscore: 78/100 (21 van 27 gewogen punten), expliciet fictief.
- Contactformulier volgt nu direct op het auditrapport, vóór de verdiepende uitleg. Dubbele algemene contactbanner uit de footer en extra contactlink uit de audit-uitleg verwijderd.
- Navigatie gebruikt alleen het bestaande beeldmerk. Footer behoudt het volledige logo. WhatsApp/LinkedIn hebben SVG-iconen en klikbare knoppen in footer en bedrijfscontact.
- Grotere desktopfoto’s op Over Sitesnit; scrollgestuurd inklappen behouden. Nieuwe persoonlijke OG-kaart met de echte aangeleverde foto’s van Kay en Nova.
- Afzonderlijk Tools-blok op Diensten met één hoofdlink naar /tools.
- Straat, huisnummer en postcode ontbreken op Contact en in algemene Organization-JSON-LD. De juridische identiteit blijft beschikbaar op juridische pagina’s.
- FAQ-JSON gebruikt dezelfde antwoordgegevens als de zichtbare diensten- en uitlegpagina’s. Geen extra prijs-/reviewclaims toegevoegd.

Validatie: 137 tests geslaagd, productiebuild geslaagd, ESLint zonder meldingen voor gewijzigde TSX. Lokale HTML-crawl: 63 routes, 4.351 interne verwijzingen, geen gevonden problemen binnen de uitgevoerde controles. Controle omvat metadata, canonicals, Open Graph, Twitter-kaarten, schema-relaties, zichtbare FAQ-antwoorden, pakketprijzen, breadcrumbs, assets en 404. Alle 62 PNG-deelkaarten zijn 1200×630 en hebben verschillende bestandsinhoud; routecontrole controleert ook andere gekoppelde deelbeelden.

In de browser: desktop- en mobiele screenshots van foto’s, audit en footer bekeken; scrollgestuurd inklappen bevestigd; auditfilter en sprong naar aanvraagformulier werken. Responsive controles op 360, 390, 768, 1440 en 1920 pixels. Alleen browseremulatie, geen fysieke telefoon. Deze wijzigingen zijn lokaal uitgevoerd; geen productiepublicatie.

Onderbouwing: [Google over interne links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) en [gestructureerde gegevens](https://developers.google.com/search/docs/appearance/structured-data/sd-policies). Relevantie en zichtbare inhoud zijn leidend; meer links of meer schema is geen zelfstandig kwaliteitsdoel.
