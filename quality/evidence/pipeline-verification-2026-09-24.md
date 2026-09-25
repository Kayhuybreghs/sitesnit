# Controle van de kwaliteitsinfrastructuur — 24 september 2026

Uitgevoerd in de lokale projectmap, Node 24. Geen productieacties of eigenaarvrijgave.

- `node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs --test tests/content-quality-pipeline.test.mjs tests/content-quality.test.mjs tests/content-evidence.test.mjs`: 23 tests, 23 geslaagd, 0 mislukt.
- Scoped ESLint op `scripts/content-catalog.mjs`, `scripts/content-quality-core.mjs`, `scripts/content-quality-data.mjs`, `scripts/content-quality-check.mjs`, `tests/content-quality-pipeline.test.mjs`: exit 0.
- `scripts/content-catalog.mjs` via dezelfde TypeScript-loader: exit 0, 56 publieke records. Bijbehorende 56 versieerbare reviewdossiers aanwezig. Geen reviews overschreven door de generator.
- `scripts/content-quality-check.mjs`: **verwachte exit 1**, 56 pagina's, besluit `blocked`. Geen ontbrekende routes, ontbrekende bewijsbestanden of manifest-stale fouten. De huidige 56 records hebben nog geen actuele complete technische/redactionele/claims/overlapbeoordeling of eigenaarvrijgave. Hun opgeslagen beoordeelde hashes zijn bovendien ouder dan de uiteindelijke bronafhankelijkheidssnapshot; dit wordt daadwerkelijk gerapporteerd.
- `git diff --check` voor de wijzigingen: geen whitespacefouten.

De negatieve vrijgave-uitkomst is een geslaagde werkingstest van de blokkade, **geen geslaagde inhoudelijke vrijgave**. Aantallen open punten zijn geen aantal inhoudelijke fouten en geen SEO-score. Bestaande technische/browserrapporten kunnen pas een dossier groen maken nadat hun onderzochte versie is gekoppeld en de resterende beoordelingen echt zijn gedaan.
