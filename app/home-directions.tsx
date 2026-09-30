import { Arrow } from './ui';
import './home-directions.css';

export function HomeDirections() {
  return <section className="wrap home-directions" aria-labelledby="home-directions-title">
    <div className="home-directions-heading"><span className="eyebrow">Wat wil je aanpakken?</span><h2 id="home-directions-title">Een volgende stap voor jouw website.</h2></div>
    <div className="home-directions-links">
      <a href="/diensten/webdesign"><span>01 / Nieuw bouwen</span><h3>Een website laten maken</h3><p>Een eigen ontwerp en pagina’s die vertellen wat je bedrijf doet.</p><strong>Bekijk webdesign <Arrow /></strong></a>
      <a href="/diensten/seo-optimalisatie"><span>02 / Gericht verbeteren</span><h3>Je website beter vindbaar maken</h3><p>Laat onderzoeken welke technische fouten en pagina’s aandacht nodig hebben.</p><strong>Bekijk SEO-optimalisatie <Arrow /></strong></a>
      <a href="/diensten/onderhoud-hosting"><span>03 / Goed blijven draaien</span><h3>Je website laten onderhouden</h3><p>Maak afspraken over controles, updates en het oplossen van technische problemen.</p><strong>Bekijk onderhoud <Arrow /></strong></a>
    </div>
  </section>;
}
