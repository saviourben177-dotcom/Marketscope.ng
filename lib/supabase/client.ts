import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-side Supabase client. Required because this app uses `output: "export"`
 * (fully static, for Netlify drag-and-drop deploy with no server) — all data
 * fetching happens client-side, in the browser, after the static HTML loads.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
