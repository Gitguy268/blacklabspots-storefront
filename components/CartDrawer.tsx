"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { CloseIcon, MinusIcon, PlusIcon } from "./Icons";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    setQuantity,
    removeItem,
    count,
  } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [closeCart, isOpen]);

  if (!isOpen) return null;

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 695;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button
        type="button"
        className="absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
        onClick={closeCart}
        aria-label="Close cart"
        tabIndex={-1}
      />
      <aside className="drawer-panel absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-paper shadow-[-20px_0_60px_rgba(10,10,10,0.12)]">
        <div className="flex h-16 items-center justify-between border-b border-line px-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]">
            Your bag <span className="text-smoke">[{count}]</span>
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="flex size-9 items-center justify-center"
            aria-label="Close cart"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="font-display text-3xl font-bold uppercase tracking-tight">
              Your bag is empty.
            </p>
            <p className="mt-2 max-w-[28ch] text-sm text-smoke">
              Spot is disappointed, but he will get over it. Probably.
            </p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="mt-8 bg-ink px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-spot-dark"
            >
              Shop the good stuff
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-5 py-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-smoke">
                {remaining > 0
                  ? `${formatPrice(remaining)} away from free shipping`
                  : "Free shipping unlocked"}
              </p>
              <div className="mt-2 h-1 w-full bg-line">
                <div
                  className="h-full bg-spot transition-[width] duration-500 ease-swift"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.key} className="flex gap-4 border-b border-line py-5">
                  <Link
                    href={`/products/${item.slug}`}
                    onClick={closeCart}
                    className="relative size-24 shrink-0 overflow-hidden border border-line bg-bone"
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="96px"
                      className="object-contain p-1"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={closeCart}
                        className="text-sm font-medium leading-snug"
                      >
                        {item.name}
                      </Link>
                      <p className="shrink-0 font-mono text-xs">
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
                        “{item.personalization}”
                      </p>
                    ) : null}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <div className="flex items-center border border-line">
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity - 1)}
                          className="flex size-7 items-center justify-center transition-colors hover:bg-bone"
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <MinusIcon className="size-3" />
                        </button>
                        <span className="w-7 text-center font-mono text-[11px]">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity(item.key, item.quantity + 1)}
                          className="flex size-7 items-center justify-center transition-colors hover:bg-bone"
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

            <div className="border-t border-line bg-paper px-5 py-5">
              <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="mt-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.1em] text-smoke">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-smoke">
                Taxes and shipping are calculated at checkout. Every piece is
                made to order.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-4 flex h-12 items-center justify-center bg-ink font-mono text-[11px] uppercase tracking-[0.18em] text-paper transition-colors hover:bg-spot-dark"
              >
                Checkout — {formatPrice(subtotal + shipping)}
              </Link>
              <button
                type="button"
                onClick={closeCart}
                className="mt-3 w-full py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-smoke hover:text-ink"
              >
                Continue shopping
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
