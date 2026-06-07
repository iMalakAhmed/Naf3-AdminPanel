"use client";

import { useEffect, useState } from "react";

type AuthRole = "SuperAdmin" | "Admin" | string | null;

type AuthState = {
  role: AuthRole;
  email: string | null;
  token: string | null;
  isLoading: boolean;
};

export default function useAuthRole(): AuthState {
  const [role, setRole] = useState<AuthRole>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("naf3_admin_auth");
    if (!raw) {
      setIsLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        role?: string;
        email?: string;
        token?: string;
      };

      if (!parsed.token) {
        localStorage.removeItem("naf3_admin_auth");
        setRole(null);
        setEmail(null);
        setToken(null);
        return;
      }

      setRole(parsed.role ?? null);
      setEmail(parsed.email ?? null);
      setToken(parsed.token);
    } catch (err) {
      localStorage.removeItem("naf3_admin_auth");
      setRole(null);
      setEmail(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { role, email, token, isLoading };
}
