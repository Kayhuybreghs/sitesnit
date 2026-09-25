# Hervatten: www-indexering, 24 september 2026

Gebruiker bevestigt www als primaire host. Nieuwe lokale build voltooid; preview draait op 5184. Live homepage had noindex + non-www canonical. Correctie is nog niet gepubliceerd.

Zie seo-indexering-en-live-setup-2026-09-24.md voor overdracht. 126 tests, logische tests, build en gerichte ESLint geslaagd. Lokale crawl: 56 routes, 3769 links, 0 issues. Productie-hostsimulatie: 56 indexeerbaar met www canonical en unieke CSP-scriptnonces; preview/Hub uitgesloten. HTTP-login lokale demo klant 200; admin 200 login, 307 naar /hub/beveiliging (MFA behouden). Browser: demo-tabbladen, mobiel menu, cookie-instellingen en vragenstappen werken zonder consolefouten. Desktop en mobiel visueel bekeken.

Lokale klant- en beheeraccounts met fictieve data staan uitsluitend in .sites-runtime/hub-demo-accounts.md. Demo zonder inloggen: /hub/demo. Geen echte mail, productieaccount of providerdata aangemaakt. Preview laten draaien. Tijdelijke productie-hosttestserver mag stoppen na de controle.

Nog nodig: expliciete productie-publicatietoestemming volgens masterprompt; huidig git remote is de interne werkruimte, niet GitHub. Eerdere publicatie-informatie staat in .sites-runtime/github-publish-state.json. Bescherm alle al aanwezige wijzigingen en controleer de actuele GitHub-versie vóór publiceren. Databasemigratie, Resend, PSI-productieconfig en echte Hub-admin zijn afzonderlijke inrichtingsstappen; niet claimen dat ze live werken. Geen secrets publiceren.
