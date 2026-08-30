# Update: Contactpagina vernieuwd

> Hey! Hier is wat er is veranderd aan de contactpagina.

## Overzicht

De contactpagina is compleet vernieuwd met nieuwe secties, mooiere knoppen en een formulier om een telefoongesprek in te plannen.

## Wat is er gedaan

### 1. Mooiere contactknoppen

De contactpagina begint nu met drie verzorgde kaarten in plaats van platte tekstlinks:

- **E-mail** — opent een mail naar info@sitesnit.nl
- **WhatsApp** — opent een chat met een groene "Online nu" badge en een pulserend stipje
- **Plan een telefoongesprek** — scrollt naar het afspraakformulier

Elke kaart heeft een gekleurd icoon, een titel, beschrijving en een pijltje dat verschuift en van kleur verandert bij hover.

### 2. Telefoongesprek formulier

Een nieuw formulier waarmee bezoekers een belafspraak kunnen maken:

- **Naam** en **telefoonnummer** (verplicht)
- **Datumkiezer** — kan niet vandaag kiezen, pas vanaf morgen
- **Tijd-dropdown** — alleen tijden na 17:30 (17:30, 18:00, 18:30, 19:00, 19:30, 20:00, 20:30)
- **Onderwerp** (optioneel)

Na verzenden krijgt de bezoeker een bevestiging te zien. De aanvraag wordt opgeslagen in de Supabase database met de datum en tijd erbij.

### 3. Contact formulier (teruggebracht)

Het bestaande aanvraagformulier is weer aanwezig met:

- Naam, bedrijfsnaam, e-mail
- Keuze: nieuwe website of bestaande website vernieuwen
- Keuze: pakketwebsite of maatwerkwebsite
- Pakketkeuze: Online Zichtbaar of Volledige Bedrijfswebsite
- Korte toelichting
- Verzendknop met vertrouwensbadges ("vrijblijvend" en "persoonlijk antwoord")

### 4. Over ons sectie

Nieuwe sectie met de titel "Scherp webdesign. Geen blabla.":

- Korte introductie over sitesnit
- Drie statistieken: 10+ projecten, 24u reactietijd, 100% persoonlijk contact
- Een klantreview kaart met quote en auteursinfo

### 5. FAQ sectie

Vijf uitklapbare vragen:

- Hoe snel reageer je op mijn aanvraag?
- Is een aanvraag vrijblijvend?
- Werk je ook buiten Venlo?
- Wat gebeurt er na mijn aanvraag?
- Kan ik eerst een demo of ontwerp zien?

## Database wijziging

Aan de `contact_submissions` tabel zijn twee kolommen toegevoegd:

- `call_date` (date) — gewenste bel-datum
- `call_time` (text) — gewenste bel-tijd (vanaf 17:30)

De bestaande INSERT-policy dekt deze nieuwe kolommen automatisch.

## Gewijzigde bestanden

| Bestand | Wat |
|---|---|
| `contact/index.html` | Volledig vernieuwde contactpagina |
| `js/call-booking.js` | Nieuw — afhandeling belafspraak formulier |
| `css/contact.css` | Volledig vernieuwde styling voor alle secties |

## Nog doen

- WhatsApp-nummer is nog een placeholder (`+31 6 12 34 56 78`) — vervangen door het echte nummer
- E-mailadres `info@sitesnit.nl` controleren of dit klopt
