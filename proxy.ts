import {publicAssetPaths} from './lib/public-asset-paths';
import { NextResponse, type NextRequest } from 'next/server';
import { services } from './app/diensten/service-data';
import { projects } from './app/site-data';
import { clientCases } from './app/portfolio-data';
import { indexingAllowed, privatePath } from './lib/seo-policy';
import { publicServicePages } from './lib/public-service-pages';
import { contentSecurityPolicy } from './lib/security-headers';

const allowed = {
  diensten: new Set([...services.map(item => item.slug), ...Object.values(publicServicePages).map(item => item.slug)]),
  projecten: new Set([...projects, ...clientCases].map(item => item.slug)),
};

// Next 16.3 can emit a client-only error shell for unknown dynamic slugs.
// Route these to the ordinary server-rendered 404 before rendering starts.
export function proxy(request: NextRequest) {
  if(publicAssetPaths.has(request.nextUrl.pathname)) return NextResponse.next();
  const requestHeaders = new Headers(request.headers);
  const nonce = crypto.randomUUID().replaceAll('-', '');
  const csp = contentSecurityPolicy(nonce, process.env.NODE_ENV === 'development');
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  const response = NextResponse.next({request:{headers:requestHeaders}});
  response.headers.set('Content-Security-Policy', csp);
  if (privatePath(request.nextUrl.pathname)) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  }
  if (!indexingAllowed(request.headers.get('host'), process.env.VERCEL_ENV)) response.headers.set('X-Robots-Tag', 'noindex, follow');
  const match = request.nextUrl.pathname.match(/^\/(diensten|projecten)\/([^/]+)\/?$/);
  if (!match) return response;
  let slug = '';
  try { slug = decodeURIComponent(match[2]); } catch { /* Invalid encoding is an unknown path. */ }
  if (allowed[match[1] as keyof typeof allowed].has(slug)) return response;
  const target = request.nextUrl.clone();
  target.pathname = '/sitesnit-route-niet-gevonden';
  const rewritten = NextResponse.rewrite(target,{request:{headers:requestHeaders}});
  rewritten.headers.set('Content-Security-Policy', csp);
  rewritten.headers.set('X-Robots-Tag','noindex, follow');
  return rewritten;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|brand/|images/|og/|fonts/).*)'] };
