# Venlo-vormgeving en eerder inklappen — 16 september 2026

- Ruimte in de 01–03-sectie inhoudelijk ingevuld met drie eigen HTML/CSS-websitecomposities, kleurvlakken, afgeronde kaders en scrollgestuurde paneelbeweging. Geen extra afbeeldingen of animatiebibliotheek.
- Werkwijze met verbonden stappen en scrollgestuurde lijn; op mobiel verticaal.
- BeurswijzerScreen heeft nu zelf een aspectratio en container voor relatieve typografie. Hiermee is de ingeklapte strook op de Venlo-pagina verholpen. Homepage laptop gecontroleerd.
- Fotostapel klapt eerder in: bovenste observergrens van 32% naar 39% van het scherm. Desktop en mobiel: open → gesloten terwijl de foto's zichtbaar blijven. Geen handmatige knop.

Controle:
- Gerichte ESLint-controle: geslaagd.
- Next.js productiebuild incl. TypeScript: geslaagd.
- SEO/linkcontrole: 35 routes, 2.253 links, 0 meldingen.
- Browser: 360, 390, 768, 1440 en 1920 px; geen horizontale overflow. Screenshots beoordeeld op 360, 390 en 1440 px. Geen echte telefoon gebruikt.
- Vooruit- en terugscrollen verandert de paneelpositie. Statische CSS-variant voor reduced motion gecontroleerd in de broncode.
- GitHub commit: 0508fe68344a4ef580be8e84c51b00b5c3da25cf.
