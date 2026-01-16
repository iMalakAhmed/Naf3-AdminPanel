"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusPill from "../../components/StatusPill";
import { apiGet } from "@/lib/api";

type CharityDetailsProps = {
  params: { id: string };
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

export default function CharityDetailsPage({ params }: CharityDetailsProps) {
  const router = useRouter();
  const [charity, setCharity] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch all charities and find the matching one
    apiGet<unknown>("/charities")
      .then((result) => {
        if (!isMounted) return;
        if (!result.ok || !result.data) {
          setError(result.error ?? "Failed to load charity.");
          return;
        }

        // Parse the response to get the charity list
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

        // Find the charity with matching ID
        const foundCharity = charityList.find((c: unknown) => {
          if (c && typeof c === "object") {
            const charity = c as Record<string, unknown>;
            const charityId = (charity.id as string | undefined) ?? (charity.charityId as string | undefined);
            return charityId === params.id;
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
        if (isMounted) setError("Failed to load charity.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  const charityName = (charity?.charityName as string | undefined) ?? (charity?.name as string | undefined) ?? "Unknown Charity";
  const ownerName = (charity?.ownerName as string | undefined) ?? (charity?.contactName as string | undefined) ?? "Unknown owner";
  const focus = (charity?.aim as string | undefined) ?? (charity?.focus as string | undefined) ?? (charity?.category as string | undefined) ?? "General";
  const email = (charity?.email as string | undefined) ?? undefined;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Charity Details
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {isLoading ? "Loading..." : charityName}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Review compliance, approval status, and activity.
            </p>
            {charity && (
              <div className="mt-4">
                <StatusPill value={resolveCharityStatus(charity.status ?? charity.isActive)} />
              </div>
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
          <p className="mt-3 text-sm text-slate-500">Loading charity details...</p>
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

      {!isLoading && !error && charity && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
            <h3 className="text-lg font-semibold text-slate-900">Summary</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-900">{charityName}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Focus:</span>
                <span className="font-semibold text-slate-900">{focus}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Owner:</span>
                <span className="font-semibold text-slate-900">{ownerName}</span>
              </div>
              {email && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-900">{email}</span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Charity ID:</span>
                <span className="font-mono text-xs text-slate-600">
                  {(charity.id as string | undefined) ?? (charity.charityId as string | undefined) ?? params.id}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
            <h3 className="text-lg font-semibold text-slate-900">Status</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Current Status:</span>
                <StatusPill value={resolveCharityStatus(charity.status ?? charity.isActive)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
