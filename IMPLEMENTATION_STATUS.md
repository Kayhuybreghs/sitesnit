# Sitesnit masterprompt v2 — lokale voortgang 24 september 2026

Actuele overdracht: `docs/hervatten-2026-09-24.md`. Bewijs: `docs/hub-verificatie-2026-09-24.md`. Eis-voor-eisrestpunten: `docs/masterprompt-v2-restpunten.md`.

Hub-auth, MFA, rollen, beheer, dashboard, bronadapters, uptime-ingest en lokale tests zijn gebouwd. Publieke monitoringdienst en configuratie-/privacydocumentatie toegevoegd. Vijf tools, achttien artikelen en twee SEO-pagina's uit de eerdere ronde zijn behouden en verder gecontroleerd.

124 Node-tests, 16 HTTP-grenzen en productiebuild/TypeScript geslaagd. Lokale publieke crawl: 56 routes, 3.769 links, nul meldingen. Browseremulatie: 360/390/768/1440/1920. Geen echte telefoon, productie-PostgreSQL, live providerdata of echte mail getest.

Vrijgave blijft onvolledig: inhoudelijke bewijsdossiers/eigenaarreview, live inrichting, Hubprijs, operationele retentie en monitorbenchmark. Grote auditcrawler/scanaccounts/weekscan zijn niet uitgevoerd binnen de gratis beperking. Zie het actuele restpuntenregister; onderstaande startinventaris is uitsluitend historisch.

Geen productiepush/deploy/DNS/mailing/productiemigratie. Testaccounts worden na de browserproeven gericht verwijderd; verificatienotitie registreert de afloop.

---
## Historische startinventaris

Bron: Sitesnit_CODEX_ASTRA_MEGAPROMPT_v2.md, volledig gelezen op 22 september 2026. Alleen deze specificatie bepaalt deze scope. Bestaande wijzigingen en persoonlijke foto's blijven behouden.

## Toestemming
- Lokaal implementeren en testen: toegestaan.
- Gebruiker vraagt alle openbare pagina's indexeerbaar te maken. Accounts, rapporten, API's en Hub blijven privé; lokale en Vercel-previewhosts blijven noindex.
- Geen toestemming in deze scope voor productiepush/deploy, DNS, productiemigraties, echte mailing of betaalde diensten.

## Uitgangspunt
- Next.js 16.3.4, React 19, bestaande vijf tools, centrale prijzen, PostgreSQL/SQLite-adapter.
- Geen scanaccounts, auditworker, auditjobs of klant-Hub aanwezig.
- Technische onafhankelijke inventaris: 14 bestaande runtime-/consenttests geslaagd, uitsluitend lokale fixtures. Geen bewijs van productiegedrag.
- Bestaande git-diff is omvangrijk en blijft intact. Geen reset, stash of volledige vervanging.

## Werkpakketten
1. IN UITVOERING: publieke routehiërarchie, directe interne links, redirects, gegroepeerde toolpagina.
2. NIET AF: 18 zelfstandige inhoudspagina's, SEO-diensten, inhoudsmanifest, redactionele en overlapreview.
3. NIET AF: veilige onafhankelijke auditworker, echte controles met bewijs, benchmarks.
4. NIET AF: auth, scanopslag, rechten, quota, planning, e-mailuitvoer en retentie.
5. NIET AF: invitation-only Hub, provideradapters, werklog en autorisatietests.
6. NIET AF: volledige visuele, toegankelijkheids-, veiligheids- en indexeerbaarheidscontrole.

## Open bedrijfs-/operationele feiten
Geen bestaand workerhostingcontract of altijd-aan beschikbare machine aangetoond. Geen actieve authmailprovider of Google Hub-integraties vastgesteld. Geen garanties, echte resultaten, accounts of e-mailverzending suggereren zolang deze niet zijn ingericht en getest.

## Volgende actie
Werkpakket 1 uitvoeren; daarna inhoud en nieuwe architectuur stapsgewijs bouwen. Per stap bewijs vastleggen in reports/requirements-traceability.md. Niet-aangetoonde onderdelen blijven niet getest of geblokkeerd.

## Aanvullende artikelronde 24 september
De 18 artikelrecords hebben actuele inhouds-/claim-/overlapreview. E2-illustratielabel en mobiele titeloverflow hersteld; 90 route/breedtewaarnemingen zonder overflow. Geen volledige widget-/accessibilityvrijgave of ownerapproval. Bewijs in quality/evidence/article-browser-2026-09-24.md en articles-current-2026-09-24.md.
