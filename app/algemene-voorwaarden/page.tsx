import { withPageMetadata } from '../seo';
import { LegalLayout } from '../legal-layout';
import { BusinessIdentity } from '../business-notes';
import { business, grossPrice, hostingSummary, minimumHostingYear, paymentSummary } from '../../lib/business';
import { euro, site } from '../site-data';

export const metadata = withPageMetadata({}, '/algemene-voorwaarden');

const contents = [
  ['opdracht', 'De opdracht en deze voorwaarden'],
  ['omvang', 'Wat we maken'],
  ['betaling', 'Prijs en betaling'],
  ['planning', 'Planning en oplevering'],
  ['hosting', 'Hosting en opzegging'],
  ['rechten', 'Rechten en andere hosting'],
  ['privacy', 'Gegevens en vertrouwelijkheid'],
  ['techniek', 'Techniek, SEO en AI'],
  ['herstel', 'Herstel en aansprakelijkheid'],
  ['stoppen', 'Wijzigen of stoppen'],
  ['consumenten', 'Bedenktijd voor consumenten'],
  ['contact', 'Contact en versie'],
].map(([id, title]) => ({ id, title }));

export default function Terms() {
  return (
    <LegalLayout
      path="/algemene-voorwaarden"
      label="Algemene voorwaarden"
      title="Goed afgesproken."
      accent="Prettig samenwerken."
      intro="Een duidelijke opdracht geeft jou en Sitesnit houvast. Hier lees je hoe betaling, oplevering, hosting en je rechten zijn geregeld. Je voorstel beschrijft het werk en de kosten voor jouw situatie."
      points={[
        '60% vóór de start, 40% bij afronding. Factuurtermijn: 14 dagen.',
        'Hosting vanaf €6,05 per maand inclusief btw. Eerste termijn: 12 maanden.',
        'Na het eerste hostingjaar opzegbaar met één maand opzegtermijn.',
      ]}
      contents={contents}
    >
      <section id="opdracht">
        <h2>1. De opdracht en deze voorwaarden</h2>
        <p>Sitesnit wordt gevoerd door {business.ownerName}. Deze voorwaarden gelden voor overeengekomen werkzaamheden aan websites, mobiele apps, webapps, SEO, content, hosting, onderhoud en automatisering. Ze gelden voor zakelijke opdrachtgevers en consumenten, met behoud van de wettelijke bescherming die op de betreffende opdracht van toepassing is.</p>
        <p>Een contactaanvraag, toolresultaat of belafspraak is vrijblijvend en vormt geen bestelling. Een opdracht ontstaat wanneer jij en Sitesnit schriftelijk akkoord zijn over het voorstel. Je krijgt deze voorwaarden vóór dat akkoord, zodat je ze kunt lezen en bewaren. Concrete afspraken in het voorstel gaan voor op deze voorwaarden, voor zover de wet dat toestaat.</p>
      </section>

      <section id="omvang">
        <h2>2. Wat we maken</h2>
        <p>Het voorstel beschrijft pagina’s of schermen, functies, ontwerpwerk, inhoud, koppelingen, gebruikersrollen en de afgesproken controles. We leggen vast wie teksten, beelden, toegangen en andere informatie aanlevert. Voorbeelden op de website en in de ontwerptool zijn geen volledige specificatie van je opdracht.</p>
        <p>Een onepager omvat één pagina. Het websitepakket omvat vijf pagina’s. De omvang van maatwerk, mobiele apps en webapps spreken we afzonderlijk af. Bij een mobiele app leggen we ook vast welke platformen, publicatiestappen en updates bij de opdracht horen. Een websitepakket is geen vast appontwikkeltarief. Responsive ontwerp, een standaardcontactformulier of enkele verfijnde animaties maken een opdracht op zichzelf niet automatisch maatwerk.</p>
        <p>Een extra functie, nieuwe inhoud of revisie buiten de overeengekomen omvang kan meerwerk zijn. Sitesnit legt het effect op prijs en planning uit en voert dit werk pas uit na jouw akkoord. Verplichte externe kosten en eventuele abonnementen, licenties of domeinkosten worden vooraf vermeld. Optionele diensten worden niet zonder jouw keuze toegevoegd.</p>
      </section>

      <section id="betaling">
        <h2>3. Prijs en betaling</h2>
        <p>{paymentSummary} De aanbetaling wordt verrekend met de projectprijs. Het resterende deel wordt gefactureerd nadat het afgesproken werk is afgerond en je gelegenheid hebt gekregen dit te beoordelen. De betaaltermijn is {business.paymentDays} dagen na de factuurdatum. Het voorstel vermeldt wanneer publicatie en overdracht plaatsvinden.</p>
        <p>De consumentenbedragen hieronder zijn inclusief 21% btw. De zakelijke bedragen exclusief btw staan erbij. Hosting is bij een nieuwe website verplicht gedurende het eerste jaar; daarom vermelden we ook de minimale totale investering voor bouw en dat hostingjaar.</p>
        <dl>
          {site.packages.map((item) => (
            <div key={item.id}>
              <dt>{item.name} · {item.pages}</dt>
              <dd>
                Bouw: {item.id === 'maatwerk' ? 'vanaf ' : ''}{euro(grossPrice(item.price))} inclusief btw ({euro(item.price)} exclusief btw).
                {' '}Bouw en het eerste hostingjaar samen: minimaal {euro(grossPrice(item.price + minimumHostingYear))} inclusief btw ({euro(item.price + minimumHostingYear)} exclusief btw).
              </dd>
            </div>
          ))}
        </dl>
        <p>Bij maatwerk volgt de definitieve prijs uit de afgesproken omvang. Het genoemde projectgemiddelde van circa {euro(grossPrice(site.averageProjectCost))} inclusief btw ({euro(site.averageProjectCost)} exclusief btw) is achtergrondinformatie, geen vaste prijs of prijsplafond. Aanvullende diensten en hun kosten worden vooraf in het voorstel gespecificeerd.</p>
        <p>Bij een achterstallige betaling neemt Sitesnit contact op en geeft gelegenheid om alsnog te betalen. Voor een consument worden incassokosten pas berekend na een correcte kosteloze aanmaning en het verstrijken van de wettelijke termijn van veertien dagen vanaf de dag na ontvangst daarvan. Rente en incassokosten blijven binnen de toepasselijke wettelijke regels.</p>
        <p>Een gemeld bezwaar wordt inhoudelijk onderzocht. Een redelijke opschorting van betaling wegens een tekortkoming wordt niet door deze voorwaarden uitgesloten. Sitesnit schort werk of dienstverlening alleen na waarschuwing op en alleen voor zover dat redelijk en wettelijk toegestaan is.</p>
      </section>

      <section id="planning">
        <h2>4. Planning, feedback en oplevering</h2>
        <p>We spreken planning, feedbackmomenten en revisies af in het voorstel. Tijdige informatie, toegang en feedback zijn nodig om verder te werken. Bij vertraging bespreken we het gevolg en een aangepaste planning. Een datum is alleen een harde einddatum wanneer dat uitdrukkelijk is overeengekomen of uit de aard van de opdracht volgt.</p>
        <p>Je kunt het opgeleverde werk beoordelen op de afgesproken inhoud en werking. Meld concrete afwijkingen, zodat Sitesnit ze kan onderzoeken en herstellen. Stilte geldt niet automatisch als akkoord. Fouten in het afgesproken werk worden niet als een nieuwe wens behandeld. Wettelijke rechten bij een gebrek blijven bestaan na de beoordeling.</p>
        <p>Bij oplevering leggen we vast welke toegang je krijgt, hoe je de website gebruikt en welke onderdelen Sitesnit blijft verzorgen. De afgesproken contactroutes en belangrijke functies worden vóór publicatie gecontroleerd. Nieuwe wensen na afronding vallen onder een aanvullende afspraak.</p>
      </section>

      <section id="hosting">
        <h2>5. Hosting en doorlopende diensten</h2>
        <p>{hostingSummary} Een gekozen onderhoudspakket dat hosting bevat vervangt de basishosting; die wordt niet dubbel berekend. De eerste termijn begint op de afgesproken datum waarop de website op de hosting beschikbaar wordt gesteld. Het voorstel vermeldt het pakket, die startdatum en de factureringswijze.</p>
        <p>Basishosting stelt de website online beschikbaar. Nieuwe inhoud, wijzigingen, technisch onderhoud, mailboxen, domeinregistratie en betaalde externe koppelingen zijn alleen inbegrepen als dat bij het gekozen pakket staat. Afspraken over back-ups, herstel, capaciteit en ondersteuning leggen we vooraf vast. De minimumprijs geldt voor de beschreven basishosting; bijzondere technische eisen kunnen een ander, vooraf afgesproken pakket vragen.</p>
        <p>Na de eerste twaalf maanden loopt hosting door voor onbepaalde tijd. Daarna kun je op ieder moment opzeggen met één maand opzegtermijn. Je kunt tijdens het eerste jaar al aangeven dat hosting op de einddatum moet stoppen. Opzeggen kan via het <a href="/contact">contactformulier</a> of via de contactroute uit je opdrachtbevestiging. Een opzegging hoeft geen reden te bevatten.</p>
        <p>De afgesproken hostingprijs blijft gelijk tijdens de eerste twaalf maanden, behalve als een wettelijk gewijzigde belasting moet worden toegepast. Daarna kan Sitesnit de prijs aanpassen bij aantoonbaar gewijzigde kosten van hosting of noodzakelijke externe dienstverlening. Sitesnit legt de reden, nieuwe prijs en ingangsdatum ten minste één maand vooraf uit. De verhoging wordt niet vaker dan eenmaal per twaalf maanden doorgevoerd. Je kunt bij zo’n wijziging kosteloos opzeggen vóór de ingangsdatum, zodat je de hogere prijs niet hoeft te betalen.</p>
        <p>Bij beëindiging stemmen we export, overdracht en het einde van de hosting af. Je krijgt gelegenheid beschikbare klantgegevens tijdig over te nemen. Na de einddatum kan de website offline gaan. Vooraf betaalde perioden na de geldige einddatum worden naar rato verrekend. Aanvullend verhuiswerk dat niet onder onze wettelijke of overeengekomen overdrachtsplichten valt, wordt alleen na prijsafspraak uitgevoerd.</p>
      </section>

      <section id="rechten">
        <h2>6. Inhoud, rechten en andere hosting</h2>
        <p>Je blijft rechthebbende op materiaal dat je zelf aanlevert. Je zorgt dat je teksten, foto’s, logo’s en andere gegevens mag gebruiken en delen. Sitesnit meldt het wanneer aangeleverde inhoud duidelijk onbruikbaar lijkt, maar voert zonder aparte afspraak geen volledige rechtencontrole op jouw materiaal uit.</p>
        <p>Na volledige betaling krijg je het afgesproken gebruiksrecht op het opgeleverde werk. Het voorstel beschrijft welke broncode, ontwerpbestanden, toegangen en eventuele eigendomsrechten worden overgedragen. Bestaande hulpmiddelen, standaardcomponenten en onderdelen van derden behouden hun eigen rechten en licenties. Ze mogen het overeengekomen gebruik niet onverwacht onmogelijk maken.</p>
        <p>Wil je de website elders laten hosten? Stem de overdracht vooraf met Sitesnit af. We bekijken de technische eisen, koppelingen, beveiliging en benodigde gegevens. Sitesnit legt concrete beperkingen van de gekozen techniek uit en geeft aan welk aanpassingswerk nodig is. Deze afstemming is bedoeld voor een zorgvuldige overdracht en geeft Sitesnit geen onbeperkt recht om een overstap tegen te houden.</p>
        <p>De overeengekomen eerste hostingtermijn blijft gelden, tenzij je een wettelijk of overeengekomen recht hebt om eerder te stoppen. Wettelijke overstap- en overdrachtsrechten blijven behouden. Na verhuizing maken we duidelijk wie beheer en ondersteuning verzorgt. Voor problemen die aantoonbaar door de nieuwe omgeving of wijzigingen van derden ontstaan, is Sitesnit niet verantwoordelijk buiten de eigen opdracht. Rechten bij gebreken in het door Sitesnit geleverde werk vervallen niet automatisch door een verhuizing.</p>
        <p>Gebruik van jouw naam, logo, klantreactie of project in het portfolio stemmen we apart af. Klantresultaten en reacties worden niet verzonnen of als een onbevestigde Google-review gepresenteerd.</p>
      </section>

      <section id="privacy">
        <h2>7. Gegevens en vertrouwelijkheid</h2>
        <p>We gebruiken vertrouwelijke bedrijfsinformatie voor de opdracht en beperken toegang tot wat daarvoor nodig is. Deel wachtwoorden en gevoelige gegevens via een afgesproken beveiligde route, niet via een openbaar toolveld.</p>
        <p>Als Sitesnit namens jou persoonsgegevens verwerkt, leggen we vóór die verwerking de benodigde verwerkersafspraken vast. Daarbij horen de gegevens en doelen, beveiliging, toegestane dienstverleners, bewaartermijnen en ondersteuning bij incidenten en privacyverzoeken. De <a href="/privacy">privacyverklaring van Sitesnit</a> beschrijft eigen bezoekers en aanvragen. Zij vervangt geen verwerkersovereenkomst voor jouw website of webapp.</p>
      </section>

      <section id="techniek">
        <h2>8. Techniek, vindbaarheid en AI</h2>
        <p>Sitesnit voert het overeengekomen werk zorgvuldig uit. Een positie in Google, aantal aanvragen, opbrengst of acceptatie door een ander platform kan niet worden gegarandeerd. Dit beperkt onze verantwoordelijkheid voor het afgesproken werk niet.</p>
        <p>Software en koppelingen kunnen veranderen. We spreken af wie controles, updates, back-ups en herstel verzorgt. Zonder onderhoudsafspraak is aanvullend doorlopend beheer niet automatisch inbegrepen. Voor consumenten blijven de wettelijke aanspraken op noodzakelijke updates, veiligheid en herstel van digitale inhoud of diensten bestaan. Die rechten worden niet afhankelijk gemaakt van een betaald onderhoudspakket.</p>
        <p>Bij AI bepalen we welke bronnen en gegevens gebruikt mogen worden en waar menselijke controle nodig is. AI-antwoorden kunnen onjuist zijn. Een toepassing krijgt zonder uitdrukkelijke afspraak geen bevoegdheid om betalingen te doen, bindende toezeggingen te versturen of gevoelige besluiten te nemen.</p>
      </section>

      <section id="herstel">
        <h2>9. Herstel, klachten en aansprakelijkheid</h2>
        <p>Meld een klacht of fout zo concreet mogelijk via het <a href="/contact">contactformulier</a> of de contactroute van je opdracht. Sitesnit onderzoekt de melding en krijgt een redelijke gelegenheid om een toerekenbaar gebrek te herstellen. Bij een spoedeisend incident bespreken we eerst hoe de gevolgen kunnen worden beperkt. Er is geen algemene 24-uurs storingsdienst, tenzij die schriftelijk is afgesproken.</p>
        <p>Voor zakelijke opdrachten is de aansprakelijkheid voor aantoonbare directe schade door een toerekenbare tekortkoming beperkt tot de overeengekomen prijs van het betreffende project exclusief btw. Bij doorlopende dienstverlening geldt de vergoeding voor de betreffende dienst over twaalf maanden. Deze beperking geldt niet bij opzet of bewuste roekeloosheid van Sitesnit en evenmin waar dwingend recht een beperking verbiedt. Voor consumenten geldt deze zakelijke beperking niet.</p>
        <p>Beide partijen treffen redelijke maatregelen om schade te voorkomen en te beperken. Een storing bij een externe dienstverlener sluit aansprakelijkheid niet automatisch uit. Bepalend blijft waarvoor Sitesnit volgens de opdracht en de wet verantwoordelijk is.</p>
      </section>

      <section id="stoppen">
        <h2>10. Wijzigen of stoppen</h2>
        <p>Wil je een project wijzigen of tussentijds beëindigen, neem dan contact op. Sitesnit maakt inzichtelijk welk werk is verricht en welke vooraf goedgekeurde kosten niet meer vermijdbaar zijn. De aanbetaling wordt daarmee verrekend en een overschot terugbetaald. Niet-uitgevoerd werk wordt niet zonder rechtsgrond volledig in rekening gebracht. Je wettelijke rechten om op te zeggen, te herroepen of te ontbinden blijven behouden.</p>
        <p>Als uitvoering door omstandigheden buiten redelijke invloed langdurig onmogelijk wordt, informeren partijen elkaar en zoeken ze een passende oplossing. Blijft uitvoering onmogelijk, dan volgt een redelijke afrekening volgens de overeenkomst en de wet. Een nieuwe versie van deze voorwaarden verandert een bestaande opdracht niet automatisch.</p>
      </section>

      <section id="consumenten">
        <h2>11. Bedenktijd voor consumenten</h2>
        <p>Een consument handelt buiten beroep of bedrijf. Op deze website vraag je vrijblijvend informatie of een gesprek aan; je sluit hier geen aankoop af. Bij een latere overeenkomst op afstand krijg je vooraf informatie over de volledige prijs, uitvoering, bedenktijd en opzegging, samen met een modelformulier voor herroeping.</p>
        <p>Waar het wettelijke herroepingsrecht geldt, kun je een dienstenovereenkomst zonder reden herroepen tot veertien dagen na de dag waarop deze is gesloten. Stuur daarvoor vóór afloop van de termijn een duidelijke verklaring via het <a href="/contact">contactformulier</a>, de contactroute in je opdrachtbevestiging of per post aan het adres hieronder. Noem je naam, welke opdracht je herroept en hoe we de ontvangst kunnen bevestigen. Het modelformulier gebruiken is niet verplicht.</p>
        <p>Sitesnit start binnen die periode alleen na je uitdrukkelijke verzoek. Als je daarna herroept, kan uitsluitend de wettelijk toegestane evenredige vergoeding voor het al uitgevoerde deel gelden, mits je daarover vooraf correct bent geïnformeerd. Het herroepingsrecht vervalt na volledige uitvoering alleen wanneer je vooraf uitdrukkelijk hebt ingestemd met die uitvoering én hebt erkend dat je daardoor je herroepingsrecht verliest. Een website op maat betekent niet automatisch dat bedenktijd vervalt.</p>
        <p>Een verschuldigde terugbetaling na herroeping volgt binnen veertien dagen na je herroepingsbericht via hetzelfde betaalmiddel, tenzij je uitdrukkelijk met een andere kosteloze manier instemt. Dwingende consumentenrechten gaan altijd voor. Het toepasselijke Nederlandse recht ontneemt je geen bescherming waarop je volgens dwingend recht van je woonland recht hebt. Een geschil kan worden voorgelegd aan de volgens de wet bevoegde rechter.</p>
      </section>

      <section id="contact">
        <h2>12. Contact en versie</h2>
        <BusinessIdentity />
        <p>Vragen over een opdracht kun je via het <a href="/contact">contactformulier</a> doorgeven. Vermeld waar je vraag over gaat; deel geen wachtwoorden of betaalgegevens.</p>
        <p>Een belafspraak is mogelijk op werkdagen tussen 18.00 en 21.30 uur of in het weekend. Een voorkeursdag en tijd doorgeven is optioneel. Het moment is pas een afspraak wanneer het is bevestigd.</p>
        <p>Versie {business.termsVersion}. Bewaar de voorwaarden die je bij jouw voorstel ontvangt.</p>
      </section>
    </LegalLayout>
  );
}
