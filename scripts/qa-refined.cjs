const {
  chromium,
} = require("C:/Users/Gebruiker/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const origin = process.argv[2] || "http://127.0.0.1:5184";
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath:
      "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
    });
    page.setDefaultTimeout(20000);
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    async function questions(choices, web = false) {
      for (let i = 0; i < 15; i++) {
        await page
          .getByText(`Vraag ${i + 1} van 15`, { exact: true })
          .waitFor();
        await page
          .locator(`.answer-options input[value="${choices[i]}"]`)
          .check();
        await page
          .getByRole("button", {
            name:
              i === 14
                ? web
                  ? "Naar de technische scan"
                  : "Bekijk je resultaat"
                : "Volgende",
            exact: true,
          })
          .click();
      }
    }
    async function edit(index, value) {
      await page.locator("#antwoorden summary").click();
      await page
        .getByRole("button", { name: `Wijzig antwoord ${index}`, exact: true })
        .click();
      await page.locator(`.answer-options input[value="${value}"]`).check();
      await page.getByRole("button", { name: "Werk resultaat bij" }).click();
    }
    async function fill() {
      await page.locator("#name").fill("Sitesnit lokale QA");
      await page.locator("#email").fill("qa@example.com");
      await page
        .locator("#message")
        .fill("Lokale functionele test, geen echte klantaanvraag.");
      await page.locator("#phone").fill("0612345678");
      await page.locator("#preferredTime").fill("Dinsdagmiddag");
    }
    await page.goto(origin + "/projecten", { waitUntil: "networkidle" });
    await page
      .getByRole("link", {
        name: "Bekijk het project Atelier Vorm",
        exact: true,
      })
      .first()
      .click();
    await page.waitForURL("**/projecten/atelier-vorm");
    await page
      .getByRole("link", { name: "Plan een belafspraak", exact: true })
      .last()
      .click();
    await page.waitForURL("**/contact");
    await page.goBack();
    assert.ok(page.url().endsWith("/projecten/atelier-vorm"));
    await page.goto(origin + "/kosten");
    await page
      .getByRole("link", { name: "Bespreek je website", exact: true })
      .click();
    await page.waitForURL("**/contact?pakket=website");
    await page.waitForFunction(
      () => document.querySelector("#package")?.value === "website",
    );
    await page.goto(origin + "/prijscheck", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Start je prijscheck" }).click();
    await questions([
      "new",
      "leads",
      "contact",
      "form",
      "one",
      "simple",
      "refined",
      "none",
      "ready",
      "one",
      "none",
      "content",
      "months",
      "unknown",
      "discuss",
    ]);
    await page.locator(".result-heading").waitFor();
    assert.match(
      (await page.locator(".result-heading h1").innerText()).replace(/\s/g, ""),
      /€895/,
    );
    await page.locator(".tool-contact").waitFor();
    await fill();
    await edit(5, "five");
    assert.equal(
      await page.locator("#name").inputValue(),
      "Sitesnit lokale QA",
    );
    assert.equal(await page.locator("#package").inputValue(), "website");
    await page.locator(".context-box summary").click();
    assert.match(
      (await page.locator(".context-box pre").innerText()).replace(/\s/g, ""),
      /€1.895/,
    );
    await page.screenshot({
      path: ".sites-runtime/qa/price-result-390.png",
      fullPage: true,
    });
    let payload;
    await page.route("**/api/contact", (r) => {
      payload = r.request().postDataJSON();
      return r.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "Test: tijdelijk niet beschikbaar." }),
      });
    });
    await page
      .getByLabel("Stuur mijn antwoorden en uitkomst mee met deze aanvraag.")
      .uncheck();
    await page.getByRole("button", { name: "Verstuur je aanvraag" }).click();
    await page.getByRole("alert").waitFor();
    assert.equal(payload.toolSummary, undefined);
    assert.equal(await page.locator(".success-box").count(), 0);
    const requestId = payload.requestId;
    await page
      .getByLabel("Stuur mijn antwoorden en uitkomst mee met deze aanvraag.")
      .check();
    await page.unroute("**/api/contact");
    const saved = page.waitForResponse(
      (r) =>
        r.url().endsWith("/api/contact") && r.request().method() === "POST",
    );
    await page.getByRole("button", { name: "Verstuur je aanvraag" }).click();
    const response = await saved;
    assert.equal(response.status(), 200);
    payload = response.request().postDataJSON();
    assert.equal(payload.requestId, requestId);
    assert.ok(payload.toolSummary.includes("Antwoorden:"));
    assert.match(payload.toolSummary.replace(/\s/g, ""), /€1.895/);
    assert.ok(payload.message.includes("Dinsdagmiddag"));
    await page.locator(".success-box").waitFor();
    fs.writeFileSync(
      ".sites-runtime/qa/contact-id.txt",
      (await response.json()).id,
    );
    console.log(
      "Price: 15 answers, €895→€1.895 edit, preserved form, consent payload, failed request + real local save passed.",
    );
    await page.goto(origin + "/websitecheck", { waitUntil: "networkidle" });
    let scanRequests = 0;
    page.on("request", (r) => {
      if (r.url().endsWith("/api/lighthouse")) scanRequests++;
    });
    assert.equal(await page.locator("#scan-url").count(), 0);
    await page.getByRole("button", { name: "Start je websitecheck" }).click();
    await questions(Array(15).fill("good"), true);
    await page.locator("#scan-url").waitFor();
    assert.equal(scanRequests, 0);
    await page.locator("#scan-url").fill("http://127.0.0.1");
    await page.getByRole("button", { name: "Meet mijn website" }).click();
    await page.getByRole("alert").waitFor();
    assert.equal(scanRequests, 0);
    await page.locator("#scan-url").fill("https://webfluencer.nl/");
    const scanPromise = page.waitForResponse(
      (r) => r.url().endsWith("/api/lighthouse"),
      { timeout: 130000 },
    );
    await page.getByRole("button", { name: "Meet mijn website" }).click();
    await page.locator(".tool-contact").waitFor();
    await fill();
    console.log(
      "Website: questions first, URL last, invalid URL handled, live Google analysis started.",
    );
    const scanResponse = await scanPromise;
    const live = await scanResponse.json();
    assert.equal(scanResponse.status(), 200, JSON.stringify(live));
    fs.writeFileSync(
      ".sites-runtime/live-scan.json",
      JSON.stringify(live, null, 2),
    );
    await page.locator(".scan-status.complete").waitFor();
    assert.equal(await page.locator(".category-scores .score").count(), 4);
    assert.ok(
      await page
        .locator(".source-badge")
        .filter({ hasText: "Lighthouse" })
        .count(),
    );
    const scores = await page
      .locator(".category-scores .score")
      .allTextContents();
    assert.equal(
      await page.locator("#name").inputValue(),
      "Sitesnit lokale QA",
    );
    await edit(1, "needs");
    assert.deepEqual(
      await page.locator(".category-scores .score").allTextContents(),
      scores,
    );
    assert.equal(
      await page.locator("#name").inputValue(),
      "Sitesnit lokale QA",
    );
    await page.locator(".context-box summary").click();
    const summary = await page.locator(".context-box pre").innerText();
    assert.ok(summary.includes("Mobiele Lighthouse-labtest"));
    assert.ok(summary.includes("Antwoorden:"));
    assert.ok(summary.includes("https://webfluencer.nl/"));
    await page.screenshot({
      path: ".sites-runtime/qa/website-result-390.png",
      fullPage: true,
    });
    console.log(
      "Real Google: four measured scores, audit evidence in advice, answer edits do not change scores, live contact context + preserved form passed.",
    );
    await page
      .getByRole("button", { name: "Opnieuw beginnen", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Begin opnieuw", exact: true })
      .click();
    await page.getByRole("button", { name: "Start je websitecheck" }).click();
    await questions(Array(15).fill("partial"), true);
    let attempts = 0;
    await page.route("**/api/lighthouse", (r) =>
      r.fulfill({
        status: ++attempts === 1 ? 503 : 200,
        contentType: "application/json",
        body: JSON.stringify(
          attempts === 1
            ? { error: "Test: Google is tijdelijk niet beschikbaar." }
            : live,
        ),
      }),
    );
    await page.locator("#scan-url").fill("https://webfluencer.nl/");
    await page.getByRole("button", { name: "Meet mijn website" }).click();
    await page.locator(".scan-status.failed").waitFor();
    await page.reload();
    await page.locator(".scan-status.failed").waitFor();
    assert.equal(
      Object.keys(
        await page.evaluate(
          () =>
            JSON.parse(sessionStorage.getItem("sitesnit-websitecheck-v3"))
              .answers,
        ),
      ).length,
      15,
    );
    await page
      .getByRole("button", { name: "Probeer de technische scan opnieuw" })
      .click();
    await page.locator(".scan-status.complete").waitFor();
    await page.unroute("**/api/lighthouse");
    console.log("Failed scan + reload preserve all 15 answers; retry passed.");
    await page.goto(origin);
    await page.getByRole("button", { name: "Menu openen" }).click();
    for (let i = 0; i < 14; i++) {
      await page.keyboard.press("Tab");
      assert.ok(
        await page.evaluate(() =>
          document.querySelector("dialog").contains(document.activeElement),
        ),
      );
    }
    await page.keyboard.press("Escape");
    assert.ok(
      await page
        .getByRole("button", { name: "Menu openen" })
        .evaluate((e) => e === document.activeElement),
    );
    for (const width of [360, 390, 768, 1440, 1920]) {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
      await page.goto(origin, { waitUntil: "networkidle" });
      await page.screenshot({
        path: `.sites-runtime/qa/hero-new-${width}.png`,
      });
      for (const selector of [".fold-stage", ".route-ai"]) {
        await page
          .locator(selector)
          .evaluate((e) =>
            scrollTo({
              top: e.getBoundingClientRect().top + scrollY - innerHeight * 0.82,
              behavior: "instant",
            }),
          );
        await page.waitForTimeout(80);
        const scene = page.locator(
          selector === ".fold-stage" ? ".build-story" : selector,
        );
        const before = await scene.evaluate((e) =>
          getComputedStyle(e).getPropertyValue("--progress"),
        );
        await page
          .locator(selector)
          .evaluate((e) =>
            scrollTo({
              top: e.getBoundingClientRect().top + scrollY - innerHeight * 0.2,
              behavior: "instant",
            }),
          );
        await page.waitForTimeout(80);
        const after = await scene.evaluate((e) =>
          getComputedStyle(e).getPropertyValue("--progress"),
        );
        assert.ok(
          Number(after) > Number(before),
          `${selector} progress ${width}: ${before}->${after}`,
        );
        await page.screenshot({
          path: `.sites-runtime/qa/${selector.slice(1)}-${width}.png`,
        });
      }
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
    }
    await page.goto(origin + "/diensten");
    await page.locator(".visitor-shape").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: ".sites-runtime/qa/services-new.png",
      fullPage: true,
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(origin);
    assert.equal(await page.locator(".reveal").count(), 0);
    assert.equal(
      await page
        .locator(".build-story")
        .evaluate((e) =>
          getComputedStyle(e).getPropertyValue("--progress").trim(),
        ),
      "1",
    );
    assert.equal(await page.locator("html.depth-enabled").count(), 0);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const w of [390, 844, 390]) {
      await page.setViewportSize({ width: w, height: w === 844 ? 390 : 844 });
      for (const y of [3000, 5000, 500, 0])
        await page.evaluate(
          (y) => scrollTo({ top: y, behavior: "instant" }),
          y,
        );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1,
        ),
        false,
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      "5 widths, fold/fill progress, menu focus, reduced motion and rotation passed.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
