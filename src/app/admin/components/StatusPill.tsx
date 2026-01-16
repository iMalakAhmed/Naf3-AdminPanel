"use client";

type StatusVariant =
  | "active"
  | "inactive"
  | "pending"
  | "suspended"
  | "rejected"
  | "approved";

const variantStyles: Record<StatusVariant, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
  inactive: "bg-slate-50 text-slate-600 border-slate-200/70",
  pending: "bg-amber-50 text-amber-700 border-amber-200/70",
  suspended: "bg-rose-50 text-rose-700 border-rose-200/70",
  rejected: "bg-rose-50 text-rose-700 border-rose-200/70",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200/70",
};

export default function StatusPill({
  value,
}: {
  value: StatusVariant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${variantStyles[value]}`}
    >
      {value}
    </span>
  );
}
