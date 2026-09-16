import type { Answers } from "./questions";

export function parseMoney(value: string): number | null {
  const trimmed = value.trim().replace(/[€\s]/g, "");
  if (!trimmed) return null;
  let normalized = trimmed;
  if (/^\d{1,3}(\.\d{3})+(,\d{1,2})?$/.test(trimmed))
    normalized = trimmed.replaceAll(".", "").replace(",", ".");
  else if (/^\d+(,\d{1,2})?$/.test(trimmed))
    normalized = trimmed.replace(",", ".");
  else if (!/^\d+(\.\d{1,2})?$/.test(trimmed)) return null;
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount >= 0 && amount <= 10000000
    ? Math.round(amount * 100)
    : null;
}
export const scopeItems = [
  ["content", "Teksten"],
  ["images", "Beelden"],
  ["features", "Gewenste functies"],
  ["management", "Zelf aanpassen"],
  ["hosting", "Hosting"],
  ["support", "Onderhoud & ondersteuning"],
] as const;
export type ScopeKey = (typeof scopeItems)[number][0];
export type Offer = {
  id: string;
  name: string;
  once: string;
  monthly: string;
  yearly: string;
  includedMonths: string;
  example?: boolean;
  vat: "excl" | "incl" | "unknown";
  rates: "fixed" | "unknown";
  pages: string;
  scope: Record<ScopeKey, "yes" | "no" | "unknown">;
};
export function emptyOffer(id: string, name: string): Offer {
  return {
    id,
    name,
    once: "",
    monthly: "",
    yearly: "",
    includedMonths: "0",
    vat: "unknown",
    rates: "fixed",
    pages: "",
    scope: {
      content: "unknown",
      images: "unknown",
      features: "unknown",
      management: "unknown",
      hosting: "unknown",
      support: "unknown",
    },
  };
}
export function offerTotals(offer: Offer) {
  const amounts = [
    parseMoney(offer.once),
    parseMoney(offer.monthly),
    parseMoney(offer.yearly),
  ];
  const labels = ["eenmalige kosten", "maandkosten", "jaarkosten"];
  const missing = labels.filter((_, i) => amounts[i] === null);
  const invalid = [offer.once, offer.monthly, offer.yearly].flatMap(
    (value, i) => (value.trim() && amounts[i] === null ? [labels[i]] : []),
  );
  const included = Number(offer.includedMonths);
  const includedValid =
    /^\d{1,2}$/.test(offer.includedMonths) && included >= 0 && included <= 36;
  if (!includedValid) invalid.push("aantal inbegrepen maanden");
  if (offer.rates === "unknown") missing.push("tarieven bij verlenging");
  const total = (months: number) =>
    invalid.length || amounts.every((n) => n === null)
      ? null
      : (amounts[0] ?? 0) +
        (offer.rates === "unknown"
          ? 0
          : (amounts[1] ?? 0) *
              Math.max(0, months - (includedValid ? included : 0)) +
            (amounts[2] ?? 0) * (months / 12));
  return {
    year: total(12),
    threeYears: total(36),
    complete: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}
export function offersComparable(offers: Offer[]) {
  return (
    offers.every((o) => o.vat !== "unknown" && offerTotals(o).complete) &&
    new Set(offers.map((o) => o.vat)).size === 1
  );
}
export const offerVatLabel = {
  excl: "excl. btw",
  incl: "incl. btw",
  unknown: "btw-basis onbekend",
};
export const offerScopeLabel = {
  yes: "Inbegrepen",
  no: "Niet inbegrepen",
  unknown: "Niet vermeld",
};
export function offerQuestions(offers: Offer[]) {
  const mixed =
    new Set(offers.map((o) => o.vat).filter((v) => v !== "unknown")).size > 1;
  return [
    ...(mixed
      ? [
          "Zet alle voorstellen op dezelfde btw-basis voordat je bedragen vergelijkt.",
        ]
      : []),
    ...offers.flatMap((o) => {
      const t = offerTotals(o);
      return [
        ...t.invalid.map(
          (label) => `${o.name}: controleer de invoer bij ${label}.`,
        ),
        ...(o.vat === "unknown"
          ? [`${o.name}: zijn alle bedragen inclusief of exclusief btw?`]
          : []),
        ...(!o.pages.trim()
          ? [`${o.name}: welke pagina’s en omvang zijn afgesproken?`]
          : []),
        ...t.missing
          .filter((m) => !t.invalid.includes(m))
          .map((label) => `${o.name}: wat is afgesproken over ${label}?`),
        ...scopeItems
          .filter(([key]) => o.scope[key] === "unknown")
          .map(
            ([, label]) =>
              `${o.name}: wat is inbegrepen bij ${label.toLowerCase()}?`,
          ),
      ];
    }),
  ];
}
export function summarizeOffers(offers: Offer[]) {
  const money = (v: number | null) =>
    v === null
      ? "niet berekend"
      : new Intl.NumberFormat("nl-NL", {
          style: "currency",
          currency: "EUR",
        }).format(v / 100);
  return (
    "WEBSITEOFFERTES VERGELIJKEN — SITESNIT\n" +
    (offers.some((o) => o.example)
      ? "Deze vergelijking is gestart met fictieve voorbeeldgegevens. Controleer alle bedragen en afspraken.\n"
      : "Bedragen zijn door de bezoeker ingevuld.\n") +
    "Geen kwaliteitsbeoordeling.\n\n" +
    offers
      .map((o) => {
        const t = offerTotals(o);
        return `${o.name} (${offerVatLabel[o.vat]})${o.example ? " — gestart als fictief voorbeeld" : ""}\nEenmalig: ${o.once || "niet vermeld"}; per maand: ${o.monthly || "niet vermeld"}; per jaar: ${o.yearly || "niet vermeld"}\nInbegrepen maanden: ${o.includedMonths}; tarieven: ${o.rates === "fixed" ? "gelijkblijvend" : "verlenging onbekend; terugkerende bedragen niet meegerekend"}\n${t.invalid.length ? `Controleer invoer: ${t.invalid.join(", ")}. Totalen niet berekend.` : `${t.complete ? "Totaal" : "Bekend subtotaal"} 12 maanden: ${money(t.year)}; 36 maanden: ${money(t.threeYears)}`}\nPagina’s: ${o.pages || "niet vermeld"}\n${scopeItems.map(([id, label]) => `${label}: ${offerScopeLabel[o.scope[id]]}`).join("\n")}`;
      })
      .join("\n\n") +
    `\n\nOPEN PUNTEN\n${offerQuestions(offers).join("\n") || "De ingevulde onderdelen zijn benoemd. Bekijk ook werk, aanpak en afspraken."}\n\nGeen prijsrangorde. Inhoud en btw-basis moeten worden afgestemd. Aanname: ingevoerde vaste tarieven blijven gelijk.`
  );
}
export const automationTasks = {
  invoice: {
    name: "Factuurconcepten voorbereiden",
    intro: "Van opdrachtgegevens naar een controleerbaar factuurconcept.",
    prepare: "Factuurconcept voorbereiden",
    fields: "Klantgegevens, afgesproken bedragen en factuurregels",
    checks: "Wie het concept controleert voordat het wordt verstuurd",
  },
  intake: {
    name: "Aanvragen ordenen",
    intro: "Van een losse aanvraag naar een bruikbaar dossier.",
    prepare: "Aanvraag structureren",
    fields: "Contactgegevens, de vraag en ontbrekende informatie",
    checks: "Hoe onvolledige aanvragen worden opgevolgd",
  },
  support: {
    name: "Klantvragen beantwoorden",
    intro: "Van een terugkerende vraag naar een passend conceptantwoord.",
    prepare: "Conceptantwoord opstellen",
    fields: "Goedgekeurde bedrijfsinformatie en de vraag van de klant",
    checks: "Wanneer een vraag naar een medewerker gaat",
  },
  transfer: {
    name: "Gegevens overnemen",
    intro: "Van overtypen naar een gecontroleerde gegevensstroom.",
    prepare: "Gegevens vertalen en klaarzetten",
    fields: "Bronvelden, doelvelden en regels voor dubbele gegevens",
    checks:
      "Wat er gebeurt als informatie ontbreekt of een systeem niet reageert",
  },
} as const;
export type AutomationInput = {
  task: keyof typeof automationTasks;
  source: string;
  destination: string;
  count: string;
  minutes: string;
  control: "each" | "exceptions" | "unknown";
};
export function automationPlan(input: AutomationInput) {
  const task = automationTasks[input.task] ?? automationTasks.intake;
  const number = (s: string) =>
    /^\d+(?:[,.]\d{1,2})?$/.test(s.trim()) ? Number(s.replace(",", ".")) : null;
  const count = number(input.count),
    minutes = number(input.minutes);
  const valid =
    count !== null && minutes !== null && count <= 1000000 && minutes <= 1440;
  const control =
    input.control === "each"
      ? "Jouw controle per uitkomst"
      : input.control === "exceptions"
        ? "Controle van uitzonderingen"
        : "Controlemoment samen bepalen";
  const steps = [
    input.source.trim() || "Jouw informatiebron",
    "Invoer controleren",
    task.prepare,
    control,
    input.destination.trim() || "Afgesproken bestemming",
  ];
  const pending = [
    task.fields,
    task.checks,
    "Welke toegang en koppelmogelijkheden de genoemde software biedt",
  ];
  if (
    input.control === "exceptions" &&
    ["invoice", "support"].includes(input.task)
  )
    pending.unshift(
      "Welke concepten eerst goedkeuring nodig hebben en welke uitzonderingen herkenbaar zijn",
    );
  return {
    task,
    steps,
    pending,
    hours: valid ? (count * minutes) / 60 : null,
    invalid:
      (input.count.trim() !== "" && (count === null || count > 1000000)) ||
      (input.minutes.trim() !== "" && (minutes === null || minutes > 1440)),
  };
}
export type DesignInput = {
  name: string;
  activity: string;
  audience: string;
  services: string;
  goal: "contact" | "booking" | "shop" | "work";
  style: "bold" | "editorial" | "friendly";
  palette: "blue" | "forest" | "coral" | "plum";
  pages: "one" | "five" | "more" | "unknown";
  headline: string;
  intro: string;
  cta: string;
};
export const emptyDesign: DesignInput = {
  name: "",
  activity: "",
  audience: "",
  services: "",
  goal: "contact",
  style: "bold",
  palette: "blue",
  pages: "five",
  headline: "",
  intro: "",
  cta: "",
};
export const designPalettes = {
  blue: {
    name: "Helder blauw",
    accent: "#2348ba",
    paper: "#eef3fc",
    ink: "#102744",
    soft: "#d5e2fc",
  },
  forest: {
    name: "Diep groen",
    accent: "#225844",
    paper: "#f0f5df",
    ink: "#19392e",
    soft: "#d6e5b3",
  },
  coral: {
    name: "Warm koraal",
    accent: "#a43725",
    paper: "#fff2e8",
    ink: "#412a26",
    soft: "#f3c6ae",
  },
  plum: {
    name: "Rijke bordeaux",
    accent: "#772c4a",
    paper: "#fbf0f0",
    ink: "#372338",
    soft: "#e9c9d1",
  },
} as const;
export const designStyles = {
  bold: "Krachtig & grafisch",
  editorial: "Rustig & redactioneel",
  friendly: "Warm & persoonlijk",
};
export function designPlan(input: DesignInput) {
  const services = input.services
    .split(/\n|,/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);
  const name = input.name.trim() || "Jouw bedrijf";
  const activity = input.activity.trim() || "jouw diensten";
  const action =
    input.cta.trim() ||
    {
      contact: "Bespreek je vraag",
      booking: "Bespreek een afspraak",
      shop: "Ontdek het aanbod",
      work: "Bekijk het werk",
    }[input.goal];
  const headline =
    input.headline.trim() ||
    {
      contact: `${activity}. Met aandacht voor jou.`,
      booking: `${activity}. Tijd voor jouw plannen.`,
      shop: `${activity}. Ontdek wat bij je past.`,
      work: `${activity}. Bekijk het werk.`,
    }[input.goal];
  const intro =
    input.intro.trim() ||
    `${activity}${input.audience.trim() ? ` voor ${input.audience.trim()}` : ''}. Ontdek het aanbod van ${name} en bespreek wat bij jouw vraag past.`;
  const pages = [
    "Home",
    input.goal === "shop" ? "Aanbod" : "Diensten",
    input.goal === "work" ? "Portfolio" : "Werk & voorbeelden",
    "Over je bedrijf",
    "Contact",
  ];
  const content = [
    "Jouw introductie en wat klanten bij je kunnen verwachten",
    "Een concrete uitleg per dienst of productgroep",
    "Eigen beelden en echte voorbeelden van je werk",
    "Een persoonlijk verhaal en bevestigde contactgegevens",
  ];
  const pending = [
    ...(input.pages === "more"
      ? ["Het aantal extra pagina’s en hun inhoud"]
      : input.pages === "unknown"
        ? ["De uiteindelijke paginaomvang"]
        : []),
    ...(input.goal === "shop"
      ? ["Of je producten alleen wilt tonen of ook online wilt verkopen"]
      : input.goal === "booking"
        ? ["Of afspraken via contact of via een boekingssysteem lopen"]
        : []),
    "De gewenste functies, beschikbare teksten en beelden",
    "Beheer, planning en de uiteindelijke investering",
  ];
  return {
    name,
    services: services.length
      ? services
      : ["Jouw eerste dienst", "Jouw tweede dienst", "Jouw derde dienst"],
    headline,
    intro,
    action,
    pages,
    content,
    pending,
  };
}
export function websiteBrief(answers: Answers) {
  const pages =
    answers.pages === "one"
      ? ["Introductie", "Aanbod", "Vertrouwen & voorbeelden", "Contact"]
      : [
          "Home",
          "Diensten / aanbod",
          "Werk & voorbeelden",
          "Over je bedrijf",
          "Contact",
        ];
  const content = [
    "Introductie: wat je doet, voor wie en hoe iemand verdergaat",
    "Aanbod: duidelijke uitleg over je diensten of producten",
    "Vertrouwen: eigen beelden, werkvoorbeelden en bevestigde informatie",
    "Contact: je belangrijkste actie en de gegevens die daarvoor nodig zijn",
  ];
  if (answers.action === "checkout")
    content.push(
      "Webshop: producten, prijzen, betaal- en verzendinformatie uitwerken",
    );
  if (answers.action === "booking")
    content.push("Afspraken: bepalen hoe boeken en bevestigen moeten werken");
  if (answers.languages === "multiple")
    content.push(
      "Talen: vertalingen en beheer van iedere taalversie afspreken",
    );
  return {
    pages,
    content,
    label:
      answers.pages === "one"
        ? "Onderdelen van je onepager"
        : "Voorgestelde pagina’s",
    note:
      answers.pages === "unknown" || answers.pages === "more"
        ? "Deze indeling is een vertrekpunt. Je uiteindelijke pagina’s bepalen we samen."
        : "Pas de namen en verdeling aan je eigen aanbod aan.",
  };
}
