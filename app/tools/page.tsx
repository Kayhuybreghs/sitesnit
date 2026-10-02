import { InlineArrow } from '../inline-arrow';
import { withPageMetadata, BreadcrumbData } from '../seo';
import type { Metadata } from "next";
import { Eyebrow, Arrow } from "../ui";
import { toolCatalog } from "./tool-catalog";
import { toolGroups, toolInputs } from './tool-groups';
import './tool-directory.css';
import './tool-directory-refinements.css';
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
            <b><InlineArrow /></b>
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
          <p>Zeven hulpmiddelen, ieder met een eigen taak.</p>
        </div>
        <nav className="tool-category-links" aria-label="Kies je vraag">{toolGroups.map(group => <a key={group.id} href={`#${group.id}`}>{group.title}<Arrow /></a>)}</nav>
        {toolGroups.map((group, index) => <section className="tool-category" id={group.id} key={group.id}>
          <header><span className="hub-tool-label">0{index + 1} / Jouw vertrekpunt</span><h2>{group.title}</h2><p>{group.intro}</p></header>
          <div className="tool-category-cards">{group.slugs.map(slug => {
            const tool = toolCatalog.find(item => item.slug === slug)!;
            const detail = toolInputs[slug];
            return <article className={`tool-entry hub-${tool.tone}`} key={slug}>
              <span className="hub-tool-label">{tool.label}</span><h3><a href={tool.href}>{tool.name}</a></h3><p>{tool.description}</p>
              <dl><div><dt>Dit neem je mee</dt><dd>{detail.input}</dd></div><div><dt>Dit krijg je terug</dt><dd>{detail.output}</dd></div></dl>
              <a className="button" href={tool.href}>{tool.action}<Arrow /></a>
              <small>Gratis, zonder account. Je kiest zelf of je de uitkomst met Sitesnit bespreekt.</small>
            </article>;
          })}</div>
        </section>)}
      </section>
      <section className="wrap tool-designer-feature" id="ontwerp-je-website">
        <div className="designer-feature-copy"><Eyebrow>05 / Ontwerp je website</Eyebrow><h2>Niet alleen bedenken.<br/><em>Ook alvast zien.</em></h2><p>Hoe kan jouw website eruitzien? Vertel wat je doet, kies een stijl en geef je idee kleur. Je krijgt een bewerkbaar voorbeeld met jouw inhoud.</p><ol><li><b>01</b><span>Zes keuzes over jouw bedrijf</span></li><li><b>02</b><span>Jouw voorbeeld bekijken en aanpassen</span></li><li><b>03</b><span>Bespreken hoe Sitesnit het kan bouwen</span></li></ol><a className="button" href="/tools/website-ontwerp-tool">Ontwerp jouw websitevoorbeeld <Arrow/></a><p className="small">Geen account nodig. Je kiest zelf of je je ontwerp meestuurt.</p></div>
        <div className="designer-feature-art" aria-hidden="true"><span className="feature-art-tag">Voorbeeldrichting</span><div className="feature-palette"><i/><i/><i/><b>Aa</b></div><div className="feature-browser"><div><span>jouw bedrijf</span><b><InlineArrow /></b></div><p>Jouw verhaal.<br/><strong>Een eigen gezicht.</strong></p><span className="feature-fake-button">Maak kennis <InlineArrow /></span><div className="feature-browser-art"><i/><b>J</b></div><footer>Je aanbod <span>Je werk</span> Contact</footer></div><div className="feature-art-caption"><span>Jouw keuzes</span><b>↓</b><span>Ons vertrekpunt</span></div></div>
      </section>
      <div className="wrap tool-workbench hub-contact-wrap"><ToolContact alwaysOpen summary="" id="bespreek-je-vraag" title="Wat wil jij met je website bereiken?" text="Een nieuwe website, een verbetering of een slimmer proces? Vertel kort wat je wilt bespreken. Bellen kan optioneel op afspraak: op werkdagen van 18:00 tot 21:30 of in het weekend." formTitle="Bespreek je plannen met Sitesnit" /></div>
    </div>
  );
}
