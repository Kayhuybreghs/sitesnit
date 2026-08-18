/*
# Telefoongesprek-planning toevoegen aan contactaanvragen

1. Wijziging
   - Voegt kolom `call_date` (date, standaard leeg) toe aan `contact_submissions`.
     Bewaart de gewenste datum voor een telefoongesprek.
   - Voegt kolom `call_time` (text, standaard leeg) toe aan `contact_submissions`.
     Bewaart het gewenste tijdstip voor een telefoongesprek (vanaf 17:30).

2. Notities
   - Puur additief: bestaande kolommen en data blijven ongewijzigd.
   - De bestaande INSERT-policy (anon, authenticated) dekt de nieuwe kolommen automatisch.
*/

ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS call_date date;
ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS call_time text DEFAULT '';
