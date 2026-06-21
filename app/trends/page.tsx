import { getProductSummaries } from "@/lib/queries";
import TrendsClient from "./trends-client";

export const revalidate = 0;

export default async function TrendsPage() {
  const products = await getProductSummaries();
  return <TrendsClient products={products} />;
}
