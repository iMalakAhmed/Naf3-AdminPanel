"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { apiPost } from "@/lib/api";

const EMPTY_FORM = {
  registrationNumber: "",
  charityName: "",
  address: "",
  description: "",
  aim: "",
  vision: "",
  bankAccountNumber: "",
  adminEmail: "",
  adminFirstName: "",
  adminLastName: "",
  adminPhoneNumber: "",
};

type CreateCharityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
};

type CreateCharityForm = typeof EMPTY_FORM;

function buildPayload(form: CreateCharityForm) {
  const payload: Record<string, string> = {};
  (Object.keys(form) as Array<keyof CreateCharityForm>).forEach((key) => {
    const value = form[key].trim();
    if (value) {
      payload[key] = value;
    }
  });
  return payload;
}

export default function CreateCharityModal({
  isOpen,
  onClose,
  onCreated,
}: CreateCharityModalProps) {
  const [form, setForm] = useState<CreateCharityForm>({ ...EMPTY_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (field: keyof CreateCharityForm) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };

  const handleClose = () => {
    setError(null);
    setForm({ ...EMPTY_FORM });
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload = buildPayload(form);
    if (Object.keys(payload).length === 0) {
      setError("Please enter at least one field before submitting.");
      return;
    }

    setIsSubmitting(true);
    const result = await apiPost<unknown>("/charities", payload);
    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "Failed to create charity.");
      return;
    }
    onCreated();
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 px-4 py-8"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] animate-fadeIn overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-[0_28px_80px_-55px_rgba(12,31,42,0.65)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-[var(--brand-teal)] via-[var(--brand-teal-soft)] to-[var(--brand-gold)]" />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-slate-200/60" />
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Create Charity</p>
            <h2 className="font-display mt-2 text-2xl font-semibold tracking-tight text-slate-900">
              Add a new charity
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Submit charity details to appear in the admin panel list.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-[var(--brand-teal)] hover:text-[var(--brand-teal-strong)] hover:shadow-sm"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-white p-6 shadow-[0_14px_45px_-35px_rgba(15,23,42,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Charity profile</p>
              <div className="mt-4 grid gap-4">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Registration number (UUID)
                  <input
                    type="text"
                    value={form.registrationNumber}
                    onChange={handleChange("registrationNumber")}
                    placeholder="00000000-0000-0000-0000-000000000000"
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Charity name
                  <input
                    type="text"
                    value={form.charityName}
                    onChange={handleChange("charityName")}
                    placeholder="Nafaa Relief Initiative"
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Address
                  <input
                    type="text"
                    value={form.address}
                    onChange={handleChange("address")}
                    placeholder="City, Country"
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Bank account number
                  <input
                    type="text"
                    value={form.bankAccountNumber}
                    onChange={handleChange("bankAccountNumber")}
                    placeholder="IBAN / Account number"
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Description
                  <textarea
                    value={form.description}
                    onChange={handleChange("description")}
                    placeholder="Short overview of the charity"
                    rows={3}
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Aim
                  <textarea
                    value={form.aim}
                    onChange={handleChange("aim")}
                    placeholder="Primary mission or focus"
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Vision
                  <textarea
                    value={form.vision}
                    onChange={handleChange("vision")}
                    placeholder="Long-term vision for the charity"
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-50/80 via-white to-white p-6 shadow-[0_14px_45px_-35px_rgba(15,23,42,0.45)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Admin contact</p>
              <div className="mt-4 grid gap-4">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Admin email
                  <input
                    type="email"
                    value={form.adminEmail}
                    onChange={handleChange("adminEmail")}
                    placeholder="admin@charity.org"
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Admin first name
                  <input
                    type="text"
                    value={form.adminFirstName}
                    onChange={handleChange("adminFirstName")}
                    placeholder="First name"
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Admin last name
                  <input
                    type="text"
                    value={form.adminLastName}
                    onChange={handleChange("adminLastName")}
                    placeholder="Last name"
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Admin phone number
                  <input
                    type="tel"
                    value={form.adminPhoneNumber}
                    onChange={handleChange("adminPhoneNumber")}
                    placeholder="+1 555 123 4567"
                    className="mt-2 w-full rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
                  />
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {error}
            </div>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl border border-[var(--brand-teal)] bg-[var(--brand-teal)]/10 px-5 py-2 text-sm font-semibold text-[var(--brand-teal-strong)] shadow-sm transition-all duration-200 hover:border-[var(--brand-teal)] hover:bg-[var(--brand-teal)]/20 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Creating..." : "Create charity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
