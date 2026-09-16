# Sitesnit: Vercel, opslag en beheer

Documentatie van de native Next-uitvoering, opgesteld op 15 september 2026. Dit document beschrijft de aanwezige code en de benodigde inrichting. Het is geen verklaring dat Vercel, Neon, Analytics of e-mail al live zijn aangesloten. De actuele eindtestresultaten horen bij de afzonderlijke rapporten en de uiteindelijke build in `OPLEVERING.md`.

## 1. Platforminstellingen

| Instelling | Waarde |
|---|---|
| Project Root Directory | `site` wanneer de Git-repository de bovenliggende projectmap bevat; `.` wanneer de repository zelf bij `site` begint |
| Framework Preset | Next.js |
| Node.js | 24.x, ook vastgelegd in `package.json` |
| Install Command | `npm ci` |
| Build Command | `npm run build:vercel` → `next build --webpack` |
| Output Directory | Next.js-standaard behouden; geen handmatige `dist`- of `out`-override |
| Functions-regio | `fra1`, vastgelegd in `vercel.json` |
| Productiedomein | `https://sitesnit.nl` |
| Productieopslag | Neon PostgreSQL via de officiële HTTP-driver, versie 1.1.0 |

Vercel ondersteunt Next.js rechtstreeks en ondersteunt Node 24. De versie is zowel in het project als in de Vercel-instellingen te controleren. [Next.js op Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs), [Node-versies](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

De lokale `npm run start`-opdracht is geen Vercel-startinstelling. Vercel verwerkt de Next-build zelf. Het oude Workers-bundle en Cloudflare D1 zijn geen onderdelen van de nieuwe runtime. `next.config.ts` houdt metadata in de oorspronkelijke HTML-head en geeft de beveiligingsheaders mee. Databaseverzoeken gebruiken Node, geen Edge-runtime.

## 2. Omgevingsvariabelen

Geheimen worden in Vercel aan de juiste omgeving gekoppeld en komen lokaal alleen in genegeerde `.env.local`-bestanden. Er zijn geen `NEXT_PUBLIC_`-sleutels voor database, Google API of onderhoudsendpoints nodig. Een wijziging van productievariabelen hoort bij een nieuwe deployment en een hercontrole.

| Naam | Gebruik | Lokaal | Preview / productie |
|---|---|---|---|
| `DATABASE_URL` | Neon PostgreSQL-verbindingswaarde | Alleen nodig als bewust tegen Neon wordt gewerkt | Vereist voor aanvragen, beveiligingstellers, tellingen en de scanroute |
| `SITESNIT_LOCAL_SQLITE` | Expliciete SQLite-optie | `true` voor een zelfstandige preview | Weglaten; `true` op Vercel blokkeert databasegebruik |
| `RATE_LIMIT_SECRET` | Onafhankelijk willekeurig servergeheim voor beveiligingstellers | Eigen lokale waarde | Eigen sterke waarde per omgeving, aanbevolen minimaal 32 willekeurige bytes |
| `CRON_SECRET` | Autorisatie voor opslagcontrole en opschoning | Eigen waarde voor de healthtest | Vereist; onafhankelijke sterke waarde, aanbevolen minimaal 32 willekeurige bytes |
| `PAGESPEED_API_KEY` | Google PageSpeed Insights op de server | Nodig voor echte scans | Nodig voor echte scans; API-toegang en quota moeten kloppen |
| `SITESNIT_INDEXING_ENABLED` | Expliciete zoekmachinevrijgave | `false` | Preview `false`; productie pas `true` na oplevercontrole |
| `GOOGLE_SITE_VERIFICATION` | Search Console-verificatiecode | Niet nodig | Optioneel, juiste waarde van de eigenaar |
| `GA4_MEASUREMENT_ID` | Publieke property-ID in vorm `G-...` | Leeg zolang niet ingericht | Alleen de juiste bevestigde property |
| `GA4_PRIVACY_CONFIGURED` | Bevestiging van de vereiste property-instellingen | `false` | Pas `true` na de controle in onderdeel 5 |
| `VERCEL` | Platformindicator | Niet zelf instellen | Door Vercel beheerd |

De database-adapter accepteert Neon-verbindingsadressen met een `neon.tech`- of `neon.com`-host. Een willekeurige PostgreSQL-provider werkt niet zonder bewuste aanpassing. De productiesite valt bij een ontbrekende of defecte database nooit terug op een tijdelijk serverbestand. Publieke pagina's kunnen blijven renderen omdat het ophalen van de runtime nog geen databaseverbinding opent.

## 3. Neon en schema

Maak in de juiste Vercel-accountcontext een Neon-database beschikbaar en koppel die via Marketplace aan het project. Controleer de daadwerkelijk geïnjecteerde variabelenaam; de app leest `DATABASE_URL`. Kies bij voorkeur een passende Europese databaseregio dicht bij de Functions-regio. Gebruik afzonderlijke preview- en productiedata, zodat tests geen echte aanvragen wijzigen. Marketplace kan de databaseverbinding als omgevingsvariabele leveren. [Vercel Storage](https://vercel.com/docs/storage).

Het schema staat in `db/postgres/0001_sitesnit.sql`:

- `inquiries`: aanvraag-ID, naam, e-mail, optionele website/pakketkeuze, bericht, optionele toolsamenvatting en ontvangstmoment.
- `events`: willekeurige event-ID, toegestaan eventtype en tijdstip; geen antwoorden of contactvelden.
- `rate_limits`: afgeleide beveiligingssleutel, teller en eindtijd van het tijdvak.

De migratie maakt de tabellen en de retentie-indexen met `IF NOT EXISTS`. Ze kan opnieuw worden uitgevoerd, maar is geen algemeen migratiesysteem voor toekomstige schemawijzigingen. De productie-app maakt zelf geen tabellen aan. Breng toekomstige wijzigingen aan als expliciete vervolg-SQL en pas SQLite-schema en tests overeenkomstig aan.

Voer in een beheeromgeving waar **de bedoelde** `DATABASE_URL` al veilig is ingesteld uit:

```powershell
node scripts/migrate-postgres.mjs
```

Wanneer die doelverbinding bewust in `.env.local` staat, kan ook de bestaande opdracht worden gebruikt:

```powershell
npm run db:migrate
```

Deze tweede opdracht laadt `.env.local`. De migratie gebruikt altijd `DATABASE_URL`; `SITESNIT_LOCAL_SQLITE=true` verandert de migratiedoelstelling niet. Controleer dus eerst welke omgeving bedoeld is, zonder de verbindingswaarde in logs te tonen. De migratie zit niet in de gewone build en is hier niet op een echte Neon-database uitgevoerd.

Controleer na inrichting `GET /api/internal/storage` met de autorisatieheader `Bearer` gevolgd door de serverwaarde van `CRON_SECRET`. Gebruik daarvoor een client die geen gevoelige headers logt. Succes is uitsluitend `{ "ok": true, "schema": "sitesnit-1" }`; de controle leest geen aanvraagrecords. Daarna moet één herkenbare eigen testaanvraag aantoonbaar in de juiste Neon-omgeving worden teruggevonden, inclusief de keuze om een samenvatting wel of niet mee te sturen. Beoordeel de testgegevens voordat je ze op exacte eigen ID opruimt.

Lokale SQLite- en oude D1-testgegevens worden niet automatisch gemigreerd. De repository levert geen productiedatabase met bestaande klantdata mee.

## 4. Bewaartermijnen en cron

De applicatie verwijdert aanvragen ouder dan twaalf kalendermaanden sinds ontvangst (`created_at`), events ouder dan negentig dagen en verlopen beveiligingstellers. Een schrikkeldatum wordt correct naar het laatste geldige dagnummer omgerekend. Grenzen worden in UTC beoordeeld. Het moment van een latere e-mailwisseling verandert `created_at` niet.

`vercel.json` plant `GET /api/internal/retention` dagelijks om **03:15 UTC**: 04:15 Nederlandse wintertijd of 05:15 zomertijd. De endpoint is dynamisch, krijgt maximaal zestig seconden en vereist `CRON_SECRET`. Vercel voegt deze waarde toe als Bearer-autorisatie. Zonder juiste autorisatie gebeurt geen databaseactie. Succes bevat het afrondmoment en aantallen verwijderde rijen, geen persoonsgegevens. [Vercel cron-beheer](https://vercel.com/docs/cron-jobs/manage-cron-jobs).

Controleer na livegang dat de cron daadwerkelijk voor de productie-deployment is aangemaakt en dat de eerste uitvoering slaagt. Bewaak mislukte uitvoeringen; Vercel probeert een mislukte cron niet automatisch opnieuw. Een geautoriseerde herhaling is mogelijk: de verwijderregels zijn idempotent. De huidige code bevat geen alternatieve opschoning op iedere gewone paginaweergave. Zonder ingestelde of werkende planner is automatisch periodiek opruimen dus niet aangetoond. [Foutafhandeling van cron](https://vercel.com/docs/cron-jobs/manage-cron-jobs#cron-job-error-handling).

Deze opschoning geldt alleen voor deze drie actieve applicatietabellen. Klantdossiers, facturen, mailboxen, leverancierslogs en back-ups hebben afzonderlijk beheer nodig. Leg de gekozen back-uptermijn vast en pas verwijderingen na herstel opnieuw toe. De dagelijkse planner wist verlopen gegevens bij de eerstvolgende geslaagde uitvoering; neem dit operationele interval en storingsafhandeling mee in het beheer van de bewaartermijnen.

## 5. Analytics en toestemming

Analytics wordt alleen ingeladen wanneer een geldige GA4-ID aanwezig is, `GA4_PRIVACY_CONFIGURED=true` staat en de bezoeker expliciet statistieken toestaat. Ontbreekt een van deze voorwaarden, dan wordt geen Google Analytics-script geladen en worden geen cookieloze meetpings verzonden. Zonder geconfigureerde analyse vraagt de site geen schijnkeuze om een niet-actieve tracker toe te staan; cookie-instellingen blijven via de footer bereikbaar.

De applicatie kan niet via de omgevingsvariabele bewijzen wat er in de Google-property staat. Controleer vóór activering in het dashboard:

1. Enhanced Measurement staat volledig uit, inclusief automatische geschiedenis-pageviews, zoekopdrachten, formulierinteracties en externe klikken.
2. Google Signals, advertentiepersonalisatie en het verzamelen van door de gebruiker verstrekte gegevens staan uit. Er zijn geen advertentietags of gekoppelde meetregels die aanvullend persoonlijke gegevens verzamelen.
3. De bewaartermijn voor gebruikers-/eventgegevens staat op **twee maanden**, passend bij de privacytekst. Dit is geen automatische verwijdertermijn voor alle geaggregeerde rapporten.
4. De juiste property-ID en privacy-/verwerkingsafspraken zijn gecontroleerd.
5. De browsernetwerkcontrole bewijst: niets naar GA vóór toestemming, niets na weigeren, uitsluitend geschoonde openbare pageviews na toestaan, stoppen en cookies wissen na intrekken.

De code stuurt uitsluitend expliciete openbare routes uit de allowlist mee. Queryparameters, fragmenten, toolantwoorden, formulierinhoud en persoonlijke resultaten worden niet als Analytics-pagina-adres gebruikt. Paginatitels worden uit het openbare pad afgeleid; de referrer bevat alleen de oorsprong. Automatische pageviews zijn uitgeschakeld. De cookiekeuze en Analytics-cookies hebben een termijn van maximaal **180 dagen**. Intrekken schakelt nieuwe meting uit, verwijdert de betreffende cookies en herlaadt een pagina waarop de tag al geladen was.

De Google PageSpeed-scan is een andere gegevensstroom: die start op verzoek van de bezoeker en gebruikt de server-API-sleutel. Het aan- of uitzetten van Analytics verandert de scan niet. De scan verstuurt het gevalideerde openbare pagina-adres; niet de vijftien antwoorden of het contactformulier.

## 6. Contact en bedrijfsgegevens

Een succesvolle formulierbevestiging betekent dat de aanvraag werkelijk is opgeslagen. De unieke request-ID voorkomt het overschrijven van de eerste aanvraag bij herhaald verzenden. De server bewaart de toolcontext uitsluitend bij `includeSummary === true`. Een voorkeur voor een beldag/tijd is geen agendareservering.

Er is nog geen e-mailprovider, verzenddomein, automatische notificatie of beheerinbox gekoppeld. Tot die inrichting moet de eigenaar aanvragen via gecontroleerde databasetoegang kunnen ophalen en opvolgen. Leg vóór publieke contactwerving een werkende werkwijze vast. De site heeft geen bevestigde e-mail of telefoon ingevuld; schrijf geen werkende mail-/WhatsApp-route toe aan lege configuratie.

`lib/business.ts` bevat de bevestigde naam/vestiging en commerciële afspraken. KvK-nummer, btw-identificatie, e-mail en telefoon staan nog leeg. De voorwaarden en privacytekst moeten opnieuw worden gecontroleerd zodra deze gegevens of leveranciers wijzigen. De technische database-retentie vervangt geen administratie- of privacyproces buiten de website.

## 7. Domein, indexering en live controle

Zet `SITESNIT_INDEXING_ENABLED` pas op `true` wanneer de openbare productieversie wordt vrijgegeven. De code vereist daarnaast exact de host `sitesnit.nl`. Lokale hosts, `*.vercel.app` en andere hosts blijven uitgesloten. Regel in Vercel de bedoelde HTTPS- en `www`-naar-hoofddomeinverwijzing; `www.sitesnit.nl` is niet de vrijgegeven canonicalhost. Verifieer de daadwerkelijke redirects en certificaten na koppeling.

Controleer dan de oorspronkelijke HTML-head, canonicals, JSON-LD, alle publieke routes, de echte 404, robots.txt, sitemap.xml en OG-bestanden. De previewsitemap is leeg; na vrijgave bevat de sitemap de bedoelde releasepagina's, met uitgesloten concepten. Noindex is geen wachtwoordbeveiliging. Gebruik toegangsbeveiliging wanneer een preview alleen voor de eigenaar bedoeld is.

Een lokale Lighthouse-score bewijst geen live Core Web Vitals. Meet de uiteindelijke productie-URLs opnieuw op mobiel, controleer echte beelden/animaties en test de contact- en toolroutes opnieuw op de gehoste runtime. Search Console en eventueel beschikbare veldgegevens volgen daarna; goede technische metadata garandeert geen specifieke positie.

## 8. Legacy en open infrastructuurwerk

De volgende bestanden horen nog bij de eerdere infrastructuur: `vite.config.ts`, `drizzle.config.ts`, `db/schema.ts`, `drizzle/`, Wrangler-configuratie en de scripts met `:legacy`. `db:generate:legacy` gebruikt `dialect: "sqlite"` en genereert dus **geen Neon/PostgreSQL-migratie**. `install:ci:legacy` controleert na installatie op Vinext. De huidige `install:ci` voert een normale `npm ci` uit met ontwikkel- en optionele afhankelijkheden; `npm ci` is ook rechtstreeks te gebruiken. Gebruik voor het nieuwe schema de expliciete PostgreSQL-migratie hierboven.

Nog niet geleverd of live bewezen bij het opstellen van dit document: de juiste Vercel-projecttoegang, provisioning en schema van echte Neon-opslag, productiegeheimen, domein/DNS, geplande productieretentie, Analytics-propertyconfiguratie, definitieve e-mailgegevens, e-mailbezorging en eigenaarstoegang tot binnenkomende aanvragen. Deze punten zijn concreet uit te voeren na de betreffende account- en bedrijfsinrichting; ze worden niet als geslaagde tests aangemerkt.
