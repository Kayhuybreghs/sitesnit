import { productionOrigin } from '../lib/seo-policy';
import { business } from '../lib/business';
export const site = {
  name: "Sitesnit",
  averageProjectCost: 4000,
  email: business.email,
  region: "Limburg",
  origin: productionOrigin,
  base: "Baarlo",
  packages: [
    {
      id: "onepager",
      name: "Onepager",
      pages: "1 pagina",
      price: 895,
      description: "Je aanbod, verhaal en contact op één overzichtelijke pagina.",
      points: [
        "Eén doorlopend verhaal",
        "Een duidelijke route naar contact",
        "Voor een compact aanbod",
      ],
    },
    {
      id: "website",
      name: "Website",
      pages: "5 pagina’s",
      price: 1895,
      description: "Geef je diensten, bedrijf en werk elk de ruimte die ze nodig hebben.",
      points: [
        "Vijf afzonderlijke pagina’s",
        "Meer ruimte voor je diensten",
        "Een compleet verhaal over je bedrijf",
      ],
    },
    {
      id: "maatwerk",
      name: "Volledige vrijheid",
      pages: "Maatwerk",
      price: 2750,
      description: "Voor een website waarvan omvang of functies een eigen aanpak vragen.",
      points: [
        "Omvang op jouw plannen afgestemd",
        "Ontwerpvrijheid binnen de opdracht",
        "Functies en inhoud samen bepalen",
      ],
    },
  ],
};
export const euro = (n: number) =>
  new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
export type Project = {
  slug: string;
  name: string;
  category: string;
  theme: string;
  image: string;
  tagline: string;
  summary: string;
  challenge: string;
  choices: string[];
};
export const projects: Project[] = [
  {
    slug: "atelier-vorm",
    name: "Atelier Vorm",
    category: "Interieur & design",
    theme: "peach",
    image: "chair",
    tagline: "Ruimte voor karakter.",
    summary:
      "Een rustige, beeldgedreven website voor een denkbeeldig interieurmerk.",
    challenge:
      "Hoe geef je een zorgvuldig ontworpen collectie online dezelfde aandacht als in een showroom?",
    choices: [
      "Grote productbeelden laten materiaal en vorm spreken.",
      "Een duidelijke indeling verbindt inspiratie met de collectie.",
      "De mobiele versie houdt beelden groot en de volgende stap dichtbij.",
    ],
  },
  {
    slug: "studio-matcha",
    name: "Studio Matcha",
    category: "Horeca & lifestyle",
    theme: "lime",
    image: "matcha",
    tagline: "Een moment voor jezelf.",
    summary:
      "Een frisse digitale ontmoetingsplek voor een denkbeeldige matchabar.",
    challenge:
      "Hoe laat je sfeer, aanbod en praktische informatie samenkomen zonder een bezoeker te laten zoeken?",
    choices: [
      "Frisse groentinten en herkenbare fotografie brengen de sfeer over.",
      "Het aanbod staat vroeg op de pagina, met korte omschrijvingen.",
      "Praktische informatie krijgt op mobiel een vaste, zichtbare plek.",
    ],
  },
  {
    slug: "buiten-gewoon",
    name: "Buiten Gewoon",
    category: "Architectuur",
    theme: "blue",
    image: "architecture",
    tagline: "Wonen begint met ruimte.",
    summary:
      "Een open, redactioneel portfolio voor een denkbeeldige architectuurstudio.",
    challenge:
      "Hoe laat je bezoekers voorbij een mooie gevel kijken en de gedachte achter een ontwerp ontdekken?",
    choices: [
      "Projectverhalen verbinden grote beelden met concrete ontwerpkeuzes.",
      "Verschillende beeldformaten geven de architectuur ruimte.",
      "Een compact contactmoment sluit ieder project af.",
    ],
  },
];
