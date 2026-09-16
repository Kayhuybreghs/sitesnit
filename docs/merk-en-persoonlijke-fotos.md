# Merk en persoonlijke foto's — 16 september 2026

- Aangeleverde Sitesnit-logo's in navigatie, mobiel menu en footer; favicon en Apple-icoon uit hetzelfde pakket.
- Over Sitesnit gebruikt Kay en twee kleine portretten met Nova in een uitklapbare fotostapel. Geen grote fotoviewer. Nova heeft een eigen klein onderdeel.
- Foto's hebben beschrijvende bestandsnamen zonder achternaam. WebP-versies van 320/640 pixels, zonder oorspronkelijke metadata. Kleine versies zijn circa 21–33 kB per foto.
- Betaling en hosting opnieuw vormgegeven; bedragen, 60/40-verdeling, eerste hostingjaar en opzegvoorwaarden behouden.
- Homepage-preview heeft een eigen containermaat; navigatie en inhoud schalen samen. Titel van scrollcompositie vrij van laptop geplaatst.

## Controle

- Gewijzigde React-bestanden: ESLint geslaagd.
- Volledige Next.js-productiebuild inclusief TypeScript geslaagd.
- SEO-crawl op productiepreview: 35 routes, 2250 interne links, geen gerapporteerde problemen. Rapport lokaal: reports/seo/brand-personal-final/summary.json.
- Browsercontrole op 360, 390, 768, 1440 en 1920 pixels voor de gewijzigde onderdelen. Fotoknop heen/terug, mobiel menu, hero-scroll en afbeeldingladen bekeken. Geen horizontale overflow bij de fotostapel op 360/390 pixels.
- Verminderde beweging schakelt de fototransities uit via CSS. Geen echte telefoon beschikbaar voor deze controle.
- Productiekoppelingen voor mail/opslag en GA4 zijn niet opnieuw getest in deze visuele wijziging.
