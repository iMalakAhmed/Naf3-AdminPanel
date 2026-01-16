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
      const response = await fetch("/api/auth/admin/login", {
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-4 py-10 text-zinc-900 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-96 w-96 animate-blob rounded-full bg-[var(--brand-teal)]/20 blur-3xl" />
        <div className="animation-delay-2000 absolute -right-28 -top-20 h-96 w-96 animate-blob rounded-full bg-[var(--brand-teal-soft)]/25 blur-3xl" />
        <div className="animation-delay-4000 absolute -bottom-24 left-12 h-96 w-96 animate-blob rounded-full bg-[var(--brand-gold)]/20 blur-3xl" />
        <div className="animation-delay-6000 absolute -bottom-24 -right-24 h-96 w-96 animate-blob rounded-full bg-[var(--brand-teal)]/15 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col overflow-hidden rounded-[28px] border border-[var(--brand-teal-soft)]/20 bg-white shadow-[0_30px_90px_-50px_rgba(0,107,106,0.5)] lg:flex-row">
        <section className="relative flex-1 bg-[linear-gradient(135deg,var(--brand-teal)_0%,var(--brand-teal-soft)_55%,var(--brand-gold)_120%)] p-8 text-white sm:p-10">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-6 top-10 h-36 w-36 rounded-full bg-white/30 blur-2xl" />
            <div className="absolute bottom-10 right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
          </div>
          <div className="relative z-10 space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-white/80">
              Naf3 Admin
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              Welcome back.
              <span className="block text-[var(--brand-gold)]">
                Oversee partners, charities, and donations.
              </span>
            </h1>
            <p className="text-sm text-white/85">
              Sign in to manage operations, monitor impact, and keep the
              platform running smoothly.
            </p>
            <div className="mt-8 space-y-3 text-sm text-white/85">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs">
                  01
                </span>
                Review approvals, requests, and platform activity.
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs">
                  02
                </span>
                Track partner performance and donation flows.
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs">
                  03
                </span>
                Use your admin credentials to access the console.
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 px-6 py-10 sm:px-10 sm:py-12">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--brand-teal)]">
              Admin Login
            </p>
            <h2 className="text-2xl font-semibold text-zinc-900">
              Sign in to the console
            </h2>
            <p className="text-sm text-zinc-500">
              Use your official Naf3 admin credentials.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block text-sm font-medium text-zinc-700">
              Email
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-teal-soft)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-teal-soft)]/20"
                placeholder="admin@naf3.com"
                required
              />
            </label>

            <label className="block text-sm font-medium text-zinc-700">
              Password
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-[var(--brand-teal-soft)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-teal-soft)]/20"
                placeholder="Enter your password"
                required
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-[var(--brand-teal)] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-[var(--brand-teal)]/30 transition hover:bg-[var(--brand-teal-soft)] disabled:cursor-not-allowed disabled:bg-[var(--brand-teal-soft)]/50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
