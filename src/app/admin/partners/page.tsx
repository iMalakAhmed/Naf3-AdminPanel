"use client";

import { useEffect, useState } from "react";
import StatusPill from "../components/StatusPill";
import PartnerModal from "../components/PartnerModal";
import useAuthRole from "../components/useAuthRole";
import { apiGet } from "@/lib/api";

type PartnerRecord = {
  id: string;
  name: string;
  email: string;
  status: "active" | "suspended" | "inactive";
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
      partners?: T[] | unknown;
      content?: T[] | unknown;
    };
    
    // Try partners first (most likely for this endpoint), then other common patterns
    return (
      (Array.isArray(record.partners) ? record.partners : null) ??
      (Array.isArray(record.data) ? record.data : null) ??
      (Array.isArray(record.items) ? record.items : null) ??
      (Array.isArray(record.results) ? record.results : null) ??
      (Array.isArray(record.content) ? record.content : null) ??
      []
    );
  }
  return [];
}

function resolvePartnerStatus(input: unknown): PartnerRecord["status"] {
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

export default function PartnersPage() {
  const { role } = useAuthRole();
  const [partners, setPartners] = useState<PartnerRecord[]>([]);
  const [filteredPartners, setFilteredPartners] = useState<PartnerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPartner, setSelectedPartner] = useState<PartnerRecord | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    apiGet<unknown>("/partners")
      .then((result) => {
        if (!isMounted) {
          return;
        }
        if (!result.ok) {
          setError(result.error ?? "Failed to load partners.");
          setPartners([]);
          return;
        }

        const list = normalizeList<Record<string, unknown>>(result.data);
        const mapped = list.map((partner) => {
          const partnerId =
            (partner.id as string | undefined) ??
            (partner.partnerId as string | undefined) ??
            "";
          return {
            id: partnerId,
            name:
              (partner.name as string | undefined) ??
              (partner.partnerName as string | undefined) ??
              "Unknown Partner",
            email:
              (partner.email as string | undefined) ??
              (partner.contactEmail as string | undefined) ??
              "no-email",
            status: resolvePartnerStatus(
              (partner.status as string | undefined) ?? partner.isActive
            ),
          };
        });

        setPartners(mapped);
        setFilteredPartners(mapped);
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load partners.");
          setPartners([]);
          setFilteredPartners([]);
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

  // Filter partners based on search query and status
  useEffect(() => {
    let filtered = partners;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (partner) =>
          partner.name.toLowerCase().includes(query) ||
          partner.email.toLowerCase().includes(query) ||
          partner.id.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((partner) => {
        if (statusFilter === "active") return partner.status === "active";
        if (statusFilter === "suspended") return partner.status === "suspended";
        return true;
      });
    }

    setFilteredPartners(filtered);
  }, [searchQuery, statusFilter, partners]);

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--outline)] bg-[color:var(--surface-glass)] p-6 shadow-[0_20px_55px_-45px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_20px_55px_-40px_rgba(2,44,43,0.4)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-teal)]/70 via-[var(--brand-teal-soft)]/70 to-[var(--brand-gold)]/70" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Partners
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Manage partners and branches
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Activate, suspend, or reset access for partner accounts.
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
            placeholder="Search partners"
            className="w-full max-w-xs rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        {role === "Admin" && (
          <p className="mt-4 text-xs text-slate-400">
            Admin access excludes deleted partners by ID.
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--outline)] bg-[color:var(--surface-glass)] shadow-[0_16px_45px_-40px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-[0_16px_45px_-35px_rgba(15,23,42,0.42)]">
        <div className="overflow-x-auto">
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-teal)] border-r-transparent"></div>
              <p className="mt-3 text-sm text-slate-500">Loading partners...</p>
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
          {!isLoading && !error && filteredPartners.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              <svg className="mx-auto mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              {searchQuery || statusFilter !== "all" ? "No partners match your filters." : "No partners found."}
            </div>
          )}
          {!isLoading && !error && filteredPartners.length > 0 && (
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold">Partner</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPartners.map((partner) => (
                <tr
                  key={partner.id}
                  className="odd:bg-white even:bg-slate-50/30 transition-all duration-200 hover:bg-[var(--brand-teal)]/5 hover:shadow-sm"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{partner.name}</p>
                    <p className="text-xs text-slate-500">{partner.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill value={partner.status as "active" | "suspended"} />
                  </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedPartner(partner)}
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

      {selectedPartner && (
        <PartnerModal
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
          partner={selectedPartner}
        />
      )}
    </section>
  );
}
