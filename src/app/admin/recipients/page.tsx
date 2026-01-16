"use client";

import { useEffect, useState } from "react";
import StatusPill from "../components/StatusPill";
import RecipientModal from "../components/RecipientModal";
import useAuthRole from "../components/useAuthRole";
import { apiGet } from "@/lib/api";

type RecipientRecord = {
  id: string;
  name: string;
  nationalId: string;
  phoneNumber: string;
  address: string;
  caseStatus: "open" | "closed";
  charityName?: string;
  familyMembersCount: number;
  requestsCount: number;
  monthlyIncome?: number;
  monthlyAssistance?: number;
};

function resolveCount(value: unknown, fallback: unknown): number {
  if (typeof value === "number") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.length;
  }
  if (typeof fallback === "number") {
    return fallback;
  }
  if (Array.isArray(fallback)) {
    return fallback.length;
  }
  return 0;
}

function normalizeList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === "object") {
    const record = data as {
      data?: T[] | unknown;
      items?: T[] | unknown;
      results?: T[] | unknown;
      recipients?: T[] | unknown;
    };
    return (
      (Array.isArray(record.recipients) ? record.recipients : null) ??
      (Array.isArray(record.data) ? record.data : null) ??
      (Array.isArray(record.items) ? record.items : null) ??
      (Array.isArray(record.results) ? record.results : null) ??
      []
    );
  }
  return [];
}

function resolveCaseStatus(input: unknown): "open" | "closed" {
  if (typeof input === "string") {
    const value = input.toLowerCase();
    if (value.includes("close")) {
      return "closed";
    }
  }
  if (typeof input === "boolean") {
    return input ? "open" : "closed";
  }
  return "open";
}

function formatName(recipient: Record<string, unknown>): string {
  const firstName = (recipient.firstName as string | undefined) ?? "";
  const lastName = (recipient.lastName as string | undefined) ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || "Unknown Recipient";
}

export default function RecipientsPage() {
  const { role } = useAuthRole();
  const [recipients, setRecipients] = useState<RecipientRecord[]>([]);
  const [filteredRecipients, setFilteredRecipients] = useState<RecipientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    apiGet<unknown>("/recipients")
      .then((result) => {
        if (!isMounted) {
          return;
        }
        if (!result.ok) {
          setError(result.error ?? "Failed to load recipients.");
          setRecipients([]);
          return;
        }

        const list = normalizeList<Record<string, unknown>>(result.data);
        const mapped = list.map((recipient) => {
          const recipientId =
            (recipient.id as string | undefined) ??
            (recipient.recipientId as string | undefined) ??
            "";
          const nationalId =
            (recipient.nationalId as string | undefined) ?? "N/A";
          const phoneNumber =
            (recipient.phoneNumber as string | undefined) ??
            (recipient.phone as string | undefined) ??
            "N/A";
          const address = (recipient.address as string | undefined) ?? "N/A";

          // Get charity name if available
          const charity =
            recipient.charity as Record<string, unknown> | undefined;
          const charityName =
            (charity?.name as string | undefined) ??
            (charity?.charityName as string | undefined) ??
            undefined;

          const familyMembersCount = resolveCount(
            recipient.familyMembers,
            (recipient.familyMembersList as unknown) ??
              (recipient.familyMembersCount as unknown) ??
              (recipient.familyCount as unknown)
          );

          const requestsCount = resolveCount(
            recipient.requests,
            (recipient.requestsList as unknown) ??
              (recipient.requestsCount as unknown) ??
              (recipient.requestCount as unknown)
          );

          return {
            id: recipientId,
            name: formatName(recipient),
            nationalId,
            phoneNumber,
            address,
            caseStatus: resolveCaseStatus(
              recipient.caseStatus ?? recipient.isClosed
            ),
            charityName,
            familyMembersCount,
            requestsCount,
            monthlyIncome: recipient.monthlyIncome as number | undefined,
            monthlyAssistance: recipient.monthlyAssistance as number | undefined,
          };
        });

        setRecipients(mapped);
        setFilteredRecipients(mapped);
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load recipients.");
          setRecipients([]);
          setFilteredRecipients([]);
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

  // Filter recipients based on search query and status
  useEffect(() => {
    let filtered = recipients;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (recipient) =>
          recipient.name.toLowerCase().includes(query) ||
          recipient.nationalId.toLowerCase().includes(query) ||
          recipient.phoneNumber.toLowerCase().includes(query) ||
          recipient.address.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((recipient) => {
        if (statusFilter === "open") return recipient.caseStatus === "open";
        if (statusFilter === "closed") return recipient.caseStatus === "closed";
        return true;
      });
    }

    setFilteredRecipients(filtered);
  }, [searchQuery, statusFilter, recipients]);

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Recipients
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Manage recipients and cases
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              View recipient information, case status, and family details.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {role === "SuperAdmin" && (
              <button className="rounded-xl border border-[var(--brand-teal)]/40 bg-[var(--brand-teal)]/5 px-4 py-2 text-sm font-semibold text-[var(--brand-teal)] transition-all duration-200 hover:border-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/10 hover:shadow-sm">
                View closed
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, national ID, or phone"
            className="w-full max-w-xs rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm shadow-sm outline-none transition-all duration-200 focus:border-[var(--brand-teal)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-teal)]/20 focus:shadow-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm shadow-sm outline-none transition-all duration-200 focus:border-[var(--brand-teal)] focus:bg-white focus:ring-2 focus:ring-[var(--brand-teal)]/20 focus:shadow-md"
          >
            <option value="all">All cases</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        {role === "Admin" && (
          <p className="mt-4 text-xs text-slate-400">
            Admin access excludes deleted recipients by ID.
          </p>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-[0_18px_50px_-40px_rgba(15,23,42,0.4)]">
        <div className="overflow-x-auto">
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-teal)] border-r-transparent"></div>
              <p className="mt-3 text-sm text-slate-500">Loading recipients...</p>
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
          {!isLoading && !error && filteredRecipients.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              <svg className="mx-auto mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {searchQuery || statusFilter !== "all" ? "No recipients match your filters." : "No recipients found."}
            </div>
          )}
          {!isLoading && !error && filteredRecipients.length > 0 && (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Recipient</th>
                  <th className="px-6 py-4 font-semibold">Contact</th>
                  <th className="px-6 py-4 font-semibold">Case Info</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecipients.map((recipient) => (
                  <tr
                    key={recipient.id}
                    className="odd:bg-white even:bg-slate-50/30 transition-all duration-200 hover:bg-[var(--brand-teal)]/5 hover:shadow-sm"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">
                        {recipient.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        ID: {recipient.nationalId}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">
                        {recipient.phoneNumber}
                      </p>
                      <p className="text-xs text-slate-500 truncate max-w-xs">
                        {recipient.address}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                          {recipient.familyMembersCount} family
                        </span>
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
                          {recipient.requestsCount} requests
                        </span>
                        {recipient.charityName && (
                          <span className="rounded-full border border-[var(--brand-teal)]/40 bg-[var(--brand-teal)]/5 px-3 py-1 text-xs font-medium text-[var(--brand-teal)] shadow-sm">
                            {recipient.charityName}
                          </span>
                        )}
                      </div>
                      {(recipient.monthlyIncome ||
                        recipient.monthlyAssistance) && (
                        <p className="mt-2 text-xs text-slate-500">
                          Income: {recipient.monthlyIncome ?? 0} EGP | Assistance:{" "}
                          {recipient.monthlyAssistance ?? 0} EGP
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill
                        value={
                          recipient.caseStatus === "open"
                            ? "active"
                            : "inactive"
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedRecipientId(recipient.id)}
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

      {selectedRecipientId && (
        <RecipientModal
          isOpen={!!selectedRecipientId}
          onClose={() => setSelectedRecipientId(null)}
          recipientId={selectedRecipientId}
        />
      )}
    </section>
  );
}
