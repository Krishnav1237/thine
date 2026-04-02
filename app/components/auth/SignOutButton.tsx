"use client";

import { useAuth } from "../../hooks/useAuth";

export default function SignOutButton() {
  const { signOut } = useAuth();

  return (
    <button
      className="btn-secondary"
      onClick={() => void signOut()}
      type="button"
    >
      Sign Out
    </button>
  );
}
