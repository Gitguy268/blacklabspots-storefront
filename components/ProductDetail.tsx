"use client";

import { useCallback, useState } from "react";
import type { Product, ProductVariant } from "@/lib/types";
import { ProductGallery } from "./ProductGallery";
import { ProductPurchase } from "./ProductPurchase";

export function ProductDetail({ product }: { product: Product }) {
  const initial =
    product.variants.find((variant) => variant.available) ?? product.variants[0];
  const [selectedImage, setSelectedImage] = useState<string | null>(
    initial?.image ?? null
  );

  const handleVariantChange = useCallback(
    (variant: ProductVariant | undefined) => {
      setSelectedImage(variant?.image ?? null);
    },
    []
  );

  return (
    <div className="mt-5 grid gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
      <ProductGallery
        images={product.images}
        name={product.name}
        selectedImage={selectedImage}
      />
      <ProductPurchase
        product={product}
        onVariantChange={handleVariantChange}
      />
    </div>
  );
}
