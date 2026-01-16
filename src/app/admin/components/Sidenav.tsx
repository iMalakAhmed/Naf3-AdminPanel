"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  key: "partners" | "charities" | "users" | "recipients" | "transactions";
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactNode;
  superAdminOnly?: boolean;
};

const navItems: NavItem[] = [
  {
    key: "partners",
    href: "/admin/partners",
    label: "Partners",
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          d="M16 11a3 3 0 1 0-2.99-3 3 3 0 0 0 2.99 3Zm-8 0a3 3 0 1 0-2.99-3A3 3 0 0 0 8 11Zm0 2c-2.76 0-5 1.79-5 4v2h10v-2c0-2.21-2.24-4-5-4Zm8 0a6.7 6.7 0 0 0-2.2.37 4.88 4.88 0 0 1 1.2 3.63v2h8v-2c0-2.21-3.13-4-7-4Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "charities",
    href: "/admin/charities",
    label: "Charities",
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          d="M12 20s-7-4.2-7-10a4.5 4.5 0 0 1 8-2.4A4.5 4.5 0 0 1 21 10c0 5.8-7 10-9 10Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "users",
    href: "/admin/users",
    label: "Donors",
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          d="M16.8 6.5a2.8 2.8 0 1 0-5.6 0c0 1.55 1.25 2.8 2.8 2.8s2.8-1.25 2.8-2.8ZM5 20v-1.1c0-2.4 3.6-4.2 7.1-4.2 1.2 0 2.5.2 3.6.7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.6 13.2a2.8 2.8 0 1 0 0 5.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.6 18.8c2.1-1.2 3.4-3.1 3.4-5.6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "recipients",
    href: "/admin/recipients",
    label: "Recipients",
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          d="M12 4a3 3 0 1 1-3 3 3 3 0 0 1 3-3Zm-7 15v-1.2c0-2.5 3.9-4.5 7-4.5s7 2 7 4.5V19"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="m19 6 1.4 1.4L22 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    key: "transactions",
    href: "/admin/transactions",
    label: "Transactions",
    icon: ({ className }) => (
      <svg viewBox="0 0 24 24" className={className} aria-hidden>
        <path
          d="M4 8h10m0 0-2.5-2.5M14 8l-2.5 2.5M20 16H10m0 0 2.5-2.5M10 16l2.5 2.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

type SidenavProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
  role: string | null;
};

export default function Sidenav({ isOpen, toggleSidebar, role }: SidenavProps) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 start-0 z-20 h-screen overflow-hidden py-8 text-white
        bg-gradient-to-b from-[var(--brand-teal-strong)] via-[var(--brand-teal)] to-[#0a4c4a]
        shadow-[0_30px_80px_-50px_rgba(0,60,58,0.8)]
        transition-[width] duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-20"}
      `}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,_rgba(25,187,182,0.35),_transparent_55%)] opacity-80" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_85%,_rgba(255,192,18,0.2),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-gold)]/60 via-white/40 to-[var(--brand-teal-soft)]/70" />
      <div className="flex items-center justify-between px-8 py-7 border-b border-white/10">
        {isOpen && (
          <div
            className={`font-display overflow-hidden text-lg font-semibold tracking-[0.3em] text-white/90
              transition-all duration-300
              ${isOpen ? "opacity-100 max-w-[120px]" : "opacity-0 max-w-0"}
            `}
          >
            NAF3
          </div>
        )}
        <button
          type="button"
          onClick={toggleSidebar}
          title="Toggle sidebar"
          className="rounded-xl border border-white/15 bg-white/10 p-2 text-white/90 transition-all duration-200 hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
            <path
              fill="currentColor"
              d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h10v2H4v-2Z"
            />
          </svg>
        </button>
      </div>

      <nav className="relative flex-1">
        {navItems
          .filter((item) => (item.superAdminOnly ? role === "SuperAdmin" : true))
          .map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`relative mx-3 my-1 flex items-center gap-x-3 rounded-2xl px-5 py-3 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-gradient-to-r from-white/25 to-white/10 text-white shadow-lg"
                  : "text-white/85 hover:bg-white/12 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute start-0 top-0 h-full w-1.5 rounded-r-full bg-[var(--brand-gold)] shadow-[0_0_12px_rgba(255,192,18,0.65)]" />
              )}
              <Icon className={`h-5 w-5 transition-transform duration-200 ${active ? "scale-110" : ""}`} />
              {isOpen && (
                <span
                  className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${
                    isOpen ? "opacity-100 max-w-[200px]" : "opacity-0 max-w-0"
                  }`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
