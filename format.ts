/**
 * Converts integer kobo to a formatted Naira string, e.g. 8500000 -> "₦85,000"
 * Always rounds to whole naira for display (kobo precision is stored, not shown,
 * since no v1 product needs sub-naira display granularity).
 */
export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  return `₦${naira.toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;
}

/**
 * Converts a naira amount (e.g. from a form input, "85000") to integer kobo for storage.
 */
export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Computes whether a product's most recent entry is stale, based on its
 * category-specific threshold. Pure function — no DB call, used at render time.
 */
export function computeStaleness(
  lastUpdatedDate: string | null,
  thresholdDays: number
): { isStale: boolean; daysSince: number | null } {
  if (!lastUpdatedDate) return { isStale: true, daysSince: null };

  const last = new Date(lastUpdatedDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const daysSince = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return { isStale: daysSince > thresholdDays, daysSince };
}

export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}
