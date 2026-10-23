"use client";

import { useCart } from "@/lib/cart";
import { BagIcon } from "./Icons";

export function CartButton() {
  const { count, openCart, isReady } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="group flex items-center gap-2 py-2 font-mono text-[11px] uppercase tracking-[0.14em]"
      aria-label={`Open cart, ${isReady ? count : 0} items`}
    >
      <BagIcon className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
      <span className="hidden sm:inline">Cart</span>
      <span className="tabular-nums">[{isReady ? count : 0}]</span>
    </button>
  );
}
