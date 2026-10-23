import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured." },
      { status: 503 }
    );
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json({ error: "Invalid session." }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    if (
      session.payment_status !== "paid" &&
      session.payment_status !== "no_payment_required"
    ) {
      return NextResponse.json(
        { error: "This order is not complete yet." },
        { status: 409 }
      );
    }

    const items = (session.line_items?.data ?? []).map((item, index) => {
      const product = item.price?.product;
      const productObject =
        product && typeof product !== "string" && !product.deleted
          ? product
          : null;
      const metadata = productObject?.metadata ?? {};
      const name = productObject?.name ?? item.description ?? "Item";
      const quantity = item.quantity ?? 1;
      const total = item.amount_total ?? 0;

      let options: Record<string, string> = {};
      try {
        options = JSON.parse(metadata.options ?? "{}") as Record<string, string>;
      } catch {
        // Keep the confirmation readable if metadata is malformed.
      }

      return {
        key: item.id ?? `${sessionId}-${index}`,
        name,
        quantity,
        price: quantity ? Math.round(total / quantity) : total,
        options,
        personalization: metadata.personalization || undefined,
      };
    });

    return NextResponse.json(
      {
        orderNumber: `STRIPE-${sessionId.slice(-8).toUpperCase()}`,
        email: session.customer_details?.email ?? "",
        items,
        subtotal: session.amount_subtotal ?? 0,
        shipping: session.total_details?.amount_shipping ?? 0,
        discount: session.total_details?.amount_discount ?? 0,
        total: session.amount_total ?? 0,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    console.error("[stripe] could not load order summary", error);
    return NextResponse.json(
      { error: "Could not load this order." },
      { status: 404 }
    );
  }
}
