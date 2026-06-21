"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogOut, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatNaira, formatRelativeDate } from "@/lib/format";
import { BottomNav } from "@/components/bottom-nav";
import type { User } from "@supabase/supabase-js";

interface RecentEntry {
  id: string;
  price_kobo: number;
  entry_date: string;
  products: { name: string; unit: string } | null;
  locations: { state: string } | null;
}

export default function AdminPage() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentEntries, setRecentEntries] = useState<RecentEntry[]>([]);

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("price_entries")
      .select("id, price_kobo, entry_date, products(name, unit), locations(state)")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setRecentEntries((data as any) ?? []));
  }, [user]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError("Incorrect email or password.");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (user === undefined) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen flex-col bg-background px-5 pb-24 pt-16">
        <div className="mx-auto w-full max-w-md">
          <h1 className="text-2xl font-semibold">Curator Login</h1>
          <p className="mt-1 text-sm text-muted">Sign in to manage MarketScope prices.</p>

          <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl bg-surface px-4 py-3 text-sm text-foreground placeholder:text-muted focus:outline-none"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-xl bg-accent py-3 text-sm font-semibold text-background disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
        </div>
        <BottomNav active="profile" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md px-5 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold">Curator Account</h1>
            <p className="text-sm text-muted">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="rounded-full bg-surface p-2.5">
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        <Link
          href="/admin/add"
          className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-sm font-semibold text-background"
        >
          <Plus className="h-4 w-4" />
          Add Price
        </Link>

        <h2 className="mb-3 mt-7 text-base font-semibold">My Entries</h2>
        {recentEntries.length === 0 ? (
          <p className="text-sm text-muted">No entries yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {entry.products?.name} ({entry.products?.unit})
                  </p>
                  <p className="text-xs text-muted">
                    {entry.locations?.state} State · {formatRelativeDate(entry.entry_date)}
                  </p>
                </div>
                <p className="text-sm font-semibold text-accent">
                  {formatNaira(entry.price_kobo)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav active="profile" />
    </main>
  );
}
