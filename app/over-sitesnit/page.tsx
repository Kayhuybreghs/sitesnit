import type { Metadata } from 'next';
import { withPageMetadata, Breadcrumbs, JsonLd } from '../seo';
import { Eyebrow, Arrow } from '../ui';
import { CaseLinks } from '../case-components';
import { business } from '../../lib/business';
import { site } from '../site-data';
import '../expansion.css';
import './personal.css';

export const metadata: Metadata = withPageMetadata({ alternates: { canonical: '/over-sitesnit' } }, '/over-sitesnit');

const approach = [
  ['Eerst begrijpen', 'Wat doe je, voor wie en welke vragen krijg je van klanten? Ik begin bij je bedrijf. Dat geeft richting aan de inhoud, het ontwerp en de functies.'],
  ['Keuzes zichtbaar maken', 'Ik vertaal je verhaal naar een indeling, teksten en een ontwerp. Je ziet hoe het samenkomt en waarom een onderdeel op die plek staat.'],
  ['Bouwen én gebruiken', 'Een website moet prettig werken. Daarom kijk ik ook naar mobiel gebruik, snelheid en de route van een eerste bezoek naar een aanvraag.'],
  ['Duidelijk verder kunnen', 'We spreken af wat ik maak en wat je daarna nodig hebt. Denk aan hosting, onderhoud of nieuwe inhoud wanneer je bedrijf verder groeit.'],
];

export default function Over() {
  return <div className="personal-about">
    <Breadcrumbs items={[{ name: 'Home', path: '/' }, { name: 'Over Sitesnit', path: '/over-sitesnit' }]} />
    <JsonLd data={{
      '@context': 'https://schema.org', '@type': 'Person', '@id': `${site.origin}/#kay-huybreghs`,
      name: business.ownerName, url: `${site.origin}/over-sitesnit`, jobTitle: 'Webdesigner en ontwikkelaar',
      worksFor: { '@id': `${site.origin}/#organization` },
      mainEntityOfPage: { '@id': `${site.origin}/over-sitesnit#webpage` },
      description: 'Kay Huybreghs is de maker achter Sitesnit in Baarlo. Hij ontwerpt en bouwt websites, webapps en apps.',
    }} />
    <section className="wrap personal-hero">
      <div className="personal-introduction">
        <Eyebrow>Even voorstellen / Achter Sitesnit</Eyebrow>
        <h1>Kay Huybreghs.<br /><em>De maker achter<br />Sitesnit.</em></h1>
        <p className="personal-lead">Aangenaam, ik ben Kay. Vanuit Baarlo ontwerp en bouw ik websites, webapps en apps. Met Sitesnit breng ik het verhaal van je bedrijf en de techniek erachter bij elkaar.</p>
        <p>Je kunt bij mij terecht met een nieuw idee, een website die beter kan of werk dat je slimmer wilt organiseren. We beginnen bij jouw vraag en maken samen duidelijk wat er nodig is.</p>
        <div className="personal-actions"><a className="button" href="/contact">Maak kennis met Kay <Arrow /></a><a className="text-link" href="#mijn-aanpak">Zo kijk ik naar je website <Arrow /></a></div>
        <p className="personal-location">Vanuit Baarlo, voor ondernemers in Limburg en daarbuiten.</p>
      </div>
      {/* Replace these clearly labelled work images with approved personal photographs when supplied. */}
      <div className="personal-collage" aria-label="Kay Huybreghs en twee voorbeelden van zijn werk">
        <div className="personal-collage-shape" aria-hidden="true" />
        <div className="personal-name-card">
          <span className="personal-card-label">De naam achter Sitesnit</span>
          <div><strong>Kay Huybreghs</strong><span>Ontwerp. Ontwikkeling. Sitesnit.</span></div>
          <span className="personal-monogram" aria-hidden="true">kh.</span>
        </div>
        <figure className="personal-work-card personal-work-first">
          <img src="/projects/beurswijzer/home-sharp-800.webp" alt="Eigen werk: het groene websiteontwerp van Beurswijzer" width="1410" height="754" decoding="async" />
          <figcaption><span>Werk / Beurswijzer</span><strong>Een eigen gezicht.</strong></figcaption>
        </figure>
        <figure className="personal-work-card personal-work-second">
          <img src="/projects/beurswatcher/calculator-640.webp" alt="Eigen werk: de interactieve rendementcalculator van Beurswatcher" width="1150" height="585" decoding="async" />
          <figcaption><span>Werk / Beurswatcher</span><strong>Ook de werking klopt.</strong></figcaption>
        </figure>
        <p className="personal-collage-caption">De persoon. Het ontwerp. De techniek.</p>
      </div>
    </section>

    <section className="personal-purpose" id="mijn-aanpak">
      <div className="wrap personal-two-column">
        <div><Eyebrow>Wat ik met Sitesnit wil bereiken</Eyebrow><h2>Een website waar<br /><em>je mee vooruit kunt.</em></h2></div>
        <div><p className="personal-statement">Ik wil dat je website laat zien wie je bent én het je bezoekers makkelijk maakt om de volgende stap te zetten.</p><p>Dat zit voor mij in concrete keuzes. Een opening die uitlegt wat je doet. Werk dat vertrouwen geeft. Een dienst die begrijpelijk wordt uitgelegd. En een contactknop die je ook op je telefoon meteen vindt.</p><p>Daarom werk ik inhoud, ontwerp en techniek samen uit. Een mooi detail krijgt een functie, een animatie helpt je verhaal en de website blijft prettig om te gebruiken.</p><div className="personal-signature"><span aria-hidden="true">kh.</span><div><strong>Kay Huybreghs</strong><small>Sitesnit · Baarlo</small></div></div></div>
      </div>
    </section>

    <section className="wrap personal-working personal-two-column">
      <div><Eyebrow>Zo werk ik met je samen</Eyebrow><h2>Jouw verhaal.<br /><em>Samen uitgewerkt.</em></h2><p>Je hoeft vooraf niet precies te weten welke techniek of hoeveel pagina’s je nodig hebt. Vertel me eerst wat je wilt bereiken. Van daaruit maken we de keuzes concreet.</p></div>
      <ol className="personal-steps">{approach.map(([title, text], i) => <li key={title}><span aria-hidden="true">0{i + 1}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
    </section>

    <section className="wrap personal-beyond personal-two-column">
      <div><Eyebrow>Van website naar wat daarna komt</Eyebrow><h2>Wat heeft jouw<br /><em>bedrijf nodig?</em></h2></div>
      <div><p>Soms begint het met een heldere website. Soms is een webshop, een app of een omgeving met een eigen login nodig. En soms zit de grootste verbetering achter de schermen: minder handwerk bij facturen, een koppeling tussen systemen of een AI-chatbot die vragen opvangt.</p><p>Ik kijk met je naar wat jouw bedrijf echt helpt. Ook SEO en content horen daarbij: welke vragen stellen je klanten en welke informatie moet je website daarop geven? Voor bedrijfsfotografie en video werk ik met een externe partner.</p><a className="text-link" href="/diensten">Bekijk waarmee ik je kan helpen <Arrow /></a></div>
    </section>

    <CaseLinks title="Bekijk wat die aanpak oplevert." />

    <section className="wrap personal-contact">
      <div><Eyebrow>Zullen we kennismaken?</Eyebrow><h2>Vertel me<br /><em>over jouw idee.</em></h2><p>Een nieuwe website, een verbetering of een plan dat nog vorm moet krijgen: ik hoor graag waar je mee bezig bent. Vertel kort wat je zoekt, dan kunnen we bespreken wat een passende volgende stap is.</p><a className="button" href="/contact">Bespreek je idee met Kay <Arrow /></a></div>
      <aside><h3>Liever even bellen?</h3><p>Geef bij je aanvraag gerust een voorkeursdag door. Dat is optioneel. Bellen kan op afspraak op werkdagen tussen 18.00 en 21.30 uur, of overdag en ’s avonds in het weekend. We bevestigen samen een moment.</p><p>Mijn basis is Baarlo, vlak bij Venlo. Je kunt ook op afstand met me samenwerken.</p><a className="text-link" href="/webdesign-venlo">Webdesign voor Venlo en omgeving <Arrow /></a></aside>
    </section>
  </div>;
}
