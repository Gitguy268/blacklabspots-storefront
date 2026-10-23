import catalogJson from "@/data/catalog.json";
import type { Catalog, Product } from "./types";

export const catalog = catalogJson as Catalog;
export const products = catalog.products;

export const COLLECTIONS = [
  {
    slug: "apparel",
    title: "Apparel",
    kicker: "01 — WEAR",
    blurb: "Tees, hoodies, caps and layers built for dog hair and long walks.",
  },
  {
    slug: "home",
    title: "Home & Living",
    kicker: "02 — LIVE",
    blurb: "Blankets, glassware, desk goods and small reminders of the good dog.",
  },
  {
    slug: "accessories",
    title: "Accessories",
    kicker: "03 — CARRY",
    blurb: "The little things: stickers, straps, jewelry and everyday hardware.",
  },
  {
    slug: "personalized",
    title: "Personalized",
    kicker: "04 — ONE OF ONE",
    blurb: "Your dog's name, your favorite words, your inside joke. Made to order, just for you.",
  },
  {
    slug: "mens-clothing",
    title: "Men",
    kicker: "SHOP — MEN",
    blurb: "Unisex cuts made for everyone. Sizes S–4XL on most apparel.",
    hidden: true,
  },
  {
    slug: "womens-clothing",
    title: "Women",
    kicker: "SHOP — WOMEN",
    blurb: "Relaxed, unisex silhouettes. Size down for a closer fit.",
    hidden: true,
  },
  {
    slug: "kids-clothing",
    title: "Kids",
    kicker: "SHOP — KIDS",
    blurb: "Small humans, big dog energy.",
    hidden: true,
  },
  {
    slug: "home-and-living",
    title: "Home & Living",
    kicker: "SHOP — HOME",
    blurb: "Blankets, glassware, desk goods and small reminders of the good dog.",
    hidden: true,
  },
] as const;

export type CollectionSlug = (typeof COLLECTIONS)[number]["slug"];

export const FEATURED_IDS = [
  "25456436", // Spot TEE
  "25392440", // Minimal Black Labrador Embroidered Hoodie
  "26577084", // Spot Blanket
  "25391915", // Personalised Spot Necklace
  "26577022", // Spot Photo
  "26578048", // Spot can cooler
  "29988529", // Spot Dad Cap
  "26577402", // Spot TEE 5
];

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getCollection(slug: string) {
  return COLLECTIONS.find((collection) => collection.slug === slug);
}

export function getCollectionProducts(slug: string): Product[] {
  switch (slug) {
    case "apparel":
      return products.filter((product) => product.category === "apparel");
    case "home":
    case "home-and-living":
      return products.filter((product) => product.category === "home");
    case "accessories":
      return products.filter((product) => product.category === "accessories");
    case "personalized":
      return products.filter((product) => product.personalization?.enabled);
    case "mens-clothing":
    case "womens-clothing":
    case "kids-clothing":
      return products.filter((product) => product.collections.includes(slug));
    default:
      return [];
  }
}

export function getCollectionCount(slug: string): number {
  return getCollectionProducts(slug).length;
}

export function getFeaturedProducts(limit = 6): Product[] {
  const featured = FEATURED_IDS.map((id) => getProductById(id)).filter(
    (product): product is Product => Boolean(product)
  );
  const seen = new Set(featured.map((product) => product.id));
  for (const product of products) {
    if (featured.length >= limit) break;
    if (!seen.has(product.id)) {
      featured.push(product);
      seen.add(product.id);
    }
  }
  return featured.slice(0, limit);
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id && candidate.category === product.category
    )
    .slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return products;
  return products.filter((product) =>
    [product.name, product.description, product.category, ...product.tags]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}

export function sortProducts(items: Product[], sort: string | undefined): Product[] {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return copy.sort((a, b) => {
        const ai = FEATURED_IDS.indexOf(a.id);
        const bi = FEATURED_IDS.indexOf(b.id);
        if (ai !== -1 && bi !== -1) return ai - bi;
        if (ai !== -1) return -1;
        if (bi !== -1) return 1;
        return a.name.localeCompare(b.name);
      });
  }
}

export function productJsonLd(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description.slice(0, 500),
    image: product.images.map((image) => image.src),
    brand: { "@type": "Brand", name: "Black Lab Spots" },
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "USD",
      lowPrice: (product.price / 100).toFixed(2),
      highPrice: ((product.priceMax ?? product.price) / 100).toFixed(2),
      availability: product.variants.some((variant) => variant.available)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://blacklabspotsshop.me/products/${product.slug}`,
    },
  };
}
