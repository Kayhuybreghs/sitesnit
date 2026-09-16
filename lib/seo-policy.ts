export const productionOrigin = 'https://sitesnit.nl';

// Indexing requires both the explicit launch flag and the real production host.
// Enabling the flag on a local or generated preview cannot expose it to indexing.
export function indexingAllowed(enabled: unknown, host: string | null) {
  return enabled === 'true' && host?.toLowerCase() === new URL(productionOrigin).host;
}
