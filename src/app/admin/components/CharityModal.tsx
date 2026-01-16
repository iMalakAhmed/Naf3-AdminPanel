"use client";

import { useEffect, useState } from "react";
import StatusPill from "./StatusPill";
import { apiGet } from "@/lib/api";

type CharityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  charityId: string;
};

function resolveCharityStatus(input: unknown): "pending" | "approved" | "suspended" | "inactive" {
  if (typeof input === "string") {
    const value = input.toLowerCase();
    if (value.includes("suspend")) return "suspended";
    if (value.includes("approve") || value.includes("active")) return "approved";
    if (value.includes("inactive")) return "inactive";
  }
  if (typeof input === "boolean") {
    return input ? "approved" : "inactive";
  }
  return "pending";
}

export default function CharityModal({ isOpen, onClose, charityId }: CharityModalProps) {
  const [charity, setCharity] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !charityId) return;

    setIsLoading(true);
    setError(null);

    // Fetch all charities and find the matching one
    apiGet<unknown>("/charities")
      .then((result) => {
        if (!result.ok || !result.data) {
          setError(result.error ?? "Failed to load charity.");
          return;
        }

        const data = result.data;
        let charityList: unknown[] = [];
        
        if (Array.isArray(data)) {
          charityList = data;
        } else if (data && typeof data === "object") {
          const record = data as Record<string, unknown>;
          if (Array.isArray(record.charities)) {
            charityList = record.charities;
          } else if (Array.isArray(record.data)) {
            charityList = record.data;
          } else if (Array.isArray(record.items)) {
            charityList = record.items;
          } else if (Array.isArray(record.results)) {
            charityList = record.results;
          }
        }

        const foundCharity = charityList.find((c: unknown) => {
          if (c && typeof c === "object") {
            const charity = c as Record<string, unknown>;
            const id = (charity.id as string | undefined) ?? (charity.charityId as string | undefined);
            return id === charityId;
          }
          return false;
        });

        if (foundCharity && typeof foundCharity === "object") {
          setCharity(foundCharity as Record<string, unknown>);
          setError(null);
        } else {
          setError("Charity not found.");
        }
      })
      .catch(() => {
        setError("Failed to load charity.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, charityId]);

  if (!isOpen) return null;

  const charityName = (charity?.charityName as string | undefined) ?? (charity?.name as string | undefined) ?? "Unknown Charity";
  const focus = (charity?.aim as string | undefined) ?? (charity?.focus as string | undefined) ?? (charity?.category as string | undefined) ?? "General";
  const email = (charity?.email as string | undefined) ?? undefined;

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Charity Details</p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {charityName}
            </h2>
            {charity && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusPill value={resolveCharityStatus(charity.status ?? charity.isActive)} />
                {focus && (
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                    {focus}
                  </span>
                )}
              </div>
            )}
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
              <p className="mt-3 text-sm text-slate-500">Loading charity details...</p>
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

          {!isLoading && !error && charity && (
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-white p-6 shadow-[0_14px_45px_-35px_rgba(15,23,42,0.45)]">
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                  <StatusPill value={resolveCharityStatus(charity.status ?? charity.isActive)} />
                </div>
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Name</span>
                  <span className="font-semibold text-slate-900">{charityName}</span>
                </div>
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Focus</span>
                  <span className="font-semibold text-slate-900">{focus}</span>
                </div>
                {email && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</span>
                    <span className="font-semibold text-slate-900">{email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Charity ID</span>
                  <span className="font-mono text-xs text-slate-600">
                    {(charity.id as string | undefined) ?? (charity.charityId as string | undefined) ?? charityId}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
