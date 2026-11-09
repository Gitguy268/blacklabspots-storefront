"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { useCart } from "@/lib/cart";

const COUNTRIES = [
  ["US", "United States"],
  ["CA", "Canada"],
  ["GB", "United Kingdom"],
  ["AU", "Australia"],
  ["NZ", "New Zealand"],
  ["DE", "Germany"],
  ["FR", "France"],
  ["NL", "Netherlands"],
  ["BE", "Belgium"],
  ["ES", "Spain"],
  ["IT", "Italy"],
  ["IE", "Ireland"],
  ["SE", "Sweden"],
  ["DK", "Denmark"],
  ["NO", "Norway"],
  ["FI", "Finland"],
  ["AT", "Austria"],
  ["CH", "Switzerland"],
  ["PT", "Portugal"],
  ["PL", "Poland"],
  ["CZ", "Czechia"],
];

type Customer = {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;
};

const EMPTY_CUSTOMER: Customer = {
  email: "",
  firstName: "",
  lastName: "",
  address1: "",
  city: "",
  region: "",
  postalCode: "",
  country: "US",
};

export function CheckoutForm({ stripeEnabled }: { stripeEnabled: boolean }) {
  const { items, subtotal, isReady, clear } = useCart();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isReady) return <div className="py-24" aria-hidden="true" />;

  if (!items.length) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold uppercase leading-[0.9] tracking-tightest">
          Nothing to check out.
        </p>
        <p className="mt-3 text-sm text-smoke">
          Add something good to the bag first.
        </p>
        <Link
          href="/shop"
          className="mt-8 bg-ink px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper"
        >
          Shop all
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 695;
  const total = subtotal + shipping;

  function update(key: keyof Customer, value: string) {
    setCustomer((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            options: item.options,
            quantity: item.quantity,
            personalization: item.personalization,
          })),
          customer,
        }),
      });

      const data = (await response.json()) as {
        url?: string;
        demo?: boolean;
        orderNumber?: string;
        error?: string;
      };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout could not be started.");
      }

      if (data.demo) {
        window.sessionStorage.setItem(
          "bls-preview-order",
          JSON.stringify({
            orderNumber: data.orderNumber,
            email: customer.email,
            items,
            subtotal,
            shipping,
            total,
          })
        );
        clear();
        router.push(data.url);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
      <div>
        <div className="border-b border-line pb-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
            01 — Contact
          </p>
        </div>
        <label className="mt-5 block">
          <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
            Email
          </span>
          <input
            required
            type="email"
            autoComplete="email"
            value={customer.email}
            onChange={(event) => update("email", event.target.value)}
            className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-hidden transition-colors focus:border-ink"
            placeholder="you@gooddog.com"
          />
        </label>

        {!stripeEnabled ? (
          <>
            <div className="mt-9 border-b border-line pb-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
                02 — Shipping
              </p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-smoke">
                Preview mode — no payment is taken
              </p>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
                  First name
                </span>
                <input
                  required
                  autoComplete="given-name"
                  value={customer.firstName}
                  onChange={(event) => update("firstName", event.target.value)}
                  className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-hidden focus:border-ink"
                />
              </label>
              <label>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
                  Last name
                </span>
                <input
                  required
                  autoComplete="family-name"
                  value={customer.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                  className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-hidden focus:border-ink"
                />
              </label>
              <label className="sm:col-span-2">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
                  Address
                </span>
                <input
                  required
                  autoComplete="address-line1"
                  value={customer.address1}
                  onChange={(event) => update("address1", event.target.value)}
                  className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-hidden focus:border-ink"
                />
              </label>
              <label>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
                  City
                </span>
                <input
                  required
                  autoComplete="address-level2"
                  value={customer.city}
                  onChange={(event) => update("city", event.target.value)}
                  className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-hidden focus:border-ink"
                />
              </label>
              <label>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
                  State / region
                </span>
                <input
                  autoComplete="address-level1"
                  value={customer.region}
                  onChange={(event) => update("region", event.target.value)}
                  className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-hidden focus:border-ink"
                />
              </label>
              <label>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
                  Postal code
                </span>
                <input
                  required
                  autoComplete="postal-code"
                  value={customer.postalCode}
                  onChange={(event) => update("postalCode", event.target.value)}
                  className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-hidden focus:border-ink"
                />
              </label>
              <label>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
                  Country
                </span>
                <select
                  value={customer.country}
                  onChange={(event) => update("country", event.target.value)}
                  className="mt-1 w-full border-b border-line bg-transparent py-2 text-sm outline-hidden focus:border-ink"
                >
                  {COUNTRIES.map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </>
        ) : (
          <div className="mt-8 border border-line bg-bone/50 p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em]">
              02 — Shipping & payment
            </p>
            <p className="mt-2 text-sm leading-relaxed text-smoke">
              You’ll enter your shipping address and payment details on Stripe’s
              secure checkout. We never see your card.
            </p>
          </div>
        )}

        {error ? (
          <p className="mt-6 border border-red-300 bg-red-50 p-3 text-xs text-red-800">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-8 w-full bg-ink px-6 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-spot-dark disabled:cursor-wait disabled:bg-smoke"
        >
          {submitting
            ? "Starting checkout…"
            : stripeEnabled
              ? `Continue to payment — ${formatPrice(total)}`
              : `Place preview order — ${formatPrice(total)}`}
        </button>
        <p className="mt-3 text-center font-mono text-[9px] uppercase leading-relaxed tracking-widest text-smoke">
          {stripeEnabled
            ? "Secure checkout by Stripe · Card details stay with Stripe"
            : "Preview mode · Add Stripe keys to accept real payments"}
        </p>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-smoke">
          By ordering, you agree to our{" "}
          <Link
            href="/terms"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-line underline-offset-2 hover:text-ink"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-line underline-offset-2 hover:text-ink"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      <aside className="h-fit border border-line bg-white/40 p-5 md:p-7 lg:sticky lg:top-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
          Your order
        </p>
        <ul className="mt-4 divide-y divide-line">
          {items.map((item) => (
            <li key={item.key} className="flex gap-3 py-3">
              <div className="relative size-16 shrink-0 overflow-hidden border border-line bg-bone">
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
                <span className="absolute right-0 top-0 bg-ink px-1 font-mono text-[8px] text-paper">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-snug">{item.name}</p>
                <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.06em] text-smoke">
                  {Object.values(item.options).join(" · ")}
                </p>
                {item.personalization ? (
                  <p className="mt-0.5 font-mono text-[9px] text-spot-dark">
                    “{item.personalization}”
                  </p>
                ) : null}
              </div>
              <p className="font-mono text-[10px] tabular-nums">
                {formatPrice(item.price * item.quantity)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-line pt-4 font-mono text-[11px] uppercase tracking-[0.08em]">
          <div className="flex justify-between">
            <span className="text-smoke">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-smoke">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-sm">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </aside>
    </form>
  );
}
