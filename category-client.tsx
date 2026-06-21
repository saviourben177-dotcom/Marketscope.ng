"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { BottomNav } from "@/components/bottom-nav";
import { CATEGORY_LABELS, type ProductCategory, type ProductSummary } from "@/lib/types";

export default function CategoryClient({
  category,
  products,
}: {
  category: ProductCategory;
  products: ProductSummary[];
}) {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="rounded-full bg-surface p-2">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold">{CATEGORY_LABELS[category]}</h1>
        </div>

        {products.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted">No items in this category yet.</p>
        ) : (
          <div className="mt-5 flex flex-col gap-2">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      <BottomNav active="explore" />
    </main>
  );
}
