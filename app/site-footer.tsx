import { CookieSettingsButton } from './cookie-consent';
import { site } from './site-data';
import { SocialIcon } from './social-icon';
import { BrandLogo } from './brand-logo';
import { business } from '../lib/business';

export function SiteFooter() {
  return <footer className="studio-footer">
    <div className="wrap">

      <div className="footer-directory">
        <div><a className="logo" href="/" aria-label="Sitesnit home"><BrandLogo light loading="lazy" /></a><p>Een eigen gezicht online.<br />Webdesign, SEO & AI in Limburg.</p><div className="footer-contact-details"><a href={`mailto:${site.email}`}>{site.email}</a><a href={`tel:${business.phone}`}>{business.phoneDisplay}</a><small>Bellen alleen op afspraak</small><div className="footer-social-links"><a href={business.whatsapp}><SocialIcon name="whatsapp"/> WhatsApp</a><a href={business.linkedin}><SocialIcon name="linkedin"/> LinkedIn</a></div></div></div>
        <nav aria-label="Diensten in de footer"><h2>Wat we doen</h2><a href="/diensten/webdesign">Webdesign & merk</a><a href="/diensten/webshops">Webshops</a><a href="/diensten/apps">Apps voor iPhone & Android</a><a href="/diensten/webapps">Webapps & klantportalen</a><a href="/diensten/seo">SEO & vindbaarheid</a><a href="/diensten/ai-automatisering">AI & automatisering</a><a href="/diensten">Alle diensten</a></nav>
        <nav aria-label="Ontdek Sitesnit"><h2>Blijven groeien</h2><a href="/diensten/content">Content & blogs</a><a href="/diensten/social-media">Social media</a><a href="/diensten/onderhoud-hosting">Onderhoud & hosting</a><a href="/diensten/website-monitoring">Website-monitoring · Sitesnit Hub</a><a href="/projecten">Projecten & cases</a><a href="/over-sitesnit">Over Sitesnit</a></nav>
        <nav aria-label="Jouw volgende stap"><h2>Jouw volgende stap</h2><a href="/contact">Bespreek je plannen</a><a href="/kosten">Kosten & pakketten</a><a href="/tools">Alle tools & checks</a><a href="/tools/website-kosten-berekenen">Prijscheck & websiteplan</a><a href="/tools/website-check">Websitecheck</a><a href="/hub/login">Inloggen op Sitesnit Hub</a></nav>
      </div>
      <div className="footer-signoff"><span>© {new Date().getFullYear()} Sitesnit</span><span>Met aandacht. Tot in de laatste klik.</span><a href="/privacy">Privacy</a><a href="/algemene-voorwaarden">Voorwaarden</a><a href="/cookies">Cookies</a><a href="/sitemap">Websiteoverzicht</a><CookieSettingsButton /></div>
    </div>
  </footer>;
}
