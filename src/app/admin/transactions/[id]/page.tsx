"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusPill from "../../components/StatusPill";
import { apiGet } from "@/lib/api";

type TransactionDetailsProps = {
  params: { id: string };
};

function formatDate(dateString: unknown): string {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString as string);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateString);
  }
}

export default function TransactionDetailsPage({ params }: TransactionDetailsProps) {
  const router = useRouter();
  const [transaction, setTransaction] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // First try to get all transactions/requests
    Promise.all([
      apiGet<unknown>("/Transactions/all-transactions"),
      apiGet<unknown>("/requests"),
    ])
      .then(([transactionsResult, requestsResult]) => {
        if (!isMounted) return;

        // Try transactions first
        if (transactionsResult.ok && transactionsResult.data) {
          const data = transactionsResult.data;
          let transactionList: unknown[] = [];
          
          if (Array.isArray(data)) {
            transactionList = data;
          } else if (data && typeof data === "object") {
            const record = data as Record<string, unknown>;
            if (Array.isArray(record.transactions)) {
              transactionList = record.transactions;
            } else if (Array.isArray(record.data)) {
              transactionList = record.data;
            } else if (Array.isArray(record.items)) {
              transactionList = record.items;
            }
          }

          const found = transactionList.find((t: unknown) => {
            if (t && typeof t === "object") {
              const tx = t as Record<string, unknown>;
              return (
                (tx.id as string | undefined) === params.id ||
                (tx.transactionId as string | undefined) === params.id ||
                (tx.requestId as string | undefined) === params.id
              );
            }
            return false;
          });

          if (found && typeof found === "object") {
            setTransaction(found as Record<string, unknown>);
            setError(null);
            return;
          }
        }

        // If not found in transactions, try requests
        if (requestsResult.ok && requestsResult.data) {
          const data = requestsResult.data;
          let requestList: unknown[] = [];
          
          if (Array.isArray(data)) {
            requestList = data;
          } else if (data && typeof data === "object") {
            const record = data as Record<string, unknown>;
            if (Array.isArray(record.requests)) {
              requestList = record.requests;
            } else if (Array.isArray(record.data)) {
              requestList = record.data;
            } else if (Array.isArray(record.items)) {
              requestList = record.items;
            }
          }

          const found = requestList.find((r: unknown) => {
            if (r && typeof r === "object") {
              const req = r as Record<string, unknown>;
              return (
                (req.id as string | undefined) === params.id ||
                (req.requestId as string | undefined) === params.id ||
                (req.transactionId as string | undefined) === params.id
              );
            }
            return false;
          });

          if (found && typeof found === "object") {
            setTransaction(found as Record<string, unknown>);
            setError(null);
            return;
          }
        }

        setError("Transaction not found.");
      })
      .catch(() => {
        if (isMounted) setError("Failed to load transaction.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const transactionType = (transaction?.type as string | undefined) ?? (transaction?.requestType as string | undefined) ?? "Transaction";
  const status = (transaction?.status as string | undefined) ?? (transaction?.requestStatus as string | undefined) ?? "Unknown";
  const amount = (transaction?.amount as number | undefined) ?? 0;
  const date = formatDate(transaction?.date ?? transaction?.createdAt ?? transaction?.transactionDate ?? transaction?.submittedAt);
  
  const charity = transaction?.charity as Record<string, unknown> | undefined;
  const charityName = (charity?.name as string | undefined) ?? (charity?.charityName as string | undefined) ?? "N/A";
  
  const recipient = transaction?.recipient as Record<string, unknown> | undefined;
  const recipientFirstName = (recipient?.firstName as string | undefined) ?? "";
  const recipientLastName = (recipient?.lastName as string | undefined) ?? "";
  const recipientName = `${recipientFirstName} ${recipientLastName}`.trim() || (recipient?.name as string | undefined) || "N/A";

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Transaction Details
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {isLoading ? "Loading..." : transactionType}
            </h2>
            <p className="mt-1 text-sm text-slate-500">Transaction ID: {params.id}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/5 hover:text-[var(--brand-teal)] hover:shadow-sm"
          >
            Back
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-12 text-center shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-teal)] border-r-transparent"></div>
          <p className="mt-3 text-sm text-slate-500">Loading transaction details...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-12 text-center shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)]">
          <svg className="mx-auto mb-2 h-8 w-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-rose-500">{error}</p>
        </div>
      )}

      {!isLoading && !error && transaction && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
            <h3 className="text-lg font-semibold text-slate-900">Transaction Information</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Type:</span>
                <span className="font-semibold text-slate-900">{transactionType}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Amount:</span>
                <span className="font-semibold text-slate-900">{amount.toLocaleString()} EGP</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Date:</span>
                <span className="font-semibold text-slate-900">{date}</span>
              </div>
              {transaction.priority && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Priority:</span>
                  <span className="font-semibold text-slate-900">{transaction.priority as string}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Status:</span>
                <StatusPill
                  value={
                    status.toLowerCase().includes("accept") || status.toLowerCase().includes("complete")
                      ? "approved"
                      : status.toLowerCase().includes("reject")
                      ? "rejected"
                      : status.toLowerCase().includes("progress")
                      ? "pending"
                      : "pending"
                  }
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
            <h3 className="text-lg font-semibold text-slate-900">Related Information</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Charity:</span>
                <span className="font-semibold text-slate-900">{charityName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-semibold text-slate-900">{recipientName}</span>
              </div>
              {(transaction.description || transaction.reason) && (
                <div className="border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Description:</span>
                  <p className="mt-1 font-semibold text-slate-900">
                    {(transaction.description as string | undefined) ?? (transaction.reason as string | undefined)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
