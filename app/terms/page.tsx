export const metadata = {
  title: "Terms & conditions",
  description: "Terms and conditions for Black Lab Spots Shop LLC.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
        Legal
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.88] tracking-tightest">
        Terms & conditions
      </h1>
      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
        Last updated October 2026
      </p>

      <div className="prose-sm mt-10 space-y-7 text-sm leading-relaxed text-smoke">
        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            1. Overview
          </h2>
          <p className="mt-2">
            This store is operated by Black Lab Spots Shop LLC (“we”, “us”,
            “our”). By placing an order you agree to these terms. If you don’t
            agree, please don’t order — no hard feelings.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            2. Products and pricing
          </h2>
          <p className="mt-2">
            Everything is made to order through third-party production partners.
            Mockups are representative; slight differences in color, placement,
            and print texture are normal and not defects. Prices are in USD and
            may change without notice. We reserve the right to refuse or cancel
            an order if a price or product listing was clearly incorrect.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            3. Personalization
          </h2>
          <p className="mt-2">
            You are responsible for the text, images, and other content you ask us
            to print. Don’t upload anything you don’t have the right to use, and
            don’t ask us to print hateful, illegal, or infringing material. We may
            decline an order that crosses that line. Personalized items are final
            sale once production begins.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            4. Orders and payment
          </h2>
          <p className="mt-2">
            Payment is processed by Stripe. Your order is confirmed when payment
            clears. We’ll send a confirmation email and a tracking link when the
            order ships. Production and delivery estimates are estimates, not
            guarantees.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            5. Shipping, returns, and damaged items
          </h2>
          <p className="mt-2">
            Shipping costs and delivery estimates are shown at checkout. Unworn,
            unpersonalized items can be returned within 30 days of delivery.
            Personalized items are final sale. If an item arrives damaged or
            incorrect, contact us with photos and we’ll replace or refund it.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            6. Intellectual property
          </h2>
          <p className="mt-2">
            Our designs, photography, copy, and branding belong to Black Lab Spots
            Shop LLC. You may not copy or resell them without permission. By
            submitting personalization content, you give us permission to use it
            solely to produce your order.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            7. Limits
          </h2>
          <p className="mt-2">
            To the fullest extent allowed by law, our liability for any order is
            limited to the amount you paid for that order. We’re not responsible
            for indirect or consequential damages. Nothing here limits rights you
            have under applicable consumer law.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            8. Contact
          </h2>
          <p className="mt-2">
            Questions? Reach us on Instagram at{" "}
            <a
              href="https://instagram.com/lucasvandeweerd"
              target="_blank"
              rel="noreferrer"
              className="text-ink underline underline-offset-4"
            >
              @lucasvandeweerd
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
