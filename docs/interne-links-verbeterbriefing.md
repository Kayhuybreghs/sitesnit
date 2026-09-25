# Verbeterbriefing: inhoud, interne links en contact

## Opdracht

Verbeter de bestaande Sitesnit-website zonder eerdere functionaliteit of werk te verliezen. Organiseer diensten, zes tools en de bijbehorende uitleg rond de vragen van bezoekers. Vermijd zowel verweesde uitlegpagina’s als een lange, ongerichte verzameling links. Geef iedere bestemming een duidelijke titel, context en logische plaats in het klantpad.

1. Onderzoek Googles eigen richtlijnen en de werkelijk gerenderde interne links. Er is geen vastgesteld ideaal aantal links; gebruik relevantie en bruikbaarheid als selectiecriterium. Houd alle openbare artikelen bereikbaar via hun hoofdtool, met gerichte kruisverwijzingen en passende dienstenroutes.
2. Maak het tooloverzicht een keuzepagina. Verplaats de volledige artikelverzameling naar de relevante tools. Plaats beknopte uitleg vóór de afsluitende contactroute, niet als verrassend vervolg na het formulier.
3. Geef de zes auditartikelen een direct antwoord bovenaan, inhoudelijke verdieping, herkenbare voorbeelden, herstelkeuzes, controle na herstel en specifieke vragen onderaan. Gebruik eigen visuele voorbeelden, een inhoudsopgave, scrollaccenten en duidelijke mobiele composities. Voeg geen woorden toe alleen om lengte te halen.
4. Verbeter ook de bestaande achttien uitlegpagina’s met een compacte conclusie en relevante vragen. Maak van snippets een heldere schrijfstijl, geen beloofde Google-weergave. Markeer fictieve voorbeelden.
5. Maak de Hub-intro concreet: bezoekers, herkomst, Google en uitgevoerd werk. Toon geen fictieve cijfers als echt en houd monitoring en uitvoering als afzonderlijke afspraken herkenbaar.
6. Gebruik centraal contact@sitesnit.nl, +31 6 39430197, WhatsApp en https://www.linkedin.com/company/sitesnit/. Telefoon is klikbaar met ‘Bellen alleen op afspraak’. Voeg deze bevestigde gegevens ook toe aan passende structured data en juridische contactvermeldingen.
7. Controleer cookie-instellingen op openen, wijzigen, opslaan, intrekken, toetsenbord en mobiel. Activeer geen echte analytics zonder de vereiste configuratie en toestemming.
8. Test build, relevante logica, interne bestemmingen, mobiele layout en bereikbaarheid. Leg de linkmap en resterende livegangstappen vast. Niet automatisch publiceren.

## Onderzoeksuitgangspunten

- [Google: linkteksten en crawlbare links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable): echte a/href-links, relevante context, beschrijvende ankers, iedere belangrijke pagina minstens één inkomende interne link; geen magisch aantal links.
- [Google: behulpzame inhoud](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): eigen meerwaarde en een volledig antwoord, geen gewenst woordenaantal.
- [Google: featured snippets](https://developers.google.com/search/docs/appearance/featured-snippets): Google bepaalt de selectie; een antwoordblok of schema garandeert geen snippet.
- [Google: sitestructuur](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure): navigatie en onderlinge links helpen de structuur begrijpen; een sitemap vervangt geen bruikbare navigatie.

Ontwerpkeuze voor Sitesnit: diensten → passende tool → gerichte uitleg → inhoudelijk vervolg of contact. De tool blijft altijd rechtstreeks bruikbaar. Twee aanbevolen vervolgartikelen per auditartikel is een redactionele keuze, geen Google-regel.

## Uitvoering en linkmap — 25 september 2026

De hoofdroute is nu: **Diensten → relevante tool → uitleg bij de keuze → bespreking**. De uitleg staat vóór het afsluitende contactmoment. De tools hoeven niet verplicht ingevuld te worden voor contact. Het tools-overzicht is een keuzepagina en bevat geen volledige lijst met 24 artikelen meer.

| Dienst / intentie | Hoofdtool | Gerichte verdieping |
|---|---|---|
| Webdesign | Website-ontwerp-tool | Websitestructuur, ontwerpvoorbeelden |
| Webshops / omvang | Website-kosten-berekenen | Offerte aanvragen, pakketbasis |
| SEO | SEO-audit | 6 auditartikelen + 4 bredere technische artikelen |
| Content / klantpad | Website-check | Aanvragen, veroudering, mobiel en snelheid |
| Onderhoud / afspraken | Website-offerte-vergelijken | Onderhoudskosten, offerte-afspraken |
| AI & automatisering | Automatiseringsplan | Processen, CRM, afspraken plannen |

De zes auditartikelen hebben ieder een eigen kort antwoord, fictief uitgewerkt voorbeeld, vier controleacties, drie vragen, relevante bron en twee geselecteerde vervolgonderwerpen. De 18 bestaande artikelen hebben elk een eigen antwoordblok en twee specifieke vragen. De toolindex voor clients bevat alleen samenvattingen, niet de volledige artikelteksten.

### Werkelijke crawlcontrole

`reports/seo/link-refinement/summary.json` en `link-map.json` leggen de controle vast. 63 openbare routes, 4.414 interne linkvermeldingen, nul meldingen binnen de lokale SEO-controle. Alle 63 routes zijn vanuit home bereikbaar; geen route zonder inkomende verwijzing uit hoofdinhoud of broodkruimels. De hoofdinformatie van /tools verwijst naar 10 verschillende bestemmingen, tegenover 34 voor deze wijziging. Dit is een bruikbaarheidskeuze; totale linkaantallen zijn geen SEO-score. De twee-klikbereikbaarheid in deze crawl telt ook navigatie en footer mee, en is geen rankinggarantie.

### Contact en cookies

E-mail, telefoon en LinkedIn staan centraal in lib/business.ts en worden gebruikt in footer, zakelijke identiteit en Organization-schema. WhatsApp verwijst naar het bevestigde telefoonnummer; bellen is op afspraak. Dit configureert geen nieuwe mailprovider en bewijst niet dat contact@sitesnit.nl al als mailbox bestaat.

Cookiebeheer is in de preview gecontroleerd: openen/sluiten en focus terug. In een tijdelijke lokale fixture is de echte component gebundeld met alleen de Google-script-URL vervangen door een localhost-stub. Weigeren, herladen, toestaan, opnieuw openen, intrekken, herladen en Escape werken. Geen verzoeken naar Google voor deze fixture. GA4 blijft op de echte preview uit zolang de configuratie ontbreekt. Unitchecks verifiëren cookieverwijdering en toestemmingsvoorwaarden. De testserver is gestopt; geen testpagina is gepubliceerd.

### Beheer: auditgebruik en voorbeeld

- /hub/admin toont na echte adminlogin en tweestapsverificatie de teller: gestart, rapport ontvangen, mislukt; vandaag (UTC) en laatste 28 dagen.
- De bestaande events-tabel wordt gebruikt; geen nieuwe migratie. Geen domein, IP, gebruiker of rapportinhoud in deze teller. Bewaring volgt de bestaande opruiming van 90 dagen.
- Geweigerde daglimietpogingen en voorbeelden tellen niet als gestarte scan. Een voltooid rapport kan gedeeltelijk zijn. Bij afbreken van de server of mislukte registratie kunnen aantallen afwijken; oudere scans worden niet teruggevuld.
- /tools/seo-audit#voorbeeldrapport bevat een knop om hetzelfde rapportonderdeel met expliciet fictieve gegevens te openen. Geen echte scan of dagbudgetverbruik; fictieve details worden niet meegestuurd in contact.
- De adminquery zit achter bestaande toegangscontrole. Tellerlogica met echte lokale SQLite-uitvoering getest. Geen MFA omzeild en de adminpagina niet als ingelogde beheerder in de browser doorlopen.

### Verificatie

134 tests geslaagd, gerichte ESLint-controle geslaagd en definitieve productiebuild geslaagd. Voorbeeldrapport en filters in de browser getest. Nieuwe artikelvoorbeelden, Hub-blok en footer visueel bekeken op desktop en mobiel. Alleen browseremulatie, geen fysieke telefoon. Geen productiepublicatie, DNS-wijziging of productiemigratie uitgevoerd.

Laatste responsivecontrole: /tools/seo-audit, het artikel over interne links, /website-structuur, /tools en /diensten/seo op 360, 390, 768, 1440 en 1920 pixels zonder horizontale overflow. Voorbeeldrapport na definitieve herstart opnieuw geopend; geen browserconsolefouten geregistreerd in die controle.
