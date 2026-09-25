# Hub: privacy-uitleg en controles voor ingebruikname

De publieke privacy- en cookiepagina zijn aangevuld zonder de bestaande onderwerpen te verwijderen. Dit is een feitelijke toelichting op de implementatie, geen juridische goedkeuring van de complete dienstverlening.

## Gecontroleerde code

- `lib/hub/auth.ts`: sessie 7 dagen, verversing bij actief gebruik, cookieprefix sitesnit-hub, HttpOnly, Secure bij HTTPS; geen authtelemetrie; beheerders hebben aparte MFA-controle.
- `lib/hub/invitations.ts`: uitnodiging 48 uur geldig. Geldigheid is geen verwijdertermijn voor de registratie.
- `app/hub/auth-form.tsx`: TOTP/herstelcode, trustDevice false; geen onthoud-dit-apparaatoptie.
- Geïnstalleerde Better Auth-cookiecode: session_token; tijdelijke tweede-factorcookie standaard 600 seconden. Cookiecache is in Sitesnit uitgeschakeld.
- `lib/hub/mail.ts` en runtime: Resend alleen bij ingeschakelde en complete configuratie; ontvangt accountbericht en ontvanger, inclusief tijdelijke links waar nodig.
- `lib/hub/providers`: geaggregeerde GA4-rapporten, Search Console-topzoekopdrachten/pagina's en beperkte Vercel-publicatiegegevens. Geen garantie dat tekstvelden in bronrapporten vrij zijn van persoonsgegevens.
- `lib/hub/integrations.ts`: broncredentials blijven server-side; snapshotverval is geen verwijdering.
- `lib/hub/ingest.ts`: ruwe uptime >90 dagen verwijderen tijdens nieuwe ingest, niet via een los gegarandeerd dagelijks verwijderproces. Bij stilgevallen ingest blijven oude gegevens tot een volgende ingest staan.
- Schema/store: klanttoegang kan meerdere websites omvatten; intrekken membership verwijdert geen account of dossier. Adminlog legt beheerhandelingen vast.

## Nog operationeel vast te leggen / te controleren

- Verifieer de daadwerkelijke productieconfiguratie, verwerkersafspraken, database- en maildienst vóór activering. In de publieke tekst wordt Resend conditioneel beschreven, niet als reeds actieve verzending.
- Leg vast wie accountverwijderverzoeken uitvoert en welke klantgegevens na beëindiging nog noodzakelijk zijn. Er is geen automatische volledige account-/dossierverwijdering geclaimd.
- Maak expliciete termijnen en uitvoering voor auth-, uitnodigings- en adminregistraties; session expiry is geen databaseopschoning. Houd deze beperkt tot noodzakelijke beveiliging en verantwoording.
- Controleer ruwe uptimebewaring ook wanneer de monitor wordt uitgezet; de bestaande ingest-opruiming alleen volstaat dan niet voor een harde termijn van precies 90 dagen.
- Controleer aangesloten klantwebsites op persoonsgegevens in pagina-adressen en op de eigen inrichting voor bezoekerstoestemming. Het uitlezen van rapporten via Hub regelt die inrichting niet automatisch.
- Bewijs bij livegang: werkelijke sessiecookies over HTTPS, accountmail via de gekozen dienst, autorisatie per klant en afwezigheid van openbare GA4-meetverzoeken op private Hubroutes.

Geen live accountgegevens, uitnodigingen, providercredentials of browsertracking gebruikt voor deze tekstcontrole.
