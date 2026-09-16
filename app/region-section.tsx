import { Arrow, Eyebrow } from './ui';
export function RegionSection() {
  return <section className="wrap region-section" aria-labelledby="regio-title">
    <div><Eyebrow>Vanuit Baarlo / Voor Limburg</Eyebrow><h2 id="regio-title">Dicht bij je bedrijf.<br/><em>Helder over je website.</em></h2></div>
    <div><p>Sitesnit werkt vanuit Baarlo voor ondernemers in Limburg. Van een compacte bedrijfswebsite tot een uitgebreider platform: je aanbod en de vragen van je bezoekers bepalen de aanpak.</p><a className="text-link" href="/webdesign-venlo">Een website laten maken voor je bedrijf in Venlo <Arrow/></a></div>
  </section>;
}
