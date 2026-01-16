"use client";

import { useEffect, useState } from "react";
import StatusPill from "../components/StatusPill";
import DonorModal from "../components/DonorModal";
import { apiGet } from "@/lib/api";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  status: "active" | "inactive" | "suspended";
  donations: number;
  total: string;
};

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === "object") {
    const record = data as {
      data?: T[] | unknown;
      items?: T[] | unknown;
      results?: T[] | unknown;
      donors?: T[] | unknown;
    };
    return (
      (Array.isArray(record.donors) ? record.donors : null) ??
      (Array.isArray(record.data) ? record.data : null) ??
      (Array.isArray(record.items) ? record.items : null) ??
      (Array.isArray(record.results) ? record.results : null) ??
      []
    );
  }
  return [];
}

function resolveUserStatus(input: unknown): UserRecord["status"] {
  if (typeof input === "string") {
    const value = input.toLowerCase();
    if (value.includes("suspend")) {
      return "suspended";
    }
    if (value.includes("inactive")) {
      return "inactive";
    }
  }
  if (typeof input === "boolean") {
    return input ? "active" : "inactive";
  }
  return "active";
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiGet<unknown>("/donors")
      .then((result) => {
        if (!isMounted) {
          return;
        }
        if (!result.ok) {
          setError(result.error ?? "Failed to load users.");
          setUsers([]);
          return;
        }

        const list = normalizeList<Record<string, unknown>>(result.data);
        const mapped = list.map((user) => {
          const donations =
            (user.donationsCount as number | undefined) ??
            (user.totalDonations as number | undefined) ??
            0;
          const totalAmount =
            (user.totalAmount as number | undefined) ??
            (user.totalDonated as number | undefined) ??
            0;

          // Format name from firstName and lastName or use fullName
          const firstName = (user.firstName as string | undefined) ?? "";
          const lastName = (user.lastName as string | undefined) ?? "";
          const fullName = `${firstName} ${lastName}`.trim();
          const name =
            fullName ||
            ((user.fullName as string | undefined) ??
              (user.name as string | undefined) ??
              "Unknown User");

          return {
            id:
              (user.id as string | undefined) ??
              (user.donorId as string | undefined) ??
              "",
            name,
            email: (user.email as string | undefined) ?? "no-email",
            status: resolveUserStatus(
              (user.status as string | undefined) ?? user.isActive
            ),
            donations,
            total: `${totalAmount} EGP`,
          };
        });

        setError(null);
        setUsers(mapped);
        setFilteredUsers(mapped);
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load users.");
          setUsers([]);
          setFilteredUsers([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--outline)] bg-[color:var(--surface-glass)] p-6 shadow-[0_20px_55px_-45px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_20px_55px_-40px_rgba(2,44,43,0.4)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-teal)]/70 via-[var(--brand-teal-soft)]/70 to-[var(--brand-gold)]/70" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Donors
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Search and manage donors
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              View donor summaries, donations, and account status.
            </p>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or ID"
            className="w-full max-w-sm rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--outline)] bg-[color:var(--surface-glass)] shadow-[0_16px_45px_-40px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-[0_16px_45px_-35px_rgba(15,23,42,0.42)]">
        <div className="overflow-x-auto">
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-teal)] border-r-transparent"></div>
              <p className="mt-3 text-sm text-slate-500">Loading users...</p>
            </div>
          )}
          {error && !isLoading && (
            <div className="px-6 py-10 text-center text-sm text-rose-500">
              <svg className="mx-auto mb-2 h-8 w-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}
          {!isLoading && !error && filteredUsers.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              <svg className="mx-auto mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {searchQuery ? "No users match your search." : "No users found."}
            </div>
          )}
          {!isLoading && !error && filteredUsers.length > 0 && (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Donations</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="odd:bg-white even:bg-slate-50/30 transition-all duration-200 hover:bg-[var(--brand-teal)]/5 hover:shadow-sm"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <p>{user.donations} donations</p>
                    <p className="text-xs text-slate-400">{user.total}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill
                      value={user.status as "active" | "inactive" | "suspended"}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedDonorId(user.id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/5 hover:text-[var(--brand-teal)] hover:shadow-md"
                    >
                      View summary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {selectedDonorId && (
        <DonorModal
          isOpen={!!selectedDonorId}
          onClose={() => setSelectedDonorId(null)}
          donorId={selectedDonorId}
        />
      )}
    </section>
  );
}
