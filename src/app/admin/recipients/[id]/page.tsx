"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatusPill from "../../components/StatusPill";
import { apiGet } from "@/lib/api";

type RecipientDetailsProps = {
  params: { id: string };
};

function formatName(recipient: Record<string, unknown>): string {
  const firstName = (recipient.firstName as string | undefined) ?? "";
  const lastName = (recipient.lastName as string | undefined) ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  return fullName || (recipient.name as string | undefined) || "Unknown Recipient";
}

function resolveCaseStatus(input: unknown): "open" | "closed" {
  if (typeof input === "string") {
    const value = input.toLowerCase();
    if (value.includes("close")) return "closed";
  }
  if (typeof input === "boolean") {
    return input ? "open" : "closed";
  }
  return "open";
}

export default function RecipientDetailsPage({ params }: RecipientDetailsProps) {
  const router = useRouter();
  const [recipient, setRecipient] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fetch all recipients and find the matching one
    apiGet<unknown>("/recipients")
      .then((result) => {
        if (!isMounted) return;
        if (!result.ok || !result.data) {
          setError(result.error ?? "Failed to load recipient.");
          return;
        }

        // Parse the response to get the recipient list
        const data = result.data;
        let recipientList: unknown[] = [];
        
        if (Array.isArray(data)) {
          recipientList = data;
        } else if (data && typeof data === "object") {
          const record = data as Record<string, unknown>;
          if (Array.isArray(record.recipients)) {
            recipientList = record.recipients;
          } else if (Array.isArray(record.data)) {
            recipientList = record.data;
          } else if (Array.isArray(record.items)) {
            recipientList = record.items;
          } else if (Array.isArray(record.results)) {
            recipientList = record.results;
          }
        }

        // Find the recipient with matching ID
        const foundRecipient = recipientList.find((r: unknown) => {
          if (r && typeof r === "object") {
            const recipient = r as Record<string, unknown>;
            const recipientId = (recipient.id as string | undefined) ?? (recipient.recipientId as string | undefined);
            return recipientId === params.id;
          }
          return false;
        });

        if (foundRecipient && typeof foundRecipient === "object") {
          setRecipient(foundRecipient as Record<string, unknown>);
          setError(null);
        } else {
          setError("Recipient not found.");
        }
      })
      .catch(() => {
        if (isMounted) setError("Failed to load recipient.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [params.id]);

  if (!recipient && !isLoading && !error) return null;

  const recipientName = recipient ? formatName(recipient) : "Loading...";
  const familyMembers = (recipient?.familyMembers as unknown[]) ?? (recipient?.familyMembersList as unknown[]) ?? [];
  const familyMembersCount = Array.isArray(familyMembers) ? familyMembers.length : 0;
  const requests = (recipient?.requests as unknown[]) ?? (recipient?.requestsList as unknown[]) ?? [];
  const requestsCount = Array.isArray(requests) ? requests.length : 0;
  const charity = recipient?.charity as Record<string, unknown> | undefined;
  const nationalId = recipient?.nationalId as string | number | undefined;
  const phoneNumber = (recipient?.phoneNumber as string | undefined) ?? (recipient?.phone as string | undefined);
  const address = recipient?.address as string | undefined;
  const job = recipient?.job as string | undefined;
  const dateOfBirth = recipient?.dateOfBirth as string | undefined;
  const charityName = (charity?.name as string | undefined) ?? (charity?.charityName as string | undefined);
  const monthlyIncome = recipient?.monthlyIncome as number | string | undefined;
  const monthlyAssistance = recipient?.monthlyAssistance as number | string | undefined;
  const maritalStatus = recipient?.maritalStatus as string | undefined;
  const educationLevel = recipient?.educationLevel as string | undefined;
  const employmentStatus = recipient?.employmentStatus as string | undefined;

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Recipient Details
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">{recipientName}</h2>
            {!!nationalId && (
              <p className="mt-1 text-sm text-slate-500">
                National ID: {String(nationalId)}
              </p>
            )}
            {recipient && (
              <div className="mt-4">
                <StatusPill
                  value={
                    resolveCaseStatus(recipient.caseStatus ?? recipient.isClosed) === "open"
                      ? "active"
                      : "inactive"
                  }
                />
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
          <p className="mt-3 text-sm text-slate-500">Loading recipient details...</p>
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

      {!isLoading && !error && recipient && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
            <h3 className="text-lg font-semibold text-slate-900">Personal Information</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-900">{recipientName}</span>
              </div>
              {!!nationalId && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">National ID:</span>
                  <span className="font-semibold text-slate-900">{String(nationalId)}</span>
                </div>
              )}
              {!!phoneNumber && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-900">
                    {String(phoneNumber)}
                  </span>
                </div>
              )}
              {!!address && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Address:</span>
                  <span className="font-semibold text-slate-900 max-w-xs truncate">{String(address)}</span>
                </div>
              )}
              {!!job && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Job:</span>
                  <span className="font-semibold text-slate-900">{String(job)}</span>
                </div>
              )}
              {!!dateOfBirth && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Date of Birth:</span>
                  <span className="font-semibold text-slate-900">
                    {new Date(dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-[0_22px_60px_-50px_rgba(2,44,43,0.35)] backdrop-blur transition-all duration-300 hover:shadow-[0_22px_60px_-40px_rgba(2,44,43,0.4)]">
            <h3 className="text-lg font-semibold text-slate-900">Case Information</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Case Status:</span>
                <StatusPill
                  value={
                    resolveCaseStatus(recipient.caseStatus ?? recipient.isClosed) === "open"
                      ? "active"
                      : "inactive"
                  }
                />
              </div>
              {!!charityName && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Charity:</span>
                  <span className="font-semibold text-slate-900">
                    {String(charityName)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Family Members:</span>
                <span className="font-semibold text-slate-900">{familyMembersCount}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Requests:</span>
                <span className="font-semibold text-slate-900">{requestsCount}</span>
              </div>
              {monthlyIncome !== undefined && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Monthly Income:</span>
                  <span className="font-semibold text-slate-900">
                    {Number(monthlyIncome).toLocaleString()} EGP
                  </span>
                </div>
              )}
              {monthlyAssistance !== undefined && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Monthly Assistance:</span>
                  <span className="font-semibold text-slate-900">
                    {Number(monthlyAssistance).toLocaleString()} EGP
                  </span>
                </div>
              )}
              {!!maritalStatus && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Marital Status:</span>
                  <span className="font-semibold text-slate-900">{String(maritalStatus)}</span>
                </div>
              )}
              {!!educationLevel && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Education:</span>
                  <span className="font-semibold text-slate-900">{String(educationLevel)}</span>
                </div>
              )}
              {!!employmentStatus && (
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Employment:</span>
                  <span className="font-semibold text-slate-900">{String(employmentStatus)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
