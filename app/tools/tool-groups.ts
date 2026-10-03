export const toolGroups = [
  { id: 'kiezen-en-ontwerpen', title: 'Kiezen & ontwerpen', intro: 'Je wilt iets nieuws. Maak je wensen, richting en investering concreet.', slugs: ['prijscheck', 'ontwerp-je-website', 'offertevergelijker'] },
  { id: 'verbeteren', title: 'Je website verbeteren', intro: 'Je hebt al een website. Onderzoek eerst wat bezoekers helpt en wat hen in de weg zit.', slugs: ['seo-audit', 'snelheidstest', 'websitecheck'] },
  { id: 'slimmer-werken', title: 'Slimmer werken', intro: 'Je doet hetzelfde werk steeds opnieuw. Zoek uit welke stap eenvoudiger kan.', slugs: ['automatiseringsplan'] },
] as const;

export const toolInputs: Record<string, {input: string; output: string}> = {
  snelheidstest:{input:'Eén openbaar pagina-adres en je keuze voor mobiel, desktop of Beide vergelijken.',output:'Per apparaat de ontvangen prestatiescore, laadmetingen en bevindingen uit Lighthouse.'},
  'seo-audit':{input:'Een openbaar HTTPS-adres. Geen vragenlijst.',output:'Een begrensde crawl met concrete technische bevindingen per URL.'},
  prijscheck: { input: '15 antwoorden over inhoud, functies en omvang.', output: 'Een passende pakketbasis, je wensen en keuzes om af te stemmen.' },
  'ontwerp-je-website': { input: 'Je bedrijfsverhaal, stijlvoorkeuren en kleuren.', output: 'Een aanpasbaar ontwerpvoorbeeld als vertrekpunt voor het gesprek.' },
  offertevergelijker: { input: 'De bekende bedragen en afspraken uit twee of drie offertes.', output: 'Een vergelijking met ontbrekende afspraken en gerichte vragen.' },
  websitecheck: { input: '15 antwoorden over je website, gevolgd door je websiteadres.', output: 'Inhoudelijke verbeterpunten naast de werkelijk ontvangen Lighthouse-meting.' },
  automatiseringsplan: { input: 'Een terugkerende taak, de stappen en uitzonderingen.', output: 'Een procesvoorstel en je eigen inschatting van het huidige tijdgebruik.' },
};
