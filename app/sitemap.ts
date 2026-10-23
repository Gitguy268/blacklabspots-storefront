import type { MetadataRoute } from "next";
import { COLLECTIONS, products } from "@/lib/catalog";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://blacklabspotsshop.me";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/shop", "/about", "/terms", "/privacy"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: route === "" ? 1 : 0.7,
    })
  );

  const collectionRoutes = COLLECTIONS.filter(
    (collection) => !("hidden" in collection && collection.hidden)
  ).map((collection) => ({
    url: `${baseUrl}/collections/${collection.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productRoutes = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
