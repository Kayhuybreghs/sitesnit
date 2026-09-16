import { NextResponse, type NextRequest } from 'next/server';
import { services } from './app/diensten/service-data';
import { projects } from './app/site-data';
import { clientCases } from './app/portfolio-data';

const allowed = {
  diensten: new Set(services.map(item => item.slug)),
  projecten: new Set([...projects, ...clientCases].map(item => item.slug)),
};

// Next 16.3 can emit a client-only error shell for unknown dynamic slugs.
// Route these to the ordinary server-rendered 404 before rendering starts.
export function proxy(request: NextRequest) {
  const match = request.nextUrl.pathname.match(/^\/(diensten|projecten)\/([^/]+)\/?$/);
  if (!match) return NextResponse.next();
  let slug = '';
  try { slug = decodeURIComponent(match[2]); } catch { /* Invalid encoding is an unknown path. */ }
  if (allowed[match[1] as keyof typeof allowed].has(slug)) return NextResponse.next();
  const target = request.nextUrl.clone();
  target.pathname = '/sitesnit-route-niet-gevonden';
  return NextResponse.rewrite(target);
}

export const config = { matcher: ['/diensten/:path*', '/projecten/:path*'] };
