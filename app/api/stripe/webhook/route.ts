import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { sendOrderConfirmation } from "@/lib/email";
import { createPrintifyOrder } from "@/lib/printify";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type ShippingDetails = {
  name?: string | null;
  address?: {
    line1?: string | null;
    line2?: string | null;
    city?: string | null;
    state?: string | null;
    postal_code?: string | null;
    country?: string | null;
  } | null;
};

type SessionWithShipping = Stripe.Checkout.Session & {
  collected_information?: { shipping_details?: ShippingDetails | null } | null;
  shipping_details?: ShippingDetails | null;
};

function splitName(name: string | null | undefined) {
  const parts = (name ?? "").trim().split(/\s+/);
  if (!parts.length) return { firstName: "Customer", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 503 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("[stripe] signature verification failed", error);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (
    event.type !== "checkout.session.completed" &&
    event.type !== "checkout.session.async_payment_succeeded"
  ) {
    return NextResponse.json({ received: true });
  }

  const baseSession = event.data.object as Stripe.Checkout.Session;

  try {
    const session = (await stripe.checkout.sessions.retrieve(baseSession.id, {
      expand: ["line_items.data.price.product"],
    })) as SessionWithShipping;

    if (
      session.payment_status !== "paid" &&
      session.payment_status !== "no_payment_required"
    ) {
      console.info(
        `[stripe] ${session.id}: payment is ${session.payment_status}; waiting for settlement`
      );
      return NextResponse.json({ received: true, pending: true });
    }

    const priorOrderId = session.metadata?.printify_order_id;
    if (priorOrderId) {
      console.info(
        `[stripe] ${session.id}: already fulfilled by Printify order ${priorOrderId}`
      );
      return NextResponse.json({
        received: true,
        printify: "already_fulfilled",
        orderId: priorOrderId,
      });
    }

    const lineItems = session.line_items?.data ?? [];
    const lines = lineItems
      .map((item) => {
        const product = item.price?.product;
        if (!product || typeof product === "string" || product.deleted) return null;
        const metadata = product.metadata ?? {};
        const printifyProductId = metadata.product_id;
        const printifyVariantId = Number(metadata.variant_id);
        if (!printifyProductId || !Number.isFinite(printifyVariantId)) return null;

        let options: Record<string, string> = {};
        try {
          options = JSON.parse(metadata.options ?? "{}") as Record<string, string>;
        } catch {
          // Keep the order moving even if metadata is malformed.
        }

        let personalization = metadata.personalization || undefined;
        if (!personalization) {
          const description = item.description ?? "";
          const match = description.match(/Personalization: (.+)$/);
          if (match) personalization = match[1];
        }

        return {
          productId: printifyProductId,
          variantId: printifyVariantId,
          name: product.name,
          options,
          unitAmount: item.price?.unit_amount ?? 0,
          quantity: item.quantity ?? 1,
          personalization,
        };
      })
      .filter((line): line is NonNullable<typeof line> => Boolean(line));

    const shipping =
      session.collected_information?.shipping_details ??
      session.shipping_details ??
      null;

    if (!lines.length) {
      console.error(`[stripe] ${session.id}: no line items could be mapped`);
      return NextResponse.json({ received: true });
    }

    if (!shipping?.address) {
      console.error(`[stripe] ${session.id}: missing shipping address`);
      return NextResponse.json({ received: true });
    }

    const { firstName, lastName } = splitName(shipping.name ?? session.customer_details?.name);
    const address = shipping.address;

    const result = await createPrintifyOrder({
      externalId: session.id,
      lines,
      address: {
        firstName,
        lastName,
        email: session.customer_details?.email ?? "",
        phone: session.customer_details?.phone ?? undefined,
        country: address.country ?? "US",
        region: address.state ?? "",
        address1: address.line1 ?? "",
        address2: address.line2 ?? "",
        city: address.city ?? "",
        postalCode: address.postal_code ?? "",
      },
    });

    if (!result.ok) {
      console.error(
        `[printify] ${session.id}: ${result.skipped ? "skipped" : "failed"} — ${result.reason}`
      );
      // A 200 acknowledges the Stripe event; the log is the retry queue for now.
      // See README for wiring a durable queue before high-volume launch.
    } else {
      console.info(
        `[printify] ${session.id}: created order ${result.orderId}${
          result.sentToProduction ? " and sent to production" : " (draft)"
        }`
      );
      try {
        await stripe.checkout.sessions.update(session.id, {
          metadata: {
            ...(session.metadata ?? {}),
            printify_order_id: result.orderId,
          },
        });
      } catch (error) {
        console.error(
          `[stripe] ${session.id}: could not store Printify order id`,
          error
        );
      }
    }

    const emailResult = await sendOrderConfirmation({
      orderNumber: `STRIPE-${session.id.slice(-8).toUpperCase()}`,
      email: session.customer_details?.email ?? "",
      items: lines.map((line) => ({
        name: line.name,
        quantity: line.quantity,
        price: line.unitAmount,
        options: line.options,
        personalization: line.personalization,
      })),
      subtotal: session.amount_subtotal ?? 0,
      shipping: session.total_details?.amount_shipping ?? 0,
      discount: session.total_details?.amount_discount ?? 0,
      total: session.amount_total ?? 0,
      shippingAddress: [
        shipping.name,
        address.line1,
        address.line2,
        [address.city, address.state, address.postal_code].filter(Boolean).join(", "),
        address.country,
      ]
        .filter(Boolean)
        .join("\n"),
    });

    if (emailResult.ok) {
      console.info(`[email] ${session.id}: order confirmation sent`);
    } else {
      console.warn(
        `[email] ${session.id}: ${emailResult.skipped ? "skipped" : "failed"} — ${emailResult.reason}`
      );
    }

    return NextResponse.json({
      received: true,
      printify: result.ok ? "ok" : result.skipped ? "skipped" : "failed",
    });
  } catch (error) {
    console.error(`[stripe] ${baseSession.id}: fulfillment failed`, error);
    // Return a non-2xx so Stripe retries transient lookup or processing errors.
    return NextResponse.json(
      { error: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
