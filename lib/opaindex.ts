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

const API_URL = "https://opaindex.com/commodities/prices.json";

// Static safety net copied from Opaindex's published open dataset. This keeps
// the portfolio demo useful when Vercel cannot reach the external feed.
const FALLBACK_PRICES: OpaindexPrice[] = [
  { slug: "cement-nigeria", name: "Cement", category: "building-materials", market: "Nigeria", unit: "50kg bag", price: 9500, currency: "NGN", dayChangePercent: 1.6, weekChangePercent: 3.2, source: "Dealer survey (Lagos, Abuja, Kano)", asOf: "2026-06-23", confidence: "high" },
  { slug: "iron-rod-10mm-nigeria", name: "Iron Rod (10mm rebar)", category: "building-materials", market: "Nigeria", unit: "per length", price: 8000, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Steel merchant survey", asOf: "2026-02-01", confidence: "medium" },
  { slug: "iron-rod-12mm-nigeria", name: "Iron Rod (12mm rebar)", category: "building-materials", market: "Nigeria", unit: "per length", price: 9800, currency: "NGN", dayChangePercent: 0.5, weekChangePercent: 0, source: "Steel merchant survey", asOf: "2026-06-23", confidence: "medium" },
  { slug: "iron-rod-16mm-nigeria", name: "Iron Rod (16mm rebar)", category: "building-materials", market: "Nigeria", unit: "per tonne", price: 1010000, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Steel merchant survey", asOf: "2026-07-03", confidence: "medium" },
  { slug: "iron-rod-25mm-nigeria", name: "Iron Rod (25mm rebar)", category: "building-materials", market: "Nigeria", unit: "per length", price: 50000, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Steel merchant survey", asOf: "2026-02-01", confidence: "medium" },
  { slug: "iron-rod-20mm-nigeria", name: "Iron Rod (20mm rebar)", category: "building-materials", market: "Nigeria", unit: "per length", price: 32000, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Steel merchant survey", asOf: "2026-02-01", confidence: "medium" },
  { slug: "sandcrete-block-9-inch-lagos", name: "Sandcrete Block (9 inch)", category: "building-materials", market: "Lagos", unit: "per block", price: 750, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Block industry survey", asOf: "2026-06-23", confidence: "medium" },
  { slug: "sandcrete-block-6-inch-lagos", name: "Sandcrete Block (6 inch)", category: "building-materials", market: "Lagos", unit: "per block", price: 550, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Block industry survey", asOf: "2026-06-23", confidence: "medium" },
  { slug: "dangote-cement-50kg", name: "Dangote Cement (50kg)", category: "building-materials", market: "Nigeria", unit: "50kg bag", price: 11000, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Dealer survey", asOf: "2026-06-26", confidence: "medium" },
  { slug: "bua-cement-50kg", name: "BUA Cement (50kg)", category: "building-materials", market: "Nigeria", unit: "50kg bag", price: 10500, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Dealer survey", asOf: "2026-06-26", confidence: "medium" },
  { slug: "lafarge-cement-elephant-50kg", name: "Lafarge Cement (Elephant, 50kg)", category: "building-materials", market: "Nigeria", unit: "50kg bag", price: 10000, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Dealer survey", asOf: "2026-06-28", confidence: "medium" },
  { slug: "granite-chippings-3-4-nigeria", name: "Granite Chippings (3/4 inch)", category: "building-materials", market: "Nigeria", unit: "per tonne", price: 8500, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Market survey", asOf: "2026-06-26", confidence: "medium" },
  { slug: "granite-chippings-1-2-nigeria", name: "Granite Chippings (1/2 inch)", category: "building-materials", market: "Nigeria", unit: "per tonne", price: 7500, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Market survey", asOf: "2026-06-26", confidence: "medium" },
  { slug: "sharp-sand-nigeria", name: "Sharp Sand", category: "building-materials", market: "Nigeria", unit: "per tonne", price: 4500, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Market survey", asOf: "2026-06-23", confidence: "medium" },
  { slug: "laterite-nigeria", name: "Laterite (filling sand)", category: "building-materials", market: "Nigeria", unit: "per tonne", price: 3500, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Market survey", asOf: "2026-06-18", confidence: "medium" },
  { slug: "aluminium-roofing-sheet-nigeria", name: "Aluminium Roofing Sheet (long-span, 0.55mm)", category: "building-materials", market: "Nigeria", unit: "per m²", price: 7500, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Building materials survey", asOf: "2026-06-26", confidence: "medium" },
  { slug: "stone-coated-roofing-sheet-nigeria", name: "Stone-Coated Roofing Sheet (0.55mm)", category: "building-materials", market: "Nigeria", unit: "per m²", price: 5700, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Building materials survey", asOf: "2026-06-26", confidence: "medium" },
  { slug: "binding-wire-nigeria", name: "Binding Wire (tie wire)", category: "building-materials", market: "Nigeria", unit: "per kg", price: 4650, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Building materials survey", asOf: "2026-06-26", confidence: "medium" },
  { slug: "marine-plywood-18mm-nigeria", name: "Marine Plywood (18mm, 8×4 sheet)", category: "building-materials", market: "Nigeria", unit: "per sheet", price: 42000, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Building materials survey", asOf: "2026-06-28", confidence: "medium" },
  { slug: "wire-nails-3-inch-nigeria", name: "Wire Nails (3 inch)", category: "building-materials", market: "Nigeria", unit: "per bag", price: 28000, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Building materials survey", asOf: "2026-06-30", confidence: "medium" },
  { slug: "pop-cement-nigeria", name: "POP Cement (Plaster of Paris, 40kg)", category: "building-materials", market: "Nigeria", unit: "per bag", price: 10750, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Building materials survey", asOf: "2026-06-30", confidence: "medium" },
  { slug: "ceramic-floor-tile-nigeria", name: "Ceramic Floor Tile (30×30cm)", category: "building-materials", market: "Nigeria", unit: "per pack", price: 1350, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "Building materials survey", asOf: "2026-03-28", confidence: "medium" },
  { slug: "rice-local-nigeria", name: "Rice (local)", category: "food-staples", market: "Nigeria", unit: "50kg bag", price: 82000, currency: "NGN", dayChangePercent: 0.4, weekChangePercent: -2.3, source: "NBS / market survey", asOf: "2026-06-23", confidence: "medium" },
  { slug: "rice-imported-nigeria", name: "Rice (imported)", category: "food-staples", market: "Nigeria", unit: "50kg bag", price: 112285, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "garri-white-nigeria", name: "Garri (white)", category: "food-staples", market: "Nigeria", unit: "50kg bag", price: 40662, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "palm-oil-lagos", name: "Palm Oil", category: "food-staples", market: "Lagos", unit: "25 litres", price: 48000, currency: "NGN", dayChangePercent: -0.8, weekChangePercent: 1.7, source: "Mile 12 & Daleko market survey", asOf: "2026-06-23", confidence: "medium" },
  { slug: "groundnut-oil-nigeria", name: "Groundnut Oil", category: "food-staples", market: "Nigeria", unit: "25 litres", price: 62000, currency: "NGN", dayChangePercent: 0.3, weekChangePercent: 0.9, source: "Market survey", asOf: "2026-06-23", confidence: "low" },
  { slug: "yam-tuber-nigeria", name: "Yam (tuber)", category: "food-staples", market: "Nigeria", unit: "per tuber (medium)", price: 2347, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "petrol-pms-nigeria", name: "Petrol (PMS)", category: "energy", market: "Nigeria", unit: "per litre", price: 1075, currency: "NGN", dayChangePercent: 0, weekChangePercent: -0.2, source: "NMDPRA / station price survey", asOf: "2026-07-13", confidence: "high" },
  { slug: "diesel-ago-nigeria", name: "Diesel (AGO)", category: "energy", market: "Nigeria", unit: "per litre", price: 1500, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NMDPRA / station price survey", asOf: "2026-07-13", confidence: "high" },
  { slug: "cooking-gas-lpg-nigeria", name: "Cooking Gas (LPG)", category: "energy", market: "Nigeria", unit: "per kg", price: 1400, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS LPG Price Watch", asOf: "2026-07-01", confidence: "medium" },
  { slug: "cooking-gas-12-5kg-nigeria", name: "Cooking Gas (12.5kg refill)", category: "energy", market: "Nigeria", unit: "per 12.5kg refill", price: 22382, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS LPG Price Watch", asOf: "2026-04-15", confidence: "high" },
  { slug: "kerosene-nigeria", name: "Kerosene (HHK)", category: "energy", market: "Nigeria", unit: "per litre", price: 2972, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "electricity-band-a-nigeria", name: "Electricity (Band A tariff)", category: "energy", market: "Nigeria", unit: "per kWh", price: 210, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NERC tariff", asOf: "2025-12-01", confidence: "medium" },
  { slug: "maize-white-nigeria", name: "Maize (white)", category: "agriculture", market: "Nigeria", unit: "per kg", price: 816, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "brown-beans-nigeria", name: "Brown Beans (cowpea)", category: "agriculture", market: "Nigeria", unit: "per kg", price: 1345, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "tomato-nigeria", name: "Tomato", category: "agriculture", market: "Nigeria", unit: "per kg", price: 1561, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "onion-nigeria", name: "Onion (bulb)", category: "agriculture", market: "Nigeria", unit: "per kg", price: 1180, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "ginger-fresh-nigeria", name: "Ginger (fresh)", category: "agriculture", market: "Nigeria", unit: "per kg", price: 5907, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "beef-boneless-nigeria", name: "Beef (boneless)", category: "agriculture", market: "Nigeria", unit: "per kg", price: 7171, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-05-15", confidence: "high" },
  { slug: "eggs-crate-nigeria", name: "Eggs (crate of 30)", category: "agriculture", market: "Nigeria", unit: "crate of 30", price: 6143, currency: "NGN", dayChangePercent: 0, weekChangePercent: 0, source: "NBS Selected Food Price Watch", asOf: "2026-04-15", confidence: "medium" },
];

export async function getOpaindexPrices(): Promise<OpaindexPrice[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1800);
    const response = await fetch(API_URL, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const payload = (await response.json()) as OpaindexResponse | OpaindexPrice[];
      const prices = Array.isArray(payload) ? payload : payload.prices;
      if (Array.isArray(prices) && prices.length > 0) return prices;
    }
  } catch (error) {
    console.warn("Opaindex live feed unavailable; using embedded dataset.", error);
  }

  return FALLBACK_PRICES;
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
