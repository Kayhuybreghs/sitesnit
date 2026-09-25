# Onafhankelijke redactionele corpusreview

Reviewdatum: 22 september 2026. Reviewer: afzonderlijke Codex-agent, redactionele beoordeling; geen eigenaargoedkeuring. Scope: de 18 nieuwe gidsen, hun gerenderde onderdelen en inhoudelijke overlap met bestaande commerciële pagina's en cases; daarnaast `/seo-venlo` en `/diensten/seo-onderhoud`.

## Methode en grenzen

Volledige bronlezing van de 18 gidsen is in de eerste review uitgevoerd. In deze vervolgcontrole zijn `lib/guides.ts`, `app/guide-page.tsx`, de gewijzigde gerenderde gidsen en de risicoparen in `reports/content-corpus.json` opnieuw beoordeeld. De concrete passages hieronder komen uit de lokale SSR-corpusbestanden in `reports/content-corpus/*.txt`. Kosten zijn naast `lib/business.ts`, `lib/price.ts`, `app/site-data.ts`, `app/service-pricing.tsx` en de diensteninhoud gelegd. Casebeschrijvingen zijn met `app/portfolio-data.ts` vergeleken.

De similaritywaarden zijn alleen signalen voor deze review. Ze zijn geen Google-grens, rankingvoorspelling of automatische afkeuring. Een HTTP 200 of een geslaagde linkcontrole bewijst geen redactionele kwaliteit. Deze reviewer heeft geen nieuwe browserinteractietests, primairebronnencontrole, juridische toets of eigenaargoedkeuring uitgevoerd. De claims van daadwerkelijke uitvoering van onderhoud bij bestaande cases blijven een bedrijfseigenaarfeit.

## Conclusie

De vijf gerichte gidsrevisies zijn zichtbaar verwerkt. De 18 gidsen hebben onderling en tegenover de vijf tools voldoende verschillende gebruikstaken om afzonderlijk zinvol te zijn; hiervoor geldt geen automatische publicatiegoedkeuring. Er is wel een concrete nieuwe renderingsfout op SEO-onderhoud, een nog ontbrekend voorbeeldwerklog, en bestaande inhoud die buiten de gedeelde navigatie te sterk wordt herhaald op de drie conceptcases. De lokale pagina's kunnen inhoudelijk scherper worden afgebakend zonder plaatsnamen, projecten of resultaten te verzinnen.

## Bevindingen die nog actie vragen

### EC-01 — SEO-onderhoud toont een ongerelateerde AI-aanvraagflow

Prioriteit: hoog. Status: needs_revision. Bewijs: `diensten__seo-onderhoud.txt`, tussen de stappen Uitvoeren en Hercontroleren.

Op een pagina over handmatig SEO-werk staat letterlijk: “Voorbeeld / Een aanvraag verwerken”, gevolgd door “Een koppeling geeft de aanvraag een plek. AI kan een concept voorbereiden” en “Medewerker beoordeelt & verstuurt”. Dit is dezelfde concrete procesdemo als bij AI-koppelingen. Het gaat dus niet alleen om een onschuldige gedeelde CTA. De sectie verbreekt de uitleg van het SEO-onderhoud en suggereert dat dit de te leveren dienst is.

Actie: geef deze nieuwe service een eigen narratief/renderpad. Toon de kringloop pagina onderzoeken → afgesproken wijziging → dezelfde bevinding hercontroleren → werklog bijwerken. Laat de generieke AI-fallback hier niet renderen. Hercontroleer de uiteindelijke HTML, niet uitsluitend de service-data.

### EC-02 — SEO-onderhoud beschrijft een werklog maar laat het nog niet zien

Prioriteit: middel. Status: needs_revision. Bewijs: dezelfde corpuspagina, FAQ “Wat staat in een werklog?”.

De tekst somt datum, pagina, aanleiding, verandering en hercontrole op. De masterprompt vraagt daarnaast een duidelijk gelabeld demonstratiewerklog. Dat concrete bewijs ontbreekt nog. Een korte fictieve rij is voldoende als deze naast de maandcyclus staat en niet als uitgevoerd klantwerk wordt gepresenteerd. Bijvoorbeeld een fictieve dienstenpagina met een verkeerde interne verwijzing, gekozen wijziging en status van de hercontrole. Vermijd verzonnen zoekverkeer of positieverbetering.

### EC-03 — Drie conceptcases herhalen hun inhoudelijke uitleg

Prioriteit: middel. Status: needs_revision voor de specifieke herhaalde passages. Bewijs: `projecten__atelier-vorm.txt`, `projecten__studio-matcha.txt`, `projecten__buiten-gewoon.txt`.

De gedeelde conceptdisclaimer is juist en mag blijven. De volgende gedeelde alinea's zijn echter de eigen caseuitleg, geen navigatie of disclaimer:

- “Het doel van dit concept is een aanbod begrijpelijk maken, een herkenbare sfeer neerzetten en bezoekers naar een relevante vervolgstap begeleiden.”
- “Op mobiel krijgt het beeld een eigen uitsnede. Teksten worden korter in breedte, de volgorde blijft logisch en belangrijke acties zijn direct herkenbaar.”

Alle drie hebben daarnaast dezelfde kop “Dezelfde aandacht. Een andere compositie.” De shingleflags van ongeveer 0,35–0,36 signaleren hier een echt redactioneel patroon, maar vormen op zichzelf geen indexeringsadvies.

Actie: gebruik de bestaande specifieke keuzes om per concept een daadwerkelijk andere uitleg te schrijven. Atelier Vorm: materiaal, collectie en beeldkeuze. Studio Matcha: aanbod en praktische bezoekinformatie op mobiel. Buiten Gewoon: projectverhaal, verschillende beeldformaten en contact na het project. Beschrijf alleen wat het getoonde concept werkelijk bevat; verzin geen uitgevoerde klantopdracht. Geen automatische noindex of verwijdering: de gebruiker heeft juist indexeerbare publieke pagina's gevraagd.

### EC-04 — Regionale pagina's hebben een geldige functie, maar beperkt eigen lokaal bewijs

Prioriteit: middel. Status: aanscherpen vóór redactionele afronding; geen automatisch technisch releaseverbod.

`/webdesign-venlo` beantwoordt de concrete webdesign-/investeringsvraag en noemt terecht Baarlo, geen kantoor in Venlo. `/seo-venlo` maakt dezelfde geografische positie duidelijk en onderscheidt bestaande website verbeteren van herbouw. Er is geen simpele plaatsnaamvervanging met een tweede nieuwe plaatsvariant gevonden.

Toch is veel van de Venlo-webdesignpagina ook op de homepage bruikbaar. Het eigen lokale deel bestaat voornamelijk uit werkgebied en belmomenten. De nieuwe SEO-Venlopagina gebruikt een eerlijk gelabeld installatiebedrijfvoorbeeld, maar dat voorbeeld blijft abstract: “welke werkzaamheden het daar uitvoert, hoe een opname verloopt”. Maak dit bruikbaarder met een duidelijk fictief, concreet vóór/na-fragment van een dienstenpagina of een compacte inventaris die Kay bij een eerste regionaal SEO-gesprek doorloopt. Dat geeft de pagina een eigen praktische bijdrage zonder lokaal klantbewijs te verzinnen.

Op `/seo-venlo` staat “Je krijgt geen onbevestigd tarief”. Dat is interne controletaal. Publieksgerichter: “We leggen de werkzaamheden en prijs vast voordat we beginnen.” Ook “Er worden geen vestigingen, projecten of klantreacties verzonnen” kan korter en natuurlijker als positieve uitleg over echte bedrijfsinformatie. De juiste feitelijke beperking — Sitesnit werkt vanuit Baarlo — moet behouden blijven.

### EC-05 — Scheiding onderhoudscontract en los SEO-onderhoud moet bij aanbod concreet blijven

Prioriteit: middel. Status: verduidelijken. Bewijs: `diensten__seo-onderhoud.txt`, `diensten__onderhoud-hosting.txt`, `website-onderhoud-kosten.txt`.

De nieuwe B3-tekst voorkomt terecht dubbel rekenen: “We bekijken eerst wat daarin al is opgenomen”. De hostingpagina biedt al Hosting, onderhoud & SEO voor €69,99 exclusief btw per maand, inclusief bestaande teksten en code bijwerken. De nieuwe servicepagina biedt eveneens werk aan bestaande pagina's en techniek, maar zegt alleen dat inzet wordt afgesproken.

Voeg op de commerciële SEO-onderhoudspagina zelf een korte, directe uitleg en link toe: bestaande onderhoudsafspraken worden eerst nagekeken; SEO-onderhoud is de afgebakende inzet die daar eventueel bovenop of buiten valt. Dat voorkomt dat de klant denkt twee abonnementen voor dezelfde taak nodig te hebben. Verzin daarbij geen nieuwe uren, SLA, prijs of automatisch extra pakket.

## Hercontrole van de eerdere vijf gidsrevisies

| ID | Gecontroleerd bewijs | Redactioneel oordeel |
| --- | --- | --- |
| B3 | Corpus zegt nu “bestaande onderhoudspakketten op de hostingpagina” en benoemt eerst beoordelen van technische staat/toegang | Eerdere interne tariefzin verwijderd; revisie inhoudelijk verwerkt. EC-05 blijft op de commerciële pagina zelf relevant. |
| E1 | Renderer maakt drie geneste lijsten, onder meer Diensten → Renovatie/Onderhoud en Vraagstukken → Starten/Groeien | Echte structuurvoorbeelden aanwezig; de misleidende platte pijlenlijst is vervangen. |
| E2 | Renderer en corpus noemen groen/budgetonderdelen versus diepblauw/geel/inleg/groei/koopkracht | Concrete keuzes aanwezig en herleidbaar naar eigen casegegevens. Afbeeldingen en leesbaarheid op mobiel vallen onder visuele controle, niet deze tekstcontrole. |
| F1 | “Noindex is geen toegangsbeveiliging: privé- en klantomgevingen blijven achter een echte login” | Eerder onduidelijke grens hersteld. |
| F3 | Fictieve `example.com/diensten`-meting met datum, mobiele labcontext, LCP 3,8 s en late ontdekking, plus PageSpeed-link | Eerlijk gelabeld en concreet. Niet als echte scan of actuele klantwaarde gepresenteerd. |

## Afweging van de belangrijkste overlapparen

| Paar | Concrete inhoudelijke grens | Beoordeling |
| --- | --- | --- |
| Home ↔ Webdesign Venlo | Home presenteert merk, werk en drie dienstgroepen; Venlo legt paginaomvang, aanpak, kosten en regionale samenwerking uit | Gedeelde prijs-/hostingregels en Beurswijzer-voorbeeld zijn verklaarbaar; niet hetzelfde artikel. Lokale eigen bijdrage kan sterker: EC-04. |
| Kosten ↔ B1 ↔ prijscheck | Aanbod en vaste afspraken ↔ factoren en drie scopes ↔ persoonlijke antwoorden en gekozen route | Zinvolle afzonderlijke rollen. De korte centrale pakketwidget is nuttige context, geen reden om B1 een tweede volledige verkooppagina te maken. |
| B2 ↔ B3 ↔ hosting | Alle terugkerende posten inventariseren ↔ de betekenis/afbakening van onderhoud beoordelen ↔ Sitesnit-pakketten kopen/bespreken | Voldoende onderscheid. De kostenlijst van B2 bevat daadwerkelijk bedrag/btw, betaalritme en looptijd; geen zevende calculator. |
| B3 ↔ SEO-onderhoud | Onderhoudsvoorstel leren beoordelen ↔ een concrete dienst met terugkerend werk kiezen | B3 verwijst terecht door. De dienst heeft nog EC-01, EC-02 en EC-05. |
| SEO-hub ↔ optimalisatie ↔ SEO-onderhoud | Keuze tussen diensten ↔ afgebakende eerste verbeteropdracht ↔ terugkerende werklijst en verslag | In de kern zinvol. De generieke investerings- en samenwerkingskoppen verklaren meerdere flags; alleen de AI-demo bij onderhoud is een inhoudelijke fout. |
| SEO Venlo ↔ optimalisatie | Regionale aanleiding/afstemming ↔ werkwijze bij concrete uitvoering | Niet louter woordelijk duplicaat, maar maak regionale praktische bijdrage sterker en verwijder interne beleidsformuleringen. |
| F1 ↔ websitecheck | Zelfstandig werkblad met bewijs/context/herstel ↔ 15 inhoudelijke vragen plus meting van één opgegeven pagina | Duidelijk gescheiden. F1 noemt expliciet dat dit geen volledige sitecrawl is. |
| F3 ↔ A3 | Lab-/velddata en oorzaakinterpretatie ↔ handmatige mobiele bediening, toetsenbord en overlap | Verschillende vraag en uitkomst; de wederzijdse verwijzing helpt. |
| F1 ↔ C2 | Technische controlelijst ↔ offertecontrolelijst | Gedeelde tekst “Een vinkje is je eigen notitie, geen automatisch gecontroleerd resultaat” is functionele eerlijkheidsuitleg. Geen verplichte herschrijving nodig. |
| Projectenoverzicht ↔ echte cases ↔ E2 | Werk kiezen ↔ opdracht/keuzes zien ↔ leren een ontwerpvoorkeur onderbouwen | Korte dezelfde previewteksten en merkteksten in grafische voorbeelden zijn logisch. E2 heeft eigen uitleg in de voorkeurentabel en vergelijking. |
| Drie conceptcases | Verschillende merken/sectoren, maar herhaalde generieke doel- en mobielalinea's | Echt redactioneel verbeterpunt EC-03; conceptlabel blijft juist. |

## Per gids: inhoudelijke taak tegenover bestaand corpus

Dit zijn redactionele bevindingen, geen status `approved_for_release`.

| ID | Oordeel over huidige inhoudelijke bruikbaarheid | Eigen bijdrage / resterende begrenzing |
| --- | --- | --- |
| A1 | Bruikbaar | Diagnosevolgorde bereik → juiste bezoeker → boodschap → echte ontvangst; geen meetresultaat gefingeerd. |
| A2 | Bruikbaar | Matrix behouden/gericht verbeteren/gefaserd/vernieuwen; anders dan webdesign-verkoop. |
| A3 | Bruikbaar | Reproduceerbare mobiele test met toetsenbord, lagen en rotatie; geen vervangende Lighthouseclaim. |
| B1 | Bruikbaar | Drie scopes en factoren, met centrale actuele prijzen; niet nog een calculator. |
| B2 | Bruikbaar | Terugkerende posten en verplichtingen inventariseren; widget aanwezig in SSR. |
| B3 | Bruikbaar na revisie | Verantwoordelijkheden en acceptatievragen; verwijst nu naar bestaande pakketten. |
| C1 | Bruikbaar | Aanvraag voorbereiden en onzekerheden noteren; belmoment blijft voorkeur. Kopieerbediening valt onder functionele QA. |
| C2 | Bruikbaar | Twee uitdrukkelijk fictieve scopes, geen prijswinnaar of juridisch oordeel. |
| D1 | Bruikbaar | Eén proces selecteren inclusief uitzonderingen; anders dan algemene dienstbelofte. |
| D2 | Bruikbaar | Veldmapping, duplicaten en begrensde herhaling zijn zelfstandig nuttig. |
| D3 | Bruikbaar | Onderscheid voorkeur en reservering, beschikbaarheid en bevestiging. |
| E1 | Bruikbaar na revisie | Drie echte structuren en keuze voor splitsen/samenvoegen. |
| E2 | Bruikbaar na revisie | Eigen casekeuzes en voorkeurentaal, geen gekopieerde casebeschrijving als enig doel. |
| F1 | Bruikbaar na revisie | Controlebewijs, context, acties en correcte noindex/login-grens. |
| F2 | Bruikbaar | Niet geïndexeerd versus weinig zichtbaar, met eigen onderzoeksroutes. |
| F3 | Bruikbaar na aanvulling | Concrete fictieve labuitsnede en geen claim van beschikbare grote crawler. |
| F4 | Bruikbaar | Beslismatrix 404/herstel/vervanger/410; geen generieke redirect-alles-oplossing. |
| F5 | Bruikbaar | Voor/tijdens/na-plan, URL-mapping en expliciete beperking van checklist. Downloadinhoud/bediening valt onder functionele QA. |

## Claims en resterende controlegrenzen

- De nieuwe gidsen voegen geen fictieve reviews, garantieposities, klantenaantallen, conversiepercentages of autonome extra tariefregels toe.
- De actuele bedragen in B1/B2 passen bij de centrale bron: €895, €1.895, vanaf €2.750 exclusief btw; hosting minimaal €5 exclusief per maand voor twaalf maanden. Definitieve indexeringsvrijgave volgt niet uit deze prijscontrole.
- Het bestaande gemiddelde van ongeveer €4.000 is een door de eigenaar eerder opgegeven claim. Niet behandelen als onafhankelijk gemeten marktgemiddelde.
- De drie conceptcases vermelden daadwerkelijk dat ze geen klantopdrachten zijn en dat fotografie voor het concept is gegenereerd. Dit is geen echt klantbewijs, maar het label voorkomt die specifieke misrepresentatie.
- E2 gebruikt geen fictieve klantreacties als bewijs. Bestaande `case-feedback-placeholders.ts` blijft een apart claimsrisico zolang lange verzonnen reacties publiek kunnen worden gerenderd; controleer de feitelijke case-output en het nieuwe claimsbeleid apart.
- Bronnenlijsten op F1–F5 zijn zichtbaar. Deze reviewer heeft de externe bronnen niet opnieuw geverifieerd; neem uitsluitend echt vastgelegde broncontrole over in het claimsregister.
- Gedeelde tabelkoppen komen in corpus opnieuw voor door mobiele labels in `aria-hidden`-spans. Dat is geen zelfstandige redactionele duplicatie. De extractie kan zulke labels apart markeren, maar moet de daadwerkelijke celinhoud behouden.
- Werkbladstatus en CTA's zijn deels uitgesloten van similaritycorpus. Daaruit volgt niet dat ze functioneel correct zijn; de gebruikerstests blijven nodig.

## Snapshot waarop deze review betrekking heeft

Betekenisvolle wijzigingen aan deze passages vereisen hercontrole; onderstaande hashes zijn uit `content-corpus.json`, niet door deze reviewer verzonnen:

- SEO-onderhoud: `83d739b21350c92aae4f9c3e0e03fed93a90c50420d60576c58d63d64b525cfa`
- SEO Venlo: `c9fedd595d25e197c11853bb181612a7b8834842000c3014f1f3e83260d9b97c`
- Webdesign Venlo: `98713836ed3bd6a4573c85d4e694b94a29bd417aa810d3748b9e16fd493663e2`
- Atelier Vorm: `17f62f6382ff912efcc01eb9a93b38633c14a4618a685b6db8a8cbe617955d4b`
- B3: `c93d65c9f05784d7dcad911a6217dfa547cf7c54fdc5da2b3c2265c49cc9e990`
- E1: `f59597342bc0345085a2b31058b528702a647130fb239581546d46d15ea2c1be`
- E2: `556fbccd7782dd6eaaf49a64f0e3e6854a9770fdddf4dbb29cec327629bcd265`
- F1: `c53fbe408dc252363db409ce3edeef1227af4c43f3b57f40a173ea61d765c693`
- F3: `536d29634b2b8aa8ad5a05c318f24f1429d276c00ae057784391a7f2ebfb7a8f`

Vervolg: herstel EC-01 en EC-02; verduidelijk EC-05; werk conceptpassages EC-03 en regionale bijdrage EC-04 uit. Herbouw het corpus en laat de veranderde secties opnieuw inhoudelijk beoordelen. Deze review autoriseert geen deploy, indexeringsactie of registratie van eigenaarapproval.

## Begrensde bronhercontrole na correcties

Vervolgcontrole op 22 september 2026, terwijl de nieuwe build nog liep. Gelezen: `app/service-chapter-break.tsx`, `app/service-canvas.tsx`, `app/concept-stories.ts`, `app/projecten/[slug]/page.tsx`, `app/seo-venlo/page.tsx`; ter onderbouwing ook de conceptgegevens in `app/site-data.ts`, de echte beeldkoppeling in `app/ui.tsx` en de relevante uitsnede-/kleurregels in `app/pages.css` en `app/globals.css`. De drie gebruikte lokale beelden `chair-480.webp`, `matcha-480.webp` en `architecture-480.webp` zijn daadwerkelijk geopend en visueel bekeken. Dit is een bron- en assethercontrole; nieuwe SSR-hashes en browserlayout zijn hiermee nog niet bevestigd.

| Bevinding | Hercontrole en huidige stand |
| --- | --- |
| EC-01 | In bron hersteld: `ServiceChapterBreak` keert voor `seo-onderhoud` vóór de generieke AI-fallback terug met een eigen werklog. `ServiceCanvas` heeft eveneens een eigen SEO-cyclus met prioriteren, uitvoeren en bewijs vastleggen. Controleer na build dat de AI-tekst inderdaad niet meer in de actuele SSR staat. |
| EC-02 | In bron hersteld: het werklog heeft datum/pagina, vastgesteld probleem, afgesproken verandering, hercontrole en een open vervolgpunt. Het is zowel “Fictief voorbeeld” als “Demonstratie · geen uitgevoerd klantwerk” genoemd. HTTP 200 wordt alleen binnen dat fictieve voorbeeld genoemd, niet als werkelijk gemeten klantresultaat. |
| EC-03 | De twee herhaalde alinea's en mobiele koppen zijn vervangen door passende conceptverhalen. Er blijven echter oude, stellige functieclaims zichtbaar via `p.choices`; zie de concrete restpunten hieronder. Nog niet volledig afgerond. |
| EC-04 | SEO Venlo is inhoudelijk verbeterd: concreet fictief vóór/na-fragment over een warmtepomp-opname, expliciete voorwaarde dat het bedrijf die werkwijze werkelijk uitvoert en vier vragen voor een eerste gesprek. De zin over “onbevestigd tarief” is vervangen door begrijpelijke werk-/prijsafspraken. De resterende oude Webdesign-Venlo-pagina is niet gewijzigd in deze beperkte correctieronde; de eerdere opmerking daarover blijft een verbetermogelijkheid. |
| EC-05 | In bron verduidelijkt: “Extra SEO-werk spreken we alleen af voor taken buiten die bestaande dekking”, met directe link naar bestaande onderhoudspakketten. Geen nieuwe pakketprijs of urenbelofte toegevoegd. |

### Conceptbeelden: wat wel klopt

- **Atelier Vorm:** het daadwerkelijk bekeken beeld toont een stoel met zichtbaar houten frame en donkere bekleding tegen een warme perzikachtergrond. De nieuwe beschrijving van materiaal, silhouet en een visuele merkrichting klopt. De mobiele bron toont hetzelfde beeld, daarna merkzin, korte tekst en “Ontdek meer”. De nieuwe beperking dat een collectieoverzicht een volgende uitwerking zou zijn, is terecht.
- **Studio Matcha:** het bekeken beeld toont een groen drankje op een metalen tafel, met een peer en rustige lichte omgeving. Het groene palet en de drankfoto kloppen. De nieuwe alinea zegt terecht dat adres, openingstijden en menu nog toekomstige inhoud zijn en dat er geen werkende reserveringssite wordt getoond.
- **Buiten Gewoon:** het bekeken beeld toont een brede gevel van een woongebouw. Het desktopkader heeft in CSS een zachte blauwe achtergrond; de telefoon gebruikt dezelfde afbeelding met een smallere `object-fit: cover`-uitsnede. De nieuwe uitleg over een andere uitsnede klopt en presenteert plattegronden/materialen als mogelijke latere uitwerking.

### EC-03 restpunt — oude keuzes spreken de nieuwe beperkingen tegen

`projecten/[slug]/page.tsx` rendert nog steeds `p.choices` uit `app/site-data.ts`. Daarin staat:

- **Atelier Vorm:** “Een duidelijke indeling verbindt inspiratie met de collectie.” Het getoonde concept bevat geen collectieoverzicht; de nieuwe tekst zegt juist dat dit een mogelijke volgende stap is. Maak de keuze concreet over het getoonde stoelbeeld en de merkzin, of benoem de collectie expliciet als nog uit te werken richting.
- **Studio Matcha:** “Het aanbod staat vroeg op de pagina, met korte omschrijvingen” en “Praktische informatie krijgt op mobiel een vaste, zichtbare plek.” In de telefoonpreview staan geen menu, adres of openingstijden. Deze claims moeten worden begrensd of vervangen door echte zichtbare ontwerpkeuzes. Dit is het duidelijkste overgebleven feitenconflict.
- **Buiten Gewoon:** “Projectverhalen verbinden grote beelden met concrete ontwerpkeuzes” en “Een compact contactmoment sluit ieder project af.” Er wordt één visuele studie getoond, geen reeks uitgewerkte projectverhalen met afzonderlijke contactmomenten. Vervang door de werkelijk getoonde geveluitsnede/merkzin of formuleer als voorgenomen uitwerking.

Aanbevolen vervolg is een kleine redactionele correctie van deze bestaande keuzes, gevolgd door hercontrole van de gewijzigde SSR. De nieuwe `conceptStories` zelf passen bij de daadwerkelijk getoonde assets en introduceren geen klantresultaten. Deze hercontrole verleent geen eigenaargoedkeuring en overschrijft de eerdere corpus-hashes niet alsof de nieuwe build al is bekeken.
