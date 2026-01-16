"use client";

import StatusPill from "./StatusPill";

type PartnerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partner: {
    id: string;
    name: string;
    email: string;
    status: "active" | "suspended" | "inactive";
  };
};

export default function PartnerModal({ isOpen, onClose, partner }: PartnerModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl max-h-[90vh] animate-fadeIn overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_-55px_rgba(12,31,42,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-teal-soft)] to-[var(--brand-gold)]" />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-slate-200/60" />
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Partner Details
            </p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              {partner.name}
            </h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill value={partner.status} />
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
          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-white p-6 shadow-[0_14px_45px_-35px_rgba(15,23,42,0.45)]">
            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Email
                </span>
                <span className="font-semibold text-slate-900">{partner.email}</span>
              </div>
              <div className="flex items-center justify-between py-3 transition-colors hover:bg-slate-50/70">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Partner ID
                </span>
                <span className="font-mono text-xs text-slate-600">{partner.id}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
