import { withPageMetadata } from '../seo';
import { Cta, Eyebrow, Arrow } from "../ui";
import "../expansion.css";
import { PageHero } from "../studio-components";
import "../service-experience.css";
import { site, euro } from "../site-data";
import { BusinessNotes } from '../business-notes';
import { WebsitePrice } from '../website-price';
import { grossPrice, minimumHostingYear } from '../../lib/business';
import type { Metadata } from "next";
import { JsonLd, Breadcrumbs } from '../seo';
export const metadata: Metadata = withPageMetadata({alternates: {canonical: "/kosten"}}, '/kosten');
const details = [
  {fit: "Een compact aanbod met één duidelijk verhaal.", structure: "Je aanbod, je bedrijf en contact volgen elkaar op één pagina op.", example: "Bijvoorbeeld voor een zelfstandige, één dienst of een compact portfolio."},
  {fit: "Meerdere onderwerpen die hun eigen plek verdienen.", structure: "Vijf pagina’s met navigatie tussen onderwerpen. De inhoud bepaalt de verdeling.", example: "Bijvoorbeeld home, diensten, werk, over je bedrijf en contact."},
  {fit: "Volledig maatwerk, specifiek gecodeerd voor jouw inhoud en functies.", structure: "Een indeling en functies die volgen uit je wensen. De omvang bepalen we samen.", example: "Bijvoorbeeld een uitgebreid aanbod, een eigen tool of een softwarekoppeling."},
];
export default function Kosten() {
  return <>
    <Breadcrumbs items={[{name:'Home',path:'/'},{name:'Kosten & pakketten',path:'/kosten'}]}/>
    <JsonLd data={{'@context':'https://schema.org','@type':'OfferCatalog','@id':`${site.origin}/kosten#websitepakketten`,name:'Websitepakketten Sitesnit',itemListElement:site.packages.map(p=>({'@type':'Offer',url:`${site.origin}/kosten#${p.id}`,priceCurrency:'EUR',...(p.id==='maatwerk'?{priceSpecification:{'@type':'PriceSpecification',minPrice:grossPrice(p.price),priceCurrency:'EUR',valueAddedTaxIncluded:true}}:{price:grossPrice(p.price),priceSpecification:{'@type':'PriceSpecification',price:grossPrice(p.price),priceCurrency:'EUR',valueAddedTaxIncluded:true}}),seller:{'@id':`${site.origin}/#organization`},itemOffered:{'@type':'Service',name:`${p.name} — ${p.pages}`,description:p.description+' Bouwprijs inclusief 21% btw. Verplichte hosting vanaf €6,05 inclusief btw per maand, eerste looptijd 12 maanden; daarna maandelijks opzegbaar.',provider:{'@id':`${site.origin}/#organization`}}}))}}/>
    <PageHero eyebrow="Kosten & pakketten" title="Een passende website." accent="Een heldere investering." description="Vergelijk op wat je website moet vertellen en kunnen. Kies een compact begin, geef je aanbod meer ruimte of bespreek een uitgebreider idee." tone="green" visual={<aside className="cost-hero-note"><p>De vorm volgt je verhaal.</p><strong>Hoeveel ruimte<br />heeft jouw idee nodig?</strong><ol><li><b>01</b>Eén verhaal</li><li><b>05</b>Eigen pagina’s</li><li><b>↗</b>Meer vrijheid</li></ol></aside>}>
      <a className="button" href="#pakketten">Vergelijk de pakketten ↓</a><a className="text-link" href="/prijscheck">Help me kiezen <Arrow /></a>
    </PageHero>
    <section className="wrap" id="pakketten" aria-label="Websitepakketten">
      <div className="cost-packages">{site.packages.map((p,i)=><article className="cost-package" data-reveal key={p.id} id={p.id}>
        <div className="cost-package-top"><span>{p.pages}</span><b>0{i+1}</b></div>
        <h2>{p.name}</h2>
        <WebsitePrice net={p.price} from={p.id==='maatwerk'}/>
        <p className="price-total">Bouw + eerste hostingjaar: {i===2?"vanaf":"minimaal"} {euro(grossPrice(p.price+minimumHostingYear))} incl. btw.</p>
        <p>{details[i].fit}</p>
        <dl><dt>Zo zit het in elkaar</dt><dd>{details[i].structure}</dd><dt>Denk aan</dt><dd>{details[i].example}</dd></dl>
        <a className="button" href={`/contact?pakket=${p.id}`}>Bespreek {i===0?"je onepager":i===1?"je website":"maatwerk"} <Arrow /></a>
        <a className="text-link package-more" href={`/diensten/webdesign/pakketten#${p.id}`}>Meer over dit pakket <Arrow /></a>
      </article>)}</div>
      <BusinessNotes /><div className="cost-context"><p>De precieze inhoud en afspraken leggen we vast in je voorstel. Bij maatwerk bepalen het aantal pagina’s, de functies en eventuele koppelingen de uiteindelijke prijs.</p><div className="custom-price-story" data-reveal><span>Volledig gecodeerd maatwerk</span><WebsitePrice net={2750} from/><p>Grotere maatwerkprojecten komen gemiddeld rond <b>{euro(site.averageProjectCost)} exclusief btw</b> ({euro(grossPrice(site.averageProjectCost))} inclusief btw) uit. Omvang, functies en koppelingen bepalen jouw voorstel; dit gemiddelde is geen vaste prijs of bovengrens.</p><a className="text-link" href="/contact?pakket=maatwerk">Bespreek je grotere idee <Arrow /></a></div></div>
    </section>
    <section className="wrap cost-agreements"><div><Eyebrow>Voor we beginnen</Eyebrow><h2>De juiste vragen.<br /><em>Duidelijke afspraken.</em></h2></div><ul><li><b>Wat gaan we maken?</b>We bepalen de pagina’s, inhoud en functies. Een standaardformulier of subtiele animatie maakt een website niet automatisch maatwerk.</li><li><b>Wie levert wat aan?</b>We bekijken welke teksten, foto’s en huisstijl er al zijn en spreken af hoe de ontbrekende inhoud tot stand komt.</li><li><b>Hoe gaat het daarna verder?</b>Planning, oplevering, hosting en eventueel onderhoud krijgen een plek in de afspraken.</li></ul></section>
    <section className="section wrap"><div className="price-tool-banner"><div><Eyebrow>Je hoeft het nog niet te weten</Eyebrow><h2>Jouw wensen.<br /><em>Een passende route.</em></h2><p>De prijscheck helpt je met 15 vragen je plannen ordenen. Je krijgt een prijsbasis en ziet welke keuzes nog openstaan.</p><a className="button" href="/prijscheck">Doe de prijscheck <Arrow /></a></div><div className="price-tool-graphic" aria-hidden="true"><span>Wat wil je vertellen?</span><i>↓</i><span>Wat moet je website kunnen?</span><i>↓</i><b>Daar past een route bij. ↗</b></div></div></section>
    <section className="wrap experience-tool-route"><div><Eyebrow>Al voorstellen ontvangen?</Eyebrow><h2>Vergelijk meer dan de bouwprijs.</h2><p>Leg de inhoud, maandkosten en bekende afspraken van twee of drie website-offertes naast elkaar. Zo zie je ook welke vragen nog openstaan.</p></div><a className="button" href="/tools/offertevergelijker">Vergelijk je offertes <Arrow/></a></section><section className="wrap service-faq"><div><Eyebrow>Over de investering</Eyebrow><h2>Goed om te weten.<br /><em>Helder om te kiezen.</em></h2></div><div className="faq-list">{[
      ["Wat is het verschil tussen één en vijf pagina’s?", "Een onepager vertelt je verhaal op één doorlopende pagina. Met vijf pagina’s kun je onderwerpen zoals diensten, projecten en contact een eigen plek geven. We kiezen op basis van je inhoud, niet alleen op basis van het aantal pagina’s."],
      ["Wanneer wordt een website maatwerk?", "Bij aanvullende omvang of functies die buiten een eenvoudige bedrijfswebsite vallen. Denk aan een eigen boekingssysteem of softwarekoppeling. Een standaardformulier, responsive ontwerp of enkele animaties zijn op zichzelf geen reden voor maatwerk."],
      ["Wat als mijn wensen nog niet helemaal duidelijk zijn?", "De prijscheck helpt je wensen ordenen. Onzekerheid maakt je website niet automatisch duurder. We benoemen welke keuzes nodig zijn om de juiste route te bepalen."],
      ["Hoe zit het met hosting en onderhoud?", "Hosting hoort bij een nieuwe website: vanaf €6,05 inclusief btw per maand (€5 exclusief), minimaal twaalf maanden. Daarna loopt hosting door en is deze maandelijks opzegbaar. Technisch onderhoud en doorlopende SEO kies je afzonderlijk. De pakketten met hun werkzaamheden en maandprijzen staan op de bijbehorende dienstenpagina’s. In het contactformulier kun je vrijblijvend aangeven waar je interesse in hebt."],
      ["Zijn SEO en automatisering onderdeel van een websitepakket?", "We bespreken welke werkzaamheden je nodig hebt en leggen die vast in het voorstel. Losse SEO-trajecten, koppelingen en AI-toepassingen worden afgestemd op je website of proces."],
      ["Kan ik ook mijn bestaande website laten beoordelen?", "Ja. De websitecheck combineert technische metingen met inzichten uit je antwoorden. We bekijken daarna samen of verbeteren of opnieuw bouwen past."],
    ].map(([q,a])=><details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>
    <section className="wrap cost-care-links" id="doorlopend"><Eyebrow>Ook na de oplevering</Eyebrow><h2>Wat wil je uit handen geven?</h2><p>Bij een nieuwe website hoort hosting. Extra onderhoud, blogs of social media kun je afzonderlijk laten verzorgen. De uitleg en maandprijzen staan bij iedere dienst. Je kunt je interesse aanvinken bij je contactaanvraag of dit later bespreken.</p><div><a id="onderhoud-hosting" href="/diensten/onderhoud-hosting#maandpakketten">Hosting & onderhoud<Arrow/></a><a id="content" href="/diensten/content#maandpakketten">Content & blogs<Arrow/></a><a id="social-media" href="/diensten/social-media#maandpakketten">Social media<Arrow/></a></div></section>
    <Cta title="Niet zeker wat past?" accent="Laten we het bespreken." />
  </>;
}
