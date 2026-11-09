"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { MinusIcon, PlusIcon } from "./Icons";

export function CartPageClient() {
  const { items, subtotal, setQuantity, removeItem, isReady } = useCart();

  if (!isReady) {
    return <div className="py-24" aria-hidden="true" />;
  }

  if (!items.length) {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <p className="font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold uppercase leading-[0.9] tracking-tightest">
          Your bag is empty.
        </p>
        <p className="mt-3 max-w-sm text-sm text-smoke">
          Spot suggests a hoodie, a blanket, and something with his face on it.
        </p>
        <Link
          href="/shop"
          className="mt-8 bg-ink px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-spot-dark"
        >
          Shop the good stuff
        </Link>
      </div>
    );
  }

  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 695;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-16">
      <div>
        <ul>
          {items.map((item) => (
            <li
              key={item.key}
              className="flex gap-4 border-b border-line py-6 md:gap-6"
            >
              <Link
                href={`/products/${item.slug}`}
                className="relative size-28 shrink-0 overflow-hidden border border-line bg-bone md:size-36"
              >
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="144px"
                  className="object-contain p-2"
                />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <Link
                    href={`/products/${item.slug}`}
                    className="text-sm font-medium leading-snug md:text-base"
                  >
                    {item.name}
                  </Link>
                  <p className="shrink-0 font-mono text-xs tabular-nums">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-smoke">
                  {Object.entries(item.options)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join(" · ")}
                </p>
                {item.personalization ? (
                  <p className="mt-1 font-mono text-[10px] text-spot-dark">
                    Personalization: “{item.personalization}”
                  </p>
                ) : null}
                <p className="mt-1 font-mono text-[9px] uppercase tracking-widest text-smoke">
                  Made to order · Ships in 4–10 business days
                </p>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center border border-line">
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity - 1)}
                      className="flex size-8 items-center justify-center hover:bg-bone"
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <MinusIcon className="size-3" />
                    </button>
                    <span className="w-8 text-center font-mono text-[11px]">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(item.key, item.quantity + 1)}
                      className="flex size-8 items-center justify-center hover:bg-bone"
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <PlusIcon className="size-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    className="font-mono text-[9px] uppercase tracking-[0.12em] text-smoke underline underline-offset-4 hover:text-ink"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link
          href="/shop"
          className="mt-7 inline-block font-mono text-[10px] uppercase tracking-[0.14em] underline underline-offset-4"
        >
          Continue shopping
        </Link>
      </div>

      <aside className="h-fit border border-line bg-white/40 p-5 md:p-7 lg:sticky lg:top-24">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em]">
          Order summary
        </p>
        <div className="mt-5 space-y-2 border-b border-line pb-4 font-mono text-[11px] uppercase tracking-[0.08em]">
          <div className="flex justify-between">
            <span className="text-smoke">Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-smoke">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-smoke">Tax</span>
            <span className="text-[9px] normal-case tracking-normal">
              Calculated at checkout
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-between font-mono text-sm uppercase tracking-[0.08em]">
          <span>Total</span>
          <span>{formatPrice(subtotal + shipping)}</span>
        </div>
        <Link
          href="/checkout"
          className="mt-5 flex h-12 items-center justify-center bg-ink font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-spot-dark"
        >
          Checkout
        </Link>
        <p className="mt-4 text-[11px] leading-relaxed text-smoke">
          Secure payment by Stripe. Every piece is printed to order by our
          production partners.
        </p>
      </aside>
    </div>
  );
}
