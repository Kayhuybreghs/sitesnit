import lighthouse from "../.sites-runtime/quality/node_modules/lighthouse/core/index.js";
import { launch } from "../.sites-runtime/quality/node_modules/chrome-launcher/dist/index.js";
import fs from "node:fs";
const chrome = await launch({
  chromePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  chromeFlags: ["--headless", "--no-first-run"],
});
try {
  const target = process.argv[2] || "http://127.0.0.1:5185/";
  const label = process.argv[3] || "sitesnit-lighthouse";
  if (!/^[a-z0-9-]+$/.test(label)) throw Error("Use a simple report filename.");
  const r = await lighthouse(target, {
    port: chrome.port,
    output: ["json", "html"],
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    logLevel: "error",
  });
  if (r.lhr.runtimeError) throw Error(r.lhr.runtimeError.message);
  fs.writeFileSync(`.sites-runtime/qa/${label}.json`, r.report[0]);
  fs.writeFileSync(`.sites-runtime/qa/${label}.html`, r.report[1]);
  console.log(
    JSON.stringify(
      {
        categories: Object.fromEntries(
          Object.entries(r.lhr.categories).map(([k, v]) => [k, v.score]),
        ),
        metrics: Object.fromEntries(
          [
            "first-contentful-paint",
            "largest-contentful-paint",
            "total-blocking-time",
            "cumulative-layout-shift",
          ].map((k) => [k, r.lhr.audits[k].displayValue]),
        ),
        failed: Object.entries(r.lhr.audits)
          .filter(
            ([, a]) =>
              a.score !== null &&
              a.score < 0.9 &&
              ["binary", "metricSavings"].includes(a.scoreDisplayMode),
          )
          .map(([id, a]) => ({
            id,
            title: a.title,
            displayValue: a.displayValue,
          })),
      },
      null,
      2,
    ),
  );
} finally {
  try { await chrome.kill(); } catch (error) {
    if (error.code !== "EPERM") throw error;
    console.warn("Lighthouse report saved; Windows temporarily locked the isolated browser profile during cleanup.");
  }
}
