# Versiegebonden inhoudscontrole

Dit register staat bewust buiten de genegeerde `reports/`-map. Het bevat geen secrets of klantdatasets. Het is reviewbewijs, geen productieconfiguratie. Alle publieke catalogusroutes worden geïnventariseerd, inclusief bestaande gewijzigde pagina's, vijf tools, achttien artikelen, twee SEO-pagina's en de monitoringdienst. Private Hubroutes horen niet in dit publieke manifest.

## Gebruik

Voer vanuit de projectmap met Node 24 uit:

```text
node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs scripts/content-catalog.mjs
node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs scripts/content-quality-check.mjs
node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs --test tests/content-quality-pipeline.test.mjs tests/content-quality.test.mjs tests/content-evidence.test.mjs
```

Het eerste commando actualiseert uitsluitend het manifest en de compatibele lokale catalogusbestanden. Het verandert geen reviews. Het tweede commando gebruikt `lib/content-quality.ts`, rekent actuele bron-/bedrijfs-/bronregister-/assethashes opnieuw uit, controleert routedekking en bewijsbestanden en eindigt met exitcode 1 bij openstaande of verouderde beoordelingen. Geen `--force` of automatische goedkeuringsoptie.

Deze expliciete vrijgavecontrole is niet gekoppeld aan `next build`, sitemap of robots. Een preview mag gebouwd worden met open reviewpunten. Bestaande openbare indexeringsbesluiten worden niet omgedraaid. De opdracht om publieke pagina's technisch indexeerbaar te maken is niet opgeslagen als persoonlijke inhoudsgoedkeuring van Kay.

## Wat hashes wel en niet bewijzen

Per pagina zijn de renderer, toepasselijke layouts en transitieve lokale imports opgenomen, waaronder TSX en CSS. Het manifest benoemt de bestanden plus hun SHA-256. Bedrijfs-/prijsbronnen, het bronregister, letterlijk gevonden assetpaden en de eigen OG-afbeelding worden eveneens gehasht. Importdetectie gebruikt de TypeScript-parser; externe packages worden niet uitgevoerd. Afhankelijkheden buiten de projectmap of ontbrekende lokale imports/letterlijke assets laten het commando stoppen.

Deze controle is conservatief: een wijziging in een gedeelde module of alleen opmaak kan meerdere reviews verouderen. Dynamisch samengestelde assetnamen, runtime-data en inhoud die uitsluitend door providers wordt aangeleverd zijn niet volledig statisch afleidbaar. Browser-/corpuscontrole blijft daarom noodzakelijk. Een hash is versie-identiteit, geen inhoudelijk kwaliteitsoordeel.

## Reviewrecords

`reviews/<id>.json` volgt de bestaande engine: `status`, `technicalStatus`, `editorialStatus`, `similarityStatus`, `claimsStatus`, vier hashes, `reviewerType`, `reviewedAt`, `evidence`, `evidenceFiles` en `openIssues`.

De initiële records zijn uitdrukkelijk een beoordeling van ontbrekend bewijs, geen nieuw afgegeven volledige paginareview. Alle records houden `ownerApproved: false`; oude artikelhashes blijven bewaard om veroudering zichtbaar te maken. Bestaande redactionele reviews en lokale technische/corpussnapshots staan met hun historische context in `evidence/`. Een oud rapport wordt niet opnieuw gedateerd alsof een nieuwe browsercontrole heeft plaatsgevonden.

Werk een review pas bij nadat de concrete actuele passages, claims, overlapparen en gebruikersroute opnieuw zijn beoordeeld. Leg de getoetste inhoudsversie en bewijsbestanden vast. Het automatisch actualiseren van hashes om een blokkade te laten verdwijnen is geen review. Technische HTTP/metadataresultaten bewijzen niet dat de tekst of claim correct is.

Voor een werkelijk ontvangen eigenaarvrijgave zijn daarnaast vereist: `reviewerType: owner`, `ownerApproved: true`, `status: approved_for_release`, alle enginecontroles geslaagd, en `ownerApproval` met `by`, `approvedAt`, de vier goedgekeurde hashes en `evidencePath`. Dat bewijs moet voorkomen in `evidence` en `evidenceFiles`. De CLI kan controleren of zo'n record expliciet en consistent is, niet bewijzen wie een bestand heeft geschreven. Verzin daarom nooit goedkeuring. Positieve testfixtures zijn herkenbaar fictief en zijn geen productie-reviewrecords.

## Resterend

Actuele inhoudelijke claimcontrole en eigenaarbeoordeling zijn nog open. Het per-claimregister en de actuele volledige overlaphercontrole worden niet door de generator gefingeerd. Zie `docs/masterprompt-v2-restpunten.md` voor de eis-voor-eisafbakening.
