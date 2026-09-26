# Publicatie en Hub-inrichting — 25 september 2026

## Afgerond
- GitHub main: 20a87c8. Vercel productie: BX1MgvWk3beZCVbPShcEwhhiEepN, Ready.
- Atelier Vorm, Studio Matcha en Buiten Gewoon verwijderd uit routes, portfolio en sitemap. Alle drie live 404 bevestigd.
- www.sitesnit.nl/sitemap.xml bevat 60 openbare pagina's. Hub en API blijven privé/noindex.
- Openbaar auditvoorbeeld verwijderd. Alleen echte ontvangen auditresultaten worden weergegeven.
- Admin-audits controleren de echte Hub-sessie, adminrol en sessiegebonden MFA; geen publieke daglimiet voor admin. Wel maximaal 20 pagina's en veiligheids-/tijdsgrenzen per scan.
- Hub-admin ziet alle aangesloten sites en een inventaris van de openbare Sitesnit-pagina's.
- Eigen Sitesnit-dossier aangemaakt op productie: sitesnit-own, https://www.sitesnit.nl.
- Supabase gratis project mhnoirbbwcnihbuncask hervat, status Healthy.
- 26 applicatie- en auth-tabellen aangemaakt, 26 met RLS. anon/authenticated hebben geen directe tabelrechten. Alleen serververbinding gebruikt de opslag.
- Nieuwe adapter accepteert bestaande POSTGRES_URL van Supabase. DATABASE_URL blijft bruikbaar.
- Resend-variabelen en Hub-instellingen door eigenaar ingevoerd in Production. Herpublicatie gestart om ze te laden.
- Beheeruitnodiging voor contact@sitesnit.nl met toestemming eigenaar aangemaakt; token alleen lokaal, hash in database. E-mailverificatie en MFA blijven verplicht.

## Validatie
- Productiebuild lokaal geslaagd; 140/140 tests geslaagd.
- SEO-crawl: 60 pagina's en 4168 links, geen problemen binnen controlescript.
- Clientbundels: 111 bestanden, geen gevonden ingestelde servergeheimen.
- Eerste live build Ready, actuele projectpagina/audit/sitemap en 404's via HTTP bevestigd.

## Nog af te ronden vóór claim dat Hub volledig operationeel is
- Eigenaar moet via eenmalige uitnodiging zelf wachtwoord kiezen, e-mail verifiëren en authenticator instellen.
- Resend-domeinverificatie en werkelijke aflevering nog aantonen.
- GA4/GSC/Vercel-bronnen en uptime-monitor moeten per site gekoppeld worden; zonder koppeling geen verzonnen statistieken.

## Toegang
- /hub/login: echte login.
- /hub/admin: beheer, websites, paginainventaris en audittellers.
- /hub/admin/seo-audit: beheerdersaudit zonder daglimiet.
- /hub/site/sitesnit-own?preview=1: eigen site (alleen bevoegde admin).
- /hub/demo: duidelijk gelabelde demonstratie, geen echte metingen.

Geheime bestanden uitsluitend lokaal in .sites-runtime; nooit committen. Bewaar hervatstatus wanneer de eigenaar later terugkomt.

## Productieverbinding hersteld
- Aanvankelijke fout: SELF_SIGNED_CERT_IN_CHAIN. Opgelost met het officiële publieke Supabase-rootcertificaat en rejectUnauthorized=true, inclusief hostnaamcontrole. Geen certificaatcontroles uitgeschakeld.
- GitHub 661c978; Vercel Fg4GJ6RcbYHf5zqdZ9eEM72Paf8p Ready.
- Live /api/internal/storage geeft HTTP 200 en schema sitesnit-1 terug; login actief.
- In de browser een echte publieke audit van www.sitesnit.nl uitgevoerd: 20 pagina's, 120/120 basiscontroles geslaagd, score 100 binnen die beperkte controles. 61 URLs ontdekt, dus geen volledige crawl.
- Beheeruitnodiging beschikbaar in .sites-runtime/hub-live-admin-invitation.txt; niet opnemen in Git of openbare documentatie. Eigenaar kiest zelf wachtwoord en MFA. Aflevering verificatiemail nog afhankelijk van werkelijke registratie.
- Nu in afwerking: duidelijkere audit-hero en nadrukaccenten uit gewone webteksten. Niet vergeten deze laatste aanpassing opnieuw te publiceren.

## Laatste afwerking
- Auditintro opnieuw ontworpen met directe link naar URL-invoer en duidelijke uitleg van het resultaat.
- Onnodige nadrukaccenten uit openbare teksten verwijderd.
- Klantlogin toegevoegd in desktopnavigatie, mobiel menu, navigatie zonder JavaScript en footer.
- Publieke daglimiet in browser bevestigd; bestaande auditresultaten blijven zichtbaar.

## Publicatie laatste wijzigingen bevestigd
- GitHub main f3fed59. Nieuwe hero, Klantlogin in navigatie en footer live bevestigd op www.sitesnit.nl.
- Live navigatie naar /hub/login doorlopen: inlogknop actief. Productieopslag HTTP 200.
- Browseremulatie 360, 390, 900 en 1440 pixels gecontroleerd, geen horizontale overflow; startknop focust URL-invoer en mobiel menu opent de login.
- Laatste lokale crawl: 60 openbare routes, 4409 verwijzingen, issues leeg. Geen fysieke telefoon getest.
- Eerste accountregistratie, daadwerkelijke verificatiemail en MFA moeten nog door eigenaar worden afgerond/bevestigd.

## 26 september: login en registratie verduidelijkt
- cba20c8: Welkom terug vervangen door Inloggen op Sitesnit Hub. Naast het formulier een aparte uitleg en knop Account aanmaken.
- /hub/uitnodiging zonder token toont uitleg en uitnodiging aanvragen; met token blijft de bestaande beveiligde registratie beschikbaar.
- Productiebuild geslaagd, 7 auth-tests geslaagd. Mobiel 390px en desktop 1440px visueel gecontroleerd.
- Persoonlijke beheeruitnodiging opnieuw geopend voor eigenaar. Geen wachtwoord door agent ingevoerd of ingesteld.

## 26 september: verificatiemail geweigerd door Resend
- Registratie in Vercel gaf 200; Resend POST /emails gaf 403 Domain not verified. Sitesnit.nl was nog niet toegevoegd in Resend. Better Auth slikt fouten van de mailcallback in runInBackgroundOrAwait; huidige UI meldt daardoor onterecht een ontvangen bericht.
- sitesnit.nl nu als domein in Resend voorbereid, regio Ierland. DNS nog NIET opgeslagen: wacht op expliciete bevestiging voor afzenderautorisatie.
- Vimexx sitesnit.nl (domein 1618992) in DNS-bewerkmodus. Drie nieuwe records ingevuld: TXT resend._domainkey met publieke Resend DKIM; CNAME rsend naar rsend-euw1.forge.rmta.net.; CNAME send naar send.forge.rmta.net. Nieuwe TTL 300. Alle 63 bestaande formulierwaarden ongewijzigd geverifieerd.
- Browser tab 23 behouden met onopgeslagen formulier. Resend-tab kan door gebruiker zijn gesloten; herstel via bekende domein-URL, wijzig geen Zoho MX/SPF/DMARC of Vercelrecords.
- Na toestemming: opslaan, DNS verifiëren, Resend-verificatie uitvoeren, een nieuwe verificatiemail via officiële Hub-flow laten sturen. Geen verificatiecode uit logs gebruiken om mailverificatie te omzeilen.
- Nog verbeteren: mailfouten zichtbaar maken zonder persoonsgegevens/tokens te loggen; herverzendoptie met limiet. Geen wachtwoord of MFA door agent invoeren.

## DNS na expliciete toestemming opgeslagen
- Gebruiker gaf toestemming voor drie Resend-records, domeinverificatie en één nieuwe verificatiemail naar contact@sitesnit.nl.
- Records opgeslagen in Vimexx en via authoritative ns.zxcs.nl bevestigd. Zoho MX en Vercel www CNAME ongewijzigd.
- Resend domein 09451c6e-fa0e-486d-8ce4-b00dcb6b18fd: DNS verified, domeinverificatie nog bezig. Mail pas opnieuw sturen na Verified.

## Verificatiemail afgeleverd
- Resend bevestigt sitesnit.nl als Verified. Eén nieuwe verificatiemail via de officiële Hub-route verstuurd; Resend toont Delivered voor contact@sitesnit.nl met onderwerp Bevestig je e-mailadres voor Sitesnit Hub.
- De eigenaar moet zelf de link uit de mailbox openen, met het zelf gekozen wachtwoord inloggen en MFA instellen. Er is geen verificatietoken uit logs gebruikt.
- Mailcallback-fouten worden per request vastgelegd en als EMAIL_SEND_FAILED (503) teruggegeven. Login en registratie krijgen een herverzendknop; maximaal drie aanvragen per uur via de bestaande auth-rate-limit.
- Acht auth-regressietests geslaagd, inclusief afgewezen mail, herverzending voor bestaand account en login na bevestiging. Geen extra echte testmails verstuurd.
