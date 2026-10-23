#!/usr/bin/env node
/**
 * Builds data/catalog.json from the public Black Lab Spots storefront.
 *
 * The storefront is a Printify-powered Next.js app. Its server-rendered flight
 * payload contains the same product data the shop renders, including Printify
 * variant IDs. We read only that public product data (names, prices, images,
 * options) so the new storefront can be seeded without an API token.
 *
 * Re-run with: pnpm catalog:scrape
 */

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE = "https://blacklabspotsshop.me";
const OUT = path.join(process.cwd(), "data", "catalog.json");

const CATEGORY_PAGES = [
  { slug: "mens-clothing", title: "Men" },
  { slug: "womens-clothing", title: "Women" },
  { slug: "kids-clothing", title: "Kids" },
  { slug: "home-and-living", title: "Home & Living" },
  { slug: "accessories", title: "Accessories" },
];

const COLLECTION_PAGES = [
  { slug: "personalized", path: "/collection/personalized", title: "Personalized" },
];

async function get(url, attempt = 0) {
  try {
    const res = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36",
      },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return await res.text();
  } catch (err) {
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
      return get(url, attempt + 1);
    }
    throw err;
  }
}

function flightStream(html) {
  const chunks = [];
  const re = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let m;
  while ((m = re.exec(html))) {
    try {
      chunks.push(JSON.parse(`"${m[1]}"`));
    } catch {
      // A malformed chunk should not abort the whole catalog.
    }
  }
  return chunks.join("");
}

function extractObjectAt(stream, marker) {
  const i = stream.indexOf(marker);
  if (i === -1) return null;
  const start = i + marker.length;
  if (stream[start] !== "{") return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let j = start; j < stream.length; j += 1) {
    const ch = stream[j];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth += 1;
    else if (ch === "}") {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(stream.slice(start, j + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

function flightText(stream, ref) {
  if (!ref || typeof ref !== "string" || !ref.startsWith("$")) return ref ?? "";
  const id = ref.slice(1);
  const marker = `\n${id}:T`;
  const i = stream.indexOf(marker);
  if (i === -1) return "";
  const comma = stream.indexOf(",", i + marker.length);
  if (comma === -1) return "";
  const len = Number.parseInt(stream.slice(i + marker.length, comma), 16);
  if (!Number.isFinite(len)) return "";

  // Flight text chunks declare their length in UTF-8 bytes, not UTF-16 units.
  const start = comma + 1;
  const bytes = Buffer.from(stream, "utf8");
  const byteStart = Buffer.byteLength(stream.slice(0, start), "utf8");
  return bytes.subarray(byteStart, byteStart + len).toString("utf8");
}

function decodeEntities(value) {
  const named = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    reg: "®",
    trade: "™",
    copy: "©",
    hellip: "…",
    mdash: "—",
    ndash: "–",
    rsquo: "’",
    lsquo: "‘",
    ldquo: "“",
    rdquo: "”",
  };
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number(dec)))
    .replace(/&([a-z]+);/gi, (m, name) => named[name.toLowerCase()] ?? m);
}

function htmlToText(html) {
  if (!html) return "";
  let text = html
    .replace(/<table[\s\S]*?<\/table>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "");
  text = decodeEntities(text);
  return text
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter((line, i, arr) => line.length > 0 || (i > 0 && arr[i - 1].length > 0))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function uniqueBy(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const value = key(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

function parseProduct(id, html, categoryMap, collectionMap) {
  const stream = flightStream(html);
  const active = extractObjectAt(stream, '"activeProduct":');
  if (!active) {
    console.warn(`  ! no activeProduct for ${id}`);
    return null;
  }

  const optionIndex = new Map();
  const options = [];

  for (const option of active.options ?? []) {
    const type = option.type === "color" ? "color" : option.type === "size" ? "size" : "choice";
    const key =
      type === "color" ? "Color" : type === "size" ? "Size" : option.title;
    const values = [];
    for (const item of option.items ?? []) {
      const value = {
        id: String(item.externalId ?? item.id),
        label: item.label,
        hex: Array.isArray(item.values) ? item.values[0] : undefined,
      };
      values.push(value);
      optionIndex.set(String(item.externalId), {
        name: option.title,
        key,
        type,
        ...value,
      });

      // Some payloads key variants by the internal id rather than external id.
      if (!optionIndex.has(String(item.id))) {
        optionIndex.set(String(item.id), {
          name: option.title,
          key,
          type,
          ...value,
        });
      }
    }
    options.push({
      name: option.title,
      type,
      values: uniqueBy(values, (v) => v.label),
    });
  }

  const variants = [];
  const variantMockups = new Map();
  for (const variant of active.variants ?? []) {
    const variantOptions = {};
    for (const extId of variant.options ?? []) {
      const match = optionIndex.get(String(extId));
      if (match) variantOptions[match.key] = match.label;
    }
    if (!Object.keys(variantOptions).length && options.length) continue;
    const price = variant.retailPrice ?? 0;
    if (!price) continue;

    const sortedMockups = (variant.mockups ?? [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    variantMockups.set(String(variant.id), sortedMockups);

    variants.push({
      id: String(variant.id),
      printifyVariantId: variant.id,
      sku: variant.sku ?? null,
      options: variantOptions,
      price,
      available: !(variant.outOfStock || variant.outOutStock),
      // The first mockup is sometimes a private pfy-prod S3 asset that 403s
      // for anyone outside the storefront. Prefer the public Printify mockup.
      image: sortedMockups.find((mockup) => isPublicImage(mockup.url))?.url ?? null,
    });
  }

  if (!variants.length) {
    console.warn(`  ! no variants for ${id}`);
    return null;
  }

  const available = variants.filter((v) => v.available);
  const priceFrom = Math.min(...(available.length ? available : variants).map((v) => v.price));
  const priceTo = Math.max(...(available.length ? available : variants).map((v) => v.price));

  const galleryVariant =
    (available.length ? available : variants).find((variant) =>
      (variantMockups.get(variant.id) ?? []).some((mockup) => isPublicImage(mockup.url))
    ) ?? available[0] ?? variants[0];

  const orderedVariants = [
    galleryVariant,
    ...variants.filter((variant) => variant !== galleryVariant),
  ].filter(Boolean);

  const galleryMockups = (variantMockups.get(galleryVariant?.id) ?? []).filter(
    (mockup) => isPublicImage(mockup.url)
  );
  const galleryFront = galleryMockups.find(
    (mockup) => cameraLabel(mockup.url) === "front"
  );

  const images = uniqueBy(
    [
      galleryFront
        ? { url: galleryFront.url, label: "front" }
        : active.image && isPublicImage(active.image)
          ? { url: active.image, label: "front" }
          : null,
      ...galleryMockups.map((mockup) => ({
        url: mockup.url,
        label: cameraLabel(mockup.url),
      })),
    ].filter(Boolean),
    // One image per camera angle keeps the gallery readable even when a
    // product has dozens of colour-specific mockups.
    (image) => image.label
  ).slice(0, 6);

  const description = htmlToText(flightText(stream, active.description))
    .split(/\n\s*(?:Product features|Care instructions)\b/i)[0]
    .trim();

  const maxSize = options.find((option) => option.type === "size")?.values.at(-1)
    ?.label;
  const sizedDescription =
    maxSize && ["S", "M", "L", "XL", "2XL", "3XL", "4XL"].includes(maxSize)
      ? description.replace(/up to 4XL/gi, `up to ${maxSize}`)
      : description;

  const tags = Array.isArray(active.tags) ? active.tags : [];
  const allCategorySlugs = categoryMap.get(String(id)) ?? [];
  const collections = new Set(allCategorySlugs);

  if (active.personalized) collections.add("personalized");
  for (const [slug, ids] of collectionMap) {
    if (ids.has(String(id))) collections.add(slug);
  }

  const tagText = tags.join(" ").toLowerCase();
  let category = "accessories";
  if (/home|drinkware|blanket|pillow|desk|magnet|sticker/.test(tagText)) category = "home";
  else if (/shirt|tee|hoodie|sweatshirt|polo|clothing|apparel|cap|hat/.test(tagText)) {
    category = "apparel";
  }
  if (allCategorySlugs.includes("home-and-living")) category = "home";
  else if (allCategorySlugs.includes("accessories")) category = "accessories";
  else if (
    allCategorySlugs.some((slug) =>
      ["mens-clothing", "womens-clothing", "kids-clothing"].includes(slug)
    )
  ) {
    category = "apparel";
  }

  const personalizations = Array.isArray(active.personalizations)
    ? active.personalizations.filter((p) => p.type === "text")
    : [];
  const hasImagePersonalization = Boolean(
    active.personalizationsNew?.layer?.some((layer) => layer.type === "image")
  );
  const personalizationType = personalizations.length
    ? "text"
    : hasImagePersonalization
      ? "image"
      : "text";
  const rawInstructions = personalizations[0]?.instructions;
  const instructions =
    rawInstructions && rawInstructions !== "$undefined"
      ? htmlToText(rawInstructions)
      : "";

  const features = (active.features ?? []).map((f) => ({
    name: f.name,
    description: f.description,
  }));
  const care = (active.careSets ?? []).map((c) => `${c.set}: ${c.option}`);

  const name = decodeEntities(active.title.trim());
  const product = {
    id: String(active.id),
    printifyProductId: String(active.externalId ?? ""),
    slug: `${slugify(name)}-${active.id}`,
    name,
    description:
      sizedDescription || `${name} — made to order by Black Lab Spots.`,
    price: priceFrom,
    priceMax: priceTo > priceFrom ? priceTo : null,
    currency: "USD",
    category,
    collections: [...collections],
    tags,
    images: images.map((image, index) => ({
      src: image.url,
      alt: `${name}${image.label ? ` — ${image.label.replace(/-/g, " ")}` : ""}`,
      label: image.label ?? (index === 0 ? "front" : ""),
    })),
    options: options
      .map((option) => ({
        ...option,
        values: option.values.filter((value) =>
          orderedVariants.some((variant) =>
            Object.values(variant.options).includes(value.label)
          )
        ),
      }))
      .filter((option) => option.values.length > 0),
    variants: orderedVariants,
    personalization: active.personalized
      ? {
          enabled: true,
          type: personalizationType,
          label:
            personalizationType === "image"
              ? "We’ll email you for your photo after checkout"
              : instructions || "Add a name, date, or short note",
          maxLength: 60,
        }
      : null,
    details: features,
    care,
    provider: active.printProvider
      ? `${active.printProvider.country}${active.printProvider.region ? ` / ${active.printProvider.region}` : ""}`
      : null,
    sizeGuide:
      active.sizeGuide && active.sizeGuide !== "$undefined"
        ? active.sizeGuide
        : null,
  };

  return product;
}

function cameraLabel(url) {
  try {
    const camera = new URL(url).searchParams.get("camera_label");
    return camera ?? "front";
  } catch {
    return "front";
  }
}

function isPublicImage(url) {
  return (
    typeof url === "string" &&
    !url.includes("pfy-prod-products-mockup-media.s3")
  );
}

async function main() {
  console.log("Fetching collection pages…");
  const categoryMap = new Map();
  const collectionMap = new Map();

  for (const category of CATEGORY_PAGES) {
    const html = await get(`${SITE}/category/${category.slug}`);
    const ids = [...html.matchAll(/\/product\/(\d+)/g)].map((m) => m[1]);
    const unique = [...new Set(ids)];
    console.log(`  ${category.slug}: ${unique.length} products`);
    for (const id of unique) {
      const list = categoryMap.get(id) ?? [];
      list.push(category.slug);
      categoryMap.set(id, list);
    }
  }

  for (const collection of COLLECTION_PAGES) {
    const html = await get(`${SITE}${collection.path}`);
    const ids = new Set([...html.matchAll(/\/product\/(\d+)/g)].map((m) => m[1]));
    collectionMap.set(collection.slug, ids);
    console.log(`  ${collection.slug}: ${ids.size} products`);
  }

  const allIds = [...new Set([...categoryMap.keys(), ...[...collectionMap.values()].flatMap((s) => [...s])])];
  console.log(`Fetching ${allIds.length} product pages…`);

  const products = [];
  const concurrency = 5;
  let cursor = 0;

  async function worker(workerId) {
    while (cursor < allIds.length) {
      const index = cursor;
      cursor += 1;
      const id = allIds[index];
      try {
        const html = await get(`${SITE}/product/${id}`);
        const product = parseProduct(id, html, categoryMap, collectionMap);
        if (product) {
          products.push(product);
          console.log(`  [${workerId}] ${product.name}`);
        }
      } catch (err) {
        console.warn(`  ! failed ${id}: ${err.message}`);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, (_, i) => worker(i + 1)));
  products.sort((a, b) => a.name.localeCompare(b.name));

  const catalog = {
    generatedAt: new Date().toISOString(),
    source: SITE,
    currency: "USD",
    categories: [
      { slug: "apparel", title: "Apparel", blurb: "Tees, hoodies, caps and everyday layers." },
      { slug: "home", title: "Home & Living", blurb: "Blankets, glassware, desk goods and more." },
      { slug: "accessories", title: "Accessories", blurb: "Small things for you and the dog." },
      { slug: "personalized", title: "Personalized", blurb: "Made one of one, with your name on it." },
    ],
    products,
  };

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`\nWrote ${products.length} products to ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
