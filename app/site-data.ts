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
export const projects: Project[] = [];
