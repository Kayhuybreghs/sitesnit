import {auditGuides} from './seo-audit/guides';
import {speedGuides} from './speed-guides';
import { grossPrice } from './business';
import { services } from '../app/diensten/service-data';
import { clientCases } from '../app/portfolio-data';
import { site } from '../app/site-data';
import { guides } from './guides';
import { publicServicePages } from './public-service-pages';

export const seoFacts = { origin: site.origin, base: site.base, packages: site.packages.map(p => ({...p, netPrice:p.price, price:grossPrice(p.price)})) };

export const releaseRoutes = [
  '/tools/snelheidstest',...speedGuides.map(g=>`/tools/snelheidstest/${g.slug}`),
  '/tools/seo-audit',...auditGuides.map(g=>`/tools/seo-audit/${g.slug}`),
  '/', '/sitemap', '/diensten', ...services.map(s => `/diensten/${s.slug}`), ...Object.keys(publicServicePages),
  '/diensten/webdesign/pakketten', '/projecten', ...clientCases.map(p => `/projecten/${p.slug}`),
  '/kosten', '/webdesign-venlo', '/seo-venlo', '/over-sitesnit', '/contact', '/tools/website-check', '/tools/website-kosten-berekenen',
  '/tools', '/tools/website-ontwerp-tool', '/tools/website-offerte-vergelijken', '/tools/automatiseringsplan', '/privacy', '/cookies', '/algemene-voorwaarden',
  ...guides.map(guide => `/${guide.slug}`),
];
export const routeCatalog = releaseRoutes.map(path => ({
  path,
  releaseCandidate: releaseRoutes.includes(path),
  intent: path === '/' ? 'Webdesign Limburg / merk en aanbod' : path === '/webdesign-venlo' ? 'Website laten maken Venlo / regionale keuze' :
    path.startsWith('/diensten/') ? 'Dienst, aanpak en mogelijkheden verkennen' : path.startsWith('/projecten/') ? 'Werk en ontwerpkeuzes beoordelen' :
    path === '/kosten' ? 'Pakketprijzen vergelijken' : path.includes('check') || path.startsWith('/tools') ? 'Zelf verkennen en uitkomst bespreken' :
    path === '/contact' ? 'Aanvraag of belafspraak' : path === '/privacy' ? 'Verwerking persoonsgegevens' : 'Oriënteren',
}));
