"use client";

import { useEffect, useState } from "react";
import StatusPill from "./StatusPill";
import { apiGet } from "@/lib/api";

type RecipientModalProps = {
  isOpen: boolean;
  onClose: () => void;
  recipientId: string;
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

export default function RecipientModal({
  isOpen,
  onClose,
  recipientId,
}: RecipientModalProps) {
  const [recipient, setRecipient] = useState<Record<string, unknown> | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !recipientId) return;

    setIsLoading(true);
    setError(null);

    apiGet<unknown>("/recipients")
      .then((result) => {
        if (!result.ok || !result.data) {
          setError(result.error ?? "Failed to load recipient.");
          return;
        }

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

        const foundRecipient = recipientList.find((r: unknown) => {
          if (r && typeof r === "object") {
            const recipient = r as Record<string, unknown>;
            const id =
              (recipient.id as string | undefined) ??
              (recipient.recipientId as string | undefined);
            return id === recipientId;
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
        setError("Failed to load recipient.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, recipientId]);

  if (!isOpen) return null;

  const recipientName = recipient ? formatName(recipient) : "Recipient";
  const familyMembersRaw =
    (recipient?.familyMembers as unknown) ??
    (recipient?.familyMembersList as unknown) ??
    (recipient?.family as unknown) ??
    (recipient?.householdMembers as unknown) ??
    [];
  const familyMembers = Array.isArray(familyMembersRaw) ? familyMembersRaw : [];
  const familyMembersCount =
    familyMembers.length ||
    (recipient?.familyMembersCount as number | undefined) ||
    (recipient?.familyCount as number | undefined) ||
    0;
  const requestsRaw =
    (recipient?.requests as unknown) ??
    (recipient?.requestsList as unknown) ??
    [];
  const requests = Array.isArray(requestsRaw) ? requestsRaw : [];
  const requestsCount =
    requests.length ||
    (recipient?.requestsCount as number | undefined) ||
    (recipient?.requestCount as number | undefined) ||
    0;
  const charity = recipient?.charity as Record<string, unknown> | undefined;
  const caseStatus = resolveCaseStatus(
    recipient?.caseStatus ?? recipient?.isClosed
  );

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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Recipient Details
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {recipientName}
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
              <p className="mt-3 text-sm text-slate-500">
                Loading recipient details...
              </p>
            </div>
          )}

          {error && !isLoading && (
            <div className="py-16 text-center">
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
              <p className="text-sm text-rose-500">{error}</p>
            </div>
          )}

          {!isLoading && !error && recipient && (
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-white p-6 shadow-[0_14px_45px_-35px_rgba(15,23,42,0.45)]">
              <div className="divide-y divide-slate-100 text-sm">
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Status</span>
                  <StatusPill value={caseStatus === "open" ? "active" : "inactive"} />
                </div>
                {!!recipient?.nationalId && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">National ID</span>
                    <span className="font-semibold text-slate-900">
                      {String(recipient.nationalId)}
                    </span>
                  </div>
                )}
                {!!(recipient?.phoneNumber || recipient?.phone) && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Phone</span>
                    <span className="font-semibold text-slate-900">
                      {String(
                        (recipient.phoneNumber as string | undefined) ??
                          (recipient.phone as string | undefined)
                      )}
                    </span>
                  </div>
                )}
                {!!recipient?.address && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Address</span>
                    <span className="font-semibold text-slate-900 max-w-xs truncate">
                      {String(recipient.address)}
                    </span>
                  </div>
                )}
                {!!recipient?.job && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Job</span>
                    <span className="font-semibold text-slate-900">
                      {String(recipient.job)}
                    </span>
                  </div>
                )}
                {!!(charity?.name || charity?.charityName) && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Charity</span>
                    <span className="font-semibold text-slate-900">
                      {String(
                        (charity.name as string | undefined) ??
                          (charity.charityName as string | undefined)
                      )}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Family Members</span>
                  <span className="font-semibold text-slate-900">
                    {familyMembersCount}
                  </span>
                </div>
                {familyMembers.length > 0 && (
                  <div className="py-3">
                    <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                      Family List
                    </span>
                    <div className="mt-3 space-y-2">
                      {familyMembers.map((member, index) => {
                        const record = member as Record<string, unknown>;
                        const firstName = (record.firstName as string | undefined) ?? "";
                        const lastName = (record.lastName as string | undefined) ?? "";
                        const fullName = `${firstName} ${lastName}`.trim();
                        const name =
                          fullName ||
                          (record.name as string | undefined) ||
                          `Member ${index + 1}`;
                        const relation =
                          (record.relation as string | undefined) ??
                          (record.relationship as string | undefined) ??
                          (record.role as string | undefined) ??
                          undefined;

                        return (
                          <div
                            key={`${name}-${index}`}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                          >
                            <span className="font-semibold text-slate-900">{name}</span>
                            {relation && (
                              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                {relation}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Requests</span>
                  <span className="font-semibold text-slate-900">
                    {requestsCount}
                  </span>
                </div>
                {recipient?.monthlyIncome !== undefined && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Monthly Income</span>
                    <span className="font-semibold text-slate-900">
                      {Number(recipient.monthlyIncome).toLocaleString()} EGP
                    </span>
                  </div>
                )}
                {recipient?.monthlyAssistance !== undefined && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Monthly Assistance</span>
                    <span className="font-semibold text-slate-900">
                      {Number(recipient.monthlyAssistance).toLocaleString()} EGP
                    </span>
                  </div>
                )}
                {!!recipient?.maritalStatus && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Marital Status</span>
                    <span className="font-semibold text-slate-900">
                      {String(recipient.maritalStatus)}
                    </span>
                  </div>
                )}
                {!!recipient?.educationLevel && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Education</span>
                    <span className="font-semibold text-slate-900">
                      {String(recipient.educationLevel)}
                    </span>
                  </div>
                )}
                {!!recipient?.employmentStatus && (
                  <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Employment</span>
                    <span className="font-semibold text-slate-900">
                      {String(recipient.employmentStatus)}
                    </span>
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
