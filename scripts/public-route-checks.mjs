import {parse, parseFragment} from 'parse5';

export const productionOrigin = 'https://www.sitesnit.nl';
export const ownOrigins = [productionOrigin, 'https://sitesnit.nl', 'http://sitesnit.nl', 'http://www.sitesnit.nl'];
export const isPrivatePath = path => /^\/(?:api|account|hub|rapport|inloggen|registreren)(?:\/|$)/.test(path);
// Independent test contract: these two tools deliberately exclude their result view.
// A result parameter on other routes, or ordinary tracking/package context, is not an exemption.
const resultPagePaths = new Set(['/tools/website-check', '/tools/website-kosten-berekenen']);
function expectsResultNoindex(path) {
  const url = new URL(path, productionOrigin), values = url.searchParams.getAll('resultaat');
  return resultPagePaths.has(url.pathname) && (values.length > 1 || Boolean(values[0]));
}
const attributes = node => Object.fromEntries((node.attrs || []).map(item => [item.name, item.value]));
const content = node => (node.nodeName === '#text' ? node.value : '') + (node.childNodes || []).map(content).join('');
function findAll(node, predicate, found = []) {
  if (predicate(node)) found.push(node);
  for (const child of node.childNodes || []) findAll(child, predicate, found);
  return found;
}
const issue = (code, path, expected, actual, extra = {}) => ({code, path, expected, actual, ...extra});
export const canonicalFor = path => new URL(path, productionOrigin).href;

export function resolveReference(raw, source, origins = ownOrigins) {
  if (typeof raw !== 'string' || !raw.trim()) return {kind: 'empty'};
  try {
    const url = new URL(raw, source);
    if (!['http:', 'https:'].includes(url.protocol)) return {kind: 'non-http', href: url.href};
    if (!origins.includes(url.origin) || url.username || url.password) return {kind: 'external', href: url.href};
    return {kind: 'internal', href: url.href, origin: url.origin, path: url.pathname + url.search, pathname: url.pathname, hash: url.hash};
  } catch { return {kind: 'invalid', href: raw}; }
}

// Keep data URLs intact: their commas are URL content, not candidate separators.
export function srcsetReferences(value = '') {
  const urls = [];
  let rest = value;
  while (rest) {
    rest = rest.replace(/^[\s,]+/, '');
    const match = rest.match(/^\S+/);
    if (!match) break;
    const candidate = match[0], url = candidate.replace(/,+$/, '');
    if (!/^(?:data|blob):/i.test(url)) urls.push(url);
    rest = rest.slice(candidate.length);
    if (!candidate.endsWith(',')) {
      const comma = rest.indexOf(',');
      rest = comma < 0 ? '' : rest.slice(comma + 1);
    }
  }
  return urls;
}

export function cssReferences(value = '') {
  const css = value.replace(/\/\*[\s\S]*?\*\//g, '');
  const urls = [...css.matchAll(/url\(\s*(?:"([^"\n]*)"|'([^'\n]*)'|([^\s)'"\n]+))\s*\)/gi)].map(match => match[1] ?? match[2] ?? match[3]);
  const imports = [...css.matchAll(/@import\s+(?:"([^"\n]+)"|'([^'\n]+)')/gi)].map(match => match[1] ?? match[2]);
  return [...new Set([...urls, ...imports])].filter(url => url && !url.startsWith('#') && !/^(?:data|blob):/i.test(url));
}

export function readPage(html, path, headers = {}) {
  const parseErrors = [];
  const root = parse(html, {sourceCodeLocationInfo: true, onParseError: error => parseErrors.push(error.code)});
  const nodes = findAll(root, node => Boolean(node.tagName));
  // The HTML parser silently repairs nested anchors/buttons; their required
  // closing tags disappear from the original element's source location.
  for (const node of nodes) if (['a', 'button'].includes(node.tagName) && node.sourceCodeLocation && !node.sourceCodeLocation.endTag) parseErrors.push(`implicitly-closed-${node.tagName}`);
  const selected = (tag, predicate = () => true) => nodes.filter(node => node.tagName === tag && predicate(attributes(node)));
  const meta = name => selected('meta', attrs => (attrs.name || attrs.property || '').toLowerCase() === name).map(node => attributes(node).content || '');
  const resources = [];
  const add = (href, kind) => { if (href) resources.push({href, kind}); };
  for (const node of nodes) {
    const attrs = attributes(node);
    if (['img', 'source', 'video', 'audio'].includes(node.tagName)) {
      add(attrs.src, node.tagName);
      add(attrs.poster, 'image');
      for (const href of srcsetReferences(attrs.srcset)) add(href, 'srcset');
    }
    if (node.tagName === 'script') add(attrs.src, 'script');
    if (node.tagName === 'link' && /\b(?:stylesheet|preload|modulepreload|icon)\b/.test(attrs.rel || '')) {
      add(attrs.href, attrs.rel === 'stylesheet' ? 'stylesheet' : attrs.as || attrs.rel);
      for (const href of srcsetReferences(attrs.imagesrcset)) add(href, 'srcset');
    }
    for (const href of cssReferences(attrs.style || (node.tagName === 'style' ? content(node) : ''))) add(href, 'css-url');
  }
  for (const href of [...meta('og:image'), ...meta('twitter:image')]) add(href, 'social-image');
  const schemas = [];
  let validLd = true;
  for (const node of selected('script', attrs => attrs.type === 'application/ld+json')) {
    try { schemas.push(JSON.parse(content(node))); } catch { validLd = false; }
  }
  const anchors = nodes.flatMap(node => {
    const attrs = attributes(node);
    return [attrs.id, node.tagName === 'a' ? attrs.name : undefined].filter(Boolean);
  });
  const ids = nodes.map(attributes).map(attrs => attrs.id).filter(Boolean);
  return {
    path, h1: selected('h1').map(content), titles: selected('title').map(content), descriptions: meta('description'),
    canonicals: selected('link', attrs => (attrs.rel || '').split(/\s+/).includes('canonical')).map(node => attributes(node).href),
    robots: [...meta('robots'), ...meta('googlebot'), headers['x-robots-tag'] || ''].join(', '),
    anchors, duplicateIds: [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))],
    links: selected('a').map(node => attributes(node).href).filter(href => href !== undefined), resources,
    mainText: selected('main').map(content).join(' ').replace(/\s+/g, ' ').trim(),
    schemas, validLd, parseErrors: [...new Set(parseErrors)],
  };
}

export function validatePage(page, {status = 200, expectedDescription, requireNonce = false, headers = {}} = {}) {
  const failures = [], path = page.path;
  if (status !== 200) failures.push(issue('page-status', path, 200, status));
  if (page.h1.length !== 1) failures.push(issue('h1-count', path, 1, page.h1.length));
  if (page.titles.length !== 1 || !page.titles[0].trim()) failures.push(issue('title', path, 'one nonempty title', page.titles));
  if (page.descriptions.length !== 1 || !page.descriptions[0].trim() || (expectedDescription && page.descriptions[0] !== expectedDescription)) failures.push(issue('description', path, expectedDescription || 'one nonempty description', page.descriptions));
  const expectedCanonical = canonicalFor(new URL(path, productionOrigin).pathname);
  if (page.canonicals.length !== 1 || (() => {try {return new URL(page.canonicals[0]).href !== expectedCanonical;} catch {return true;}})()) failures.push(issue('canonical', path, expectedCanonical, page.canonicals));
  const noindex = /\b(?:noindex|none)\b/i.test(page.robots);
  if (expectsResultNoindex(path)) {
    if (!noindex) failures.push(issue('result-indexable', path, 'noindex on the personal tool result variant', page.robots));
  } else if (noindex) failures.push(issue('public-noindex', path, 'indexable public production HTML', page.robots));
  if (!page.validLd || !page.schemas.length) failures.push(issue('structured-data', path, 'valid nonempty JSON-LD', {valid: page.validLd, count: page.schemas.length}));
  if (!page.mainText) failures.push(issue('main-content', path, 'nonempty server-rendered main content', page.mainText));
  if (page.duplicateIds.length) failures.push(issue('duplicate-id', path, [], page.duplicateIds));
  if (page.parseErrors.length) failures.push(issue('html-parse', path, [], page.parseErrors));
  if (requireNonce && !headers['content-security-policy']?.includes("'nonce-")) failures.push(issue('html-csp', path, 'nonce CSP', headers['content-security-policy']));
  return failures;
}

export function validateSitemap(xml, paths) {
  const values = [...xml.matchAll(/<loc\s*>([\s\S]*?)<\/loc\s*>/g)].map(match => content(parseFragment(match[1])).trim());
  const expected = paths.map(canonicalFor), failures = [];
  const normalized = values.map(value => {try {return new URL(value).href;} catch {return value;}});
  const duplicates = normalized.filter((value, index) => normalized.indexOf(value) !== index);
  if (duplicates.length) failures.push(issue('sitemap-duplicates', '/sitemap.xml', [], [...new Set(duplicates)]));
  for (const url of expected) if (!values.includes(url) && !(url === productionOrigin + '/' && values.includes(productionOrigin))) failures.push(issue('sitemap-missing', '/sitemap.xml', url, 'missing'));
  for (const value of values) {
    let parsed;
    try { parsed = new URL(value); } catch { /* Report as unexpected below. */ }
    if (!expected.includes(value) && !(value === productionOrigin && expected.includes(value + '/'))) failures.push(issue('sitemap-unexpected', '/sitemap.xml', 'exact public canonical set', value));
    if (parsed && isPrivatePath(parsed.pathname)) failures.push(issue('sitemap-private', '/sitemap.xml', 'no private routes', value));
  }
  if (!/<urlset\b/.test(xml)) failures.push(issue('sitemap-format', '/sitemap.xml', 'urlset XML', 'missing urlset'));
  return {values, failures};
}

export function validateRedirect(response, {source, destination, permanent = true}) {
  const expectedStatus = permanent ? 308 : 307;
  let target;
  try { target = new URL(response.headers.location, productionOrigin).href; } catch { /* Invalid redirect. */ }
  return response.status === expectedStatus && target === canonicalFor(destination) ? [] : [issue('legacy-redirect', source, {status: expectedStatus, location: canonicalFor(destination)}, {status: response.status, location: response.headers.location})];
}

/** HTTP adapter is injected, so the same crawl logic is exercised by negative fixtures. */
export async function crawlPublicRoutes({paths, request, metadata = {}, assetPaths = [], limit = 1000}) {
  const pages = new Map(), resources = new Map(), failures = [], links = [], external = new Set();
  const queue = paths.map(path => ({path, source: 'route-catalog'}));
  const scheduled = new Set(paths), catalog = new Set(paths);
  const requestCache = new Map();
  const get = async path => {
    if (!requestCache.has(path)) requestCache.set(path, Promise.resolve().then(() => request(path)));
    return requestCache.get(path);
  };
  const addResource = (href, source, kind) => {
    const ref = resolveReference(href, canonicalFor(source));
    if (ref.kind === 'external') { external.add(ref.href); return; }
    if (ref.kind !== 'internal') return;
    const resource = resources.get(ref.path) || {path: ref.path, sources: [], kinds: []};
    resource.sources.push(source); resource.kinds.push(kind); resources.set(ref.path, resource);
  };
  for (const path of assetPaths) addResource(path, '/', 'public-file');
  for (let index = 0; index < queue.length; index++) {
    if (index >= limit) { failures.push(issue('crawl-limit', queue[index].path, `at most ${limit} URLs`, queue.length)); break; }
    const {path, source} = queue[index];
    let response;
    try { response = await get(path); } catch (error) { failures.push(issue('request-failed', path, 'reachable local route', error.message, {source})); continue; }
    if (response.status >= 300 && response.status < 400) {
      failures.push(issue('internal-redirect', path, 'direct canonical target', {status: response.status, location: response.headers.location}, {source}));
      const target = resolveReference(response.headers.location, canonicalFor(path));
      if (target.kind === 'internal' && !isPrivatePath(target.pathname) && !scheduled.has(target.path)) { scheduled.add(target.path); queue.push({path: target.path, source: path}); }
      continue;
    }
    if (!/text\/html/i.test(response.headers['content-type'] || '')) {
      if (response.status !== 200) failures.push(issue('internal-status', path, 200, response.status, {source}));
      if (catalog.has(new URL(path, productionOrigin).pathname)) failures.push(issue('page-content-type', path, 'text/html for a public page', response.headers['content-type'] || 'missing', {source}));
      continue;
    }
    const page = readPage(response.body, path, response.headers);
    page.status = response.status;
    failures.push(...validatePage(page, {status: response.status, headers: response.headers, requireNonce: true, expectedDescription: metadata[new URL(path, productionOrigin).pathname]?.description}));
    pages.set(path, page);
    if (response.status !== 200) continue;
    if (!catalog.has(new URL(path, productionOrigin).pathname)) failures.push(issue('uncatalogued-public-page', path, 'public HTML included in route catalog', source));
    for (const resource of page.resources) addResource(resource.href, path, resource.kind);
    for (const href of page.links) {
      const ref = resolveReference(href, canonicalFor(path));
      links.push({...ref, source: path, href});
      if (ref.kind === 'invalid') failures.push(issue('invalid-link', path, 'valid URL', href));
      if (ref.kind === 'external') external.add(ref.href);
      if (ref.kind !== 'internal' || isPrivatePath(ref.pathname)) continue;
      if (ref.origin !== productionOrigin) failures.push(issue('old-own-origin', path, productionOrigin, ref.origin, {href}));
      if (assetPaths.includes(ref.pathname)) { addResource(href, path, 'download'); continue; }
      if (!scheduled.has(ref.path)) { scheduled.add(ref.path); queue.push({path: ref.path, source: path}); }
    }
  }
  for (const link of links) {
    if (link.kind !== 'internal' || !link.hash || isPrivatePath(link.pathname)) continue;
    const target = pages.get(link.path);
    if (!target || target.status !== 200) continue;
    let anchor;
    try { anchor = decodeURIComponent(link.hash.slice(1)); } catch { anchor = link.hash.slice(1); }
    // Text fragments are browser-directed, not element IDs.
    anchor = anchor.split(':~:text=')[0];
    if (anchor && anchor.toLowerCase() !== 'top' && !target.anchors.includes(anchor)) failures.push(issue('missing-anchor', link.source, `${link.path}#${anchor}`, 'absent from server HTML; requires browser verification if inserted dynamically', {href: link.href}));
  }
  for (const resource of resources.values()) {
    try {
      const response = await get(resource.path);
      resource.status = response.status;
      resource.contentType = response.headers['content-type'] || '';
      if (response.status !== 200 || /text\/html/i.test(resource.contentType)) failures.push(issue('asset-unavailable', resource.path, '200 non-HTML asset', {status: response.status, contentType: resource.contentType}, {sources: resource.sources, kinds: resource.kinds}));
      if (response.headers['content-security-policy']?.includes("'nonce-")) failures.push(issue('asset-html-nonce', resource.path, 'ordinary asset without HTML nonce CSP', 'nonce CSP present', {sources: resource.sources}));
      if (response.status === 200 && /text\/css/i.test(resource.contentType)) for (const href of cssReferences(response.body)) addResource(href, resource.path, 'css-url');
    } catch (error) { failures.push(issue('asset-request-failed', resource.path, 'reachable local asset', error.message, {sources: resource.sources})); }
  }
  return {routes: [...pages.values()], resources: [...resources.values()], links, external: [...external], requests: [...requestCache.keys()], failures};
}
