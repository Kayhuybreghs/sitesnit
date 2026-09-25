# Technische overdracht — pauze op verzoek

## Toestemming en prioriteit
Kay gaat slapen en wil de chat sluiten. Stop alle werkzaamheden tot zijn hervatverzoek. Agents zijn gestopt; geen lopende tests/builds en geen vervolgtaken ingepland. Previewserver mag blijven zoals hij was.

Masterprompt volledig gelezen: `C:/Users/Gebruiker/Downloads/Sitesnit_CODEX_ASTRA_MEGAPROMPT_v2.md`.
Laatste verduidelijking: Hub WEL bouwen als betaalde klantdienst (GA4/GSC/Vercel, bezoekers, tools/knoppen, uptime en werkzaamheden), gratis infrastructuur waar mogelijk. Groot auditproduct beoordelen als beperkte Cloudflare Free-pilot, niet definitief schrappen. Geen verzonnen tarief of aangesloten data. Resend Free aanbevolen; geen account/credentials/domeinverificatie aanwezig.

Geen toestemming voor productiepush/deploy, DNS, productiemigraties of echte mailing. Geen secrets printen; bestaande `.env.local` behouden.

## Werkmap/runtime
- `C:/Users/Gebruiker/Documents/ChatGPT/sitesnit 2/site` is leidend; grote bestaande git-diff behouden.
- Node24: `C:/Users/Gebruiker/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`.
- Python: overeenkomstige `dependencies/python/python.exe`.
- Preview `http://127.0.0.1:5184`, laatst eigen Nextserver PID **30144**; verifieer procescommandline opnieuw vóór stoppen. PIDbestand `.sites-runtime/preview-server.pid`; logs `preview-next-stdout.log` en `preview-next-stderr.log` in dezelfde map.
- Laatste publieke build geslaagd, sessie91285, 67 Nextentries. Daarna nog conceptkeuzeteksten, analytics en Hubcode gewijzigd; die zijn NIET meegebouwd.
- npm ontbreekt op PATH. Gebruikt `pnpm dlx npm@11`, met Node24-bindir vooraan `$env:Path` (anders soms Node18).
- Geïnstalleerd/vastgepind: better-auth1.7.5 MIT, pg8.16.3, @types/pg8.15.6. Installaties afgerond, `--ignore-scripts`, package-lock bijgewerkt.
- Geen GitHubpush/Verceldeploy in deze scope.

## Publieke implementatie
- Vijf tools logisch gegroepeerd in `/tools`; vier permanente redirects in `lib/tool-routes.ts` + nextconfig:
  `/websitecheck`→`/tools/website-check`, `/prijscheck`→`/tools/website-kosten-berekenen`, `/tools/offertevergelijker`→`/tools/website-offerte-vergelijken`, `/tools/ontwerp-je-website`→`/tools/website-ontwerp-tool`.
- Oude bronpagina's behouden, nieuwe routes hergebruiken logica. Interne history/restart in check-tool ook gecorrigeerd. Eindflow op canonieke routes nog browsermatig opnieuw nalopen.
- 18 artikelen: `lib/guides.ts`, `app/[guide]/page.tsx`, guide-page/widgets/guides.css/guide-refinements.css. Helpblokken via tool-layouts. Werkbladen, paginabomen, casevoorbeelden en migratie-CSV.
- SEO Venlo + SEO-onderhoud. Laatste redactionele revisies: eigen SEOcanvas, fictief werklog met bewijs/hercontrole/openpunt, bestaande pakketdekking, concreet regionaal voorbeeld.
- `concept-stories.ts` maakt drie conceptverhalen verschillend. Laatst `site-data.ts` keuzes aangepast zodat geen niet-getoond menu/collectie/contactfunctie wordt geclaimd. Die laatste zinnen nog bouwen.
- Twintig statische OG-PNG's in public/og/guides; generator scripts/render-guide-og.mjs. Bekeken screenshot scherp/leesbaar.
- Preview/productiehost/noindexguard aangescherpt; conceptcases publieke kandidaten. Alle echte publieke routes kandidaatindexeerbaar, privé/account/API/preview niet. Geen live-indexering bewezen.
- Fake klantreacties niet meer gerenderd; historische placeholderbron nog aanwezig maar ongebruikt.

## Bewijs en nog onvolledige kwaliteitscontrole
`reports/editorial-review.md`, `editorial-corpus-review.md`, content-corpus.json, content-manifest.json, internal-linkmap.json, seo/v2/summary.json.
Laatste HTMLaudit:55routes,3640links,geenissues; vóór laatste revisies. Browsermatrix6pagina's ×360/390/768/1440/1920 geenoverflow, screenshots bekeken, geen echte telefoon.
45 tests geslaagd: content-quality/content-evidence/tool-plans/database-runtime/consent. Dit omvat NIET nieuwe Hubauth.
Qualitycode lib/content-quality.ts + content-evidence.ts heeft echte afhankelijkheidshashes/fixtures. **Nog geen volledig gekoppelde productiepublicatiepoort** en geen eigenaargoedkeuring. Generatorhash omvat nu ook renderer/widgets/serviceprijzen.
`reports/requirements-traceability.md` is nog de oude initiële tabel: bijwerken naar echte status. Corpus/SEO opnieuw genereren na laatste build.

## Hub: exacte rootwerkplek, onvoltooid en ongetest
Nieuwe bestanden `lib/hub/`:
- schema.ts: additieve clients/sites/memberships/admins/invitations/integrations/snapshots/workitems/monthlyreports/uptime/adminlog/mailusage.
- connection.ts: node:sqlite lokaal en pgPool productie; lokale async transacties geserialiseerd. Geen migratie uitgevoerd.
- access.ts: verified identity + membership per site; admin vraagt twoFactorEnabled. Geen automatische admininzage in klantdata; gelogde preview nog bouwen.
- invitations.ts:64hex randomtoken,alleenhash,48uur; accept+membership transactie. Races/rollback/partialfailure nog testen.
- mail.ts: Resendadapter, alleen explicietenabled/key/from; reserveert90/dag2800/maand, idempotency. Nog geen volledige outbox, nog testen.
- auth.ts: Better Auth1.7.5 credentiallogin/verificatie/reset/TOTP; alleen registratie met inviteheader; prefixedtables, HttpOnly/SecureHTTPS/Lax, DB ratelimits, telemetryuit. **Nog typechecken**, mogelijktypefouten.

Nog NIET gebouwd: runtimefactory, auth-handler, login/registratie/verificatie/reset/MFA UI, Hubroutes/site-subroutes/adminUI, migraties/bootstrap, snapshotsync, providercredentials, uptimeworker/incidenten/dekking, maandrapporten, publieke monitoringdienstpagina. Geen live koppelingen. Bestaand app/chatgpt-auth.ts ongeschikt voorVercel, NIET gebruiken.
Better Auth officiële docs bekeken: installation, SQLite(node:sqlite), PostgreSQL, database/getMigrations, 2fa, magic-link. Magiclink handhaaft niet automatischTOTP, daaromcredentiallogin gekozen. getMigrations uit better-auth/db/migration biedt compileMigrations/runMigrations. Lokale testmigratie mag; geen prodmigratie.
Types: node_modules/better-auth/node_modules/@better-auth/core/src/types/init-options.ts. Admin kanTOTPuitzetten tenzijextra guard: nogafschermen. Authhookpartialfailure/membershipclaim/geverifieerdeemail/MFA-bypass moeten nadrukkelijk integratietests krijgen.

## Agentopleveringen — allemaal gestopt
1. `/root/hub_provider_adapters`: lib/hub/providers/{common,ga4,search-console,vercel,cache}.ts; tests/hub-providers.test.mjs; docs/hub-providers.md. **11/11 offlinefixtures geslaagd**. Geen typecheck/livecalls. GA4 totals/daily/channels/landingPages/devices/countries/events elkProviderResult; GSC totals/daily/queries/pages apart; Vercelv7deployments alleenveiligevelden. Dependencies fetch/getAccessToken/now; rootmoetauth/snapshotDB/UIintegreren.
2. `/root/v2_editorial_review`: lib/analytics-events.ts; cookie-consent/check-tool/3toolclients/tool-components aangepast; tests/analytics-events.test.mjs; docs/hub-events.md. **13tests geslaagd (7events+6consent)**. Geenlint/typecheck/build/browsertest. Eventsenkelnaexplicieteconsent, geenantwoorden/persoonsdata/URLinput. Hub/account/rapportuitgesloten. Privacy-/cookiespagina's nog bijwerken (bannerwel). ToolIDs websitecheck,prijscheck,offertevergelijker,automatiseringsplan,ontwerp_website. Events tool_start/tool_complete/cta_click. Bestaande lokale api/events lossebronbehouden.
3. `/root/v2_technical_review`: docs/gratis-audit-capaciteit.md afgerond. BrowserRunFree10browsermin/dag,5crawljobs,100pages/job; contentcrawlgeen100Lighthouses. Futurepilot5staticpages,1render,2audits/dag; renderuit totdat egress/DNSrebindingbeschermingbewezen. WorkersFree10msCPU/cron,50subrequests,6connections,5crons/account; uptimevoor5sites/5minapart. GitHubActionsnietgeschiktalscommerciëleproductiejobbackend. Geenprovisioning/benchmark/externalcrawl. Agentwachtteuptimescope, nuookgepauzeerd.

## Hervatten
1. Leesstatusenuserhervatverzoek. TypecheckHubauthbasis; adapters/events integrerenzonderoudwerkterugdraaien.
2. BouwveiligeHub metlokale positieve/negatievefixtures; geengefingeerdeproductiedata. Credentialspasveiligvragenwanneerconcreetklaar.
3. BesluitCloudflarepilotbinnenechtegratislimieten enbeschermingsgrenzen; apartvanbetaaldeHub.
4. Werkprivacy/eventbeschrijvingenbij. Bouwpubmonitoringpagina metduidelijkedemo,geenprijs/SLAverzinnen.
5. Finale publieke regressie, alletoolflows, Hubautorisatie/MFA, browsermobiel+desktop, statusmatrix+releaseprocedure.

## Commando's
`node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs --test tests/content-quality.test.mjs tests/content-evidence.test.mjs tests/tool-plans.test.mjs tests/database-runtime.test.mjs tests/consent.test.mjs`
`node --experimental-transform-types --import ./scripts/typescript-test-loader.mjs tests/logic.test.ts` (opgeslagen Lighthousefixture, geenfreshlivescan).
`node node_modules/next/dist/bin/next build --webpack`
`node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs scripts/content-catalog.mjs`
`python scripts/content-corpus.py`
`python scripts/seo-check.py v2`
Edgeaudit scripts/seo-edge-check.mjs nog nietherhaald; esbuild hadsandboxrechtenprobleem.
CUAbrowser: na contextreset eerst rewriteDocumentation. Eerdereagenttab5/bindingtoolsReviewTab/reviewBrowser1; kanveranderdzijn. Viewportresettenvoorafronding; geengebruikerstabsluiten.
