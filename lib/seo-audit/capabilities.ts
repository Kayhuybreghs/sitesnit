/** Public limits shared by the crawler, API and explanatory UI. */
export const auditCapabilities = {
  maxPages: 20,
  crawlBudgetMs: 45_000,
  requestBudgetMs: 50_000,
  labTimeoutMs: 110_000,
  clientTimeoutMs: 180_000,
  dailyAttempts: 1,
  globalDailyAttempts: 25,
  dailyWindowSeconds: 86_400,
  resetTime: '00:00 UTC',
} as const;

export const auditScope = `HTML-steekproef: maximaal ${auditCapabilities.maxPages} pagina’s, een domein en ${auditCapabilities.crawlBudgetMs / 1000} seconden crawlbudget. Geen JavaScript-rendering van de crawl, backlinkdatabase, Google-indexcontrole of volledige schema-validatie. Een eventuele afzonderlijke mobiele Lighthouse-labtest geldt alleen voor de gemeten startpagina. Query-URLs, privé-routes en nofollow-links worden niet gevolgd.`;
