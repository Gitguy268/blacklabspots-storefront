import { permanentRedirect } from "next/navigation";
import { getProductById } from "@/lib/catalog";

export default async function LegacyProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = getProductById(id);
  permanentRedirect(product ? `/products/${product.slug}` : "/shop");
}
