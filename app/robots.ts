import { site } from "./site-data";
import { canIndexRequest } from './seo';
export default async function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    ...(await canIndexRequest() ? { sitemap: site.origin + "/sitemap.xml" } : {}),
  };
}
