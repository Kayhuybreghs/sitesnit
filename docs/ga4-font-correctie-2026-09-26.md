# GA4 en typografie, 26 september 2026

Google Analytics is verbonden. Een echt leeg totals-antwoord bevatte alleen metadata en geen metricHeaders. Dat werd onterecht invalid-response; de retry-tijd markeerde vervolgens alle GA4-rapporten als oud. De parser accepteert nu deze specifieke geldige lege respons, bewaart Europe/Amsterdam en verzint geen nulmetingen. Andere ongeldige antwoorden blijven fouten.

Validatie: 24 provider/integratietests geslaagd, inclusief metadata-only en malformed regressies. Alle negen echte Google-rapporten correct no-data met Europe/Amsterdam. Dit betreft een historische periode zonder gerapporteerde metingen, niet een ontbrekende verbinding.

Typografie: video toont wisseling tussen fallback en Manrope. De kleine lokale variable font wordt expliciet vooraf geladen, gebruikt block in plaats van optional en krijgt een metrisch afgestemde Arial-fallback. Alle Manrope-verwijzingen gebruiken dezelfde centrale familie. Geen JavaScript nodig voor fontinlading. Bij uitzonderlijk langzaam/mislukt laden blijft een fallback beschikbaar.

Productiebuild inclusief TypeScript controleren voor publicatie; daarna Hub handmatig verversen en browser controleren. Automatische rapportverversing en uptime zijn hiermee niet toegevoegd.
