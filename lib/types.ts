export type ProductImage = {
  src: string;
  alt: string;
  label?: string;
};

export type ProductOptionValue = {
  id: string;
  label: string;
  hex?: string;
};

export type ProductOption = {
  name: string;
  type: "color" | "size" | "choice";
  values: ProductOptionValue[];
};

export type ProductVariant = {
  id: string;
  printifyVariantId: number;
  sku: string | null;
  options: Record<string, string>;
  price: number;
  available: boolean;
  image: string | null;
};

export type ProductPersonalization = {
  enabled: boolean;
  type: "text" | "image";
  label: string;
  maxLength: number;
};

export type ProductDetail = {
  name: string;
  description: string;
};

export type SizeGuide = {
  sizes: string[];
  types: {
    name: string;
    units: string;
    ranges: { from: string; to: string }[];
  }[];
};

export type Product = {
  id: string;
  printifyProductId: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  priceMax: number | null;
  currency: string;
  category: string;
  collections: string[];
  tags: string[];
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  personalization: ProductPersonalization | null;
  details: ProductDetail[];
  care: string[];
  provider: string | null;
  sizeGuide: SizeGuide | null;
};

export type Catalog = {
  generatedAt: string;
  source: string;
  currency: string;
  categories: { slug: string; title: string; blurb: string }[];
  products: Product[];
};

export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  options: Record<string, string>;
  quantity: number;
  personalization?: string;
};
