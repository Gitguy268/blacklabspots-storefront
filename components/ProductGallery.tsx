"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({
  images,
  name,
  selectedImage,
}: {
  images: ProductImage[];
  name: string;
  selectedImage?: string | null;
}) {
  const [active, setActive] = useState(0);

  const shown = useMemo(() => {
    if (!selectedImage) return images;
    if (images.some((image) => image.src === selectedImage)) return images;

    const front = images.findIndex((image) => image.label === "front");
    if (front >= 0) {
      return images.map((image, index) =>
        index === front
          ? { ...image, src: selectedImage, alt: `${name} — selected color` }
          : image
      );
    }

    return [
      { src: selectedImage, alt: `${name} — selected color`, label: "front" },
      ...images,
    ];
  }, [images, name, selectedImage]);

  useEffect(() => {
    if (!selectedImage) {
      setActive(0);
      return;
    }
    const exact = images.findIndex((image) => image.src === selectedImage);
    setActive(exact >= 0 ? exact : 0);
  }, [images, selectedImage]);

  const current = shown[active] ?? shown[0];

  if (!current) return null;

  return (
    <div className="grid gap-3 md:grid-cols-[76px_1fr]">
      <div className="order-2 flex gap-2 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible md:pb-0">
        {shown.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
            type="button"
            onClick={() => setActive(index)}
            className={`relative aspect-square w-16 shrink-0 overflow-hidden border bg-white transition-colors md:w-full ${
              index === active ? "border-ink" : "border-transparent hover:border-line"
            }`}
            aria-label={`View image ${index + 1} of ${name}`}
            aria-pressed={index === active}
          >
            <Image
              src={image.src}
              alt=""
              fill
              sizes="76px"
              className="object-contain p-1"
            />
          </button>
        ))}
      </div>

      <div className="order-1 md:order-2">
        <div className="relative aspect-square overflow-hidden bg-white">
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            priority
            sizes="(min-width: 1024px) 55vw, 100vw"
            className="object-contain p-4 md:p-8"
          />
          <span className="absolute bottom-3 left-3 bg-paper/85 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-smoke backdrop-blur-sm">
            {String(active + 1).padStart(2, "0")} / {String(shown.length).padStart(2, "0")}
          </span>
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.12em] text-smoke">
          Mockup shown. Final print may vary slightly.
        </p>
      </div>
    </div>
  );
}
