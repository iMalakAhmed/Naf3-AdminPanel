"use client";

import { useEffect, useState } from "react";
import StatusPill from "../components/StatusPill";
import CharityModal from "../components/CharityModal";
import useAuthRole from "../components/useAuthRole";
import { apiGet } from "@/lib/api";

type CharityRecord = {
  id: string;
  name: string;
  status: "pending" | "approved" | "suspended" | "inactive";
  focus: string;
};

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === "object") {
    const record = data as {
      data?: T[];
      items?: T[];
      results?: T[];
      charities?: T[];
    };
    return (
      record.charities ?? record.data ?? record.items ?? record.results ?? []
    );
  }
  return [];
}

function resolveCharityStatus(input: unknown): CharityRecord["status"] {
  if (typeof input === "string") {
    const value = input.toLowerCase();
    if (value.includes("suspend")) {
      return "suspended";
    }
    if (value.includes("approve") || value.includes("active")) {
      return "approved";
    }
    if (value.includes("inactive")) {
      return "inactive";
    }
  }
  if (typeof input === "boolean") {
    return input ? "approved" : "inactive";
  }
  return "pending";
}

export default function CharitiesPage() {
  const { role } = useAuthRole();
  const [charities, setCharities] = useState<CharityRecord[]>([]);
  const [filteredCharities, setFilteredCharities] = useState<CharityRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiGet<unknown>("/charities")
      .then((result) => {
        if (!isMounted) {
          return;
        }
        if (!result.ok) {
          setError(result.error ?? "Failed to load charities.");
          setCharities([]);
          return;
        }

        const list = normalizeList<Record<string, unknown>>(result.data);
        const mapped = list.map((charity) => ({
          id:
            (charity.charityId as string | undefined) ??
            (charity.id as string | undefined) ??
            "",
          name:
            (charity.charityName as string | undefined) ??
            (charity.name as string | undefined) ??
            "Unknown Charity",
          status: resolveCharityStatus(
            (charity.status as string | undefined) ?? charity.isActive
          ),
          focus:
            (charity.aim as string | undefined) ??
            (charity.focus as string | undefined) ??
            (charity.category as string | undefined) ??
            "General",
        }));

        setCharities(mapped);
        setFilteredCharities(mapped);
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load charities.");
          setCharities([]);
          setFilteredCharities([]);
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

  // Filter charities based on search query and status
  useEffect(() => {
    let filtered = charities;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (charity) =>
          charity.name.toLowerCase().includes(query) ||
          charity.focus.toLowerCase().includes(query) ||
          charity.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((charity) => charity.status === statusFilter);
    }

    setFilteredCharities(filtered);
  }, [searchQuery, statusFilter, charities]);

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--outline)] bg-[color:var(--surface-glass)] p-6 shadow-[0_20px_55px_-45px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_20px_55px_-40px_rgba(2,44,43,0.4)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-teal)]/70 via-[var(--brand-teal-soft)]/70 to-[var(--brand-gold)]/70" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Charities
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Review and manage charities
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Approve, reject, or suspend charity accounts.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {role === "SuperAdmin" && (
              <button className="rounded-xl border border-[var(--brand-teal)]/40 bg-[var(--brand-teal)]/5 px-4 py-2 text-sm font-semibold text-[var(--brand-teal)] shadow-sm transition-all duration-200 hover:border-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/10 hover:shadow-md">
                View deleted
              </button>
            )}
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search charities"
            className="w-full max-w-xs rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        {role === "Admin" && (
          <p className="mt-4 text-xs text-slate-400">
            Admin access excludes deleted charities by ID.
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--outline)] bg-[color:var(--surface-glass)] shadow-[0_16px_45px_-40px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-[0_16px_45px_-35px_rgba(15,23,42,0.42)]">
        <div className="overflow-x-auto">
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-teal)] border-r-transparent"></div>
              <p className="mt-3 text-sm text-slate-500">Loading charities...</p>
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
          {!isLoading && !error && filteredCharities.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              <svg className="mx-auto mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {searchQuery || statusFilter !== "all" ? "No charities match your filters." : "No charities found."}
            </div>
          )}
          {!isLoading && !error && filteredCharities.length > 0 && (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Charity</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCharities.map((charity) => (
                <tr
                  key={charity.id}
                  className="odd:bg-white even:bg-slate-50/30 transition-all duration-200 hover:bg-[var(--brand-teal)]/5 hover:shadow-sm"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{charity.name}</p>
                    <p className="text-xs text-slate-500">{charity.focus}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill value={charity.status as "pending" | "approved" | "suspended"} />
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedCharityId(charity.id)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/5 hover:text-[var(--brand-teal)] hover:shadow-md"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>

      {selectedCharityId && (
        <CharityModal
          isOpen={!!selectedCharityId}
          onClose={() => setSelectedCharityId(null)}
          charityId={selectedCharityId}
        />
      )}
    </section>
  );
}
