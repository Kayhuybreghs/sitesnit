# Lokale Hub-verificatie — 24 september 2026

Gebruikersroute: uitnodiging en bevestiging → klantlogin → toegewezen website → bronrapporten/werklog → beheeractie → opgeslagen wijziging zichtbaar voor de juiste klant. Infrastructuur: Next.js productiepreview op 127.0.0.1:5184, aparte SQLite-Hubdatabase, Node 24. Geen productieactie.

## Aangetoond

- Productiebuild met webpack en geïntegreerde TypeScript-check geslaagd. De build bevat de Hub/auth/API-routes en de publieke monitoringpagina.
- Gecombineerde Node-fixtures: 124 tests geslaagd, inclusief aanvullende reset- en kwaliteitsgateproeven. Bewijs: `reports/hub-final-tests-2026-09-24.log`. De bestaande prijs-/15-vragen-/Lighthouse-advieslogica slaagt eveneens; de Lighthouse-test gebruikt een eerder vastgelegde echte response, geen nieuwe scan van vandaag.
- Gerichte ESLint voor Hub, APIs, providers en workers: geen fouten of waarschuwingen. Projectbrede ESLint met `--quiet`: geen fouten.
- Lokale HTML/SEO-crawl: 56 publieke routes, 3.769 links, nul gerapporteerde fouten (`reports/seo/hub-final/summary.json`). Canonicals, metadata, schema, afbeeldingen en interne links zijn door de bestaande crawler beoordeeld. Privé-Hubroutes horen niet in de publieke catalogus.
- 16 echte lokale HTTP-grenzen: anonieme redirect/no-store/noindex, CSRF, registratie zonder uitnodiging, echte login/HttpOnly-cookie, toegewezen site, andere site, vervalste beheerpreview, adminpagina, klantmutatieverbod, schedulersecret, uptime fail-closed, veilige resetcallback, verborgen MFA-disable en sessie-intrekking bij uitloggen. De extra controle bevestigt een 404 voor de auditroute zolang geen auditproduct met deeltoestemming bestaat. Bewijs: `reports/hub-http-2026-09-24.json`.

## Auth, isolatie en gegevens

De fixtures gebruiken de echte Better Auth-handlers met wachtwoordhashes, geverifieerde e-mail en een lokale mailfixture. Echte TOTP-/herstelcodecontrole wordt getest. Een tweede sessie van vóór MFA-inschakeling krijgt geen beheerrechten. Verlopen of ingetrokken sessies en ingeschakelde trust-devicecookies leveren geen geldig beheerbewijs op zonder bevestigde factor voor die sessie.

SQLite-toegang en auth worden via dezelfde reentrante wachtrij gescheiden: een losse write kan niet in andermans async transactie vallen en mee terugrollen. Productie-PostgreSQL heeft een aparte pooltransactie; deze productieadapter is hier niet live getest.

De providerfixtures controleren beperkte scopes, werkelijke RSA-handtekening van tokenverzoeken, cache, vertraging, afzonderlijke fouten, ingetrokken toegang, geen verzonnen nulcijfers en site-/projectgrenzen. Een late oude sync na gewijzigde bronconfiguratie wordt bij het lezen geweigerd.

Uptimefixtures controleren HMAC, geldigheid, doeltoewijzing, batchgrens, redirectweigering, HEAD/GET-fallback, onbekende uitkomsten, incidentbevestiging, meetgaten, atomische replayclaim, rollback/retry en geen dubbele meetrijen. De worker is niet werkelijk op Cloudflare gedraaid.

## Browserbewijs

De echte lokale browser is gebruikt, zonder auth-bypass:

1. Fictieve klant logt in en ziet uitsluitend fixturewebsite A.
2. Rechtstreeks website B, `?preview=1` op B en `/hub/admin` worden geweigerd, zonder B-gegevens.
3. Uitloggen beëindigt toegang.
4. Afzonderlijke fictieve beheerder logt in met wachtwoord én authenticatorcode.
5. Bestaande fictieve taak geselecteerd, toelichting bewerkt en opgeslagen. De beheerpreview toont daarna werkelijk de gewijzigde tekst, met zichtbare beheerbanner en behouden previewcontext.

Screenshots zijn daadwerkelijk bekeken: monitoring op desktop en mobiel, klantdashboard op desktop en mobiel, beheer op mobiel. Geen horizontale pagina-overflow bij 360, 390, 768, 1440 en 1920 pixels voor het dashboardoverzicht, bezoekers, Google, status, werkzaamheden, beheer en monitoringpagina. Dit waren lege-bronstaten met expliciet fictief lokaal werk; geen echte klantcijfers. De browserconsole had bij de gecontroleerde monitoringpagina geen fouten.

Er is alleen browseremulatie gebruikt, geen fysieke telefoon. De tabellen met echte gevulde Google-rapporten moeten na koppelen nog met de werkelijke data worden beoordeeld; de bronresponsevormen zijn met fixtures getest.

Aanvullende actuele artikelronde: alle 18 artikelen zijn inhoudelijk en op gerichte overlap herbeoordeeld; elf primaire bronpagina's zijn daadwerkelijk geraadpleegd. Een verkeerd label bij E2 is gecorrigeerd: de case-OG's heten nu zichtbaar schematische illustraties, geen screenshots. Een lange mobiele H1 veroorzaakte 11px overflow; de gridminimumbreedte en tekstafbreking zijn hersteld. Na de nieuwe build zijn alle 18 artikelen op 360/390/768/1440/1920 geladen: 90 breedtewaarnemingen, nul horizontale overflow. E2-bijschrift en beeld zijn op een echte browserscreenshot bekeken. Dit vervangt geen volledige widget-/toegankelijkheidsaudit of eigenaarvrijgave. Zie `quality/evidence/articles-current-2026-09-24.md` en `quality/evidence/article-browser-2026-09-24.md`.

## Gevonden en opgelost

- Monitoringdienst stond buiten de proxy-allowlist en werd onbedoeld een 404.
- MFA-profielvlag alleen was onvoldoende voor oude sessies; sessiegebonden factorbewijs toegevoegd.
- SQLite async transacties konden andere writes insluiten; gedeelde reentrante serialisatie toegevoegd.
- Oude in-flight snapshots konden nieuwe broninstellingen voorbijlopen; actuele fingerprintcontrole toegevoegd.
- Synchronisatie kon steeds dezelfde eerste websites nemen; afzonderlijke pogingentabel en één begrensde site per run.
- Resetmail-callback met tokenpad werd door de route-allowlist geweigerd; veilig, begrensd callbackpad toegevoegd.
- Herstelformulier toont nu alleen de velden voor de betreffende stap. Bestaande gebruikers kunnen een aanvullende uitnodiging accepteren.
- Beheerpagina had nog geen eigen paginakop; compositie en mobiele inpassing toegevoegd.
- Ontbrekende uptimekoppeling wordt als onbekend getoond, zonder schijnbaar actieve meetvoorziening.
- SEO-tab zonder echte auditkoppeling verwijderd. Search Console blijft als eigen Google-inzicht beschikbaar.
- Uptime-ingest controleert de site-origin opnieuw binnen de schrijftransactie om een tussentijdse toewijzingswijziging te weigeren.

Na de browsercontrole is de fictieve beheerder via de interface uitgelogd. Beide expliciet benoemde lokale fixtureaccounts, hun sessies/MFA, fixtureklanten/-sites en testwerk zijn gericht verwijderd. Een aparte databasecontrole bevestigt nul van deze twee accounts/sites. Overige data en lokale configuratie zijn bewaard; geen bekend testwachtwoord blijft als bruikbare login achter.

## Nog niet bewezen

Echte Resend-aflevering, HTTPS-cookies op het definitieve domein, productie-PostgreSQL-migratie, Google-/Vercel-toegang en vergelijking met hun dashboards, Cloudflare Free-CPU, 48 uur uptime, monitoruitvalalarmering en volledige browsertabellen met klantdata. Er is geen productiepush, deployment, DNS-wijziging of mail naar echte ontvangers uitgevoerd.

De grote publieke auditcrawler, scanaccounts en wekelijkse auditmail zijn niet gerealiseerd of geactiveerd. Een gratis kleine pilot is onderzocht; openbare browseruitvoering wacht op bewezen netwerkisolatie en werkelijke accountcapaciteit. Zie `setup-hub-integrations.md` en `gratis-audit-capaciteit.md`.
