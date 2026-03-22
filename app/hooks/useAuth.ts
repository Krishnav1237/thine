"use client";

import { useAuthContext } from "../components/auth/AuthProvider";

export function useAuth(): ReturnType<typeof useAuthContext> & { isLoggedIn: boolean } {
  const auth = useAuthContext();

  return {
    user: auth.user,
    session: auth.session,
    profile: auth.profile,
    loading: auth.loading,
    isAnonymous: auth.isAnonymous,
    isLoggedIn: Boolean(auth.user),
    signIn: auth.signIn,
    signUp: auth.signUp,
    signOut: auth.signOut,
    refreshProfile: auth.refreshProfile,
  };
}
