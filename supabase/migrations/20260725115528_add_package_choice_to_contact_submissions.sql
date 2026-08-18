/*
  # Pakketkeuze toevoegen aan contactaanvragen

  1. Wijziging
     - Voegt kolom `package_choice` (text, standaard leeg) toe aan `contact_submissions`.
       Bewaart welk pakket de bezoeker koos wanneer "Pakketwebsite" is geselecteerd
       (bijv. "Online zichtbaar" of "Volledige bedrijfswebsite").

  2. Notities
     - Puur additief: bestaande kolommen en data blijven ongewijzigd.
*/

ALTER TABLE contact_submissions ADD COLUMN IF NOT EXISTS package_choice text DEFAULT '';
