"use client";

import { useState } from "react";
import { Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatNaira } from "@/lib/format";
import type { EntryAssistResult } from "@/lib/entry-assist-types";

interface ProductOption {
  id: string;
  name: string;
  unit: string;
}
interface LocationOption {
  id: string;
  state: string;
}

/**
 * Drop this above the existing manual admin form. On a successful parse it
 * calls onApply with the matched ids + values so the parent form's existing
 * state setters can be reused — this component never saves directly.
 */
export function EntryAssistInput({
  products,
  locations,
  onApply,
}: {
  products: ProductOption[];
  locations: LocationOption[];
  onApply: (result: {
    productId: string | null;
    locationId: string | null;
    priceKobo: number | null;
    entryDate: string | null;
    note: string | null;
  }) => void;
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EntryAssistResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleParse() {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/entry-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setResult(data as EntryAssistResult);
    } catch {
      setError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleConfirm() {
    if (!result) return;
    onApply({
      productId: result.product.id,
      locationId: result.location.id,
      priceKobo: result.price_kobo,
      entryDate: result.entry_date,
      note: result.note,
    });
    setResult(null);
    setText("");
  }

  const productName =
    products.find((p) => p.id === result?.product.id)?.name ??
    result?.product.raw_text;
  const locationName =
    locations.find((l) => l.id === result?.location.id)?.state ??
    result?.location.raw_text;

  return (
    <div className="rounded-2xl bg-surface p-4">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Sparkles className="h-4 w-4 text-accent" />
        Quick Entry
      </div>
      <p className="mt-1 text-xs text-muted">
        Type it naturally, e.g. &ldquo;Rice 50kg, Wuse Market Abuja, ₦92,000 today&rdquo;
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Describe the price entry..."
        rows={2}
        className="mt-3 w-full resize-none rounded-xl bg-surface-light px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none"
      />

      <button
        onClick={handleParse}
        disabled={loading || !text.trim()}
        className="mt-2 w-full rounded-xl bg-accent py-2.5 text-sm font-semibold text-background disabled:opacity-50"
      >
        {loading ? "Parsing…" : "Parse Entry"}
      </button>

      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      {result && (
        <div className="mt-3 rounded-xl border border-border-subtle bg-surface-light p-3">
          <ConfidenceBadge confidence={result.confidence} />

          <div className="mt-2 space-y-1 text-sm">
            <Row label="Product" value={productName || "—"} unmatched={!result.product.matched} />
            <Row label="State" value={locationName ? `${locationName} State` : "—"} unmatched={!result.location.matched} />
            <Row
              label="Price"
              value={result.price_kobo !== null ? formatNaira(result.price_kobo) : "—"}
              unmatched={result.price_kobo === null}
            />
            <Row label="Date" value={result.entry_date ?? "—"} />
            {result.note && <Row label="Note" value={result.note} />}
          </div>

          {result.duplicate_warning && (
            <Warning>
              Similar entry already exists for this product/state/date at{" "}
              {formatNaira(result.duplicate_warning.existing_price_kobo)}.
              Saving will add a second entry.
            </Warning>
          )}

          {result.price_change_warning && (
            <Warning>
              {result.price_change_warning.percent_change > 0 ? "Increase" : "Drop"} of{" "}
              {Math.abs(result.price_change_warning.percent_change)}% vs last recorded price (
              {formatNaira(result.price_change_warning.previous_price_kobo)}). Double-check
              before saving.
            </Warning>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={!result.product.id || !result.location.id || result.price_kobo === null}
              className="flex-1 rounded-xl bg-accent py-2 text-sm font-semibold text-background disabled:opacity-40"
            >
              Use These Values
            </button>
            <button
              onClick={() => setResult(null)}
              className="rounded-xl bg-surface px-4 py-2 text-sm text-muted"
            >
              Discard
            </button>
          </div>
          {(!result.product.id || !result.location.id || result.price_kobo === null) && (
            <p className="mt-2 text-xs text-muted">
              Some fields couldn&rsquo;t be matched confidently — fill the rest in manually below.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value, unmatched }: { label: string; value: string; unmatched?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{label}</span>
      <span className={unmatched ? "text-orange-400" : "text-foreground"}>{value}</span>
    </div>
  );
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-lg bg-orange-950/40 px-3 py-2 text-xs text-orange-300">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const color =
    confidence >= 80 ? "text-green-400" : confidence >= 50 ? "text-yellow-400" : "text-red-400";
  const dot = confidence >= 80 ? "🟢" : confidence >= 50 ? "🟡" : "🔴";
  return (
    <div className={`flex items-center gap-1.5 text-xs font-medium ${color}`}>
      {confidence >= 80 ? <CheckCircle2 className="h-3.5 w-3.5" /> : <span>{dot}</span>}
      {confidence}% confidence
    </div>
  );
}
