# Homepage: herstel van de scrollhero

Op 27 september 2026 vroeg de eigenaar expliciet de kapotte scrollhero te herstellen en soepeler en sneller te laten verlopen. Deze opdracht staat de gerichte animatiereparatie toe; de eerdere bescherming tegen een homepage-redesign blijft verder gelden.

## Vastgestelde oorzaak

Op de live versie `98d3d4b` bij een viewport van 1280 × 720 was `.hero-pin` niet sticky en ontbrak `is-immersive`. De oude toelatingscontrole rekende met 478px teksthoogte + 94px header + een vaste reserve van 150px = 722px. Daardoor werd de complete scrollanimatie uitgeschakeld, hoewel de werkelijke inhoud paste: 60px bovenruimte + 478px tekst + 94px header + 60px voor de scrollaanwijzing = 692px.

## Gerichte wijzigingen

- De hoogtecontrole gebruikt nu de werkelijke bovenruimte, tekst en scrollaanwijzing. Korte vensters en vergrote tekst behouden een leesbare statische terugval.
- De scrollvoortgang begint bij de werkelijke sticky positie onder de header, zonder de eerdere dode aanloop.
- De totale hero-scrollhoogte gaat van 310svh naar 285svh. Dezelfde tekst, knoppen, beelden en scènes blijven behouden.
- Kleine scrollstappen krijgen tijdsafhankelijke demping van 45ms. Grote sprongen en terugkeer naar een tabblad nemen direct de juiste scène over. Geen onderschepping van native scrollgedrag.
- Bewegende oppervlakken krijgen alleen nabij de hero een compositorhint. De animatielus stopt zodra de doelpositie bereikt is; geometrie wordt niet op iedere scrollframe opnieuw gemeten.
- Mobiele opbouw en ondersteuning voor verminderde beweging blijven behouden. Geen globale CSS, overige homepagesecties, metadata, contactcode of database gewijzigd.

## Controle

- Productiebuild met Webpack en TypeScript geslaagd; log `.sites-runtime/hero-repair-build.log`.
- Gerichte ESLint-controle op `app/hero-motion.tsx` geslaagd.
- Gebouwde versie getest via `http://127.0.0.1:5187/`.
- Bij 1280 × 720: sticky hero actief; begin, gecentreerd scherm, uitgeklapte panelen, overgang naar projecten en terugscrollen bekeken.
- Bij 1366 × 768: sticky hero actief.
- Bij 1280 × 600: statische terugval actief, geen opgesloten inhoud.
- Bij 390 × 844: mobiele opbouw en uitklappende panelen visueel gecontroleerd; documentbreedte 375px, inhoudbreedte 375px, geen horizontale overflow.
- Geen browserfouten in de gerichte testronde. Tijdelijke viewport teruggezet.
- Dit is functionele en visuele controle, geen gemeten garantie op een vaste framerate op elk apparaat.

## Publicatie

Alleen `app/hero-motion.tsx` en `app/hero-motion.css` zijn via de bestaande publicatiemirror naar main gepusht, commit `3199f33a18593855170a22b3218058d6f8b2c4fa`. Vercel-deployment: `dpl_HYwYSuU8fKq5rsL8Uv7HUVta3DsC`, READY, productie-alias `www.sitesnit.nl` toegewezen. De bijbehorende GitHub kwaliteitsworkflow is completed / success.

Na publicatie is de live homepage opnieuw geladen op 1280 × 720. De hero heeft nu `is-immersive`, de pin is sticky en de gemeten hoogte is 2052px (285svh). De uitgeklapte scène is ook live zichtbaar gecontroleerd; de storing van de eerdere versie is op dit formaat niet meer aanwezig.
