export type GuideSection = { heading: string; paragraphs?: string[]; checklist?: string[]; table?: { headers: string[]; rows: string[][] } };
export type Guide = { id: string; slug: string; title: string; description: string; group: string; tool: string; service: string; audience: string; outcome: string; unique: string; intro: string; widget?: string; sections: GuideSection[]; related: string[]; sources: string[] };
/** Editorial drafts are reviewed separately; this data never asserts owner approval. */
export const guides: Guide[] = [
  {
    "id": "A1",
    "slug": "website-levert-geen-aanvragen-op",
    "title": "Waarom levert je website geen aanvragen op?",
    "description": "Zoek uit waar aanvragen vastlopen: bereik, boodschap, vertrouwen of contact. Met een concrete controlevolgorde en een voorbeeld van betere dienstentekst.",
    "group": "websitecheck",
    "tool": "/tools/website-check",
    "service": "/diensten/webdesign",
    "audience": "Ondernemers met bezoekers maar weinig aanvragen",
    "outcome": "Een eerste oorzaak kiezen op basis van signalen, voordat je een redesign bestelt.",
    "unique": "Diagnosevolgorde plus vóór/na-dienstentekst; geen beloofde conversiewinst.",
    "intro": "Weinig aanvragen betekenen niet automatisch dat je ontwerp verkeerd is. Misschien komen er nauwelijks passende bezoekers. Misschien begrijpen ze je aanbod niet, of komt een verstuurd formulier niet aan. Begin bij het punt waar je iets kunt vaststellen.",
    "sections": [
      {
        "heading": "Begin bij bezoek, niet bij de kleur van je knop",
        "paragraphs": [
          "Kijk naar een periode die bij je bedrijf past: een drukke week zegt weinig als klanten maanden nadenken. Gebruik je beschikbare bezoekersgegevens én je ontvangen aanvragen. Tel telefoontjes of mails alleen mee als je die werkelijk kunt herleiden; vul ontbrekende metingen niet in met aannames.",
          "Open vervolgens de pagina waarop mensen binnenkomen. Een bezoeker uit een zoekopdracht over reparaties verwacht een ander antwoord dan iemand die je bedrijfsnaam zoekt. Controleer of de pagina juist die vraag behandelt. Zonder bezoekersdata kun je de route wel beoordelen, maar nog niet zeggen hoeveel mensen erop afhaken."
        ]
      },
      {
        "heading": "Kies de controle die bij het signaal past",
        "table": {
          "headers": [
            "Wat merk je?",
            "Wat controleer je eerst?",
            "Wat concludeer je nog niet?"
          ],
          "rows": [
            [
              "Bijna geen bezoek",
              "Vindbaarheid, verwijzingen en bereik van de juiste doelgroep",
              "Dat het formulier slecht converteert"
            ],
            [
              "Bezoek op verkeerde onderwerpen",
              "Zoekvragen, aanbod en bestemmingspagina",
              "Dat je meer animatie nodig hebt"
            ],
            [
              "Vragen die al op de site horen te staan",
              "Uitleg over aanpak, geschiktheid en kosten",
              "Dat bezoekers niet willen lezen"
            ],
            [
              "Wel formulieracties, geen ontvangen mail",
              "Opslag, afleverstatus en spammap met een eigen test",
              "Dat de aanvraag succesvol is bezorgd"
            ]
          ]
        }
      },
      {
        "heading": "Maak je aanbod concreet",
        "paragraphs": [
          "Voorbeeld, geen gemeten klantresultaat: ‘Wij leveren totaaloplossingen met kwaliteit’ geeft weinig houvast. ‘We vervangen houten kozijnen in bestaande woningen. Je krijgt eerst een opname en een voorstel per gevel’ vertelt wat je doet, voor wie en wat volgt.",
          "Zet er alleen bewijs bij dat je werkelijk hebt: een eigen project, uitleg over een keuze of een bevestigde klantreactie. Bedenk daarna één logische actie. Bij een ingewikkelde opdracht past ‘Bespreek je situatie’ beter dan een knop die direct een bestelling suggereert."
        ]
      },
      {
        "heading": "Test de hele aanvraag",
        "paragraphs": [
          "Doorloop het formulier op je telefoon. Maak bewust een fout, herstel die en controleer of je tekst behouden blijft. Verstuur één herkenbare test en volg die tot in de echte ontvangst. Een groen vinkje in de browser is geen bewijs dat iemand de aanvraag heeft ontvangen.",
          "Noteer één verbeterpunt, voer dat uit en controleer opnieuw onder vergelijkbare omstandigheden. De websitecheck helpt je bevindingen ordenen; hij vervangt geen bezoekersonderzoek."
        ]
      }
    ],
    "related": [
      "/website-niet-goed-op-mobiel",
      "/verouderde-website",
      "/projecten/beurswijzer"
    ],
    "sources": []
  },
  {
    "id": "A2",
    "slug": "verouderde-website",
    "title": "Is je website verouderd, of kan hij nog mee?",
    "description": "Beoordeel je website op inhoud, techniek en gebruik. Kies bewust tussen behouden, verbeteren, gefaseerd vernieuwen of opnieuw bouwen.",
    "group": "websitecheck",
    "tool": "/tools/website-check",
    "service": "/diensten/webdesign",
    "audience": "Eigenaren die twijfelen over een redesign",
    "outcome": "Bruikbare onderdelen behouden en onderbouwd bepalen wat moet veranderen.",
    "unique": "Beslismatrix met behoud van bestaande URLs, inhoud en werkende functies.",
    "intro": "De leeftijd van je website is geen vervaldatum. Een ouder ontwerp kan nog prima helpen, terwijl een recente website onduidelijk of moeilijk te beheren is. De vraag is wat er voor je bedrijf en je bezoekers niet meer klopt.",
    "sections": [
      {
        "heading": "Maak drie lijsten voordat je iets vervangt",
        "paragraphs": [
          "Schrijf op wat nog werkt, wat aantoonbaar problemen geeft en wat je alleen minder mooi vindt. Die laatste lijst mag er zijn, maar zet een smaakvoorkeur niet naast een kapot boekingsformulier alsof ze dezelfde urgentie hebben.",
          "Neem belangrijke pagina’s, formulieren, downloads en koppelingen mee. Vraag wie de inhoud kan bijwerken en welke onderdelen niemand meer durft aan te raken. Verzamel ook bestaande URLs met aanvragen, bezoekers of relevante externe verwijzingen."
        ]
      },
      {
        "heading": "Vier routes naar een betere website",
        "table": {
          "headers": [
            "Route",
            "Past wanneer",
            "Bewaar of onderzoek"
          ],
          "rows": [
            [
              "Behouden",
              "Aanbod en contactroute kloppen; alleen kleine details storen",
              "Werkende pagina’s en bestaande inhoud"
            ],
            [
              "Gericht verbeteren",
              "Enkele teksten, beelden of formulieren lopen achter",
              "Test de aanpassing zonder alles te vervangen"
            ],
            [
              "Gefaseerd vernieuwen",
              "Eén belangrijk deel moet anders; de rest blijft bruikbaar",
              "Samenhang, beheer en overgang tussen oud en nieuw"
            ],
            [
              "Opnieuw bouwen",
              "Structuur, techniek én aanbod passen niet meer",
              "URL-mapping, bruikbare inhoud, functies en migratiecontrole"
            ]
          ]
        }
      },
      {
        "heading": "Een nieuw uiterlijk lost niet elk probleem op",
        "paragraphs": [
          "Een nieuwe homepage helpt weinig als je dienstenpagina’s onduidelijk blijven. Een ander CMS lost evenmin automatisch een fout in je gegevensuitwisseling op. Laat bij een voorstel daarom per probleem uitleggen welke verandering het oplost.",
          "Voorbeeld: een dienst is opgesplitst in twee verschillende opdrachten. Je hoeft daarvoor niet per se je hele merk te wijzigen. Twee duidelijke dienstenpagina’s met passende voorbeelden kunnen de belangrijkste stap zijn."
        ]
      },
      {
        "heading": "Leg vooraf vast wat niet verloren mag gaan",
        "paragraphs": [
          "Maak voor een verbouwing een lijst van bestaande adressen en hun nieuwe bestemming. Plan het behoud van relevante inhoud, de verhuizing van bestanden en het testen van aanvragen. Laat oude pagina’s niet allemaal naar de homepage wijzen alleen omdat die bestaat.",
          "Bespreek eerst de omvang. Bij Sitesnit kun je de pakketbasis bekijken en de websitecheck gebruiken om verbeterpunten mee te nemen. Hosting, inhoudswerk en aanvullende functies moeten in het voorstel herkenbaar blijven."
        ]
      }
    ],
    "related": [
      "/wat-kost-een-website",
      "/website-migratie-checklist",
      "/projecten"
    ],
    "sources": [
      "migration"
    ]
  },
  {
    "id": "A3",
    "slug": "website-niet-goed-op-mobiel",
    "title": "Werkt je website niet goed op mobiel?",
    "description": "Controleer tekst, menu, beelden, formulieren en vaste knoppen op je telefoon. Een praktische testvolgorde voor problemen die bezoekers echt hinderen.",
    "group": "websitecheck",
    "tool": "/tools/website-check",
    "service": "/diensten/webdesign",
    "audience": "Eigenaren met een lastig bruikbare mobiele website",
    "outcome": "Een concreet mobiel probleem reproduceerbaar beschrijven.",
    "unique": "Handmatige telefoonroute met toetsenbord, rotatie en foutstatussen.",
    "intro": "Een pagina die op een smal scherm past, is nog niet vanzelf prettig te gebruiken. Je bezoeker moet ook kunnen lezen, kiezen en contact opnemen zonder te zoomen of achter een vaste knop te zoeken.",
    "sections": [
      {
        "heading": "Gebruik je echte telefoon als vertrekpunt",
        "paragraphs": [
          "Begin bovenaan en lees hardop wat je denkt dat het bedrijf doet. Open het menu, kies een dienst en ga terug. Draai daarna het scherm. Kijk of koppen afbreken, knoppen verschuiven of onderdelen buiten beeld raken.",
          "Test ook een iets grotere tekstinstelling en een andere browser als die beschikbaar is. Een desktopvoorbeeld is handig om schermbreedtes te vergelijken, maar laat niet precies zien hoe het toetsenbord en browserbalken op jouw telefoon reageren."
        ]
      },
      {
        "heading": "Zo vind je een verborgen blokkade",
        "table": {
          "headers": [
            "Situatie",
            "Probeer dit",
            "Noteer"
          ],
          "rows": [
            [
              "Je kunt zijwaarts schuiven",
              "Bekijk brede tabellen, lange URLs en vaste breedtes",
              "De exacte pagina en het te brede element"
            ],
            [
              "De contactknop ligt achter een banner",
              "Open cookie-instellingen en het mobiele menu",
              "Welke lagen elkaar bedekken"
            ],
            [
              "Het formulier wordt onbruikbaar",
              "Tik het onderste veld aan met toetsenbord open",
              "Of verzenden en foutmelding bereikbaar blijven"
            ],
            [
              "Afbeeldingen lijken wazig",
              "Vergelijk dezelfde uitsnede op normaal formaat",
              "Bestandsbron en werkelijk getoonde grootte"
            ]
          ]
        }
      },
      {
        "heading": "Kijk niet alleen naar snelheid",
        "paragraphs": [
          "Een snel geladen knop kan nog steeds te klein of onduidelijk zijn. Andersom kan een prettig ontwerp traag verschijnen. Houd een gebruiksprobleem, een snelheidsmeting en een vindbaarheidsvraag apart, zodat je niet de verkeerde oplossing kiest.",
          "Voorbeeld: een brede vergelijkingstabel kun je op mobiel als herhaalde pakketblokken tonen, met steeds dezelfde volgorde van gegevens. Dat maakt vergelijken mogelijk zonder afwisselend heen en weer te schuiven."
        ]
      },
      {
        "heading": "Van klacht naar een bruikbare reparatie",
        "paragraphs": [
          "‘Mobiel is slecht’ is lastig op te lossen. ‘Op deze URL bedekt de vaste chatknop het verzenden zodra mijn toetsenbord openstaat’ kun je gericht reproduceren. Vermeld toestel, browser en stappen, zonder privé-invoer op een screenshot.",
          "Controleer de reparatie met dezelfde stappen en kijk daarna of het menu en omliggende onderdelen nog werken. De websitecheck combineert je eigen bevindingen met een technische labmeting; een labmeting beoordeelt niet de volledige ervaring van jouw bezoekers."
        ]
      }
    ],
    "related": [
      "/website-levert-geen-aanvragen-op",
      "/website-snelheid-testen",
      "/projecten/beurswatcher"
    ],
    "sources": []
  },
  {
    "id": "B1",
    "slug": "wat-kost-een-website",
    "title": "Wat kost een website voor jouw bedrijf?",
    "description": "Begrijp wat pagina’s, functies, inhoud en maatwerk met de websiteprijs doen. Met drie afgebakende voorbeelden en de actuele Sitesnit-pakketbasis.",
    "group": "prijscheck",
    "tool": "/tools/website-kosten-berekenen",
    "service": "/diensten/webdesign",
    "audience": "Bedrijven die de omvang van een nieuwe website bepalen",
    "outcome": "Scope kiezen voordat offertes en bedragen worden vergeleken.",
    "unique": "Drie scopevoorbeelden gekoppeld aan centrale pakketprijzen.",
    "intro": "De prijs hangt niet alleen af van het aantal schermen. Vijf informatieve pagina’s zijn een andere opdracht dan vijf schermen met accounts, betalingen en verschillende gebruikersrechten. Begin bij wat je website moet doen.",
    "widget": "packages",
    "sections": [
      {
        "heading": "Drie situaties, drie verschillende opdrachten",
        "table": {
          "headers": [
            "Voorbeeld, geen klantofferte",
            "Uitgangspunt",
            "Te bespreken"
          ],
          "rows": [
            [
              "Zelfstandige met één helder aanbod",
              "Een doorlopend verhaal met dienst, bewijs en contact",
              "Of alle inhoud op één pagina begrijpelijk blijft"
            ],
            [
              "Bedrijf met meerdere onderwerpen",
              "Vijf pagina’s met bijvoorbeeld diensten, werk en contact",
              "Welke onderwerpen een eigen pagina nodig hebben"
            ],
            [
              "Platform met persoonlijke omgeving",
              "Inloggen, rechten en gegevens per gebruiker",
              "Gegevensmodel, integraties, beheer en beveiliging"
            ]
          ]
        }
      },
      {
        "heading": "Welke wensen veranderen de omvang?",
        "paragraphs": [
          "Meer pagina’s betekenen niet automatisch steeds een nieuw ontwerp. Een herhaald projecttype verschilt van een nieuwe boekingsfunctie. Bespreek daarom zowel het aantal pagina’s als de verschillende soorten pagina’s.",
          "Content is een aparte vraag: lever je teksten en foto’s aan, worden bestaande teksten aangescherpt of moet alles worden gemaakt? Ook een CRM-koppeling kan uiteenlopen van een bestaand formulier naar één systeem tot een proces met foutafhandeling en meerdere databronnen."
        ]
      },
      {
        "heading": "Normale websitekwaliteit is geen reden om alles maatwerk te noemen",
        "paragraphs": [
          "Een responsive ontwerp, een standaard contactformulier of verfijnde animaties maken een eenvoudige website niet vanzelf een complex platform. De prijscheck kijkt naar omvang en relevante functies. Je budget verandert niet het tarief voor dezelfde scope.",
          "Maatwerk heeft een bevestigde prijsbasis, geen vooraf bekende eindprijs. Als keuzes nog ontbreken, moet het voorstel aangeven welke informatie nodig is. Een verzonnen bovengrens geeft weinig zekerheid."
        ]
      },
      {
        "heading": "Vergelijk het hele voorstel",
        "paragraphs": [
          "Zet bouw, hosting, inhoud, aanvullende software en later werk los van elkaar. Bij Sitesnit betaal je 60% vóór de start en 40% bij afronding van de afgesproken opdracht. Bekijk bij de pakketten ook het eerste hostingjaar.",
          "Gebruik de prijscheck voor je wensen en de kostenpagina voor de actuele pakketbedragen. Bewaar het voorstel met de afgesproken scope; een uitkomst van een verkennende tool is geen bestelling."
        ]
      }
    ],
    "related": [
      "/kosten",
      "/website-structuur",
      "/website-offerte-checklist",
      "/maandelijkse-kosten-website"
    ],
    "sources": []
  },
  {
    "id": "B2",
    "slug": "maandelijkse-kosten-website",
    "title": "Welke maandelijkse kosten heeft een website?",
    "description": "Maak onderscheid tussen hosting, domein, onderhoud, inhoud en externe software. Gebruik de kostenlijst om verplichte en optionele posten te controleren.",
    "group": "prijscheck",
    "tool": "/tools/website-kosten-berekenen",
    "service": "/diensten/onderhoud-hosting",
    "audience": "Eigenaren die terugkerende kosten willen begrijpen",
    "outcome": "Een overzicht van verplichte en gekozen maand-/jaarposten maken.",
    "unique": "Invulbare kosteninventaris met looptijd en opzegmoment, geen nieuwe calculator.",
    "intro": "Een bouwprijs vertelt niet wat je later betaalt. Vraag bij iedere terugkerende post waarvoor die is, hoe vaak je betaalt en wanneer je kunt stoppen. Zet bedragen pas bij elkaar als dezelfde periode en btw-basis worden gebruikt.",
    "widget": "cost-inventory",
    "sections": [
      {
        "heading": "Hosting is niet hetzelfde als onderhoud",
        "paragraphs": [
          "Hosting houdt de website beschikbaar op een server. Technisch onderhoud is het werk aan bijvoorbeeld updates of een storing. Nieuwe teksten en campagnes zijn weer ander werk. Eén maandbedrag kan meerdere zaken bevatten, maar dat moet dan wel worden uitgelegd.",
          "Bij een nieuwe Sitesnit-website hoort hosting met een eerste looptijd van twaalf maanden. Daarna loopt hosting door en is deze maandelijks opzegbaar. De actuele minimumbedragen staan hieronder; inhoud en technisch onderhoud kies je afzonderlijk."
        ]
      },
      {
        "heading": "Welke posten horen op je lijst?",
        "table": {
          "headers": [
            "Post",
            "Wanneer relevant",
            "Vraag aan de aanbieder"
          ],
          "rows": [
            [
              "Domeinnaam",
              "Als je een eigen adres gebruikt",
              "Wie registreert het, wat kost verlenging en van wie is het?"
            ],
            [
              "Hosting",
              "Voor het beschikbaar stellen van de site",
              "Wat valt eronder en wat is de eerste looptijd?"
            ],
            [
              "Onderhoud",
              "Bij afgesproken technisch werk",
              "Welke werkzaamheden en uitzonderingen staan op papier?"
            ],
            [
              "Externe software",
              "Bij bijvoorbeeld reserveren of e-mail",
              "Van welke leverancier komt de factuur en wat zijn de limieten?"
            ],
            [
              "Content of SEO-werk",
              "Als iemand doorlopend verbeteringen uitvoert",
              "Welke inzet is afgesproken en hoe zie je wat gedaan is?"
            ]
          ]
        }
      },
      {
        "heading": "Vergelijk ook de verplichting",
        "paragraphs": [
          "Een bedrag per maand kan voor een heel jaar worden gefactureerd. Noteer daarom betaalritme én contractduur. Kijk verder dan een tijdelijk actietarief en vraag wat daarna geldt.",
          "Een gratis scan is geen onderhoudscontract. Een rapport beschrijft mogelijke problemen; het uitvoeren en controleren van herstel is werk. Neem die posten niet dubbel op als ze al in een duidelijke afspraak zijn opgenomen."
        ]
      }
    ],
    "related": [
      "/website-onderhoud-kosten",
      "/kosten",
      "/website-offerte-checklist"
    ],
    "sources": []
  },
  {
    "id": "B3",
    "slug": "website-onderhoud-kosten",
    "title": "Websiteonderhoud: waarvoor betaal je?",
    "description": "Vergelijk onderhoud op werkzaamheden, grenzen en terugkoppeling. Leer het verschil tussen hosting, signaleren en daadwerkelijk herstel.",
    "group": "prijscheck",
    "tool": "/tools/website-kosten-berekenen",
    "service": "/diensten/onderhoud-hosting",
    "audience": "Eigenaren die onderhoudsvoorstellen vergelijken",
    "outcome": "Betalen voor herkenbaar werk in plaats van een onduidelijk maandlabel.",
    "unique": "Onderhoudsmatrix en drie concrete acceptatievragen.",
    "intro": "Vraag bij websiteonderhoud niet alleen naar het maandbedrag. Vraag vooral welk werk wordt gedaan, wat buiten de afspraak valt en hoe je merkt dat een wijziging is gecontroleerd.",
    "sections": [
      {
        "heading": "Drie verschillende verantwoordelijkheden",
        "table": {
          "headers": [
            "Onderdeel",
            "Wat het inhoudt",
            "Wat het niet vanzelf betekent"
          ],
          "rows": [
            [
              "Hosting",
              "Een omgeving waarin de website draait",
              "Dat iedere bug kosteloos wordt opgelost"
            ],
            [
              "Signaleren",
              "Metingen of meldingen over beschikbaarheid en techniek",
              "Dat iemand het probleem al heeft hersteld"
            ],
            [
              "Onderhoud uitvoeren",
              "Afgesproken wijzigingen, controles en terugkoppeling",
              "Dat nieuwe functies en teksten onbeperkt inbegrepen zijn"
            ]
          ]
        }
      },
      {
        "heading": "Onderhoud hangt af van je website",
        "paragraphs": [
          "Een informatieve website met weinig wijzigingen vraagt ander beheer dan een webshop met betalingen of een klantportaal met rechten. Breng daarom de techniek, externe koppelingen en gevolgen van uitval in kaart voordat je een pakket kiest.",
          "Vraag wie updates uitvoert, hoe herstel mogelijk is en welke controle na een wijziging volgt. Een backup op papier is iets anders dan een aantoonbaar herstelbare backup. Neem geen responstijd aan die niet in de afspraak staat."
        ]
      },
      {
        "heading": "Zo herken je bruikbare terugkoppeling",
        "paragraphs": [
          "Een werklog kan bijvoorbeeld noemen: welk onderdeel is gewijzigd, waarom, wanneer en hoe het is gecontroleerd. ‘Alles bijgewerkt’ zonder context geeft je weinig inzicht. Meetgegevens moeten aangeven over welke pagina en periode ze gaan.",
          "Voorbeeld van een gewenste afspraak, niet van uitgevoerd klantwerk: na een formulierwijziging wordt invoer, foutafhandeling en echte ontvangst gecontroleerd. De opdracht eindigt niet bij het opslaan van de code."
        ]
      },
      {
        "heading": "Stel deze vragen vóór je kiest",
        "checklist": [
          "Welke concrete werkzaamheden zijn inbegrepen, en hoe vaak?",
          "Welke wijzigingen, storingen of externe licenties vallen erbuiten?",
          "Hoe krijg ik terugkoppeling en hoe regelen we overdracht bij stoppen?"
        ],
        "paragraphs": [
          "Voor doorlopende vindbaarheidsverbeteringen kun je SEO-onderhoud bespreken. Voor algemene hosting en technisch beheer zijn er bestaande onderhoudspakketten op de hostingpagina. We bekijken eerst wat daarin al is opgenomen, zodat een losse opdracht niet hetzelfde werk opnieuw rekent. Een bestaande website nemen we pas over nadat de technische staat en toegang zijn beoordeeld."
        ]
      }
    ],
    "related": [
      "/maandelijkse-kosten-website",
      "/diensten/seo-onderhoud",
      "/website-offerte-checklist"
    ],
    "sources": []
  },
  {
    "id": "C1",
    "slug": "website-offerte-aanvragen",
    "title": "Een website-offerte aanvragen die echt iets zegt",
    "description": "Bereid je aanvraag voor met doelen, pagina’s, functies en open vragen. Gebruik de voorbeeldbriefing om voorstellen beter te kunnen vergelijken.",
    "group": "offertevergelijker",
    "tool": "/tools/website-offerte-vergelijken",
    "service": "/diensten/webdesign",
    "audience": "Ondernemers die een websitevoorstel aanvragen",
    "outcome": "Een bruikbare briefing maken zonder alle technische keuzes vooraf te weten.",
    "unique": "Kopieerbare lege briefing met onzekerheden, geen ingevulde fictieve opdracht.",
    "intro": "Je hoeft geen technisch document te schrijven voordat je een webdesigner benadert. Vertel vooral voor wie de website is, welke taak hij moet ondersteunen en welke keuzes nog openstaan. Zo kan een voorstel over jouw opdracht gaan.",
    "widget": "brief",
    "sections": [
      {
        "heading": "Begin met de vraag van je bezoeker",
        "paragraphs": [
          "Schrijf op wie je wilt bereiken en wat die persoon moet kunnen doen. ‘Een moderne website’ is een voorkeur; ‘bezoekers moeten de juiste behandeling kunnen kiezen en een kennismaking aanvragen’ maakt de opdracht concreter.",
          "Noem ook wat de huidige website al goed doet. Als bestaande pagina’s of functies moeten blijven, horen die in je aanvraag. Deel alleen toegang of klantgegevens via een afgesproken veilige route, niet in een openbaar offerteformulier."
        ]
      },
      {
        "heading": "Geef richting, maar laat twijfel staan",
        "checklist": [
          "Welke onderwerpen of diensten moeten een eigen plek krijgen?",
          "Welke functies zijn noodzakelijk en welke alleen interessant?",
          "Welke teksten, beelden en logo’s zijn er al?",
          "Welke voorbeelden spreken je aan, en precies waarom?",
          "Is er een echte deadline of een voorkeur?",
          "Welk budget wil je bespreken en welke beslissingen zijn nog onzeker?"
        ],
        "paragraphs": [
          "Een budget helpt om opties af te bakenen, maar is geen reden om dezelfde opdracht duurder te maken. Schrijf ‘nog te bepalen’ als je iets niet weet. Een goede vervolgvraag is nuttiger dan een antwoord dat je alleen invult om verder te kunnen."
        ]
      },
      {
        "heading": "Vraag om een voorstel met grenzen",
        "paragraphs": [
          "Laat de aanbieder aantallen, paginatypes, functies en verantwoordelijkheden benoemen. Vraag hoe wijzigingen worden afgehandeld, welke kosten terugkeren en wat je bij overdracht ontvangt. Een offerte zonder die onderdelen is moeilijk naast een andere te leggen.",
          "Bij Sitesnit kun je je voorkeur voor een belmoment meegeven: op werkdagen tussen 18:00 en 21:30 of in het weekend. Dat is een aanvraag, geen direct gereserveerde afspraak. Het moment wordt samen bevestigd."
        ]
      }
    ],
    "related": [
      "/website-offerte-checklist",
      "/website-structuur",
      "/contact"
    ],
    "sources": []
  },
  {
    "id": "C2",
    "slug": "website-offerte-checklist",
    "title": "Website-offertes vergelijken: de inhoud naast de prijs",
    "description": "Controleer scope, eigendom, overdracht en doorlopende kosten. Met een afvinklijst en twee fictieve voorstellen die laten zien waarom alleen prijs niet genoeg is.",
    "group": "offertevergelijker",
    "tool": "/tools/website-offerte-vergelijken",
    "service": "/diensten/webdesign",
    "audience": "Bedrijven met meerdere websitevoorstellen",
    "outcome": "Je weet welke afspraken ontbreken en welke vragen je aan de aanbieder kunt stellen.",
    "unique": "Twee fictieve scopes plus aanwezig/onduidelijk/ontbreekt-controle.",
    "intro": "Een lager bedrag kan een goede keuze zijn, maar ook betekenen dat je minder krijgt. Vergelijk eerst of de voorstellen dezelfde vraag beantwoorden. Pas daarna worden de bedragen betekenisvol.",
    "widget": "quote-checklist",
    "sections": [
      {
        "heading": "Twee voorstellen kunnen allebei ‘een website’ heten",
        "table": {
          "headers": [
            "Fictief voorbeeld",
            "Voorstel A",
            "Voorstel B"
          ],
          "rows": [
            [
              "Omvang",
              "Vijf pagina’s op aangeleverde teksten",
              "Vijf pagina’s met tekstredactie"
            ],
            [
              "Formulier",
              "Eén contactformulier",
              "Intake met routes per dienst"
            ],
            [
              "Na oplevering",
              "Hosting apart genoemd",
              "Hosting genoemd zonder looptijd"
            ],
            [
              "Te verduidelijken",
              "Wie voert latere tekstwijzigingen uit?",
              "Welke hostingverplichting en welke uitzonderingen gelden?"
            ]
          ]
        },
        "paragraphs": [
          "Dit zijn verzonnen scopes om de vergelijking uit te leggen, geen offertes van Sitesnit of een concurrent. Zonder bedragen én gelijke omvang kun je niet bepalen wat de goedkoopste passende keuze is. Meer functies zijn bovendien niet automatisch nuttiger voor je bedrijf."
        ]
      },
      {
        "heading": "Een ontbrekend antwoord is een vervolgvraag",
        "paragraphs": [
          "Markeer een afspraak als aanwezig, onduidelijk of ontbrekend. ‘Onbeperkte service’ vertelt bijvoorbeeld nog niet of nieuwe pagina’s of storingen bij een externe leverancier inbegrepen zijn. Vraag om een concrete omschrijving.",
          "Controleer bij eigendom en overdracht wie domein, bestanden en accounts beheert. Bespreek toegang, licenties en de praktische verhuizing. De checklist is een gespreksinstrument en geen uitspraak over de juridische geldigheid van een overeenkomst."
        ]
      },
      {
        "heading": "Leg onzekerheden terug bij de aanbieder",
        "paragraphs": [
          "Stuur een korte lijst van ontbrekende punten naar iedere aanbieder. Vraag hetzelfde, zodat een aanvulling vergelijkbaar blijft. Bewaar de versie waarop je besluit is gebaseerd.",
          "De offertevergelijker helpt bedragen en afspraken naast elkaar zetten. Hij kiest geen winnaar en voorspelt niet welke aanbieder het beste werk levert. Bekijk ook passend werk en hoe duidelijk iemand je inhoudelijke vragen beantwoordt."
        ]
      }
    ],
    "related": [
      "/website-offerte-aanvragen",
      "/maandelijkse-kosten-website",
      "/projecten"
    ],
    "sources": []
  },
  {
    "id": "D1",
    "slug": "bedrijfsprocessen-automatiseren",
    "title": "Welk bedrijfsproces kun je het beste automatiseren?",
    "description": "Begin met één terugkerende taak. Breng invoer, uitzonderingen en verantwoordelijkheid in kaart voordat je software of AI kiest.",
    "group": "automatiseringsplan",
    "tool": "/tools/automatiseringsplan",
    "service": "/diensten/ai-automatisering",
    "audience": "Ondernemers met herhaald administratief werk",
    "outcome": "Eén afgebakend proces selecteren dat eerst kan worden vereenvoudigd.",
    "unique": "Proceskaart aanvraag→controle→bevestiging→opvolging met fouttakken.",
    "intro": "Begin niet bij ‘we moeten iets met AI’. Begin bij een taak die je vaak herhaalt: gegevens overtypen, een aanvraag doorzetten of iemand aan een vervolgstap herinneren. Maak die taak eerst begrijpelijk.",
    "sections": [
      {
        "heading": "Teken wat er nu echt gebeurt",
        "paragraphs": [
          "Noteer de aanleiding, de benodigde gegevens en wie de volgende stap uitvoert. Neem ook de informele handelingen mee: iemand zoekt een ontbrekend klantnummer, corrigeert een adres of belt bij twijfel.",
          "Meet of schat het huidige tijdgebruik en label welke van de twee het is. Een schatting is nuttig om te prioriteren, maar nog geen bewezen besparing. Trek controle en uitzonderingen niet stilzwijgend van het toekomstige werk af."
        ]
      },
      {
        "heading": "Voorbeeld: van aanvraag naar opvolging",
        "table": {
          "headers": [
            "Stap",
            "Normale route",
            "Uitzondering"
          ],
          "rows": [
            [
              "Aanvraag",
              "Naam, contact en type vraag ontvangen",
              "Ontbrekende gegevens → aanvullen"
            ],
            [
              "Controle",
              "Bestaande klant vinden en aanvraag vastleggen",
              "Dubbele aanvraag → samenvoegen na controle"
            ],
            [
              "Bevestiging",
              "Ontvangst en verwachte vervolgstap uitleggen",
              "Verzending mislukt → zichtbaar in werklijst"
            ],
            [
              "Opvolging",
              "Verantwoordelijke krijgt een taak",
              "Geen eigenaar → handmatig toewijzen"
            ]
          ]
        }
      },
      {
        "heading": "Schrap voordat je koppelt",
        "paragraphs": [
          "Vraag of elk veld en elke goedkeuring nog nodig is. Het automatiseren van een overbodige stap maakt het proces alleen ingewikkelder. Gebruik eenvoudige regels voor voorspelbare keuzes.",
          "AI kan helpen bij bijvoorbeeld het voorstellen van een categorie of een tekst, maar een mens moet risicovolle besluiten kunnen controleren. Spreek af welke gegevens naar een leverancier mogen en wat er gebeurt bij een onzeker antwoord."
        ]
      },
      {
        "heading": "Begin met een begrensde proef",
        "paragraphs": [
          "Kies één invoerbron en één vervolgactie. Test een normale aanvraag, ontbrekende informatie, een dubbele aanvraag en een tijdelijk onbereikbaar systeem. Laat fouten zichtbaar worden en bepaal wie ze oplost.",
          "Het automatiseringsplan zet je eigen antwoorden om in een procesvoorstel. Een koppeling is daarmee nog niet gebouwd. De uitvoerbaarheid hangt onder andere af van toegangen, beschikbare API’s en de regels van de betrokken systemen."
        ]
      }
    ],
    "related": [
      "/website-koppelen-aan-crm",
      "/afspraken-plannen-via-website",
      "/diensten/ai-koppelingen"
    ],
    "sources": []
  },
  {
    "id": "D2",
    "slug": "website-koppelen-aan-crm",
    "title": "Je website koppelen aan een CRM zonder losse eindjes",
    "description": "Denk verder dan het doorsturen van een formulier. Bekijk veldmapping, dubbele contacten, toestemming en herstel als de CRM-koppeling mislukt.",
    "group": "automatiseringsplan",
    "tool": "/tools/automatiseringsplan",
    "service": "/diensten/ai-koppelingen",
    "audience": "Bedrijven die aanvragen in een CRM willen verwerken",
    "outcome": "Een controleerbare gegevensstroom beschrijven met fouten en eigenaarschap.",
    "unique": "Veldmapping en fout-/retryroute; geen belofte dat elk CRM koppelbaar is.",
    "intro": "Een formulier doorsturen is de eerste stap. De echte vraag is of de juiste aanvraag bij het juiste contact en de juiste medewerker terechtkomt, ook als een systeem even niet bereikbaar is.",
    "sections": [
      {
        "heading": "Bepaal welke gegevens echt nodig zijn",
        "table": {
          "headers": [
            "Websiteveld",
            "CRM-bestemming, voorbeeld",
            "Controle"
          ],
          "rows": [
            [
              "E-mailadres",
              "Contact.email",
              "Formaat controleren; niet blind als unieke persoon behandelen"
            ],
            [
              "Bedrijfsnaam",
              "Organisatie.naam",
              "Afspreken hoe bestaande organisaties worden herkend"
            ],
            [
              "Type aanvraag",
              "Aanvraag.categorie",
              "Alleen vooraf toegestane categorieën"
            ],
            [
              "Toelichting",
              "Aanvraag.omschrijving",
              "Lengte begrenzen; gevoelige informatie beperken"
            ],
            [
              "Marketingkeuze",
              "Afzonderlijke toestemming indien gevraagd",
              "Niet afleiden uit een contactaanvraag"
            ]
          ]
        },
        "paragraphs": [
          "Deze namen zijn een voorbeeld, geen gegarandeerde velden in jouw CRM. Controleer de documentatie, rechten en limieten van de gekozen leverancier voordat je bouwt."
        ]
      },
      {
        "heading": "Voorkom dubbel werk bij dubbele verzoeken",
        "paragraphs": [
          "Een bezoeker kan twee keer klikken, een browser kan opnieuw proberen en je CRM kan later antwoorden. Geef iedere aanvraag daarom een herkenbaar uniek kenmerk en spreek af hoe herhaalde verwerking wordt herkend.",
          "Een bestaand e-mailadres betekent niet dat iedere nieuwe aanvraag weggegooid kan worden. Je wilt een dubbele verzending voorkomen zonder een latere, andere vraag te verliezen. Test beide situaties."
        ]
      },
      {
        "heading": "Maak mislukte verwerking zichtbaar",
        "paragraphs": [
          "Een tijdelijke fout kan een begrensde nieuwe poging krijgen. Een ongeldig veld vraagt eerst om correctie. Houd die gevallen apart, met een status en een verantwoordelijke. Blijf niet onbeperkt dezelfde fout versturen.",
          "Laat de bezoeker alleen zien wat echt vaststaat: een aanvraag kan veilig zijn ontvangen terwijl doorzetten nog wacht. Beweer niet dat een medewerker de aanvraag al heeft als de overdracht niet bevestigd is."
        ]
      },
      {
        "heading": "Test met eigen voorbeeldgegevens",
        "paragraphs": [
          "Controleer een nieuwe klant, een bestaande klant, een dubbele verzending en een leverancier die niet antwoordt. Deel geheime API-sleutels nooit in browsercode. Leg vast wie toegang heeft en wanneer gegevens worden verwijderd.",
          "Sitesnit kan de route met je uitwerken. Of de koppeling standaard of maatwerk wordt, volgt uit de systemen en benodigde stappen, niet uit het label ‘CRM-koppeling’ alleen."
        ]
      }
    ],
    "related": [
      "/bedrijfsprocessen-automatiseren",
      "/website-offerte-aanvragen",
      "/diensten/formulieren-rekentools"
    ],
    "sources": []
  },
  {
    "id": "D3",
    "slug": "afspraken-plannen-via-website",
    "title": "Afspraken plannen via je website: wat moet er kloppen?",
    "description": "Kies tussen een belverzoek en direct boeken. Denk aan beschikbaarheid, tijdzones, buffers, bevestiging, verplaatsen en foutafhandeling.",
    "group": "automatiseringsplan",
    "tool": "/tools/automatiseringsplan",
    "service": "/diensten/formulieren-rekentools",
    "audience": "Dienstverleners die afspraken online willen organiseren",
    "outcome": "Kiezen tussen een eenvoudige aanvraag en een echte boekingsfunctie.",
    "unique": "Boekingsketen met gelijktijdigheid, buffers en bevestigingsstatus.",
    "intro": "Een gewenste dag doorgeven is iets anders dan direct een tijdslot reserveren. Kies eerst welk gedrag je belooft. Dat voorkomt dat je klant denkt een afspraak te hebben terwijl jij nog moet reageren.",
    "sections": [
      {
        "heading": "Belverzoek of direct boeken?",
        "table": {
          "headers": [
            "Route",
            "Handig wanneer",
            "Wat moet duidelijk zijn?"
          ],
          "rows": [
            [
              "Voorkeur doorgeven",
              "Je wilt eerst de vraag beoordelen",
              "Het tijdstip wordt later samen bevestigd"
            ],
            [
              "Direct boeken",
              "Je beschikbaarheid en afspraakduur staan vast",
              "Het slot is pas definitief na echte bevestiging"
            ],
            [
              "Aanvraag met beoordeling",
              "Er zijn voorwaarden of voorbereiding nodig",
              "Wie beoordeelt en wat gebeurt bij afwijzen of wijzigen?"
            ]
          ]
        }
      },
      {
        "heading": "Beschikbaarheid is meer dan een agenda",
        "paragraphs": [
          "Leg afspraakduur, voorbereidingstijd, buffers en uitzonderingsdagen vast. Geef de tijdzone duidelijk aan als bezoekers buiten Nederland kunnen zitten. Houd rekening met zomer- en wintertijd in plaats van tijden alleen als losse tekst te bewaren.",
          "Twee bezoekers kunnen hetzelfde slot tegelijk kiezen. De server moet bepalen wie werkelijk reserveert; een knop die in één browser verdwijnt voorkomt geen dubbele boeking."
        ]
      },
      {
        "heading": "Denk de route na het kiezen door",
        "checklist": [
          "Is het slot nog beschikbaar bij bevestigen?",
          "Krijgt de bezoeker datum, tijdzone, locatie of belwijze te zien?",
          "Kan iemand veilig annuleren of verplaatsen?",
          "Wat gebeurt er als e-mail niet aankomt?",
          "Wie ziet mislukte of onvolledige aanvragen?"
        ],
        "paragraphs": [
          "Vraag alleen intakegegevens die voor de afspraak nodig zijn. Een verkoper hoeft bijvoorbeeld geen uitgebreide medische of financiële informatie in een algemeen afspraakveld te ontvangen. Bepaal hoe gegevens worden bewaard en wie ze mag bekijken."
        ]
      },
      {
        "heading": "Gebruik bestaande software als die de vraag oplost",
        "paragraphs": [
          "Een bestaande agenda-integratie kan passen, mits de kosten, gegevensverwerking en gewenste werkwijze kloppen. Maatwerk is vooral relevant als je specifieke rechten, koppelingen of een bijzondere planning nodig hebt.",
          "Sitesnit vraagt zelf om een optionele belvoorkeur: werkdagen van 18:00 tot 21:30 of het weekend. Dat formulier reserveert geen vrij slot. Gebruik diezelfde duidelijkheid ook op jouw website."
        ]
      }
    ],
    "related": [
      "/bedrijfsprocessen-automatiseren",
      "/website-koppelen-aan-crm",
      "/contact"
    ],
    "sources": []
  },
  {
    "id": "E1",
    "slug": "website-structuur",
    "title": "Een websitestructuur die past bij je bezoekers",
    "description": "Kies pagina’s vanuit vragen en taken, niet vanuit een standaard menu. Met drie voorbeeldstructuren voor een vakbedrijf, adviseur en inhoudelijk platform.",
    "group": "ontwerp-je-website",
    "tool": "/tools/website-ontwerp-tool",
    "service": "/diensten/webdesign",
    "audience": "Bedrijven die hun pagina-indeling voorbereiden",
    "outcome": "Een sitemap maken met een duidelijke taak per pagina.",
    "unique": "Drie verschillende sitetrees plus criteria voor splitsen en samenvoegen.",
    "intro": "Een menu is geen lijst van alles wat je bedrijf weet. Het helpt je bezoeker de juiste uitleg, een passend voorbeeld en een volgende stap vinden. Begin met die taken; de vormgeving komt daarna.",
    "sections": [
      {
        "heading": "Drie bedrijven hebben niet dezelfde indeling nodig",
        "table": {
          "headers": [
            "Voorbeeldbedrijf",
            "Mogelijke hoofdpagina’s",
            "Waarom deze keuze?"
          ],
          "rows": [
            [
              "Vakbedrijf",
              "Diensten, projecten en werkwijze",
              "Bezoekers willen zien wat je uitvoert en of je ervaring past"
            ],
            [
              "Adviseur",
              "Vraagstukken, aanpak en kennismaken",
              "De situatie en samenwerking wegen zwaarder dan een lange productlijst"
            ],
            [
              "Inhoudelijk platform",
              "Onderwerpen, uitleg en hulpmiddelen",
              "Lezers komen via verschillende vragen binnen en zoeken verdieping"
            ]
          ]
        },
        "paragraphs": [
          "Dit zijn startpunten, geen verplichte vijfpaginaformules. Een compact aanbod kan op één pagina passen. Een eigen dienstenpagina is nuttig als zij een duidelijke vraag zelfstandig kan beantwoorden."
        ]
      },
      {
        "heading": "Wanneer splits je een pagina?",
        "paragraphs": [
          "Splits wanneer bezoekers andere informatie nodig hebben om te kiezen. Twee diensten met een andere doelgroep, aanpak of vervolgstap verdienen vaak een eigen plek. Alleen een andere zoekterm of plaatsnaam is geen inhoudelijk verschil.",
          "Voeg samen als pagina’s dezelfde uitleg geven en bezoekers moeten raden welke ze nodig hebben. Houd belangrijke bestaande URLs bij een verandering in het oog; een menu aanpassen is niet hetzelfde als een adres veilig verhuizen."
        ]
      },
      {
        "heading": "Geef iedere pagina een opdracht",
        "checklist": [
          "Welke vraag brengt iemand hier?",
          "Wat moet diegene na het lezen begrijpen?",
          "Welk eigen voorbeeld of bewijs helpt?",
          "Welke vervolgstap past op dit punt?",
          "Vanaf welke andere pagina is deze pagina logisch te vinden?"
        ],
        "paragraphs": [
          "Maak daarna een eenvoudige route: introductie → uitleg → bewijs → contact. Niet iedere bezoeker volgt die helemaal. Een dienstenpagina moet daarom ook begrijpelijk zijn voor iemand die rechtstreeks uit een zoekresultaat komt."
        ]
      },
      {
        "heading": "Structuur en ontwerp versterken elkaar",
        "paragraphs": [
          "Een paginastructuur beschrijft wat waar hoort. Het ontwerp bepaalt hoe tekst, beeld en actie zichtbaar worden. Gebruik het ontwerpvoorbeeld om voorkeuren te onderzoeken; beoordeel het niet als een kant-en-klare website.",
          "De Beurswijzer-case laat zien hoe uitleg en rekentools binnen één platform samenkomen. Gebruik de keuzes als inspiratie, niet als reden om dezelfde indeling voor ieder bedrijf te kopiëren."
        ]
      }
    ],
    "related": [
      "/website-ontwerp-voorbeelden",
      "/projecten/beurswijzer",
      "/wat-kost-een-website"
    ],
    "sources": [],
    "widget": "structures"
  },
  {
    "id": "E2",
    "slug": "website-ontwerp-voorbeelden",
    "title": "Website-ontwerpvoorbeelden: kijk naar de keuzes",
    "description": "Bekijk eigen Sitesnit-projecten en leer waarop je kunt letten: inhoudshiërarchie, typografie, kleur, mobiel gebruik en contact.",
    "group": "ontwerp-je-website",
    "tool": "/tools/website-ontwerp-tool",
    "service": "/diensten/webdesign",
    "audience": "Ondernemers die een ontwerprichting zoeken",
    "outcome": "Voorkeuren onderbouwen in plaats van een andere website kopiëren.",
    "unique": "Eigen cases met specifieke observatievragen en richtingkeuze.",
    "intro": "Een voorbeeld helpt pas als je kunt uitleggen wat je eraan aanspreekt. Is dat de rust, het contrast, de manier waarop een dienst wordt uitgelegd of hoe je meteen verder kunt? Neem die keuze mee, niet de hele layout.",
    "widget": "cases",
    "sections": [
      {
        "heading": "Beurswijzer: uitleg naast iets dat je zelf kunt doen",
        "paragraphs": [
          "Bij Beurswijzer horen financiële uitleg en interactieve berekeningen bij hetzelfde verhaal. Bekijk hoe een lezer van een onderwerp naar een hulpmiddel kan gaan, en hoe cijfers en labels een andere hiërarchie krijgen dan een gewone alinea.",
          "Let in de case ook op de mobiele weergave. Een breed dashboard simpelweg verkleinen is geen mobiele compositie. De belangrijkste bedragen, uitleg en invoer moeten in een logische leesvolgorde staan."
        ]
      },
      {
        "heading": "Beurswatcher: overzicht voor informatie en berekeningen",
        "paragraphs": [
          "Bekijk bij Beurswatcher hoe het ontwerp informatie groepeert. Koppen, witruimte en kleur kunnen verschil aangeven tussen uitleg, een invoerveld en een uitkomst. Je hoeft niet elk blok even zwaar te maken om het vindbaar te houden.",
          "De cases tonen ontwerpkeuzes. Ze bewijzen zonder meetgegevens niet dat een bepaalde kleur meer omzet oplevert. Kies een richting die past bij je inhoud en bezoekers, niet bij een onbewezen percentage."
        ]
      },
      {
        "heading": "Maak je voorkeur bespreekbaar",
        "table": {
          "headers": [
            "In plaats van",
            "Beschrijf liever"
          ],
          "rows": [
            [
              "‘Doe precies dit’",
              "‘De rustige tekstbreedte maakt het prettig leesbaar’"
            ],
            [
              "‘Meer premium’",
              "‘Een sterker lettertype, eigen fotografie en minder losse stijlen’"
            ],
            [
              "‘Meer beweging’",
              "‘Laat dit ene voorbeeld openvouwen, terwijl contact direct bereikbaar blijft’"
            ],
            [
              "‘Mobiel hetzelfde’",
              "‘Dezelfde herkenbaarheid, met een indeling voor een smal scherm’"
            ]
          ]
        }
      },
      {
        "heading": "Van voorbeeld naar jouw richting",
        "paragraphs": [
          "In Ontwerp je website kies je inhoud, stijl en kleuren en bekijk je een bewerkbaar voorbeeld. Dat is een gespreksstart, geen gratis opgeleverde website. De uiteindelijke pagina’s en functies worden voor jouw opdracht uitgewerkt.",
          "De andere merken in het projectenoverzicht zijn duidelijk gelabelde ontwerpconcepten. Ze laten mogelijkheden zien en worden niet als klantopdrachten of gemeten resultaten gepresenteerd."
        ]
      }
    ],
    "related": [
      "/website-structuur",
      "/projecten/beurswatcher",
      "/projecten"
    ],
    "sources": []
  },
  {
    "id": "F1",
    "slug": "seo-audit-checklist",
    "title": "SEO-auditchecklist: van signaal naar onderbouwde actie",
    "description": "Controleer bereikbaarheid, indexering, interne links, metadata en snelheid. Maak onderscheid tussen gemeten fouten en punten die context nodig hebben.",
    "group": "seo-audit",
    "tool": "/tools/seo-audit",
    "service": "/diensten/seo-optimalisatie",
    "audience": "Website-eigenaren die technische bevindingen willen beoordelen",
    "outcome": "Bewijs verzamelen en prioriteren zonder een scan als volledige SEO-beoordeling te zien.",
    "unique": "Controlelijst plus uitgewerkt kapotte-linkvoorbeeld met herstel en hercontrole.",
    "intro": "Een lange lijst waarschuwingen is nog geen plan. Leg bij ieder punt vast wat je hebt gevonden, op welke pagina, waarom het daar een probleem is en hoe je de oplossing controleert.",
    "widget": "audit-checklist",
    "sections": [
      {
        "heading": "Begin met toegang en bestemming",
        "paragraphs": [
          "Controleer eerst of de bedoelde publieke pagina bereikbaar is en de juiste inhoud geeft. Kijk vervolgens naar indexeringsinstructies en de gekozen voorkeurs-URL. Een bewust afgeschermde testomgeving hoeft juist niet in zoekresultaten te staan.",
          "Een noindex-instructie is dus niet overal een fout. Bij een publiek toegankelijke pagina moet een crawler de instructie kunnen lezen. Noindex is geen toegangsbeveiliging: privé- en klantomgevingen blijven achter een echte login. Een technische scan kent niet altijd de bedoeling van een pagina; dat vraagt beoordeling."
        ]
      },
      {
        "heading": "Beoordeel bevindingen op bewijs",
        "table": {
          "headers": [
            "Controle",
            "Wat kun je vaststellen?",
            "Welke context blijft nodig?"
          ],
          "rows": [
            [
              "Kapotte interne link",
              "Bronpagina, linkdoel en ontvangen status",
              "Of het doel bewust is verwijderd"
            ],
            [
              "Paginatitel",
              "Aanwezigheid en werkelijk getoonde tekst",
              "Of die de zoekvraag en inhoud goed beschrijft"
            ],
            [
              "Afbeelding zonder alt",
              "Welk element geen tekstalternatief heeft",
              "Of het beeld informatief of alleen decoratief is"
            ],
            [
              "Snelheidsmeting",
              "Methode, omstandigheden en gemeten waarden",
              "Of dit overeenkomt met ervaringen van echte bezoekers"
            ]
          ]
        }
      },
      {
        "heading": "Voorbeeld: een link naar een verdwenen dienst",
        "paragraphs": [
          "Voorbeeldsituatie: /diensten verwijst naar /advies-oud, dat 404 teruggeeft. De dienst bestaat nog op /advies. Vastgesteld is de gebroken route, niet een bewezen daling van posities.",
          "Actie: wijzig de interne link direct naar /advies. Als /advies werkelijk dezelfde dienst vervangt, kan een permanente redirect van het oude adres zinvol zijn. Hercontrole: open de bronpagina, volg de link en test het oude adres afzonderlijk. Markeer het pas als opgelost nadat de nieuwe controle het bevestigt."
        ]
      },
      {
        "heading": "Een vragencheck en een audit vullen elkaar aan",
        "paragraphs": [
          "De websitecheck combineert jouw inhoudelijke antwoorden met een mobiele Lighthouse-meting van de opgegeven pagina. Dat is geen crawl van je hele website en geen volledige beoordeling van vindbaarheid.",
          "Gebruik de lijst hieronder zelfstandig of neem concrete bevindingen mee naar een gesprek over SEO-optimalisatie. Voor teksten, doelgroep en bewijs blijft inhoudelijk werk nodig; een technische score kan dat niet overnemen."
        ]
      }
    ],
    "related": [
      "/404-fouten-oplossen",
      "/website-niet-gevonden-google",
      "/website-snelheid-testen"
    ],
    "sources": [
      "robots"
    ]
  },
  {
    "id": "F2",
    "slug": "website-niet-gevonden-google",
    "title": "Je website niet gevonden in Google: waar begin je?",
    "description": "Maak onderscheid tussen niet geïndexeerd en niet zichtbaar op de gewenste zoekvraag. Gebruik Search Console en de juiste controlevolgorde.",
    "group": "seo-audit",
    "tool": "/tools/seo-audit",
    "service": "/diensten/seo-optimalisatie",
    "audience": "Eigenaren die een website of pagina niet terugvinden",
    "outcome": "Indexeringsproblemen onderscheiden van bereik en relevantie.",
    "unique": "Drie afzonderlijke onderzoeksroutes: nieuw, verdwenen en laag zichtbaar.",
    "intro": "‘Ik zie mijn website niet’ kan verschillende dingen betekenen. De pagina kan ontbreken in de index, zichtbaar zijn op andere zoekvragen of lager staan dan je verwacht. Dat zijn verschillende onderzoeken.",
    "sections": [
      {
        "heading": "Welke situatie herken je?",
        "table": {
          "headers": [
            "Situatie",
            "Begin hier",
            "Daarna"
          ],
          "rows": [
            [
              "Een nieuwe pagina",
              "Controleer de exacte URL in Search Console",
              "Bereikbaarheid, indexeringsstatus en interne verwijzingen"
            ],
            [
              "Een pagina die eerder zichtbaar was",
              "Vergelijk de periode vóór en na de verandering",
              "Wijzigingen, redirects en beschikbaarheid onderzoeken"
            ],
            [
              "Wel geïndexeerd, weinig zichtbaarheid",
              "Bekijk zoekvragen en bijbehorende pagina’s",
              "Nagaan of inhoud en aanbod de bedoelde vraag beantwoorden"
            ]
          ]
        }
      },
      {
        "heading": "Gebruik een exacte URL, geen gok op basis van één zoekopdracht",
        "paragraphs": [
          "Bekijk in je eigen Search Console-property de status van de betreffende URL. Een zoekopdracht met site: kan helpen bij een snelle indruk, maar is geen volledige inventaris van je geïndexeerde pagina’s.",
          "Controleer of je dezelfde variant onderzoekt: http of https, met of zonder www en met het juiste pad. Een redirect of andere voorkeurs-URL kan verklaren waarom je oorspronkelijke adres niet afzonderlijk verschijnt."
        ]
      },
      {
        "heading": "Controleer toegang voordat je meer tekst toevoegt",
        "paragraphs": [
          "Een onbedoelde noindex, onbereikbare pagina of foutieve verhuizing los je niet op door extra zoekwoorden in een kop te zetten. Onderzoek eerst het concrete signaal. Bewuste account- en testpagina’s horen juist niet openbaar in Google.",
          "Is de pagina wel beschikbaar en geïndexeerd, beoordeel dan welke vraag zij beantwoordt. Geef de bezoeker eigen uitleg, voorbeelden en een passende vervolgstap. Meer pagina’s met hetzelfde antwoord maken het aanbod niet duidelijker."
        ]
      },
      {
        "heading": "Vergelijk perioden zorgvuldig",
        "paragraphs": [
          "Kijk bij een daling naar vergelijkbare perioden en houd rekening met wijzigingen in vraag, seizoenen en je eigen site. Eén dag of één zoekwoord is te weinig om een hele website af te schrijven.",
          "Leg vast wat je hebt veranderd en controleer later opnieuw. Sitesnit kan techniek en inhoud met je nalopen, maar niemand kan op basis van een checklist een positie of indexeringsdatum garanderen."
        ]
      }
    ],
    "related": [
      "/seo-audit-checklist",
      "/website-migratie-checklist",
      "/seo-venlo"
    ],
    "sources": [
      "inspection",
      "traffic"
    ]
  },
  {
    "id": "F3",
    "slug": "website-snelheid-testen",
    "title": "Website­snelheid testen: begrijp wat je meet",
    "description": "Lees een mobiele Lighthouse-meting met de juiste context. Ontdek het verschil tussen labdata en echte bezoekersdata en controleer verbeteringen eerlijk.",
    "group": "websitecheck",
    "tool": "/tools/website-check",
    "service": "/diensten/seo-optimalisatie",
    "audience": "Ondernemers met een trage website of onduidelijke score",
    "outcome": "Een snelheidsresultaat correct interpreteren en een gerichte vervolgmeting kiezen.",
    "unique": "Gelabeld labvoorbeeld; geen tweede scanner of extra scanquota.",
    "intro": "Een snelheidsscore is een samenvatting van een test, geen verklaring van iedere vertraging. Kijk naar de onderzochte pagina, omstandigheden en onderliggende bevindingen voordat je iets aanpast.",
    "sections": [
      {
        "heading": "Labdata en bezoekersdata beantwoorden een andere vraag",
        "table": {
          "headers": [
            "Soort meting",
            "Wat zie je?",
            "Beperking"
          ],
          "rows": [
            [
              "Mobiele Lighthouse-labtest",
              "Een gesimuleerde pagina-load onder vastgelegde omstandigheden",
              "Niet de ervaring van alle bezoekers"
            ],
            [
              "Veldgegevens, als beschikbaar",
              "Geaggregeerde ervaringen van echte bezoeken binnen een meetperiode",
              "Niet voor iedere URL of website beschikbaar"
            ],
            [
              "Handmatig testen",
              "Wat jij op je toestel kunt lezen en bedienen",
              "Eén toestel en situatie, geen volledige dataset"
            ]
          ]
        },
        "paragraphs": [
          "TBT uit een Lighthouse-labtest is geen INP-meting van echte bezoekers. Noteer bij veldgegevens ook of ze bij die URL of bij de hele origin horen. Ontbrekende gegevens zijn onbekend, niet nul."
        ]
      },
      {
        "heading": "Voorbeeld: zoek de oorzaak niet alleen in het cijfer",
        "paragraphs": [
          "Fictief leesvoorbeeld, geen scan van jouw website: een rapport toont een trage weergave van het grootste element. Dat zegt nog niet dat je foto’s de oorzaak zijn. Het betreffende element en de bijbehorende audits kunnen bijvoorbeeld wijzen op late ontdekking van het beeld of wachten op andere bestanden.",
          "Begin bij de vastgestelde audit. Leg vast wat je wijzigt en waarom. Een kleinere afbeelding helpt niet bij iedere vertraging; het weghalen van noodzakelijke inhoud om een score te verhogen kan de pagina minder bruikbaar maken."
        ]
      },
      {
        "heading": "Vergelijk dezelfde pagina onder vergelijkbare omstandigheden",
        "checklist": [
          "Bewaar de geteste URL, het meetmoment en de testmethode.",
          "Noteer welke code, bestanden of instellingen zijn veranderd.",
          "Voer na de wijziging opnieuw een meting uit.",
          "Controleer daarnaast of tekst, beelden, menu en formulier nog werken."
        ],
        "paragraphs": [
          "Scores kunnen variëren. Vergelijk daarom niet zonder uitleg een desktopmeting van gisteren met een mobiele meting van een andere pagina. Bekijk de onderliggende waarden en de praktijkervaring samen."
        ]
      },
      {
        "heading": "Je website bij Sitesnit laten bekijken",
        "paragraphs": [
          "De bestaande websitecheck vraagt eerst naar je inhoud en klantpad en vraagt daarna je websiteadres voor Google Lighthouse. De technische uitkomst blijft gescheiden van je antwoorden. Bij een mislukte meting wordt geen score verzonnen.",
          "Wil je alleen een losse snelheidsmeting, dan kun je ook rechtstreeks Google PageSpeed Insights gebruiken. Een uitgebreide automatische sitecrawl is hier niet als werkende extra tool beschikbaar."
        ]
      }
    ],
    "related": [
      "/website-niet-goed-op-mobiel",
      "/seo-audit-checklist",
      "/diensten/onderhoud-hosting"
    ],
    "sources": [
      "lighthouse",
      "labfield",
      "pagespeed"
    ],
    "widget": "lab-example"
  },
  {
    "id": "F4",
    "slug": "404-fouten-oplossen",
    "title": "404-fouten oplossen zonder alles door te sturen",
    "description": "Bepaal of een 404 een kapotte link, bewuste verwijdering of ontbrekend bestand is. Kies herstel, een passende redirect of een echte 404 en controleer opnieuw.",
    "group": "seo-audit",
    "tool": "/tools/seo-audit",
    "service": "/diensten/seo-optimalisatie",
    "audience": "Eigenaren met niet-gevonden pagina’s of bestanden",
    "outcome": "Per fout de juiste actie kiezen in plaats van een homepage-catchall.",
    "unique": "Beslismatrix en voor/na-link-/redirectvoorbeeld.",
    "intro": "Een 404 betekent dat op dat adres geen pagina of bestand is gevonden. Dat kan terecht zijn. Het wordt vooral vervelend als je bezoekers actief naar dat verdwenen adres stuurt of een belangrijk bestand ontbreekt.",
    "sections": [
      {
        "heading": "Bepaal eerst wat ontbreekt",
        "table": {
          "headers": [
            "Situatie",
            "Passende eerste actie",
            "Wat je vermijdt"
          ],
          "rows": [
            [
              "Typefout in een interne link",
              "Corrigeer de link op de bronpagina",
              "Een permanente omleiding voor iedere spelfout"
            ],
            [
              "Pagina verhuisd met gelijkwaardige inhoud",
              "Link naar de nieuwe URL en maak een passende redirect",
              "Een keten via meerdere oude adressen"
            ],
            [
              "Inhoud definitief weg, geen vervanger",
              "Een bruikbare 404 of 410 behouden",
              "Doen alsof de homepage dezelfde inhoud is"
            ],
            [
              "Afbeelding, CSS of script ontbreekt",
              "Bestand en verwijzing herstellen",
              "Alleen de HTML-pagina testen"
            ]
          ]
        }
      },
      {
        "heading": "Een redirect moet inhoudelijk kloppen",
        "paragraphs": [
          "Voorbeeld: /diensten/oud-advies is vervangen door /diensten/advies. De interne verwijzing hoort direct naar het nieuwe adres te gaan. Een permanente redirect helpt bezoekers die het oude adres nog gebruiken.",
          "Bestaat de oorspronkelijke dienst niet meer, dan is een willekeurige verkoop- of homepage niet automatisch een vervanger. Help bezoekers op een echte niet-gevondenpagina verder met zoeken of navigatie, terwijl de foutstatus behouden blijft."
        ]
      },
      {
        "heading": "Controleer bron én bestemming",
        "checklist": [
          "Noteer waar de kapotte verwijzing staat.",
          "Open het doel en controleer de werkelijke status.",
          "Pas de bronlink aan waar je daarover beschikt.",
          "Controleer een eventuele redirect op de juiste eindbestemming.",
          "Test het gerenderde onderdeel, ook als het om een bestand gaat."
        ],
        "paragraphs": [
          "Een afbeelding kan stuk blijven terwijl de pagina zelf 200 teruggeeft. Bekijk daarom netwerkfouten en het daadwerkelijke resultaat. Een scanbevinding verdwijnt pas uit de werkvoorraad nadat een nieuwe controle herstel bevestigt."
        ]
      },
      {
        "heading": "Bewaar een kleine lijst met beslissingen",
        "paragraphs": [
          "Noteer oud adres, oorzaak, gekozen actie en controledatum. Zo kan een latere websiteverhuizing rekening houden met eerdere redirects. Neem belangrijke externe verwijzingen mee als je die kent, zonder te doen alsof je alle links op internet kunt inventariseren.",
          "Sitesnit kan helpen beoordelen welke URLs een vervanger hebben. Een groot getal 404’s is op zichzelf geen bewijs van een even groot SEO-probleem."
        ]
      }
    ],
    "related": [
      "/website-migratie-checklist",
      "/seo-audit-checklist",
      "/verouderde-website"
    ],
    "sources": [
      "http",
      "migration"
    ]
  },
  {
    "id": "F5",
    "slug": "website-migratie-checklist",
    "title": "Website verhuizen: controle vóór, tijdens en na de overstap",
    "description": "Bereid een websiteverhuizing voor met URL-mapping, redirects, inhoud en testbare contactroutes. Download een lege mapping en controleer de live omgeving.",
    "group": "seo-audit",
    "tool": "/tools/seo-audit",
    "service": "/diensten/webdesign",
    "audience": "Bedrijven die website, domein of platform veranderen",
    "outcome": "Een uitvoerbare verhuislijst met oude en nieuwe bestemmingen maken.",
    "unique": "Driefasenplan plus downloadbare URL-mapping; geen schijn-acceptatiescan.",
    "intro": "Een nieuw ontwerp kan klaar zijn terwijl de verhuizing nog niet goed is voorbereid. Bezoekers, zoekmachines, formulieren en koppelingen moeten hun weg naar de juiste nieuwe bestemming vinden.",
    "widget": "migration",
    "sections": [
      {
        "heading": "Vóór de overstap: maak de bestemming expliciet",
        "paragraphs": [
          "Verzamel bestaande pagina’s, belangrijke bestanden en bekende verwijzingen. Noteer per adres of de inhoud blijft, verhuist, wordt samengevoegd of bewust verdwijnt. Bewaar ook relevante teksten en meetinstellingen; een screenshot van de homepage is geen volledige inventaris.",
          "Test de nieuwe site in een afgeschermde omgeving. Leg vast hoe die afscherming bij livegang wordt gewijzigd, zonder de testomgeving zelf openbaar te maken. Controleer formulieren met eigen testgegevens."
        ]
      },
      {
        "heading": "Tijdens de overstap: controleer de hele route",
        "checklist": [
          "Nieuwe publieke URLs tonen de bedoelde inhoud.",
          "Oude URLs verwijzen waar passend rechtstreeks naar hun vervanger.",
          "Interne links en canonicals gebruiken de definitieve adressen.",
          "Sitemap en indexeringsinstructies passen bij de live omgeving.",
          "Belangrijke beelden, CSS en scripts laden.",
          "Aanvragen en koppelingen worden aantoonbaar verwerkt."
        ],
        "paragraphs": [
          "Redirect niet automatisch alles naar de homepage. Houd het mogelijk om terug te gaan als er een wezenlijke functie faalt. Laat de juiste verantwoordelijke weten wanneer welke wijziging is uitgevoerd."
        ]
      },
      {
        "heading": "Na de overstap: blijf gericht controleren",
        "paragraphs": [
          "Loop de belangrijkste bezoekroutes opnieuw door en volg echte foutsignalen. Controleer indexerings- en zoekgegevens in de gekoppelde Search Console-property. Een tijdelijke verandering in zichtbaarheid is niet genoeg om meteen de hele migratie ongedaan te maken.",
          "Bewaar de mapping en redirects ook na de eerste controle. Noteer correcties in dezelfde lijst, zodat een latere wijziging geen redirectketen introduceert."
        ]
      },
      {
        "heading": "Wat een checklist niet kan aftekenen",
        "paragraphs": [
          "Deze lijst organiseert het werk; hij voert geen automatische acceptatietest of juridische controle uit. De websitecheck kan aanvullend één pagina technisch meten en je inhoudelijke aandachtspunten ordenen.",
          "Bij een Sitesnit-opdracht spreken we af welke inhoud, functies en adressen bij de migratie horen. Geef in je aanvraag aan of het domein blijft en welke bestaande functies absoluut moeten blijven werken."
        ]
      }
    ],
    "related": [
      "/404-fouten-oplossen",
      "/website-niet-gevonden-google",
      "/website-offerte-aanvragen"
    ],
    "sources": [
      "migration"
    ]
  }
];
