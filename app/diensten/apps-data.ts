import type { Service } from './service-data';

/* Publication wording checked against the official Apple and Google guidance:
 * https://developer.apple.com/app-store/review/
 * https://support.google.com/googleplay/android-developer/answer/9859751?hl=en
 * Both platforms review submissions; approval and its timing are not promised.
 */
export const appsService: Service = {
  slug: 'apps',
  anchor: 'apps',
  name: 'Apps voor iPhone & Android',
  number: '05',
  tone: 'green',
  group: 'Ontwerpen & bouwen',
  title: 'Een app laten maken.',
  accent: 'Voor iPhone en Android.',
  summary: 'Een afspraak bekijken, een melding ontvangen of onderweg iets doorgeven. Een app maakt zulke terugkerende handelingen direct bereikbaar op de telefoon van je klant of medewerker. Sitesnit ontwerpt en bouwt apps voor iPhone en Android, met voorbereiding voor publicatie in de App Store of Google Play. We beginnen bij de taak die je app moet vereenvoudigen.',
  tags: ['iPhone & Android', 'App Store & Google Play', 'Mobiele toepassingen'],
  introTitle: 'Wat wil iemand kunnen doen?',
  introAccent: 'Daar begint je app.',
  intro: 'Een app moet een duidelijke reden geven om hem te openen en te blijven gebruiken. Denk aan een klant die zijn afspraak beheert, een medewerker die op locatie een foto toevoegt of een gebruiker die de voortgang van een aanvraag volgt. We brengen de belangrijkste handelingen bij elkaar en kiezen welke functies de eerste versie nodig heeft. Daarbij bekijken we of een app, een webapp of een combinatie het beste bij het gebruik past.',
  methods: [
    [
      'Een korte route naar de belangrijkste taak',
      'Wie opent de app, op welk moment en met welk doel? Vanuit die vragen ontwerpen we de schermen en navigatie. Veelgebruikte acties krijgen een duidelijke plek. Tekst blijft leesbaar, knoppen zijn prettig aan te raken en je kunt terug zonder het overzicht te verliezen. We bekijken ook het eerste gebruik: wat moet iemand weten, wanneer is inloggen nodig en hoe maken we de volgende stap duidelijk?',
    ],
    [
      'Functies die passen bij gebruik onderweg',
      'Een foto toevoegen, een herinnering ontvangen of informatie bij de hand houden kan een app waardevol maken. We werken uit welke telefoonfuncties daarvoor nodig zijn en wanneer toestemming wordt gevraagd. Ook minder ideale situaties tellen mee: een onderbroken verbinding, geweigerde toestemming of een onvolledig formulier. We bepalen vooraf wat zonder internet moet blijven werken en hoe de app laat zien of gegevens goed zijn opgeslagen.',
    ],
    [
      'De juiste informatie voor de juiste gebruiker',
      'Een klant ziet eigen gegevens; een medewerker heeft andere taken en toegang. We leggen de gebruikersrollen vast en controleren toegangsrechten bij het opvragen en wijzigen van informatie. Als de app samenwerkt met je website, planning of andere software, onderzoeken we welke koppelingen mogelijk zijn. We spreken af welke bron leidend is en hoe wijzigingen worden verwerkt. Persoonsgegevens, bewaartermijnen en het beheren van accounts krijgen daarbij een concrete plek.',
    ],
    [
      'Testen, indienen en blijven onderhouden',
      'We spreken af welke toestellen en versies worden ondersteund en testen de belangrijke routes, inloggen, foutmeldingen en het gebruik bij een slechte verbinding. Jij kunt de app beoordelen voordat we hem indienen. We bereiden de appwinkelteksten, screenshots, privacy-informatie en benodigde testtoegang voor. Apple en Google beoordelen vervolgens de inzending. Na publicatie maken we afspraken over updates, meldingen van problemen en verdere ontwikkeling.',
    ],
  ],
  optionsTitle: 'Een idee voor je klanten of medewerkers?',
  optionsAccent: 'Vertel wat de app moet doen.',
  options: [],
  faqs: [
    [
      'Wat is het verschil tussen een app en een webapp?',
      'Een app installeer je op je telefoon, bijvoorbeeld via de App Store of Google Play. Een webapp open je via je browser. Welke vorm past, hangt af van het gebruik, de gewenste telefoonfuncties en hoe je mensen wilt bereiken. Een openbare website, klantportaal en mobiele app kunnen ook samenwerken. We bespreken de verschillen voordat de aanpak wordt vastgelegd.',
    ],
    [
      'Kan mijn app op iPhone én Android werken?',
      'Ja, we kunnen beide platformen meenemen in de opdracht. Vooraf bepalen we of je voor iPhone, Android of beide wilt ontwikkelen en welke toestellen en versies worden ondersteund. Functies en bediening kunnen per platform verschillen. Daarom controleren we de afgesproken werking voor ieder gekozen platform afzonderlijk.',
    ],
    [
      'Komt mijn app automatisch in de App Store en Google Play?',
      'De ontwikkeling en het indienen van een app zijn afzonderlijke stappen. We spreken af via welk ontwikkelaarsaccount de app wordt gepubliceerd en wie welke gegevens aanlevert. Voor indiening bereiden we de vereiste informatie en controles voor. Apple en Google beslissen zelf over toelating. Bij vragen of een afwijzing bekijken we wat aangepast moet worden; goedkeuring of een vaste publicatiedatum kunnen we niet garanderen.',
    ],
    [
      'Kunnen klanten inloggen en gegevens uit mijn bestaande software gebruiken?',
      'Dat kan onderdeel van de app zijn. We onderzoeken de beschikbare koppelingen en bepalen welke gegevens een klant of medewerker mag bekijken en wijzigen. Ook accountbeheer, herstel van toegang en het afhandelen van mislukte verzoeken horen bij die uitwerking. Als een systeem beperkingen heeft, bespreken we die voordat we de werking afspreken.',
    ],
    [
      'Wat gebeurt er na publicatie?',
      'Telefoons, besturingssystemen en appwinkelregels veranderen. We leggen vast wie updates uitvoert, problemen opvolgt en controleert of de app blijft werken met de ondersteunde versies. Je krijgt duidelijkheid over toegang tot de accounts en bestanden en over de onderdelen die Sitesnit blijft beheren. Nieuwe functies kunnen later worden toegevoegd na een aanvullende afspraak. Wettelijke rechten op herstel blijven behouden.',
    ],
  ],
  cta: 'Bespreek je app',
  contact: '/contact?dienst=apps',
  meta: 'Laat een app maken voor iPhone of Android. Sitesnit verzorgt ontwerp, ontwikkeling en voorbereiding voor de App Store of Google Play. Bespreek je idee.',
};
