const {
  chromium,
} = require("C:/Users/Gebruiker/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const origin = process.argv[2] ?? "http://127.0.0.1:5184";
(async () => {
  fs.mkdirSync(".sites-runtime/qa", { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const routes = [
    "/",
    "/diensten",
    "/projecten",
    "/projecten/atelier-vorm",
    "/projecten/studio-matcha",
    "/projecten/buiten-gewoon",
    "/kosten",
    "/over-sitesnit",
    "/contact",
    "/websitecheck",
    "/prijscheck",
    "/privacy",
  ];
  const results = [];
  for (const width of [360, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    for (const route of routes) {
      const response = await page.goto(origin + route, {
        waitUntil: "networkidle",
      });
      const result = await page.evaluate(() => ({
        title: document.title,
        h1: document.querySelectorAll("h1").length,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        broken: [...document.images]
          .filter((i) => i.complete && i.naturalWidth === 0)
          .map((i) => i.src),
        canonical: document.head
          .querySelector("link[rel=canonical]")
          ?.getAttribute("href"),
        description: document.head
          .querySelector("meta[name=description]")
          ?.getAttribute("content"),
      }));
      results.push({ width, route, status: response.status(), ...result });
      assert.equal(response.status(), 200, route);
      assert.equal(result.h1, 1, route);
      assert.equal(result.overflow, false, width + " " + route + " overflow");
      assert.equal(result.broken.length, 0, route + " broken image");
      assert.ok(result.canonical, route + " canonical");
      assert.ok(result.description, route + " description");
      if (
        route === "/" ||
        ((width === 390 || width === 1440) &&
          [
            "/kosten",
            "/projecten/atelier-vorm",
            "/prijscheck",
            "/websitecheck",
            "/contact",
            "/over-sitesnit",
          ].includes(route))
      ) {
        await page.screenshot({
          path:
            ".sites-runtime/qa/" +
            (route.replaceAll("/", "_") || "home") +
            "-" +
            width +
            ".png",
          fullPage: route !== "/",
        });
      }
    }
    console.log("Responsive routes passed: " + width);
  }
  fs.writeFileSync(
    ".sites-runtime/qa/responsive.json",
    JSON.stringify({ results, errors }, null, 2),
  );
  await browser.close();
  assert.equal(errors.length, 0, "Browser errors: " + errors.join("; "));
  console.log("All responsive route checks passed.");
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
