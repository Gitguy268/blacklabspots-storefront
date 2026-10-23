import { chromium } from "playwright-core";

const OUT = "/private/var/folders/53/1d4bkdxx3fl4b2q0tcfc8zvm0000gn/T/opencode/qa";
const BASE = "http://localhost:3000";

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
page.on("console", (message) => {
  if (message.type() === "error") console.log("console error:", message.text());
});
page.on("requestfailed", (request) =>
  console.log("request failed:", request.url(), request.failure()?.errorText)
);
page.on("pageerror", (error) => console.log("page error:", error.message));

async function shot(name) {
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

async function scrollThrough(step = 700) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
}

await page.goto(BASE, { waitUntil: "networkidle" });
await shot("m-home-top");
await page.evaluate(() => window.scrollTo(0, 900));
await shot("m-home-categories");
await scrollThrough();
await page.evaluate(() => window.scrollTo(0, 2600));
await shot("m-home-grid");

await page.goto(`${BASE}/products/spot-tee-25456436`, { waitUntil: "networkidle" });
await shot("m-pdp-top");
await page.evaluate(() => window.scrollTo(0, 900));
await shot("m-pdp-purchase");
await page.evaluate(() => window.scrollTo(0, 1800));
await shot("m-pdp-details");
await page.evaluate(() => window.scrollTo(0, 260));
await shot("m-pdp-sticky");

await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
await shot("m-shop-top");
await scrollThrough();
await page.evaluate(() => window.scrollTo(0, 700));
await shot("m-shop-grid");

await browser.close();
console.log("done");
