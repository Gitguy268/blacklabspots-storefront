"use client";

import { useCart } from "@/lib/cart";
import { PlusIcon } from "./Icons";

type QuickAddProps = {
  item: {
    productId: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    options: Record<string, string>;
    personalization?: string;
  };
};

export function QuickAdd({ item }: QuickAddProps) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      onClick={() => addItem(item)}
      className="flex size-9 items-center justify-center border border-ink/15 bg-paper/95 text-ink backdrop-blur-sm transition-colors hover:border-ink hover:bg-ink hover:text-paper"
      aria-label={`Quick add ${item.name}`}
    >
      <PlusIcon className="size-4" />
    </button>
  );
}
