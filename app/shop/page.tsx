import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ProductGrid } from "@/components/ProductGrid";
import { ShopControls } from "@/components/ShopControls";
import { searchProducts, sortProducts } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "The full Black Lab Spots catalog — apparel, home goods, accessories and personalized pieces. Made to order.",
  alternates: { canonical: "/shop" },
};

const FILTERS = [
  { href: "/shop", label: "All" },
  { href: "/collections/apparel", label: "Apparel" },
  { href: "/collections/home", label: "Home" },
  { href: "/collections/accessories", label: "Accessories" },
  { href: "/collections/personalized", label: "Personalized" },
];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const filtered = searchProducts(params.q ?? "");
  const sorted = sortProducts(filtered, params.sort);

  return (
    <div className="mx-auto max-w-page px-4 py-9 md:px-6 md:py-14">
      <div className="flex flex-col gap-6 border-b border-line pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
            The full catalog
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.8rem,7vw,6rem)] font-extrabold uppercase leading-[0.86] tracking-tightest">
            Shop all
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-smoke">
          Everything is printed when you order it. Pick a piece, add a name, and
          we’ll take it from there. Spot supervises quality control.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 py-5">
        {FILTERS.map((filter, index) => (
          <Link
            key={filter.href}
            href={filter.href}
            className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors ${
              index === 0
                ? "border-ink bg-ink text-paper"
                : "border-line hover:border-ink"
            }`}
          >
            {filter.label}
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
            No matches. Even Spot is confused.
          </p>
          <p className="mt-2 text-sm text-smoke">
            Try a different word, or{" "}
            <Link href="/shop" className="underline underline-offset-4">
              see everything
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
