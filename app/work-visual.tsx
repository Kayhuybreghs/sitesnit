import { ProjectPhoneScreen } from "./project-phone-screen";
import { Arrow } from "./ui";

export type WorkKind = "design" | "editorial" | "tools" | "care" | "brand" | "social" | "shop" | "budget" | "watcher";
const captions: Record<WorkKind,[string,string,string]> = {
  watcher: ["Beurswatcher / Mobiel merkontwerp", "Een uitgesproken eigen gezicht.", "Diepblauw, geel en stevige typografie verbinden de artikelen en tools. Op mobiel krijgt de inhoud een eigen volgorde."],
  budget: ["Beurswijzer / Budgetplanner", "Cijfers die met elkaar samenhangen.", "Inkomsten, uitgaven en plannen komen samen in één overzicht. Je ziet wat er overblijft en waar je keuzes liggen."],
  design: ["Beurswijzer / Webdesign", "Eén merk. Twee indelingen.", "Dezelfde identiteit, met navigatie en inhoud die op je telefoon een eigen plek krijgen."],
  editorial: ["Beurswijzer / Redactionele inhoud", "Een echte vraag als vertrekpunt.", "Onderwerp, titel en artikel sluiten op elkaar aan. Zo vindt je bezoeker de uitleg die past."],
  tools: ["Beurswatcher / Rendementcalculator", "Van uitgangspunt naar inzicht.", "Inleg en looptijd worden een leesbaar scenario. De rekenregels bepalen de cijfers."],
  care: ["Beurswatcher / Doorlopend beheer", "Ook na de bouw gaat het door.", "Voor dit platform verzorgen we wekelijkse blogs, SEO-basis, websiteonderhoud en hosting."],
  brand: ["Beurswijzer / Merk in gebruik", "Herkenbaar tot in de details.", "Kleur, typografie en beeld verbinden de eerste indruk met de rest van het platform."],
  social: ["Beurswijzer / Inhoud als vertrekpunt", "Een onderwerp kan verder.", "Een blog geeft ruimte voor uitleg. Dezelfde basisinhoud kun je vertalen naar je social kanalen."],
  shop: ["Van product naar bestelling", "Ook achter de knop moet het kloppen.", "Een webshop verbindt je assortiment met betalen en verwerken. We ontwerpen de hele route."],
};

export function WorkVisual({kind="design",priority=false,compact=false,sizes="(max-width: 699px) 84vw, (max-width: 1100px) 52vw, 670px"}: {kind?:WorkKind;priority?:boolean;compact?:boolean;sizes?:string}) {
  const caption=captions[kind];
  const editorial=kind==="editorial" || kind==="social";
  const image=editorial ? "/projects/beurswijzer/insights" : kind==="budget" ? "/projects/beurswijzer/planner" : kind==="tools" ? "/projects/beurswatcher/calculator" : "/projects/beurswijzer/home-sharp";
  const small=kind==="tools" ? 640 : 800;
  const large=editorial || kind==="budget" ? `${image}-1250.webp` : `${image}.webp`;
  const dimensions=editorial || kind==="budget" ? [1250,710] : kind==="tools" ? [1150,585] : [1410,754];
  return <figure className={`work-proof proof-${kind}${compact ? " proof-compact" : ""}`} data-scroll-scene={priority ? undefined : "unfold"}>
    <div className="work-stage" data-scene-target>
      <div className="work-wash" aria-hidden="true" />
      {kind==="care" || kind==="watcher" ? <>
        <div className="work-phone care-phone"><ProjectPhoneScreen project="beurswatcher"/></div>
        {kind==="watcher" ? <div className="work-brand-plan"><span>Een merk met karakter</span><strong>Verder kijken.<br/><em>Beter begrijpen.</em></strong><div className="watcher-palette" role="img" aria-label="Diepblauw, geel en gebroken wit"><i/><i/><i/></div><p>Een eigen identiteit.<br/>Ook op het kleinste scherm.</p></div> : <div className="work-care-plan"><span>Na de lancering</span><strong>Het werk<br />gaat door.</strong><ol><li><b>01</b><span>Nieuwe blogs<small>Wekelijks voor dit platform</small></span></li><li><b>02</b><span>SEO & inhoud<small>De basis blijven verbeteren</small></span></li><li><b>03</b><span>Hosting & techniek<small>Een verzorgd platform</small></span></li></ol></div>}
      </> : kind==="shop" ? <div className="commerce-route"><div className="commerce-route-title"><span>De route van je klant</span><strong>Kiezen. Bestellen.<br /><em>Goed geregeld.</em></strong></div><ol><li><b>01</b><div><strong>Het juiste product</strong><span>Assortiment, varianten en voorraad</span></div><Arrow /></li><li><b>02</b><div><strong>Een duidelijke bestelling</strong><span>Winkelmand, bezorgen en betalen</span></div><Arrow /></li><li><b>03</b><div><strong>Klaar voor verwerking</strong><span>Bevestiging en ordergegevens</span></div><Arrow /></li></ol></div> : <>
        <div className="work-screen"><div className="work-screen-bar" aria-hidden="true"><span>{kind==="tools"?"beurswatcher":"beurswijzer"}</span><i>↗</i></div><img src={`${image}-${small}.webp`} srcSet={`${image}-${small}.webp ${small}w, ${image.endsWith("home-sharp") ? `${image}-1100.webp 1100w, ` : ""}${large} ${dimensions[0]}w`} sizes={sizes} width={dimensions[0]} height={dimensions[1]} alt={editorial?"Beurswijzer-artikelen over maandinleg, een buffer en je jaarbudget":kind==="budget"?"De Beurswijzer-budgetplanner met inkomsten, uitgaven, spaardoelen en beschikbare maandruimte":kind==="tools"?"Beurswatcher-calculator met startkapitaal, maandinleg en een rendementsgrafiek":"De groene Beurswijzer-homepage met financiële uitleg en rekentools"} loading={priority?"eager":"lazy"} fetchPriority={priority?"high":"auto"} /></div>
        {kind==="design" && <div className="work-phone design-phone"><ProjectPhoneScreen project="beurswijzer"/></div>}
        {kind==="brand" && <div className="work-palette"><span>Een herkenbare basis</span><div role="img" aria-label="Donkergroen, frisgroen en gebroken wit"><i/><i/><i/></div><b>Van merk naar interface.</b></div>}
        {kind==="editorial" && <div className="work-extract"><span>Van vraag naar artikel</span><strong>Hoeveel buffer geeft<br />je eigenlijk rust?</strong><div>Een onderwerp dat je bezoeker herkent <Arrow /></div></div>}
        {kind==="social" && <div className="work-channels"><span>Dezelfde basis. Een passende vorm.</span><div><b>Instagram</b><b>Facebook</b><b>LinkedIn</b></div></div>}
        {kind==="tools" && <div className="work-equation"><span><b>01</b> Jouw invoer</span><i>→</i><span><b>02</b> Vaste rekenregels</span><i>→</i><span><b>03</b> Inzicht</span></div>}
      </>}
    </div>
    <figcaption><span>{caption[0]}</span><strong>{caption[1]}</strong><p>{caption[2]}</p></figcaption>
  </figure>;
}

