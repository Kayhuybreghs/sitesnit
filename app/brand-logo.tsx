export function BrandLogo({ light = false, tagline = true }: { light?: boolean; tagline?: boolean }) {
  return <img className={`sitesnit-logo-image${tagline ? '' : ' sitesnit-logo-wordmark'}`} src={`/brand/sitesnit-logo-${light ? 'white' : 'black'}.webp`} alt={tagline ? 'Sitesnit — scherp webdesign op maat' : 'Sitesnit'} width="640" height="161" decoding="async" />;
}
