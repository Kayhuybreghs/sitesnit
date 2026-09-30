# Mobiele pijlen herstellen — 27 september 2026

## Oorzaak en oplossing

De omcirkelde blauwe blokjes zijn Unicode-pijlen die iOS als gekleurde emoji weergeeft. De homepagevoorbeelden gebruikten losse tekens in plaats van vaste vectoriconen.

- Eén kleine `InlineArrow`-component voor 85 decoratieve pijlen in de website, tools en Hub.
- De pijl volgt de tekstkleur en tekstgrootte en is verborgen voor schermlezers.
- Ook de twee CSS-pijlen in dienstenlijstjes gebruiken nu een SVG-masker.
- Alle vier pijlen in het schematische webdesignvoorbeeld en de Beurswijzer-paneellogo's zijn meegenomen.
- Bestaande teksten, bestemmingen, secties en scrollanimatie zijn behouden.

## Controle

- Productiebuild inclusief TypeScript geslaagd.
- ESLint over `app` geslaagd.
- Geen losse ↗, ↙ of ↔ meer in `app`/`lib` TypeScript, TSX of CSS.
- Mobiele browsercontrole: effectieve breedte 375 px, geen horizontale overflow op homepage, auditpagina en monitoringpagina.
- Het webdesignvoorbeeld toont vier correct geschaalde pijlen in de huisstijlkleur.
- Auditknoppen visueel gecontroleerd; geen browserconsolefouten bij de controles.
- Responsieve controle uitgevoerd in Chromium; geen fysieke iPhone-test. SVG-weergave is onafhankelijk van emoji-lettertypen.

## Publicatie

Commit: `a0b528a2aab64de46182eb352b7d652dab1a7c17`.

Vercel `dpl_8BXnNgkZoGTujfG7zfRhpS7uihAU` is READY en gekoppeld aan `www.sitesnit.nl`. GitHub-run `36321222010` is geslaagd: typecheck, lint, volledige tests, productiebuild en openbare routes/schema/redirects/beveiligingscontrole. De live homepage is opnieuw op mobiele breedte gecontroleerd: vier vectorpijlen in het voorbeeld, twee in de Beurswijzer-paneellogo's, nul losse emoji-pijltekens en geen consolefouten of horizontale overflow.

Alleen de 36 bestanden uit `.sites-runtime/mobile-arrow-files.json` zijn vanuit de bestaande lokale code naar de publicatiemirror gekopieerd en gecommit. Ander lokaal werk is behouden.
