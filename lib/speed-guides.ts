export const speedGuides = [
  {
    slug:'pagespeed-score',label:'De score lezen',title:'Wat zegt je PageSpeed-score?',
    description:'Lees de prestatiescore achter je snelheidstest: wat meet Lighthouse, waarom wisselt het cijfer en welke verbetering pak je eerst aan?',
    answer:'De prestatiescore vat vijf laadmetingen samen. Gebruik het cijfer om een probleem op te sporen, en de onderliggende metingen om te bepalen wat je aanpast. Het is geen SEO-cijfer voor je hele website.',
    steps:['Score','Oorzaak','Hercontrole'],
    sections:[
      {title:'Eén pagina, onder testomstandigheden',text:'Lighthouse opent het opgegeven pagina-adres in een gecontroleerde omgeving. De prestatiescore loopt van 0 tot 100 en combineert metingen met verschillende gewichten. Een score van 100 betekent dus niet dat al je pagina’s snel zijn, dat iedereen dezelfde ervaring heeft of dat Google je bovenaan zet. De inhoud en bruikbaarheid van je website blijven afzonderlijke vragen.'},
      {title:'Kijk welke meting de uitkomst verklaart',text:'Verschijnt er lang niets? Kijk naar FCP en naar de eerste documentaanvraag. Komt de belangrijkste inhoud laat? Onderzoek LCP en de bijbehorende audit. Voelt het laden stroperig, dan kan TBT op blokkerende code wijzen. Een hoge CLS vraagt om onderzoek naar verspringende onderdelen. De genoemde bestanden of elementen vormen je aanknopingspunt. Een lage score alleen bewijst geen specifieke oorzaak.'},
      {title:'Een schatting is geen optelsom',text:'Lighthouse kan mogelijke besparingen noemen. Die zijn schattingen binnen de test. Tel ze niet bij elkaar op als gegarandeerde winst: verbeteringen kunnen elkaar beïnvloeden en dezelfde vertraging raken. Verwijder ook niet zomaar scripts die een formulier, cookiekeuze of beveiliging laten werken. Laat de functie na de aanpassing opnieuw doorlopen.'},
      {title:'Zo vergelijk je een verbetering eerlijk',text:'Meet dezelfde URL, hetzelfde apparaat en dezelfde versie meer dan één keer. Bewaar het meetmoment en noteer of een cookiemelding of andere inhoud veranderde. Een uitschieter verdient een herhaling voordat je conclusies trekt. Vergelijk daarna zowel de score als de meting waarop je herstel gericht was. Kijk ook of de pagina nog goed werkt.'},
    ],
    questions:[['Is 90 altijd voldoende?','90 tot 100 valt bij Lighthouse in de goede scoreband. Het is geen garantie voor alle bezoekers of alle pagina’s. Beoordeel daarnaast de concrete metingen, echte bediening en waar beschikbaar bezoekersgegevens.'],['Waarom toont de tool soms geen score?','Een geblokkeerde pagina, timeout, quota of onvolledig API-antwoord kan de meting verhinderen. Zonder geldige meting toont Sitesnit geen cijfer. Dat is geen score van nul.']],
    related:'mobiel-desktop',relatedLabel:'Waarom mobiel en desktop verschillen',
    source:'https://developer.chrome.com/docs/lighthouse/performance/performance-scoring',
  },
  {
    slug:'mobiel-desktop',label:'Apparaten vergelijken',title:'Waarom is je mobiele website trager?',
    description:'Vergelijk mobiele en desktopmetingen zonder verkeerde conclusies. Begrijp testomstandigheden, responsive beelden en de invloed van scripts.',
    answer:'Mobiel en desktop gebruiken andere Lighthouse-testomstandigheden. Een lagere mobiele score kan wijzen op zwaar laadwerk, maar vergelijk steeds met hetzelfde apparaat voordat je een verbetering beoordeelt.',
    steps:['Zelfde URL','Zelfde apparaat','Nieuwe meting'],
    sections:[
      {title:'Een andere test, een ander cijfer',text:'De mobiele test simuleert beperktere omstandigheden dan de desktoptest. Ook het schermformaat verschilt. Daardoor kan andere inhoud zichtbaar zijn en kan een ander element het grootste zichtbare element worden. Een desktopscore van 95 en een mobiele score van 65 zijn daarom geen tegenstrijdige resultaten. Het verschil is een reden om de mobiele audits te lezen.'},
      {title:'Bekijk wat een telefoon echt moet laden',text:'Een kleinere afbeelding op het scherm is niet automatisch een kleiner downloadbestand. Controleer of de browser een geschikte beeldvariant ontvangt, of belangrijke inhoud direct gevonden wordt en of ruimte voor beelden is gereserveerd. Geef een belangrijke eerste afbeelding niet zonder onderzoek lazy loading: dat kan de start juist vertragen. Beelden lager op de pagina kunnen daar wel baat bij hebben.'},
      {title:'Code kan meer tijd kosten dan het downloaden',text:'Een script moet na het downloaden ook worden uitgevoerd. Veel code of lange taken kunnen op een gesimuleerd mobiel apparaat zwaar doorwegen. Kijk welke bestanden Lighthouse daadwerkelijk noemt. Stel alleen onderdelen uit die de eerste weergave niet nodig heeft en controleer daarna menu, formulieren en toestemming. Een snellere score met kapotte bediening is geen verbetering.'},
      {title:'Meet opnieuw en gebruik ook een echte telefoon',text:'Begin met de mobiele test van je belangrijkste landingspagina. Herhaal na een gerichte wijziging met dezelfde apparaatkeuze. Gebruik een desktoptest als afzonderlijke controle, niet als bewijs dat mobiel is opgelost. Open de pagina daarnaast op een telefoon: lees tekst, scroll, open het menu en verstuur een veilige test via je afgesproken testomgeving. Een labtest beoordeelt niet iedere gebruikershandeling.'},
    ],
    questions:[['Is dit een meting op mijn eigen telefoon?','Nee. Google voert de Lighthouse-test uit. De telefoon of computer waarmee jij de Sitesnit-tool opent, bepaalt de testomgeving niet. Je apparaatkeuze in het formulier doet dat.'],['Kan ik mobiel en desktop tegelijk laten testen?','Deze tool meet één gekozen apparaat per aanvraag. Kies daarna het andere apparaat voor een afzonderlijke meting. Houd de twee rapporten en meetmomenten uit elkaar.']],
    related:'core-web-vitals',relatedLabel:'Labmetingen en echte bezoekerservaring onderscheiden',
    source:'https://developers.google.com/speed/docs/insights/v5/about',
  },
  {
    slug:'core-web-vitals',label:'Lab of echte bezoekers?',title:'Core Web Vitals en je snelheidstest',
    description:'Wat vertellen LCP, CLS en INP over bezoekerservaring? Lees waarom een Lighthouse-labtest geen volledige Core Web Vitals-beoordeling is.',
    answer:'Core Web Vitals gaan over laden, interactie en visuele stabiliteit. Deze snelheidstest toont een Lighthouse-labmeting. Daarmee kun je oorzaken onderzoeken, maar je stelt niet vast dat je website bij echte bezoekers voor alle Core Web Vitals slaagt.',
    steps:['Laden: LCP','Interactie: INP','Stabiliteit: CLS'],
    sections:[
      {title:'Drie verschillende vragen',text:'LCP beschrijft wanneer het grootste zichtbare inhoudselement verschijnt. INP kijkt naar de respons op interacties tijdens een bezoek. CLS beschrijft onverwachte verschuivingen in de layout. De goede grenzen zijn respectievelijk maximaal 2,5 seconden, 200 milliseconden en 0,1. Bij veldgegevens gaat de beoordeling om het 75e percentiel van gemeten bezoeken, afzonderlijk voor mobiel en desktop. Niet om jouw beste losse test.'},
      {title:'Wat deze tool wel laat zien',text:'De labtest meet onder meer LCP en CLS tijdens het laden en TBT als signaal voor blokkerende taken. TBT is geen vervanger voor een werkelijk gemeten INP. Een pagina kan tijdens het laden stabiel zijn en later toch verspringen, bijvoorbeeld na een interactie. Gebruik de labuitkomst om concrete code of beelden te onderzoeken en test de belangrijke handelingen daarnaast zelf.'},
      {title:'Waar bezoekersgegevens vandaan komen',text:'Google kan via het Chrome User Experience Report gegevens tonen van echte Chrome-bezoeken die aan de voorwaarden voldoen. Niet elke URL heeft voldoende gegevens. Soms is alleen informatie voor de hele origin beschikbaar. Die mag je niet presenteren als exacte meting van één pagina. De Sitesnit-snelheidstest haalt die veldgegevens niet op en geeft daarom geen oordeel “Core Web Vitals geslaagd”.'},
      {title:'Een wijziging zie je niet overal direct terug',text:'Een nieuwe labtest kan je aanpassing meteen onderzoeken. Veldgegevens beschrijven een meetperiode en bevatten ook bezoeken aan een eerdere versie. Noteer daarom wanneer je iets hebt aangepast en welk rapport je vergelijkt. Gebruik Search Console voor beschikbare Core Web Vitals-groepen en controleer de betrokken URL’s. Ontbrekende gegevens betekenen onbekend, niet goed of slecht.'},
    ],
    questions:[['Betekent geen bezoekersdata dat mijn website langzaam is?','Nee. Er kunnen te weinig geschikte bezoeken zijn om gegevens te publiceren. Je kunt wel een labtest uitvoeren en de pagina handmatig controleren.'],['Garanderen goede Core Web Vitals een hogere positie?','Nee. Een goede pagina-ervaring is waardevol, maar zoekresultaten hangen ook samen met inhoud en relevantie. Een technische meting is geen voorspelling van verkeer of omzet.']],
    related:'pagespeed-score',relatedLabel:'De prestatiescore op de juiste manier lezen',
    source:'https://web.dev/articles/vitals',
  },
] as const;
export const speedQuestions = [
  ['Is de snelheidstest gratis?','Ja. Je hebt geen account of e-mailadres nodig. We gebruiken Google PageSpeed Insights. De beschikbaarheid hangt af van het API-quotum. Bij drukte kun je later opnieuw proberen.'],
  ['Wat wordt er getest?','Eén openbaar pagina-adres met Lighthouse, op mobiel of desktop. Je krijgt een prestatiescore, laadmetingen en de beschikbare bevindingen. Het is geen crawl van je hele website en geen meting van echte bezoekers.'],
  ['Wat gebeurt er met mijn websiteadres?','Na het starten sturen we het openbare pagina-adres via onze server naar Google. Gebruik geen privélink of adres met parameters. Het resultaat blijft in dit tabblad en wordt niet automatisch een contactaanvraag.'],
] as const;
