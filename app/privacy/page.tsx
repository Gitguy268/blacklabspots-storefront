export const metadata = {
  title: "Privacy policy",
  description: "How Black Lab Spots handles your information.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-16">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
        Legal
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,6vw,4.5rem)] font-extrabold uppercase leading-[0.88] tracking-tightest">
        Privacy policy
      </h1>
      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
        Last updated October 2026
      </p>

      <div className="mt-10 space-y-7 text-sm leading-relaxed text-smoke">
        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            What we collect
          </h2>
          <p className="mt-2">
            When you order, we collect your name, email, shipping address, and
            order details. Payment card information is collected and processed by
            Stripe; we never see or store your full card number.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            How we use it
          </h2>
          <p className="mt-2">
            We use your information to take payment, produce and ship your order,
            send order updates, respond to support requests, and keep basic
            records required by law. We don’t sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            Who we share it with
          </h2>
          <p className="mt-2">
            We share the minimum necessary information with Stripe (payments),
            our print and fulfillment partners such as Printify (production and
            shipping), and email or hosting providers that help us run the shop.
            They’re only allowed to use it to provide those services.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            Cookies and local storage
          </h2>
          <p className="mt-2">
            We use your browser’s local storage to remember your cart. Stripe may
            set cookies during checkout for fraud prevention and payment
            processing. We don’t run third-party advertising trackers on this
            site.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            Your choices
          </h2>
          <p className="mt-2">
            You can ask us to access, correct, or delete your personal
            information, subject to legal recordkeeping requirements. You can also
            unsubscribe from marketing emails at any time. To make a request,
            message us on Instagram.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            Retention and security
          </h2>
          <p className="mt-2">
            We keep order records for as long as needed to fulfill orders and meet
            legal obligations. We use reputable service providers and reasonable
            safeguards, but no online system is perfectly secure.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-ink">
            Contact
          </h2>
          <p className="mt-2">
            Privacy questions? Reach us on Instagram at{" "}
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
