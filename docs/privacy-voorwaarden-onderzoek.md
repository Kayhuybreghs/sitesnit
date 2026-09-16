# Sitesnit — onderzoek privacy, cookies en voorwaarden

Onderzocht op 15 september 2026. Dit document beschrijft de code bij aanvang van deze controle en geeft keuzes voor de uitwerking. Het is geen verklaring dat alle beschreven maatregelen al zijn ingebouwd, en geen garantie dat aansprakelijkheid of ieder juridisch risico kan worden uitgesloten. Voor de definitieve publicatie moeten bedrijfsgegevens en zakelijke afspraken overeenkomen met de werkelijke dienstverlening.

## Hoofdconclusies

- De gewenste betaling van **60% vóór de start en 40% bij afronding** kan bij diensten worden afgesproken. De bekende wettelijke beperking van aanbetaling bij consumentenkoop van goederen is niet automatisch van toepassing op webdesigndiensten. KVK vermeldt dat aanbetaling bij diensten geen wettelijk maximum heeft. Maak de termijnen en het moment van afronding concreet in de offerte. [KVK over betaling](https://www.kvk.nl/geldzaken/van-offerte-naar-geld-op-je-rekening/)
- De woorden **‘hosting minimaal €5 voor één jaar’** vereisen verduidelijking: €5 per maand of €5 per jaar, inclusief of exclusief btw, verplicht bij iedere website of alleen bij hosting via Sitesnit, en wat gebeurt er na het eerste jaar? Deze gegevens mogen niet als bevestigd feit worden ingevuld.
- De bestaande privacytekst is te kort voor de feitelijke gegevensverwerking. Er is opslag van aanvragen, browseropslag voor tools, Google PageSpeed Insights en misbruikbeperking. Bewaarregels, grondslagen, ontvangers, internationale verwerking en privacyrechten ontbreken grotendeels.
- Google Analytics stond bij aanvang **niet** in de applicatie. Voeg GA4 pas toe met echte toestemmingsblokkade en gecontroleerde accountinstellingen. Een banner zonder blokkade beschermt de bezoeker niet.
- Het huidige formulier is een vrijblijvende aanvraag. Het moet geen verborgen overeenkomst, akkoord met een hostingabonnement of toestemming voor marketing worden.

## Feitelijke datastromen in de bestaande code

Gecontroleerd: `app/api/contact/route.ts`, `app/api/events/route.ts`, `app/api/lighthouse/route.ts`, `lib/server.ts`, `lib/url.ts`, `db/schema.ts`, `app/contact/contact-form.tsx`, `app/check-tool.tsx`, `app/tools/tool-components.tsx` en verwijzingen naar browseropslag en externe diensten.

| Onderdeel | Wat gebeurt er werkelijk? | Punt voor de privacy-uitwerking |
| --- | --- | --- |
| Contactformulier | Cloudflare D1 ontvangt naam, e-mail, optionele website/pakketkeuze, bericht en tijdstip. Telefoonnummer, voorkeursdag/-tijd en interesses worden in het bericht samengevoegd. | Noem deze velden, het beantwoorden van de aanvraag en het afstemmen van de belafspraak. Een voorkeursmoment is nog geen bevestigde boeking. |
| Tooluitkomst meesturen | De samenvatting wordt alleen in `tool_summary` opgeslagen wanneer `includeSummary === true`. De gebruiker kan dit uitschakelen. | Leg de keuze uit bij het formulier. De grondslag voor behandeling van een aanvraag is niet hetzelfde als cookietoestemming. |
| Aanvraagopslag | Bij de start van het onderzoek was er geen automatische verwijdering van oude aanvragen. | Publiceer geen vaste verwijderbelofte zonder uitvoerbaar beheerproces of technische opschoning. |
| Website- en prijscheck | Antwoorden, stap, URL en technisch resultaat worden in `sessionStorage` bewaard. | Het betreft functionele browseropslag voor de door de bezoeker gebruikte tool; geen openbare resultatenpagina. |
| Andere tools | Offertevergelijker, automatiseringsplan en ontwerptool bewaren de invoer in `sessionStorage`. | Ook deze invoer noemen, niet uitsluitend de twee oorspronkelijke checks. De browser kan sessies herstellen; beloof daarom niet dat sluiten van een venster altijd onherroepelijk wist. |
| PageSpeed Insights | De backend stuurt de ingevoerde openbare pagina-URL naar Google. De 15 antwoorden gaan niet mee. De backend retourneert een genormaliseerd Lighthouse-resultaat, dat in de browser blijft totdat iemand de uitkomst meestuurt. | Maak vóór de scan duidelijk welke partij de URL ontvangt. Queryparameters worden door de huidige URL-normalisatie niet verwijderd; waarschuw voor persoonlijke gegevens/tokens en overweeg een gerichte technische beperking. |
| Gebeurtenistelling | `/api/events` accepteert uitsluitend start/voltooiing van websitecheck en prijscheck; D1 bewaart een willekeurig event-ID, type en tijdstip. Geen user-ID, antwoordtekst of bezoekerprofiel in de eventtabel. | Beschrijf sobere gebruikstelling. Een ontvangend platform verwerkt bij een HTTP-verzoek wel verbindingsgegevens; ‘wij verwerken nergens IP-adressen’ zou onjuist zijn. |
| Misbruikbeperking | D1 bewaart een afgeleide sleutel van het IP-adres met teller en vervalmoment. Vensters zijn bij contact/scans 10 minuten en bij events 5 minuten. Verlopen records worden verwijderd bij de volgende rate-limitcontrole. | Beschrijf kortdurende beveiligingsverwerking. Het vervallen van een teller en het fysieke opruimmoment zijn verschillend; bij geen nieuw verkeer kan een verlopen record blijven staan. |
| E-mail | Er zijn `mailto:`-links; er was geen automatische e-mailbezorging vanuit het aanvraagendpoint. | Benoem de feitelijke mailboxleverancier pas wanneer bevestigd. Zeg niet dat verzendbevestigingen worden gemaild zolang alleen D1-opslag is gerealiseerd. |
| WhatsApp | Geen actieve WhatsApp-koppeling aangetroffen. | Geen WhatsApp/Meta-verwerker of telefoonnummer verzinnen. Bij latere toevoeging vooraf gegevensuitwisseling bij klikken uitleggen. |

De API-antwoorden gebruiken `no-store` en `noindex, nofollow`. POST-bodies worden in grootte beperkt, oorsprong wordt gecontroleerd en de contactgegevens worden met gebonden databaseparameters opgeslagen. Dit zijn nuttige maatregelen, maar geen vervanging voor accountbeveiliging, toegangsbeheer, beheer van bewaartermijnen en afspraken met leveranciers.

## Voorwaarden: duidelijk voor klant en uitvoerder

Algemene voorwaarden moeten vóór het sluiten van een opdracht beschikbaar worden gesteld. Een opslaan/downloaden-optie en meesturen met offerte/opdrachtbevestiging maken dat aantoonbaar. Alleen een footerlink na akkoord is onvoldoende als de klant vooraf niet behoorlijk is geïnformeerd. [KVK over het verstrekken van voorwaarden](https://www.kvk.nl/wetten-en-regels/algemene-voorwaarden-delen-zo-pak-je-dat-aan/)

Gebruik een versie en datum, een leesbare webpagina en een downloadbaar document. Leg in de offerte de concrete scope vast; de voorwaarden regelen terugkerende afspraken. Vermijd het kopiëren van voorwaarden van concurrenten en onredelijke uitsluitingen. Ook kleine zakelijke klanten kunnen onder omstandigheden bescherming ontlenen aan consumentenregels. [KVK over redelijke voorwaarden](https://www.kvk.nl/wetten-en-regels/hoe-je-algemene-voorwaarden-maakt/)

Aanbevolen inhoud, passend bij Sitesnit:

1. **Partijen en opdracht:** echte juridische naam, handelsnaam, rechtsvorm, vestigings-/correspondentieadres, KVK, btw-ID en contactgegevens. Omschrijf hoe een opdracht ontstaat, welke documenten gelden en dat een tooluitkomst of contactaanvraag geen bestelling is.
2. **Scope en wijzigingen:** aantal pagina’s, functies, teksten/beelden, migratie, talen, koppelingen en revisies staan in de offerte. Nieuwe wensen worden eerst besproken met effect op prijs en planning; geen automatische onbevestigde toeslagen.
3. **Medewerking en planning:** klant levert afgesproken materiaal en feedback; bij vertraging wordt samen een nieuwe planning bepaald. Geen niet-bevestigde oplevertermijn publiceren.
4. **Betaling:** 60% van de overeengekomen projectprijs na akkoord en vóór de start; 40% bij de afgesproken afronding. Benoem de review/acceptatiestap, factuurtermijn en wat met terecht gemelde gebreken gebeurt. Een aanbetaling is een deel van de prijs, geen automatisch niet-terugbetaalbare boete.
5. **Oplevering en herstel:** afgesproken inhoud/functioneren toetsen, gemelde afwijkingen oplossen, aanvullende wensen onderscheiden van fouten. Vermijd ‘alles wordt na twee dagen automatisch goedgekeurd’ en algemene afstand van wettelijke rechten.
6. **Hosting en beheer:** basisdienst, minimumduur, prijs per periode, minimumtotaal, startdatum, facturering en opzegging zichtbaar beschrijven. Maak duidelijk of domeinnaam, mailboxen, back-ups, herstel en onderhoud inbegrepen zijn. Leg gebruikslimieten of betaalde platformkosten vooraf vast.
7. **Eigendom en vertrek:** domeinregistratie, eigendom van klantmateriaal, gebruiks-/overdrachtsrechten op maatwerk, bestaande bouwstenen, licenties van derden en overdracht van toegang/export uitwerken. Voorkom onduidelijke afhankelijkheid; noem vooraf wat bij verhuizing mogelijk en inbegrepen is.
8. **SEO en automatisering:** omschrijf inspanningen en afgesproken prestaties zonder Google-posities, omzet of foutloze AI-uitvoer te garanderen. Bij koppelingen bepalen partijen welke data mogen worden verwerkt, welke controles nodig zijn en wie verantwoordelijk is voor besluiten op basis van de uitvoer.
9. **Vertrouwelijkheid en persoonsgegevens:** passende geheimhouding; waar Sitesnit namens een klant persoonsgegevens host/verwerkt kan een aparte verwerkersovereenkomst nodig zijn. De privacyverklaring voor Sitesnits eigen bezoekers vervangt deze niet.
10. **Stoppen, storingen en geschillen:** redelijke hersteltermijn, overleg bij uitval/vertraging, afrekening van aantoonbaar verricht werk en toepasselijke wettelijke rechten. Geen absolute ‘Sitesnit is nooit aansprakelijk’-clausule. Laat eventuele aansprakelijkheidslimiet aansluiten op dienst, prijs en verzekering.

### Hosting: voorkom verrassingen in de prijs

Als de gebruiker **€5 per maand gedurende minimaal 12 maanden** bevestigt, is dat een minimale hostingverplichting van **€60 voor het eerste jaar**. Dit is rekentechnisch; btw-status en precieze dienst zijn nog afzonderlijke besluiten. Maak het verplichte totaal naast een websitepakket zichtbaar en in de offerte controleerbaar. Een minimumhostingprijs kan niet uitsluitend diep in de voorwaarden staan als iedereen hem moet betalen.

Voor consumenten kan een eerste vaste looptijd worden afgesproken. Na stilzwijgende verlenging geldt bij vrijwel alle abonnementen maximaal één maand opzegtermijn; online afgesloten abonnementen moeten ook online opzegbaar zijn. Dus niet zonder nieuw uitdrukkelijk akkoord ieder jaar opnieuw twaalf maanden vastzetten. Een zakelijke afspraak kan anders worden ingericht, maar een eenvoudige maandelijkse opzegmogelijkheid na het eerste jaar is duidelijk en klantvriendelijk. [ACM over abonnementen](https://consument.acm.nl/aankoop-dienst-annuleren/abonnement-opzeggen)

### Particulieren: bedenktijd niet wegschrijven

Bij een op afstand afgesloten consumentendienst is doorgaans 14 dagen bedenktijd vanaf het sluiten van het contract van toepassing. Voor starten binnen die periode is een uitdrukkelijk verzoek nodig; evenredige betaling en het eventueel vervallen van bedenktijd na volledige uitvoering kennen aanvullende eisen. Schrijf niet dat ‘maatwerkwebsites nooit bedenktijd hebben’: de uitzondering voor op maat gemaakte goederen kan niet zonder beoordeling op iedere dienst worden geplakt. ACM noemt sinds 25 juni 2026 een online herroepingsfunctie voor online gesloten overeenkomsten. Een vrijblijvend aanvraagformulier is zelf geen online bestelling; voeg bij latere online consumentenacceptatie een passende functie en bevestiging toe. [ACM over bedenktijd](https://consument.acm.nl/aankoop-dienst-annuleren/bedenktijd)

## Privacyverklaring: inhoud en concrete keuzes

De verklaring moet de daadwerkelijke organisatie en verwerking begrijpelijk beschrijven. Het actuele AP-sjabloon voor het mkb behandelt onder andere welke gegevens worden verwerkt, waarom en welke rechten bezoekers hebben. Gebruik dat als inhoudelijke controle; vul ontbrekende feiten niet fictief in. [AP-sjabloon, gepubliceerd 3 september 2026](https://autoriteitpersoonsgegevens.nl/documenten/sjabloon-privacyverklaring-mkb)

| Verwerking | Doel en passende basis | Voorstel voor een uitvoerbare bewaarbeperking |
| --- | --- | --- |
| Aanvraag, offerte en belvoorkeur | Op verzoek contact opnemen en voorbereiden/uitvoeren van een overeenkomst. Waar het om algemene zakelijke correspondentie gaat: noodzakelijk gerechtvaardigd belang met belangenafweging. | Bijvoorbeeld aanvragen zonder opdracht uiterlijk 12 maanden na laatste inhoudelijk contact wissen. Dit is een voorstel, geen wettelijke standaardtermijn. Een actieve opdracht heeft een andere dossiergrond. |
| Project- en klantdossier | Uitvoering overeenkomst en noodzakelijke bewijs-/administratiebelangen. | Alleen noodzakelijke stukken bewaren voor uitvoering en toepasselijke verplichtingen; niet elke ruwe toolinvoer automatisch zeven jaar bewaren. |
| Facturen en fiscale administratie | Wettelijke verplichting. | Basisadministratie/facturen doorgaans zeven jaar; verwerk dit in de echte boekhouding. De aanvang hangt samen met wanneer gegevens hun actuele belang verliezen. |
| Sobere gebeurtenistelling | Verbetering van de website; leg noodzaak en beperkte privacy-impact vast wanneer zonder toestemming wordt gemeten. | Bijvoorbeeld ruwe gebeurtenissen na 90 dagen verwijderen en uitsluitend werkelijk geaggregeerde tellingen bewaren. Dit is een ontwerpkeuze. |
| Beveiliging/rate limiting | Bescherming tegen misbruik als gerechtvaardigd belang. | Kortdurende counters; maak periodieke verwijdering controleerbaar in plaats van een onjuiste harde termijn te beloven. |
| Browseropslag tools | Teruggaan en aanpassen binnen de gevraagde tool. | Sessieduur en een werkende reset; bij gevoelige of langdurige drafts aanvullend een maximale leeftijd invoeren. |
| Google Analytics | Alleen na toestemming voor statistieken in de gekozen opzet. | Start bij voorkeur met twee maanden voor gebruikers-/eventgegevens; accountinstelling controleren. Geaggregeerde GA-rapporten vallen niet onder dezelfde instelling. |

De fiscale bewaarplicht rechtvaardigt niet zonder meer het bewaren van alle vrijblijvende leads. De Belastingdienst licht de bewaartermijn en het begin ervan toe voor administratieve gegevens. [Belastingdienst over bewaren](https://www.belastingdienst.nl/wps/wcm/connect/bldcontentnl/belastingdienst/zakelijk/btw/administratie_bijhouden/administratie_bewaren/)

Vermeld daarnaast hoe iemand inzage, correctie, verwijdering, beperking, bezwaar, overdraagbaarheid of intrekking van toestemming kan vragen, voor zover het betreffende recht van toepassing is. Vermeld het klachtrecht bij de AP en een eenvoudig contactpunt. Organiseer ook daadwerkelijk de afhandeling en proportionele identiteitscontrole; vraag niet standaard een volledige paspoortkopie. [AP over privacyrechten in de praktijk](https://autoriteitpersoonsgegevens.nl/themas/basis-avg/privacyrechten-avg/voor-organisaties-privacyrechten-in-de-praktijk)

Noem dat de prijscheck en andere tools indicaties geven, geen bindende besluiten met juridische gevolgen nemen en geen openbare persoonsprofielen publiceren. Maak onderscheid tussen de ingevulde inhoud, objectief gemeten audits en de keuze om de samenvatting naar Sitesnit te sturen. Een openbare URL wordt pas aan Google aangeboden wanneer de bezoeker de scan aanvraagt. [Google over PageSpeed Insights](https://developers.google.com/speed/docs/insights/v5/get-started)

### Ontvangers en internationale verwerking

- **Cloudflare:** de code gebruikt Workers en D1. Leg de verwerkersafspraken en gebruikte diensten vast. D1 heeft een aparte EU-jurisdictie-instelling die bij databasecreatie moet worden gekozen; een locatiehint is geen EU-garantie. Ook bij EU-databaseopslag kan de Worker elders verwerking uitvoeren. Daarom geen onbewezen belofte ‘al je data blijft uitsluitend in Nederland/EU’. [Cloudflare DPA](https://www.cloudflare.com/cloudflare-customer-dpa/), [D1 datalocatie](https://developers.cloudflare.com/d1/configuration/data-location/)
- **Google PageSpeed Insights:** beschrijf de doorgifte van de gevraagde URL, niet van de vragenlijst. Verwijs naar de toepasselijke Google-informatie en inventariseer de voorwaarden voor deze API; ga niet automatisch uit van exact dezelfde afspraken als GA4. [Google privacybeleid](https://policies.google.com/privacy?hl=nl)
- **Google Analytics, mailbox en boekhouding:** pas feitelijke leverancier/accountinstellingen opnemen wanneer bekend. Verwerkersovereenkomsten, subverwerkers en toepasselijke waarborgen voor doorgifte moeten intern controleerbaar zijn. Niet stellen dat een overeenkomst is gesloten wanneer dit nog niet is gecontroleerd.

## Cookiebanner en GA4: concrete acceptatiecriteria

Gebruik een compacte banner met begrijpelijke uitleg en twee even bereikbare keuzes: **‘Alleen noodzakelijk’** en **‘Statistieken toestaan’**. Geen vooraf aangevinkte statistieken, geen scrollen-als-toestemming en geen verstopt weigeren. Geef een permanente link **‘Cookievoorkeuren’** waarmee de bezoeker dezelfde keuze kan aanpassen. Toegang tot tools en contact mag niet afhankelijk worden van statistische toestemming. [AP over correcte cookiebanners](https://autoriteitpersoonsgegevens.nl/actueel/ap-pakt-misleidende-cookiebanners-aan)

Advies: **basic consent mode**. Laad de Google-tag pas na akkoord; stuur bij onbekende/weigerende keuze ook geen cookieless pings. Dat is een bewuste andere uitvoering dan advanced mode, dat al vóór akkoord metingen zonder cookies kan verzenden. [Google over consent mode](https://developers.google.com/tag-platform/security/concepts/consent-mode)

Controleer in browsernetwerk en opslag:

1. Nieuwe bezoeker: geen gtag/collect-verzoeken en geen `_ga`-cookies.
2. Weigeren: navigeren, tools invullen en formulier gebruiken blijven mogelijk; nog steeds geen GA-verzoeken.
3. Toestaan: alleen een echte geconfigureerde GA4-meet-ID gebruiken. Geen verzonnen ID om de UI werkend te laten lijken.
4. Intrekken: verdere verzending direct blokkeren, GA-cookies voor relevante host/domeinvarianten wissen en voorkeuze opslaan. Intrekken is geen automatische verwijdering van eerdere rechtmatig ontvangen rapportdata; leg dit onderscheid uit.
5. Herladen en verlopen/beschadigde voorkeuze: uitsluitend een geldige, actuele keuze activeert statistieken.
6. Geen persoonsgegevens naar GA: formulierwaarden, antwoorden, gescande URL’s, e-mailinhoud en toolresultaten uitsluiten; URL-queryparameters/hash en onveilige titels filteren. Automatische formulier-/sitezoekmetingen en ongecontroleerde extra events uitschakelen. [Google over voorkomen van PII](https://support.google.com/analytics/answer/6366371?hl=en)
7. GA-account: Google Signals/advertentiekoppelingen uitschakelen tenzij daar bewust afzonderlijke doelen/grondslagen voor bestaan. Bewaarinstellingen en delen van gegevens nalopen. Twee maanden gebruikers-/eventretentie instellen als gekozen uitgangspunt; niet claimen dat alle geaggregeerde rapporten daardoor ook na twee maanden verdwijnen. [Google over retentie](https://support.google.com/analytics/answer/7667196?hl=en_EN)
8. Mobiel en toetsenbord: zichtbare focus, ruime knoppen, geen bedekte primaire actie, uitklappen/sluiten zonder scrollproblemen; resetten mag noodzakelijke toolvoortgang niet onverwacht wissen.

## Nog van de eigenaar nodig

1. Juridische naam/rechtsvorm, KVK, btw-ID, openbaar te gebruiken adres en naam van de verantwoordelijke.
2. Alleen zakelijke opdrachtgevers of ook particulieren? Zijn de getoonde bedragen inclusief of exclusief btw?
3. Exacte uitleg van €5 hosting, wat inbegrepen is, minimumduur, facturering, startdatum en verlenging/opzegging.
4. Betaaltermijn, concrete acceptatie/opleverafspraak, inbegrepen revisies en rechten/overdracht bij voltooiing of vertrek.
5. Mailboxleverancier, boekhouding en eventuele nieuwsbrief/CRM/WhatsApp; bestaande verwerkersafspraken en toegangsbeheer.
6. Echte GA4-meet-ID en toegang om accountinstellingen te controleren. Ontbrekende ID betekent: integratie voorbereid en uitgeschakeld, niet ‘Google Analytics volledig live’.

Deze vragen hoeven het verbeteren van 404, technische SEO, consentblokkade, mobiele afwerking en de feitelijke privacy-uitleg niet tegen te houden. Publiceer echter geen onbevestigde bedrijfsidentiteit of onbevestigde verplichtingen als voldongen feit. Zorg bij oplevering voor een helder onderscheid tussen gebouwde functionaliteit, vastgelegde keuzes en nog uit te voeren bedrijfsbeheer.
