import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, PawIcon } from "@/components/Icons";

export const metadata = {
  title: "Our story",
  description:
    "Black Lab Spots is a small, independent shop making good things for people obsessed with their black lab. Made to order, personalized with care.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-page px-4 py-9 md:px-6 md:py-14">
      <div className="grid gap-10 border-b border-line pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end lg:gap-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
            Our story · Spot’s shop
          </p>
          <h1 className="mt-4 font-display text-[clamp(3rem,8vw,7.5rem)] font-extrabold uppercase leading-[0.84] tracking-tightest">
            Made for the
            <br />
            dog hair on
            <br />
            your black pants<span className="text-spot">.</span>
          </h1>
        </div>
        <div className="flex flex-col items-start gap-5 lg:items-end">
          <div className="relative size-32 overflow-hidden rounded-full border border-line bg-paper p-2 md:size-40">
            <Image
              src="/brand/logo.png"
              alt="Black Lab Spots logo"
              fill
              sizes="160px"
              className="object-contain p-1"
            />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-smoke lg:text-right">
            Black Lab Spots is a small independent shop for people who love a
            black lab enough to put him on everything. We make the good stuff,
            one order at a time.
          </p>
        </div>
      </div>

      <div className="grid gap-12 py-12 md:grid-cols-2 md:py-16">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
            01 — The short version
          </p>
          <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink/80">
            <p>
              It started with Spot: a black lab with a big head, a bigger heart,
              and a talent for finding the one muddy puddle in a five-mile
              radius. Everything here is a small tribute to that energy.
            </p>
            <p>
              We don’t hold inventory and we don’t pretend to. Each piece is
              printed when you order it by production partners who know what
              they’re doing. That means less waste, no deadstock, and a shop
              that can keep making one-of-one things without a warehouse full of
              guesses.
            </p>
            <p>
              Most pieces can be personalized — a name, a date, a custom request,
              a slightly unhinged inside joke. We’re here for all of it.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "Made to order",
              copy: "Printed after you click, not months before. Less waste, better stuff.",
            },
            {
              title: "One of one",
              copy: "Names, dates, custom notes and a little imagination. If it’s yours, it should look like it.",
            },
            {
              title: "Small shop energy",
              copy: "No corporate committee. Just a person, a dog, and a good printer.",
            },
            {
              title: "Spot approved",
              copy: "Every design gets a sniff test. Literally. He’s very thorough.",
            },
          ].map((item) => (
            <div key={item.title} className="border border-line bg-white/40 p-5">
              <PawIcon className="size-4 text-spot" />
              <p className="mt-4 font-display text-lg font-bold uppercase tracking-tight">
                {item.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-smoke">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-line">
        <section id="shipping" className="scroll-mt-28 border-b border-line py-10 md:py-12">
          <div className="grid gap-5 md:grid-cols-[0.5fr_1fr]">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
              Shipping
            </h2>
            <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-smoke">
              <p>
                Production usually takes 2–5 business days, then shipping takes
                another 2–5 depending on where you are. You’ll get a tracking
                link as soon as your order leaves the press.
              </p>
              <p>
                Shipping is a flat $6.95, free over $75. International duties and
                taxes are the buyer’s responsibility.
              </p>
            </div>
          </div>
        </section>

        <section id="sizing" className="scroll-mt-28 border-b border-line py-10 md:py-12">
          <div className="grid gap-5 md:grid-cols-[0.5fr_1fr]">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
              Sizing
            </h2>
            <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-smoke">
              <p>
                Most apparel is unisex and runs true to size with a relaxed fit.
                If you’re between sizes and want a closer fit, size down. For a
                properly oversized look, size up.
              </p>
              <p>
                Every apparel product page has a size guide with real garment
                measurements. When in doubt, measure a shirt you already like and
                compare.
              </p>
            </div>
          </div>
        </section>

        <section id="returns" className="scroll-mt-28 border-b border-line py-10 md:py-12">
          <div className="grid gap-5 md:grid-cols-[0.5fr_1fr]">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
              Returns
            </h2>
            <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-smoke">
              <p>
                Unworn, unpersonalized items can be returned within 30 days of
                delivery. Personalized pieces are final sale — they were made for
                you and only you.
              </p>
              <p>
                If something arrives damaged, misprinted, or just plain wrong,
                send us a photo and we’ll make it right. That one’s on us.
              </p>
            </div>
          </div>
        </section>

        <section id="contact" className="scroll-mt-28 py-10 md:py-12">
          <div className="grid gap-5 md:grid-cols-[0.5fr_1fr]">
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight md:text-3xl">
              Contact
            </h2>
            <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-smoke">
              <p>
                The fastest way to reach a human is a DM on Instagram. We’re a
                small shop, so give us a day or two — Spot is typing with his
                paws.
              </p>
              <a
                href="https://instagram.com/lucasvandeweerd"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink underline underline-offset-4"
              >
                @lucasvandeweerd
                <ArrowUpRight className="size-3.5" />
              </a>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-12 flex flex-col items-center border-y border-line py-14 text-center">
        <p className="max-w-[20ch] font-display text-[clamp(2rem,5vw,4rem)] font-extrabold uppercase leading-[0.9] tracking-tightest">
          Thanks for being here. Spot says hi.
        </p>
        <Link
          href="/shop"
          className="mt-6 bg-ink px-7 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-paper transition-colors hover:bg-spot-dark"
        >
          Shop the good stuff
        </Link>
      </div>
    </div>
  );
}
