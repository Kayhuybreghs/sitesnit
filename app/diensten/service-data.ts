import { specialistServices } from "./specialist-data";
import { webappsService } from './webapps-data';
import { appsService } from './apps-data';
export type Service = {
  slug: string; anchor: string; name: string; number: string; tone: "blue" | "green" | "peach"; group: string;
  title: string; accent: string; summary: string; tags: string[];
  introTitle: string; introAccent: string; intro: string; methods: [string,string][];
  optionsTitle: string; optionsAccent: string; options: [string,string,string,string][];
  faqs: [string,string][]; cta: string; contact: string; meta: string;
};
export const services: Service[] = [
  appsService,
  webappsService,
  ...specialistServices,
  {
    "slug": "webdesign",
    "anchor": "nieuwe-website",
    "name": "Webdesign & webshops",
    "number": "01",
    "tone": "blue",
    "group": "Ontwerpen & bouwen",
    "title": "Jouw verhaal.",
    "accent": "Sterk gebouwd.",
    "summary": "Van de eerste indruk tot het contactformulier: je website moet vertellen wie je bent en bezoekers verder helpen. Sitesnit verbindt je merk, teksten, beelden en techniek in een eigen ontwerp. Voor ondernemers in Venlo, omstreken en de rest van Limburg.",
    "tags": [
      "Onepager",
      "Bedrijfswebsite",
      "Gecodeerd maatwerk"
    ],
    "introTitle": "Meer dan een mooi scherm.",
    "introAccent": "Een website die klopt.",
    "intro": "We beginnen bij je bedrijf en je bezoekers. Welke diensten bied je aan, waarom kiezen mensen voor jou en wat willen ze eerst weten? Daaruit volgen de pagina’s, het ontwerp en de functies. Je hoeft zelf geen technisch plan klaar te hebben.",
    "methods": [
      [
        "Een duidelijk verhaal",
        "We ordenen je aanbod en bepalen de route door je website: van een heldere introductie naar diensten, voorbeelden en contact. Bestaande teksten gebruiken we waar ze goed werken; nieuwe copy stemmen we apart af."
      ],
      [
        "Een herkenbaar merk",
        "Logo, kleurenpalet en typografie vormen één geheel. Heb je nog geen huisstijl, dan kunnen we die ontwikkelen. Voor eigen bedrijfsfoto’s en video werken we met een externe partner; opdracht en kosten stemmen we vooraf af."
      ],
      [
        "Mobiel als vertrekpunt",
        "Navigatie, tekstbreedte, knoppen en formulieren worden eerst voor een telefoon uitgewerkt. Op grotere schermen krijgt het ontwerp meer ruimte, met gerichte beweging en scherpe, lichte beelden."
      ],
      [
        "Ontwikkeling en oplevering",
        "We bouwen de afgesproken inhoud en functies, testen de contactroute en controleren de technische basis. Bij volledig maatwerk worden de indeling en functies specifiek voor jouw vraag gecodeerd. Hosting en verder onderhoud spreken we mee af."
      ]
    ],
    "optionsTitle": "Hoeveel ruimte heeft",
    "optionsAccent": "jouw verhaal nodig?",
    "options": [
      [
        "Eén doorlopend verhaal",
        "Een onepager voor een compact aanbod: je introductie, dienst, bewijs en contact op één pagina.",
        "Lees over de onepager",
        "/diensten/webdesign/pakketten#onepager"
      ],
      [
        "Onderwerpen een eigen plek",
        "Vijf pagina’s voor bijvoorbeeld home, diensten, projecten, over je bedrijf en contact.",
        "Lees over vijf pagina’s",
        "/diensten/webdesign/pakketten#website"
      ],
      [
        "Een eigen systeem of functie",
        "Meer pagina’s, bijzondere interactie, een klantomgeving of koppeling? We werken de werking eerst uit en bouwen de functies rondom jouw proces.",
        "Ontdek volledig maatwerk",
        "/diensten/webdesign/pakketten#maatwerk"
      ]
    ],
    "faqs": [
      [
        "Wat hoort bij een websitepakket?",
        "Het afgesproken aantal pagina’s en de inhoud, vormgeving en functies uit je voorstel. We leggen vast wie teksten en beelden verzorgt en welke werkzaamheden na oplevering doorgaan. Een logo, fotoshoot, webshop of koppeling is niet automatisch bij ieder pakket inbegrepen."
      ],
      [
        "Kan ik mijn huidige website laten vernieuwen?",
        "Ja. We bekijken eerst welke inhoud, URL’s en functies waardevol zijn. Bij een herontwerp houden we rekening met bestaande links en vindbaarheid. Zo verbeteren we gericht wat bezoekers nu in de weg zit."
      ],
      [
        "Waar vind ik de prijzen?",
        "Op de kostenpagina vergelijk je de pakketprijzen en maatwerkbasis. De pakketverdieping legt eerst uit welke indeling en mogelijkheden bij je passen, zonder dat je direct een keuze hoeft te maken."
      ]
    ],
    "cta": "Bespreek je website",
    "contact": "/contact?dienst=webdesign",
    "meta": "Laat een website maken die je aanbod duidelijk uitlegt. Sitesnit verzorgt ontwerp en bouw, vanaf één pagina tot maatwerk. Bekijk de aanpak en pakketten."
  },
  {
    "slug": "webshops",
    "anchor": "webshops",
    "name": "Webshops",
    "number": "02",
    "tone": "green",
    "group": "Ontwerpen & bouwen",
    "title": "Van eerste blik.",
    "accent": "Naar bestellen.",
    "summary": "Je producten verdienen een winkel die vertrouwen geeft en prettig werkt. We ontwerpen de route van assortiment en productinformatie naar winkelmand en afrekenen, met dezelfde aandacht voor je merk als voor je techniek.",
    "tags": [
      "Assortiment",
      "Mobiel bestellen",
      "Betaal- & voorraadkoppelingen"
    ],
    "introTitle": "Een goede winkel.",
    "introAccent": "Voor én achter de schermen.",
    "intro": "Hoeveel producten verkoop je? Welke varianten zijn er? Hoe verwerk je voorraad, verzending en retourvragen? De antwoorden bepalen of een bestaande winkeloplossing past of dat een eigen uitwerking nodig is. Een webshop krijgt een voorstel op basis van deze werking.",
    "methods": [
      [
        "Assortiment begrijpelijk maken",
        "Categorieën, zoekfuncties en filters helpen bezoekers het juiste product vinden. Productpagina’s geven ruimte aan kenmerken, varianten, prijs, beelden en de informatie die vóór bestellen nodig is."
      ],
      [
        "Een duidelijke kooproute",
        "We ontwerpen productkeuze, winkelmand en afrekenen voor mobiel. Bezorgmogelijkheden, betaalkeuzes en de bevestiging sluiten op elkaar aan. Het aantal stappen volgt uit wat echt nodig is."
      ],
      [
        "Werk achter de bestelling",
        "Waar de gebruikte systemen het ondersteunen, koppelen we betaalstatus, voorraad, orderverwerking en boekhouding. De benodigde toegang, regels en uitzonderingen brengen we vooraf in kaart."
      ],
      [
        "Testen met echte scenario’s",
        "We controleren onder meer varianten, onvolledige invoer en de afgesproken betaal- en bezorgstromen. Na oplevering kun je productcontent en technisch onderhoud laten verzorgen."
      ]
    ],
    "optionsTitle": "De winkel past bij",
    "optionsAccent": "jouw manier van verkopen.",
    "options": [
      [
        "Een eerste assortiment",
        "Een overzichtelijke winkel met duidelijke categorieën, productpagina’s en een begrijpelijke bestelroute.",
        "Bespreek je webshop",
        "/contact?dienst=webshops"
      ],
      [
        "Een uitgebreid aanbod",
        "Varianten, productfilters, bijzondere prijsregels of grotere catalogi vragen om meer uitwerking.",
        "Bespreek de mogelijkheden",
        "/contact?dienst=webshops"
      ],
      [
        "Minder handwerk per order",
        "Laat bestellingen doorstromen naar de software waarin je al werkt, met controle op ontbrekende of dubbele gegevens.",
        "Bekijk automatisering",
        "/diensten/ai-automatisering"
      ]
    ],
    "faqs": [
      [
        "Valt een webshop onder de vijfpaginawebsite?",
        "Een webshop vraagt om product-, bestel- en betaalfuncties. Daarom bepalen we de scope en investering afzonderlijk; het aantal gewone pagina’s alleen zegt te weinig."
      ],
      [
        "Kunnen productteksten en beelden worden verzorgd?",
        "Ja. Productcopy, beeldbewerking en contentonderhoud kunnen onderdeel zijn van de opdracht. Voor eigen fotografie of video stemmen we een opdracht af met een externe partner."
      ],
      [
        "Wat bepaalt de prijs?",
        "Het assortiment, varianten, ontwerp, betaal- en verzendwerking, koppelingen en de beschikbare productgegevens. Ook abonnementen en gebruikskosten van externe systemen worden vooraf besproken."
      ]
    ],
    "cta": "Bespreek je webshop",
    "contact": "/contact?dienst=webshops",
    "meta": "Een webshop laten maken? Bekijk hoe Sitesnit producten, categorieën, mobiel afrekenen en koppelingen uitwerkt. Bespreek je assortiment en de benodigde functies."
  },
  {
    "slug": "branding",
    "anchor": "branding",
    "name": "Merk & identiteit",
    "number": "03",
    "tone": "peach",
    "group": "Ontwerpen & bouwen",
    "title": "Een eigen gezicht.",
    "accent": "Overal herkenbaar.",
    "summary": "Een sterk merk ontstaat wanneer verhaal, logo, kleuren, woorden en beelden bij elkaar passen. We brengen die keuzes samen, zodat je bedrijf op je website en in je content herkenbaar blijft.",
    "tags": [
      "Logo & kleurenpalet",
      "Typografie",
      "Foto & video"
    ],
    "introTitle": "Eerst de richting.",
    "introAccent": "Dan de details.",
    "intro": "Wat maakt je bedrijf herkenbaar voor de mensen die je wilt bereiken? We vertalen je aanbod en karakter naar een visuele richting die je ook dagelijks kunt gebruiken. Van de bovenkant van je website tot een nieuw bericht op Instagram.",
    "methods": [
      [
        "Jouw merk als vertrekpunt",
        "We bespreken je aanbod, doelgroep en de indruk die je wilt achterlaten. Bestaande herkenning nemen we mee: niet alles hoeft weg als een deel al goed werkt."
      ],
      [
        "Logo en huisstijl",
        "We werken de afgesproken logovarianten, kleuren en typografie uit. Ook de toepassing telt: leesbaarheid op klein formaat, voldoende contrast en een samenhangend gebruik op verschillende achtergronden."
      ],
      [
        "Eigen fotografie en video",
        "Voor foto's van je bedrijf, team, producten of werk en voor video schakelen we een externe partner in. We bepalen samen de benodigde beelden, de opdracht en het gebruik op je website en kanalen."
      ],
      [
        "Van merk naar toepassing",
        "We vertalen de richting naar je website en, waar afgesproken, formats voor content en social media. Je krijgt de afgesproken bestanden en praktische uitleg voor een consistent gebruik."
      ]
    ],
    "optionsTitle": "Een sterke basis.",
    "optionsAccent": "Ruimte om door te bouwen.",
    "options": [
      [
        "Een nieuw merk",
        "Vanaf de eerste merkrichting naar een herkenbaar logo en een bruikbare huisstijl.",
        "Bespreek je identiteit",
        "/contact?dienst=branding"
      ],
      [
        "Een bestaande uitstraling verfijnen",
        "Je bedrijf is veranderd of je uitingen lopen uiteen. We brengen de belangrijkste keuzes weer bij elkaar.",
        "Bespreek je herontwerp",
        "/contact?dienst=branding"
      ],
      [
        "Het merk zichtbaar maken",
        "Een identiteit krijgt betekenis in je website, teksten en de beelden waarmee je je werk laat zien.",
        "Ontdek webdesign",
        "/diensten/webdesign"
      ]
    ],
    "faqs": [
      [
        "Kan ik alleen een huisstijl laten maken?",
        "Ja. We stemmen af welke onderdelen je nodig hebt en waar je ze wilt gebruiken. Een website kan onderdeel zijn van het traject of later volgen."
      ],
      [
        "Is fotografie of video inbegrepen?",
        "Dat is een afzonderlijk af te stemmen onderdeel met een externe partner. We maken de benodigde opnamen, planning, rechten en kosten vooraf duidelijk."
      ],
      [
        "Wat als mijn logo nog goed is?",
        "Dan kan het blijven. We kijken welke kleuren, typografie, beelden en toepassingen versterking nodig hebben om er één herkenbaar geheel van te maken."
      ]
    ],
    "cta": "Bespreek je merk",
    "contact": "/contact?dienst=branding",
    "meta": "Laat je logo, kleuren en typografie als één huisstijl uitwerken. Sitesnit vertaalt je merk naar je website, met eigen fotografie en video via een partner."
  },
  {
    "slug": "seo",
    "anchor": "seo",
    "name": "SEO, content & social media",
    "number": "04",
    "tone": "green",
    "group": "Vindbaar & zichtbaar",
    "title": "Laat je vinden.",
    "accent": "Geef het juiste antwoord.",
    "summary": "Mensen zoeken naar een oplossing, een specialist of een bedrijf in de buurt. We verbinden die zoekvragen met duidelijke pagina’s en een technische basis die zoekmachines kunnen begrijpen. Met Venlo en Limburg als werkgebied waar dat bij jouw bedrijf past.",
    "tags": [
      "Zoekvragen",
      "Technische SEO",
      "Venlo & Limburg"
    ],
    "introTitle": "Gevonden op een vraag.",
    "introAccent": "Gekozen om je antwoord.",
    "intro": "SEO zit in je hele website: in wat je uitlegt, hoe pagina’s samenhangen en of bezoekers gemakkelijk verder kunnen. We beginnen met je aanbod en de vragen van je klanten. Daarna kiezen we waar de meeste inhoudelijke verbetering nodig is.",
    "methods": [
      [
        "Onderwerpen en zoekintentie",
        "We bepalen welke vragen bij jouw diensten passen en welke pagina daarop antwoord geeft. Een dienst, een praktisch blog en een case hebben elk hun eigen rol; we voorkomen dat ze allemaal hetzelfde vertellen."
      ],
      [
        "Pagina’s die inhoud hebben",
        "We schrijven of verbeteren titels, koppen, beschrijvingen en teksten. Duidelijke interne links verbinden je uitleg met relevante diensten, voorbeelden en contact. Je eigen kennis en bewijs geven de inhoud waarde."
      ],
      [
        "Een bereikbare technische basis",
        "We controleren onder meer indexeerbaarheid, URL-structuur, canonicals, sitemap, mobiele bruikbaarheid en laadtijd. Bij gewijzigde pagina’s bespreken we welke bestaande URL’s moeten doorverwijzen."
      ],
      [
        "Lokaal relevant en actueel",
        "Voor Venlo en omstreken werken we met je echte diensten, werkgebied en voorbeelden. We houden bedrijfsinformatie consistent en gebruiken beschikbare Search Console-data om onderwerpen en pagina’s verder te verbeteren."
      ]
    ],
    "optionsTitle": "Vindbaarheid vraagt",
    "optionsAccent": "om samenhang.",
    "options": [
      [
        "Een bestaande website verbeteren",
        "Een technische meting plus vragen over je inhoud geven een eerste beeld van wat aandacht nodig heeft.",
        "Start de websitecheck",
        "/websitecheck"
      ],
      [
        "Regelmatig nieuwe uitleg",
        "Twee of vier blogs per maand over vragen die je klanten werkelijk stellen, met redactie en een plek in je website.",
        "Bekijk content & copywriting",
        "/diensten/content"
      ],
      [
        "Je verhaal op je kanalen",
        "Vertaal je onderwerpen naar passende berichten voor Instagram, Facebook en LinkedIn. Dezelfde basisinhoud, aangepast aan ieder platform.",
        "Bekijk socialmediaonderhoud",
        "/diensten/social-media"
      ]
    ],
    "faqs": [
      [
        "Kun je mij helpen beter vindbaar te worden in Venlo?",
        "We stemmen inhoud en structuur af op je aanbod en werkgebied. Echte lokale voorbeelden, een heldere contactroute en juiste bedrijfsinformatie helpen daarbij. We gebruiken geen fictief adres of herhaalde pagina’s waarin alleen de plaatsnaam verandert."
      ],
      [
        "Garanderen jullie een eerste positie in Google?",
        "Nee. Zoekresultaten hangen ook af van concurrentie en veranderingen bij zoekmachines. We maken duidelijk welk werk we doen en beoordelen de voortgang met de gegevens die beschikbaar zijn."
      ],
      [
        "Zit SEO ook in de blogs en het onderhoud?",
        "De blogpakketten omvatten onderwerpenonderzoek, schrijven, SEO-opmaak en publicatie. Het pakket Hosting + onderhoud + SEO omvat daarnaast doorlopende verbeteringen aan teksten en code van je bestaande website."
      ]
    ],
    "cta": "Bespreek je vindbaarheid",
    "contact": "/contact?dienst=seo",
    "meta": "Wil je meer aandacht voor je bedrijf online? Vergelijk SEO-verbeteringen, blogs en socialmediabeheer en bekijk welke aanpak past bij je klanten en aanbod."
  },
  {
    "slug": "content",
    "anchor": "content",
    "name": "Content & copywriting",
    "number": "05",
    "tone": "blue",
    "group": "Vindbaar & zichtbaar",
    "title": "Jouw kennis.",
    "accent": "Goed verwoord.",
    "summary": "Heldere webteksten en blogs laten zien wat je weet en wat je voor klanten kunt betekenen. Wij verzorgen onderwerpenonderzoek, schrijven, SEO-opmaak en publicatie. Met 2 of 4 nieuwe blogs per maand blijft er aandacht voor je bedrijf, zonder dat jij steeds een artikel hoeft te maken.",
    "tags": [
      "2 of 4 blogs per maand",
      "Copywriting",
      "SEO-opmaak"
    ],
    "introTitle": "Jij runt je bedrijf.",
    "introAccent": "Wij houden je verhaal bij.",
    "intro": "Je hoeft niet iedere week naar een leeg document te kijken. Samen bepalen we je aanbod, onderwerpen en toon. Daarna werken we vanuit een contentplanning. Jouw kennis gebruiken we voor de inhoud; schrijven, structureren en plaatsen kun je uit handen geven.",
    "methods": [
      [
        "Een inhoudelijke planning",
        "Klantvragen, diensten en ontwikkelingen in je bedrijf vormen het vertrekpunt. We kiezen onderwerpen die elkaar aanvullen en aansluiten op pagina’s waarop bezoekers kunnen doorlezen of contact opnemen."
      ],
      [
        "Teksten die echt over jou gaan",
        "We schrijven webcopy, diensten- en productteksten of blogs op basis van je expertise en beschikbare bronnen. Begrijpelijke uitleg en concrete voorbeelden gaan vóór algemene verkooppraatjes."
      ],
      [
        "SEO meenemen in de uitwerking",
        "Iedere afgesproken publicatie krijgt passende koppen, een paginatitel, beschrijving en relevante interne links. Afbeeldingen en bronnen krijgen aandacht. De inhoud wordt gecontroleerd op juistheid en aansluiting op je bedrijf."
      ],
      [
        "Klaar voor publicatie",
        "We verzorgen de SEO-opmaak: een passende titel, duidelijke koppen, interne links en een leesbare indeling. Vervolgens publiceren we het artikel. Je inhoudelijke controle en eventuele aanvullende beelden spreken we vooraf af."
      ]
    ],
    "optionsTitle": "Een goed ritme.",
    "optionsAccent": "Een actief verhaal.",
    "options": [
      [
        "4 blogs per maand",
        "Een vaste stroom nieuwe inhoud voor de vragen van je klanten. Onderwerpenonderzoek, schrijven, SEO-opmaak en publiceren zijn inbegrepen. €393,25 inclusief btw (€325 exclusief) per maand.",
        "Bespreek 4 blogs per maand",
        "/contact?dienst=content&blogs=4"
      ],
      [
        "2 blogs per maand",
        "Een rustig publicatieritme met dezelfde aandacht voor inhoud en vindbaarheid. Onderwerpenonderzoek, schrijven, SEO-opmaak en publiceren zijn inbegrepen. €211,75 inclusief btw (€175 exclusief) per maand.",
        "Bespreek 2 blogs per maand",
        "/contact?dienst=content&blogs=2"
      ],
      [
        "Eenmalig je teksten aanscherpen",
        "Een nieuwe website, een onduidelijke dienst of een assortiment dat betere uitleg verdient. We pakken de benodigde pagina’s gericht aan.",
        "Bespreek je webteksten",
        "/contact?dienst=content"
      ]
    ],
    "faqs": [
      [
        "Kan ik het hele blogonderhoud uitbesteden?",
        "Ja. Beide blogpakketten omvatten onderwerpenonderzoek, schrijven, SEO-opmaak en publicatie. We spreken vooraf af wanneer jouw inhoudelijke controle nodig is en welke informatie of beelden je aanlevert."
      ],
      [
        "Is vaker publiceren altijd beter voor SEO?",
        "De inhoud moet nuttig zijn voor je bezoekers. Twee of vier blogs per maand is een werkritme, geen garantie op hogere posities. We kiezen onderwerpen die iets toevoegen en verbinden ze met je bestaande diensten en artikelen."
      ],
      [
        "Wat kost content per maand?",
        "Twee blogs per maand kosten €211,75 inclusief btw (€175 exclusief). Vier blogs kosten €393,25 inclusief btw (€325 exclusief), €30,25 inclusief btw voordeliger dan twee keer het kleinere pakket. Eenmalige webteksten of aanvullende foto- en videoproductie bespreken we apart."
      ]
    ],
    "cta": "Bespreek je content",
    "contact": "/contact?dienst=content",
    "meta": "Laat webteksten en blogs schrijven vanuit jouw vakkennis en klantvragen. Bekijk de aanpak, inhoud en maandpakketten voor twee of vier nieuwe blogs per maand."
  },
  {
    "slug": "social-media",
    "anchor": "social-media",
    "name": "Social media",
    "number": "06",
    "tone": "peach",
    "group": "Vindbaar & zichtbaar",
    "title": "Blijf in beeld.",
    "accent": "Met een eigen verhaal.",
    "summary": "Laat zien wat je doet zonder telkens zelf een bericht te moeten bedenken. We verzorgen content voor Instagram, Facebook en LinkedIn: dezelfde basisposts worden aangepast en op jouw gekozen platforms geplaatst. Jij kiest 4, 6 of 8 berichten per platform per maand.",
    "tags": [
      "Instagram",
      "Facebook",
      "LinkedIn"
    ],
    "introTitle": "Van losse berichten.",
    "introAccent": "Naar een herkenbaar ritme.",
    "intro": "Een nieuw project, een veelgestelde vraag, een kijkje achter de schermen of een goed blog: je bedrijf heeft verhalen genoeg. We vertalen die naar je kanalen, met een duidelijke taak per bericht en een passende vervolgstap naar je website.",
    "methods": [
      [
        "Kanaal en doel bepalen",
        "We bekijken waar je klanten zitten en wat je wilt vertellen. Meer uitleg, je werk laten zien of mensen naar een dienst leiden vraagt om verschillende berichten."
      ],
      [
        "Content en formats maken",
        "We maken dezelfde basiscontent passend voor je gekozen platforms: tekst, beeldselectie en vorm sluiten aan op je merk en het kanaal. Eigen foto’s en video geven het verhaal inhoud; aanvullende productie via een externe partner stemmen we apart af."
      ],
      [
        "Een overzichtelijke planning",
        "We spreken frequentie, kanalen en het moment van goedkeuren af. Vanuit de planning kunnen berichten worden klaargezet en gepubliceerd, zodat jij niet iedere dag in de agenda hoeft te duiken."
      ],
      [
        "Verbinden met je website",
        "Een blog kan aanleiding geven voor een social bericht, een project voor een korte case. We zorgen dat bezoekers na hun klik op een relevante pagina aankomen."
      ]
    ],
    "optionsTitle": "Niet ieder kanaal",
    "optionsAccent": "vraagt hetzelfde.",
    "options": [
      [
        "1, 2 of 3 platforms",
        "Instagram, Facebook en LinkedIn: kies waar je zichtbaar wilt zijn. Eén platform betekent één van deze kanalen. Dezelfde onderwerpen worden per kanaal aangepast.",
        "Vergelijk de maandprijzen",
        "/kosten#social-media"
      ],
      [
        "Je content verder gebruiken",
        "Vertaal een uitgewerkt blog naar passende berichten. Zo versterken je website en je social kanalen elkaar.",
        "Bekijk content & blogs",
        "/diensten/content"
      ],
      [
        "Eigen beelden als basis",
        "Bedrijfsfotografie, productbeelden of korte video via een externe partner, afgestemd op je merk en kanalen.",
        "Bekijk merk & beeld",
        "/diensten/branding"
      ]
    ],
    "faqs": [
      [
        "Moet ik zelf nog berichten plaatsen?",
        "Wij plaatsen de afgesproken berichten op je gekozen platforms. We stemmen de planning, je controle en toegang vooraf af. Nieuwe ontwikkelingen in je bedrijf geef je door zodat de inhoud actueel blijft."
      ],
      [
        "Beantwoorden jullie ook reacties en privéberichten?",
        "Dat is een afzonderlijke afspraak. Content maken en publiceren betekent niet automatisch dat klantenservice, reacties, advertentiebeheer of privéberichten worden overgenomen."
      ],
      [
        "Wat kost socialmediaonderhoud?",
        "Het aantal basisposts en het aantal platforms bepalen de maandprijs. Vier posts op één platform kosten €180,29 inclusief btw (€149 exclusief) per maand. Alle combinaties staan in het prijzenoverzicht op deze pagina. Dezelfde basisposts worden aangepast voor elk gekozen platform."
      ],
      [
        "Zijn vier posts op drie platforms twaalf verschillende onderwerpen?",
        "Het zijn vier basisposts, aangepast voor drie platforms: twaalf plaatsingen in totaal. Dat maakt hergebruik van goede inhoud mogelijk, met tekst en vorm die bij Instagram, Facebook of LinkedIn passen."
      ]
    ],
    "cta": "Bespreek je social media",
    "contact": "/contact?dienst=social-media",
    "meta": "Besteed Instagram, Facebook of LinkedIn uit aan Sitesnit. Bekijk de aanpak en pakketten met 4, 6 of 8 posts per platform per maand, met heldere prijzen inclusief en exclusief btw."
  },
  {
    "slug": "onderhoud-hosting",
    "anchor": "onderhoud-hosting",
    "name": "Onderhoud & hosting",
    "number": "07",
    "tone": "green",
    "group": "Beheren & vereenvoudigen",
    "title": "Online is het begin.",
    "accent": "Daarna blijven we zorgen.",
    "summary": "Een website heeft ook na de lancering aandacht nodig. Kies alleen hosting, voeg technische controles en herstel toe, of laat ook je bestaande teksten en SEO bijhouden. Je ziet hieronder precies welke werkzaamheden bij ieder maandpakket horen.",
    "tags": [
      "Hosting",
      "Technisch onderhoud",
      "Doorlopende SEO"
    ],
    "introTitle": "Een goede basis.",
    "introAccent": "Ook na de oplevering.",
    "intro": "Niet ieder bedrijf heeft hetzelfde onderhoud nodig. Een compacte bedrijfswebsite vraagt iets anders dan een platform met rekentools of een webshop met koppelingen. Daarom leggen we vast wat wordt beheerd, hoe je wijzigingen doorgeeft en welke terugkerende werkzaamheden bij je voorstel horen.",
    "methods": [
      [
        "Hosting en bereikbaarheid",
        "We richten de afgesproken hosting, domeinverbinding en beveiligde bereikbaarheid in. Eigenaarschap, toegang en eventuele externe diensten worden vastgelegd, zodat duidelijk is waar je website draait."
      ],
      [
        "Technische aandacht",
        "Bij de onderhoudspakketten controleren we maandelijks de snelheid en technische fouten. We herstellen technische fouten binnen je bestaande website. Nieuwe functies of grotere uitbreidingen krijgen een afzonderlijke afspraak."
      ],
      [
        "Inhoud actueel houden",
        "Met Hosting, onderhoud & SEO verbeteren we doorlopend de SEO-basis. We scherpen bestaande teksten aan en werken de code waar nodig bij, zodat je website technisch en inhoudelijk actueel blijft. Nieuwe blogartikelen kies je apart; ze krijgen eigen onderwerpen, onderzoek en publicatie."
      ],
      [
        "Duidelijke maandafspraken",
        "Hosting, technisch werk, content en eventuele externe abonnementen worden apart inzichtelijk gemaakt. Zo weet je welke taken terugkomen en welke grotere aanpassing een nieuw voorstel vraagt."
      ]
    ],
    "optionsTitle": "Kies wat jij",
    "optionsAccent": "wilt uitbesteden.",
    "options": [
      [
        "Hosting / €6,05 incl. btw per maand",
        "Alleen je website online houden. Wijzigingen en onderhoud zijn niet inbegrepen.",
        "Bekijk alle maandpakketten",
        "/kosten#onderhoud-hosting"
      ],
      [
        "Hosting & onderhoud / €36,29 incl. btw",
        "Inclusief maandelijkse controle op snelheid en technische fouten, en herstel van technische fouten binnen de bestaande website.",
        "Bespreek technisch onderhoud",
        "/contact?dienst=onderhoud-hosting"
      ],
      [
        "Hosting, onderhoud & SEO / €84,69 incl. btw",
        "De technische basis met doorlopende SEO-verbeteringen: bestaande teksten aanscherpen en code bijwerken waar nodig. Exclusief btw per maand.",
        "Bespreek onderhoud & SEO",
        "/contact?dienst=onderhoud-hosting"
      ]
    ],
    "faqs": [
      [
        "Kan onderhoud bij een bestaande website?",
        "We bekijken eerst hoe de website is gebouwd, waar hij draait en welke toegang beschikbaar is. Daarna kunnen we aangeven welk beheer mogelijk is en of er eerst werk nodig is om de basis op orde te brengen."
      ],
      [
        "Wat is de maandprijs?",
        "Hosting begint bij €6,05 inclusief btw (€5 exclusief) per maand. Hosting met onderhoud kost €36,29 inclusief btw (€29,99 exclusief); met onderhoud en SEO €84,69 inclusief btw (€69,99 exclusief). Hosting heeft een eerste looptijd van twaalf maanden en is daarna maandelijks opzegbaar. Nieuwe blogs en socialmediacontent zijn aparte pakketten."
      ],
      [
        "Is alles onbeperkt inbegrepen?",
        "We spreken de werkzaamheden en ruimte voor wijzigingen vooraf af. Nieuwe functies, grotere uitbreidingen of aanvullende externe kosten bespreken we voordat ze worden uitgevoerd."
      ]
    ],
    "cta": "Bespreek je onderhoud",
    "contact": "/contact?dienst=onderhoud-hosting",
    "meta": "Vergelijk hosting, technisch onderhoud en onderhoud met SEO. Bekijk maandprijzen inclusief btw, de eerste looptijd en welke werkzaamheden erbij horen."
  },
  {
    "slug": "ai-automatisering",
    "anchor": "ai-automatisering",
    "name": "AI & automatisering",
    "number": "08",
    "tone": "peach",
    "group": "Beheren & vereenvoudigen",
    "title": "Minder handwerk.",
    "accent": "Meer ruimte voor je bedrijf.",
    "summary": "Aanvragen verwerken, documenten uitlezen, gegevens overtypen of scenario’s berekenen: terugkerend werk kan slimmer. We bouwen bruikbare tools, AI-toepassingen en koppelingen rond je bestaande bedrijfsproces, met controle waar die nodig is.",
    "tags": [
      "AI-assistenten",
      "Rekentools",
      "Backend & koppelingen"
    ],
    "introTitle": "Van binnenkomende informatie.",
    "introAccent": "Naar bruikbaar resultaat.",
    "intro": "We beginnen bij een taak die nu tijd kost. Welke informatie komt binnen, wat doet iemand ermee en waar moet het resultaat terechtkomen? Soms is een vaste berekening of koppeling de beste oplossing. AI helpt waar taal, documenten en ongestructureerde informatie moeten worden begrepen.",
    "methods": [
      [
        "Formulieren & aanvragen",
        "Van een eenvoudige contactaanvraag tot een formulier met meerdere stappen. We bepalen welke gegevens nodig zijn, controleren de invoer en geven bezoekers duidelijke feedback. De aanvraag kan daarna doorstromen naar je bestaande software, met een klantdossier of controletaak op de juiste plek."
      ],
      [
        "Documenten en administratie",
        "Haal afgesproken gegevens uit documenten, controleer verplichte velden en koppel ze aan een order of klant. Een factuurconcept of controletaak kan klaarstaan zonder dezelfde informatie opnieuw over te typen."
      ],
      [
        "Assistenten met bedrijfskennis",
        "Een assistent kan veelgestelde vragen beantwoorden op basis van je eigen diensten, documenten en werkinstructies. We richten toegang, bronverwijzingen en de overdracht naar een medewerker in voor vragen die meer aandacht nodig hebben."
      ],
      [
        "Backend die werk verbindt",
        "Formulieren, bestellingen, betalingen en boekhouding kunnen gegevens uitwisselen. We bouwen de datamapping, toegangsrechten, controles op dubbele verwerking, foutmeldingen en herstelstappen rond de beschikbare API’s."
      ]
    ],
    "optionsTitle": "Maak ingewikkelde informatie",
    "optionsAccent": "eenvoudig te gebruiken.",
    "options": [
      [
        "Interactieve rekentools",
        "Zoals Beurswatcher: inleg, looptijd, rendement en inflatie worden doorgerekend naar een grafiek. Vaste rekenregels bepalen de cijfers; een eventuele AI-uitleg gebruikt die gecontroleerde uitkomst.",
        "Bekijk de Beurswatcher-case",
        "/projecten/beurswatcher"
      ],
      [
        "Formulieren & aanvragen",
        "Een contactformulier, intake of offerteaanvraag die alleen vraagt wat nodig is. Gecontroleerde gegevens kunnen rechtstreeks naar je klantdossier en werkplanning.",
        "Van aanvraag naar opvolging",
        "#formulieren"
      ],
      [
        "AI & softwarekoppelingen",
        "Documenten ordenen, conceptantwoorden voorbereiden of informatie tussen je systemen uitwisselen. We stemmen de gegevens, softwaretoegang en benodigde controle af op je bedrijf.",
        "Bespreek jouw werkproces",
        "/contact?dienst=ai"
      ]
    ],
    "faqs": [
      [
        "Zijn rekentools ook AI?",
        "Een rekenmotor kan bedragen en scenario’s bepalen met vaste, testbare regels. Daar is niet automatisch AI voor nodig. AI kan aanvullend helpen om invoer te ordenen of een gecontroleerde uitkomst begrijpelijk toe te lichten."
      ],
      [
        "Kun je mijn bestaande software koppelen?",
        "We onderzoeken welke API’s, exports, webhooks en rechten beschikbaar zijn. Daarna leggen we vast welke gegevens worden uitgewisseld, welke stappen zelfstandig verlopen en wat bij een fout of ontbrekende invoer gebeurt."
      ],
      [
        "Kunnen tools automatisch goedkopere aanbieders vinden?",
        "Dat kan wanneer geschikte, toegestane en actuele aanbiedersdata beschikbaar zijn. We tonen dan onder meer bron, meetmoment, dekking en relevante voorwaarden. De bestaande Beurswijzer-demo is een vergelijking van zelf ingevulde offertes, geen volledige live marktvergelijking."
      ],
      [
        "Wat bepaalt de investering?",
        "Het proces, de gegevens, het aantal koppelingen, benodigde controles en de gewenste interface. Eventuele AI-gebruikskosten, softwareabonnementen en onderhoud worden afzonderlijk inzichtelijk gemaakt."
      ]
    ],
    "cta": "Bespreek je werkproces",
    "contact": "/contact?dienst=ai",
    "meta": "Minder aanvragen overtypen of facturen voorbereiden? Ontdek hoe formulieren, rekentools en AI terugkerend werk kunnen overnemen, met controle waar die nodig is."
  }
];
