import { CookieSettingsButton } from './cookie-consent';
import { site } from './site-data';
import { Arrow } from './ui';

export function SiteFooter() {
  return <footer className="studio-footer">
    <div className="wrap">
      <div className="footer-invitation"><p>Een goed verhaal.<br /><strong>Begint bij jou.</strong></p><a className="button" href="/contact">Neem contact op <Arrow /></a></div>
      <div className="footer-directory">
        <div><a className="logo" href="/" aria-label="Sitesnit home">sitesnit<span className="brand-mark" aria-hidden="true" /></a><p>Een eigen gezicht online.<br />Webdesign, SEO & AI in Limburg.</p>{site.email ? <a className="footer-email" href={`mailto:${site.email}`}>{site.email}</a> : <span>E-mail: — · Telefoon: —</span>}</div>
        <nav aria-label="Diensten in de footer"><h2>Wat we doen</h2><a href="/diensten/webdesign">Webdesign & merk</a><a href="/diensten/webshops">Webshops</a><a href="/diensten/apps">Apps voor iPhone & Android</a><a href="/diensten/webapps">Webapps & klantportalen</a><a href="/diensten/seo">SEO & vindbaarheid</a><a href="/diensten/ai-automatisering">AI & automatisering</a><a href="/diensten">Alle diensten</a></nav>
        <nav aria-label="Ontdek Sitesnit"><h2>Blijven groeien</h2><a href="/diensten/content">Content & blogs</a><a href="/diensten/social-media">Social media</a><a href="/diensten/onderhoud-hosting">Onderhoud & hosting</a><a href="/projecten">Projecten & cases</a><a href="/over-sitesnit">Over Sitesnit</a></nav>
        <nav aria-label="Jouw volgende stap"><h2>Jouw volgende stap</h2><a href="/contact">Bespreek je plannen</a><a href="/kosten">Kosten & pakketten</a><a href="/tools">Alle tools & checks</a><a href="/prijscheck">Prijscheck & websiteplan</a><a href="/websitecheck">Websitecheck</a></nav>
      </div>
      <div className="footer-signoff"><span>© {new Date().getFullYear()} Sitesnit</span><span>Met aandacht. Tot in de laatste klik.</span><a href="/privacy">Privacy</a><a href="/algemene-voorwaarden">Voorwaarden</a><a href="/cookies">Cookies</a><CookieSettingsButton /></div>
    </div>
  </footer>;
}
