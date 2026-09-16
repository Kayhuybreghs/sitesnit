import { withPageMetadata, BreadcrumbData } from '../seo';
import { Eyebrow, Arrow } from "../ui";
import { BusinessIdentity } from '../business-notes';
import ContactForm from "./contact-form";
import type { Metadata } from "next";
export const metadata:Metadata=withPageMetadata({alternates:{canonical:"/contact"}}, '/contact');
export default function Contact(){return <section className="wrap contact-layout contact-refined">
  <BreadcrumbData items={[{name:'Home',path:'/'},{name:'Contact',path:'/contact'}]} />
  <div className="contact-copy"><Eyebrow>Een goed begin / Laten we praten</Eyebrow><h1>Vertel je idee.<br /><em>We denken mee.</em></h1><p>Een nieuwe website, een webshop, regelmatige content of minder handwerk? Vertel waar je naartoe wilt. Je hoeft nog geen compleet plan te hebben.</p>
    <ol className="contact-next-steps"><li><span>01</span><div><b>Vertel wat je nodig hebt</b><p>Je plannen, je huidige website of iets dat beter kan.</p></div></li><li><span>02</span><div><b>We stemmen een gesprek af</b><p>Per e-mail maken we het vervolg concreet. Bellen kan op afspraak.</p></div></li><li><span>03</span><div><b>Een passend voorstel</b><p>Met een duidelijke aanpak, werkzaamheden en investering.</p></div></li></ol>
    <div className="contact-options"><div><h2>Sitesnit in Baarlo</h2><BusinessIdentity /></div></div>
    <p className="contact-region">Sitesnit werkt vanuit Baarlo voor ondernemers in Limburg. Bellen kan op afspraak: op werkdagen tussen 18.00 en 21.30 uur of in het weekend. Een dag en tijd doorgeven is optioneel; we bevestigen de afspraak samen.</p><div className="contact-tools"><p>Eerst zelf je mogelijkheden verkennen?</p><a className="text-link" href="/websitecheck">Check je website <Arrow /></a><a className="text-link" href="/prijscheck">Doe de prijscheck <Arrow /></a></div>
  </div><ContactForm />
</section>;}
import "../expansion.css";
