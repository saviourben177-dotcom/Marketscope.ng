import Link from "next/link";
import { formatNaira } from "@/lib/format";
import type { ProductSummary } from "@/lib/types";

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link
      href={`/product/${product.id}`}
      className="flex items-center gap-3 rounded-2xl bg-surface p-3 transition-colors active:bg-surface-light"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-surface-light text-lg">
        {categoryEmoji(product.category)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {product.name} <span className="text-muted">({product.unit})</span>
        </p>
        <p className="text-sm font-semibold text-accent">
          {product.latest_price_kobo !== null ? formatNaira(product.latest_price_kobo) : "No data yet"}
        </p>
      </div>
    </Link>
  );
}

function categoryEmoji(category: string) {
  switch (category) {
    case "food":
      return "🌾";
    case "fuel_energy":
      return "⛽";
    case "building_materials":
      return "🧱";
    default:
      return "📦";
  }
}
