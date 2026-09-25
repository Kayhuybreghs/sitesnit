/** Handcrafted public services outside the generic ServiceDetail renderer. Private Hub routes do not belong here. */
export const publicServicePages = {
  '/diensten/website-monitoring': {
    slug: 'website-monitoring',
    name: 'Sitesnit Hub',
    title: 'Website-monitoring — bezoekers, Google en Sitesnit Hub',
    description: 'Bekijk wat Sitesnit Hub kan tonen over bezoekers, Google, bereikbaarheid en uitgevoerd werk. Lees welke koppelingen nodig zijn en bespreek je websitebeheer.',
    serviceType: 'Website-monitoring en inzicht in websitegegevens',
  },
} as const;
