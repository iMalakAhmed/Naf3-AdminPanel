"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusPill from "../../components/StatusPill";
import { apiGet } from "@/lib/api";

type UserDetailsProps = {
  params: { id: string };
};

export default function UserDetailsPage({ params }: UserDetailsProps) {
  const router = useRouter();
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch all donors and find the matching one
    apiGet<unknown>("/donors")
      .then((result) => {
        if (!isMounted) return;
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
            const donorId = (donor.id as string | undefined) ?? (donor.donorId as string | undefined);
            return donorId === params.id;
          }
          return false;
        });

        if (foundDonor && typeof foundDonor === "object") {
          setUser(foundDonor as Record<string, unknown>);
          setError(null);
        } else {
          setError("Donor not found.");
        }
      })
      .catch(() => {
        if (isMounted) setError("Failed to load donor.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const firstName = (user?.firstName as string | undefined) ?? "";
  const lastName = (user?.lastName as string | undefined) ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const name = fullName || (user?.fullName as string | undefined) || (user?.name as string | undefined) || "Unknown Donor";
  const email = (user?.email as string | undefined) ?? "N/A";
  const phoneNumber = (user?.phoneNumber as string | undefined) ?? "N/A";
  const donations = (user?.donationsCount as number | undefined) ?? (user?.totalDonations as number | undefined) ?? 0;
  const totalAmount = (user?.totalAmount as number | undefined) ?? (user?.totalDonated as number | undefined) ?? 0;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Donor Summary
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {isLoading ? "Loading..." : name}
            </h2>
            {!isLoading && email !== "N/A" && (
              <p className="mt-1 text-sm text-slate-500">{email}</p>
            )}
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
          <p className="mt-3 text-sm text-slate-500">Loading donor details...</p>
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

      {!isLoading && !error && user && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
            <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-900">{name}</span>
              </div>
              {email !== "N/A" && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-900">{email}</span>
                </div>
              )}
              {phoneNumber !== "N/A" && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-900">{phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Donor ID:</span>
                <span className="font-mono text-xs text-slate-600">
                  {(user?.id as string | undefined) ?? (user?.donorId as string | undefined) ?? params.id}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
            <h3 className="text-lg font-semibold text-slate-900">Donation Statistics</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Total Donations:</span>
                <span className="font-semibold text-slate-900">{donations}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Total Amount:</span>
                <span className="font-semibold text-slate-900">
                  {totalAmount.toLocaleString()} EGP
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Status:</span>
                <StatusPill
                  value={
                    (user.status as string | undefined)?.toLowerCase().includes("suspend")
                      ? "suspended"
                      : (user.status as string | undefined)?.toLowerCase().includes("inactive")
                      ? "inactive"
                      : user.isActive === false
                      ? "inactive"
                      : "active"
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
