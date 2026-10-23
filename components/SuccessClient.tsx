"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { PawIcon } from "./Icons";

type ConfirmationItem = {
  key: string;
  name: string;
  quantity: number;
  price: number;
  options?: Record<string, string>;
  personalization?: string;
};

type PreviewOrder = {
  orderNumber: string;
  email: string;
  items: ConfirmationItem[];
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
};

export function SuccessClient() {
  const params = useSearchParams();
  const { clear } = useCart();
  const [order, setOrder] = useState<PreviewOrder | null>(null);
  const [ready, setReady] = useState(false);

  const isDemo = params.get("demo") === "1";
  const sessionId = params.get("session_id");

  useEffect(() => {
    clear();
    let cancelled = false;

    async function load() {
      if (isDemo) {
        try {
          const raw = window.sessionStorage.getItem("bls-preview-order");
          if (raw && !cancelled) setOrder(JSON.parse(raw) as PreviewOrder);
          window.sessionStorage.removeItem("bls-preview-order");
        } catch {
          // The confirmation still renders without item details.
        }
      } else if (sessionId) {
        try {
          const response = await fetch(
            `/api/order?session_id=${encodeURIComponent(sessionId)}`
          );
          if (response.ok) {
            const data = (await response.json()) as PreviewOrder;
            if (!cancelled) setOrder(data);
          }
        } catch {
          // The order number still renders if the summary cannot load.
        }
      }

      if (!cancelled) setReady(true);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [clear, isDemo, sessionId]);

  if (!ready) return <div className="py-24" aria-hidden="true" />;

  if (!order && !isDemo) {
    return (
      <div className="mx-auto max-w-xl py-16 text-center md:py-24">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-ink text-paper">
          <PawIcon className="size-7" />
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
          Order lookup
        </p>
        <h1 className="mt-3 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-extrabold uppercase leading-[0.9] tracking-tightest">
          We couldn’t load
          <br />
          this order.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-smoke">
          If you just paid, check your email for the Stripe receipt. If you need
          a hand, send us a DM on Instagram and we’ll sort it out.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/shop"
            className="bg-ink px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-paper transition-colors hover:bg-spot-dark"
          >
            Keep shopping
          </Link>
          <a
            href="https://instagram.com/lucasvandeweerd"
            target="_blank"
            rel="noreferrer"
            className="border border-line px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors hover:border-ink"
          >
            Contact us
          </a>
        </div>
      </div>
    );
  }

  const orderNumber =
    order?.orderNumber ??
    (sessionId ? `STRIPE-${sessionId.slice(-8).toUpperCase()}` : "BLS-PENDING");

  return (
    <div className="mx-auto max-w-2xl py-6 text-center md:py-10">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-ink text-paper">
        <PawIcon className="size-7" />
      </div>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
        {isDemo ? "Preview order confirmed" : "Order confirmed"}
      </p>
      <h1 className="mt-3 font-display text-[clamp(2.6rem,7vw,5rem)] font-extrabold uppercase leading-[0.88] tracking-tightest">
        Good dog.
        <br />
        Good order.
      </h1>
      <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-smoke">
        {isDemo
          ? "This was a preview checkout — no payment was taken and no order was sent to production. Add your Stripe and Printify keys to go live."
          : "Your payment went through and your order is in the queue. Save your order number below — we’ll follow up with tracking as soon as it ships."}
      </p>

      <div className="mx-auto mt-8 max-w-md border border-line bg-white/40 p-5 text-left">
        <div className="flex justify-between border-b border-line pb-3 font-mono text-[10px] uppercase tracking-[0.1em]">
          <span className="text-smoke">Order</span>
          <span>{orderNumber}</span>
        </div>
        {order ? (
          <>
            <ul className="divide-y divide-line py-2">
              {order.items.map((item) => (
                <li key={item.key} className="flex justify-between gap-3 py-2">
                  <div className="min-w-0">
                    <span className="text-xs">
                      {item.name} <span className="text-smoke">× {item.quantity}</span>
                    </span>
                    {Object.keys(item.options ?? {}).length ? (
                      <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.08em] text-smoke">
                        {Object.values(item.options ?? {}).join(" · ")}
                      </span>
                    ) : null}
                    {item.personalization ? (
                      <span className="mt-1 block text-[11px] italic text-smoke">
                        “{item.personalization}”
                      </span>
                    ) : null}
                  </div>
                  <span className="shrink-0 font-mono text-[10px]">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="space-y-1 border-t border-line pt-3 font-mono text-[10px] uppercase tracking-[0.08em]">
              <div className="flex justify-between text-smoke">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-smoke">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? "Free" : formatPrice(order.shipping)}</span>
              </div>
              {order.discount ? (
                <div className="flex justify-between text-smoke">
                  <span>Discount</span>
                  <span>−{formatPrice(order.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between pt-2 text-[11px] text-ink">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
            <div className="mt-3 flex justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.1em] text-smoke">
              <span>Customer email</span>
              <span className="normal-case tracking-normal">{order.email}</span>
            </div>
          </>
        ) : (
          <p className="py-4 text-sm text-smoke">
            Your order number is above. Keep it handy if you need to get in
            touch.
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="bg-ink px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-paper transition-colors hover:bg-spot-dark"
        >
          Keep shopping
        </Link>
        <Link
          href="/about"
          className="border border-line px-6 py-3.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors hover:border-ink"
        >
          Our story
        </Link>
      </div>
    </div>
  );
}
