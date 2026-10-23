#!/usr/bin/env node
/**
 * Merges live Printify product data (prices, availability, variant IDs, option
 * values) into data/catalog.json while keeping the scraped display copy/images.
 *
 * Usage:
 *   PRINTIFY_API_TOKEN=... PRINTIFY_SHOP_ID=... pnpm catalog:sync
 *
 * The script also reads .env.local so the usual local setup works.
 */

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CATALOG_PATH = path.join(process.cwd(), "data", "catalog.json");
const API = "https://api.printify.com/v1";

async function loadEnvLocal() {
  try {
    const raw = await readFile(path.join(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key]) continue;
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
  } catch {
    // .env.local is optional.
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function printify(pathname, token) {
  const response = await fetch(`${API}${pathname}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json;charset=utf-8",
      "User-Agent": "BlackLabSpots/1.0 (https://blacklabspotsshop.me)",
    },
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  if (!response.ok) {
    throw new Error(`Printify ${response.status}: ${data?.message ?? text.slice(0, 300)}`);
  }
  return data;
}

function optionKey(option) {
  if (option.type === "color") return "Color";
  if (option.type === "size") return "Size";
  return option.name;
}

function variantSignature(options) {
  return Object.entries(options)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join("|");
}

async function main() {
  await loadEnvLocal();

  const token = process.env.PRINTIFY_API_TOKEN;
  const shopId = process.env.PRINTIFY_SHOP_ID;
  if (!token || !shopId) {
    console.error(
      "Missing PRINTIFY_API_TOKEN or PRINTIFY_SHOP_ID. Add them to .env.local, then re-run `pnpm catalog:sync`."
    );
    process.exit(1);
  }

  const catalog = JSON.parse(await readFile(CATALOG_PATH, "utf8"));
  const byPrintifyId = new Map(
    catalog.products
      .filter((product) => product.printifyProductId)
      .map((product) => [String(product.printifyProductId), product])
  );
  const byName = new Map(
    catalog.products.map((product) => [product.name.trim().toLowerCase(), product])
  );

  console.log("Fetching Printify products…");
  const first = await printify(
    `/shops/${shopId}/products.json?limit=50&page=1`,
    token
  );
  const pages = first.last_page ?? 1;
  const apiProducts = [...(first.data ?? first ?? [])];

  for (let page = 2; page <= pages; page += 1) {
    const next = await printify(
      `/shops/${shopId}/products.json?limit=50&page=${page}`,
      token
    );
    apiProducts.push(...(next.data ?? next ?? []));
  }

  let matched = 0;
  const unmatched = [];

  for (const apiProduct of apiProducts) {
    const product =
      byPrintifyId.get(String(apiProduct.id)) ??
      byName.get(String(apiProduct.title ?? "").trim().toLowerCase());

    if (!product) {
      unmatched.push(apiProduct.title ?? apiProduct.id);
      continue;
    }

    const optionMap = new Map();
    const options = [];

    for (const option of apiProduct.options ?? []) {
      const key = optionKey(option);
      const values = [];
      for (const value of option.values ?? []) {
        const item = {
          id: String(value.id),
          label: value.title,
          hex: Array.isArray(value.colors) ? value.colors[0] : undefined,
        };
        values.push(item);
        optionMap.set(String(value.id), { key, ...item });
      }
      options.push({
        name: option.name,
        type:
          option.type === "color"
            ? "color"
            : option.type === "size"
              ? "size"
              : "choice",
        values,
      });
    }

    const variants = [];
    for (const variant of apiProduct.variants ?? []) {
      const variantOptions = {};
      for (const valueId of variant.options ?? []) {
        const match = optionMap.get(String(valueId));
        if (match) variantOptions[match.key] = match.label;
      }
      if (!Object.keys(variantOptions).length && options.length) continue;

      const existing = product.variants.find(
        (candidate) =>
          candidate.printifyVariantId === variant.id ||
          variantSignature(candidate.options) === variantSignature(variantOptions)
      );

      variants.push({
        id: String(variant.id),
        printifyVariantId: variant.id,
        sku: variant.sku ?? existing?.sku ?? null,
        options: variantOptions,
        price: variant.price ?? 0,
        available: Boolean(variant.is_enabled && variant.is_available),
        image: variant.mockups?.[0]?.src ?? existing?.image ?? null,
      });
    }

    if (!variants.length) {
      console.warn(`  ! ${product.name}: Printify returned no usable variants`);
      continue;
    }

    const available = variants.filter((variant) => variant.available);
    const prices = (available.length ? available : variants).map((variant) => variant.price);

    product.printifyProductId = String(apiProduct.id);
    product.options = options.map((option) => ({
      ...option,
      values: option.values.filter((value) =>
        variants.some((variant) =>
          Object.values(variant.options).includes(value.label)
        )
      ),
    })).filter((option) => option.values.length);
    product.variants = variants;
    product.price = Math.min(...prices);
    product.priceMax = Math.max(...prices) > product.price ? Math.max(...prices) : null;
    product.slug = product.slug || `${slugify(product.name)}-${apiProduct.id}`;

    matched += 1;
    console.log(`  ✓ ${product.name} (${variants.length} variants)`);
  }

  catalog.generatedAt = new Date().toISOString();
  catalog.syncedFromPrintifyAt = new Date().toISOString();

  await writeFile(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`);

  console.log(`\nUpdated ${matched} products in ${CATALOG_PATH}`);
  if (unmatched.length) {
    console.warn(
      `Printify products not found in the catalog (run catalog:scrape first):\n  - ${unmatched.join(
        "\n  - "
      )}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
