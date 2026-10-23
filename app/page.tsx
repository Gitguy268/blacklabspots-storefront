import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PawIcon } from "@/components/Icons";
import { ProductGrid } from "@/components/ProductGrid";
import { SectionHeading } from "@/components/SectionHeading";
import {
  getCollectionProducts,
  getFeaturedProducts,
  getProductById,
} from "@/lib/catalog";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

function preferredImage(product?: Product) {
  if (!product) return "";
  const dark = product.variants.find(
    (variant) =>
      variant.available &&
      /black|graphite|charcoal/i.test(variant.options.Color ?? "") &&
      variant.image
  );
  return dark?.image ?? product.images[0]?.src ?? "";
}

export default function HomePage() {
  const heroProducts = ["25456436", "25392440", "29988529", "25391915"]
    .map((id) => getProductById(id))
    .filter((product): product is Product => Boolean(product));

  const featured = getFeaturedProducts(6);
  const personalized = getCollectionProducts("personalized").slice(0, 3);

  const categories = [
    {
      slug: "apparel",
      title: "Apparel",
      note: "Tees, hoodies, caps",
      image: preferredImage(getCollectionProducts("apparel")[0]),
    },
    {
      slug: "home",
      title: "Home & Living",
      note: "Blankets, glass, desk",
      image: getCollectionProducts("home")[0]?.images[0]?.src ?? "",
    },
    {
      slug: "accessories",
      title: "Accessories",
      note: "Straps, stickers, jewelry",
      image: getCollectionProducts("accessories")[0]?.images[0]?.src ?? "",
    },
    {
      slug: "personalized",
      title: "Personalized",
      note: "Your dog, your name",
      image:
        getProductById("26577022")?.images[0]?.src ??
        getCollectionProducts("personalized")[0]?.images[0]?.src ??
        "",
    },
  ];

  return (
    <>
      <section className="mx-auto max-w-page px-4 md:px-6">
        <div className="grid gap-8 pb-10 pt-9 md:pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pb-14">
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
                <span className="inline-block size-1.5 rounded-full bg-spot" />
                Independent shop · Made to order
              </div>

              <h1 className="mt-6 font-display text-[clamp(3.5rem,7.5vw,8.5rem)] font-extrabold uppercase leading-[0.83] tracking-tightest">
                For the dog
                <br />
                who runs
                <br />
                the house<span className="text-spot">.</span>
              </h1>
            </div>

            <div className="mt-9 max-w-xl">
              <p className="text-[15px] leading-relaxed text-smoke md:text-base">
                Black lab energy, printed on the good stuff. Tees, hoodies, home
                goods and one-of-one personalized pieces — made when you order,
                not before.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="group flex h-12 items-center gap-6 bg-ink px-6 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-spot-dark"
                >
                  Shop the pack
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/collections/personalized"
                  className="link-underline py-3 font-mono text-[11px] uppercase tracking-[0.14em]"
                >
                  Personalize it
                </Link>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-1.5">
              {heroProducts.map((product, index) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group relative aspect-[4/5] overflow-hidden bg-white"
                >
                  <Image
                    src={preferredImage(product)}
                    alt={product.name}
                    fill
                    priority={index < 2}
                    sizes="(min-width: 1024px) 22vw, 50vw"
                    className="object-contain p-2 transition-transform duration-700 ease-swift group-hover:scale-[1.04] md:p-3"
                  />
                  <span className="absolute bottom-2 left-2 bg-paper/80 px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] text-smoke backdrop-blur">
                    0{index + 1}
                  </span>
                </Link>
              ))}
            </div>

            <div className="absolute -bottom-8 -left-4 hidden size-24 items-center justify-center rounded-full border border-line bg-paper p-2 shadow-[0_10px_30px_rgba(10,10,10,0.08)] md:flex lg:size-28">
              <Image
                src="/brand/logo.png"
                alt="Black Lab Spots"
                width={112}
                height={112}
                className="size-full object-contain"
              />
            </div>

            <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-[0.14em] text-smoke">
              Spot’s picks / 01—04
            </p>
          </div>
        </div>

        <div className="grid border-y border-line md:grid-cols-3">
          {[
            ["Made to order", "Printed when you click. No deadstock, no guesswork."],
            ["Free shipping $75+", "US orders over $75 ship on the house."],
            ["Personalize almost anything", "Names, dates, custom requests. Make it one of one."],
          ].map(([title, copy], index) => (
            <div
              key={title}
              className={`flex gap-4 py-5 md:px-6 ${
                index > 0 ? "border-t border-line md:border-l md:border-t-0" : ""
              }`}
            >
              <PawIcon className="mt-0.5 size-4 shrink-0 text-spot" />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em]">
                  {title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-smoke">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-page px-4 pt-16 md:px-6 md:pt-24">
        <SectionHeading
          kicker="Spot’s picks"
          title="The good stuff"
          href="/shop"
        />
        <ProductGrid products={featured} priorityCount={3} />
      </section>

      <section className="mx-auto max-w-page px-4 pt-16 md:px-6 md:pt-24">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={category.slug}
              href={`/collections/${category.slug}`}
              className="group relative overflow-hidden"
            >
              <div className="relative aspect-[3/4] bg-white">
                <Image
                  src={category.image}
                  alt={category.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-contain p-4 transition-transform duration-700 ease-swift group-hover:scale-[1.04]"
                />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-paper/95 via-paper/60 to-transparent p-4 pt-16">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-smoke">
                    0{index + 1} — {category.note}
                  </p>
                  <p className="mt-1 font-display text-2xl font-bold uppercase tracking-tight">
                    {category.title}
                  </p>
                </div>
                <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-page px-4 md:mt-24 md:px-6">
        <div className="grid bg-ink text-paper lg:grid-cols-2">
          <div className="flex flex-col justify-between p-7 md:p-12 lg:p-16">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50">
                04 — One of one
              </p>
              <h2 className="mt-5 max-w-[12ch] font-display text-[clamp(2.4rem,5vw,5rem)] font-extrabold uppercase leading-[0.86] tracking-tightest">
                Your dog. Your name. Your stuff.
              </h2>
            </div>
            <div className="mt-12">
              <p className="max-w-md text-sm leading-relaxed text-paper/60">
                Add a name to the collar, a date to the glass, or a custom detail to the
                blanket. Personalization is included on almost everything — and
                it’s what makes the good stuff yours.
              </p>
              <Link
                href="/collections/personalized"
                className="mt-7 inline-flex h-12 items-center gap-6 bg-paper px-6 font-mono text-[11px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-spot hover:text-ink"
              >
                Make it personal
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="relative min-h-[320px] bg-white lg:min-h-[560px]">
            <Image
              src={personalized[1]?.images[0]?.src ?? personalized[0]?.images[0]?.src ?? ""}
              alt={personalized[1]?.name ?? "Personalized Black Lab Spots piece"}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain p-6 md:p-12"
            />
            <span className="absolute right-4 top-4 bg-ink px-2 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-paper">
              Personalized
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-page px-4 pt-16 md:px-6 md:pt-24">
        <SectionHeading
          kicker="New & personal"
          title="Latest drop"
          href="/collections/personalized"
          linkLabel="Shop personalized"
        />
        <ProductGrid products={personalized} />
      </section>

      <section className="mx-auto mt-16 max-w-page px-4 md:mt-24 md:px-6">
        <div className="flex flex-col items-center border-y border-line py-14 text-center md:py-20">
          <PawIcon className="size-6 text-spot" />
          <p className="mt-5 max-w-[18ch] font-display text-[clamp(2rem,5vw,4.5rem)] font-extrabold uppercase leading-[0.9] tracking-tightest">
            Good dog. Good stuff. No notes.
          </p>
          <Link
            href="/shop"
            className="mt-7 font-mono text-[11px] uppercase tracking-[0.16em] underline decoration-line underline-offset-8 transition-colors hover:decoration-ink"
          >
            Shop everything
          </Link>
        </div>
      </section>
    </>
  );
}
