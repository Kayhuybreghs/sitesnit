import { Eyebrow, Arrow } from "./ui";
import './legal.css';
export default function NotFound() {
  return (
    <section className="wrap not-found-layout">
      <div className="not-found-number" aria-hidden="true">404</div><div>
      <Eyebrow>404 / Pagina niet gevonden</Eyebrow>
      <h1>
        Deze pagina
        <br />
        <em>is er niet.</em>
      </h1>
      <p>
        Deze pagina bestaat niet of is verplaatst. Vanaf de homepage vind je de
        projecten, de pakketten en alle tools. Of vertel ons direct waar je naar zoekt.
      </p>
      <div className="not-found-links"><a className="button" href="/">
        Naar de homepage <Arrow />
      </a>
      <a className="text-link" href="/contact">Stel je vraag <Arrow /></a><a className="text-link" href="/tools">Bekijk de tools <Arrow /></a></div></div>
    </section>
  );
}
