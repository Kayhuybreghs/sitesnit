# Sitesnit

Sitesnit is een Nederlandstalige website voor webdesign, webapps, apps voor iPhone en Android, SEO en automatisering. De site bevat projecten, pakketten, vijf interactieve tools en een contactaanvraag. De websitecheck combineert vijftien vragen met Google PageSpeed Insights. De prijscheck stelt eveneens vijftien vragen. Een resultaat is beschikbaar zonder contactgegevens af te geven; een toolsamenvatting wordt alleen met toestemming aan een aanvraag toegevoegd.

De huidige uitvoering gebruikt **Next.js 16.3.4, React 19.2.6 en Node.js 24**. Het doelplatform is Vercel, met Neon PostgreSQL voor productieopslag. Alleen de lokale preview kan expliciet SQLite gebruiken. De oude Vinext/Cloudflare-instructies in historische rapporten zijn geen start- of publicatiehandleiding meer.

Zie [het eindrapport](docs/eindcontrole-vercel.md) voor de actuele bevindingen en tests, en [Vercel, opslag en beheer](docs/vercel-beheer.md) voor de omgevingsvariabelen, migratie, bewaartermijnen en nog ontbrekende live koppelingen. [OPLEVERING.md](OPLEVERING.md) bevat de actuele oplevering en historische ontwerpnotities. De oudere SEO-resultaten in [docs/seo-release.md](docs/seo-release.md) en [docs/seo-limburg-vergelijking.md](docs/seo-limburg-vergelijking.md) horen bij de daar genoemde datum en build.

## Lokaal starten

Gebruik een terminal waarin `node --version` versie **24.x** meldt. Werk vanuit de map `site`:

```powershell
Set-Location -LiteralPath 'C:\Users\Gebruiker\Documents\ChatGPT\sitesnit 2\site'
node --version
npm ci
if (-not (Test-Path -LiteralPath '.env.local')) {
  Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
}
```

Zet in `.env.local` voor lokale aanvraagopslag `SITESNIT_LOCAL_SQLITE=true`. Laat `SITESNIT_INDEXING_ENABLED=false` en Analytics uit zolang die niet volledig is ingericht. Vul benodigde servergeheimen rechtstreeks in het lokale bestand in; zet ze niet in de terminalopdracht of chat. Bestaande `.env.local`-inhoud blijft in de bovenstaande stap behouden.

Voor ontwikkeling met automatische vernieuwing:

```powershell
npm run dev
```

Voor een controle van de productiebuild: stop de eigen ontwikkel-/previewserver en voer achtereenvolgens uit:

```powershell
npm run build
npm run start
```

De preview is bereikbaar op [http://127.0.0.1:5184](http://127.0.0.1:5184). `start` heeft geen hot reload: bouw en herstart na bronwijzigingen. Draai `dev` en `start` niet tegelijk op dezelfde poort. Op Windows moet het eigen oude proces gestopt zijn voordat zijn buildbestanden worden vervangen; beëindig geen andere Node-processen.

SQLite wordt pas bij het eerste echte databaseverzoek aangemaakt in `.sites-runtime/storage/sitesnit.sqlite`. De tabellen worden daar automatisch voorbereid. Paginaweergave initieert geen databaseverbinding. Zonder opslagconfiguratie blijven publieke pagina's leesbaar, maar een aanvraag meldt geen succesvolle ontvangst en database-afhankelijke scans/tellingen kunnen niet worden uitgevoerd.

## Onderhoud

| Onderdeel | Bron |
|---|---|
| Identiteit, btw, betaling en hostingvoorwaarden | `lib/business.ts` |
| Eenmalige websitepakketten en projectgegevens | `app/site-data.ts` |
| Routekaart, titles, descriptions en schema-inhoud | `lib/route-catalog.ts`, `app/seo.tsx` |
| Indexeerbaarheid en definitieve oorsprong | `lib/seo-policy.ts` |
| OG-bestanden, alttekst en afmetingen | `lib/social-images.ts`, `public/og/` |
| Vragen en prijsadvies | `lib/questions.ts`, `lib/price.ts` |
| Technisch en inhoudelijk verbeteradvies | `lib/lighthouse.ts`, `lib/advice.ts` |
| Database-adapters en serverconfiguratie | `lib/database*.ts`, `lib/runtime.ts`, `lib/server.ts` |
| PostgreSQL-schema | `db/postgres/0001_sitesnit.sql` |
| Bewaartermijnen en onderhoudsendpoints | `lib/retention.ts`, `app/api/internal/` |
| Cookiekeuze en toegestane Analytics-invoer | `lib/consent.ts`, `app/cookie-consent.tsx` |

De netto pakketbasissen zijn €895, €1.895 en maatwerk vanaf €2.750. Btw-weergave, 60% aanbetaling, 40% bij afronding en de minimale eerste hostingperiode komen uit de centrale bedrijfsregels. Het door de eigenaar genoemde gemiddelde van circa €4.000 is context, geen rekenregel. Pas een prijs of voorwaarde centraal aan en controleer daarna kostenpagina, prijscheck, contact, voorwaarden en JSON-LD samen.

## Controleren

Voer vanuit `site` uit:

```powershell
npx tsc --noEmit
npm run lint
npm run test:logic
npm run test:runtime
npm run build
```

Met de zojuist gebouwde lokale server actief:

```powershell
node scripts/test-next-api.mjs --label next-production
npm run seo:edges
```

De API-test maakt twee duidelijk synthetische lokale aanvragen, controleert uitsluitend de eigen UUIDs en schrijft een rapport onder `reports/seo/`. Er is expliciete lokale SQLite-configuratie nodig; de test weigert Vercel en externe hosts. De geautoriseerde healthcheck gebruikt `CRON_SECRET` intern. Retentieverwijdering wordt uitsluitend op geïsoleerde `:memory:`-fixtures getest. Geen Google-scan of e-mail wordt door deze test gestart.

`npm run seo:check` voert aanvullend de HTML-/linkcrawl uit. Hiervoor zijn de projectafhankelijkheden en Python 3 nodig; stel zo nodig `SEO_PYTHON` in op de Python-executable. Browsercontroles en Lighthouse-metingen moeten de werkelijke huidige build beschrijven. Historische scores zijn geen bewijs voor een nieuwe build, live Vercel-prestaties of een fysieke telefoon.

## Huidige publicatiestatus

De code is op Vercel en Neon ingericht, maar een live Vercel-project, de echte Neon-database, productiegeheimen en publieke domeinkoppeling zijn nog niet geleverd of op afstand geverifieerd. Analytics staat uit totdat zowel de property als de privacy-instellingen zijn ingericht. Een ingediende aanvraag wordt bij geslaagde opslag ontvangen; er is nog geen automatische e-mailmelding of gekoppelde boekingsagenda. Definitieve e-mail, telefoon, KvK en btw-identificatie moeten nog worden ingevuld.

Voor livegang volgt daarom de concrete procedure in [docs/vercel-beheer.md](docs/vercel-beheer.md). `noindex` beschermt een preview tegen indexering, maar vervangt geen toegangsbeveiliging.
