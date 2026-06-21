import { getProductSummaries } from "@/lib/queries";
import CategoryClient from "./category-client";
import type { ProductCategory } from "@/lib/types";

export const revalidate = 0;

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: ProductCategory }>;
}) {
  const { category } = await params;
  const allProducts = await getProductSummaries();
  const products = allProducts.filter((p) => p.category === category);

  return <CategoryClient category={category} products={products} />;
}
