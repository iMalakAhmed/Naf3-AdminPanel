"use client";

import { useEffect, useState } from "react";
import StatusPill from "./StatusPill";
import { apiGet } from "@/lib/api";

type DonorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  donorId: string;
};

export default function DonorModal({ isOpen, onClose, donorId }: DonorModalProps) {
  const [donor, setDonor] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !donorId) return;

    setIsLoading(true);
    setError(null);

    // Fetch all donors and find the matching one
    apiGet<unknown>("/donors")
      .then((result) => {
        if (!result.ok || !result.data) {
          setError(result.error ?? "Failed to load donor.");
          return;
        }

        // Parse the response to get the donor list
        const data = result.data;
        let donorList: unknown[] = [];
        
        if (Array.isArray(data)) {
          donorList = data;
        } else if (data && typeof data === "object") {
          const record = data as Record<string, unknown>;
          if (Array.isArray(record.donors)) {
            donorList = record.donors;
          } else if (Array.isArray(record.data)) {
            donorList = record.data;
          } else if (Array.isArray(record.items)) {
            donorList = record.items;
          } else if (Array.isArray(record.results)) {
            donorList = record.results;
          }
        }

        // Find the donor with matching ID
        const foundDonor = donorList.find((d: unknown) => {
          if (d && typeof d === "object") {
            const donor = d as Record<string, unknown>;
            const donorIdValue = (donor.id as string | undefined) ?? (donor.donorId as string | undefined);
            return donorIdValue === donorId;
          }
          return false;
        });

        if (foundDonor && typeof foundDonor === "object") {
          setDonor(foundDonor as Record<string, unknown>);
          setError(null);
        } else {
          setError("Donor not found.");
        }
      })
      .catch(() => {
        setError("Failed to load donor.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, donorId]);

  if (!isOpen) return null;

  const firstName = (donor?.firstName as string | undefined) ?? "";
  const lastName = (donor?.lastName as string | undefined) ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const name = fullName || (donor?.fullName as string | undefined) || (donor?.name as string | undefined) || "Unknown Donor";
  const email = (donor?.email as string | undefined) ?? "N/A";
  const phoneNumber = (donor?.phoneNumber as string | undefined) ?? "N/A";
  const donations = (donor?.donationsCount as number | undefined) ?? (donor?.totalDonations as number | undefined) ?? 0;
  const totalAmount = (donor?.totalAmount as number | undefined) ?? (donor?.totalDonated as number | undefined) ?? 0;

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Donor Summary</p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {name}
            </h2>
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
              <p className="mt-3 text-sm text-slate-500">Loading donor details...</p>
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

          {!isLoading && !error && donor && (
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-white p-6 shadow-[0_14px_45px_-35px_rgba(15,23,42,0.45)]">
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                  <StatusPill
                    value={
                      (donor.status as string | undefined)?.toLowerCase().includes("suspend")
                        ? "suspended"
                        : (donor.status as string | undefined)?.toLowerCase().includes("inactive")
                        ? "inactive"
                        : donor.isActive === false
                        ? "inactive"
                        : "active"
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Name</span>
                  <span className="font-semibold text-slate-900">{name}</span>
                </div>
                {email !== "N/A" && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Email</span>
                    <span className="font-semibold text-slate-900">{email}</span>
                  </div>
                )}
                {phoneNumber !== "N/A" && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phone</span>
                    <span className="font-semibold text-slate-900">{phoneNumber}</span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Donations</span>
                  <span className="font-semibold text-slate-900">{donations}</span>
                </div>
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Total Amount</span>
                  <span className="font-semibold text-slate-900">
                    {totalAmount.toLocaleString()} EGP
                  </span>
                </div>
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Donor ID</span>
                  <span className="font-mono text-xs text-slate-600">
                    {(donor?.id as string | undefined) ?? (donor?.donorId as string | undefined) ?? donorId}
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
