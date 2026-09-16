import { grossPrice } from './business';
import { services } from '../app/diensten/service-data';
import { clientCases } from '../app/portfolio-data';
import { projects, site } from '../app/site-data';

export const seoFacts = { origin: site.origin, base: site.base, packages: site.packages.map(p => ({...p, netPrice:p.price, price:grossPrice(p.price)})) };

export const releaseRoutes = [
  '/', '/diensten', ...services.map(s => `/diensten/${s.slug}`),
  '/diensten/webdesign/pakketten', '/projecten', ...clientCases.map(p => `/projecten/${p.slug}`),
  '/kosten', '/webdesign-venlo', '/over-sitesnit', '/contact', '/websitecheck', '/prijscheck',
  '/tools', '/tools/ontwerp-je-website', '/tools/offertevergelijker', '/tools/automatiseringsplan', '/privacy', '/cookies', '/algemene-voorwaarden',
];
export const conceptRoutes = projects.map(p => `/projecten/${p.slug}`);
export const routeCatalog = [...releaseRoutes, ...conceptRoutes].map(path => ({
  path,
  releaseCandidate: releaseRoutes.includes(path),
  intent: path === '/' ? 'Webdesign Limburg / merk en aanbod' : path === '/webdesign-venlo' ? 'Website laten maken Venlo / regionale keuze' :
    path.startsWith('/diensten/') ? 'Dienst, aanpak en mogelijkheden verkennen' : path.startsWith('/projecten/') ? 'Werk en ontwerpkeuzes beoordelen' :
    path === '/kosten' ? 'Pakketprijzen vergelijken' : path.includes('check') || path.startsWith('/tools') ? 'Zelf verkennen en uitkomst bespreken' :
    path === '/contact' ? 'Aanvraag of belafspraak' : path === '/privacy' ? 'Verwerking persoonsgegevens' : 'Oriënteren',
}));
