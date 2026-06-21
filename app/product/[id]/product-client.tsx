"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { formatNaira, formatRelativeDate, computeStaleness } from "@/lib/format";
import { BottomNav } from "@/components/bottom-nav";
import type { Product, PriceEntryWithLocation } from "@/lib/types";

export default function ProductDetailClient({
  product,
  entries,
}: {
  product: Product;
  entries: PriceEntryWithLocation[];
}) {
  const router = useRouter();
  const [locationFilter, setLocationFilter] = useState<string>("all");

  const filteredEntries = useMemo(() => {
    if (locationFilter === "all") return entries;
    return entries.filter((e) => e.location.id === locationFilter);
  }, [entries, locationFilter]);

  const stats = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    const prices = filteredEntries.map((e) => e.price_kobo);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return { min, max, avg, count: filteredEntries.length };
  }, [filteredEntries]);

  const uniqueLocations = useMemo(() => {
    const seen = new Map<string, string>();
    entries.forEach((e) => seen.set(e.location.id, e.location.state));
    return Array.from(seen.entries()).map(([id, state]) => ({ id, state }));
  }, [entries]);

  const staleness = useMemo(() => {
    if (filteredEntries.length === 0) return null;
    return computeStaleness(filteredEntries[0].entry_date, product.staleness_threshold_days);
  }, [product, filteredEntries]);

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="flex items-center justify-between">
          <button onClick={() => router.back()} className="rounded-full bg-surface p-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold">
            {product.name} ({product.unit})
          </h1>
          <div className="w-9" />
        </div>

        {uniqueLocations.length > 0 && (
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="mt-4 w-full rounded-xl bg-surface px-4 py-2.5 text-sm text-foreground"
          >
            <option value="all">All locations</option>
            {uniqueLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.state} State
              </option>
            ))}
          </select>
        )}

        {stats ? (
          <>
            <div className="mt-4 rounded-2xl bg-surface p-5">
              <p className="text-xs text-muted">Current Price Range</p>
              <p className="mt-1 text-2xl font-bold">
                {formatNaira(stats.min)} – {formatNaira(stats.max)}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border-subtle pt-4">
                <div>
                  <p className="text-xs text-muted">Average Price</p>
                  <p className="text-base font-semibold">{formatNaira(stats.avg)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted">Total Entries</p>
                  <p className="text-base font-semibold">{stats.count}</p>
                </div>
              </div>
            </div>

            {staleness?.isStale && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-orange-950/40 px-4 py-2.5 text-orange-300">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <p className="text-xs">
                  Last updated {staleness.daysSince} days ago — may be out of date
                </p>
              </div>
            )}

            <SectionHeader title="Recent Entries" />
            <div className="flex flex-col gap-2">
              {filteredEntries.slice(0, 10).map((entry) => (
                <div key={entry.id} className="rounded-2xl bg-surface px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{entry.location.state} State</p>
                      <p className="text-xs text-muted">{formatRelativeDate(entry.entry_date)}</p>
                    </div>
                    <p className="text-sm font-semibold text-accent">
                      {formatNaira(entry.price_kobo)}
                    </p>
                  </div>
                  {entry.ai_summary ? (
                    <p className="mt-2 border-t border-border-subtle pt-2 text-xs text-muted">
                      {entry.ai_summary}
                    </p>
                  ) : entry.note ? (
                    <p className="mt-2 border-t border-border-subtle pt-2 text-xs text-muted">
                      {entry.note}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-border-subtle px-4 py-8 text-center">
            <p className="text-sm text-muted">No price data yet for this item.</p>
          </div>
        )}
      </div>

      <BottomNav active="explore" />
    </main>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <h2 className="mb-3 mt-7 text-base font-semibold">{title}</h2>;
}
