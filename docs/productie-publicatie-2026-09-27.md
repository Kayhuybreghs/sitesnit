# Sitesnit: productiepublicatie en controle

Gepubliceerd op 27 september 2026 na expliciete toestemming van de eigenaar. De eigenaar heeft daarnaast één gemarkeerde TEST-aanvraag met twee berichten naar contact@sitesnit.nl goedgekeurd.

## Gepubliceerde versie

- Productie: https://www.sitesnit.nl
- GitHub main: `98d3d4bbe8a9d911b32f55819805418743914a2b`.
- Vercel: `dpl_Hwvs926VVLQ3QA2UFoqNpY2L26gr`, status READY, productie-aliases actief.
- Deployment: https://sitesnit-cg3iq5lrw-kay-3e14.vercel.app
- GitHub CI: https://github.com/Kayhuybreghs/sitesnit/actions/runs/36318724391 — completed / success.

De publicatie liep via de bestaande afzonderlijke GitHub-mirror in `.sites-runtime/github-publish`. De oorspronkelijke werkboom en het bestaande niet-gecommitte werk zijn behouden. Het lokale lockbestand is consistent met de daadwerkelijk geteste dependencies gepubliceerd. Geen DNS-, abonnements- of Google-permissiewijziging uitgevoerd.

## Wat de release bevat

- Dienstenoverzicht vanuit vijf concrete bedrijfsvragen, met passende diensten en vervolgstappen.
- Beide echte cases met nieuwe hero, projectbeeld, opdracht, doelgroep, rol, keuzes, functies en vervolg. Geen verzonnen resultaten; externe projectlinks behouden nofollow.
- Centrale prijsweergave: exclusief btw voorop, inclusief btw eronder; bestaande bedragen en pakket-ID's behouden. Hosting bij een nieuwe website, onderhoud en inhoud afzonderlijk.
- Duurzame contactopslag met twee afzonderlijke mailtaken, afleverstatussen, bescherming tegen dubbele verzending en beheer via `/hub/admin/aanvragen`.
- De overige gerichte correcties uit `sitesnit-herstelrapport.md`, waaronder analytics, offerteherstel en technische kwaliteitscontrole.
- De beschermde homepage en hero zijn in deze release niet gewijzigd. De vergelijking met de vorige productieversie bevat geen wijzigingen aan de beschermde homepage-/hero-/layoutbestanden.

## Productiedatabase en mail

De bestaande Vercel-managed Supabase-database `mhnoirbbwcnihbuncask` is gebruikt. Openen via **Vercel → Sitesnit → Storage → supabase-purple-marble → Open in Supabase**. Het andere KHCustomWeb-account is geen vervanging van deze database.

De additive contactmigratie is tijdens de productiebuild uitgevoerd. Vooraf is in dezelfde transactie een versleutelde kopie van bestaande aanvraag- en mailtabellen bewaard. Dit is geen volledige databasebackup. De private herstelsleutel staat uitsluitend lokaal in `.sites-runtime/contact-release-recovery.private.pem`; de rollbackreferentie staat in `.sites-runtime/contact-release-rollback.json`. Nieuwe mailtabellen hebben RLS en geen publieke/anon-toegang. De tijdelijke migratievariabelen zijn na succesvolle uitvoering uit de projectinstellingen verwijderd; toekomstige builds voeren de migratie niet opnieuw uit zonder releaseflag.

Productie heeft de contactmailflag, Sitesnit-afzender en het webhookgeheim. De Resend-webhook verwerkt delivered, delayed, failed, bounced en complained met handtekeningcontrole. Geen geheimen in dit rapport of in Git.

De browserinzending **TEST Sitesnit publicatie 27 september** gaf referentie `SN-BAB85AB575AB4AFAA905D03B29EB86BB`. Er is geen echte klantaanvraag of bestelling geplaatst. Er zijn precies twee mailtaken voor deze aanvraag:

| Bericht | Ontvanger | Pogingen | Providerstatus | Afleverstatus |
|---|---|---:|---|---|
| Zakelijke notificatie | contact@sitesnit.nl | 1 | provider_accepted | delivered |
| Bezoekersbevestiging | contact@sitesnit.nl | 1 | provider_accepted | delivered |

Beide ontvangers en Reply-To-waarden zijn in de database gecontroleerd. De afleverstatus kwam via de echte, ondertekende Resend-webhook binnen en is daarna ook in het ingelogde productiebeheer zichtbaar gecontroleerd. `delivered` bevestigt aflevering aan de ontvangende mailserver, geen gelezen bericht of gegarandeerde plaatsing in de primaire inbox. De oorspronkelijke lokale aanvraag is niet alsnog verzonden.

## Uitgevoerde controles

- Laatste volledige lokale unit-/integratieset: 168 geslaagd, 0 fouten; log `.sites-runtime/herstel-test-publish.log`.
- Productiebuild lokaal en op Vercel geslaagd. Vercel-build/migratielog: `.sites-runtime/contact-release-vercel-build.log`.
- GitHub kwaliteitsworkflow geslaagd, inclusief installatie, typecheck, lint, tests, build en routechecks.
- Alle 60 openbare productieroutes: HTTP-status, H1, metadata, canonical, indexbeleid, JSON-LD, interne ankerdoelen en afbeeldingsresponses gecontroleerd. Ook redirects, echte 404, sitemap en anonieme adminafscherming. Rapport: `reports/routes-production-2026-09-27.json`, `failures: []`.
- Clientbundels: 120 bestanden gecontroleerd, geen gevonden geconfigureerde geheimen. Dit is een gerichte bundelscan, geen algemene penetratietest.
- Live browsercontrole van diensten en beide cases op desktop en mobiel (390 × 844 viewport): tekst en beelden aanwezig, geen gevonden horizontale overflow of defecte geladen beelden. Tijdelijke viewport teruggezet.
- Live contactformulier via de browser ingestuurd; opslagbevestiging en twee mailtaken gecontroleerd. Live Hub-beheer toont de testaanvraag en beide afleverstatussen.
- Ongeldige contactaanvraag geweigerd; webhook zonder handtekening geweigerd; onderhoudsendpoint zonder authenticatie geweigerd; Hub-login blijft noindex. Sitemap blijft `https://www.sitesnit.nl/sitemap.xml`, met 60 openbare URLs.

## Grenzen van deze controle

De bestaande dagelijkse retention-/retryjob blijft op `15 3 * * *` geconfigureerd. De eerstvolgende geplande uitvoering is nog niet afgetekend; er is geen handmatige retentierun gestart die bestaande gegevens kan verwijderen. De twee directe testmails vereisten geen retry.

Geen nieuwe volledige browsersessie met twee verschillende live klantaccounts, volledige externe SEO-audit met alle providerquota of nieuwe GSC-indexeringsronde uitgevoerd. De lokale uitgebreide browser- en performancemetingen staan in het herstelrapport; ze worden niet als nieuwe productiemetingen voorgesteld. Een geslaagde GitHub-workflow is niet hetzelfde als extern ingestelde verplichte branchbescherming.

Aanvraagbeheer: https://www.sitesnit.nl/hub/admin/aanvragen. Inloggen met het bestaande beheeraccount; geen nieuw wachtwoord aangemaakt. Het volledige aanbod- en prijsoverzicht staat in `aanbod-en-prijzen.md`.
