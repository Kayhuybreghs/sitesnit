// The live Vercel primary domain redirects the apex to www.
export const productionOrigin = 'https://www.sitesnit.nl';

// Public production indexing is authorized. A stale launch flag must not disable
// the entire live site. Local/preview hosts remain excluded independently.
export function indexingAllowed(host: string | null, environment?: string) {
  return environment === 'production' && host?.toLowerCase() === new URL(productionOrigin).host;
}

export function privatePath(path: string) {
  return /^\/(?:api|account|hub|rapport|inloggen|registreren)(?:\/|$)/.test(path);
}
