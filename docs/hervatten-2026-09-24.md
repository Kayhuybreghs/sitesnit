# Sitesnit — actuele overdracht 24 september 2026

Deze overdracht vervangt de pauzestatus van 22 september. De masterprompt blijft `C:/Users/Gebruiker/Downloads/Sitesnit_CODEX_ASTRA_MEGAPROMPT_v2.md`. Bescherm de bestaande omvangrijke lokale wijzigingen; geen reset/stash/vervanging.

## Wat nu lokaal bestaat

- Vijf canonieke tools onder `/tools`, directe redirects, achttien kennisartikelen, twee SEO-pagina's en eigen OG's uit het eerdere werk.
- Invitation-only Hub met geverifieerde e-mail, wachtwoordherstel, sessie-intrekking, beheer-MFA per sessie en server-side klantafscherming.
- Beheer voor klanten/websites, uitnodigingen, bronconfiguratie, werkitems en maandrapporten. Beheerpreview is apart geautoriseerd en gelogd.
- GA4-, Search Console- en Vercel-adapters met servergeheimen, sitegebonden bronrechten, beperkte rapporten, cache en afzonderlijke foutstatussen. GA4 bevat tool-/knopgebeurtenissen; deploymentstatus is geen uptimebewijs.
- Uptime-ingest met HMAC, replaybeveiliging, meetgaten en incidentbevestiging. Losse, standaard uitgeschakelde Cloudflare uptime- en syncworkers.
- Publieke `/diensten/website-monitoring`, eigen metadata/schema/OG, privacy-/cookie-uitleg en configuratiedocumentatie.
- `quality/`: versieerbare dossiers voor alle 56 publieke routes. De CLI controleert coverage, bewijspaden en bron-/bedrijfs-/assethashes. Geen gefingeerde inhouds- of eigenaargoedkeuring.

SEO-auditweergave in Hub is bewust niet beschikbaar: daarvoor moet eerst een echte audit bestaan met expliciete sitegebonden deeltoestemming. Google-inzichten staan wel onder Google. De grote openbare auditcrawler, scanaccounts, 300-controlesclaim en weekrapporten zijn niet gebouwd of geactiveerd.

## Besluiten en grenzen

- Hub wordt een aanvullende betaalde klantdienst; bedrag/scope nog afspreken. Geen bedrag verzinnen.
- Gratis infrastructuur is uitgangspunt. Resend Free is voorgesteld; geen account, providerkey of afzenderdomein ingericht. Google, Vercel en Cloudflare voor Hub nog niet echt aangesloten.
- Publieke indexeerbaarheid mag; private Hub/API's en lokale/previewhosts blijven noindex. Authenticatie is de toegangsbeveiliging.
- Geen productiepush/deploy, DNS, productiemigratie, echte mailing of betaalde resource uitgevoerd/toegestaan binnen deze scope.

## Bewijs en beperkingen

Zie `hub-verificatie-2026-09-24.md` voor de exacte eindrun. Lokale productiebouw, TypeScript, ESLint, 124 Node-tests, echte lokale HTTP-autorisatiecontroles en browserroutes zijn uitgevoerd. Browsermatrix: 360/390/768/1440/1920 pixels; geen fysieke telefoon. Provider- en mailtests gebruiken fixtures, geen echte klantdata.

De twee fictieve browseraccounts/sites zijn na de laatste HTTP/browsercontrole gericht verwijderd met `.sites-runtime/cleanup-hub-browser-fixtures.mjs`. Afzonderlijk bevestigd: nul van deze accounts/sites. Overige data zijn bewaard. Een nieuwe browserproef vereist nieuwe expliciete lokale fixtures; de oude bekende testlogins werken niet meer.

## Nog af te maken vóór publicatie/activering

1. Inhoudelijk reviewbewijs voor de overige publieke pagina's actualiseren en routegebonden vrijgave afronden. De 18 artikelen hebben nu een actuele inhouds-/claim-/overlapreview met elf werkelijk geopende primaire bronnen en een 90-waarnemingen-breedtematrix; hun volledige interactieve/toegankelijkheidscontrole blijft apart open. De quality-CLI staat terecht op `blocked`; een groene build of agentreview is geen eigenaarvrijgave. Zie `masterprompt-v2-restpunten.md` RQ-01–24 en de nieuwe article-evidence in `quality/evidence/`.
2. Hubprijs, eerste echte beheerdersmail en operationele bewaar-/verwijderprocedure vastleggen. Ruwe uptime wordt nu tijdens ingest na 90 dagen verwijderd; nog geen dagelijkse aggregatie of onafhankelijke retentietaak.
3. Na afzonderlijke toestemming: PostgreSQL-migratie eerst op testbranch, Resend met geverifieerde afzender, Google-serviceaccount/propertyrechten, beperkt Verceltoken en Cloudflaresecrets. Handleiding: `setup-hub-integrations.md`.
4. Werkelijke rapporten met dashboards vergelijken, echte mail/HTTPS-cookie/reset testen, gevulde mobiele tabellen beoordelen; Cloudflare Free-CPU en minimaal 48 uur monitor-dekking meten. Monitorstilvalalarmering ontbreekt nog. Geen SLA/ongeclausuleerde gratis-capaciteit beloven.
5. Brede openbare audit alleen heropenen bij bewezen veilige netwerkisolatie en haalbare gratis capaciteit; zie `gratis-audit-capaciteit.md`. Geen GitHub Actions als klantenauditdienst inzetten.

## Hervatten

Werkmap: `C:/Users/Gebruiker/Documents/ChatGPT/sitesnit 2/site`. Node 24 staat in de gebundelde Codex-runtime. Preview is Next `start` op `127.0.0.1:5184`; eigen PID staat in `.sites-runtime/preview-server.pid`. Verifieer procespad/commandline vóór herstart. Geen geheimen uit `.env.local` of Hubconfig printen. Lokale authdata staat apart in `.sites-runtime/storage/hub.sqlite` en gaat niet naar Git.

Veilige volgende lokale taak: actuele inhouds-/claimreview en bewijsdossiers afronden, zonder eigenaarvrijgave te fingeren. Voor live koppelingen eerst ontbrekende configuratie en expliciete productieautorisatie regelen.
