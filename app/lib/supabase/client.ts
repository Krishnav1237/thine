"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "./types";

let browserClient: SupabaseClient<Database> | null = null;

function getSupabaseEnv(): {
  url: string;
  anonKey: string;
  configured: boolean;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return {
    url,
    anonKey,
    configured: Boolean(url && anonKey),
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseEnv().configured;
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  const env = getSupabaseEnv();

  if (!env.configured || typeof window === "undefined") {
    return null;
  }

  browserClient ??= createBrowserClient<Database>(env.url, env.anonKey);
  return browserClient;
}
