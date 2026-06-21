// Supabase project (separate from any Cursor-connected project).
// Values come from .env.local (gitignored). The anon key is safe to ship in a
// client app — access is governed by RLS — but we keep it out of source control.
// NEVER place the service_role key here or anywhere in the app bundle.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? ''

export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Missing Supabase config. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local',
  )
}

// Optional: powers the natural-language "smart search" in the Scout tab.
// WARNING: EXPO_PUBLIC_* keys are inlined into the client bundle and are
// extractable from the shipped app. Acceptable for this private 2-user app;
// for wider distribution, proxy OpenAI through a Supabase Edge Function and
// remove this key from the bundle. The smart search is simply disabled when
// the key is absent — the rest of the app is unaffected.
export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? ''
