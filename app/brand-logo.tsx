export function BrandLogo({ light = false }: { light?: boolean }) {
  return <img className="sitesnit-logo-image" src={`/brand/sitesnit-logo-${light ? 'white' : 'black'}.webp`} alt="Sitesnit — scherp webdesign op maat" width="640" height="161" decoding="async" />;
}
