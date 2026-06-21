"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { nairaToKobo } from "@/lib/format";
import type { User } from "@supabase/supabase-js";
import type { Product as ProductType, Location as LocationType } from "@/lib/types";

type Step = 1 | 2 | 3;

export default function AddPricePage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [step, setStep] = useState<Step>(1);
  const [products, setProducts] = useState<ProductType[]>([]);
  const [locations, setLocations] = useState<LocationType[]>([]);

  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [priceNaira, setPriceNaira] = useState("");
  const [selectedLocationId, setSelectedLocationId] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("products")
      .select("id, name, category, unit, staleness_threshold_days, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("name")
      .then(({ data }) => setProducts((data as any) ?? []));
    supabase
      .from("locations")
      .select("id, state, is_fct, geopolitical_zone, created_at")
      .order("state")
      .then(({ data }) => setLocations((data as any) ?? []));
  }, [user]);

  if (user === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background px-5">
        <p className="text-sm text-muted">You must be signed in to add a price.</p>
        <button
          onClick={() => router.push("/admin")}
          className="mt-4 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-background"
        >
          Go to login
        </button>
      </main>
    );
  }

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase())
  );

  const priceValid = (() => {
    const n = Number(priceNaira);
    return Number.isFinite(n) && n > 0;
  })();

  async function handleSubmit() {
    if (!selectedProduct || !selectedLocationId || !priceValid) return;
    setSubmitting(true);
    setSubmitError(null);

    const { error } = await supabase.from("price_entries").insert({
      product_id: selectedProduct.id,
      location_id: selectedLocationId,
      price_kobo: nairaToKobo(Number(priceNaira)),
      note: note.trim() || null,
    });

    setSubmitting(false);

    if (error) {
      setSubmitError("Couldn't save this entry. Please try again.");
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setStep(1);
      setSelectedProduct(null);
      setPriceNaira("");
      setSelectedLocationId("");
      setNote("");
      setSearch("");
    }, 1800);
  }

  const selectedLocation = locations.find((l) => l.id === selectedLocationId);

  return (
    <main className="min-h-screen bg-background px-5 pb-12 pt-6">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Add Price</h1>
          <button onClick={() => router.push("/admin")} className="rounded-full bg-surface p-2">
            <X className="h-4 w-4" />
          </button>
        </div>

        <StepIndicator step={step} />

        {submitted && (
          <div className="mt-4 rounded-xl bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300">
            Price submitted successfully.
          </div>
        )}

        {step === 1 && (
          <div className="mt-5">
            <h2 className="mb-3 text-sm font-medium text-muted">Select Item</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search or select an item"
              className="w-full rounded-xl bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
            <div className="mt-4 flex flex-col gap-2">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProduct(p);
                    setStep(2);
                  }}
                  className="flex items-center justify-between rounded-xl bg-surface px-4 py-3.5 text-left active:bg-surface-light"
                >
                  <span className="text-sm">
                    {p.name} <span className="text-muted">({p.unit})</span>
                  </span>
                  <ChevronLeft className="h-4 w-4 rotate-180 text-muted" />
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="py-4 text-center text-sm text-muted">No matching items.</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && selectedProduct && (
          <div className="mt-5">
            <div className="flex items-center justify-between rounded-xl bg-surface px-4 py-3">
              <span className="text-sm">
                {selectedProduct.name} ({selectedProduct.unit})
              </span>
              <button onClick={() => setStep(1)} className="text-xs text-accent">
                Change
              </button>
            </div>

            <label className="mt-5 block text-sm font-medium text-muted">Enter Price (in Naira)</label>
            <input
              type="number"
              inputMode="decimal"
              value={priceNaira}
              onChange={(e) => setPriceNaira(e.target.value)}
              placeholder="₦ 0"
              className="mt-2 w-full rounded-xl bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
            />

            <label className="mt-5 block text-sm font-medium text-muted">Location</label>
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="mt-2 w-full rounded-xl bg-surface px-4 py-3 text-sm text-foreground focus:outline-none"
            >
              <option value="">Select a state</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.state} {loc.is_fct ? "(FCT)" : "State"}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-sm font-medium text-muted">Note (Optional)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              placeholder="Why is the price what it is? e.g. high demand, fuel scarcity..."
              rows={3}
              className="mt-2 w-full rounded-xl bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-muted">{note.length}/500</p>

            <button
              disabled={!priceValid || !selectedLocationId}
              onClick={() => setStep(3)}
              className="mt-4 w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-background disabled:opacity-40"
            >
              Continue
            </button>
          </div>
        )}

        {step === 3 && selectedProduct && selectedLocation && (
          <div className="mt-5">
            <h2 className="mb-3 text-sm font-medium text-muted">Review Your Entry</h2>
            <div className="rounded-2xl bg-surface p-4">
              <ReviewRow label="Item" value={`${selectedProduct.name} (${selectedProduct.unit})`} />
              <ReviewRow label="Price" value={`₦${Number(priceNaira).toLocaleString()}`} />
              <ReviewRow
                label="Location"
                value={`${selectedLocation.state} ${selectedLocation.is_fct ? "(FCT)" : "State"}`}
              />
              {note && <ReviewRow label="Note" value={note} />}
            </div>

            {submitError && <p className="mt-3 text-sm text-red-400">{submitError}</p>}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-4 w-full rounded-xl bg-accent py-3.5 text-sm font-semibold text-background disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit Price"}
            </button>
            <button
              onClick={() => setStep(2)}
              className="mt-2 w-full rounded-xl py-3 text-sm text-muted"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const labels = ["Item", "Details", "Review"];
  return (
    <div className="mt-5 flex items-center justify-between">
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                active || done ? "bg-accent text-background" : "bg-surface text-muted"
              }`}
            >
              {n}
            </div>
            <span className={`text-xs ${active ? "text-foreground" : "text-muted"}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border-subtle py-2 last:border-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
