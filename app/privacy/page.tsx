import { withPageMetadata } from '../seo';
import { LegalLayout } from '../legal-layout';
import { BusinessIdentity } from '../business-notes';
import { CookieSettingsButton } from '../cookie-consent';
import { business } from '../../lib/business';
import { analyticsConfigured, CONSENT_MAX_AGE_DAYS } from '../../lib/consent';

export const metadata = withPageMetadata({}, '/privacy');

const contents = [
  ['verantwoordelijke', 'Wie is verantwoordelijk?'],
  ['aanvraag', 'Contact en belafspraken'],
  ['tools', 'Tools en technische websitecheck'],
  ['gebruik', 'Gebruik en beveiliging'],
  ['analytics', 'Google Analytics en cookies'],
  ['bewaren', 'Hoe lang bewaren we gegevens?'],
  ['ontvangers', 'Dienstverleners en verwerking'],
  ['rechten', 'Jouw privacyrechten'],
  ['beveiliging', 'Zorgvuldigheid en wijzigingen'],
].map(([id, title]) => ({ id, title }));

export default function Privacy() {
  const analyticsActive = analyticsConfigured(
    process.env.GA4_MEASUREMENT_ID,
    process.env.GA4_PRIVACY_CONFIGURED === 'true',
  );

  return (
    <LegalLayout
      path="/privacy"
      label="Privacy"
      title="Je gegevens."
      accent="Helder uitgelegd."
      intro="Je moet kunnen zien wat er met je informatie gebeurt. Hier lees je welke gegevens Sitesnit gebruikt bij een aanvraag of tool, waarom dat nodig is en welke keuzes je hebt."
      points={[
        'Je toolantwoorden blijven in je browser totdat je ze zelf meestuurt.',
        'Een websitecheck deelt alleen het opgegeven openbare pagina-adres met Google.',
        analyticsActive ? 'Google Analytics werkt alleen na jouw toestemming.' : 'Google Analytics staat uit. Je bezoek wordt daarmee niet gevolgd.',
      ]}
      contents={contents}
    >
      <section id="verantwoordelijke">
        <h2>1. Wie is verantwoordelijk?</h2>
        <p>{business.ownerName}, handelend onder de naam Sitesnit, is verantwoordelijk voor de verwerking die in deze verklaring staat. Voor een privacyvraag of verzoek kun je het <a href="/contact">contactformulier</a> gebruiken of schrijven naar het onderstaande adres.</p>
        <BusinessIdentity />
        <p>Deze verklaring gaat over Sitesnits eigen website, tools en aanvragen. Voor persoonsgegevens die Sitesnit namens een opdrachtgever in een klantwebsite verwerkt, worden afzonderlijke verwerkersafspraken gemaakt.</p>
      </section>

      <section id="aanvraag">
        <h2>2. Contact en belafspraken</h2>
        <p>Bij een aanvraag verwerken we je naam, e-mailadres, bericht en ontvangstmoment. Als je ze invult, ontvangen we ook je website, telefoonnummer, gekozen pakket of dienst, interesses en voorkeur voor een belafspraak. Je naam, e-mailadres en toelichting zijn nodig om je aanvraag te begrijpen en te beantwoorden. De overige velden zijn optioneel.</p>
        <p>We gebruiken deze informatie om je vraag te behandelen, een gesprek af te stemmen en op jouw verzoek een voorstel voor te bereiden. De grondslag is het nemen van stappen op jouw verzoek vóór een overeenkomst en, bij een opdracht, de uitvoering daarvan. Voor algemene correspondentie en contact met medewerkers van een zakelijke opdrachtgever gebruiken we ons gerechtvaardigde belang om de aanvraag en samenwerking goed af te handelen. We gebruiken daarvoor alleen relevante informatie.</p>
        <p>Een voorkeur voor een dag of tijd is nog geen boeking. Je wordt niet automatisch ingeschreven voor een nieuwsbrief of benaderd voor losstaande reclame. Een succesvolle bevestiging in het formulier betekent dat je aanvraag is ontvangen en opgeslagen; het is geen bevestiging van een bestelling of belafspraak.</p>
        <p>Een tooloverzicht gaat alleen mee wanneer je kiest om het bij te voegen. Je kunt die keuze in het formulier aanpassen en de samenvatting bekijken voordat je verzendt.</p>
      </section>

      <section id="tools">
        <h2>3. Tools en de technische websitecheck</h2>
        <h3>Je voortgang blijft bij jou</h3>
        <p>De websitecheck, prijscheck, offertevergelijker, het automatiseringsplan en de ontwerptool gebruiken sessieopslag in je browser. Daarmee kun je teruggaan, antwoorden aanpassen en je resultaat opnieuw bekijken. Deze antwoorden worden niet automatisch in de aanvraagdatabase opgeslagen. Je ontvangt geen openbare persoonlijke resultatenpagina.</p>
        <p>De sessieopslag is bedoeld voor de huidige browsersessie. Sommige browsers herstellen een sessie nadat je ze opnieuw opent. Wil je gegevens zelf verwijderen, gebruik dan de resetmogelijkheid van de betreffende tool of wis de websitegegevens in je browser. Een gedownload overzicht staat daarna op je eigen apparaat; daar beheer je zelf de bewaring en eventuele verdere verzending van.</p>
        <h3>Wat ontvangt Google bij een scan?</h3>
        <p>Als je de technische scan start, sturen we het opgegeven openbare pagina-adres via onze server naar Google PageSpeed Insights. Google onderzoekt die pagina met een gesimuleerde mobiele Lighthouse-test. Je vijftien inhoudelijke antwoorden, naam, e-mailadres en telefoonnummer worden niet naar deze dienst gestuurd.</p>
        <p>Gebruik geen pagina met vertrouwelijke informatie, toegangscodes of persoonsgegevens in het adres. Adressen met inloggegevens of extra URL-parameters worden niet geaccepteerd. De technische resultaten komen terug in je browser en worden alleen onderdeel van een aanvraag wanneer je ze meestuurt. De verwerking is nodig om de door jou gevraagde scan uit te voeren. Lees ook het <a href="https://policies.google.com/privacy?hl=nl" rel="noreferrer">privacybeleid van Google</a>.</p>
        <h3>Een advies, geen besluit over jou</h3>
        <p>De tools geven uitleg, ideeën of een prijsindicatie op basis van je invoer. De uitkomst sluit geen overeenkomst en bepaalt niet automatisch of je een dienst kunt afnemen. Een inhoudelijk antwoord verandert een technisch gemeten Lighthouse-resultaat niet. Je kunt de uitkomst met Sitesnit bespreken.</p>
      </section>

      <section id="gebruik">
        <h2>4. Gebruik en beveiliging</h2>
        <p>Sitesnit telt hoe vaak een websitecheck of prijscheck wordt gestart of afgerond. Daarbij bewaren we het soort gebeurtenis en het tijdstip, zonder toolantwoorden, contactgegevens of een blijvende bezoekerscode. Deze beperkte telling helpt ons begrijpen of de checks worden gebruikt. De basis is ons gerechtvaardigde belang om de werking te verbeteren met zo min mogelijk gegevens.</p>
        <p>Om veelvuldige of geautomatiseerde verzoeken tegen te gaan, gebruiken aanvragen en scans tijdelijk een niet rechtstreeks leesbare afgeleide van het IP-adres. Die dient alleen als korte beveiligingsteller. Hosting- en beveiligingsdiensten verwerken daarnaast verbindingsgegevens, zoals IP-adres, tijdstip en technische verzoekinformatie, om de website beschikbaar en veilig te houden. Deze verwerking berust op het gerechtvaardigde belang om misbruik en storingen te beperken.</p>
      </section>

      <section id="analytics">
        <h2>5. Google Analytics en cookies</h2>
        {analyticsActive ? (
          <>
            <p>Alleen als je statistieken toestaat, gebruikt Sitesnit Google Analytics om te zien welke openbare pagina’s worden bezocht. Daarbij worden pagina-adres zonder extra parameters, het domein van de verwijzende website en technische gegevens over browser en apparaat verwerkt. Google gebruikt een willekeurige browsercode om statistieken samen te stellen.</p>
            <p>De grondslag is jouw toestemming. Vóór toestemming en na weigeren wordt de Google-tag niet geladen en sturen we ook geen meetverzoeken zonder cookies. Antwoorden, formulierinhoud, contactgegevens en persoonlijke toolresultaten worden niet aan Google Analytics doorgegeven. Sitesnit gebruikt deze koppeling niet voor advertentieprofielen.</p>
          </>
        ) : (
          <p>Google Analytics staat momenteel uit. Er wordt geen Google Analytics-script geladen en er worden geen Analytics-cookies geplaatst. Wanneer we deze analyse inschakelen, gebeurt dat pas na jouw toestemming via de cookiekeuze. Ook dan blijft de website zonder die toestemming bruikbaar.</p>
        )}
        <p>Je kunt je cookiekeuze hieronder en via de footer bekijken of aanpassen. Intrekken stopt nieuwe Analytics-metingen en verwijdert de betreffende cookies uit deze browser. Het maakt een eerdere rechtmatige verwerking niet ongedaan. Voor een verzoek over eerder ontvangen persoonsgegevens kun je contact opnemen.</p>
        <CookieSettingsButton className="button button-secondary">Bekijk of wijzig je cookiekeuze</CookieSettingsButton>
        <p>Meer over de gebruikte browseropslag en de bewaartermijnen lees je op de <a href="/cookies">cookiepagina</a>.</p>
      </section>

      <section id="bewaren">
        <h2>6. Hoe lang bewaren we gegevens?</h2>
        <dl>
          <dt>Formulieraanvragen en bijgevoegde tooloverzichten</dt>
          <dd>Maximaal twaalf maanden na ontvangst in de aanvraagopslag. Ontstaat een opdracht, dan bewaren we uitsluitend de daarvoor noodzakelijke informatie in het klant- of administratiedossier. De ruwe toolinvoer krijgt niet automatisch dezelfde bewaartermijn als een factuur.</dd>
          <dt>Klantdossier en administratie</dt>
          <dd>Wat nodig is voor de uitvoering bewaren we zolang de opdracht en eventuele afgesproken nazorg lopen. Noodzakelijke bewijsstukken kunnen langer nodig zijn bij een concreet geschil of wettelijke verplichting. Fiscaal verplichte basisadministratie en facturen bewaren we doorgaans zeven jaar vanaf het moment waarop de wettelijke termijn begint.</dd>
          <dt>Gebeurtenistellingen van de checks</dt>
          <dd>Losse start- en voltooiingsgebeurtenissen maximaal negentig dagen.</dd>
          <dt>Beveiligingstellers</dt>
          <dd>De tellers zijn maximaal tien minuten geldig. Een volgend tijdvak gebruikt een nieuwe teller. Verlopen tellers worden tijdens de dagelijkse opschoning verwijderd.</dd>
          <dt>Toolvoortgang in je browser</dt>
          <dd>Voor de browsersessie, of totdat je de tool reset of websitegegevens wist. Bij browserherstel kan de sessie terugkomen.</dd>
          <dt>Cookiekeuze en Analytics-cookies</dt>
          <dd>Een cookiekeuze is maximaal {CONSENT_MAX_AGE_DAYS} dagen geldig. Wanneer Analytics met toestemming actief is, worden de cookies ingesteld op maximaal dezelfde termijn. Daarna wordt opnieuw een keuze gevraagd.</dd>
          {analyticsActive && <>
            <dt>Google Analytics-gegevens</dt>
            <dd>De ingestelde bewaartermijn voor gebruikers- en gebeurtenisgegevens is twee maanden. Geaggregeerde rapporten vallen niet onder diezelfde instelling en kunnen langer beschikbaar blijven. De cookieperiode en de bewaartermijn van rapportgegevens zijn verschillende zaken.</dd>
          </>}
        </dl>
        <p>Als gegevens tijdelijk nodig blijven wegens een wettelijke verplichting of concreet geschil, beperken we het gebruik tot dat doel. Verwijdering uit actieve opslag betekent niet dat een technische back-up meteen wordt herschreven. Back-ups zijn bedoeld voor herstel; na herstel worden geldende verwijderingen opnieuw toegepast.</p>
      </section>

      <section id="ontvangers">
        <h2>7. Dienstverleners en verwerking</h2>
        <p>Voor de openbare website gebruikt Sitesnit Vercel voor hosting en verwerking van websiteverzoeken, en Neon voor de database met aanvragen en beperkte gebruiks- en beveiligingsgegevens. Neon maakt deel uit van Databricks. Deze dienstverleners verwerken de gegevens die nodig zijn om hun betreffende dienst te leveren.</p>
        <p>Google PageSpeed Insights ontvangt een pagina-adres wanneer je een scan aanvraagt. Google Analytics ontvangt alleen de hierboven beschreven statistische gegevens wanneer de koppeling actief is en je toestemming hebt gegeven. Je contactaanvraag wordt niet door deze website naar een advertentieplatform of generatieve AI-dienst gestuurd.</p>
        <p>Dienstverleners kunnen gegevens ook buiten de Europese Economische Ruimte verwerken. Een Europese serverlocatie betekent niet dat iedere vorm van ondersteuning of verwerking uitsluitend daar plaatsvindt. Bij doorgifte gebruiken we de toepasselijke waarborgen, zoals een geldig adequaatheidsbesluit of de standaardcontractbepalingen van de Europese Commissie, met aanvullende maatregelen waar dat nodig is. Via het contactformulier kun je informatie vragen over de waarborgen die voor jouw gegevens gelden.</p>
        <p>Meer informatie vind je in de <a href="https://vercel.com/legal/dpa" rel="noreferrer">gegevensverwerkingsvoorwaarden van Vercel</a>, de <a href="https://neon.com/platform-terms" rel="noreferrer">voorwaarden van Neon</a> en het <a href="https://policies.google.com/privacy?hl=nl" rel="noreferrer">privacybeleid van Google</a>. Sitesnit verkoopt je aanvraaggegevens niet. Verstrekking aan andere partijen gebeurt alleen wanneer dat nodig is voor de met jou afgesproken dienstverlening of wettelijk verplicht is.</p>
      </section>

      <section id="rechten">
        <h2>8. Jouw privacyrechten</h2>
        <p>Je kunt vragen welke persoonsgegevens Sitesnit van je heeft en om een kopie verzoeken. Je kunt onjuiste gegevens laten verbeteren en, waar dat van toepassing is, verwijdering, beperking van gebruik of overdracht vragen. Tegen verwerking op basis van een gerechtvaardigd belang kun je bezwaar maken. Toestemming kun je altijd intrekken.</p>
        <p>Gebruik het <a href="/contact">contactformulier</a> en vermeld dat het om een privacyverzoek gaat, of stuur een brief naar het adres bovenaan. Geef voldoende informatie om je aanvraag terug te vinden. We vragen alleen aanvullende gegevens als dat nodig is om vast te stellen dat het verzoek van jou komt; stuur niet uit eigen beweging een volledige kopie van je identiteitsbewijs.</p>
        <p>Je ontvangt in beginsel binnen één maand een reactie. Als de wet vanwege de complexiteit of het aantal verzoeken meer tijd toestaat, laten we binnen die eerste maand weten waarom dat nodig is en wanneer je antwoord krijgt. Als een recht niet of niet volledig kan worden uitgevoerd, leggen we de reden uit.</p>
        <p>Ben je niet tevreden over de verwerking of ons antwoord, dan kun je een klacht indienen bij de <a href="https://autoriteitpersoonsgegevens.nl/een-tip-of-klacht-indienen-bij-de-ap" rel="noreferrer">Autoriteit Persoonsgegevens</a>.</p>
      </section>

      <section id="beveiliging">
        <h2>9. Zorgvuldigheid en wijzigingen</h2>
        <p>We beperken toegang tot aanvraaggegevens tot wat nodig is, beveiligen verbindingen en controleren invoer en verzoeken. Deel geen medische informatie, identiteitsdocumenten, wachtwoorden of betaalkaartgegevens in de openbare formulieren en tools. Een technische controle is geen volledige beveiligingsaudit van jouw website.</p>
        <p>Verandert de manier waarop we gegevens gebruiken, dan passen we deze uitleg aan en vragen we opnieuw toestemming wanneer dat nodig is. De huidige versie is van {business.termsVersion}.</p>
      </section>
    </LegalLayout>
  );
}
