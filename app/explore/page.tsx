import { getOpaindexPrices } from "@/lib/opaindex";
import { getProductSummaries } from "@/lib/queries";
import ExploreClient from "./explore-client";

export const dynamic = "force-dynamic";

async function safeGetProductSummaries() {
  try {
    return await getProductSummaries();
  } catch (error) {
    console.error("Explore: MarketScope database unavailable:", error);
    return [];
  }
}

export default async function ExplorePage() {
  // The external Opaindex feed must remain usable even when the optional
  // MarketScope/Supabase dataset is unavailable.
  const [products, marketPrices] = await Promise.all([
    safeGetProductSummaries(),
    getOpaindexPrices(),
  ]);

  return <ExploreClient products={products} marketPrices={marketPrices} />;
}
