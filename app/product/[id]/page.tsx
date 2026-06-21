import { notFound } from "next/navigation";
import { getProductById, getPriceEntriesForProduct } from "@/lib/queries";
import ProductDetailClient from "./product-client";

export const revalidate = 0;

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const entries = await getPriceEntriesForProduct(id);

  return <ProductDetailClient product={product} entries={entries} />;
}
