import { withPageMetadata } from '../seo';
import { LegalLayout } from '../legal-layout';
import { CookieSettingsButton } from '../cookie-consent';
import { business } from '../../lib/business';
import { analyticsConfigured, CONSENT_MAX_AGE_DAYS } from '../../lib/consent';

export const metadata = withPageMetadata({}, '/cookies');

const contents = [
  ['keuze', 'Jouw keuze'],
  ['noodzakelijk', 'Noodzakelijke browseropslag'],
  ['analytics', 'Google Analytics'],
  ['wijzigen', 'Aanpassen en verwijderen'],
  ['anders', 'Andere gegevensverwerking'],
].map(([id, title]) => ({ id, title }));

export default function Cookies() {
  const analyticsActive = analyticsConfigured(
    process.env.GA4_MEASUREMENT_ID,
    process.env.GA4_PRIVACY_CONFIGURED === 'true',
  );

  return (
    <LegalLayout
      path="/cookies"
      label="Cookies"
      title="Jij kiest."
      accent="De website werkt door."
      intro="Browseropslag helpt je een tool afmaken en je voorkeur onthouden. Extra statistieken vragen een aparte keuze. Je kunt ook zonder die statistieken alle pagina’s en tools gebruiken."
      points={[
        'Noodzakelijke opslag bewaart je toolvoortgang op dit apparaat.',
        analyticsActive ? 'Google Analytics werkt alleen na jouw toestemming.' : 'Google Analytics staat momenteel uit.',
        'Je kunt je keuze altijd aanpassen via de footer.',
      ]}
      contents={contents}
    >
      <section id="keuze">
        <h2>1. Jouw keuze</h2>
        <p>Cookies zijn kleine gegevensbestanden in je browser. Ook lokale opslag en sessieopslag kunnen informatie op je apparaat bewaren. We leggen hieronder uit waarvoor Sitesnit deze technieken gebruikt.</p>
        {analyticsActive ? (
          <p>Bij je eerste bezoek kun je kiezen tussen alleen noodzakelijke opslag en analyse toestaan. Vooraf aangevinkte toestemming gebruiken we niet. Verder scrollen of een pagina openen geldt niet als akkoord. We laden Google Analytics pas nadat je daarvoor kiest.</p>
        ) : (
          <p>Er is momenteel geen actieve Google Analytics-koppeling. Daarom vragen we geen toestemming voor een analyse die niet plaatsvindt. De instellingen blijven bereikbaar en laten zien dat analyse uitstaat. Wordt de koppeling later ingeschakeld, dan vragen we eerst om je keuze.</p>
        )}
        <CookieSettingsButton className="button button-secondary">Bekijk of wijzig je cookiekeuze</CookieSettingsButton>
      </section>

      <section id="noodzakelijk">
        <h2>2. Noodzakelijke browseropslag</h2>
        <p>Deze opslag is nodig om de door jou gebruikte tools te laten werken of een cookiekeuze te onthouden. Ze wordt niet gebruikt voor advertentieprofielen.</p>
        <dl>
          <dt>Cookiekeuze · sitesnit-cookie-consent-v1</dt>
          <dd>Wanneer analyse beschikbaar is en je een keuze maakt, bewaren we die in lokale browseropslag. Daarin staan de keuze, het tijdstip en de versie waarop deze betrekking heeft. De keuze is maximaal {CONSENT_MAX_AGE_DAYS} dagen geldig. Een ongeldige of verlopen keuze activeert geen statistieken.</dd>
          <dt>Websitecheck en prijscheck</dt>
          <dd>De sessiesleutels sitesnit-websitecheck-v3 en sitesnit-prijscheck-v3 bewaren je stap, antwoorden en eventuele scanuitkomst in deze browser. Daardoor kun je teruggaan en antwoorden aanpassen.</dd>
          <dt>Overige tools</dt>
          <dd>sitesnit-designer-v1 bewaart je ontwerpkeuzes, sitesnit-offers-v1 de ingevoerde offertevergelijking en sitesnit-automation-v1 je automatiseringsplan. Deze gegevens blijven in sessieopslag; ze worden niet automatisch naar Sitesnit verstuurd.</dd>
          <dt>Een uitkomst meenemen naar contact</dt>
          <dd>sitesnit-context-v1 bewaart tijdelijk het overzicht dat je vanuit een tool naar het contactformulier meeneemt. Je kunt daar kiezen of je het meestuurt. Na een geslaagde aanvraag wordt deze overdrachtsopslag verwijderd. De oorspronkelijke toolvoortgang kan blijven staan totdat je die reset.</dd>
        </dl>
        <p>Sessieopslag is bedoeld voor de huidige browsersessie. Omdat browsers een sessie kunnen herstellen, is een venster sluiten geen garantie dat de invoer definitief verdwijnt. Gebruik de resetmogelijkheid of verwijder de websitegegevens via je browser als je zeker wilt zijn dat de invoer op dit apparaat weg is.</p>
      </section>

      <section id="analytics">
        <h2>3. Google Analytics</h2>
        <p><strong>{analyticsActive ? 'Status: alleen actief na jouw toestemming.' : 'Status: uitgeschakeld.'}</strong></p>
        <p>Als je analyse toestaat wanneer de koppeling beschikbaar is, helpt Google Analytics ons begrijpen welke openbare pagina’s worden bezocht. We gebruiken die informatie om de website te verbeteren. De koppeling maakt geen advertentieprofielen en ontvangt geen ingevulde antwoorden, contactgegevens of persoonlijke resultaten.</p>
        <dl>
          <dt>_ga en _ga_…</dt>
          <dd>Analytics-cookies van Google met een willekeurige browsercode en gegevens voor het samenstellen van bezoekstatistieken. Ze worden uitsluitend na toestemming geplaatst en zijn in deze inrichting ingesteld op maximaal {CONSENT_MAX_AGE_DAYS} dagen. Die cookieperiode is niet hetzelfde als de bewaartermijn van gegevens in Analytics.</dd>
          <dt>Welke paginagegevens gaan mee?</dt>
          <dd>Alleen bekende openbare pagina-adressen, zonder extra URL-parameters of ankers. Van een verwijzende website wordt alleen het domein meegenomen. Vrij ingevulde tekst, tooluitkomsten en onbekende persoonlijke URL’s worden niet als paginainformatie doorgestuurd. Google verwerkt daarnaast de technische gegevens die bij het meetverzoek horen.</dd>
          <dt>Wat gebeurt er zonder toestemming?</dt>
          <dd>De Google-tag wordt niet geladen. Sitesnit stuurt ook geen Analytics-meetverzoeken zonder cookies wanneer je nog geen keuze hebt gemaakt of analyse weigert.</dd>
        </dl>
        <p>Google kan gegevens buiten de Europese Economische Ruimte verwerken. Lees de <a href="/privacy#ontvangers">uitleg over dienstverleners en waarborgen</a> en het <a href="https://policies.google.com/privacy?hl=nl" rel="noreferrer">privacybeleid van Google</a>. Sitesnit gebruikt geen advertentiecookies in deze inrichting.</p>
      </section>

      <section id="wijzigen">
        <h2>4. Aanpassen en verwijderen</h2>
        <p>Via de knop hieronder of ‘Cookie-instellingen’ in de footer kun je je keuze aanpassen. Kies je na eerdere toestemming voor alleen noodzakelijk, dan stoppen nieuwe metingen, verwijderen we de Analytics-cookies uit deze browser en wordt de pagina herladen. Je toolvoortgang wordt door die cookiekeuze niet gewist.</p>
        <CookieSettingsButton className="button button-secondary">Cookie-instellingen openen</CookieSettingsButton>
        <p>Je kunt websitegegevens ook via de instellingen van je browser wissen. Daarmee kunnen toolinvoer en opgeslagen voorkeuren verdwijnen. Als je browser opslag blokkeert, kan Sitesnit je keuze niet voor een volgend bezoek onthouden. De website blijft beschikbaar.</p>
        <p>Intrekken van toestemming werkt voor nieuwe verwerking. Wil je een verzoek doen over persoonsgegevens die al eerder zijn ontvangen, bekijk dan je <a href="/privacy#rechten">privacyrechten</a>.</p>
      </section>

      <section id="anders">
        <h2>5. Andere gegevensverwerking</h2>
        <p>Een contactaanvraag en de gevraagde Google PageSpeed-scan werken onafhankelijk van je keuze voor Analytics. De beperkte start- en voltooiingstellingen van de websitecheck en prijscheck gebruiken geen Analytics-cookies en bevatten geen blijvende bezoekerscode. Lees in de <a href="/privacy">privacyverklaring</a> wat daarvoor wordt verwerkt en hoe lang gegevens worden bewaard.</p>
        <p>Heb je een vraag over cookies of opslag? Geef die door via het <a href="/contact">contactformulier</a>. Deze uitleg is bijgewerkt op {business.termsVersion}.</p>
      </section>
    </LegalLayout>
  );
}
