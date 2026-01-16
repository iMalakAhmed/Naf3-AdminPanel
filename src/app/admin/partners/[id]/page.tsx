"use client";

import { useEffect, useState } from "react";
import StatusPill from "../../components/StatusPill";
import { apiGet } from "@/lib/api";

type PartnerDetailsProps = {
  params: { id: string };
};

type Branch = {
  id: string;
  name: string;
  manager?: string;
  status?: "active" | "suspended" | "inactive";
};

type PartnerData = {
  id?: string;
  partnerId?: string;
  name?: string;
  partnerName?: string;
  email?: string;
  contactEmail?: string;
  branches?: Branch[];
  branchList?: Branch[];
  status?: string;
  isActive?: boolean;
};

function normalizeBranches(data: unknown): Branch[] {
  if (Array.isArray(data)) {
    return data.map((branch) => ({
      id: (branch.id as string | undefined) ?? "",
      name: (branch.name as string | undefined) ?? "Branch",
      manager: branch.manager as string | undefined,
      status: branch.status as Branch["status"],
    }));
  }
  return [];
}

function resolveStatus(input: unknown): "active" | "suspended" {
  if (typeof input === "string") {
    const value = input.toLowerCase();
    if (value.includes("suspend")) {
      return "suspended";
    }
  }
  if (typeof input === "boolean") {
    return input ? "active" : "suspended";
  }
  return "active";
}

export default function PartnerDetailsPage({ params }: PartnerDetailsProps) {
  const [partner, setPartner] = useState<PartnerData | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    apiGet<PartnerData>(`/partners/${params.id}`)
      .then((result) => {
        if (!isMounted) {
          return;
        }
        if (!result.ok) {
          setError(result.error ?? "Failed to load partner.");
          return;
        }

        const partnerData = result.data;
        if (!partnerData) {
          setError("Partner not found.");
          return;
        }

        setPartner(partnerData);
        const branchesList =
          normalizeBranches(partnerData.branches ?? partnerData.branchList) ?? [];
        setBranches(branchesList);
      })
      .catch(() => {
        if (isMounted) {
          setError("Failed to load partner.");
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
  }, [params.id]);

  const partnerName =
    partner?.name ?? partner?.partnerName ?? "Unknown Partner";
  const partnerEmail = partner?.email ?? partner?.contactEmail ?? "";

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Partner Details
        </p>
        <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
          {isLoading ? "Loading..." : partnerName}
        </h2>
        {partnerEmail && (
          <p className="mt-1 text-sm text-slate-500">{partnerEmail}</p>
        )}
        <p className="mt-2 text-sm text-slate-500">
          Manage branch status, access, and password resets.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_18px_50px_-45px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-[0_18px_50px_-40px_rgba(15,23,42,0.4)]">
        <div className="overflow-x-auto">
          {isLoading && (
            <div className="px-6 py-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[var(--brand-teal)] border-r-transparent"></div>
              <p className="mt-3 text-sm text-slate-500">Loading partner details...</p>
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
          {!isLoading && !error && branches.length === 0 && (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              <svg className="mx-auto mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-6 0h6" />
              </svg>
              No branches found for this partner.
            </div>
          )}
          {!isLoading && !error && branches.length > 0 && (
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100/50 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Branch</th>
                  <th className="px-6 py-4 font-semibold">Manager</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="odd:bg-white even:bg-slate-50/30 transition-all duration-200 hover:bg-[var(--brand-teal)]/5 hover:shadow-sm"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {branch.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {branch.manager ?? "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill
                        value={
                          branch.status ??
                          resolveStatus(partner?.status ?? partner?.isActive)
                        }
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition-all duration-200 hover:border-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/5 hover:text-[var(--brand-teal)] hover:shadow-md">
                          {branch.status === "active" ? "Suspend" : "Activate"}
                        </button>
                        <button className="rounded-lg bg-[var(--brand-gold)]/20 px-3 py-1.5 text-xs font-semibold text-[var(--brand-teal)] shadow-sm transition-all duration-200 hover:bg-[var(--brand-gold)]/30 hover:shadow-md">
                          Reset password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}
