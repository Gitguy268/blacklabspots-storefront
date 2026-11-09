"use client";

import { useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/lib/cart";
import type { Product, ProductVariant } from "@/lib/types";
import { Accordion } from "./Accordion";
import { MinusIcon, PlusIcon } from "./Icons";
import { SizeGuide } from "./SizeGuide";

function findVariant(
  product: Product,
  selected: Record<string, string>
): ProductVariant | undefined {
  return product.variants.find((variant) =>
    Object.entries(selected).every(([key, value]) => variant.options[key] === value)
  );
}

function optionHeading(option: Product["options"][number]) {
  if (option.type === "color") return "Color";
  if (option.type === "size") return "Size";
  return option.name;
}

export function ProductPurchase({
  product,
  onVariantChange,
}: {
  product: Product;
  onVariantChange?: (variant: ProductVariant | undefined) => void;
}) {
  const initial =
    product.variants.find((variant) => variant.available) ?? product.variants[0];
  const [selected, setSelected] = useState<Record<string, string>>(
    initial?.options ?? {}
  );
  const [quantity, setQuantity] = useState(1);
  const [personalization, setPersonalization] = useState("");
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const { addItem } = useCart();

  const variant = useMemo(() => findVariant(product, selected), [product, selected]);
  const price = variant?.price ?? product.price;
  const available = Boolean(variant?.available);
  const personalizationEnabled = Boolean(product.personalization?.enabled);
  const isImagePersonalization = product.personalization?.type === "image";

  useEffect(() => {
    onVariantChange?.(variant);
  }, [onVariantChange, variant]);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 560);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function choose(optionName: string, value: string) {
    setSelected((current) => ({ ...current, [optionName]: value }));
    setAdded(false);
  }

  function addToBag() {
    if (!variant || !available) return;
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: variant.image ?? product.images[0]?.src ?? "",
      price: variant.price,
      options: selected,
      quantity,
      personalization: personalization.trim() || undefined,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  const descriptionParagraphs = product.description
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className="lg:sticky lg:top-24">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
        {product.category} · Made to order
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.9rem,4.4vw,3.4rem)] font-extrabold uppercase leading-[0.94] tracking-tightest">
        {product.name}
      </h1>

      <div className="mt-4 flex items-end gap-3 border-b border-line pb-5">
        <p className="font-mono text-lg tabular-nums">{formatPrice(price)}</p>
        <p className="pb-0.5 font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
          USD · Made to order
        </p>
      </div>

      <p className="mt-5 max-w-[52ch] text-sm leading-relaxed text-smoke">
        {descriptionParagraphs[0]}
      </p>

      {product.options.map((option) => {
        const heading = optionHeading(option);
        return (
          <fieldset key={option.name} className="mt-7">
            <legend className="flex w-full items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]">
              <span>{heading}</span>
              <span className="text-smoke">
                {selected[heading] ?? "Select"}
              </span>
            </legend>

            {option.type === "color" ? (
              <div className="mt-3 flex flex-wrap gap-2.5">
                {option.values.map((value) => {
                  const active = selected[heading] === value.label;
                  return (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() => choose(heading, value.label)}
                      className={`relative size-8 rounded-full border transition-all ${
                        active
                          ? "border-ink ring-1 ring-ink ring-offset-2 ring-offset-paper"
                          : "border-ink/15 hover:border-ink/50"
                      }`}
                      style={{ backgroundColor: value.hex ?? "#d8d4ca" }}
                      aria-label={value.label}
                      aria-pressed={active}
                      title={value.label}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const active = selected[heading] === value.label;
                  const existsAvailable = product.variants.some(
                    (candidate) =>
                      candidate.available &&
                      candidate.options[heading] === value.label
                  );
                  return (
                    <button
                      key={value.id}
                      type="button"
                      onClick={() => choose(heading, value.label)}
                      disabled={!existsAvailable}
                      className={`min-w-11 border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] transition-colors ${
                        active
                          ? "border-ink bg-ink text-paper"
                          : existsAvailable
                            ? "border-line hover:border-ink"
                            : "cursor-not-allowed border-line text-smoke/40 line-through"
                      }`}
                      aria-pressed={active}
                    >
                      {value.label}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}

      {personalizationEnabled ? (
        <div className="mt-7">
          <label
            htmlFor="personalization"
            className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.14em]"
          >
            <span>Personalization</span>
            <span className="text-smoke">Optional</span>
          </label>
          {isImagePersonalization ? (
            <p className="mt-2 border border-line bg-bone/60 p-3 text-[12px] leading-relaxed text-smoke">
              This piece is personalized with your photo. After checkout we’ll
              email you for the image — no rush, we’ll wait.
            </p>
          ) : (
            <>
              <textarea
                id="personalization"
                value={personalization}
                onChange={(event) => setPersonalization(event.target.value)}
                maxLength={product.personalization?.maxLength ?? 60}
                rows={2}
                placeholder="Type here…"
                className="mt-2 w-full resize-none border border-line bg-white/60 p-3 text-sm outline-hidden transition-colors placeholder:text-smoke/60 focus:border-ink"
              />
              <div className="mt-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.08em] text-smoke">
                <span className="max-w-[45ch] normal-case tracking-normal">
                  {product.personalization?.label}
                </span>
                <span className="tabular-nums">
                  {personalization.length}/{product.personalization?.maxLength ?? 60}
                </span>
              </div>
            </>
          )}
        </div>
      ) : null}

      <div className="mt-7 flex items-center gap-3">
        <div className="flex h-12 items-center border border-line">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-11 items-center justify-center transition-colors hover:bg-bone"
            aria-label="Decrease quantity"
          >
            <MinusIcon className="size-3.5" />
          </button>
          <span className="w-8 text-center font-mono text-xs tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(20, q + 1))}
            className="flex size-11 items-center justify-center transition-colors hover:bg-bone"
            aria-label="Increase quantity"
          >
            <PlusIcon className="size-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={addToBag}
          disabled={!available}
          className="h-12 flex-1 bg-ink font-mono text-[11px] uppercase tracking-[0.16em] text-paper transition-colors hover:bg-spot-dark disabled:cursor-not-allowed disabled:bg-smoke/50"
        >
          {!available ? "Sold out" : added ? "Added to bag ✓" : `Add to bag — ${formatPrice(price)}`}
        </button>
      </div>

      <p className="mt-3 font-mono text-[9px] uppercase leading-relaxed tracking-widest text-smoke">
        Free shipping over $75 · Ships in 4–10 business days · Personalization is
        final sale
      </p>

      <div className="mt-8">
        {product.sizeGuide ? (
          <Accordion title="Size guide">
            <SizeGuide guide={product.sizeGuide} />
          </Accordion>
        ) : null}

        <Accordion title="Details" open>
          <div className="space-y-3">
            {descriptionParagraphs.slice(1).map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            {product.details.length ? (
              <ul className="mt-4 space-y-2">
                {product.details.map((detail) => (
                  <li key={detail.name} className="flex gap-2">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-spot" />
                    <span>
                      <span className="text-ink">{detail.name}.</span>{" "}
                      {detail.description}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
            {product.care.length ? (
              <div className="mt-4 border-t border-line pt-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink">
                  Care
                </p>
                <ul className="mt-2 space-y-1">
                  {product.care.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Accordion>

        <Accordion title="Shipping & returns">
          <p>
            Everything is printed to order by our production partners, then
            shipped directly to you. Production usually takes 2–5 business days,
            with delivery close behind. You’ll get tracking as soon as it leaves
            the press.
          </p>
          <p className="mt-3">
            Unworn, unpersonalized items can be returned within 30 days. Because
            personalized pieces are made one of one, they’re final sale unless
            something arrives damaged or incorrect.
          </p>
        </Accordion>

        <div className="border-t border-line" />
      </div>

      {showSticky ? (
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-paper/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="truncate font-mono text-[9px] uppercase tracking-widest text-smoke">
              {product.name}
            </p>
            <p className="font-mono text-sm tabular-nums">{formatPrice(price)}</p>
          </div>
          <button
            type="button"
            onClick={addToBag}
            disabled={!available}
            className="h-11 bg-ink px-6 font-mono text-[10px] uppercase tracking-[0.14em] text-paper disabled:bg-smoke/50"
          >
            {available ? "Add to bag" : "Sold out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
