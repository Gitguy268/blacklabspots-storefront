import Link from "next/link";

export const metadata = {
  title: "Checkout cancelled",
  robots: { index: false, follow: false },
};

export default function CancelPage() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center md:py-32">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
        Checkout paused
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,7vw,4.5rem)] font-extrabold uppercase leading-[0.88] tracking-tightest">
        No charge.
        <br />
        No problem.
      </h1>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-smoke">
        Your bag is still where you left it. Spot is guarding it.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/cart"
          className="bg-ink px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-paper"
        >
          Back to bag
        </Link>
        <Link
          href="/shop"
          className="border border-line px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em]"
        >
          Shop all
        </Link>
      </div>
    </div>
  );
}
