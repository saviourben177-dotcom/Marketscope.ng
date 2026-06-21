"use client";

import Link from "next/link";
import { formatNaira } from "@/lib/format";
import { BottomNav } from "@/components/bottom-nav";
import type { ProductSummary } from "@/lib/types";

export default function TrendsClient({ products }: { products: ProductSummary[] }) {
  const withData = products.filter((p) => p.latest_price_kobo !== null);
  const staleCount = withData.filter((p) => p.is_stale).length;

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="text-lg font-semibold">Trends</h1>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatTile value={withData.length} label="Tracked Items" />
          <StatTile value={staleCount} label="Stale" accentRed={staleCount > 0} />
          <StatTile value={withData.length - staleCount} label="Up to Date" />
        </div>

        <h2 className="mb-3 mt-7 text-base font-semibold">All Tracked Items</h2>
        {withData.length === 0 ? (
          <p className="text-center text-sm text-muted">No price data yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {withData.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 active:bg-surface-light"
              >
                <div>
                  <p className="text-sm font-medium">{p.name} ({p.unit})</p>
                  <p className="text-xs text-muted">{p.entry_count} entries</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-accent">
                    {formatNaira(p.latest_price_kobo!)}
                  </p>
                  {p.is_stale && <p className="text-xs text-orange-400">Stale</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="trends" />
    </main>
  );
}

function StatTile({
  value,
  label,
  accentRed,
}: {
  value: number;
  label: string;
  accentRed?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 text-center">
      <p className={`text-2xl font-bold ${accentRed ? "text-orange-400" : "text-foreground"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
