const {
  chromium,
} = require("C:/Users/Gebruiker/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const axe = require("../.sites-runtime/quality/node_modules/axe-core");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    const results = [];
    async function check(name) {
      await page.evaluate(axe.source);
      const r = await page.evaluate(
        async () =>
          await axe.run(document, {
            runOnly: {
              type: "tag",
              values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"],
            },
          }),
      );
      results.push({
        name,
        violations: r.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
        passes: r.passes.length,
      });
      console.log(name + ": " + r.violations.length + " violations");
    }
    for (const route of [
      "/",
      "/diensten",
      "/projecten",
      "/projecten/atelier-vorm",
      "/kosten",
      "/over-sitesnit",
      "/contact",
      "/prijscheck",
      "/websitecheck",
      "/privacy",
    ]) {
      await page.goto("http://127.0.0.1:5184" + route, {
        waitUntil: "networkidle",
      });
      await check(route);
      if (route === "/") {
        await page.getByRole("button", { name: "Menu openen" }).click();
        await page.getByRole("dialog").waitFor();
        await check("mobile menu");
        await page.keyboard.press("Escape");
      }
      if (route === "/prijscheck") {
        await page.getByRole("button", { name: "Start je prijscheck" }).click();
        await page.locator(".question-card").waitFor();
        await check("price question");
        await page.screenshot({
          path: ".sites-runtime/qa/price-question-390.png",
          fullPage: true,
        });
      }
    }
    fs.writeFileSync(
      ".sites-runtime/qa/accessibility.json",
      JSON.stringify(results, null, 2),
    );
    if (results.some((r) => r.violations.length)) process.exitCode = 1;
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
