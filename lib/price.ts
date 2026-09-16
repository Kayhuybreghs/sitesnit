import type { Answers } from "./questions";
import { grossPrice } from "./business";
const priceLabel = (net: number) => new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(net);
export type PriceResult = {
  route: string;
  packageId: string;
  basis: number | null;
  fixed: boolean;
  reasons: string[];
  pending: string[];
  summary: string;
};
export function calculatePrice(a: Answers): PriceResult {
  const features = Array.isArray(a.features) ? a.features : [];
  const reasons: string[] = [];
  const pending: string[] = [];
  if (a.action === "booking")
    reasons.push("Een eigen boekingssysteem op de website");
  if (a.action === "checkout") reasons.push("Online bestellen en betalen");
  for (const [f, label] of [
    ["portal", "Een klantportaal met eigen gegevens"],
    ["calculator", "Een interactieve berekening"],
    ["search", "Zoeken en filteren in een uitgebreide inhoudsstructuur"],
    ["chatbot", "Een AI-chatbot op basis van je bedrijfsinformatie"],
    ["automation", "Een automatisering voor facturen of terugkerend werk"],
  ])
    if (features.includes(f)) reasons.push(label);
  if (a.pages === "more") reasons.push("Meer dan vijf pagina’s");
  if (a.pageTypes === "complex")
    reasons.push("Verschillende interactieve omgevingen");
  if (a.design === "advanced")
    reasons.push("Een uitgebreide interactieve of 3D-toepassing");
  if (a.integrations === "api") reasons.push("Een echte softwarekoppeling");
  if (a.management === "roles")
    reasons.push("Meerdere beheerrollen met goedkeuringen");
  if (a.languages === "multiple")
    pending.push("Aantal talen en omvang van de vertalingen");
  if (["needed", "partial"].includes(String(a.content)))
    pending.push("Aanvullende tekst- en beeldproductie");
  if (a.migration === "large")
    pending.push("Hoeveelheid en kwaliteit van over te zetten gegevens");
  if (a.management === "catalog" || a.pageTypes === "repeat")
    pending.push("Aantal items en benodigde beheermogelijkheden");
  for (const [id, label] of [
    ["content", "Beschikbaarheid van teksten en beelden"],
    ["languages", "Aantal talen"],
    ["migration", "Bestaande inhoud die mee moet"],
    ["pageTypes", "De benodigde soorten pagina’s"],
    ["design", "De gewenste ontwerpuitwerking"],
  ])
    if (a[id] === "unknown") pending.push(label);
  if (a.pages === "unknown") pending.push("Het benodigde aantal pagina’s");
  if (
    a.action === "unknown" ||
    a.integrations === "unknown" ||
    features.includes("unknown")
  )
    pending.push("De gewenste functies en eventuele koppelingen");
  if (a.situation === "improve")
    pending.unshift(
      "De technische staat en het verbeterwerk aan je huidige website",
    );
  const custom = reasons.length > 0;
  if (a.situation === "improve")
    return {
      route: "Eerst je bestaande website bekijken",
      packageId: "",
      basis: null,
      fixed: false,
      reasons: ["Je wilt je bestaande website gericht verbeteren.", ...reasons],
      pending: Array.from(new Set(pending)),
      summary:
        "Voor verbeterwerk aan een bestaande website is nog geen bedrag vastgesteld. Eerst beoordelen we wat er nodig is.",
    };
  const basis = custom ? 2750 : a.pages === "five" ? 1895 : 895;
  const id = custom ? "maatwerk" : a.pages === "five" ? "website" : "onepager";
  if (custom)
    pending.push(
      "De precieze omvang en uitvoering van het maatwerk; daarmee bepalen we de bovengrens",
    );
  if (a.pages === "unknown")
    pending.push(`Bij vijf pagina’s geldt ${priceLabel(grossPrice(1895))} inclusief btw (${priceLabel(1895)} exclusief btw) als bouwprijs; hosting komt daar apart bij`);
  const fixed =
    !custom &&
    pending.length === 0 &&
    ["one", "five"].includes(String(a.pages)) &&
    a.situation !== "improve";
  return {
    route: custom
      ? "Volledige vrijheid"
      : a.pages === "unknown"
        ? "Eerst je omvang bepalen"
        : a.situation === "improve"
          ? "Eerst je bestaande website bekijken"
          : a.pages === "five"
            ? "Website — 5 pagina’s"
            : "Onepager — 1 pagina",
    packageId: a.situation === "improve" ? "" : id,
    basis: a.situation === "improve" ? null : basis,
    fixed,
    reasons: reasons.length
      ? Array.from(new Set(reasons))
      : [
          a.pages === "five"
            ? "Vijf pagina’s voor je bedrijf en aanbod"
            : a.pages === "unknown"
              ? "Een compact verhaal kan binnen één pagina passen"
              : "Je verhaal past op één pagina",
          "Je gekozen standaardfuncties vragen op zichzelf geen maatwerk",
        ],
    pending: Array.from(new Set(pending)),
    summary:
      a.situation === "improve"
        ? "Voor verbeterwerk aan een bestaande website is nog geen bedrag vastgesteld. Eerst beoordelen we wat er nodig is."
        : fixed
          ? "Deze vaste bouwprijs past bij de omvang en functies die je hebt gekozen. Hosting komt daar apart bij."
          : "Dit is de bevestigde basis voor de bouw, met hosting apart. Voor een betrouwbare totaalprijs moeten we de onderstaande punten afstemmen.",
  };
}
