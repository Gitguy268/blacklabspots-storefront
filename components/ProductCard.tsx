import Image from "next/image";
import Link from "next/link";
import { defaultVariant } from "@/lib/product";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { QuickAdd } from "./QuickAdd";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const variant =
    product.variants
      .filter((candidate) => candidate.available)
      .sort((a, b) => a.price - b.price)[0] ?? defaultVariant(product);
  const primary = product.images[0];
  const secondary = product.images.find((image) => image.label !== primary?.label);
  const isRange = Boolean(product.priceMax && product.priceMax > product.price);

  return (
    <article className="group relative">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-white"
      >
        {primary ? (
          <Image
            src={primary.src}
            alt={primary.alt}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-3 transition-[transform,opacity] duration-500 ease-swift group-hover:scale-[1.03] md:p-5"
          />
        ) : null}
        {secondary ? (
          <Image
            src={secondary.src}
            alt={secondary.alt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-contain p-3 opacity-0 transition-opacity duration-500 ease-swift group-hover:opacity-100 md:p-5"
          />
        ) : null}

        <span className="absolute left-3 top-3 flex items-center gap-1.5 bg-paper/90 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-ink backdrop-blur">
          {product.category === "home"
            ? "Home"
            : product.category === "apparel"
              ? "Apparel"
              : "Accessories"}
          {product.personalization?.enabled ? (
            <span
              className="size-1 rounded-full bg-spot"
              title="Personalization available"
            />
          ) : null}
        </span>

        {variant ? (
          <div className="absolute bottom-3 right-3 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
            <QuickAdd
              item={{
                productId: product.id,
                slug: product.slug,
                name: product.name,
                image: primary?.src ?? variant.image ?? "",
                price: variant.price,
                options: variant.options,
              }}
            />
          </div>
        ) : null}
      </Link>

      <div className="mt-3 flex flex-col gap-1.5 md:flex-row md:items-start md:justify-between md:gap-3">
        <div className="min-w-0">
          <Link
            href={`/products/${product.slug}`}
            className="block text-[13px] font-medium leading-snug tracking-[-0.01em] md:text-sm"
          >
            {product.name}
          </Link>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-smoke">
            Made to order
          </p>
        </div>
        <p className="shrink-0 font-mono text-[11px] tabular-nums md:text-right">
          {isRange ? `From ${formatPrice(product.price)}` : formatPrice(product.price)}
        </p>
      </div>
    </article>
  );
}
