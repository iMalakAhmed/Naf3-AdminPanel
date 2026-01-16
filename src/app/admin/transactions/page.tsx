"use client";

import { useEffect, useState } from "react";
import StatusPill from "../components/StatusPill";
import TransactionModal from "../components/TransactionModal";
import useAuthRole from "../components/useAuthRole";
import { apiGet } from "@/lib/api";

type TransactionRecord = {
  id: string;
  type: string;
  status: string;
  amount: number;
  partnerId?: string;
  partnerName?: string;
  charityName?: string;
  recipientId?: string;
  recipientName?: string;
  date: string;
  priority?: string;
  description?: string;
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
      transactions?: T[] | unknown;
      requests?: T[] | unknown;
    };
    return (
      (Array.isArray(record.transactions) ? record.transactions : null) ??
      (Array.isArray(record.requests) ? record.requests : null) ??
      (Array.isArray(record.data) ? record.data : null) ??
      (Array.isArray(record.items) ? record.items : null) ??
      (Array.isArray(record.results) ? record.results : null) ??
      []
    );
  }
  return [];
}

function formatDate(dateString: unknown): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString as string);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateString);
  }
}

function resolveStatus(input: unknown): string {
  if (typeof input === "string") {
    return input;
  }
  return "Unknown";
}

function normalizeId(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function buildPartnerMap(list: Record<string, unknown>[]): Map<string, string> {
  const map = new Map<string, string>();
  list.forEach((partner) => {
    const id =
      (partner.id as string | undefined) ??
      (partner.partnerId as string | undefined) ??
      "";
    const normalizedId = normalizeId(id);
    if (!normalizedId) return;
    const name =
      (partner.name as string | undefined) ??
      (partner.partnerName as string | undefined) ??
      "Unknown Partner";
    map.set(normalizedId, name);
  });
  return map;
}

export default function TransactionsPage() {
  const { role } = useAuthRole();
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useRequests, setUseRequests] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Try all-transactions first, fallback to requests if needed
    const fetchTransactions = async () => {
      try {
        // Try /api/Transactions/all-transactions first
        const transactionsResult = await apiGet<unknown>(
          "/Transactions/all-transactions"
        );

        if (transactionsResult.ok && transactionsResult.data) {
          const list = normalizeList<Record<string, unknown>>(
            transactionsResult.data
          );
          if (list.length > 0) {
            const mapped = list.map((tx) => {
              const charity = tx.charity as Record<string, unknown> | undefined;
              const recipient = tx.recipient as Record<string, unknown> | undefined;
              const toRecipient = tx.toRecipient as Record<string, unknown> | undefined;

              const recipientFirstName =
                (toRecipient?.firstName as string | undefined) ??
                (recipient?.firstName as string | undefined) ??
                "";
              const recipientLastName =
                (toRecipient?.lastName as string | undefined) ??
                (recipient?.lastName as string | undefined) ??
                "";
              const recipientName =
                `${recipientFirstName} ${recipientLastName}`.trim() ||
                (toRecipient?.name as string | undefined) ||
                (recipient?.name as string | undefined) ||
                (tx.recipientName as string | undefined) ||
                undefined;

              const partnerId =
                (tx.toPartner as string | undefined) ??
                (tx.partnerId as string | undefined) ??
                (tx.partner as string | undefined) ??
                undefined;

              return {
              id:
                (tx.id as string | undefined) ??
                (tx.transactionId as string | undefined) ??
                "",
              type: (tx.type as string | undefined) ?? "Transaction",
              status: resolveStatus(tx.status),
              amount: (tx.amount as number | undefined) ?? 0,
              partnerId,
              charityName:
                (tx.fromCharity as string | undefined) ??
                (tx.charityName as string | undefined) ??
                (charity?.name as string | undefined) ??
                (charity?.charityName as string | undefined) ??
                undefined,
              recipientId:
                (toRecipient?.recipientId as string | undefined) ??
                (recipient?.recipientId as string | undefined) ??
                (recipient?.id as string | undefined) ??
                undefined,
              recipientName,
              date: formatDate(tx.date ?? tx.createdAt ?? tx.transactionDate),
              priority: (tx.priority as string | undefined) ?? undefined,
              description: (tx.description as string | undefined) ?? undefined,
              };
            });

            const partnerIds = Array.from(
              new Set(
                mapped
                  .map((tx) => normalizeId(tx.partnerId))
                  .filter((value) => value)
              )
            );
            let partnerMap = new Map<string, string>();

            if (partnerIds.length > 0) {
              const partnersResult = await apiGet<unknown>("/partners");
              if (partnersResult.ok && partnersResult.data) {
                const partnerList = normalizeList<Record<string, unknown>>(
                  partnersResult.data
                );
                partnerMap = buildPartnerMap(partnerList);
              }
            }

            const enriched = mapped.map((tx) => ({
              ...tx,
              partnerName: tx.partnerId
                ? partnerMap.get(normalizeId(tx.partnerId))
                : undefined,
            }));

            if (isMounted) {
              setTransactions(enriched);
              setFilteredTransactions(enriched);
              setUseRequests(false);
              setError(null);
            }
            return;
          }
        }

        // Fallback to /api/requests if transactions endpoint doesn't return data
        const requestsResult = await apiGet<unknown>("/requests");

        if (!isMounted) {
          return;
        }

        if (!requestsResult.ok) {
          setError(
            requestsResult.error ??
              "Failed to load transactions. Trying requests endpoint..."
          );
          // Still try to show requests data if available
        }

        const list = normalizeList<Record<string, unknown>>(
          requestsResult.data
        );
        const mapped = list.map((req) => {
          const charity =
            req.charity as Record<string, unknown> | undefined;
          const recipient =
            req.recipient as Record<string, unknown> | undefined;
          const partner =
            req.partner as Record<string, unknown> | undefined;
          const branch =
            req.branch as Record<string, unknown> | undefined;

          // Format recipient name
          const recipientFirstName =
            (recipient?.firstName as string | undefined) ?? "";
          const recipientLastName =
            (recipient?.lastName as string | undefined) ?? "";
          const recipientName = `${recipientFirstName} ${recipientLastName}`.trim() ||
            ((recipient?.name as string | undefined) ?? undefined);

          return {
            id:
              (req.id as string | undefined) ??
              (req.requestId as string | undefined) ??
              "",
            type:
              (req.type as string | undefined) ??
              (req.requestType as string | undefined) ??
              "Request",
            status: resolveStatus(
              req.status ?? req.requestStatus ?? "Unknown"
            ),
            amount: (req.amount as number | undefined) ?? 0,
            partnerName:
              (req.partnerName as string | undefined) ??
              (partner?.name as string | undefined) ??
              (partner?.partnerName as string | undefined) ??
              ((branch?.partner as Record<string, unknown> | undefined)?.name as string | undefined) ??
              ((branch?.partner as Record<string, unknown> | undefined)?.partnerName as string | undefined) ??
              undefined,
            charityName:
              (charity?.name as string | undefined) ??
              (charity?.charityName as string | undefined) ??
              undefined,
            recipientName,
            date: formatDate(
              req.submittedAt ?? req.createdAt ?? req.date ?? req.submittedDate
            ),
            priority: (req.priority as string | undefined) ?? undefined,
            description:
              (req.description as string | undefined) ??
              (req.reason as string | undefined) ??
              undefined,
          };
        });

        if (list.length === 0 && !requestsResult.ok) {
          setError("No transactions or requests found.");
        } else if (!requestsResult.ok) {
          setError(requestsResult.error ?? "Failed to load transactions.");
        } else {
          setError(null);
        }

        if (isMounted) {
          setTransactions(mapped);
          setFilteredTransactions(mapped);
          setUseRequests(true);
        }
      } catch (err) {
        if (isMounted) {
          setError("Failed to load transactions.");
          setTransactions([]);
          setFilteredTransactions([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTransactions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter transactions based on search query, status, and type
  useEffect(() => {
    let filtered = transactions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          (tx.charityName?.toLowerCase().includes(query) ?? false) ||
          (tx.recipientName?.toLowerCase().includes(query) ?? false) ||
          tx.amount.toString().includes(query) ||
          tx.type.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => {
        const status = tx.status.toLowerCase();
        if (statusFilter === "InProgress") return status.includes("progress");
        if (statusFilter === "Accepted") return status.includes("accept");
        if (statusFilter === "Completed") return status.includes("complete");
        if (statusFilter === "Rejected") return status.includes("reject");
        return true;
      });
    }

    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) =>
        tx.type.toLowerCase().includes(typeFilter.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [searchQuery, statusFilter, typeFilter, transactions]);

  return (
    <section className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--outline)] bg-[color:var(--surface-glass)] p-6 shadow-[0_20px_55px_-45px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_20px_55px_-40px_rgba(2,44,43,0.4)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[var(--brand-teal)]/70 via-[var(--brand-teal-soft)]/70 to-[var(--brand-gold)]/70" />
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Transactions
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Monitor donations and payments
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {useRequests
                ? "View funding requests, donations, and financial transactions."
                : "View all financial transactions and payments."}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by charity, recipient, or amount"
            className="w-full max-w-xs rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
          >
            <option value="all">All statuses</option>
            <option value="InProgress">InProgress</option>
            <option value="Accepted">Accepted</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15 focus:shadow-md"
          >
            <option value="all">All types</option>
            <option value="Fund">Fund</option>
            <option value="Medical">Medical</option>
            <option value="FoodAid">FoodAid</option>
            <option value="EducationSupport">EducationSupport</option>
            <option value="HousingSupport">HousingSupport</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--outline)] bg-[color:var(--surface-glass)] shadow-[0_16px_45px_-40px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-[0_16px_45px_-35px_rgba(15,23,42,0.42)]">
        <div className="overflow-x-auto">
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-teal)] border-r-transparent"></div>
              <p className="mt-3 text-sm text-slate-500">
                Loading transactions...
              </p>
            </div>
          )}
          {error && !isLoading && (
            <div className="px-6 py-10 text-center text-sm text-rose-500">
              <svg
                className="mx-auto mb-2 h-8 w-8 text-rose-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}
          {!isLoading && !error && filteredTransactions.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              <svg
                className="mx-auto mb-2 h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              {searchQuery || statusFilter !== "all" || typeFilter !== "all" ? "No transactions match your filters." : "No transactions found."}
            </div>
          )}
          {!isLoading && !error && filteredTransactions.length > 0 && (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-[0.65rem] uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Partner</th>
                  <th className="px-6 py-4 font-semibold">Charity</th>
                  <th className="px-6 py-4 font-semibold">Recipient</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="odd:bg-white even:bg-slate-50/30 transition-all duration-200 hover:bg-[var(--brand-teal)]/5 hover:shadow-sm"
                  >
                    <td className="px-6 py-4 text-slate-600">
                      {transaction.date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-slate-900">
                          {transaction.type}
                        </span>
                        {transaction.priority && (
                          <span className="text-xs text-slate-500">
                            Priority: {transaction.priority}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900">
                        {transaction.amount.toLocaleString()} EGP
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {transaction.partnerName ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {transaction.charityName ?? "N/A"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {transaction.recipientName ?? "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill
                        value={
                          transaction.status.toLowerCase().includes("accept") ||
                          transaction.status.toLowerCase().includes("complete")
                            ? "approved"
                            : transaction.status
                                .toLowerCase()
                                .includes("reject")
                            ? "rejected"
                            : transaction.status
                                .toLowerCase()
                                .includes("progress")
                            ? "pending"
                            : "pending"
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedTransactionId(transaction.id)}
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

      {selectedTransactionId && (
        <TransactionModal
          isOpen={!!selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
          transactionId={selectedTransactionId}
        />
      )}
    </section>
  );
}
