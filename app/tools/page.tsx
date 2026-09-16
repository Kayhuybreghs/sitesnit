import { withPageMetadata, BreadcrumbData } from '../seo';
import type { Metadata } from "next";
import { Eyebrow, Arrow } from "../ui";
import { toolCatalog } from "./tool-catalog";
import { ToolContact } from './tool-components';
import "./workbench.css";
export const metadata: Metadata = withPageMetadata({alternates: { canonical: "/tools" }}, '/tools');
export default function ToolsPage() {
  return (
    <div className="tool-hub">
      <BreadcrumbData items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'}]} />
      <section className="wrap tool-hub-intro">
        <div>
          <Eyebrow>Sitesnit / Tools & checks</Eyebrow>
          <h1>
            Van een vraag.
            <br />
            <em>Naar een helder plan.</em>
          </h1>
          <p>
            Een idee voor een nieuwe website? Twijfel over je huidige site of
            een offerte? Kies waar je mee verder wilt. Je resultaat is direct
            voor jou, zonder eerst contactgegevens in te vullen.
          </p>
          <a className="text-link" href="#alle-tools">
            Vind jouw vertrekpunt <Arrow />
          </a>
        </div>
        <div className="tool-hub-art" aria-hidden="true">
          <div className="hub-art-toolbar">
            <span>Jouw volgende stap</span>
            <b>↗</b>
          </div>
          <strong>
            Even proberen.
            <br />
            Veel duidelijker.
          </strong>
          <div className="hub-art-steps">
            <span>Je idee</span>
            <i>→</i>
            <b>Jouw plan</b>
          </div>
          <div className="hub-art-paper">
            <span>Aa</span>
            <div>
              <i />
              <i />
              <i />
            </div>
            <b>Er zit meer in je website.</b>
          </div>
        </div>
      </section>
      <section className="wrap tool-hub-list" id="alle-tools">
        <div className="hub-section-title">
          <h2>Waar wil je beginnen?</h2>
          <p>Vijf hulpmiddelen, ieder met een eigen taak.</p>
        </div>
        {toolCatalog.filter(tool=>tool.slug!=='ontwerp-je-website').map((tool,index) => (
          <article className={`hub-tool hub-${tool.tone}`} key={tool.slug}>
            <span className="hub-tool-number">0{index+1}</span>
            <div>
              <span className="hub-tool-label">
                {tool.type} / {tool.label}
              </span>
              <h3>{tool.name}</h3>
              <p>{tool.description}</p>
            </div>
            <a className="button" href={tool.href}>
              {tool.action}
              <Arrow />
            </a>
          </article>
        ))}
      </section>
      <section className="wrap tool-designer-feature" id="ontwerp-je-website">
        <div className="designer-feature-copy"><Eyebrow>05 / Ontwerp je website</Eyebrow><h2>Niet alleen bedenken.<br/><em>Ook alvast zien.</em></h2><p>Hoe kan jouw website eruitzien? Vertel wat je doet, kies een stijl en geef je idee kleur. Je krijgt een bewerkbaar voorbeeld met jouw inhoud.</p><ol><li><b>01</b><span>Zes keuzes over jouw bedrijf</span></li><li><b>02</b><span>Jouw voorbeeld bekijken en aanpassen</span></li><li><b>03</b><span>Bespreken hoe Sitesnit het kan bouwen</span></li></ol><a className="button" href="/tools/ontwerp-je-website">Ontwerp jouw websitevoorbeeld <Arrow/></a><p className="small">Geen account nodig. Je kiest zelf of je je ontwerp meestuurt.</p></div>
        <div className="designer-feature-art" aria-hidden="true"><span className="feature-art-tag">Voorbeeldrichting</span><div className="feature-palette"><i/><i/><i/><b>Aa</b></div><div className="feature-browser"><div><span>jouw bedrijf</span><b>↗</b></div><p>Jouw verhaal.<br/><strong>Een eigen gezicht.</strong></p><span className="feature-fake-button">Maak kennis ↗</span><div className="feature-browser-art"><i/><b>J</b></div><footer>Je aanbod <span>Je werk</span> Contact</footer></div><div className="feature-art-caption"><span>Jouw keuzes</span><b>↓</b><span>Ons vertrekpunt</span></div></div>
      </section>
      <div className="wrap tool-workbench hub-contact-wrap"><ToolContact alwaysOpen summary="" id="bespreek-je-vraag" title="Wat wil jij met je website bereiken?" text="Een nieuwe website, een verbetering of een slimmer proces? Vertel kort wat je wilt bespreken. Bellen kan optioneel op afspraak: op werkdagen van 18:00 tot 21:30 of in het weekend." formTitle="Bespreek je plannen met Sitesnit" /></div>
    </div>
  );
}
