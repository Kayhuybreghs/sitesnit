export type Finding = {
  id: string;
  title: string;
  what: string;
  why: string;
  action: string;
  source: "Lighthouse" | "Jouw antwoorden";
  priority: number;
  category?: string;
  evidence?: string[];
};
export type TechnicalResult = {
  requestedUrl: string;
  finalUrl: string;
  fetchTime: string;
  version: string;
  categories: { id: string; title: string; score: number | null }[];
  metrics: {
    id: string;
    title: string;
    displayValue: string;
    score: number | null;
  }[];
  findings: Finding[];
  passed: string[];
  audits: {
    id: string;
    title: string;
    score: number | null;
    mode: string;
    description: string;
    displayValue: string;
    evidence: string[];
  }[];
  warnings: string[];
};
const categories = [
  ["performance", "Prestaties"],
  ["accessibility", "Toegankelijkheid"],
  ["best-practices", "Best practices"],
  ["seo", "Technische SEO"],
];
const metrics = [
  ["first-contentful-paint", "Eerste zichtbare inhoud"],
  ["largest-contentful-paint", "Grootste zichtbare element"],
  ["total-blocking-time", "Blokkeertijd"],
  ["cumulative-layout-shift", "Visuele stabiliteit"],
  ["speed-index", "Speed Index"],
];
const advice: Record<string, [string, string, string, number]> = {
  "image-delivery-insight": [
    "Afbeeldingen kunnen efficiënter worden geleverd",
    "Zware of te grote beelden kunnen de eerste weergave vertragen.",
    "Optimaliseer de genoemde afbeeldingen op basis van het formaat, de compressie of de afmetingen die de audit aangeeft.",
    8,
  ],
  "render-blocking-insight": [
    "Bestanden vertragen de eerste weergave",
    "De browser wacht op deze bestanden voordat hij de pagina kan tonen.",
    "Controleer de genoemde scripts en stylesheets en laad niet-kritieke onderdelen later.",
    8,
  ],
  "document-latency-insight": [
    "De eerste documentaanvraag verdient aandacht",
    "Vertraging bij het eerste document schuift de rest van het laden op.",
    "Controleer in deze audit of redirects, serverreactie of compressie de concrete oorzaak vormen.",
    7,
  ],
  "cache-insight": [
    "Bestanden kunnen beter worden gecachet",
    "Terugkerende bezoekers moeten mogelijk onnodig bestanden opnieuw downloaden.",
    "Controleer de bewaartermijn van de genoemde bestanden en pas de cacheheaders passend aan.",
    6,
  ],
  "lcp-discovery-insight": [
    "Het grootste zichtbare element wordt laat ontdekt",
    "Een laat gevonden beeld kan de belangrijkste inhoud vertragen.",
    "Controleer de aangegeven LCP-bron, prioriteit en lazy-loadinginstelling.",
    8,
  ],
  "cls-culprits-insight": [
    "Onderdelen verspringen tijdens het laden",
    "Verspringingen maken lezen en klikken onrustig.",
    "Reserveer ruimte voor de in de audit genoemde beelden, lettertypen of andere verschuivende onderdelen.",
    8,
  ],
  "unused-javascript": [
    "Er wordt ongebruikte JavaScript geladen",
    "Onnodige code kan laden en bediening vertragen.",
    "Controleer de genoemde bundels en splits of stel niet-benodigde code uit.",
    6,
  ],
  "unused-css-rules": [
    "Er worden ongebruikte stijlen geladen",
    "Extra CSS kan de eerste weergave belasten.",
    "Verklein de genoemde stylesheets en scheid kritieke van later benodigde stijlen.",
    5,
  ],
  "color-contrast": [
    "Sommige tekst heeft onvoldoende contrast",
    "Laag contrast maakt tekst lastiger leesbaar.",
    "Pas voor de genoemde elementen de combinatie van tekst- en achtergrondkleur aan.",
    9,
  ],
  "image-alt": [
    "Er ontbreken passende tekstalternatieven",
    "Bezoekers die een schermlezer gebruiken missen mogelijk beeldinformatie.",
    "Geef inhoudelijke beelden een passend tekstalternatief en markeer decoratieve beelden als decoratief.",
    7,
  ],
  "button-name": [
    "Een knop heeft geen toegankelijke naam",
    "Zonder naam is de actie met een schermlezer niet duidelijk.",
    "Geef de genoemde knoppen een zichtbare of toegankelijke naam die de actie beschrijft.",
    9,
  ],
  "link-name": [
    "Een link heeft geen toegankelijke naam",
    "De bestemming kan onduidelijk zijn voor bezoekers met een schermlezer.",
    "Geef de genoemde links een beschrijvende naam.",
    8,
  ],
  label: [
    "Een invoerveld mist een toegankelijk label",
    "Een bezoeker kan niet goed vaststellen wat ingevuld moet worden.",
    "Koppel een duidelijk label aan elk genoemd invoerveld.",
    9,
  ],
  "document-title": [
    "De paginatitel vraagt aandacht",
    "De titel helpt bezoekers en zoekmachines de pagina herkennen.",
    "Geef deze pagina een unieke titel die de inhoud beschrijft.",
    6,
  ],
  "meta-description": [
    "De metabeschrijving vraagt aandacht",
    "Een heldere omschrijving geeft context in zoekresultaten.",
    "Schrijf voor deze pagina een korte en inhoudelijk passende metabeschrijving.",
    5,
  ],
  "is-crawlable": [
    "De pagina geeft een indexeringsbeperking aan",
    "Een blokkade kan voorkomen dat de pagina in zoekresultaten verschijnt.",
    "Controleer of de aangetroffen noindex- of andere blokkade bewust is ingesteld.",
    9,
  ],
  "robots-txt": [
    "De robots-configuratie vraagt aandacht",
    "Onjuiste regels kunnen het crawlen belemmeren.",
    "Controleer de concrete fout of regel in de robots.txt-audit.",
    8,
  ],
  canonical: [
    "De canonical-verwijzing vraagt aandacht",
    "Een verkeerde voorkeurs-URL kan onduidelijkheid over de pagina veroorzaken.",
    "Controleer de canonical-URL die de audit vermeldt.",
    7,
  ],
  "is-on-https": [
    "Er zijn onveilige verbindingen gevonden",
    "Onbeveiligde bronnen kunnen de veiligheid van de pagina verminderen.",
    "Controleer de genoemde HTTP-bronnen en gebruik waar mogelijk HTTPS.",
    9,
  ],
  "errors-in-console": [
    "De browser meldt fouten",
    "Fouten kunnen onderdelen van de website verstoren.",
    "Onderzoek de genoemde consolemeldingen en test de betrokken functies.",
    7,
  ],
};
advice["unsized-images"] = [
  "Afmetingen ontbreken bij afbeeldingen",
  "Ontbrekende afmetingen kunnen ruimteverschuivingen veroorzaken, maar bewijzen niet dat er beweging is gemeten.",
  "Voeg passende breedte en hoogte of een aspect-ratio toe aan de genoemde afbeeldingen.",
  6,
];
const aliases: Record<string, string> = {
  "use-cache-insight": "cache-insight",
  "uses-long-cache-ttl": "cache-insight",
  "render-blocking-resources": "render-blocking-insight",
  "uses-optimized-images": "image-delivery-insight",
  "uses-responsive-images": "image-delivery-insight",
  "modern-image-formats": "image-delivery-insight",
  "unsized-images": "unsized-images",
};
const clean = (v: unknown, max = 800) =>
  String(v ?? "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_]/g, "")
    .slice(0, max);
type AuditDetails = {
  items?: {
    url?: string;
    node?: { snippet?: string; explanation?: string };
    label?: string;
    wastedBytes?: number;
  }[];
};
type RawAudit = {
  score?: number | null;
  scoreDisplayMode?: string;
  title?: string;
  description?: string;
  displayValue?: string;
  details?: AuditDetails;
};
type PageSpeedResponse = {
  analysisUTCTimestamp?: string;
  lighthouseResult?: {
    runtimeError?: unknown;
    configSettings?: { formFactor?: string };
    finalDisplayedUrl?: string;
    finalUrl?: string;
    fetchTime?: string;
    lighthouseVersion?: string;
    categories?: Record<
      string,
      { score?: number | null; auditRefs?: { id: string; group?: string }[] }
    >;
    audits?: Record<string, RawAudit>;
    runWarnings?: unknown[];
  };
};
function evidence(details: AuditDetails | undefined): string[] {
  if (!details) return [];
  const rows = Array.isArray(details.items) ? details.items : [];
  return rows
    .slice(0, 5)
    .map((row) =>
      [
        row.url,
        row.node?.snippet,
        row.node?.explanation,
        row.label,
        row.wastedBytes
          ? `${Math.round(row.wastedBytes / 1024)} kB mogelijke besparing`
          : null,
      ]
        .filter(Boolean)
        .map((v) => String(v).slice(0, 400))
        .join(" — "),
    )
    .filter(Boolean);
}
export function normalizeLighthouse(
  input: unknown,
  requestedUrl: string,
): TechnicalResult {
  const data = input as PageSpeedResponse;
  const lhr = data?.lighthouseResult;
  if (!lhr || lhr.runtimeError)
    throw new Error("Lighthouse kon deze pagina niet volledig onderzoeken.");
  if (lhr.configSettings?.formFactor !== "mobile")
    throw new Error("De ontvangen analyse is geen mobiele meting.");
  const fetchTime = lhr.fetchTime ?? data.analysisUTCTimestamp;
  if (!fetchTime || !Number.isFinite(Date.parse(fetchTime)))
    throw new Error('Het meetmoment ontbreekt in de ontvangen analyse.');
  const validScore = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 1;
  if (!categories.some(([id]) => validScore(lhr.categories?.[id]?.score)) ||
      !Object.keys(lhr.audits ?? {}).length)
    throw new Error('De ontvangen analyse bevat onvoldoende meetgegevens.');
  const auditMap = lhr.audits ?? {};
  const memberships = new Map<string, string>();
  const hidden = new Set<string>();
  for (const [c] of categories)
    for (const r of lhr.categories?.[c]?.auditRefs ?? []) {
      if (!memberships.has(r.id)) memberships.set(r.id, c);
      if (r.group === "hidden") hidden.add(r.id);
    }
  const findings: Finding[] = [];
  const passed: string[] = [];
  const audits: TechnicalResult["audits"] = [];
  for (const [id, a] of Object.entries(auditMap)) {
    if (!memberships.has(id)) continue;
    const mode = a.scoreDisplayMode ?? "";
    const score =
      validScore(a.score) ? a.score : null;
    const ev = evidence(a.details);
    audits.push({
      id,
      title: clean(a.title),
      description: clean(a.description),
      score,
      mode,
      displayValue: clean(a.displayValue),
      evidence: ev,
    });
    const valid = ["binary", "numeric", "metricSavings"].includes(mode);
    if (
      valid &&
      score === 1 &&
      passed.length < 15 &&
      !metrics.some(([m]) => m === id)
    )
      passed.push(clean(a.title));
    if (
      hidden.has(id) ||
      ["interactive", "max-potential-fid", "first-cpu-idle"].includes(id) ||
      !valid ||
      score === null ||
      score >= 0.9 ||
      metrics.some(([m]) => m === id)
    )
      continue;
    const rule = advice[aliases[id] ?? id];
    findings.push({
      id,
      title: rule?.[0] ?? clean(a.title),
      what:
        clean(a.title) + (a.displayValue ? `: ${clean(a.displayValue)}` : ""),
      why:
        rule?.[1] ??
        "Lighthouse heeft bij deze controle een aandachtspunt vastgesteld.",
      action:
        rule?.[2] ??
        "Controleer de genoemde onderdelen in deze audit en laat de benodigde aanpassing gericht beoordelen.",
      source: "Lighthouse",
      priority: rule?.[3] ?? 4,
      category: memberships.get(id),
      evidence: ev,
    });
  }
  return {
    requestedUrl,
    finalUrl: lhr.finalDisplayedUrl ?? lhr.finalUrl ?? requestedUrl,
    fetchTime,
    version: lhr.lighthouseVersion ?? "",
    categories: categories.map(([id, title]) => ({
      id,
      title,
      score:
        validScore(lhr.categories?.[id]?.score)
          ? Math.round(lhr.categories[id].score * 100)
          : null,
    })),
    metrics: metrics
      .filter(([id]) => auditMap[id])
      .map(([id, title]) => ({
        id,
        title,
        displayValue: clean(auditMap[id].displayValue) || "Niet beschikbaar",
        score:
          validScore(auditMap[id].score) ? auditMap[id].score : null,
      })),
    findings: findings.sort((a, b) => b.priority - a.priority),
    passed,
    audits,
    warnings: (lhr.runWarnings ?? []).map((x: unknown) => clean(x)),
  };
}
