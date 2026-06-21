import Link from "next/link";
import { Search, Leaf, Flame, Building2 } from "lucide-react";
import { getProductSummaries } from "@/lib/queries";
import { formatNaira, formatRelativeDate } from "@/lib/format";
import { BottomNav } from "@/components/bottom-nav";
import { CATEGORY_LABELS } from "@/lib/types";

export const revalidate = 0;

export default async function HomePage() {
  const products = await getProductSummaries();

  const withData = products.filter((p) => p.latest_price_kobo !== null);
  const popular = withData.slice(0, 4);
  const recentlyUpdated = [...withData]
    .filter((p) => p.last_updated)
    .sort((a, b) => (b.last_updated! > a.last_updated! ? 1 : -1))
    .slice(0, 3);

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="text-2xl font-semibold">Hello 👋</h1>
        <p className="mt-1 text-sm text-muted">Check real prices across Nigeria</p>

        <Link
          href="/explore"
          className="mt-5 flex items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 text-muted"
        >
          <Search className="h-5 w-5" />
          <span className="text-sm">Search for an item...</span>
        </Link>

        <SectionHeader title="Popular Right Now" href="/explore" />
        {popular.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {popular.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="rounded-2xl bg-surface p-3.5 active:bg-surface-light"
              >
                <p className="truncate text-sm text-muted">{p.name} ({p.unit})</p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {formatNaira(p.latest_price_kobo!)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyHint text="No prices entered yet. Add your first price to get started." />
        )}

        <SectionHeader title="Browse by Category" />
        <div className="grid grid-cols-3 gap-3">
          <CategoryTile
            href="/category/food"
            icon={<Leaf className="h-6 w-6 text-emerald-400" />}
            label={CATEGORY_LABELS.food}
          />
          <CategoryTile
            href="/category/fuel_energy"
            icon={<Flame className="h-6 w-6 text-orange-400" />}
            label={CATEGORY_LABELS.fuel_energy}
          />
          <CategoryTile
            href="/category/building_materials"
            icon={<Building2 className="h-6 w-6 text-purple-400" />}
            label={CATEGORY_LABELS.building_materials}
          />
        </div>

        <SectionHeader title="Recently Updated" href="/trends" />
        {recentlyUpdated.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentlyUpdated.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 active:bg-surface-light"
              >
                <div>
                  <p className="text-sm font-medium">{p.name} ({p.unit})</p>
                  <p className="text-xs text-muted">{formatRelativeDate(p.last_updated!)}</p>
                </div>
                <p className="text-sm font-semibold text-accent">
                  {formatNaira(p.latest_price_kobo!)}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyHint text="Updates will show here once prices are added." />
        )}
      </div>

      <BottomNav active="home" />
    </main>
  );
}

function SectionHeader({ title, href }: { title: string; href?: string }) {
  return (
    <div className="mb-3 mt-7 flex items-center justify-between">
      <h2 className="text-base font-semibold">{title}</h2>
      {href && (
        <Link href={href} className="text-xs text-muted">
          View all
        </Link>
      )}
    </div>
  );
}

function CategoryTile({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-2xl bg-surface py-4 active:bg-surface-light"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-light">
        {icon}
      </div>
      <span className="text-center text-xs leading-tight text-muted">{label}</span>
    </Link>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border-subtle px-4 py-5 text-center text-sm text-muted">
      {text}
    </div>
  );
}
