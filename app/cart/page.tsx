import { CartPageClient } from "@/components/CartPageClient";

export const metadata = {
  title: "Your bag",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-page px-4 py-9 md:px-6 md:py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
        Step 01 — Review
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.8rem,6vw,5rem)] font-extrabold uppercase leading-[0.88] tracking-tightest">
        Your bag
      </h1>
      <div className="mt-8">
        <CartPageClient />
      </div>
    </div>
  );
}
