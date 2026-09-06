import { getOpaindexPrices } from "@/lib/opaindex";
import { getProductSummaries } from "@/lib/queries";
import TrendsClient from "./trends-client";

export const dynamic = "force-dynamic";

export default async function TrendsPage() {
  const [products, marketPrices] = await Promise.all([
    getProductSummaries(),
    getOpaindexPrices(),
  ]);

  return <TrendsClient products={products} marketPrices={marketPrices} />;
}
