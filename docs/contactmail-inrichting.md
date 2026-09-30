# Contactmail: inrichting en beheer

Stand 27 september 2026. GEÏMPLEMENTEERD en met lokale databases en gesimuleerde Resend-antwoorden getest. Geen productie-migratie, nieuwe webhook of live contactmailtest uitgevoerd in deze opdracht.

## Wat een aanvraag doet

Alle echte openbare formulieren gebruiken `ContactForm` en `POST /api/contact`: de contactpagina, dienst-/pakketkeuze via querycontext, websitecheck/prijscheck en de vier andere tools via `ToolContact`. Demonstraties en het alleen berekenen van een resultaat versturen geen aanvraag. De bezoeker moet een tooloverzicht afzonderlijk aanvinken.

Eén transactie bewaart de aanvraag, de gecontroleerde context en twee afzonderlijke, bevroren mailtaken. De eigenaar-notificatie gaat altijd naar **contact@sitesnit.nl** met het bezoekersadres als Reply-To. De bevestiging gaat naar het gevalideerde bezoekersadres met contact@sitesnit.nl als Reply-To. Beide hebben Sitesnit als afzender. Het bezoekersbericht wordt niet volledig teruggestuurd in de bevestiging.

Opslagsucces en mailstatus zijn gescheiden. Het formulier bevestigt uitsluitend aangetoonde opslag en toont een referentie. Bij een mailstoring blijft de aanvraag bewaard. Eenzelfde aanvraag-ID met dezelfde inhoud dedupliceert; gewijzigde inhoud bij dezelfde ID geeft 409. De browser bewaart de verzendpoging voor een herkenbare retry.

## Voor productie, na releasegoedkeuring

1. Maak een herstelbare databaseback-up. Beoordeel `db/postgres/0003_contact_outbox.sql`. Voer met de bestaande serverdatabaseconfiguratie `npm run db:migrate:contact -- --apply` uit. De migratie voegt alleen tabellen/indexen toe; zij verstuurt geen oude aanvragen. Gebruik `--local` voor een afzonderlijke in-memory migratiecontrole.
2. Zet onderstaande servervariabelen in **Vercel → Sitesnit → Settings → Environment Variables → Production**. Geen geheimen in de browser, Git of chat.
3. Maak in Resend een webhook voor `https://www.sitesnit.nl/api/contact/webhook`, met `email.delivered`, `email.delivery_delayed`, `email.bounced`, `email.complained` en `email.failed`. Bewaar het signing secret als hieronder. De endpoint verwerkt de ongewijzigde requestbody met Svix-signature- en timestampcontrole.
4. Publiceer de gecontroleerde build. Controleer eerst de database en het beheer; activeer daarna de contactmailflag en publiceer de instellingen. Verifieer met één expliciet gemarkeerde testaanvraag beide berichten en beide Reply-To-adressen.

| Variabele | Vereiste / actie | Controle |
|---|---|---|
| `DATABASE_URL` of bestaande `POSTGRES_URL` | Bestaande productiedatabase behouden; additive migratie toepassen | Aanvraag + context + exact twee taken aanwezig |
| `RATE_LIMIT_SECRET` | Bestaand servergeheim behouden | Ontvangerlimiet gebruikt gehashte sleutels |
| `RESEND_API_KEY` | Bestaande sleutel met verzendrechten voor Sitesnit gebruiken | API accepteert beide testberichten; geen sleutel tonen |
| `CONTACT_EMAIL_ENABLED` | `true` uitsluitend na migratie en controles | Mail werkt ook bij `HUB_ENABLED=false` |
| `CONTACT_EMAIL_FROM` | `Sitesnit <contact@sitesnit.nl>`; indien afwezig wordt `HUB_EMAIL_FROM` gebruikt | Eigen geverifieerd Sitesnit-adres; geen bezoekersadres als From |
| `RESEND_CONTACT_WEBHOOK_SECRET` | Signing secret van deze Resend-webhook | Echte, ondertekende testgebeurtenis verandert bezorgstatus |
| Bestaande retentionjob-authenticatie | Bestaande `CRON_SECRET` behouden; zie bestaande jobconfiguratie | Geauthenticeerde joblog en aantal verwerkte taken controleren |

De eigenaar-ontvanger is vastgelegd in servercode. Een `CONTACT_NOTIFICATION_TO` variabele is bewust niet nodig; de browser kan dit adres niet veranderen. Hub-accountmails houden hun eigen ontvangers en flow.

## Wat extern is gecontroleerd

Update 27 september 2026: de contactmigratie, productievariabelen en ondertekende Resend-webhook zijn ingericht en gepubliceerd. Eén expliciet goedgekeurde TEST-aanvraag naar `contact@sitesnit.nl` heeft twee afzonderlijk afgeleverde berichten opgeleverd, ieder met één verzendpoging. Het live beheer toont beide afleverstatussen. Zie [het publicatierapport](productie-publicatie-2026-09-27.md). De daaropvolgende oudere alinea beschrijft de controle vóór deze release.

Read-only in het Resend-account: sitesnit.nl staat Verified; Free-account met 100 mails per dag en 3.000 per maand; pay-as-you-go staat uit. Een historisch afgeleverd Hub-bericht bewijst niet dat deze nieuwe contactflow is afgeleverd. Geen mailboxinhoud, productie-secretwaarden of nieuwe contactbezorging zijn gecertificeerd. MX, Zoho, DNS en abonnement zijn niet gewijzigd.

## Budget en herstel

Een nieuwe aanvraag vraagt twee mails. Eigen grenzen: 8 verzoeken per netwerk per 10 minuten, 3 nieuwe aanvragen per ontvanger per UTC-dag, 30 globaal per dag en 700 per maand. Contactmail reserveert maximaal 60 verzendpogingen per dag en 1.800 per maand. Het gedeelde Hub-/contactbudget is 90 per dag en 2.800 per maand, zodat accountberichten ruimte houden. Pogingen tellen conservatief mee, ook als de providerrespons onduidelijk is.

De eerste twee pogingen worden begrensd afgewacht. Taken hebben een databaselease, een stabiele Resend-idempotentiesleutel, dezelfde inhoud en oplopende wachttijd. Maximaal vijf pogingen binnen 23 uur vanaf de eerste poging. Een aangenomen bericht wordt nooit automatisch nogmaals verzonden. `provider_accepted` is geen inbox- of leesbevestiging; `delivered`/`bounced` komen alleen uit bewijs van Resend.

De **bestaande dagelijkse retentionjob** probeert maximaal vier vervallen taken. Dit is een begrensd vangnet, geen snelle wachtrij. Door de dagelijkse frequentie kan een onzekere taak buiten het veilige venster vallen en handmatige beoordeling vragen. De job is niet in productie gewijzigd of als actief afgetekend. Bij mailstoringen dus het beheeroverzicht controleren.

Beheer: `/hub/admin/aanvragen`, alleen met bestaande adminrechten. Per aanvraag zijn eigenaar- en bevestigingstatus afzonderlijk zichtbaar. Een veilige retry gebruikt dezelfde taak. Bij `delivery_unknown`, een permanent probleem of een verlopen retryvenster: eerst het bericht in Resend controleren. Met de provider-ID kan het systeem ontvanger, afzender, onderwerp en bevroren inhoud vergelijken zonder iets te verzenden. Alleen bij vastgesteld **niet verstuurd** kan een beheerder bewust opnieuw proberen. Blind opnieuw versturen na 24 uur is niet toegestaan.

## Bewaring en meting

Aanvragen en hun persoonlijke mail/contextgegevens verdwijnen via de bestaande 12-maandenretentie, met cascade. Bezorggebeurtenissen en beheerlogmetadata worden na 90 dagen opgeruimd. De privacytekst beschrijft de nieuwe verwerking. Dat is geen algemene juridische goedkeuring.

`generate_lead` wordt na bevestigde opslag één keer aangeboden aan analytics, uitsluitend bij toestemming. Geen naam, e-mail, bericht, aanvraagreferentie, toolinvoer of querystring gaat mee. `contact_intent` voor tel/mail/WhatsApp blijft apart. Markeer `generate_lead` desgewenst handmatig als key event in GA4; die accountinstelling is niet door deze code gewijzigd. De database blijft de aanvraagregistratie, ook zonder analytics.

## Release en rollback

Publicatie is op 27 september expliciet goedgekeurd. De actuele release kan de additive migratie uitvoeren binnen de bestaande Vercel Production-build: `scripts/release-contact.mjs`, uitsluitend bij `CONTACT_SCHEMA_RELEASE=contact-outbox-2026-09-27`, `VERCEL=1` en `VERCEL_ENV=production`. De bestaande verbinding blijft binnen Vercel. Zonder die releaseflag doet het script niets.

Vóór de migratie bewaart dezelfde transactie een versleutelde momentopname van bestaande aanvragen en mailtabellen in `sitesnit_release_private.backups`. De sleutel om die kopie te ontsleutelen staat uitsluitend lokaal in `.sites-runtime/contact-release-recovery.private.pem`; bewaar dat bestand veilig. De bijbehorende publieke sleutel staat als `CONTACT_BACKUP_PUBLIC_KEY` in Vercel. Versleuteling: RSA-OAEP-SHA256 voor de tijdelijke AES-sleutel en AES-256-GCM voor de momentopname. Deze beperkte herstelkopie is geen volledige databaseback-up. De migratie verandert of verwijdert geen bestaande aanvraagregels. De nieuwe mailtabellen krijgen RLS en zijn niet bereikbaar voor de Supabase-browserrollen. Een fout breekt de transactie én de build af. De geregistreerde release wordt bij herhaling overgeslagen.

Toegang tot de juiste beheerde Supabase-database: Vercel → Sitesnit → Storage → `supabase-purple-marble` → **Open in Supabase**. Deze database hoort bij Vercel-organisatie `kay`; het afzonderlijke KHCustomWeb-account bevat een ander project. De rollbackreferentie wordt lokaal bewaard in `.sites-runtime/contact-release-rollback.json`.

Gebruik eerst een afgeschermde preview met een afzonderlijke database en mail uit. Voer typecheck, lint, unit-/integratietests, productiebuild, routecontrole en browseracceptatie uit. Stel de CI-status extern als verplichte branch-/deploymentcontrole in; alleen een workflowbestand blokkeert een Vercel-productiepromotie nog niet.

Bij problemen: zet `CONTACT_EMAIL_ENABLED=false`, stop herstelacties en rol alleen de applicatie terug naar de vooraf vastgelegde productiebuild. **Geen tabellen terugdraaien of aanvragen/outboxstatussen wissen.** Bewaar bevroren taken en provider-ID’s zodat aangenomen berichten na herstel niet opnieuw worden verstuurd. Controleer vóór hervatten onbekende bezorgstatussen. Een databaseback-up terugzetten is geen routinematige code-rollback.

