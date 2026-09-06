"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ExternalLink, Database } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { BottomNav } from "@/components/bottom-nav";
import type { ProductSummary } from "@/lib/types";
import {
  categoryLabel,
  formatMarketPrice,
  formatOpaindexDate,
  type OpaindexPrice,
} from "@/lib/opaindex";

const categories = ["All", "Food Staples", "Agriculture", "Energy", "Building Materials"] as const;

type CategoryFilter = (typeof categories)[number];

export default function ExploreClient({
  products,
  marketPrices,
}: {
  products: ProductSummary[];
  marketPrices: OpaindexPrice[];
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");

  const filteredMarketPrices = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return marketPrices.filter((price) => {
      const matchesQuery =
        !normalizedQuery ||
        price.name.toLowerCase().includes(normalizedQuery) ||
        price.market.toLowerCase().includes(normalizedQuery) ||
        price.category.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        category === "All" || categoryLabel(price.category) === category;

      return matchesQuery && matchesCategory;
    });
  }, [category, marketPrices, query]);

  const filteredLocal = products.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Explore Prices</h1>
            <p className="mt-1 text-xs text-muted">Nigerian market data, searchable in one place.</p>
          </div>
          <div className="rounded-xl bg-surface p-2 text-accent" title="External market feed">
            <Database className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5">
          <Search className="h-5 w-5 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search rice, cement, petrol..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`whitespace-nowrap rounded-full px-3 py-2 text-xs transition ${
                category === item
                  ? "bg-accent text-background"
                  : "bg-surface text-muted"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-7 flex items-end justify-between">
          <div>
            <h2 className="text-base font-semibold">Market Feed</h2>
            <p className="mt-1 text-xs text-muted">
              {filteredMarketPrices.length} Nigerian price points
            </p>
          </div>
          <a
            href="https://opaindex.com/data/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-muted"
          >
            Opaindex <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {filteredMarketPrices.length === 0 ? (
          <p className="mt-5 rounded-2xl border border-dashed border-border-subtle p-5 text-center text-sm text-muted">
            No market prices match that search.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            {filteredMarketPrices.map((price) => (
              <a
                key={price.slug}
                href={`https://opaindex.com/prices/${price.slug}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl bg-surface px-4 py-3.5 transition hover:bg-surface-light active:bg-surface-light"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{price.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {price.market} · {price.unit}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-accent">
                    {formatMarketPrice(price)}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                  <span>
                    {price.dayChangePercent > 0 ? "+" : ""}
                    {price.dayChangePercent.toFixed(1)}% today
                  </span>
                  <span>{formatOpaindexDate(price.asOf)}</span>
                </div>
              </a>
            ))}
          </div>
        )}

        {filteredLocal.length > 0 && (
          <>
            <h2 className="mb-3 mt-8 text-base font-semibold">MarketScope Tracked Items</h2>
            <div className="flex flex-col gap-2">
              {filteredLocal.map((p) => (
                <Link
                  key={p.id}
                  href={`/product/${p.id}`}
                  className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3.5 active:bg-surface-light"
                >
                  <p className="text-sm font-medium">
                    {p.name} <span className="text-muted">({p.unit})</span>
                  </p>
                  <p className="text-sm font-semibold text-accent">
                    {p.latest_price_kobo !== null ? formatNaira(p.latest_price_kobo) : "—"}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}

        <p className="mt-6 text-center text-[11px] leading-relaxed text-muted">
          External Nigerian market prices are provided by Opaindex. Prices include their source,
          date and confidence information. MarketScope does not present them as its own measurements.
        </p>
      </div>

      <BottomNav active="explore" />
    </main>
  );
}
