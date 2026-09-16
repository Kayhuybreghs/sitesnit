import { site } from "./site-data";
import { canIndexRequest } from './seo';
import { releaseRoutes } from '../lib/route-catalog';
export default async function sitemap() {
  if (!await canIndexRequest()) return [];
  return releaseRoutes.map((path) => ({
    url: site.origin + path,
  }));
}
