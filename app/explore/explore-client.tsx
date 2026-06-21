"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { BottomNav } from "@/components/bottom-nav";
import type { ProductSummary } from "@/lib/types";

export default function ExploreClient({ products }: { products: ProductSummary[] }) {
  const [query, setQuery] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="text-lg font-semibold">Explore Prices</h1>

        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5">
          <Search className="h-5 w-5 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for an item..."
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted">No items found.</p>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            {filtered.map((p) => (
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
        )}
      </div>

      <BottomNav active="explore" />
    </main>
  );
}
