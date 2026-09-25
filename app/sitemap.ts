import { site } from "./site-data";
import { canIndexRequest } from './seo';
import { routeCatalog } from '../lib/route-catalog';
export default async function sitemap() {
  if (!await canIndexRequest()) return [];
  return routeCatalog.map(({path}) => ({
    url: site.origin + path,
  }));
}
