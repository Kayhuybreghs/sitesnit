import {auditCapabilities} from '../../lib/seo-audit/capabilities';
export const toolCatalog = [
  {slug:"seo-audit",href:"/tools/seo-audit",name:"SEO-audit",label:"Techniek per pagina",description:`Laat maximaal ${auditCapabilities.maxPages} pagina’s doorlopen op noindex, kapotte links en metadata. Bekijk bewijs en hersteladvies zonder vragenlijst.`,action:"Start je SEO-audit",type:"Beoordelen",tone:"blue",number:"06"},
  {
    slug: "ontwerp-je-website",
    href: "/tools/website-ontwerp-tool",
    name: "Ontwerp je website",
    label: "Jouw voorbeeld, ons vertrekpunt",
    description:
      "Beantwoord zes vragen en bekijk je eigen ontwerpvoorbeeld. Pas het aan en bespreek met Sitesnit hoe we jouw richting uitwerken tot een website.",
    action: "Maak jouw voorbeeld",
    type: "Ontwerpen",
    tone: "blue",
    number: "01",
  },
  {
    slug: "websitecheck",
    href: "/tools/website-check",
    name: "Websitecheck",
    label: "Een bestaande website",
    description:
      "Combineer 15 inhoudelijke vragen met een echte mobiele Lighthouse-analyse. Ontdek je belangrijkste verbeterpunten.",
    action: "Check je website",
    type: "Beoordelen",
    tone: "green",
    number: "02",
  },
  {
    slug: "prijscheck",
    href: "/tools/website-kosten-berekenen",
    name: "Prijscheck & websiteplan",
    label: "Omvang & investering",
    description:
      "Ontdek welk websitepakket past en neem een overzichtelijk plan mee naar het gesprek.",
    action: "Verken jouw prijs",
    type: "Kiezen",
    tone: "peach",
    number: "03",
  },
  {
    slug: "offertevergelijker",
    href: "/tools/website-offerte-vergelijken",
    name: "Website-offertes vergelijken",
    label: "Van bedragen naar duidelijkheid",
    description:
      "Leg de inhoud en bekende kosten van twee of drie voorstellen naast elkaar. Zie welke vragen nog openstaan.",
    action: "Vergelijk je voorstellen",
    type: "Kiezen",
    tone: "green",
    number: "04",
  },
  {
    slug: "automatiseringsplan",
    href: "/tools/automatiseringsplan",
    name: "Jouw automatiseringsplan",
    label: "Minder terugkerend handwerk",
    description:
      "Breng een taak in kaart. Krijg een concreet procesvoorstel en inzicht in de tijd die je er nu aan besteedt.",
    action: "Maak je procesplan",
    type: "Verbeteren",
    tone: "peach",
    number: "05",
  },
] as const;
