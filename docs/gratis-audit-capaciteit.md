# Gratis auditcapaciteit en afzonderlijke Hub-uptime

Onderzocht: 22 september 2026. Status: ontwerp met actuele primaire bronnen; geen account, betaalplan, productieconfiguratie of benchmark geverifieerd. Alleen dit document is toegevoegd. Er zijn geen externe jobs, scans, deployments of aankopen gestart en geen secrets gelezen.

## Besluit

Een kleine gratis start is mogelijk met Cloudflare Workers Free en Browser Run, maar **niet met de belofte dat iedere bezoeker gratis honderden volledige browsercontroles krijgt**. Kies een gelaagde audit: eerst begrensde statische HTML-analyse, daarna hoogstens enkele representatieve mobiele prestatiemetingen. Laat ontbrekende CSS-/JavaScript-/rendercontroles uitdrukkelijk als niet uitgevoerd zien. Vijfminuten-uptime voor toegewezen betaalde Hub-sites is een afzonderlijke lichte HTTP-monitor en verbruikt geen browserminuten.

Voorgestelde toekomstige pilot: maximaal twee toegelaten audits per dag, één tegelijk, vijf statische pagina's per audit, alleen vooraf door beheer goedgekeurde eigen/testsites. De nog te bouwen lokale Node 24-worker verwerkt een persistente wachtrij terwijl de beheercomputer aanstaat. Cloudflare haalt de inhoud op; lokale verwerking voorkomt dat grote HTML-parsing in een Free Worker met 10 ms CPU wordt gepropt. Dit brengt geen nieuwe gehoste compute-abonnementen mee, maar lokale stroom, hardware en beschikbaarheid zijn geen gratis gegarandeerde dienstverlening. Een zelfstandige permanent draaiende publieke browserworker is hiermee nog niet opgeleverd.

## Wat de leveranciers daadwerkelijk begrenzen

| Onderdeel | Geverifieerde grens | Gevolg |
|---|---|---|
| Browser Run Free | 10 browserminuten per dag, gedeeld tussen methoden | Geen afzonderlijke gratis pot voor iedere klant of scan |
| Browser Sessions Free | 3 gelijktijdige browsers; een nieuwe instance per 20 seconden | Meer parallelisme creëert geen extra browserbudget |
| Quick Actions Free | Een request per 10 seconden | Polling en starten moeten getemporiseerd worden |
| `/crawl` Free | 5 jobs per dag; maximaal 100 pagina's per job | Bovengrenzen, geen gegarandeerd aantal voltooide pagina's |

Bij uitputting van browsergebruik geeft Free een 429 tot de volgende UTC-dag. De standaard browser-inactiviteitstime-out is 60 seconden; die is geen totale jobduur. [Browser Run-limieten](https://developers.cloudflare.com/browser-run/limits/).

Browsergebruik is gedeeld over Quick Actions en Sessions. Paid heeft een andere kostenstructuur, inclusief mogelijk extra browseruren en gelijktijdige browsers. Daarom is een dashboardmelding over kosten geen vervanging voor het daadwerkelijk Free houden van het account en eigen toelatingslimieten. Quick Actions kunnen gebruikte browsertijd melden met `X-Browser-Ms-Used`; registreer alleen daadwerkelijk beschikbare meetvelden, nooit een verzonnen nul. [Browser Run-prijzen](https://developers.cloudflare.com/browser-run/pricing/).

`/crawl` levert asynchroon inhoud. `render:false` haalt HTML op zonder JavaScript-uitvoering en is tijdens de beta niet gefactureerd; daarna noemt Cloudflare Workers-prijzen. `render:true` gebruikt browsercapaciteit. Resultaten worden veertien dagen na afronding bewaard; jobs hebben een maximale looptijd van zeven dagen. De crawler respecteert robotsregels en crawl-delay en omzeilt geen CAPTCHA/WAF. Kies HTML-uitvoer; JSON-extractie kan AI gebruiken en hoort niet in deze AI-vrije versie. Stel inhoudsdoel en bewaargebruik expliciet en eerlijk in; accepteer blokkerende Content Signals. [Crawl-documentatie](https://developers.cloudflare.com/browser-run/quick-actions/crawl-endpoint/).

Workers Free geeft 100.000 requests/dag, 10 ms CPU per HTTP-aanroep én cronuitvoering, 128 MB geheugen, 50 subrequests per uitvoering, zes gelijktijdige uitgaande verbindingen en vijf crontriggers per account. Wachten op netwerk telt niet als CPU, maar parsing, hashing en JSON-verwerking wel. De dagelijkse requestpot bewijst dus niet dat één zware audit past. [Workers-limieten](https://developers.cloudflare.com/workers/platform/limits/).

## Waarom honderd pagina's en vijf jobs geen honderd volledige Lighthouse-runs zijn

Een crawlpagina betekent dat inhoud van een URL wordt verzameld. Lighthouse voert een eigen geladen paginasessie met meetconfiguratie en audits uit; een lijst HTML-documenten bevat nog geen honderd van zulke resultaten. JavaScript renderen is evenmin automatisch een Lighthouse-meting. Google beschrijft `runpagespeed` als analyse van één opgegeven pagina, met afzonderlijke categorieën en mobiel/desktopstrategie. [PageSpeed-methode](https://developers.google.com/speed/docs/insights/rest/v5/pagespeedapi/runpagespeed).

Rekenvoorbeeld, nadrukkelijk **geen benchmark**: honderd browserpagina's van gemiddeld zes seconden gebruiken al 600 browserseconden. Bij dertig seconden zijn het 3.000 seconden. Als drie onafhankelijke browsers elk tien seconden draaien, is de totale browsertijd ongeveer dertig seconden, ook al bedraagt de verstreken tijd ongeveer tien seconden. Opstarten en overige sessietijd kunnen daarbij komen.

Honderd pagina's maal drie herhalingen betekent driehonderd meetruns wanneer je voor elke pagina een mediaan wilt. Vijf toegestane crawljobs maken dat niet gratis of uitvoerbaar. Het aantal vindbare pagina's, onderzochte pagina's, unieke assets, controles en meetruns moet apart in het rapport staan. Een catalogus van driehonderd regels is geen bewijs dat driehonderd toepasselijke controles zijn uitgevoerd.

Het blokkeren van stylesheets, fonts of afbeeldingen kan inhoud ophalen versnellen, maar maakt conclusies over de volledige visuele rendering of prestaties onbetrouwbaar. Rapporteer dergelijke uitkomsten alleen als beperkte inhoudsanalyse.

## Concrete pilot en uitbreidingspad

Voorgestelde **eigen productlimieten**, geen leveranciersgaranties:

| Fase | Beginlimiet | Bewijs en uitsluitingen |
|---|---|---|
| Statische inhoud | 5 pagina's, diepte 2, één exacte host, 2 jobs/dag totaal | Titel, headings, links, canonical en HTML-signalen; geen volledige CSS/JS-audit |
| Prestatiesteekproef | Maximaal 1 vooraf gekozen URL, 1 mobiele run | Alleen na bevestigde Google-projectconfiguratie; label enkelvoudige labmeting |
| Experimentele rendering | Standaard uit; later max. 1 URL per audit | Pas na netwerkveiligheidstests en gemeten browserbudget |
| Hub-uptime | Eerst maximaal 5 toegewezen klantensites, elke 5 minuten | HTTP-bereikbaarheid, geen browser, geen Lighthouse |

Gebruik bestaande parameterized databasehelpers voor eenvoudige opslag. Voeg voor toelating, credits, job en idempotency een echte transactie toe; de huidige losse queryfacade levert die niet. Bewaar provider-job-ID, productscope, eigenaar, status, vervaltijd, begrensde pogingsteller en lease. Statussen moeten onder meer `queued`, `running`, `partial`, `blocked_by_site`, `capacity_exhausted`, `failed` en `completed` onderscheiden. Workeruitval laat een job hervatten of eerlijk verlopen.

Haal resultaten gepagineerd op. Limiteer lokaal iedere pagina tot bijvoorbeeld 1 MiB en de hele verwerkte audit tot 5 MiB; dit zijn voorstelwaarden. De lokale downloadgrens bewijst niet hoeveel de externe provider zelf van de doelwebsite heeft opgehaald. Stop bij onbekend kostenregime of ontbrekende quota-informatie. Gebruik contenthash plus regelversie voor cache; hercontrole voor een herstelclaim moet relevante verse gegevens gebruiken.

Pas na een gemeten en geslaagde pilot kan de statische paginalimiet naar vijftig of honderd. Die verhoging vereist voldoende lokale CPU/geheugen, opslag, tijd, robotsruimte en verwerking van gedeeltelijke resultaten. Nieuwe Free-limieten of het einde van de static-crawl-beta moeten automatische toelating blokkeren totdat het beleid opnieuw is goedgekeurd.

## PageSpeed API: beperkt hergebruik, projectquotum controleren

De bestaande `app/api/lighthouse/route.ts` gebruikt al een vaste Google-endpoint en `lib/lighthouse.ts` normaliseert echte mobiele meetresultaten. Houd die adapter, maar plan toekomstige metingen als afzonderlijke jobs. Google ondersteunt API-gebruik zonder sleutel en adviseert een sleutel voor frequente geautomatiseerde aanvragen. Labdata komen van Lighthouse; CrUX-velddata zijn een andere bron. [PageSpeed-startgids](https://developers.google.com/speed/docs/insights/v5/get-started).

De geraadpleegde officiële v5-bronnen bevestigen geen universele dagelijkse productquota of actuele prijsgarantie voor het concrete account. Daarom hier **geen onbevestigde claim van 25.000 gratis requests/dag**. Voor inschakelen: projectquota en eventueel kosten-/billingbeleid in de Google-console vastleggen, beperkte server-API-key instellen en een eigen dagmaximum afdwingen. Begin met maximaal twee nieuwe metingen/dag voor de pilot; retries tellen mee. Bij 429 of ontbrekende configuratie geen betaalde uitwijkdienst en geen geconstrueerd resultaat. Zonder bevestiging blijft deze fase uit.

## Vijfminuten-uptime apart houden

Gebruik een aparte kleine Cloudflare Worker met één crontrigger om de vijf minuten. Cron werkt met UTC-gebaseerde schema's en een `scheduled` handler. [Cron Triggers](https://developers.cloudflare.com/workers/configuration/cron-triggers/).

Vijf sites geven 5 × 288 = 1.440 geplande HTTP-probes per dag, of 43.200 in dertig dagen. Dit zijn doelrequests, **niet automatisch hetzelfde aantal Worker-invocaties**. Eén geclusterde cron heeft 288 uitvoeringen per dag; database- en API-koppelingen voegen subrequests en opslagwerk toe. Bepaal de werkelijke telling via de gebruikte architectuur en accountmetingen.

Voorstel: vijf vaste, beheergoedgekeurde HTTPS-hosts, alleen standaardpoort, redirects niet volgen, tien seconden timeout en kleine responsgrens. Gebruik beperkte GETs wanneer HEAD geen bruikbaar antwoord geeft; een HEAD-fout alleen bewijst geen storing. Vermijd browseruitvoering, volledige HTML-parsing en zware libraries. Meet p95/p99 CPU inclusief signing, opslag en foutafhandeling voordat de vijf-siteslimiet wordt vrijgegeven: 10 ms Free-CPU blijft de belangrijkste uitvoeringseis. De lokale implementatie en aanvullende grenzen zijn op 24 september vastgelegd in [hub-uptime.md](hub-uptime.md).

Bewaar `scheduledAt`, `checkedAt`, resultaat, HTTP-status/netwerkfout en meetduur. Meld na twee opeenvolgende mislukte meetmomenten een vermoedelijk incident; dit is een gekozen detectieregel. Een volgende geslaagde meting bevestigt herstel. Ontbrekende uitvoering is `monitor_gap`, niet site-uitval. Bij geblokkeerde probes: `blocked/unknown`. Noem vijf minuten een beoogde meetfrequentie; beloof geen exacte offline-minuten of SLA zonder bewezen dekking. Accountbrede Free-uitputting kan ook betaalde Hub-klanten raken, dus bewaak die onafhankelijk van de auditwachtrij.

## Netwerkveiligheid en CAPTCHA

Cloudflare biedt sinds september Browser Session-guardrails voor vaste toegestane hostnames; ze gelden voor HTTP/HTTPS en zijn niet beschikbaar voor Quick Actions zoals crawl. Gebruik later exacte hostnamen en een vaste lijst concrete assethosts, geen brede `*example.com`-patronen of dynamische algemene CDN-lijsten. [Browser Run-guardrails](https://developers.cloudflare.com/browser-run/features/guardrails/).

De geraadpleegde guardrail-documentatie bewijst niet dat DNS-rebinding, gekozen private/metadata-IP's, alle protocollen en requestmethoden afdoende worden begrensd voor ons dreigingsmodel. Een hostname-allowlist of JS-requestfilter alleen is dus geen volledige SSRF-netwerkgrens. Houd de openbare willekeurige browsercrawl geblokkeerd totdat expliciete providergarantie of een geteste egressproxy/firewall de bestemming inclusief IPv4/IPv6, redirects en assets valideert. Domeinverificatie beperkt misbruik maar vervangt dit niet.

Een eigen browser op een lokale/VPS-worker vereist een aparte sandbox/netwerknamespace zonder LAN, metadata, databasecredentials of bestaande cookies, met GET/HEAD-only beleid, byte-/tijd-/geheugenlimieten en intacte certificaatvalidatie. Browsersandbox uitschakelen is geen oplossing. Tot deze infrastructuur bestaat: alleen operator-goedgekeurde eigen fixtures voor browserexperimenten. Ook de uptimeprobe mag geen publiek instelbare willekeurige URL-fetcher worden.

CAPTCHA, WAF-blokkade, login en robotsweigering leiden tot beperkte of geblokkeerde dekking. Geen challenge-solvingdienst, omzeiling, formulierinzending of aankoop voor pay-per-crawl; HTTP 402 stopt. Broncode en foutmeldingen blijven onbetrouwbare tekst, worden geredigeerd en niet uitgevoerd in rapporten. Deel geen volledige privébroncode met leads of analytics. Cloudflare-crawlretentie moet worden opgenomen in de privacy-informatie, ook wanneer de eigen bewaartermijn korter is.

## Waarom GitHub Actions niet de productiejobdienst wordt

GitHub Free bevat voor private repositories 2.000 minuten per maand en 500 MB artifactopslag; standaard runners in publieke repositories zijn gratis, grotere runners niet. Accountbrede quota, andere workflows en opslag tellen mee. Zonder geldige betaalmethode blokkeert meergebruik; met betaalmethode moet een werkelijk stoppend budget worden gecontroleerd. [GitHub Actions-billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions).

De voorwaarden begrenzen Actions tot repo-gerelateerde softwareontwikkeling, tests, deployment en publicatie en beperken commercieel aanbieden van elementen van de Actions-dienst en serverless-dienstgebruik. **Architectuurconclusie:** gebruik Actions voor Sitesnit-CI en lokale fixtures, niet als gratis backend die willekeurige klantensites scant of uptime als product uitvoert. Bij twijfel zou vooraf uitdrukkelijke GitHub-toestemming nodig zijn; de pilot is daarvan niet afhankelijk. [GitHub-productvoorwaarden](https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features).

De minimale schedule-interval is vijf minuten, maar geplande uitvoeringen kunnen vertragen of zelfs vervallen bij drukte. Dat is bovendien geen betrouwbare uptimebelofte. [Workflow-schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onschedule), [schedule-beperkingen](https://docs.github.com/en/actions/how-tos/troubleshoot-workflows).

## Kostenhardstop en benodigde inrichting

Voor inschakelen zijn nodig:

1. Een bevestigd Cloudflare-account op Workers **Free**, account-ID en een accountbeperkt token met Browser Rendering Edit voor crawl. Secrets rechtstreeks in geschikte server-/lokale secretopslag invoeren, niet in chat, browser, logs of repository. Worker-deployrechten apart en minimaal.
2. Bevestigde, bevoegde eigen testhostnames en later expliciete Hub-sitetoewijzingen. Geen DNS-wijziging nodig om alleen externe APIs te evalueren.
3. Een operatorgestarte Node 24-worker met databaseconnectie en job-leases; voor lokale tests SQLite-fixtures, voor echte gedeelde jobs bestaande PostgreSQL met passende transacties en beperkte DB-rol. Geen echte gegevens naar testfixtures kopiëren.
4. Optioneel Google-project met ingeschakelde PSI-API, beperkte API-key en aantoonbare projectquota/kosteninstelling. Zonder deze gegevens blijft de PSI-fase uit.
5. Voor uptime: afzonderlijke Worker-configuratie, scoped backend-ingestsecret, vijf goedgekeurde doelhosts, persistent meetopslag en zichtbare monitor-heartbeat. Database, bestaande Vercel-hosting, mail en opslag zijn afzonderlijke budgetten; hun gratis commerciële geschiktheid is hier niet aangetoond.

De applicatie reserveert capaciteit atomisch vóór providerverzoeken. Bij provider-429, onbekend verbruik of eigen plafond stopt nieuwe toelating; beperkte retry met backoff, geen onbeperkte wachtrij. Renderfase heeft aanvankelijk budget nul. Geen automatische planupgrade, betaalde providerfallback, AI-extractie, betaald crawlverzoek of mailcapaciteitsuitbreiding. Een betaalplan of nieuw product wordt alleen na afzonderlijke kostenbeslissing aangesloten. App-limieten alleen zijn geen universele factuurgrens: het Free-plan en daadwerkelijke accountinstellingen blijven doorslaggevend.

## Nog niet gemeten of vrijgegeven

`not_run`: Cloudflare-accounttoegang, echt crawlresultaat, netto browserseconden, paginaverwerkingsduur, CPU/geheugen van de worker, PSI-projectquota, robots/CAPTCHA-test, providerfouten, SSRF/redirect/rebinding/asset-egress, planning onder belasting, gratis accountuitputting en uitval/herstart met leases.

`not_run`: vijfminuten-uptime over minimaal 48 uur, p95/p99 CPU, gemiste ticks, precies-eenmaal incidentmelding, monitoroffline versus siteoffline, backendbelasting en opslagretentie.

`blocked`: publieke willekeurige browseraudit zolang kritieke netwerkbescherming niet bewezen is. `review_required`: static-crawl-beta en werkelijke providerbewaring/kostenbeleid. Geen conclusie in dit document betekent dat een volledige scan-engine, driehonderd checks, honderd Lighthouse-pagina's of productie-uptime al gebouwd of geslaagd getest is.
