"use client";

import { useEffect, useState } from "react";
import StatusPill from "./StatusPill";
import { apiGet } from "@/lib/api";

type TransactionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string;
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

export default function TransactionModal({ isOpen, onClose, transactionId }: TransactionModalProps) {
  const [transaction, setTransaction] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !transactionId) return;

    setIsLoading(true);
    setError(null);

    Promise.all([
      apiGet<unknown>("/Transactions/all-transactions"),
      apiGet<unknown>("/requests"),
    ])
      .then(([transactionsResult, requestsResult]) => {
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
                (tx.id as string | undefined) === transactionId ||
                (tx.transactionId as string | undefined) === transactionId ||
                (tx.requestId as string | undefined) === transactionId
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

        // If not found, try requests
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
                (req.id as string | undefined) === transactionId ||
                (req.requestId as string | undefined) === transactionId ||
                (req.transactionId as string | undefined) === transactionId
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
        setError("Failed to load transaction.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, transactionId]);

  if (!isOpen) return null;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl max-h-[90vh] animate-fadeIn overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_-55px_rgba(12,31,42,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-teal-soft)] to-[var(--brand-gold)]" />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-slate-200/60" />
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Transaction Details</p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {transactionType}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
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
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {amount.toLocaleString()} EGP
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal-strong)] hover:shadow-sm"
          >
            Close
          </button>
        </div>

        <div className="p-6">
          {isLoading && (
            <div className="py-16 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-teal)] border-r-transparent"></div>
              <p className="mt-3 text-sm text-slate-500">Loading transaction details...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="py-16 text-center">
              <svg className="mx-auto mb-2 h-8 w-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-rose-500">{error}</p>
            </div>
          )}

          {!isLoading && !error && transaction && (
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-white p-6 shadow-[0_14px_45px_-35px_rgba(15,23,42,0.45)]">
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
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
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Type</span>
                  <span className="font-semibold text-slate-900">{transactionType}</span>
                </div>
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Amount</span>
                  <span className="font-semibold text-slate-900">{amount.toLocaleString()} EGP</span>
                </div>
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Date</span>
                  <span className="font-semibold text-slate-900">{date}</span>
                </div>
                {transaction.priority && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Priority</span>
                    <span className="font-semibold text-slate-900">{transaction.priority as string}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Charity</span>
                  <span className="font-semibold text-slate-900">{charityName}</span>
                </div>
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Recipient</span>
                  <span className="font-semibold text-slate-900">{recipientName}</span>
                </div>
                {(transaction.description || transaction.reason) && (
                  <div className="py-3 transition-colors hover:bg-slate-50/70">
                    <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Description</span>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {(transaction.description as string | undefined) ?? (transaction.reason as string | undefined)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
