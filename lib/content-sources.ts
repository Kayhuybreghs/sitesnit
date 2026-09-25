/** Primary sources inspected 2026-09-22. These are evidence for named claims, not endorsements. */
export const contentSources: Record<string, {name: string; url: string; checked: string; supports: string}> = {
  robots: {name:'Google: robots-instructies',url:'https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag',checked:'2026-09-22',supports:'Noindex requires accessible crawlable instructions; intentional exclusions are valid.'},
  migration: {name:'Google: een website verhuizen',url:'https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes',checked:'2026-09-22',supports:'URL mapping, relevant permanent redirects, direct internal links and post-move monitoring.'},
  traffic: {name:'Google: veranderingen in zoekverkeer onderzoeken',url:'https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops',checked:'2026-09-22',supports:'Compare traffic periods and distinguish technical issues from changing demand.'},
  inspection: {name:'Google: URL-inspectie in Search Console',url:'https://support.google.com/webmasters/answer/9012289',checked:'2026-09-22',supports:'Indexed-version inspection differs from live eligibility; no guarantee of appearance.'},
  lighthouse: {name:'Chrome: Lighthouse-snelheidsscores',url:'https://developer.chrome.com/docs/lighthouse/performance/performance-scoring',checked:'2026-09-22',supports:'Weighted lab score and measurement variability; score is not a specific diagnosis.'},
  labfield: {name:'web.dev: labgegevens en bezoekersgegevens',url:'https://web.dev/articles/lab-and-field-data-differences',checked:'2026-09-22',supports:'Lab vs field test conditions and interpretation; no interchangeable metrics.'},
  http: {name:'Google: HTTP-statuscodes',url:'https://developers.google.com/crawling/docs/troubleshooting/http-status-codes',checked:'2026-09-22',supports:'404/410 represent missing content; successful HTTP response does not guarantee indexing.'},
  pagespeed: {name:'Google PageSpeed Insights gebruiken',url:'https://pagespeed.web.dev/',checked:'2026-09-22',supports:'External standalone page speed tool; not a Sitesnit account or crawl.'},
};
