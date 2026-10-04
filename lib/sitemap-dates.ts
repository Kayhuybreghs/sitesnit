import type { MetadataRoute } from 'next';

type RouteDates = Readonly<Partial<Record<`/${string}`, string>>>;

// Significant page changes in the 2026-10-04 release: C01–C04 and B01/G02.
// Unknown historical dates and minor guide label edits are deliberately omitted.
// Update only the affected entry after a meaningful page change.
export const significantPageDates: RouteDates = {
  '/diensten': '2026-10-04',
  '/contact': '2026-10-04',
  '/kosten': '2026-10-04',
  '/diensten/webdesign': '2026-10-04',
  '/diensten/webdesign/pakketten': '2026-10-04',
};

function validDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function sitemapEntries(
  routes: readonly { path: string }[],
  origin: string,
  dates: RouteDates = significantPageDates,
  // The clock rejects future dates; it never supplies a missing lastmod.
  today = new Date().toISOString().slice(0, 10),
): MetadataRoute.Sitemap {
  if (!validDay(today)) throw new Error('Invalid sitemap validation date');
  const paths = new Set(routes.map(route => route.path));
  for (const [route, date] of Object.entries(dates)) {
    if (!paths.has(route)) throw new Error(`Unknown sitemap date route: ${route}`);
    if (!date || !validDay(date) || date > today) throw new Error(`Invalid or future sitemap date: ${route}`);
  }
  return routes.map(({ path }) => {
    const date = dates[path as `/${string}`];
    return { url: origin + path, ...(date ? { lastModified: date } : {}) };
  });
}
