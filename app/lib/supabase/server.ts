import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import type { Database } from "./types";

function getSupabaseEnv(): {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  configured: boolean;
} {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE ??
    "";

  return {
    url,
    anonKey,
    serviceRoleKey,
    configured: Boolean(url && anonKey),
  };
}

export async function getSupabaseServerClient(): Promise<SupabaseClient<Database> | null> {
  const env = getSupabaseEnv();

  if (!env.configured) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(
            ({ name, value, options }: { name: string; value: string; options: CookieOptions }) => {
              cookieStore.set(name, value, options);
            }
          );
        } catch {
          // Server components can read cookies without being able to write them.
        }
      },
    },
  });
}

export function getSupabaseAdminClient(): SupabaseClient<Database> | null {
  const env = getSupabaseEnv();

  if (!env.url || !env.serviceRoleKey) {
    return null;
  }

  return createClient<Database>(env.url, env.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
