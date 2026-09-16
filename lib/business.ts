// Confirmed commercial rules. Complete identity/tax fields before publication.
export const business = {
  legalName: 'Sitesnit',
  ownerName: 'Kay Huybreghs' as string | null,
  streetAddress: 'Haammakerstraat 21' as string | null,
  postalCode: '5991 MZ' as string | null,
  locality: 'Baarlo',
  country: 'Nederland',
  chamberOfCommerce: null as string | null,
  vatId: null as string | null,
  email: null as string | null,
  phone: null as string | null,
  customers: 'both' as 'business' | 'both' | 'unconfirmed',
  websitePricesIncludeVat: false as boolean | null,
  vatRate: 0.21,
  paymentDays: 14,
  depositPercent: 60,
  finalPercent: 40,
  hostingMonthly: 5,
  hostingInitialMonths: 12,
  hostingRenewal: 'monthly' as 'monthly' | 'yearly' | 'unconfirmed',
  termsVersion: '2026-09-15',
};

export const minimumHostingYear = business.hostingMonthly * business.hostingInitialMonths;
export const grossPrice = (net: number) => Math.round(net * (1 + business.vatRate) * 100) / 100;
export const paymentSummary = `Je betaalt ${business.depositPercent}% vóór de start en ${business.finalPercent}% bij afronding van de afgesproken opdracht.`;
export const hostingSummary = 'Bij een nieuwe website hoort hosting vanaf €6,05 per maand inclusief btw (€5 exclusief btw), met een eerste looptijd van 12 maanden. Dat is minimaal €72,60 inclusief btw voor het eerste hostingjaar, naast de bouwprijs.';
