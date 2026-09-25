import {auditGuides} from './seo-audit/guides';
// Reviewed static sharing assets. See scripts/render-final-og.cjs for final legal and price images.
import { guides } from './guides';
export const socialImages: Record<string, { url: string; width: number; height: number; alt: string }> = {
  '/tools/seo-audit':{url:'/og/seo-audit.png',width:1200,height:630,alt:'Sitesnit SEO-audit: van URL naar concrete verbeterpunten'},
  ...Object.fromEntries(auditGuides.map(g=>[`/tools/seo-audit/${g.slug}`,{url:`/og/audit-${g.slug}.png`,width:1200,height:630,alt:`Sitesnit — ${g.title}`} ])),
  ...Object.fromEntries(guides.map(guide=>[`/${guide.slug}`,{url:`/og/guides/${guide.slug}.png`,width:1200,height:630,alt:`Sitesnit — ${guide.title}`} ])),
  '/seo-venlo': {url:'/og/guides/seo-venlo.png',width:1200,height:630,alt:'SEO voor bedrijven in Venlo: vanuit Baarlo gericht werken aan inhoud en techniek'},
  '/diensten/seo-onderhoud': {url:'/og/guides/seo-onderhoud.png',width:1200,height:630,alt:'SEO-onderhoud: prioriteiten kiezen, verbeteringen uitvoeren en opnieuw controleren'},
  '/diensten/website-monitoring': {url:'/og/website-monitoring.png',width:1200,height:630,alt:'Sitesnit Hub: bezoekers, Google en werkzaamheden overzichtelijk bij elkaar, met bron en meetmoment'},
  "/diensten": {
    "url": "/og/diensten.png",
    "width": 1200,
    "height": 630,
    "alt": "Diensten: webdesign, vindbaarheid en automatisering in één overzicht"
  },
  "/kosten": {
    "url": "/og/kosten.png",
    "width": 1200,
    "height": 630,
    "alt": "Wat kost jouw website? Sitesnit maakt eenmalige bouw en hosting voor minimaal twaalf maanden apart inzichtelijk."
  },
  "/contact": {
    "url": "/og/contact.png",
    "width": 1200,
    "height": 630,
    "alt": "Een belafspraak met Sitesnit, op werkdagen van 18:00 tot 21:30 of in het weekend"
  },
  "/over-sitesnit": {
    "url": "/og/over-sitesnit.png",
    "width": 1200,
    "height": 630,
    "alt": "Kay, de maker achter Sitesnit in Baarlo, met mascotte Nova — jouw verhaal, een eigen plek online"
  },
  "/projecten": {
    "url": "/og/projecten.png",
    "width": 1200,
    "height": 630,
    "alt": "Websites Beurswijzer en Beurswatcher, ontworpen en gebouwd door Sitesnit"
  },
  "/tools": {
    "url": "/og/tools.png",
    "width": 1200,
    "height": 630,
    "alt": "Sitesnit-tools: verbeterpunten voor je website, een prijsindicatie voor bouw en hosting en een eerste ontwerp."
  },
  "/webdesign-venlo": {
    "url": "/og/webdesign-venlo.png",
    "width": 1200,
    "height": 630,
    "alt": "Sitesnit: webdesign voor ondernemers in Venlo, vanuit Baarlo"
  },
  "/diensten/webdesign": {
    "url": "/og/webdesign.png",
    "width": 1200,
    "height": 630,
    "alt": "Een website met je eigen gezicht, op desktop en mobiel"
  },
  "/diensten/webshops": {
    "url": "/og/webshops.png",
    "width": 1200,
    "height": 630,
    "alt": "Voorbeeld van een webshop met overzichtelijke productpresentatie"
  },
  "/diensten/branding": {
    "url": "/og/branding.png",
    "width": 1200,
    "height": 630,
    "alt": "Merkontwerp: karaktervolle typografie en samenhangende kleuren"
  },
  "/diensten/seo": {
    "url": "/og/seo.png",
    "width": 1200,
    "height": 630,
    "alt": "Van een zoekvraag naar een passende pagina en contact"
  },
  "/diensten/seo-optimalisatie": {
    "url": "/og/seo-optimalisatie.png",
    "width": 1200,
    "height": 630,
    "alt": "Voorbeeld van een duidelijke paginatitel en vindbare inhoud"
  },
  "/diensten/content": {
    "url": "/og/content.png",
    "width": 1200,
    "height": 630,
    "alt": "Redactionele inhoud en copywriting voor je website"
  },
  "/diensten/social-media": {
    "url": "/og/social-media.png",
    "width": 1200,
    "height": 630,
    "alt": "Voorbeeld van samenhangende socialmediaberichten"
  },
  "/diensten/onderhoud-hosting": {
    "url": "/og/onderhoud-hosting.png",
    "width": 1200,
    "height": 630,
    "alt": "Hosting en onderhoud: website en beheer in samenhang"
  },
  "/diensten/ai-automatisering": {
    "url": "/og/ai-automatisering.png",
    "width": 1200,
    "height": 630,
    "alt": "Voorbeeldproces: van binnenkomend document naar gecontroleerd factuurconcept"
  },
  "/diensten/ai-koppelingen": {
    "url": "/og/ai-koppelingen.png",
    "width": 1200,
    "height": 630,
    "alt": "Softwarekoppelingen verbinden informatie tussen je systemen"
  },
  "/diensten/formulieren-rekentools": {
    "url": "/og/formulieren-rekentools.png",
    "width": 1200,
    "height": 630,
    "alt": "Van invoer naar inzicht met een formulier of rekentool"
  },
  "/tools/website-check": {
    "url": "/og/websitecheck.png",
    "width": 1200,
    "height": 630,
    "alt": "Websitecheck: 15 inhoudelijke vragen en een mobiele Lighthouse-analyse"
  },
  "/tools/website-kosten-berekenen": {
    "url": "/og/prijscheck.png",
    "width": 1200,
    "height": 630,
    "alt": "Sitesnit-prijscheck: vijftien vragen leiden naar een passende route, met bouw en hosting apart in het voorbeeldresultaat."
  },
  "/tools/website-ontwerp-tool": {
    "url": "/og/ontwerp-je-website.png",
    "width": 1200,
    "height": 630,
    "alt": "Een eigen websitevoorbeeld samenstellen met inhoud, stijl en kleuren"
  },
  "/tools/website-offerte-vergelijken": {
    "url": "/og/offertevergelijker.png",
    "width": 1200,
    "height": 630,
    "alt": "Websiteoffertes vergelijken op werkzaamheden en totale bekende kosten"
  },
  "/tools/automatiseringsplan": {
    "url": "/og/automatiseringsplan.png",
    "width": 1200,
    "height": 630,
    "alt": "Je herhaalwerk in kaart brengen en een eerste proces kiezen"
  },
  "/privacy": {
    "url": "/og/privacy.png",
    "width": 1200,
    "height": 630,
    "alt": "Sitesnit: zorgvuldig omgaan met je gegevens"
  },
  "/diensten/webdesign/pakketten": {
    "url": "/og/pakketten.png",
    "width": 1200,
    "height": 630,
    "alt": "Onepager, vijf pagina’s en maatwerk: de websitepakketten uitgelegd"
  },
  "/": {
    "url": "/og.png",
    "width": 1200,
    "height": 630,
    "alt": "Sitesnit — websites met een eigen gezicht. Webdesign, SEO en AI vanuit Baarlo."
  },
  "/projecten/beurswijzer": {
    "url": "/og/beurswijzer.png",
    "width": 1200,
    "height": 630,
    "alt": "Beurswijzer-case: een eigen groene compositie rond maandruimte en toekomst"
  },
  "/projecten/beurswatcher": {
    "url": "/og/beurswatcher.png",
    "width": 1200,
    "height": 630,
    "alt": "Beurswatcher-case: een blauwgele compositie rond inleg, looptijd en scenario’s"
  },
  "/algemene-voorwaarden": {
    "url": "/og/algemene-voorwaarden.png",
    "width": 1200,
    "height": 630,
    "alt": "Heldere afspraken bij Sitesnit: 60% aanbetaling bij de start en 40% bij afronding van het project."
  },
  "/cookies": {
    "url": "/og/cookies.png",
    "width": 1200,
    "height": 630,
    "alt": "Jouw keuze: Sitesnit-cookie-instellingen met een voorbeeld van functionele opslag en optionele statistieken."
  },
  "/diensten/apps": {
    "url": "/og/apps.png",
    "width": 1200,
    "height": 630,
    "alt": "Apps door Sitesnit: twee scherpe telefooninterfaces voor een agenda en aanvraag, als ontwerpvoorbeeld voor iPhone en Android."
  },
  "/diensten/webapps": {
    "url": "/og/webapps.png",
    "width": 1200,
    "height": 630,
    "alt": "Webapps door Sitesnit: een schematisch portaal met inloggen, gebruikersrollen en gedeelde projecttaken, duidelijk gelabeld als voorbeeld."
  }
};
