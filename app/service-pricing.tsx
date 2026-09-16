import { Arrow, Eyebrow } from "./ui";
import { euro, site } from "./site-data";
import { business, grossPrice, hostingSummary } from "../lib/business";
import { BusinessNotes } from "./business-notes";
import { WebsitePrice } from './website-price';

const hostingPlans = [
  {name:"Hosting",price:business.hostingMonthly,tag:"Online houden",items:["Je website online houden","Geen wijzigingen of onderhoud"]},
  {name:"Hosting & technisch onderhoud",price:29.99,tag:"Online & technisch verzorgd",items:["Hosting inbegrepen","Maandelijkse controle op snelheid en fouten","Herstel van technische fouten binnen je bestaande website"]},
  {name:"Hosting, onderhoud & SEO",price:69.99,tag:"Techniek & bestaande inhoud",items:["Alles uit technisch onderhoud","Doorlopende SEO-verbeteringen","Bestaande teksten aanscherpen en code bijwerken waar nodig"]}
];
const blogPlans = [
  {name:"2 blogs per maand",price:175,tag:"Een rustig publicatieritme",items:["Onderwerpenonderzoek","Schrijven vanuit jouw expertise","SEO-opmaak en interne links","Publiceren op je website"]},
  {name:"4 blogs per maand",price:325,tag:"Meer ruimte voor je onderwerpen",items:["Dezelfde complete verzorging","Onderwerpenonderzoek en schrijven","SEO-opmaak en interne links","Vier publicaties verdeeld over de maand"]}
];
const socialPrices = [[4,149,174,199],[6,199,234,269],[8,249,294,339]];

export function ServicePricing({slug}:{slug:string}) {
  const care=slug==="onderhoud-hosting",blogs=slug==="content",social=slug==="social-media",web=slug==="webdesign";
  if(care||blogs) return <section className="service-price-section" id="maandpakketten"><div className="wrap">
    <div className="experience-section-head"><div><Eyebrow>De pakketten / Per maand</Eyebrow><h2>{care?"Kies de aandacht.":"Kies je ritme."}<br/><em>De prijs is helder.</em></h2></div><p>{care?"Alleen online blijven, technisch laten verzorgen of ook bestaande inhoud verbeteren. Dit zijn de verschillen.":"Onderzoek, schrijven, SEO-opmaak en publiceren zijn bij beide blogpakketten inbegrepen. Je inhoudelijke controle spreken we vooraf af."}</p></div>
    <div className={`experience-prices ${blogs?"prices-blogs":""}`}>{(care?hostingPlans:blogPlans).map((plan,i)=><article className={`experience-price ${i===(care?2:1)?"price-featured":""}`} key={plan.name}>
      <span className="price-tag">{plan.tag}</span><h3>{plan.name}</h3><div className="experience-price-value"><strong>{euro(grossPrice(plan.price))}</strong><span>per maand · incl. 21% btw</span><small>{euro(plan.price)} per maand excl. btw</small></div>
      <ul>{plan.items.map(item=><li key={item}>{item}</li>)}</ul>
      {blogs&&i===1&&<p className="price-benefit">{euro(grossPrice(25))} voordeel inclusief btw ({euro(25)} exclusief btw) tegenover twee keer het kleinere pakket.</p>}
      <a className="button" href={`/contact?dienst=${slug}&maandpakket=${encodeURIComponent(plan.name)}`}>Bespreek dit pakket<Arrow/></a>
    </article>)}</div>
    {care&&<p className="care-cost-note">{hostingSummary}</p>}
    <div className="price-scope-note"><b>{care?"Goed om te weten":"Ook duidelijk afgesproken"}</b><p>{care?"Nieuwe blogs, nieuwe functies, grotere uitbreidingen en eventuele externe abonnementen vallen buiten deze maandpakketten. Voor een bestaande website bekijken we eerst of overname van het beheer mogelijk is en of eenmalige inrichting nodig is.":"We verdelen de publicaties over de maand. Nieuwe artikelen staan los van onderhoud aan bestaande teksten. Eenmalige webcopy en aanvullende foto- of videoproductie krijgen een eigen voorstel."}</p></div>
  </div></section>;
  if(social) return <section className="service-price-section" id="maandpakketten"><div className="wrap social-price-layout"><div><Eyebrow>Social media / Per maand</Eyebrow><h2>Jouw kanalen.<br/><em>Een passend ritme.</em></h2><p>Je kiest hoeveel posts we maken en op hoeveel platforms ze verschijnen. De tabel toont de totale maandprijs voor je combinatie inclusief 21% btw. Daaronder staat de prijs exclusief btw.</p><div className="social-price-equation"><b>4 basisposts</b><span>× 3 platforms</span><strong>12 plaatsingen</strong><p>Dezelfde onderwerpen, met tekst en vorm aangepast voor Instagram, Facebook en LinkedIn.</p></div></div><div className="social-price-surface"><table className="social-price-table"><caption>Maandprijzen incl. 21% btw · daaronder excl. btw</caption><thead><tr><th scope="col">Posts</th><th scope="col">1<span>platform</span></th><th scope="col">2<span>platforms</span></th><th scope="col">3<span>platforms</span></th></tr></thead><tbody>{socialPrices.map(([count,...prices])=><tr key={count}><th scope="row">{count}</th>{prices.map((price,i)=><td key={i}><strong style={{display:"block",whiteSpace:"nowrap"}}>{euro(grossPrice(price))}</strong><small style={{display:"block",fontSize:".72em",whiteSpace:"nowrap"}}>{euro(price)} excl.</small></td>)}</tr>)}</tbody></table><p>Inclusief aanpassen en plaatsen van de afgesproken basisposts. De planning, beschikbare beelden en jouw controle stemmen we vooraf af.</p><p>Reacties, privéberichten, advertenties en aanvullende foto- of videoproductie spreken we afzonderlijk af.</p><a className="button" href="/contact?dienst=social-media">Bespreek je kanalen & ritme<Arrow/></a></div></div></section>;
  if(web) return <section className="service-price-section" id="investering"><div className="wrap"><div className="experience-section-head"><div><Eyebrow>Website / Investering</Eyebrow><h2>Een duidelijke basis.<br/><em>Ruimte voor jouw plan.</em></h2></div><p>Dit zijn de vertrekpunten voor een website. Een webshop, merktraject of aanvullende koppeling krijgt een voorstel op basis van de benodigde werking.</p></div><div className="experience-prices website-price-overview">{site.packages.map(plan=><article className={`experience-price ${plan.id==='maatwerk'?"price-featured":""}`} key={plan.id}><span className="price-tag">{plan.pages}</span><h3>{plan.name}</h3><WebsitePrice net={plan.price} from={plan.id==='maatwerk'}/><p>{plan.description}</p>{plan.id==='maatwerk'&&<p className="price-benefit">Een groter maatwerkproject komt gemiddeld rond {euro(site.averageProjectCost)} exclusief btw uit ({euro(grossPrice(site.averageProjectCost))} inclusief btw). De omvang bepaalt het voorstel.</p>}<a className="text-link" href={`/kosten#${plan.id}`}>Pakket & kosten bekijken<Arrow/></a></article>)}</div><BusinessNotes compact websitePrice={site.packages[0].price}/></div></section>;
  const factors:Record<string,string[]>={
    apps:["iPhone, Android of beide, met de afgesproken schermen","Inloggen, gegevens en functies van de telefoon","Testen, publicatie, koppelingen en verdere updates"],
    webapps:["Schermen, gebruikersrollen en toegangsrechten","Gegevensstromen en bestaande software","Beveiliging, testen en beheer na oplevering"],
    webshops:["Producten, varianten en beschikbare content","Ontwerp, bestel- en betaalwerking","Voorraadkoppelingen en orderverwerking"],
    branding:["Nieuwe identiteit of bestaande stijl verfijnen","Logo, kleuren, typografie en toepassingen","Afzonderlijke foto- en videoproductie"],
    seo:["Bestaande website en verbeterpunten","Eenmalig werk of doorlopende verzorging","Nieuwe inhoud en gekozen kanalen"],
    "seo-optimalisatie":["Aantal pagina’s en beschikbare inhoud","Benodigde technische aanpassingen","Eenmalige verbetering en eventueel vervolg"],
    "formulieren-rekentools":["Vragen, stappen en berekeningsregels","Opslag, bevestiging en softwarekoppelingen","Ontwerp, invoercontrole en tests"],
    "ai-automatisering":["Het proces en aantal systemen","Verwerking, uitzonderingen en controles","Softwaregebruik en verder onderhoud"],
    "ai-koppelingen":["Processtappen en toegankelijke systemen","Gegevens, AI-gebruik en controlepunten","Softwareabonnementen en verder onderhoud"]
  };
  return <section className="wrap experience-proposal" id="investering"><div><Eyebrow>Investering</Eyebrow><h2>Eerst de werking.<br/><em>Dan een helder voorstel.</em></h2><p>De benodigde werkzaamheden bepalen de prijs. We maken de opdracht concreet en leggen de investering vast voordat we beginnen.</p></div><div className="proposal-scope"><span>Dit bepaalt de omvang</span><ul>{(factors[slug]??factors.webshops).map(item=><li key={item}>{item}</li>)}</ul><p>Eenmalig werk, eventuele externe gebruikskosten en onderhoud staan afzonderlijk in het voorstel.</p><a className="text-link" href={slug==="seo"?"/diensten/content#maandpakketten":"/contact?dienst="+slug}>{slug==="seo"?"Bekijk de blogpakketten":"Vraag een voorstel voor je plan"}<Arrow/></a></div></section>;
}
