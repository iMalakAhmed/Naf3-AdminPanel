"use client";

import { useEffect, useState } from "react";

type AuthRole = "SuperAdmin" | "Admin" | string | null;

type AuthState = {
  role: AuthRole;
  email: string | null;
  isLoading: boolean;
};

export default function useAuthRole(): AuthState {
  const [role, setRole] = useState<AuthRole>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("naf3_admin_auth");
    if (!raw) {
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { role?: string; email?: string };
      setRole(parsed.role ?? null);
      setEmail(parsed.email ?? null);
    } catch (err) {
      setRole(null);
      setEmail(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { role, email, isLoading };
}
