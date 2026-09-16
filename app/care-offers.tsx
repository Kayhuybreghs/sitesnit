import { Arrow, Eyebrow } from "./ui";
import { euro } from "./site-data";
import { business, grossPrice, hostingSummary } from "../lib/business";

function MonthlyPrice({ net }: { net: number }) {
  return <span className="monthly-price"><b>{euro(grossPrice(net))}</b><small style={{display:"block",fontSize:".8rem",fontWeight:500}}>{euro(net)} excl. btw</small></span>;
}
export type CareCategory = "onderhoud-hosting" | "content" | "social-media";
const categories: CareCategory[] = ["onderhoud-hosting", "content", "social-media"];
const titles = { "onderhoud-hosting": "Hosting & onderhoud", content: "Content & blogs", "social-media": "Social media" };
const socialPrices = [[4,149,174,199],[6,199,234,269],[8,249,294,339]];
export function CareOffers({category}: {category?: CareCategory}) {
  return <section className={`care-offers ${category ? "care-offers-single" : ""}`} id={category ? "maandpakketten" : "doorlopend"}>
    <div className="wrap">
      <div className="section-head"><div><Eyebrow>Doorlopend verzorgd / Maandpakketten</Eyebrow><h2>{category ? titles[category] : "Goed geregeld."}<br /><em>{category ? "Een helder maandbedrag." : "Ook volgende maand."}</em></h2></div><p>Kies wat je wilt uitbesteden. De hoofdprijzen zijn per maand inclusief 21% btw. De zakelijke prijzen exclusief btw staan erbij.</p></div>
      <div className="care-offer-grid">{(category ? [category] : categories).map(kind => <article className="care-offer" key={kind} id={kind} data-reveal>
        <span className="eyebrow">{kind === "onderhoud-hosting" ? "01 / De basis van je website" : kind === "content" ? "02 / Nieuwe inhoud" : "03 / Zichtbaar op je kanalen"}</span><h3>{titles[kind]}</h3>
        {kind === "onderhoud-hosting" ? <>
          <p>Van alleen online blijven tot een website die technisch én inhoudelijk wordt bijgehouden.</p>
          <dl className="monthly-plans">
            <div><dt>Hosting <MonthlyPrice net={business.hostingMonthly}/></dt><dd>Je website online houden. Geen wijzigingen of onderhoud.</dd></div>
            <div><dt>Hosting & technisch onderhoud <MonthlyPrice net={29.99}/></dt><dd>Hosting, maandelijkse controle op snelheid en fouten, en herstel van technische fouten binnen de bestaande website.</dd></div>
            <div className="monthly-plan-highlight"><dt>Hosting, onderhoud & SEO <MonthlyPrice net={69.99}/></dt><dd>Al het technische onderhoud, met doorlopende SEO-verbeteringen. We scherpen bestaande teksten aan en werken de code waar nodig bij.</dd></div>
          </dl><p className="monthly-detail">{hostingSummary}</p>
        </> : kind === "content" ? <>
          <p>Onderwerpenonderzoek, schrijven, SEO-opmaak en publiceren. Nieuwe blogs, zonder zelf steeds achter een leeg document te zitten.</p>
          <dl className="monthly-plans">
            <div><dt>2 blogs per maand <MonthlyPrice net={175}/></dt><dd>Een rustig ritme met ruimte voor de vragen van je klanten.</dd></div>
            <div className="monthly-plan-highlight"><dt>4 blogs per maand <MonthlyPrice net={325}/></dt><dd>Meer onderwerpen op je website. {euro(grossPrice(25))} voordeel inclusief btw ({euro(25)} exclusief btw) ten opzichte van twee keer het kleinere pakket.</dd></div>
          </dl><p className="monthly-detail">We verdelen de publicaties over de maand en spreken je inhoudelijke controle vooraf af. Nieuwe artikelen staan los van het onderhoud aan bestaande teksten.</p>
        </> : <>
          <p>Instagram, Facebook of LinkedIn. Eén platform is één kanaal; dezelfde basisposts worden per gekozen platform aangepast en geplaatst.</p>
          <table className="social-price-table"><caption>Maandprijzen incl. 21% btw · daaronder excl. btw</caption><thead><tr><th scope="col">Posts</th><th scope="col">1<span>platform</span></th><th scope="col">2<span>platforms</span></th><th scope="col">3<span>platforms</span></th></tr></thead><tbody>{socialPrices.map(([count,...prices])=><tr key={count}><th scope="row">{count}</th>{prices.map((price,i)=><td key={i}><strong style={{display:"block",whiteSpace:"nowrap"}}>{euro(grossPrice(price))}</strong><small style={{display:"block",fontSize:".72em",whiteSpace:"nowrap"}}>{euro(price)} excl.</small></td>)}</tr>)}</tbody></table>
          <p className="monthly-detail">Bijvoorbeeld: 4 basisposts op 3 platforms zijn 12 plaatsingen voor {euro(grossPrice(199))} per maand inclusief btw ({euro(199)} exclusief btw).</p>
          <p className="monthly-detail">Reacties, privéberichten en advertentiebeheer spreken we afzonderlijk af.</p>
        </>}
        <a className="button" href={`/contact?dienst=${kind}`}>Bespreek {kind === "content" ? "je blogs" : kind === "social-media" ? "je kanalen" : "je onderhoud"} <Arrow /></a>
        <a className="text-link" href={category ? `/kosten#${kind}` : `/diensten/${kind}`}>{category ? "Vergelijk alle maandpakketten" : "Wat houdt dit in?"} <Arrow /></a>
      </article>)}</div>
      <p className="care-cost-note">We leggen de gekozen werkzaamheden vooraf vast. Nieuwe functies, eenmalige inrichting en eventuele externe abonnementen stemmen we apart af. Foto- of videoproductie via een externe partner krijgt een afzonderlijke afspraak.</p>
    </div>
  </section>;
}
