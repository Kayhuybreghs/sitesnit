import "server-only";
import { getDatabase } from "./database";

export function runtime() {
  return {
    DB: getDatabase(),
    PAGESPEED_API_KEY: process.env.PAGESPEED_API_KEY,
    GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
    SITESNIT_INDEXING_ENABLED: process.env.SITESNIT_INDEXING_ENABLED,
    GA4_MEASUREMENT_ID: process.env.GA4_MEASUREMENT_ID,
    GA4_PRIVACY_CONFIGURED: process.env.GA4_PRIVACY_CONFIGURED,
    CRON_SECRET: process.env.CRON_SECRET,
    RATE_LIMIT_SECRET: process.env.RATE_LIMIT_SECRET,
  };
}
