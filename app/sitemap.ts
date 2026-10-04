import { site } from "./site-data";
import { canIndexRequest } from './seo';
import { routeCatalog } from '../lib/route-catalog';
import { sitemapEntries } from '../lib/sitemap-dates';
export default async function sitemap() {
  if (!await canIndexRequest()) return [];
  return sitemapEntries(routeCatalog, site.origin);
}
