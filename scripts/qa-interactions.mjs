import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const OUT = "/private/var/folders/53/1d4bkdxx3fl4b2q0tcfc8zvm0000gn/T/opencode/qa";
const BASE = "http://localhost:3000";
const catalog = JSON.parse(
  await readFile(new URL("../data/catalog.json", import.meta.url), "utf8")
);
const tee = catalog.products.find((product) => product.id === "25456436");

const browser = await chromium.launch({
  executablePath: "/Applications/Chromium.app/Contents/MacOS/Chromium",
  headless: true,
});
const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
});
const page = await ctx.newPage();
const cartDialog = page.getByRole("dialog", { name: "Shopping cart" });
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

function check(name, fn) {
  return Promise.resolve()
    .then(fn)
    .then(() => console.log(`✓ ${name}`))
    .catch((error) => {
      console.log(`✗ ${name}: ${error.message}`);
      throw error;
    });
}

await page.goto(`${BASE}/products/spot-tee-25456436`, { waitUntil: "networkidle" });

await check("default color is Black", async () => {
  await page.getByText("Black", { exact: true }).first().waitFor();
});
await check("sticky bar hidden at top", async () => {
  const count = await page
    .locator("div.fixed")
    .filter({ has: page.getByRole("button", { name: /add to bag/i }) })
    .count();
  assert.equal(count, 0);
});

const before = await page.locator('img[alt*="Spot TEE"]').first().getAttribute("src");
await check("selecting White changes the gallery image", async () => {
  await page.getByRole("button", { name: "White", exact: true }).click();
  await page.waitForTimeout(500);
  const after = await page.locator('img[alt*="Spot TEE"]').first().getAttribute("src");
  assert.notEqual(after, before);
  await page.getByText("White", { exact: true }).first().waitFor();
});
await page.screenshot({ path: `${OUT}/m-pdp-white.png` });

await check("selecting size M and adding personalization", async () => {
  await page.getByRole("button", { name: "M", exact: true }).click();
  await page.locator("#personalization").fill("Spot");
  await page.getByRole("button", { name: /add to bag/i }).last().click();
  await cartDialog.waitFor();
  await cartDialog.getByText("COLOR: WHITE · SIZE: M").waitFor();
  await cartDialog.getByText("“Spot”").waitFor();
});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/m-cart-drawer.png` });

await check("incrementing quantity updates the subtotal", async () => {
  await cartDialog
    .getByRole("button", { name: /increase quantity of/i })
    .click();
  const subtotal = await cartDialog
    .getByText(/^Subtotal$/i)
    .locator("..")
    .innerText();
  const expected = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((tee.price * 2) / 100);
  assert.match(subtotal, new RegExp(expected.replace("$", "\\$")));
});
await check("removing the item empties the bag", async () => {
  await cartDialog.getByRole("button", { name: /remove/i }).click();
  await cartDialog.getByText(/your bag is empty/i).waitFor();
});

await check("quick add adds a product", async () => {
  await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /quick add/i }).first().click();
  await cartDialog.waitFor();
  await cartDialog.getByText("Spot TEE").first().waitFor();
});

await check("search returns matching products", async () => {
  await page.goto(`${BASE}/shop?q=hoodie`, { waitUntil: "networkidle" });
  const count = await page.locator("article").count();
  assert.ok(count > 0, "expected at least one result");
  const body = await page.locator("body").innerText();
  assert.match(body, /hoodie/i);
});

await check("sort control is wired", async () => {
  await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
  await page.getByRole("combobox").selectOption("price-asc");
  await page.waitForTimeout(300);
  assert.equal(await page.getByRole("combobox").inputValue(), "price-asc");
});

await check("mobile menu navigates", async () => {
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Open menu" }).click();
  const menu = page.getByRole("dialog", { name: "Menu" });
  await menu.getByRole("link", { name: /Apparel/ }).click();
  await page.waitForURL("**/collections/apparel");
});

await check("legacy product URL redirects", async () => {
  await page.goto(`${BASE}/product/25456436`, { waitUntil: "networkidle" });
  assert.match(page.url(), /\/products\/spot-tee-25456436$/);
});

await check("legacy category URL redirects", async () => {
  await page.goto(`${BASE}/category/apparel`, { waitUntil: "networkidle" });
  assert.match(page.url(), /\/collections\/apparel$/);
});

await check("sticky add bar appears after scrolling", async () => {
  await page.goto(`${BASE}/products/spot-tee-25456436`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 800));
  await page.waitForTimeout(400);
  const count = await page
    .locator("div.fixed")
    .filter({ has: page.getByRole("button", { name: /add to bag/i }) })
    .count();
  assert.equal(count, 1);
});
await page.screenshot({ path: `${OUT}/m-pdp-sticky-2.png` });

await browser.close();

if (errors.length) {
  console.log(`\nConsole/page errors:\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log("\nNo console or page errors.");
}
