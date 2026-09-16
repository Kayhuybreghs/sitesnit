export type Answer = string | string[];
export type Answers = Record<string, Answer>;
export type Option = { value: string; label: string; detail?: string };
export type Question = {
  id: string;
  title: string;
  help?: string;
  options: Option[];
  multiple?: boolean;
  topic?: string;
  action?: string;
  why?: string;
  priority?: number;
};
const opts = (values: string[][]): Option[] =>
  values.map(([value, label, detail]) => ({ value, label, detail }));
const assessment = opts([
  ["good", "Ja, duidelijk"],
  ["partial", "Gedeeltelijk"],
  ["needs", "Nee, dit kan beter"],
  ["unknown", "Dat weet ik niet"],
  ["na", "Niet van toepassing"],
]);
export const websiteQuestions: Question[] = [
  {
    id: "message",
    title: "Begrijpt een nieuwe bezoeker meteen wat je bedrijf doet?",
    help: "Denk aan het eerste scherm, zonder verder te scrollen.",
    topic: "Maak je eerste boodschap concreet",
    action:
      "Zet bovenaan wat je aanbiedt, voor wie en wat de volgende stap is.",
    why: "Een heldere eerste indruk helpt bezoekers bepalen of ze bij je op de juiste plek zijn.",
    priority: 9,
  },
  {
    id: "offer",
    title: "Zijn je diensten of producten makkelijk te vinden?",
    help: "Eén overzichtelijke dienstenpagina kan prima voldoende zijn.",
    topic: "Orden je aanbod vanuit de klant",
    action:
      "Geef je aanbod begrijpelijke namen en maak het direct bereikbaar vanuit de navigatie.",
    why: "Je bezoeker moet zijn eigen vraag in je aanbod herkennen.",
    priority: 7,
  },
  {
    id: "difference",
    title: "Wordt duidelijk waarom iemand voor jou zou kiezen?",
    topic: "Laat zien wat je onderscheidt",
    action:
      "Benoem een concrete manier van werken of een relevante specialisatie en laat een voorbeeld zien.",
    why: "Specifieke informatie helpt meer dan algemene beloften over kwaliteit.",
    priority: 6,
  },
  {
    id: "action",
    title: "Heeft iedere belangrijke pagina een duidelijke volgende stap?",
    help: "Bijvoorbeeld contact opnemen, een afspraak maken of bestellen.",
    topic: "Maak de volgende stap zichtbaar",
    action:
      "Kies per belangrijke pagina één hoofdactie en geef de knop een concrete naam.",
    why: "Een bezoeker die interesse heeft, moet eenvoudig verder kunnen.",
    priority: 10,
  },
  {
    id: "friction",
    title: "Kunnen bezoekers zonder omwegen contact opnemen of bestellen?",
    topic: "Haal omwegen uit je klantpad",
    action:
      "Doorloop de route op je telefoon en verwijder stappen die geen informatie of zekerheid toevoegen.",
    why: "Onnodig zoeken of opnieuw invullen kan een geïnteresseerde bezoeker laten afhaken.",
    priority: 9,
  },
  {
    id: "forms",
    title: "Werken je formulieren, boekingen of bestellingen ook echt?",
    help: "Controleer of het bericht aankomt en de bevestiging klopt.",
    topic: "Test de volledige aanvraagroute",
    action:
      "Verstuur een testaanvraag en controleer ontvangst, foutmeldingen en bevestiging.",
    why: "Een mooi formulier heeft pas waarde wanneer een aanvraag daadwerkelijk aankomt.",
    priority: 10,
  },
  {
    id: "trust",
    title: "Laat je betrouwbaar bewijs zien bij je aanbod?",
    help: "Bijvoorbeeld echte reviews, vakkennis, werkvoorbeelden of heldere bedrijfsinformatie.",
    topic: "Maak vertrouwen concreet",
    action:
      "Plaats verifieerbare informatie of een passend werkvoorbeeld bij het moment waarop iemand moet kiezen.",
    why: "Bewijs maakt je belofte geloofwaardiger.",
    priority: 7,
  },
  {
    id: "examples",
    title: "Helpen je voorbeelden om je werk of aanpak te begrijpen?",
    help: "Kies niet van toepassing als projectvoorbeelden niet passen bij je aanbod.",
    topic: "Geef je werkvoorbeelden context",
    action:
      "Vertel bij een voorbeeld wat de vraag was en welke keuze je hebt gemaakt.",
    why: "Context maakt duidelijk hoe je werk aansluit bij de vraag van een nieuwe klant.",
    priority: 5,
  },
  {
    id: "doubt",
    title: "Beantwoordt je website vragen die iemand vóór contact heeft?",
    help: "Denk aan kosten, samenwerking en wat er na een aanvraag gebeurt.",
    topic: "Neem twijfel vóór contact weg",
    action:
      "Beantwoord de meest gestelde vragen bij je dienst of contactactie.",
    why: "Duidelijke verwachtingen verlagen de drempel om een gesprek te beginnen.",
    priority: 8,
  },
  {
    id: "mobile",
    title: "Kun je je website op een telefoon prettig gebruiken?",
    help: "Lees tekst, open het menu en probeer ook de belangrijkste actie.",
    topic: "Controleer het hele mobiele klantpad",
    action: "Test het menu, tekst, knoppen en formulier op een echte telefoon.",
    why: "Een technisch geslaagde test zegt nog niet dat de mobiele route prettig is.",
    priority: 9,
  },
  {
    id: "speed",
    title: "Voelt je website op mobiel snel genoeg om direct te gebruiken?",
    help: "Dit is jouw ervaring. De Lighthouse-meting hieronder blijft een aparte technische bron.",
    topic: "Onderzoek de ervaren vertraging",
    action:
      "Vergelijk je eigen ervaring met de gemeten Lighthouse-audits voordat je een technische oorzaak aanwijst.",
    why: "Een snelheidservaring kan meerdere oorzaken hebben; gericht meten helpt de juiste oplossing kiezen.",
    priority: 6,
  },
  {
    id: "access",
    title: "Kun je alles lezen en bedienen, ook zonder muis?",
    help: "Denk aan leesbaar contrast, zichtbare focus en labels bij invoervelden.",
    topic: "Maak bediening toegankelijker",
    action:
      "Doorloop de site met Tab en controleer leesbaarheid, focus en formulierlabels.",
    why: "Automatische toegankelijkheidstests vinden niet alle problemen.",
    priority: 8,
  },
  {
    id: "findability",
    title: "Word je gevonden op wat je aanbiedt, buiten je bedrijfsnaam?",
    help: "Kies “Dat weet ik niet” als je dit nog niet hebt gecontroleerd.",
    topic: "Onderzoek hoe klanten je vinden",
    action:
      "Bekijk zoekopdrachten en vertoningen in Google Search Console en vergelijk die met je aanbod.",
    why: "De technische SEO-score meet geen posities of volledige vindbaarheid.",
    priority: 5,
  },
  {
    id: "content",
    title: "Beantwoorden je belangrijkste pagina’s de vragen van klanten?",
    help: "Met actuele informatie over het aanbod en de samenwerking.",
    topic: "Maak je diensteninhoud behulpzamer",
    action:
      "Werk je belangrijkste pagina bij met concrete antwoorden op de vragen die je vaak krijgt.",
    why: "Relevante inhoud helpt bezoekers kiezen en geeft zoekmachines context.",
    priority: 6,
  },
  {
    id: "measurement",
    title: "Weet je welke websitebezoeken tot aanvragen leiden?",
    help: "Bezoekersaantallen en daadwerkelijk ontvangen aanvragen zijn verschillende dingen.",
    topic: "Meet de stap naar een echte aanvraag",
    action:
      "Meet afgeronde aanvragen afzonderlijk van klikken en vergelijk ze met de verkeersbron.",
    why: "Zo beoordeel je de website op bruikbare aanvragen, niet alleen op bezoek.",
    priority: 4,
  },
].map((q) => ({ ...q, options: assessment }));
export const priceQuestions: Question[] = [
  {
    id: "situation",
    title: "Waar begin je?",
    options: opts([
      ["new", "Ik wil een nieuwe website"],
      ["replace", "Ik wil mijn website vervangen"],
      ["improve", "Ik wil mijn huidige website verbeteren"],
      ["unknown", "Ik wil eerst de mogelijkheden ontdekken"],
    ]),
  },
  {
    id: "goal",
    title: "Wat moet je website vooral doen?",
    options: opts([
      ["leads", "Aanvragen opleveren"],
      ["appointments", "Afspraken mogelijk maken"],
      ["inform", "Mijn bedrijf en aanbod presenteren"],
      ["sales", "Producten online verkopen"],
      ["unknown", "Dat wil ik samen bepalen"],
    ]),
  },
  {
    id: "action",
    title: "Wat moeten bezoekers op je website kunnen doen?",
    help: "Kies de belangrijkste actie. Een link naar een externe agenda is iets anders dan een eigen boekingssysteem.",
    options: opts([
      ["contact", "Een contactformulier invullen"],
      ["external", "Doorklikken naar mijn agenda of webshop"],
      ["booking", "Boeken in een eigen systeem op de website"],
      ["checkout", "Op de website bestellen en betalen"],
      ["unknown", "Dat weet ik nog niet"],
    ]),
  },
  {
    id: "features",
    title: "Welke aanvullende functies heb je in gedachten?",
    help: "Je kunt meerdere antwoorden kiezen. Laat functies weg die je niet nodig hebt.",
    multiple: true,
    options: opts([
      ["none", "Geen extra functies"],
      ["form", "Een gewoon contactformulier"],
      ["gallery", "Een overzicht van mijn werk"],
      ["portal", "Een klantportaal met eigen gegevens"],
      ["calculator", "Een interactieve berekening"],
      ["search", "Zoeken of filteren in veel inhoud"],
      ["chatbot", "Een AI-chatbot met mijn bedrijfsinformatie"],
      ["automation", "Een koppeling die facturen of ander werk voorbereidt"],
      ["unknown", "Nog niet zeker"],
    ]),
  },
  {
    id: "pages",
    title: "Hoeveel pagina’s heeft je verhaal nodig?",
    options: opts([
      ["one", "Eén pagina", "Alles in één overzicht."],
      [
        "five",
        "Vijf pagina’s",
        "Bijvoorbeeld home, diensten, werk, over en contact.",
      ],
      ["more", "Meer dan vijf pagina’s"],
      ["unknown", "Dat weet ik nog niet"],
    ]),
  },
  {
    id: "pageTypes",
    title: "Hoe verschillend zijn de pagina’s die je nodig hebt?",
    options: opts([
      ["simple", "Gewone informatie over mijn bedrijf en diensten"],
      ["repeat", "Veel herhaalde inhoud, zoals producten of projecten"],
      ["complex", "Verschillende interactieve omgevingen"],
      ["unknown", "Dat moet nog duidelijk worden"],
    ]),
  },
  {
    id: "design",
    title: "Welke uitstraling en beweging past bij je idee?",
    options: opts([
      ["refined", "Een eigen uitstraling met verfijnde animaties"],
      ["editorial", "Een sterk beeldgedreven ontwerp"],
      ["advanced", "Een uitgebreide interactieve ervaring of 3D-toepassing"],
      ["unknown", "Ik laat me graag adviseren"],
    ]),
  },
  {
    id: "integrations",
    title: "Moet je website gegevens uitwisselen met andere software?",
    options: opts([
      ["none", "Nee"],
      ["links", "Alleen links naar bestaande diensten"],
      ["api", "Ja, een echte gegevenskoppeling"],
      ["unknown", "Dat weet ik nog niet"],
    ]),
  },
  {
    id: "content",
    title: "Welke teksten en beelden heb je al?",
    help: "Extra tekst- of beeldproductie stemmen we eerst samen af.",
    options: opts([
      ["ready", "Mijn teksten en beelden zijn beschikbaar"],
      ["partial", "Een deel is beschikbaar"],
      ["needed", "Ik heb hulp nodig met teksten of beelden"],
      ["unknown", "Nog niet duidelijk"],
    ]),
  },
  {
    id: "languages",
    title: "In hoeveel talen wil je de website aanbieden?",
    options: opts([
      ["one", "Eén taal"],
      ["multiple", "Meerdere talen"],
      ["unknown", "Dat weet ik nog niet"],
    ]),
  },
  {
    id: "migration",
    title: "Moet er bestaande inhoud of data worden overgezet?",
    options: opts([
      ["none", "Nee, we beginnen opnieuw"],
      ["small", "Een beperkt aantal teksten, beelden of bestaande URL’s"],
      ["large", "Een grote hoeveelheid inhoud, producten of gegevens"],
      ["unknown", "Dat moet nog bekeken worden"],
    ]),
  },
  {
    id: "management",
    title: "Wat wil je zelf kunnen aanpassen?",
    options: opts([
      ["discuss", "Dat wil ik samen afspreken"],
      ["content", "Teksten en afbeeldingen"],
      ["catalog", "Een uitgebreide catalogus of veel inhoud"],
      ["roles", "Inhoud met meerdere rollen en goedkeuringen"],
    ]),
  },
  {
    id: "planning",
    title: "Wanneer wil je ongeveer beginnen?",
    help: "Dit verandert de prijs niet automatisch. We stemmen beschikbaarheid en planning persoonlijk af.",
    options: opts([
      ["soon", "Zo snel als praktisch mogelijk"],
      ["months", "Binnen een paar maanden"],
      ["explore", "Ik ben me aan het oriënteren"],
      ["unknown", "Nog geen planning"],
    ]),
  },
  {
    id: "budget",
    title: "Welk investeringsniveau heb je in gedachten?",
    help: "Je budget verandert de prijs van dezelfde website niet.",
    options: opts([
      ["low", "Rond €1.082,95 incl. btw (€895 excl.)"],
      ["medium", "Rond €2.292,95 incl. btw (€1.895 excl.)"],
      ["custom", "€3.327,50 of meer incl. btw (€2.750 excl.)"],
      ["unknown", "Ik wil eerst begrijpen wat passend is"],
    ]),
  },
  {
    id: "support",
    title: "Welke ondersteuning wil je na oplevering bespreken?",
    options: opts([
      ["discuss", "Dat wil ik samen bepalen"],
      ["hosting", "Hosting en technisch beheer"],
      ["maintenance", "Onderhoud en hulp bij wijzigingen"],
      ["own", "Ik regel de techniek al zelf"],
    ]),
  },
];
