# Sitesnit Hub: presentatie en redactionele grenzen

Datum: 24 september 2026. Dit is implementatiedocumentatie, geen eigenaar- of publicatiegoedkeuring.

## Component en integratie

`app/hub/hub-dashboard.tsx` exporteert `HubDashboard`, `HubDashboardProps`, `HubSection`, `HubSnapshots`, `HubWorkItem` en `HubUptime`. Het is een Server Component zonder eigen fetch, authenticatie, analytics, browseropslag of afgeleide klantrechten. De aanroepende serverroute moet eerst toegang tot `site.id` autoriseren en uitsluitend passende gegevens doorgeven. Inhoud van taken en rapporten wordt als React-tekst gerenderd; geen HTML-injectie, externe image-fetches of tokens in clientcode.

```ts
type HubDashboardProps = {
  site: { id: string; name: string; origin: string };
  section: 'overzicht' | 'bezoekers' | 'google' | 'status' | 'werkzaamheden' | 'seo';
  snapshots: {
    ga4?: Partial<Ga4Data> | null;
    searchConsole?: Partial<SearchConsoleData> | null;
    deployments?: ProviderResult<Deployment[]> | null;
    stale?: Partial<Record<'ga4' | 'search-console' | 'vercel', boolean>>;
  };
  workItems: { id: string; title: string; detail: string; status: 'open' | 'in_progress' | 'completed'; evidence: string; updatedAt: string }[];
  uptime?: {
    checks: { checkedAt: string; status: 'up' | 'down' | 'unknown'; httpStatus: number | null; latencyMs: number | null; location?: string | null }[];
    period: Period | null;
    expectedChecks: number | null;
    sourceLabel?: string;
  } | null;
  isDemo?: boolean;
  preview?: boolean;
};
```

Datums `checkedAt` en `updatedAt` zijn ISO-strings; de root mapt database-tijdstempels. Het opgehaalde meetmoment wordt als Amsterdamse tijd gelabeld. De brontijdzone en bronperiode blijven apart staan. Geen automatische periodekeuze of herberekening van brontotalen door de UI.

Navigatie: `/hub/site/{encodedSiteId}`, gevolgd door `/bezoekers`, `/google`, `/status`, `/werkzaamheden` of `/seo`. `preview=true` behoudt `?preview=1` en toont “Beheerweergave · je kijkt onder je eigen beheerdersaccount”. Die flag verleent zelf geen rechten: root moet de beheerder autoriseren en de inzage loggen. `isDemo` markeert ieder componentbeeld expliciet als fictieve demonstratie en maakt sectielinks niet tot echte klantlinks.

## Wat de component toont en niet afleidt

- Ontbrekende, mislukte of niet-aangesloten bronnen blijven onbekend. Een werkelijk ontvangen nul blijft wel nul.
- Bron, periode, brontijdzone en ophaalmoment worden per rapport getoond. Meegeleverde stale-vlag geeft “Oudere gegevens”; de UI doet geen geheime verversing. Bronwaarschuwingen blijven uitklapbaar zichtbaar.
- De drie overzichtskaarten gebruiken het aparte GA4-periodetotaal voor gebruikers/sessies en het aparte Search Console-totaal voor klikken. Geen som van daggebruikers of zoekopdrachtrijen.
- GA4-kanalen, landen, apparaten en eerste pagina's tonen maximaal vijftien opgehaalde rijen. Gebruikers kunnen tussen rijen overlappen. Ontbrekende rijen worden niet bijverzonnen.
- De dagbalkjes gebruiken uitsluitend ontvangen sessiewaarden; maximaal de laatste 31 gerapporteerde dagen. Ontbrekende dagen krijgen geen nulbalk. Er is geen decoratieve trend, gefingeerde stijging of klantvergelijking.
- De huidige provider levert GA4-events per eventnaam. De UI toont daarom starts, uitkomstaanvragen en CTA-klikken als gebeurtenissen, niet als uitsplitsing per tool als die data niet geleverd is. `tool_complete` betekent geen geslaagde Lighthouse-scan, lead of aankoop. Geen conversieratio op onvolledige starts/aflopen.
- Search Console-toegang kan per deelrapport ontbreken. Totalen blijven gescheiden van maximaal twintig toprijen. CTR is afkomstig uit de berekende adapterwaarde, positie uit de brontotalen; geen gemiddelde van rijgemiddelden.
- Vercel-buildstatus is gelabeld als deployment/build, niet als actuele uptime. Geen verzonnen deployment-URL's of aanwijzingen over een mislukte build zonder bewijs.
- Uptime toont de laatste ontvangen HTTP-uitkomst met meetmoment. De array `checks` moet alle meetpunten van de opgegeven periode omvatten als root een `expectedChecks` doorgeeft. Anders geeft root `expectedChecks:null`: een begrensde recente steekproef mag geen vermeende volledige dekking opleveren. De UI toont ontvangstdekking uitsluitend wanneer die noemer positief is en niet kleiner dan het aantal checks. Geen uptime-SLA of tijdsduur van een storing wordt berekend.
- Een ontbrekende controlescheduler betekent onbekende beschikbaarheid, niet offline. Een losse mislukte check is geen bevestigd doorlopend incident.
- Werkitems komen alleen uit echte opgeslagen taken. Status “Afgerond” en meetbewijs zijn apart. Geen vastgelegde evidence wordt eerlijk vermeld. Een databasefout moet root als fout afhandelen en niet als lege takenlijst doorgeven.
- Het SEO-tabblad hergebruikt bronresultaten en opgeslagen werk; het is geen nieuwe technische audit, automatische verbeterclaim of impliciete auditgrant.

## Publieke pagina Website-monitoring / Sitesnit Hub

`app/diensten/website-monitoring/page.tsx` is een eigen, handgemaakte publieke route. Zij bevat een lichte uitleg, drie inzichtgroepen, vijf praktische vragen, echte vervolglinks en een expliciet fictieve CSS-demonstratie. De drie getallen 248, 73 en 3 staan onder “Fictieve demo” en worden nogmaals uitgelegd als verzonnen indelingsvoorbeelden. Ze zijn geen screenshot, echte brondata, aangesloten klant of resultaatbelofte.

De drie onderwerpen zijn bezoek/gebruik, vindbaarheid en status/werkzaamheden. Toegang blijft op uitnodiging. Metingen en herstel zijn verschillende diensten; bestaande onderhoudsdekking wordt eerst meegenomen. Geen onbevestigde prijs, SLA, vaste meetfrequentie of onbeperkte dienst is toegevoegd. Root integreert metadata, routecatalogus, sitemap en dienstenverwijzingen; de pagina zelf gebruikt de bestaande metadatabouwer.

De publieke tekst belooft geen universele tooltracking voor iedere klantwebsite: de huidige vaste events zijn gekoppeld aan Sitesnits eigen tools. Andere websites vereisen passende meetinrichting en toestemming.

## Privacy- en cookie-uitleg

Alleen de relevante GA4-alinea op `/privacy` en `/cookies` is uitgebreid: openbare pagina's, vaste tool-/knopidentifiers, geen ingevulde gegevens, handelingen in plaats van personen/aanvragen en geen Hub/accountmeting. Bestaande grondslagen, termijnen en juridische identiteit zijn niet gewijzigd. Deze tekstaanpassing is geen volledige Hub-privacyverklaring; toegang, opslag, retentie en ontvangers van klantgegevens moeten in de afzonderlijke Hub-inrichting nog worden beoordeeld.

## Vormgeving en verificatiegrens

Het dashboard gebruikt de bestaande Manrope-typografie, donkere groenblauwe tekst, blauw accent en lichte groene/perzikvlakken. Zes vaste navigatieknoppen worden op mobiel een raster van drie kolommen; kaarten vallen naar één kolom. Brede data-tabellen hebben een herkenbare focusbare scrollregio, zodat de pagina zelf niet horizontaal uitloopt. Tekst en gegevens zijn servergerenderd. Uitklappen van evidence en bronbeperkingen werkt met native `details`, zonder extra JavaScript of bewegende decoratie.

Nog vast te leggen na integratie: typecheck/buildresultaat, echte screenshots bij 360/390/768/1440 pixels, toetsenbordfocus, lange namen/URLs, lege bronnen, deelbronfouten, stale data, nulwaarden, beheerpreviewlinks en onafhankelijke toestemmingstests. Een mooie lege toestand is geen bewijs dat een echte provider is aangesloten.

Lokale broncontrole 24 september 2026: `tsc --noEmit --incremental false` geslaagd (exit 0); gerichte ESLint-controle van `hub-dashboard.tsx`, de publieke monitoringpagina, privacy en cookies geslaagd (exit 0). React-review toegepast: geen hooks/effects of client-fetches toegevoegd, providerimports zijn type-only, vaste componenten buiten de renderfunctie, native disclosure en semantische tabellen. Nieuwe browserbeelden en productiebuild vallen nog onder de rootintegratie; hier wordt geen visuele of provider-livegoedkeuring geclaimd.
