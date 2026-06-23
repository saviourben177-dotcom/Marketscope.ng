// Types shared between the entry-assist API route and the UI component.

export interface EntryAssistMatch {
  /** Matched row id from `products` or `locations`, null if no confident match. */
  id: string | null;
  /** The name Groq extracted from the raw text, before matching against the DB. */
  raw_text: string;
  /** Whether this field matched an existing DB row with high confidence. */
  matched: boolean;
}

export interface EntryAssistResult {
  product: EntryAssistMatch;
  location: EntryAssistMatch;
  /** Price in kobo (naira * 100), matching price_entries.price_kobo. */
  price_kobo: number | null;
  /** ISO date string (YYYY-MM-DD), matching price_entries.entry_date. */
  entry_date: string | null;
  /** Any extra context the curator typed (e.g. "heavy rainfall affected supply"). */
  note: string | null;
  /**
   * Overall confidence 0-100. Driven by the weakest of: product match,
   * location match, and whether a price + date were both extracted.
   */
  confidence: number;
  /** Set when a near-identical entry already exists for this product/location/date. */
  duplicate_warning: {
    existing_entry_id: string;
    existing_price_kobo: number;
  } | null;
  /** Set when the new price differs sharply from the most recent prior entry. */
  price_change_warning: {
    previous_price_kobo: number;
    percent_change: number;
  } | null;
}

export interface EntryAssistRequest {
  text: string;
}
