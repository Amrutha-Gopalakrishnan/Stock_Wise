// src/supabaseClient.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// helper to get current user's id (works for supabase-js v2)
export async function getCurrentUserId() {
  try {
    const res = await supabase.auth.getUser();
    return res?.data?.user?.id ?? null;
  } catch (e) {
    console.warn("getCurrentUserId:", e);
    return null;
  }
}
