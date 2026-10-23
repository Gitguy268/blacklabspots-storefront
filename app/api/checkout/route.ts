import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getProductById } from "@/lib/catalog";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type IncomingItem = {
  productId: string;
  options: Record<string, string>;
  quantity: number;
  personalization?: string;
};

type Customer = {
  email?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
};

const FREE_SHIPPING_THRESHOLD = 7500;
const SHIPPING_FLAT = 695;

const ALLOWED_COUNTRIES: Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[] =
  [
    "US",
    "CA",
    "GB",
    "AU",
    "NZ",
    "DE",
    "FR",
    "NL",
    "BE",
    "ES",
    "IT",
    "IE",
    "SE",
    "DK",
    "NO",
    "FI",
    "AT",
    "CH",
    "PT",
    "PL",
    "CZ",
  ];

export async function POST(request: Request) {
  let payload: { items?: IncomingItem[]; customer?: Customer };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const incoming = Array.isArray(payload.items) ? payload.items : [];
  if (!incoming.length) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }
  if (incoming.length > 50) {
    return NextResponse.json({ error: "Too many line items." }, { status: 400 });
  }

  const lines: {
    productId: string;
    printifyProductId: string;
    variantId: string;
    printifyVariantId: number;
    name: string;
    image?: string;
    options: Record<string, string>;
    quantity: number;
    price: number;
    personalization?: string;
  }[] = [];

  for (const item of incoming) {
    const product = getProductById(String(item.productId ?? ""));
    if (!product) {
      return NextResponse.json(
        { error: "One of the products in your bag is no longer available." },
        { status: 400 }
      );
    }

    const selected = item.options ?? {};
    const variant = product.variants.find(
      (candidate) =>
        candidate.available &&
        Object.entries(selected).every(
          ([key, value]) => candidate.options[key] === value
        )
    );

    if (!variant) {
      return NextResponse.json(
        { error: `That option combination for ${product.name} is unavailable.` },
        { status: 400 }
      );
    }

    const quantity = Math.max(1, Math.min(20, Math.floor(Number(item.quantity) || 1)));
    const personalization =
      typeof item.personalization === "string"
        ? item.personalization.trim().slice(0, 120)
        : undefined;

    lines.push({
      productId: product.id,
      printifyProductId: product.printifyProductId,
      variantId: variant.id,
      printifyVariantId: variant.printifyVariantId,
      name: product.name,
      image: product.images[0]?.src,
      options: variant.options,
      quantity,
      price: variant.price,
      personalization,
    });
  }

  const subtotal = lines.reduce((total, line) => total + line.price * line.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;

  const stripe = getStripe();
  if (!stripe) {
    const orderNumber = `BLS-${Date.now().toString(36).toUpperCase().slice(-7)}`;
    console.info(
      `[checkout:preview] ${orderNumber} · ${lines
        .map((line) => `${line.quantity}× ${line.name} (${Object.values(line.options).join("/")})`)
        .join(", ")} · $${((subtotal + shipping) / 100).toFixed(2)}`
    );
    return NextResponse.json({
      demo: true,
      orderNumber,
      url: "/checkout/success?demo=1",
    });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://blacklabspotsshop.me";

  const session = await stripe.checkout.sessions
    .create({
      mode: "payment",
      customer_email: payload.customer?.email || undefined,
      line_items: lines.map((line) => ({
        quantity: line.quantity,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(line.price),
          product_data: {
            name: line.name,
            description: [
              Object.entries(line.options)
                .map(([key, value]) => `${key}: ${value}`)
                .join(" · "),
              line.personalization ? `Personalization: ${line.personalization}` : "",
            ]
              .filter(Boolean)
              .join(" — ")
              .slice(0, 300),
            images: line.image ? [line.image] : undefined,
            metadata: {
              product_id: line.printifyProductId,
              variant_id: String(line.printifyVariantId),
              options: JSON.stringify(line.options).slice(0, 450),
              personalization: (line.personalization ?? "").slice(0, 450),
            },
          },
        },
      })),
      shipping_address_collection: {
        allowed_countries: ALLOWED_COUNTRIES,
      },
      phone_number_collection: { enabled: true },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: shipping, currency: "usd" },
            display_name: shipping === 0 ? "Free shipping" : "Standard shipping",
            delivery_estimate: {
              minimum: { unit: "business_day", value: 4 },
              maximum: { unit: "business_day", value: 10 },
            },
          },
        },
      ],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/checkout/cancel`,
      metadata: {
        source: "blacklabspotsshop",
        subtotal: String(subtotal),
        shipping: String(shipping),
      },
    })
    .catch((error) => {
      console.error("[stripe] checkout session creation failed", error);
      return null;
    });

  if (!session) {
    return NextResponse.json(
      { error: "Checkout is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }

  if (!session.url) {
    return NextResponse.json(
      { error: "Stripe did not return a checkout URL." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: session.url });
}
