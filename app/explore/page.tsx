import { getOpaindexPrices } from "@/lib/opaindex";
import { getProductSummaries } from "@/lib/queries";
import ExploreClient from "./explore-client";

export const dynamic = "force-dynamic";

export default async function ExplorePage() {
  const [products, marketPrices] = await Promise.all([
    getProductSummaries(),
    getOpaindexPrices(),
  ]);

  return <ExploreClient products={products} marketPrices={marketPrices} />;
}
