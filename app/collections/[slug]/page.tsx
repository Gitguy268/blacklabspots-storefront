import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { ShopControls } from "@/components/ShopControls";
import {
  COLLECTIONS,
  getCollection,
  getCollectionProducts,
  sortProducts,
} from "@/lib/catalog";
import { Suspense } from "react";

export function generateStaticParams() {
  return COLLECTIONS.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollection(slug);
  if (!collection) return { title: "Collection" };
  return {
    title: collection.title,
    description: collection.blurb,
    alternates: { canonical: `/collections/${collection.slug}` },
  };
}

export default async function CollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; q?: string }>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const collection = getCollection(slug);
  if (!collection) notFound();

  let items = getCollectionProducts(slug);
  if (query.q) {
    const q = query.q.toLowerCase();
    items = items.filter((product) =>
      [product.name, product.description, ...product.tags]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }
  const sorted = sortProducts(items, query.sort);

  return (
    <div className="mx-auto max-w-page px-4 py-9 md:px-6 md:py-14">
      <div className="grid gap-6 border-b border-line pb-7 md:grid-cols-[1.2fr_0.8fr] md:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
            {collection.kicker}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.8rem,7vw,6rem)] font-extrabold uppercase leading-[0.86] tracking-tightest">
            {collection.title}
          </h1>
        </div>
        <div className="md:justify-self-end">
          <p className="max-w-sm text-sm leading-relaxed text-smoke">
            {collection.blurb}
          </p>
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-smoke">
            {items.length} {items.length === 1 ? "piece" : "pieces"} · Made to order
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 py-5">
        <Link
          href="/shop"
          className="border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors hover:border-ink"
        >
          All
        </Link>
        {["apparel", "home", "accessories", "personalized"].map((filter) => (
          <Link
            key={filter}
            href={`/collections/${filter}`}
            className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              filter === slug
                ? "border-ink bg-ink text-paper"
                : "border-line hover:border-ink"
            }`}
          >
            {filter === "home"
              ? "Home"
              : filter === "personalized"
                ? "Personalized"
                : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Link>
        ))}
      </div>

      <Suspense fallback={<div className="h-16" />}>
        <ShopControls total={sorted.length} />
      </Suspense>

      {sorted.length ? (
        <ProductGrid products={sorted} priorityCount={3} className="pt-2" />
      ) : (
        <div className="py-20 text-center">
          <p className="font-display text-3xl font-bold uppercase tracking-tight">
            This shelf is empty.
          </p>
          <Link
            href="/shop"
            className="mt-4 inline-block font-mono text-[10px] uppercase tracking-[0.14em] underline underline-offset-4"
          >
            Shop everything
          </Link>
        </div>
      )}
    </div>
  );
}
