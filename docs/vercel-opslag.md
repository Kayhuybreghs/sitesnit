# Sitesnit runtime voor standaard Next.js / Vercel

Deze bestanden zijn voorbereid buiten de appcheckout. Er is niets geïnstalleerd of gedeployed door deze subtaak. De actuele npm-registry vermeldt `@neondatabase/serverless@1.1.0`; de parent heeft die versie inmiddels in de app geïnstalleerd. Gebruik een vaste versie in de lockfile. Node 24 wordt gebruikt voor de lokale SQLite-preview en tests.

## Integreren

Kopieer de mappen `lib`, `app/api/internal`, `db/postgres`, de twee `scripts`-bestanden en de test naar de overeenkomstige paden in de app. `lib/server.ts` vervangt bewust de oude Cloudflare-runtime-import. De bestaande `lib/request-body.ts` blijft nodig en is niet gekopieerd of aangepast. `lib/runtime.ts` is gemarkeerd met `server-only`; de pure database- en retentiemodules blijven rechtstreeks te testen.

Verwijder/isoleer de ongebruikte legacy `db/index.ts`-Cloudflare-adapter uit eventuele nieuwe imports. Deze implementatie gebruikt de kleine `AppDatabase`-interface; het is geen volledige D1- of Drizzledriver.

Omgevingsvariabelen:

| Variabele | Gebruik |
| --- | --- |
| `DATABASE_URL` | Neon PostgreSQL-verbinding, uitsluitend op de server. Geen `NEXT_PUBLIC_`-prefix. |
| `SITESNIT_LOCAL_SQLITE=true` | Alleen expliciet voor de lokale preview; gebruikt `.sites-runtime/storage/sitesnit.sqlite`. Heeft voorrang op een eventueel lokaal aanwezige `DATABASE_URL`, zodat de lokale test niet onverwacht een echte database raakt. Bij aanwezige `VERCEL` schakelt deze vlag de opslag juist uit; nooit productie-SQLite. |
| `CRON_SECRET` | Willekeurig secret van minimaal 16 tekens; bij voorkeur 32 random bytes. Beschermt beide interne beheerendpoints. |
| `RATE_LIMIT_SECRET` | Eigen willekeurig geheim voor het pseudonimiseren van clientadressen. De bestaande server-side `PAGESPEED_API_KEY` dient alleen als compatibele fallback; lokaal wordt anders een tijdelijke processleutel gebruikt. |
| Bestaande API/SEO/GA-variabelen | Worden door `runtime()` uit `process.env` doorgegeven. Geen variabelen worden automatisch naar de browser geëxporteerd. |

`runtime()` en `getDatabase()` verbinden niet met een database. Publieke pagina's en metadata kunnen renderen wanneer productieopslag nog niet geconfigureerd is. Pas een daadwerkelijke `run`, `all` of `first` opent de gekozen driver. Een ontbrekende configuratie levert bij de API een echte fout, geen fictief opslagsucces.

## PostgreSQL gereedmaken

Pas `db/postgres/0001_sitesnit.sql` eenmalig toe op de bedoelde echte database. Het schema bewaart de bestaande tabel- en kolomnamen. Milliseconden-timestamps gebruiken `BIGINT`, tellerwaarden `INTEGER`. Retentievelden hebben indexen.

Er is een expliciete migratiescript voorbereid:

```text
node --env-file=.env.local scripts/migrate-postgres.mjs
```

Voer dit pas uit wanneer vaststaat dat de opgegeven `DATABASE_URL` bij de bedoelde database hoort. Het script maakt tabellen/indexen idempotent binnen een transactie. Het kopieert of wist geen bestaande data. `CREATE TABLE IF NOT EXISTS` repareert geen afwijkend bestaand schema; daarom controleert het healthendpoint daarna de benodigde kolommen.

De migratie draait **niet automatisch bij layout, build, cold start of een contactaanvraag**. Kopieer geen lokale synthetische testdata naar de productieomgeving.

## Compatibele queries

- `prepare(sql).bind(...values).run()` retourneert `{ success: true, results, meta: { changes } }` na een echte geslaagde query.
- `first()` retourneert de eerste rij of `null`; `first('kolom')` retourneert die waarde. `all()` is beschikbaar voor de interne schemacontrole.
- De adapter zet anonieme `?`-parameters om in PostgreSQL `$1`, `$2`, enzovoort en houdt waarden gescheiden van SQL. Strings, quoted identifiers, escaped quotes, comments en dollarquotes blijven intact.
- Dit is een adapter voor de gebruikte SQL-subset. Geen willekeurige SQLite-dialectvertaling, geen `exec`, `raw` of `batch`-emulatie en geen ondersteuning voor PostgreSQL-JSON-operators met `?`.
- Neon wordt via de officiële HTTP-driver aangesproken met `query(text, values)`, `fullResults`, `no-store` en een timeout van tien seconden. Foutmeldingen van de provider kunnen persoonsgegevens/SQL bevatten en worden niet doorgestuurd.
- `BIGINT`-resultaten worden uitsluitend naar een getal omgezet wanneer dat veilig kan. Grotere waarden blijven strings.
- De rate limiter gebruikt één atomische `INSERT ... ON CONFLICT ... DO UPDATE` met `count=rate_limits.count+1` om PostgreSQL-kolomambiguïteit te voorkomen. Het verlopen tijdvak verandert de sleutel, dus een apart delete-verzoek is niet nodig om de limiet te handhaven. Retentie verwijdert verlopen tellerrijen.
- Op Vercel wordt uitsluitend `x-vercel-forwarded-for` gebruikt en als IP gevalideerd. Aangeleverde `cf-connecting-ip` of gewone `x-forwarded-for` leveren geen vertrouwde identiteit. Buiten Vercel gebruiken alle lokale tests bewust de lokale identiteit.

## Retentie en beheerendpoints

- Aanvragen: ouder dan **12 kalendermaanden sinds `created_at`**, berekend in UTC met correcte schrikkeldagafhandeling.
- Events: ouder dan **90 dagen sinds `created_at`**.
- Rate-limit-rijen: verlopen `reset_at`.
- Alleen datumgrensvergelijkingen bepalen wat wordt verwijderd; herhaald uitvoeren is idempotent. De response bevat alleen aantallen en het opruimmoment, geen aanvraaginhoud.

Routes:

- `GET /api/internal/storage`: alleen schema/verbinding controleren, geen testaanvraag opslaan.
- `GET` of `POST /api/internal/retention`: opruimen na geldige authenticatie.

Beide eisen `Authorization: Bearer <CRON_SECRET>`. Ontbrekend, te kort of onjuist secret geeft 401 vóór databasegebruik. Databasefouten geven 503; responses zijn `no-store` en `noindex`.

De root kan later een dagelijkse Vercel-cron naar `/api/internal/retention` configureren. Vercel verstuurt `CRON_SECRET` automatisch in de Authorization-header. Die scheduler is hiermee **voorbereid, nog niet actief**. Een helper voor opportunistische cleanup kan `cleanupRetention()` hergebruiken, maar vervangt een geteste scheduler niet. Cronlevering is best effort; controle van de laatste geslaagde uitvoering en herstel na mislukking blijft nodig.

Let op de precieze privacytekst: de database heeft een ontvangstdatum, geen datum van het laatste e-mailcontact. Deze code kan niet zelfstandig een externe mailbox, fiscale administratie of providerback-ups opruimen. Vermeld daarvoor het werkelijk toegepaste beleid en geen uitgebreidere automatische verwijdering dan er bestaat.

## Uitgevoerde tests

```text
node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs --test tests/database-runtime.test.mjs
```

De loader is uitsluitend voor de Node-testresolver van extensionless TypeScript-imports. Geen bundler of extra testdependency nodig.

**8 tests geslaagd:** parameterbinding/injectie, onveranderlijke statements, Neon HTTP-argumenten/resultaten/foutredactie met een mock, expliciete lokale modus en blokkade op Vercel, echte SQLite-opslag en idempotente aanvraag-ID, atomische teller met twaalf gelijktijdige aanroepen en acht toegestane, retentie met oude/grens/nieuwe records inclusief schrikkeldag, ongeautoriseerde cleanup en veilige schemacontrole. Alle databases waren `:memory:`; geen echte aanvraag- of productiegegevens geraakt.

Scoped ESLint: **0 fouten**. Virtuele TypeScript-controle tegen de werkelijke Next- en Neon-dependencies: **0 diagnostics**. Geen volledige appbuild, browserflow of live Neon-verbinding in deze subtaak getest. De root voert die integratiecontrole uit; live Neon blijft afhankelijk van een echte databaseverbinding.
