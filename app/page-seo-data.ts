import { services } from './diensten/service-data';
import { clientCases } from './portfolio-data';
import { projects } from './site-data';

export type PageSeo = { title: string; description: string };

// One source for search snippets, share previews and the page's JSON-LD.
const serviceTitles: Record<string, string> = {
  webdesign: 'Website laten maken — ontwerp, bouw en pakketten',
  webapps: 'Webapp laten maken — klantportaal of dashboard',
  apps: 'App laten maken voor iPhone en Android',
  webshops: 'Webshop laten maken — producten, betalen en beheer',
  branding: 'Logo en huisstijl laten ontwerpen voor je bedrijf',
  seo: 'Online vindbaarheid — SEO, blogs en social media',
  'seo-optimalisatie': 'SEO laten verbeteren — inhoud, techniek en lokaal',
  content: 'Blogs en websiteteksten laten schrijven',
  'social-media': 'Social media uitbesteden — aanpak en maandprijzen',
  'onderhoud-hosting': 'Websiteonderhoud en hosting — maandpakketten',
  'ai-automatisering': 'Bedrijfsprocessen automatiseren met AI en tools',
  'formulieren-rekentools': 'Formulier of rekentool laten maken voor je website',
  'ai-koppelingen': 'AI-chatbots, documentverwerking en API-koppelingen',
};

export const pageSeo: Record<string, PageSeo> = {
  '/': {
    title: 'Webdesign Limburg — websites op maat vanuit Baarlo',
    description: 'Een website laten maken in Limburg? Sitesnit ontwerpt en bouwt vanuit Baarlo. Bekijk projecten, vergelijk websitepakketten en bespreek je plannen.',
  },
  '/diensten': {
    title: 'Diensten — websites, apps, SEO en automatisering',
    description: 'Van websites en webapps tot apps voor iPhone en Android. Ontdek ook SEO en automatisering bij Sitesnit: de aanpak, mogelijkheden en een passende volgende stap.',
  },
  ...Object.fromEntries(services.map(s => [`/diensten/${s.slug}`, {title: serviceTitles[s.slug] || s.name, description: s.meta}])),
  '/diensten/webdesign/pakketten': {
    title: 'Onepager of meerdere pagina’s? Websitepakketten uitgelegd',
    description: 'Wanneer past één pagina, wanneer heb je vijf pagina’s nodig en wat vraagt maatwerk? Vergelijk de indeling, functies en voorbeelden voor jouw website.',
  },
  '/projecten': {
    title: 'Webdesignprojecten — Beurswijzer en Beurswatcher',
    description: 'Bekijk hoe Sitesnit Beurswijzer en Beurswatcher ontwierp en bouwde: mobiele websites, eigen rekentools en doorlopend werk aan blogs, SEO en onderhoud.',
  },
  ...Object.fromEntries(clientCases.map(p => [`/projecten/${p.slug}`, {
    title: p.slug === 'beurswijzer' ? 'Beurswijzer — webdesign en interactieve budgetplanner' : 'Beurswatcher — webdesign en rendementcalculator',
    description: p.meta,
  }])),
  ...Object.fromEntries(projects.map(p => [`/projecten/${p.slug}`, {title: `${p.name} — webdesignconcept`, description: p.summary}])),
  '/kosten': {
    title: 'Kosten website — pakketprijzen, btw en hosting',
    description: 'Wat kost een website bij Sitesnit? Vergelijk onepager, vijf pagina’s en maatwerk, met prijzen inclusief btw, de hostingkosten en duidelijke betaalafspraken.',
  },
  '/webdesign-venlo': {
    title: 'Website laten maken in Venlo',
    description: 'Een website voor je bedrijf in Venlo, ontworpen en gebouwd vanuit Baarlo. Bekijk het werk, vergelijk websitepakketten en bespreek wat jouw bedrijf nodig heeft.',
  },
  '/over-sitesnit': {
    title: 'Kay Huybreghs — de maker achter Sitesnit in Baarlo',
    description: 'Maak kennis met Kay Huybreghs, de maker achter Sitesnit in Baarlo. Lees hoe hij websites en apps ontwerpt, bouwt en met je meedenkt over de volgende stap.',
  },
  '/contact': {
    title: 'Contact — bespreek je website of plan een belafspraak',
    description: 'Bespreek je website, SEO of automatisering met Sitesnit. Vraag een gesprek aan: bellen kan op afspraak, op werkdagen tussen 18.00 en 21.30 uur of in het weekend.',
  },
  '/websitecheck': {
    title: 'Gratis websitecheck — snelheid, SEO en verbeterpunten',
    description: 'Check je website met 15 vragen en een mobiele Lighthouse-meting. Krijg uitleg over snelheid, toegankelijkheid, technische SEO en je belangrijkste verbeterpunten.',
  },
  '/prijscheck': {
    title: 'Wat kost jouw website? Doe de gratis prijscheck',
    description: 'Beantwoord 15 vragen en ontdek welke websiteroute past. Bekijk de prijsbasis inclusief btw, hosting en openstaande keuzes, zonder eerst je e-mailadres te geven.',
  },
  '/tools': {
    title: 'Gratis websitetools — check, ontwerp en vergelijk',
    description: 'Check je website, maak een ontwerpvoorbeeld, verken de kosten of vergelijk offertes. Vijf gratis tools van Sitesnit om je websiteplannen concreet te maken.',
  },
  '/tools/ontwerp-je-website': {
    title: 'Ontwerp je eigen website — gratis interactief voorbeeld',
    description: 'Kies je stijl, kleuren en inhoud. Bekijk en bewerk je eerste websitevoorbeeld op mobiel en desktop en bespreek je ontwerp en websiteplan met Sitesnit.',
  },
  '/tools/offertevergelijker': {
    title: 'Website-offertes vergelijken — inhoud en totale kosten',
    description: 'Vergelijk twee of drie websiteoffertes op inhoud, eenmalige prijs en maandkosten. Bekijk bekende kosten over 1 en 3 jaar en welke vragen nog openstaan.',
  },
  '/tools/automatiseringsplan': {
    title: 'Wat kun je automatiseren? Maak je automatiseringsplan',
    description: 'Breng terugkerend werk in kaart, van factuurconcepten tot klantvragen. Bereken je huidige tijdsbesteding en maak een concreet automatiseringsplan.',
  },
  '/algemene-voorwaarden': {title:'Algemene voorwaarden — bouwen, betalen en hosting', description:'Lees de afspraken van Sitesnit over je opdracht, 60% aanbetaling, oplevering, hosting, overdracht en je rechten als zakelijke klant of consument.'},
  '/cookies': {title:'Cookies en je keuze voor statistieken', description:'Lees welke browseropslag Sitesnit gebruikt voor de tools en hoe je zelf kiest voor websiteanalyse. Pas je cookievoorkeur aan of trek je toestemming in.'},
  '/privacy': {
    title: 'Privacy en je gegevens',
    description: 'Hoe Sitesnit omgaat met contactaanvragen, toolantwoorden en websitechecks. Lees welke gegevens worden gebruikt en hoe je contact opneemt over je privacy.',
  },
};
