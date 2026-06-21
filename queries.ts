import { createClient } from "@/lib/supabase/server";
import { computeStaleness } from "@/lib/format";
import type { Location, Product, PriceEntryWithLocation, ProductSummary } from "@/lib/types";

export async function getLocations(): Promise<Location[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("id, state, is_fct, geopolitical_zone, created_at")
    .order("state");

  if (error) {
    console.error("getLocations failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, unit, staleness_threshold_days, is_active, created_at, updated_at")
    .eq("is_active", true)
    .order("category")
    .order("name");

  if (error) {
    console.error("getProducts failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, unit, staleness_threshold_days, is_active, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getProductById failed:", error.message);
    return null;
  }
  return data;
}

/**
 * Home page summary: every active product with its latest price, entry count,
 * and computed staleness. Dataset is small by design (max ~15 products x 15
 * locations), so we pull all entries once and aggregate server-side rather than
 * running a query per product (avoids an N+1 problem).
 */
export async function getProductSummaries(): Promise<ProductSummary[]> {
  const products = await getProducts();
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from("price_entries")
    .select("product_id, price_kobo, entry_date")
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("getProductSummaries entries fetch failed:", error.message);
  }

  return products.map((product) => {
    const productEntries = (entries ?? []).filter((e) => e.product_id === product.id);
    const latest = productEntries[0] ?? null;
    const { isStale } = computeStaleness(latest?.entry_date ?? null, product.staleness_threshold_days);

    return {
      ...product,
      latest_price_kobo: latest?.price_kobo ?? null,
      entry_count: productEntries.length,
      last_updated: latest?.entry_date ?? null,
      is_stale: isStale,
    };
  });
}

export async function getPriceEntriesForProduct(
  productId: string
): Promise<PriceEntryWithLocation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("price_entries")
    .select(
      `id, product_id, location_id, price_kobo, note, has_note, ai_summary, source_type, entry_date, created_at, updated_at,
       location:locations(id, state, geopolitical_zone)`
    )
    .eq("product_id", productId)
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("getPriceEntriesForProduct failed:", error.message);
    return [];
  }

  return (data ?? []).map((row: any) => ({
    ...row,
    location: Array.isArray(row.location) ? row.location[0] : row.location,
  }));
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, category, unit, staleness_threshold_days, is_active, created_at, updated_at")
    .eq("is_active", true)
    .ilike("name", `%${query.trim()}%`)
    .limit(10);

  if (error) {
    console.error("searchProducts failed:", error.message);
    return [];
  }
  return data ?? [];
}
