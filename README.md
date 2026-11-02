# Black Lab Spots — storefront

An original, custom storefront for **Black Lab Spots Shop LLC**. It keeps the
existing catalog and Printify fulfillment, adds a Stripe checkout, and replaces
the Printify-hosted pop-up shop with a fast Next.js site.

The design is intentionally spare: warm paper, black type, product-first
photography, mono labels, and one bright spot of teal. It is *inspired by* the
minimal direct-to-consumer language of sites like Yeezy.com; no proprietary
code, copy, or assets from that site are used.

<!-- live-links -->
**Project page:** [gitguy268.github.io/blacklabspots-storefront](https://gitguy268.github.io/blacklabspots-storefront/)
<!-- /live-links -->

<!-- run-steps:start -->
## Run it locally, step by step

1. **Install [Node.js](https://nodejs.org) 22** or newer and [pnpm](https://pnpm.io/installation).

2. **Get the code:**

   ```sh
   git clone https://github.com/Gitguy268/blacklabspots-storefront.git
   cd blacklabspots-storefront
   ```

3. **Install the dependencies and copy the example settings:**

   ```sh
   pnpm install
   cp .env.example .env.local
   ```

4. **Start it:**

   ```sh
   pnpm dev
   ```

5. **Open <http://localhost:3000/>.** Without Stripe keys the checkout runs in preview mode and charges nobody.
<!-- run-steps:end -->

## Stack

- Next.js 15.5 (App Router) + React 19 + TypeScript
- Tailwind CSS 3.4
- Stripe Checkout + webhook fulfillment
- Printify Orders API
- Vercel (recommended)

## Run it locally

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Open <http://localhost:3000>.

Without Stripe keys the checkout runs in **preview mode**: it validates the bag,
shows a confirmation, and does not charge anyone. Without Printify keys, paid
orders are logged but not forwarded.

## Environment

| Variable | Required | What it does |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production | Canonical URL used for metadata, sitemap, and Stripe redirects. |
| `STRIPE_SECRET_KEY` | Payments | Server-side Stripe key (`sk_live_…` or `sk_test_…`). |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Payments | Switches the checkout UI out of preview mode. |
| `STRIPE_WEBHOOK_SECRET` | Payments | Verifies webhook requests (`whsec_…`). |
| `PRINTIFY_API_TOKEN` | Fulfillment | Printify personal access token. |
| `PRINTIFY_SHOP_ID` | Fulfillment | Numeric Printify shop ID. |
| `PRINTIFY_SEND_TO_PRODUCTION` | Optional | `true` submits orders to production immediately. Default `false` creates drafts for review. |
| `RESEND_API_KEY` | Optional | Resend API key for the customer order confirmation. |
| `ORDER_FROM_EMAIL` | Optional | Verified Resend sender, e.g. `Black Lab Spots <orders@blacklabspotsshop.me>`. |

## Catalog

`data/catalog.json` is generated from the public Black Lab Spots storefront and
contains all 35 products, their options, prices, images, descriptions, Printify
product IDs, and Printify variant IDs.

```bash
pnpm catalog:scrape   # refresh from the public storefront
pnpm catalog:sync     # refresh prices/availability/variant IDs from Printify
```

`catalog:sync` requires `PRINTIFY_API_TOKEN` and `PRINTIFY_SHOP_ID` in the
environment (or `.env.local`). It merges live Printify data into the existing
catalog so display copy and images stay intact.

If the product count changes, run `catalog:scrape` first, then `catalog:sync`.

## Stripe

1. Create a Stripe account and complete the business/profile details.
2. Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to
   `.env.local`.
3. Forward webhooks locally:

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

   Put the printed `whsec_…` in `STRIPE_WEBHOOK_SECRET`.

4. In production, add a webhook endpoint at
   `https://blacklabspotsshop.me/api/stripe/webhook` for
   `checkout.session.completed` and
   `checkout.session.async_payment_succeeded`, then copy its signing secret
   into Vercel.

The checkout collects shipping addresses, charges a flat $6.95 (free over $75),
and lets Stripe handle cards, Apple Pay, and Google Pay. Tax is currently **not**
enabled in Stripe; turn on Stripe Tax and add `automatic_tax` in
`app/api/checkout/route.ts` before charging tax-sensitive jurisdictions.

The flat rate applies to every allowed country. Check Printify’s shipping cost by
destination before launch; if you only want to absorb US rates, trim
`ALLOWED_COUNTRIES` in `app/api/checkout/route.ts` to `["US"]` or add your own
country-specific logic.

### Order emails

The customer gets an order confirmation from Resend when `RESEND_API_KEY` and
`ORDER_FROM_EMAIL` are set. If you don’t use Resend, enable **successful payment
receipts** in the Stripe Dashboard so customers still get a receipt.

Printify is configured to send its own shipping notification (with tracking)
when an order ships. Keep `PRINTIFY_SEND_TO_PRODUCTION=false` while you review
personalized jobs; nothing ships until you send the order to production.

## Printify

1. In Printify: **My Profile → Connections → API**, create a personal access
   token.
2. Copy the shop ID from the shop URL or the Printify API
   (`GET /v1/shops.json`).
3. Add both to `.env.local`.

When a Stripe checkout completes, the webhook creates a Printify order with:

- the customer's shipping address and email;
- exact Printify product/variant IDs from the catalog;
- personalization text as a **manual personalization instruction** so the print
  provider sees it before production.

By default orders are created as **drafts**. Review personalized jobs in Printify,
then send them to production. Set `PRINTIFY_SEND_TO_PRODUCTION=true` only after
you trust the flow.

### Personalization notes

- Every current catalog item accepts a free-text personalization request. It is
  passed to Printify as a manual instruction and shown in the cart, order
  summary, and Stripe line item.
- Some requests are design notes rather than simple names (“adjust colors,
  change text…”), so review personalized drafts in Printify before sending them
  to production.
- If you add photo uploads later, use S3/UploadThing and attach the file to the
  Printify order; manual text instructions are the safe default for now.

## Deploy

1. Push the project to a Git repository.
2. Import it into Vercel; set every environment variable above.
3. Deploy, then test a real (or Stripe test-mode) order end to end.
4. Add `blacklabspotsshop.me` in Vercel → Domains and follow the DNS
   instructions.
5. Lower the existing DNS TTL a day before cutover. Keep the Printify shop live
   until the new site is confirmed.
6. Update `NEXT_PUBLIC_SITE_URL`, the Stripe webhook URL, and resubmit
   `https://blacklabspotsshop.me/sitemap.xml`.

The Printify pop-up store cannot serve custom code, so the domain must be moved
off it. Existing `/product/[id]` and `/category/[slug]` URLs redirect to the new
routes.

## Before calling it live

- [ ] Add Stripe keys and run one test-mode purchase.
- [ ] Confirm the Stripe webhook creates a Printify draft with the right variant.
- [ ] Review a personalized order in Printify and send it to production.
- [ ] Add `RESEND_API_KEY` and verify a real confirmation email, or enable Stripe
      receipts + confirm Printify’s shipping notification reaches the customer.
- [ ] Add a durable retry queue for Printify failures. Today a failed Printify
      call is logged and the Stripe event is acknowledged; the webhook also stores
      the Printify order id on the Stripe session to skip later duplicate events,
      but that is not a full queue. Add a queue or cron retry before high-volume
      launch.
- [ ] Confirm international shipping rates and the allowed-country list.
- [ ] Decide tax handling (Stripe Tax) before charging tax-sensitive
      jurisdictions.
- [ ] Have the Terms and Privacy pages reviewed by a lawyer.
- [ ] Replace the About copy and social links if needed.
- [ ] Run Lighthouse on mobile and check the real product mockups.

## Project map

```
app/
  page.tsx                    home
  shop/                       full catalog + search/sort
  collections/[slug]/         apparel, home, accessories, personalized
  products/[slug]/            product detail + JSON-LD
  cart/                       full cart
  checkout/                   checkout, success, cancel
  about/, terms/, privacy/    brand + legal
  api/checkout/               validates prices, creates Stripe session
  api/order/                  paid-order summary for the success page
  api/stripe/webhook/         paid order → Printify + confirmation email
components/                   header, footer, cart, product UI
data/catalog.json             generated catalog (35 products)
lib/                          catalog helpers, cart state, Stripe, Printify, email
public/og.png                 social share image
scripts/scrape-catalog.mjs    public catalog scraper
scripts/sync-printify.mjs     Printify price/variant sync
scripts/qa-*.mjs              Playwright visual + flow checks
```

## A note on the design

The layout, type system, color palette, copy, and components are original to
this project. Product photography and product names belong to Black Lab Spots.
