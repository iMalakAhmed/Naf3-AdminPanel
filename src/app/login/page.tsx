"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const DEFAULT_LOGIN_URL =
  "https://nafaa-frfve0gyfyatgzh0.uaenorth-01.azurewebsites.net/api/auth/admin/login";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const existing = localStorage.getItem("naf3_admin_auth");
    if (existing) {
      router.push("/admin/partners");
    }
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const loginUrl =
        process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL ?? DEFAULT_LOGIN_URL;
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data?.message ?? "Login failed. Check your credentials.");
        setIsLoading(false);
        return;
      }

      const token =
        data?.token ??
        data?.accessToken ??
        data?.data?.token ??
        data?.data?.accessToken ??
        null;
      localStorage.setItem(
        "naf3_admin_auth",
        JSON.stringify({ token, ...data })
      );

      router.push("/admin/partners");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-transparent px-6 py-12">
      <div className="absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[var(--brand-teal)]/25 blur-3xl animate-blob" />
        <div className="absolute -right-16 top-12 h-72 w-72 rounded-full bg-[var(--brand-gold)]/30 blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 left-1/3 h-80 w-80 rounded-full bg-[var(--brand-teal-soft)]/25 blur-3xl animate-blob animation-delay-4000" />
      </div>

      <div className="relative w-full max-w-md animate-fadeIn">
        <div className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[color:var(--surface-glass)] p-10 shadow-[0_30px_80px_-45px_rgba(12,31,42,0.6)] backdrop-blur">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--brand-teal)]/70 via-[var(--brand-teal-soft)]/70 to-[var(--brand-gold)]/80" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-[var(--brand-gold)]/25 blur-2xl" />
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-teal)] to-[var(--brand-teal-soft)] text-white">
              <span className="text-lg font-semibold">NA</span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Admin Access
              </p>
              <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Welcome back
              </h1>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-500">
            Sign in to manage partners, charities, users, and donations.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
                placeholder="admin@naf3.com"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="mt-2 w-full rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-2xl bg-[var(--brand-teal)] px-4 py-3 text-sm font-semibold text-white shadow-[0_22px_55px_-30px_rgba(11,107,103,0.7)] transition hover:shadow-[0_26px_60px_-28px_rgba(11,107,103,0.8)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="relative z-10">
                {isLoading ? "Signing in..." : "Sign in"}
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-teal-strong)] to-[var(--brand-teal-soft)] transition-transform duration-300 group-hover:translate-x-0" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
