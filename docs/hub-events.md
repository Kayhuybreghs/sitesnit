# Publiek toolgebruik en CTA's in GA4

Implementatie: 22 september 2026. Dit document beschrijft de nieuwe expliciet toegestane GA4-events. Het activeert geen Analytics-property, betaalde dienst of Hubrapportage.

## Toestemming en gegevensgrens

De bestaande CookieConsent-component blijft de enige activatieroute. Een geldig meet-ID, de apart bevestigde Google-privacyconfiguratie en expliciete analyse-toestemming zijn alle vereist. Intrekken, verlopen, gewijzigde toestemming uit een ander tabblad en componentopruiming schakelen de nieuwe dispatcher uit. Elke verzending controleert opnieuw de vervaltijd en actuele publieke route. Geweigerde gebeurtenissen worden weggegooid, niet bewaard of achteraf verzonden.

Naast de gebruikelijke GA4-verwerking bevat deze implementatie alleen vaste eventnamen, vaste `tool_id`/`action_id` en de bestaande opgeschoonde publieke paginacontext. Er gaan geen antwoorden, e-mailadressen, namen, ingevoerde website-URL's, offertebedragen, resultaatteksten, documenttitels, queries of hashes in de eventparameters. De referrer bij deze events is leeg. Hub, accounts, deelrapporten en API-routes worden expliciet uitgesloten, ook bij een fout in de publieke routecatalogus. Geen nieuwe cookies, identifiers of opslag voor deze gebeurtenissen.

Dit betekent niet dat GA4 volledig anoniem is: Google gebruikt zijn eigen analyse-identificatie na toestemming. Zet Enhanced Measurement (waaronder automatische formulierinteracties), user-provided data, Google Signals en advertentietoepassingen niet opnieuw aan. De privacy-/cookie-uitleg moet paginabezoek én toolgebruik/belangrijke knoppen noemen. De bestaande banner is aangepast; controleer ook de juridische pagina's voor livegang.

## Events en definities

| Event | Parameter | Wanneer |
| --- | --- | --- |
| `tool_start` | `tool_id` | Een expliciete start of eerste invoer; nooit alleen door paginaladen of herstel van een opgeslagen concept. |
| `tool_complete` | `tool_id` | De bezoeker vraagt de geldige uitkomst op. Betekent niet dat er contact is aangevraagd of een technische scan is geslaagd. |
| `cta_click` | `action_id`, optioneel `tool_id` | Een geselecteerde publieke vervolgactie wordt aangeklikt. Betekent geen verzonden formulier, geboekte afspraak of gewonnen klant. |

`tool_id` is uitsluitend `websitecheck`, `prijscheck`, `offertevergelijker`, `automatiseringsplan` of `ontwerp_website`.

- Websitecheck: startknop; afronding zodra alle vragen doorlopen zijn en een geldige URL naar de resultaatovergang leidt. De mobiele Lighthouse-scan kan daarna nog wachten of mislukken. Geen scanresultaten naar GA4.
- Prijscheck: startknop; afronding na de geldige 15 antwoorden.
- Ontwerptool: eerste invoer/volgende stap; afronding na de zesde stap. Opnieuw aanpassen of teruggaan telt binnen dezelfde gemonteerde uitvoering niet opnieuw.
- Automatiseringsplan: eerste wijziging of resultaat aanvragen; afronding bij een geldige resultaatopvraag. Het plan is een voorstel, geen uitgevoerde automatisering.
- Offertevergelijker: eerste eigen wijziging; afronding bij ‘Bekijk je vergelijking’ als de bekende kosten vergelijkbaar zijn en geen fictief voorbeeld actief is. Alleen naar het resultaat scrollen telt niet. Resultaten zijn direct beschikbaar; dus deze telling omvat niet ieder bekeken resultaat. Een voorbeeld invullen telt niet als voltooide persoonlijke vergelijking.

Start/afronding worden per gemonteerde tooluitvoering eenmaal gemarkeerd, ook als Google niet is toegestaan of geblokkeerd. Een expliciete reset in de vragenchecks begint een nieuwe uitvoering. Heropenen/remounten en vervolgens opnieuw actief gebruiken kan opnieuw tellen. Geen poging bezoekers over bezoeken te herkennen. Een afloop kan zonder gemeten start voorkomen als iemand pas tussentijds toestemming geeft; er is geen historische replay.

`action_id` is uitsluitend:

- `contact_open`: naar `/contact`.
- `prices_view`: naar `/kosten`.
- `projects_view`: naar `/projecten`.
- `tools_view`: naar `/tools`.
- `tool_open`: naar één van de vijf bekende toolroutes; `tool_id` is de bestemming.
- `discuss_result`: resultaatbespreking via het toolcontactpaneel of de geselecteerde ankers `#bespreken` / `#ontwerp-bespreken`.

Andere links, willekeurige tekstlabels, telefoonnummers en mailadressen worden niet automatisch geteld. Klikmeting blokkeert navigatie niet en kan door sluiten, blockers of netwerkverlies ontbreken. Bij andere CTA-events is `tool_id`, indien aanwezig, de brontool.

## GA4 en Hubconfiguratie

Maak in GA4 twee **event-scoped custom dimensions** met eventparameters `tool_id` en `action_id`. Niet user-scoped: het zijn kenmerken van de handeling, niet van de persoon. GA4 ontvangt custom eventnamen rechtstreeks via `gtag('event', name, parameters)`. Nieuwe customdimensions kunnen tijd nodig hebben om in rapporten zichtbaar te worden.

Een latere Hub-adapter kan filteren op `eventName` en `eventCount` groeperen op `customEvent:tool_id` / `customEvent:action_id`, mits de dimensies bestaan en de propertytoegang is ingericht. Label `eventCount` als **gemeten gebeurtenissen**, nooit als unieke bezoekers, volledige aantallen toolgebruikers of leads. Alleen toegestane en ontvangen gebeurtenissen worden gemeten. Geen starts/afrondingenratio als bewezen conversiepercentage; perioden, gedeeltelijke toestemming en definitie van afronding beïnvloeden de vergelijking. Tel dagelijkse unieke gebruikers niet op tot een uniek maandtotaal.

De bestaande `/api/events`-tellers blijven ongewijzigd en zijn een **aparte databron met andere definities**. Niet optellen bij GA4-events en niet presenteren als dezelfde gebruikersmeting. Geen nieuwe servertracking of toestemmingloze tracking is hier toegevoegd.

## Controle en activering

Geautomatiseerd: `node --experimental-strip-types --import ./scripts/typescript-test-loader.mjs --test tests/analytics-events.test.mjs tests/consent.test.mjs`.

Vóór activering in een echte property: bevestig ID/Google-instellingen, test toestemming weigeren/accepteren/intrekken, bekijk netwerkpayloads met privacygevoelige testinput, controleer dat Hub/account geen events sturen en controleer per tool één start/afronding bij teruggaan. Gebruik een eigen testproperty; deze implementatietests sturen geen echte Google-events. De Hubbackend en property zijn binnen dit werkpakket niet gewijzigd.

## Primaire documentatie

Geraadpleegd 22 september 2026:

- [Google: eventparameters instellen](https://developers.google.com/analytics/devguides/collection/ga4/event-parameters)
- [Google: custom events en parameters](https://support.google.com/analytics/answer/12229021?hl=en)
- [Google: custom dimensions en metrics](https://support.google.com/analytics/answer/14240153?hl=en)
- [Google Analytics Data API-schema](https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema)
