export const clientCases = [
  {
    slug: "beurswijzer", name: "Beurswijzer", theme: "green",
    eyebrow: "Financieel platform / inhoud & interactieve tools",
    title: "Van cijfers", accent: "naar overzicht.",
    summary: "Beurswijzer verbindt uitleg over geld met praktische rekentools. Een herkenbare groene identiteit, een eigen mobiele indeling en content die ook na de bouw wordt bijgehouden.",
    url: "https://beurswijzer.vercel.app/", image: "/projects/beurswijzer/home-sharp-800.webp", imageLarge: "/projects/beurswijzer/home-sharp.webp",
    imageAlt: "De groene Beurswijzer-homepage met uitleg over maandruimte en toekomstige opbouw", imageWidth: 1410, imageHeight: 754, imageSmallWidth: 800,
    graph: "/projects/beurswijzer/growth-640.webp", graphLarge: "/projects/beurswijzer/growth.webp",
    graphAlt: "Beurswijzer-budgetplanner met een interactieve grafiek voor verschillende beleggingsscenario’s", graphWidth: 1185, graphHeight: 620,
    phone: "/projects/beurswijzer/mobile", phoneAlt: "De echte mobiele homepage van Beurswijzer",
    challenge: "Financiële onderwerpen bevatten veel informatie. De website moet bezoekers eerst helpen begrijpen waar ze zijn en daarna een bruikbare route bieden: verder lezen, een vraag onderzoeken of zelf een scenario doorrekenen.",
    choices: [
      ["Een herkenbare richting", "Groen, een rustige basis en duidelijke typografie verbinden de homepage, artikelen en tools. De inhoud krijgt een duidelijke volgorde, met contactpunten en vervolgstappen die bij het onderwerp passen."],
      ["Van uitleg naar zelf doen", "Artikelen geven context. De budgetplanner brengt inkomsten, uitgaven, reserveringen en doelen samen. Zo sluit de tool aan op de vragen die de redactionele inhoud oproept."],
      ["Ruimte voor vergelijken", "De gebruiker kan scenario’s onderzoeken en zelf ingevulde offertes vergelijken. De demo rekent met voorbeeldgegevens; een koppeling met actuele aanbiedersdata is een afzonderlijke mogelijke uitbreiding."],
      ["Een eigen mobiele indeling", "De website wordt op een telefoon opnieuw ingedeeld. Navigatie, leesbare tekst en de routes naar inzicht en budget blijven dichtbij."]
    ],
    toolTitle: "Je maand en je toekomst. In één overzicht.",
    toolText: "De budgetplanner maakt maandruimte en langetermijnkeuzes zichtbaar. Vaste rekenregels verwerken de invoer; grafieken laten zien wat andere aannames betekenen. Het is een voorbeeld van een maatwerktool die informatie bruikbaar maakt.",
    maintenance: "Voor Beurswijzer verzorgen we iedere week een nieuw blog, de SEO-basis, websiteonderhoud en hosting. De redactionele planning, technische basis en verdere ontwikkeling blijven zo verbonden.",
    meta: "Beurswijzer-case van Sitesnit: webdesign, mobiele budgetplanner en interactieve grafieken. Met wekelijkse blogs, SEO-basis, onderhoud en hosting."
  },
  {
    slug: "beurswatcher", name: "Beurswatcher", theme: "blue",
    eyebrow: "Financiële content / scenario’s & rekenmodellen",
    title: "Verder kijken.", accent: "Beter begrijpen.",
    summary: "Beurswatcher combineert financiële verhalen met interactieve rekentools. De blauwgele identiteit geeft het platform een eigen gezicht, van een artikel tot een berekening op je telefoon.",
    url: "https://beurswatcher.vercel.app/", image: "/projects/beurswatcher/calculator-640.webp", imageLarge: "/projects/beurswatcher/calculator.webp",
    imageAlt: "Beurswatcher-rendementcalculator met invoer en een grafiek van inleg en samengestelde groei", imageWidth: 1150, imageHeight: 585, imageSmallWidth: 640,
    graph: "/projects/beurswatcher/calculator-640.webp", graphLarge: "/projects/beurswatcher/calculator.webp",
    graphAlt: "Beurswatcher rekent startkapitaal, maandinleg, rendement, inflatie en looptijd door", graphWidth: 1150, graphHeight: 585,
    phone: "/projects/beurswatcher/mobile", phoneAlt: "De mobiele Beurswatcher-homepage in blauw en geel",
    challenge: "Een platform over beleggen moet complexe informatie toegankelijk maken. De opgave is een duidelijke verbinding tussen lezen en rekenen: bezoekers krijgen uitleg en kunnen vervolgens hun eigen aannames onderzoeken.",
    choices: [
      ["Een uitgesproken identiteit", "Diepblauw, geel en stevige typografie maken Beurswatcher herkenbaar. Dezelfde richting komt terug in de redactionele pagina’s, knoppen en rekentools."],
      ["Invoer met betekenis", "De rendementcalculator gebruikt startkapitaal, maandinleg, rendement, inflatie en looptijd. Invoer en uitkomst staan in verband, zodat een aanpassing direct te begrijpen is."],
      ["De uitkomst uitleggen", "De berekening onderscheidt eigen inleg, samengestelde groei en koopkracht. Aannames horen bij het verhaal: een doorgerekend scenario is geen voorspelling."],
      ["Van groot scherm naar telefoon", "De mobiele versie heeft een eigen lees- en navigatievolgorde. Het merk blijft herkenbaar terwijl de beschikbare ruimte anders wordt gebruikt."]
    ],
    toolTitle: "Wat doen inleg en tijd met je scenario?",
    toolText: "De calculator rekent samengestelde groei en inflatie door volgens vaste regels. Verander een aanname en de grafiek volgt. Dit laat zien hoe een eigen rekenmodel kan worden vertaald naar een eenvoudige interface voor bezoekers.",
    maintenance: "Ook voor Beurswatcher verzorgen we wekelijkse blogs, SEO-basisonderhoud, hosting en websiteonderhoud. Zo blijft er naast de ontwikkeling van het platform aandacht voor nieuwe inhoud en de bestaande pagina’s.",
    meta: "Beurswatcher-case van Sitesnit: een eigen merk, mobiele website en rente-op-rente-calculator. Doorlopend verzorgd met wekelijkse blogs, SEO, hosting en onderhoud."
  }
] as const;
export type ClientCase = (typeof clientCases)[number];
