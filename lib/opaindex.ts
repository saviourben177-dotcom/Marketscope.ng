export type OpaindexCategory =
  | "building-materials"
  | "food-staples"
  | "energy"
  | "agriculture";

export interface OpaindexPrice {
  slug: string;
  name: string;
  category: OpaindexCategory;
  market: string;
  unit: string;
  price: number;
  currency: string;
  dayChangePercent: number;
  weekChangePercent: number;
  source: string;
  asOf: string;
  confidence: "high" | "medium" | "low";
}

interface OpaindexResponse {
  prices?: OpaindexPrice[];
  count?: number;
  source?: "db" | "seed";
  asOf?: string;
}

// The public REST endpoint can intermittently return 503 from Vercel.
// Opaindex also publishes the same machine-readable dataset as a free JSON
// download, so use that stable public feed instead.
const API_URL = "https://opaindex.com/commodities/prices.json";

export async function getOpaindexPrices(): Promise<OpaindexPrice[]> {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      console.error("Opaindex request failed:", response.status);
      return [];
    }

    const payload = (await response.json()) as OpaindexResponse | OpaindexPrice[];
    if (Array.isArray(payload)) return payload;
    return Array.isArray(payload.prices) ? payload.prices : [];
  } catch (error) {
    console.error("Opaindex request failed:", error);
    return [];
  }
}

export function formatOpaindexDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatMarketPrice(price: OpaindexPrice): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: price.currency,
    maximumFractionDigits: 0,
  }).format(price.price);
}

export function categoryLabel(category: OpaindexCategory): string {
  const labels: Record<OpaindexCategory, string> = {
    "building-materials": "Building Materials",
    "food-staples": "Food Staples",
    energy: "Energy",
    agriculture: "Agriculture",
  };

  return labels[category];
}
