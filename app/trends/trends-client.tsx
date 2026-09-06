"use client";

import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ExternalLink, Minus } from "lucide-react";
import { formatNaira } from "@/lib/format";
import { BottomNav } from "@/components/bottom-nav";
import type { ProductSummary } from "@/lib/types";
import {
  categoryLabel,
  formatMarketPrice,
  formatOpaindexDate,
  type OpaindexPrice,
} from "@/lib/opaindex";

export default function TrendsClient({
  products,
  marketPrices,
}: {
  products: ProductSummary[];
  marketPrices: OpaindexPrice[];
}) {
  const trackedWithData = products.filter((p) => p.latest_price_kobo !== null);
  const staleCount = trackedWithData.filter((p) => p.is_stale).length;

  const movers = [...marketPrices]
    .sort((a, b) => Math.abs(b.weekChangePercent) - Math.abs(a.weekChangePercent))
    .slice(0, 8);

  const rising = marketPrices.filter((p) => p.weekChangePercent > 0).length;
  const falling = marketPrices.filter((p) => p.weekChangePercent < 0).length;

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">Trends</h1>
            <p className="mt-1 text-xs text-muted">What is moving across the Nigerian market.</p>
          </div>
          <a
            href="https://opaindex.com/data/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-xs text-muted"
          >
            Source <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <StatTile value={marketPrices.length} label="Market Items" />
          <StatTile value={rising} label="Rising" accent="up" />
          <StatTile value={falling} label="Falling" accent="down" />
        </div>

        {marketPrices.length > 0 && (
          <>
            <h2 className="mb-3 mt-7 text-base font-semibold">Biggest Weekly Moves</h2>
            <div className="flex flex-col gap-2">
              {movers.map((price) => (
                <a
                  key={price.slug}
                  href={`https://opaindex.com/prices/${price.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-2xl bg-surface px-4 py-3.5 active:bg-surface-light"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{price.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        {categoryLabel(price.category)} · {price.unit}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <MoveIcon value={price.weekChangePercent} />
                      <span
                        className={`text-sm font-semibold ${
                          price.weekChangePercent > 0
                            ? "text-emerald-400"
                            : price.weekChangePercent < 0
                              ? "text-orange-400"
                              : "text-muted"
                        }`}
                      >
                        {price.weekChangePercent > 0 ? "+" : ""}
                        {price.weekChangePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted">
                    <span>{formatMarketPrice(price)}</span>
                    <span>{formatOpaindexDate(price.asOf)}</span>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        <h2 className="mb-3 mt-8 text-base font-semibold">MarketScope Tracked Data</h2>
        {trackedWithData.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-subtle p-5 text-center text-sm text-muted">
            Your tracked database has no price entries yet. The external market feed above is still available.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {trackedWithData.map((p) => (
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

        <div className="mt-6 rounded-2xl bg-surface px-4 py-3 text-xs leading-relaxed text-muted">
          <p className="font-medium text-foreground">Data note</p>
          <p className="mt-1">
            Opaindex provides sourced Nigerian price points with an as-of date and confidence score.
            MarketScope displays that provenance instead of presenting the feed as its own survey.
          </p>
        </div>

        {staleCount > 0 && (
          <p className="mt-3 text-center text-[11px] text-muted">
            {staleCount} MarketScope tracked {staleCount === 1 ? "item is" : "items are"} stale.
          </p>
        )}
      </div>

      <BottomNav active="trends" />
    </main>
  );
}

function MoveIcon({ value }: { value: number }) {
  if (value > 0) return <ArrowUpRight className="h-4 w-4 text-emerald-400" />;
  if (value < 0) return <ArrowDownRight className="h-4 w-4 text-orange-400" />;
  return <Minus className="h-4 w-4 text-muted" />;
}

function StatTile({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: "up" | "down";
}) {
  const accentClass =
    accent === "up"
      ? "text-emerald-400"
      : accent === "down"
        ? "text-orange-400"
        : "text-foreground";

  return (
    <div className="rounded-2xl bg-surface p-4 text-center">
      <p className={`text-2xl font-bold ${accentClass}`}>{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
