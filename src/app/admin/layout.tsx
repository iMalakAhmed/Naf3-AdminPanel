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
  const router = useRouter();
  const { role, email, isLoading } = useAuthRole();

  useEffect(() => {
    if (!isLoading && !role) {
      router.push("/login");
    }
  }, [isLoading, role, router]);

  const handleLogout = () => {
    localStorage.removeItem("naf3_admin_auth");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-transparent">
      <Sidenav
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen((o) => !o)}
        role={role}
      />
      <div
        className={`min-h-screen transition-[padding] duration-300 ease-in-out ${
          isOpen ? "pl-64" : "pl-20"
        }`}
      >
        <div className="mx-auto flex min-h-screen max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <header className="relative flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-[28px] border border-[var(--outline)] bg-[color:var(--surface-glass)] px-6 py-6 shadow-[var(--shadow-soft)] backdrop-blur transition-all duration-300 hover:shadow-[0_30px_80px_-50px_rgba(12,31,42,0.55)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--brand-teal)]/80 via-[var(--brand-teal-soft)]/80 to-[var(--brand-gold)]/80" />
            <div className="pointer-events-none absolute -left-24 top-10 h-32 w-32 rounded-full bg-[var(--brand-teal)]/15 blur-2xl" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Admin Panel
              </p>
              <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Naf3 Operations Console
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-[var(--brand-teal)]/10 px-3 py-1.5 font-semibold text-[var(--brand-teal)] shadow-sm transition-all hover:bg-[var(--brand-teal)]/15">
                  {role ?? "Unknown role"}
                </span>
                {email && <span className="text-slate-600">{email}</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[var(--brand-teal)]/40 bg-white/70 px-5 py-2.5 text-sm font-semibold text-[var(--brand-ink)] shadow-sm transition-all duration-200 hover:border-[var(--brand-teal)] hover:bg-white hover:text-[var(--brand-teal-strong)] hover:shadow-md"
            >
              Log out
            </button>
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
