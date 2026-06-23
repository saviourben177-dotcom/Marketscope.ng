import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getGroqClient, ENTRY_ASSIST_MODEL } from "@/lib/groq";
import type { EntryAssistRequest, EntryAssistResult } from "@/lib/entry-assist-types";

// Service-role client so this route can read products/locations regardless
// of the curator's auth session. Never expose this key to the browser.
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface RawExtraction {
  product_name: string | null;
  state_name: string | null;
  price_naira: number | null;
  date_phrase: string | null; // e.g. "today", "yesterday", "2026-06-20"
  note: string | null;
}

/** Resolves "today" / "yesterday" / an ISO date into an ISO date string. */
function resolveDate(phrase: string | null): string | null {
  if (!phrase) return new Date().toISOString().slice(0, 10); // default: today
  const lower = phrase.trim().toLowerCase();
  const today = new Date();

  if (lower === "today" || lower === "") {
    return today.toISOString().slice(0, 10);
  }
  if (lower === "yesterday") {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }
  // If it already looks like an ISO date, trust it.
  if (/^\d{4}-\d{2}-\d{2}$/.test(lower)) return lower;

  return today.toISOString().slice(0, 10); // fallback
}

/** Simple case-insensitive fuzzy match: exact > startsWith > includes. */
function bestMatch<T extends { id: string; name: string }>(
  candidates: T[],
  rawName: string | null
): { row: T | null; confident: boolean } {
  if (!rawName) return { row: null, confident: false };
  const target = rawName.trim().toLowerCase();

  const exact = candidates.find((c) => c.name.toLowerCase() === target);
  if (exact) return { row: exact, confident: true };

  const startsWith = candidates.find((c) =>
    c.name.toLowerCase().startsWith(target)
  );
  if (startsWith) return { row: startsWith, confident: true };

  const includes = candidates.find(
    (c) =>
      c.name.toLowerCase().includes(target) ||
      target.includes(c.name.toLowerCase())
  );
  if (includes) return { row: includes, confident: false };

  return { row: null, confident: false };
}

export async function POST(req: NextRequest) {
  try {
    const { text } = (await req.json()) as EntryAssistRequest;

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "No text provided." }, { status: 400 });
    }

    const supabase = getServiceClient();
    const groq = getGroqClient();

    // 1. Pull reference lists Groq will match against. Small dataset (15/15)
    //    so loading both fully is cheap and keeps matching logic simple.
    const [{ data: products }, { data: locations }] = await Promise.all([
      supabase.from("products").select("id, name, unit"),
      supabase.from("locations").select("id, state"),
    ]);

    const productNames = (products ?? []).map((p) => p.name);
    const stateNames = (locations ?? []).map((l) => l.state);

    // 2. Ask Groq to extract structured fields from the free text.
    const completion = await groq.chat.completions.create({
      model: ENTRY_ASSIST_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You extract structured price-entry data from short Nigerian market-price notes written by a human curator.

Known products: ${productNames.join(", ")}
Known states: ${stateNames.join(", ")}

Rules:
- product_name: match to the closest known product name if possible, otherwise return the raw product mentioned.
- state_name: if the text names a city/market you recognize as being in a Nigerian state (e.g. "Wuse Market" -> "FCT", "Mile 12" -> "Lagos"), resolve it to the state. Otherwise return whatever state is mentioned, or null.
- price_naira: the price in naira as a plain number (no currency symbols, no commas).
- date_phrase: "today", "yesterday", an ISO date if one is given, or null if not mentioned.
- note: any extra context not captured above (e.g. weather, market conditions), or null.

Respond ONLY with a JSON object with exactly these keys: product_name, state_name, price_naira, date_phrase, note.`,
        },
        { role: "user", content: text },
      ],
    });

    const raw = JSON.parse(
      completion.choices[0]?.message?.content ?? "{}"
    ) as RawExtraction;

    // 3. Match extracted names against real DB rows.
    const productMatch = bestMatch(
      (products ?? []).map((p) => ({ id: p.id, name: p.name })),
      raw.product_name
    );
    const locationMatch = bestMatch(
      (locations ?? []).map((l) => ({ id: l.id, name: l.state })),
      raw.state_name
    );

    const price_kobo =
      raw.price_naira !== null && raw.price_naira > 0
        ? Math.round(raw.price_naira * 100)
        : null;
    const entry_date = resolveDate(raw.date_phrase);

    // 4. Confidence score: weakest signal wins.
    let confidence = 100;
    if (!productMatch.confident) confidence -= productMatch.row ? 25 : 45;
    if (!locationMatch.confident) confidence -= locationMatch.row ? 25 : 45;
    if (price_kobo === null) confidence -= 40;
    confidence = Math.max(0, Math.min(100, confidence));

    // 5. Duplicate detection: same product + location + date already exists?
    let duplicate_warning: EntryAssistResult["duplicate_warning"] = null;
    let price_change_warning: EntryAssistResult["price_change_warning"] = null;

    if (productMatch.row && locationMatch.row && entry_date) {
      const { data: existing } = await supabase
        .from("price_entries")
        .select("id, price_kobo")
        .eq("product_id", productMatch.row.id)
        .eq("location_id", locationMatch.row.id)
        .eq("entry_date", entry_date)
        .limit(1)
        .maybeSingle();

      if (existing) {
        duplicate_warning = {
          existing_entry_id: existing.id,
          existing_price_kobo: existing.price_kobo,
        };
      }

      // 6. Price-spike detection vs the most recent prior entry (any date).
      if (price_kobo !== null) {
        const { data: prior } = await supabase
          .from("price_entries")
          .select("price_kobo, entry_date")
          .eq("product_id", productMatch.row.id)
          .eq("location_id", locationMatch.row.id)
          .order("entry_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (prior && prior.price_kobo > 0) {
          const percent_change =
            ((price_kobo - prior.price_kobo) / prior.price_kobo) * 100;
          if (Math.abs(percent_change) >= 20) {
            price_change_warning = {
              previous_price_kobo: prior.price_kobo,
              percent_change: Math.round(percent_change * 10) / 10,
            };
          }
        }
      }
    }

    const result: EntryAssistResult = {
      product: {
        id: productMatch.row?.id ?? null,
        raw_text: raw.product_name ?? "",
        matched: productMatch.confident,
      },
      location: {
        id: locationMatch.row?.id ?? null,
        raw_text: raw.state_name ?? "",
        matched: locationMatch.confident,
      },
      price_kobo,
      entry_date,
      note: raw.note ?? null,
      confidence,
      duplicate_warning,
      price_change_warning,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error("entry-assist error:", err);
    return NextResponse.json(
      { error: "Failed to parse entry. Please use the manual form instead." },
      { status: 500 }
    );
  }
}
