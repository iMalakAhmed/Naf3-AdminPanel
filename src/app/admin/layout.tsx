"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidenav from "./components/Sidenav";
import useAuthRole from "./components/useAuthRole";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const { role, email, token, isLoading } = useAuthRole();

  useEffect(() => {
    if (!isLoading && !token) {
      router.replace("/login");
    }
  }, [isLoading, token, router]);

  const handleLogout = () => {
    localStorage.removeItem("naf3_admin_auth");
    document.cookie = "naf3_admin_token=; path=/; max-age=0; samesite=lax";
    router.replace("/login");
  };

  if (isLoading || !token) {
    return null;
  }

  return (
    <div className="min-h-screen bg-transparent">
      <Sidenav
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen((o) => !o)}
        role={role}
        email={email}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={`min-h-screen transition-[padding] duration-300 ease-in-out ${
          isOpen ? "lg:pl-[315px]" : "lg:pl-24"
        }`}
      >
        <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:px-8">
          <header className="relative flex flex-wrap items-center gap-3 overflow-hidden rounded-2xl border border-[var(--outline)] bg-[color:var(--surface-glass)] px-4 py-4 shadow-[var(--shadow-soft)] backdrop-blur transition-all duration-300 hover:shadow-[0_30px_80px_-50px_rgba(12,31,42,0.55)] sm:rounded-[28px] sm:px-6 sm:py-6">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--brand-teal)]/80 via-[var(--brand-teal-soft)]/80 to-[var(--brand-gold)]/80" />
            <div className="pointer-events-none absolute -left-24 top-10 h-32 w-32 rounded-full bg-[var(--brand-teal)]/15 blur-2xl" />
            {/* Hamburger — mobile only */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              title="Open menu"
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <div className="relative min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Admin Panel
              </p>
              <h1 className="font-display mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:mt-2 sm:text-3xl">
                Naf3 Operations Console
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-[var(--brand-teal)]/10 px-3 py-1.5 font-semibold text-[var(--brand-teal)] shadow-sm transition-all hover:bg-[var(--brand-teal)]/15">
                  {role ?? "Unknown role"}
                </span>
                {email && (
                  <span className="hidden text-slate-600 sm:inline">{email}</span>
                )}
              </div>
            </div>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
