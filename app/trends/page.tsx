import { getOpaindexPrices } from "@/lib/opaindex";
import { getProductSummaries } from "@/lib/queries";
import TrendsClient from "./trends-client";

export const dynamic = "force-dynamic";

async function safeGetProductSummaries() {
  try {
    return await getProductSummaries();
  } catch (error) {
    console.error("Trends: MarketScope database unavailable:", error);
    return [];
  }
}

export default async function TrendsPage() {
  // The external Opaindex feed must remain usable even when the optional
  // MarketScope/Supabase dataset is unavailable.
  const [products, marketPrices] = await Promise.all([
    safeGetProductSummaries(),
    getOpaindexPrices(),
  ]);

  return <TrendsClient products={products} marketPrices={marketPrices} />;
}
