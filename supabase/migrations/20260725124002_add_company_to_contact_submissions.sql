/*
  # Bedrijfsnaam toevoegen aan contactaanvragen

  1. Wijziging
     - Voegt kolom `company` (text, standaard leeg) toe aan `contact_submissions`
       om de ingevulde bedrijfsnaam te bewaren.

  2. Notities
     - Puur additief: bestaande kolommen en data blijven ongewijzigd.
*/

ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS company text DEFAULT '';
