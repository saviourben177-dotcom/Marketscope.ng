import { getProductSummaries } from "@/lib/queries";
import ExploreClient from "./explore-client";

export const revalidate = 0;

export default async function ExplorePage() {
  const products = await getProductSummaries();
  return <ExploreClient products={products} />;
}
