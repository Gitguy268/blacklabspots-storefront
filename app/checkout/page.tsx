import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-page px-4 py-9 md:px-6 md:py-14">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
        Step 02 — Checkout
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.8rem,6vw,5rem)] font-extrabold uppercase leading-[0.88] tracking-tightest">
        Almost yours
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-relaxed text-smoke">
        Made to order, packed with care, and shipped from our production
        partners. Personalized pieces are final sale.
      </p>

      <div className="mt-9">
        <CheckoutForm
          stripeEnabled={Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)}
        />
      </div>
    </div>
  );
}
