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
  email: string | null;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function Sidenav({
  isOpen,
  toggleSidebar,
  role,
  email,
  onLogout,
  mobileOpen,
  onMobileClose,
}: SidenavProps) {
  const pathname = usePathname();
  const displayName = email?.split("@")[0] ?? role ?? "Admin";

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed top-0 start-0 z-20 flex h-screen flex-col overflow-hidden text-white
          bg-[linear-gradient(180deg,#005c58_0%,#006f67_48%,#008676_100%)]
          shadow-[18px_0_45px_-32px_rgba(0,48,45,0.9)]
          transition-[width,transform] duration-300 ease-in-out
          ${isOpen ? "w-[280px] lg:w-[315px]" : "lg:w-24"}
          ${mobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div
          className={`flex border-b border-white/14 min-h-[100px] lg:min-h-[118px] ${
            isOpen || mobileOpen
              ? "flex-row items-center gap-3 px-4"
              : "flex-col items-center justify-center gap-2 py-4"
          }`}
        >
          <div
            className={`shrink-0 rounded-[15px] bg-slate-200/90 shadow-sm transition-all duration-300 ${
              isOpen || mobileOpen
                ? "h-[50px] w-[50px] lg:h-[60px] lg:w-[60px]"
                : "h-[44px] w-[44px]"
            }`}
          />
          {(isOpen || mobileOpen) && (
            <div className="min-w-0 flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white/70 lg:text-base">Welcome back!</p>
              <p className="mt-1 truncate text-lg font-bold leading-tight text-white lg:text-xl">
                {displayName}
              </p>
            </div>
          )}
          {/* Desktop collapse toggle */}
          <button
            type="button"
            onClick={toggleSidebar}
            title="Toggle sidebar"
            className="hidden lg:grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            <svg
              viewBox="0 0 24 24"
              className={`h-7 w-7 transition-transform duration-300 ${
                isOpen ? "" : "rotate-180"
              }`}
              aria-hidden
            >
              <path
                d="m15 18-6-6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {/* Mobile close button */}
          <button
            type="button"
            onClick={onMobileClose}
            title="Close menu"
            className="lg:hidden grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white/90 transition hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
              <path
                d="M18 6 6 18M6 6l12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-3 py-6 lg:py-8">
          <div className="space-y-3 lg:space-y-5">
            {navItems
              .filter((item) => (item.superAdminOnly ? role === "SuperAdmin" : true))
              .map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                const expanded = isOpen || mobileOpen;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={item.label}
                    onClick={onMobileClose}
                    className={`relative flex h-[52px] lg:h-[60px] items-center gap-4 rounded-[16px] text-base lg:text-xl font-medium transition-all duration-200 ${
                      active
                        ? "bg-[linear-gradient(90deg,#22c9bd_0%,#0ba09a_100%)] text-white shadow-[0_15px_30px_-18px_rgba(23,210,199,0.95)]"
                        : "text-white/90 hover:bg-white/8 hover:text-white"
                    } ${expanded ? "justify-start px-4 lg:px-5" : "justify-center px-0"}`}
                  >
                    <Icon className="h-6 w-6 lg:h-7 lg:w-7 shrink-0 text-white" />
                    <span
                      className={`min-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 ${
                        expanded ? "max-w-[210px] opacity-100" : "max-w-0 opacity-0"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                );
              })}
          </div>
        </nav>

        <div className="border-t border-white/14 px-3 py-5 lg:py-7">
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            className={`flex h-[52px] lg:h-[60px] w-full items-center gap-4 rounded-[16px] text-base lg:text-xl font-medium text-white/90 transition hover:bg-white/8 hover:text-white ${
              isOpen || mobileOpen ? "justify-start px-4 lg:px-5" : "justify-center px-0"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 lg:h-7 lg:w-7 shrink-0" aria-hidden>
              <path
                d="M15 17l5-5-5-5M20 12H8M11 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span
              className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                isOpen || mobileOpen ? "max-w-[160px] opacity-100" : "max-w-0 opacity-0"
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
