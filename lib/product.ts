import { formatPrice } from "./format";
import type { Product, ProductVariant } from "./types";

export function defaultVariant(product: Product): ProductVariant | undefined {
  return (
    product.variants.find((variant) => variant.available) ?? product.variants[0]
  );
}

export function priceLabel(product: Product): string {
  if (product.priceMax && product.priceMax > product.price) {
    return `From ${formatPrice(product.price)}`;
  }
  return formatPrice(product.price);
}
