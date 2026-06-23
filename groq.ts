import Groq from "groq-sdk";

let client: Groq | null = null;

/**
 * Lazily-created Groq client. Reads the key from process.env so it is never
 * hardcoded or bundled into client-side code — this file must only be
 * imported from server-side code (API routes, server actions).
 */
export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error(
      "GROQ_API_KEY is not set. Add it to .env.local (and to your Vercel project env vars for production)."
    );
  }
  if (!client) {
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

/** Model used for entry-assist parsing. Fast + cheap, good for structured extraction. */
export const ENTRY_ASSIST_MODEL = "llama-3.3-70b-versatile";
