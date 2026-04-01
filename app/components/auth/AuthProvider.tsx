"use client";

import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useState,
} from "react";

import { capturePostHogEvent } from "../../lib/posthog";
import { migrateLocalDataToSupabase } from "../../lib/supabase/migrate";
import {
  ensureProfileRow,
  fetchProfile,
} from "../../lib/supabase/sync";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import type { ProfileRow } from "../../lib/supabase/types";

const PENDING_AUTH_KEY = "thine-auth-complete-pending";
const PENDING_AUTH_TTL_MS = 15 * 60 * 1000;

interface AuthCredentials {
  email?: string;
  password?: string;
  username?: string;
  displayName?: string;
  provider?: "google";
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  loading: boolean;
  isAnonymous: boolean;
  signIn: (credentials: AuthCredentials) => Promise<{ error?: string }>;
  signUp: (credentials: AuthCredentials) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function hydrateUserState({
  nextSession,
  setSession,
  setUser,
  setProfile,
  setLoading,
}: {
  nextSession: Session | null;
  setSession: (value: Session | null) => void;
  setUser: (value: User | null) => void;
  setProfile: (value: ProfileRow | null) => void;
  setLoading: (value: boolean) => void;
}): Promise<void> {
  setSession(nextSession);
  setUser(nextSession?.user ?? null);

  if (!nextSession?.user) {
    setProfile(null);
    setLoading(false);
    return;
  }

  try {
    const ensured = await ensureProfileRow({
      user: nextSession.user,
    });

    setProfile(ensured ?? (await fetchProfile(nextSession.user.id)));
    await migrateLocalDataToSupabase(nextSession.user.id);
  } catch {
    setProfile(await fetchProfile(nextSession.user.id));
  } finally {
    if (typeof window !== "undefined") {
      const pendingRaw = window.localStorage.getItem(PENDING_AUTH_KEY);

      if (pendingRaw) {
        try {
          const pending = JSON.parse(pendingRaw) as {
            method?: "google";
            createdAt?: number;
          };
          const isFresh =
            pending.method === "google" &&
            typeof pending.createdAt === "number" &&
            Date.now() - pending.createdAt < PENDING_AUTH_TTL_MS;

          if (isFresh) {
            capturePostHogEvent("auth_completed", { method: "google" });
          }
        } catch {
          // Ignore malformed analytics state and continue.
        } finally {
          window.localStorage.removeItem(PENDING_AUTH_KEY);
        }
      }
    }

    setLoading(false);
  }
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const initialSupabase = getSupabaseBrowserClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(Boolean(initialSupabase));

  useEffect(() => {
    const supabase = initialSupabase;

    if (!supabase) {
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(
      ({ data }: { data: { session: Session | null } }) => {
      if (!active) {
        return;
      }

      void hydrateUserState({
        nextSession: data.session,
        setSession,
        setUser,
        setProfile,
        setLoading,
      });
      }
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, nextSession: Session | null) => {
      startTransition(() => {
        void hydrateUserState({
          nextSession,
          setSession,
          setUser,
          setProfile,
          setLoading,
        });
      });
      }
    );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [initialSupabase]);

  const signIn = async ({ email, password, provider }: AuthCredentials) => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { error: "Supabase is not configured yet." };
    }

    try {
      if (provider === "google") {
        const safeRedirect = window.location.origin + window.location.pathname;
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: safeRedirect,
          },
        });

        if (error) {
          return { error: error.message };
        }

        return {};
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: email ?? "",
        password: password ?? "",
      });

      if (error) {
        return { error: error.message };
      }

      return {};
    } catch {
      return { error: "We couldn't sign you in right now." };
    }
  };

  const signUp = async ({
    email,
    password,
    username,
    displayName,
    provider,
  }: AuthCredentials) => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return { error: "Supabase is not configured yet." };
    }

    try {
      if (provider === "google") {
        return signIn({ provider: "google" });
      }

      const { data, error } = await supabase.auth.signUp({
        email: email ?? "",
        password: password ?? "",
        options: {
          data: {
            username,
            display_name: displayName || username,
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user) {
        await ensureProfileRow({
          user: data.user,
          username,
          displayName: displayName || username,
        });
      }

      return {};
    } catch {
      return { error: "We couldn't create your account right now." };
    }
  };

  const signOut = async () => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }

    setProfile(await fetchProfile(user.id));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAnonymous: !user,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
