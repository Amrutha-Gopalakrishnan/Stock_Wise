// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import { createMockSupabaseClient, mockSupabaseMeta } from "@/lib/mockSupabaseClient";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn("Supabase credentials missing. Running in offline mock mode.");
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createMockSupabaseClient();

export const isSupabaseMock = !isConfigured;

// helper to get current user's id (works for supabase-js v2 + mock)
export async function getCurrentUserId() {
  try {
    if (isSupabaseMock) {
      return mockSupabaseMeta.staffUserId;
    }
    const res = await supabase.auth.getUser();
    return res?.data?.user?.id ?? null;
  } catch (e) {
    console.warn("getCurrentUserId:", e);
    return null;
  }
}
