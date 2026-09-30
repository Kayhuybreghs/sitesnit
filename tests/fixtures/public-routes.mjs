// Deliberately independent of the site's route/SEO catalog and live output.
export const fixtureOrigin = 'https://www.sitesnit.nl';
export function pageFixture({path = '/', canonical = fixtureOrigin + path, body = '', robots = 'index, follow', extraHead = ''} = {}) {
  return '<!doctype html><html lang="nl"><head><title>Fixture page</title>' +
    '<meta name="description" content="Independent fixture description">' +
    `<meta name="robots" content="${robots}"><link rel="canonical" href="${canonical}">` +
    '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>' +
    extraHead + `</head><body><main><h1>Fixture heading</h1><p>Complete fixture content.</p>${body}</main></body></html>`;
}
export function htmlResponse(body, {status = 200, headers = {}} = {}) {
  return {status, body, headers: {'content-type': 'text/html; charset=utf-8', 'content-security-policy': "script-src 'nonce-fixture'", ...headers}};
}
export const missingResponse = () => htmlResponse(pageFixture({path: '/missing'}), {status: 404});
export function fixtureRequest(responses, requested = []) {
  return async path => { requested.push(path); return responses[path] || missingResponse(); };
}
export const sitemapFixture = urls => `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`;
