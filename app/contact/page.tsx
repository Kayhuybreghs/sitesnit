import { withPageMetadata, BreadcrumbData } from '../seo';
import { Eyebrow } from "../ui";
import { BusinessIdentity } from '../business-notes';
import ContactForm from "./contact-form";
import type { Metadata } from "next";
export const metadata:Metadata=withPageMetadata({alternates:{canonical:"/contact"}}, '/contact');
export default function Contact(){return <section className="wrap contact-layout contact-refined">
  <BreadcrumbData items={[{name:'Home',path:'/'},{name:'Contact',path:'/contact'}]} />
  <div className="contact-copy"><Eyebrow>Een goed begin / Laten we praten</Eyebrow><h1>Vertel je idee.<br /><em>Ik denk mee.</em></h1><p>Vertel kort wat je wilt laten maken of verbeteren. Een uitgewerkt plan of bestaande website is niet nodig. Ik reageer per e-mail; bellen kan op afspraak. Je verstuurt een aanvraag, geen bestelling.</p><a className="text-link" href="#contactformulier">Stuur je vraag</a>
    <ol className="contact-next-steps"><li><span>01</span><div><b>Vertel wat je nodig hebt</b><p>Je plannen, je huidige website of iets dat beter kan.</p></div></li><li><span>02</span><div><b>Reactie per e-mail</b><p>Ik lees je vraag en stem de volgende stap met je af. Bellen kan op afspraak.</p></div></li><li><span>03</span><div><b>Een passend voorstel</b><p>Met een duidelijke aanpak, werkzaamheden en investering.</p></div></li></ol>
    <div className="contact-options"><div><h2>Sitesnit in Baarlo</h2><BusinessIdentity showAddress={false} /></div></div>
    <p className="contact-region">Sitesnit werkt vanuit Baarlo voor ondernemers in Limburg. Bellen kan op afspraak: op werkdagen tussen 18.00 en 21.30 uur of in het weekend. Een dag en tijd doorgeven is optioneel. We bevestigen de afspraak samen.</p>
  </div><ContactForm anchorId="contactformulier" />
</section>;}
import "../expansion.css";
