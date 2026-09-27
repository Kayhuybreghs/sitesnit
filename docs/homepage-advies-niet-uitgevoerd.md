# Homepage: behouden en afzonderlijk meten

De opdracht beschermt de bestaande homepage en WE BUILD BRANDS-hero. Het eerdere oordeel over de lengte was een commerciële hypothese, geen gemeten conversieverlies. Er is geen hero-redesign, andere hoogte, verkorte animatie, nieuwe H1 of verplaatsing van homepagesecties uitgevoerd.

## Toegestane kleine correctie

De bestaande verwijzing bij pakkettwijfel wees bij de start al rechtstreeks naar `/tools/website-kosten-berekenen`. De linktekst maakt die vervolgstap duidelijk; deze correcte verwijzing is gecontroleerd en behouden. `app/page.tsx` is ongewijzigd gebleven. Pakketnamen bleven behouden om de homepage niet onbedoeld opnieuw te laten afbreken. Op de kostenpagina is verduidelijkt dat alle pakketten een eigen ontwerp krijgen.

## Niet uitgevoerd

| Hypothese | Bewijs en grens | Kleinste eventuele proef | Benodigde meting |
|---|---|---|---|
| Lange projectintro vertraagt de stap naar aanvragen | Lange scrollopbouw bestaat; geen bewezen verlies | Na afzonderlijke toestemming één variant naast de huidige versie testen | Bereikte secties, contactintentie én opgeslagen aanvragen per relevante bezoekersgroep |
| Engelse hero maakt het aanbod minder direct | Smaak/interpretatie; geen bewezen SEO-blokkade | Eerst met enkele echte prospects laten uitleggen wat zij verwachten | Begrip en navigatie; niet alleen klikratio |
| Dynamische HTML door nonce-CSP kan TTFB beïnvloeden | Requestafhankelijkheid bestaat; houdt iedere nonce uniek | Afzonderlijk cache-/renderingonderzoek, geen CSP verwijderen of privédata cachen | Herhaalde productie-TTFB en cachegedrag per route; lokale labdata alleen onvoldoende |

De twee bestaande case-detailpagina’s hebben op latere uitdrukkelijke opdracht een eigen hero en uitgebreid verhaal gekregen. De nieuwe CSS is beperkt tot `.case-study-*`; de homepage en gedeelde projectpresentatie zijn daarvoor niet aangepast.

Voor/na-bewijs en de grenzen van de uitgevoerde controles staan in `sitesnit-herstelrapport.md` en `reports/homepage-behoud.json`. Een gelijke bronhash beschermt code-identiteit; screenshots en scrollcontrole blijven nodig om rendering mee te beoordelen.
