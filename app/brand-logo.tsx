export function BrandLogo({ light = false, tagline = true, loading = 'eager' }: { light?: boolean; tagline?: boolean; loading?: 'eager'|'lazy' }) {
  if (!tagline) return <img className="sitesnit-symbol" src={`/brand/sitesnit-icon-${light ? 'white' : 'black'}-transparent.png`} alt="Sitesnit" width="64" height="64" decoding="async" loading={loading}/>;
  return <img className={`sitesnit-logo-image${tagline ? '' : ' sitesnit-logo-wordmark'}`} src={`/brand/sitesnit-logo-${light ? 'white' : 'black'}.webp`} alt={tagline ? 'Sitesnit — scherp webdesign op maat' : 'Sitesnit'} width="640" height="161" decoding="async" loading={loading} />;
}
