/*
# Contactaanvragen van het website-formulier

1. Nieuwe tabel
   - `contact_submissions`
     - `id` (uuid, primaire sleutel) — unieke aanvraag-id
     - `first_name` (text, verplicht) — voornaam
     - `last_name` (text) — achternaam
     - `phone` (text) — telefoonnummer
     - `email` (text, verplicht) — e-mailadres
     - `project_type` (text) — wat de bezoeker wil laten maken
     - `approach` (text) — welke aanpak het best past
     - `message` (text) — korte toelichting
     - `page` (text) — pagina/URL waar het formulier is verstuurd
     - `created_at` (timestamptz) — moment van indienen

2. Beveiliging (RLS)
   - Row Level Security staat AAN op `contact_submissions`.
   - Publiek formulier zonder login: alleen INSERT is toegestaan voor `anon` en `authenticated`.
   - Er is bewust GEEN SELECT-policy voor de anon-client, zodat bezoekers elkaars aanvragen niet kunnen inzien. Beheer/lezen gebeurt via het Supabase-dashboard (service role).

3. Belangrijke notities
   1. Dit is een single-tenant, publieke inzending; er worden geen gebruikersaccounts gebruikt.
   2. Verplichte velden zijn voornaam en e-mailadres; de overige velden zijn optioneel.
*/

CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text DEFAULT '',
  phone text DEFAULT '',
  email text NOT NULL,
  project_type text DEFAULT '',
  approach text DEFAULT '',
  message text DEFAULT '',
  page text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_insert_contact_submissions" ON contact_submissions;
CREATE POLICY "anon_insert_contact_submissions" ON contact_submissions FOR INSERT
  TO anon, authenticated WITH CHECK (true);
