// Types mirror the live Supabase schema exactly (project: MarketScope, biawexqqxbkwppxmwkgy)

export type ProductCategory = "food" | "fuel_energy" | "building_materials";

export interface Location {
  id: string;
  state: string;
  is_fct: boolean;
  geopolitical_zone: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  unit: string;
  staleness_threshold_days: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PriceEntry {
  id: string;
  product_id: string;
  location_id: string;
  price_kobo: number;
  note: string | null;
  has_note: boolean;
  ai_summary: string | null;
  source_type: "curator";
  entry_date: string; // date string YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

// Joined shape used on product detail pages
export interface PriceEntryWithLocation extends PriceEntry {
  location: Pick<Location, "id" | "state" | "geopolitical_zone">;
}

// Aggregated view used on home page / product cards
export interface ProductSummary extends Product {
  latest_price_kobo: number | null;
  entry_count: number;
  last_updated: string | null;
  is_stale: boolean;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  food: "Food",
  fuel_energy: "Fuel & Energy",
  building_materials: "Building Materials",
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  food: "leaf",
  fuel_energy: "flame",
  building_materials: "building",
};
