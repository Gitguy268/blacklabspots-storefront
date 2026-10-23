import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/SectionHeading";
import {
  getProduct,
  getRelatedProducts,
  productJsonLd,
  products,
} from "@/lib/catalog";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description.slice(0, 158),
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 158),
      images: product.images[0]?.src ? [{ url: product.images[0].src }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product, 3);
  const jsonLd = productJsonLd(product);
  const categoryTitle =
    product.category === "home"
      ? "Home & Living"
      : product.category.charAt(0).toUpperCase() + product.category.slice(1);

  return (
    <div className="mx-auto max-w-page px-4 pb-28 pt-5 md:px-6 md:pb-14 md:pt-8 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-2 font-mono text-[9px] uppercase tracking-[0.12em] text-smoke"
      >
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-ink">
          Shop
        </Link>
        <span>/</span>
        <Link
          href={`/collections/${product.category}`}
          className="hover:text-ink"
        >
          {categoryTitle}
        </Link>
        <span>/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <ProductDetail product={product} />

      {related.length ? (
        <section className="mt-16 border-t border-line pt-12 md:mt-24">
          <SectionHeading
            kicker="Keep looking"
            title="More good stuff"
            href={`/collections/${product.category}`}
          />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
