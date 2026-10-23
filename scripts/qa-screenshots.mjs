import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const OUT = "/private/var/folders/53/1d4bkdxx3fl4b2q0tcfc8zvm0000gn/T/opencode/qa";
const BASE = "http://localhost:3000";
const executablePath = "/Applications/Chromium.app/Contents/MacOS/Chromium";

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath, headless: true });

async function context(viewport) {
  return browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    isMobile: viewport.width < 600,
    hasTouch: viewport.width < 600,
    userAgent:
      viewport.width < 600
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1"
        : undefined,
  });
}

async function watch(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      console.log(`[${label}] console error: ${message.text()}`);
    }
  });
  page.on("requestfailed", (request) => {
    const failure = request.failure();
    console.log(`[${label}] request failed: ${request.url()} — ${failure?.errorText}`);
  });
  page.on("pageerror", (error) => {
    console.log(`[${label}] page error: ${error.message}`);
  });
}

async function desktop() {
  const ctx = await context({ width: 1440, height: 1000 });
  const page = await ctx.newPage();
  await watch(page, "desktop");

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/home-desktop.png`, fullPage: true });

  await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/shop-desktop.png`, fullPage: false });

  await page.goto(`${BASE}/products/spot-tee-25456436`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/pdp-desktop.png`, fullPage: false });

  // Add the default variant to the bag and open the drawer.
  await page.getByRole("button", { name: /add to bag/i }).first().click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/cart-drawer.png`, fullPage: false });

  // Go through the preview checkout.
  await page.getByRole("link", { name: /checkout/i }).first().click();
  await page.waitForURL("**/checkout");
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/checkout-desktop.png`, fullPage: false });

  await page.getByLabel("Email").fill("spot@gooddog.com");
  await page.getByLabel("First name").fill("Spot");
  await page.getByLabel("Last name").fill("Dog");
  await page.getByLabel("Address").fill("123 Good Dog Lane");
  await page.getByLabel("City").fill("Portland");
  await page.getByLabel("State / region").fill("OR");
  await page.getByLabel("Postal code").fill("97201");
  await page.getByRole("button", { name: /place preview order/i }).click();
  await page.waitForURL("**/checkout/success**", { timeout: 15000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/success-desktop.png`, fullPage: false });

  await ctx.close();
}

async function mobile() {
  const ctx = await context({ width: 390, height: 844 });
  const page = await ctx.newPage();
  await watch(page, "mobile");

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/home-mobile.png`, fullPage: true });

  await page.goto(`${BASE}/products/spot-tee-25456436`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/pdp-mobile.png`, fullPage: true });

  await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
  await page.screenshot({ path: `${OUT}/shop-mobile.png`, fullPage: true });

  await ctx.close();
}

await desktop();
await mobile();
await browser.close();
console.log(`Screenshots written to ${OUT}`);
