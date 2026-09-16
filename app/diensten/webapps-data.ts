import type { Service } from './service-data';

/** The existing /diensten/[dienst] route renders this service after registration. */
export const webappsService: Service = {
  slug: 'webapps',
  anchor: 'webapps',
  name: 'Webapps & klantportalen',
  number: '04',
  tone: 'blue',
  group: 'Tools & automatisering',
  title: 'Een webapp laten maken.',
  accent: 'Voor het werk dat verder moet.',
  summary: 'Je klant wil een document aanleveren. Een medewerker moet een aanvraag beoordelen. Jij wilt zien wat nog aandacht vraagt. Sitesnit ontwerpt en bouwt klantportalen, dashboards en interne toepassingen rondom een concrete taak. Met passende toegang en een mobiele bediening die ook onderweg prettig werkt.',
  tags: ['Klantportalen', 'Dashboards', 'Aanvraagprocessen'],
  introTitle: 'Eén plek om verder te werken.',
  introAccent: 'Voor klanten en medewerkers.',
  intro: 'Aanvragen in je mailbox, bestanden in verschillende mappen en een planning in een spreadsheet. Dat kan prima werken, tot je steeds moet zoeken welke versie klopt. We beginnen bij de taak die je wilt vereenvoudigen. Soms is bestaande software of een eenvoudige koppeling voldoende. Is een eigen omgeving nodig, dan werken we de schermen, gegevens en handelingen daarvoor uit.',
  methods: [
    ['Wie mag wat zien en doen?', 'Een klant hoort alleen bij eigen informatie te kunnen. Een medewerker heeft andere mogelijkheden dan een beheerder. We leggen vast welke rollen er zijn, hoe mensen toegang krijgen en welke handelingen per rol zijn toegestaan. Die rechten worden ook gecontroleerd bij het opvragen en wijzigen van gegevens. Een verborgen knop is op zichzelf geen toegangsbeveiliging.'],
    ['Informatie die op de juiste plek terechtkomt', 'We spreken af welke gegevens worden opgeslagen, wie ze mag wijzigen en welke bron leidend is. Heeft je bestaande software al klant- of ordergegevens? Dan onderzoeken we de beschikbare koppelingen. Invoercontroles, statuswijzigingen en een duidelijke afhandeling van dubbele of mislukte verzoeken worden onderdeel van de werking. Zo weet een medewerker wanneer opvolging nodig is.'],
    ['Ook onderweg prettig te gebruiken', 'Een aanvraag bekijken vraagt een ander scherm dan een uitgebreid beheeroverzicht. Op mobiel geven we de belangrijkste informatie en actie voorrang. Lange overzichten krijgen een passende weergave, formulieren blijven leesbaar en foutmeldingen helpen iemand verder zonder opnieuw te beginnen. We controleren de afgesproken routes op kleine en grote schermen en met toetsenbordbediening.'],
    ['Een eerste versie met duidelijke grenzen', 'Je hoeft niet direct je hele bedrijf in één systeem onder te brengen. Een eerste versie kan zich richten op aanvragen ontvangen en beoordelen. We spreken af welke schermen, rollen en koppelingen daarbij horen en testen de werking met geldige invoer, ontbrekende informatie en uitzonderingen. Hosting, beheer, back-ups, rechten en eventuele kosten van externe software worden vooraf besproken.'],
  ],
  optionsTitle: 'Wat wil je eenvoudiger maken?',
  optionsAccent: 'Maak de eerste stap concreet.',
  options: [],
  faqs: [
    ['Is een webapp hetzelfde als een website?', 'Een website helpt bezoekers vooral informatie vinden en contact opnemen. In een webapp voeren mensen taken uit, zoals gegevens aanpassen, documenten delen of een aanvraag behandelen. Beide kunnen samenkomen: bijvoorbeeld een openbare website met een afgesloten klantomgeving.'],
    ['Moet iemand een app downloaden?', 'Je gebruikt een webapp via de browser op telefoon, tablet of computer. Een download uit een appwinkel is daarvoor niet nodig. Installatie op een startscherm, meldingen en offline gebruik worden apart onderzocht als die belangrijk zijn voor jouw toepassing.'],
    ['Kan de toepassing samenwerken met mijn software?', 'Dat hangt af van de API’s, exports en toegangsrechten van die software. We onderzoeken welke gegevens kunnen worden uitgewisseld en wat er bij een mislukte koppeling moet gebeuren. Kosten en beperkingen van externe diensten staan vooraf in het voorstel.'],
    ['Wat kost een webapp?', 'De prijs hangt af van het aantal schermen, gebruikersrollen, gegevensstromen en koppelingen. Een bestaand loginmechanisme aanpassen vraagt iets anders dan een volledige klantomgeving. Je krijgt een voorstel met de afgesproken werking, prijs en eventuele terugkerende kosten. Een websitepakket is niet automatisch een vaste prijs voor iedere webapp.'],
    ['Zit AI standaard in een webapp?', 'Alleen als het een duidelijke taak helpt uitvoeren. Een dashboard of aanvraagproces kan goed werken met vaste regels. AI kan bijvoorbeeld een documentsamenvatting voorbereiden. We spreken dan af welke gegevens gebruikt mogen worden en waar iemand het resultaat controleert.'],
    ['Kan ik later uitbreiden of andere hosting kiezen?', 'Mogelijke uitbreidingen bespreken we bij het ontwerp. We leggen vast welke toegang, gegevens en bestanden je krijgt, welke licenties gelden en wat bij overdracht nodig is. De techniek en externe diensten bepalen welke aanpassingen een verhuizing kan vragen. Je wettelijke rechten blijven behouden.'],
  ],
  cta: 'Bespreek je webapp',
  contact: '/contact?dienst=webapps',
  meta: 'Laat een webapp bouwen voor je klanten of dagelijkse werk. Sitesnit ontwerpt klantportalen, dashboards en aanvraagprocessen die ook op mobiel prettig werken.',
};
