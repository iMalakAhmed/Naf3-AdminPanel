"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

type CreateCharityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

type CharityForm = {
  registrationNumber: string;
  charityName: string;
  address: string;
  bankAccountNumber: string;
  description: string;
  aim: string;
  vision: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhoneNumber: string;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://nafaa-frfve0gyfyatgzh0.uaenorth-01.azurewebsites.net";

const CREATE_CHARITY_ENDPOINT = "/charities";

const initialForm: CharityForm = {
  registrationNumber: "",
  charityName: "",
  address: "",
  bankAccountNumber: "",
  description: "",
  aim: "",
  vision: "",
  adminEmail: "",
  adminFirstName: "",
  adminLastName: "",
  adminPhoneNumber: "",
};

function createUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "00000000-0000-0000-0000-000000000000";
}

function getAuthToken() {
  if (typeof window === "undefined") return null;

  return (
    localStorage.getItem("token") ??
    localStorage.getItem("accessToken") ??
    localStorage.getItem("authToken")
  );
}

export default function CreateCharityModal({
  isOpen,
  onClose,
  onCreated,
}: CreateCharityModalProps) {
  const [form, setForm] = useState<CharityForm>(() => ({
    ...initialForm,
    registrationNumber: createUuid(),
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    return (
      form.registrationNumber.trim() &&
      form.charityName.trim() &&
      form.address.trim() &&
      form.bankAccountNumber.trim() &&
      form.description.trim() &&
      form.aim.trim() &&
      form.vision.trim() &&
      form.adminEmail.trim() &&
      form.adminFirstName.trim() &&
      form.adminLastName.trim() &&
      form.adminPhoneNumber.trim()
    );
  }, [form]);

  if (!isOpen) return null;

  const updateField = <K extends keyof CharityForm>(
    key: K,
    value: CharityForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      ...initialForm,
      registrationNumber: createUuid(),
    });
    setError(null);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    resetForm();
    onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canSubmit) {
      setError("Please fill in all charity and admin contact fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      charityId: form.registrationNumber.trim(),
      charityName: form.charityName.trim(),
      address: form.address.trim(),
      bankAccountNumber: form.bankAccountNumber.trim(),
      description: form.description.trim(),
      aim: form.aim.trim(),
      vision: form.vision.trim(),

      adminEmail: form.adminEmail.trim(),
      adminFirstName: form.adminFirstName.trim(),
      adminLastName: form.adminLastName.trim(),
      adminPhoneNumber: form.adminPhoneNumber.trim(),

      status: "pending",
      isActive: false,
    };

    try {
      const token = getAuthToken();

      const response = await fetch(
        `${API_BASE_URL}${CREATE_CHARITY_ENDPOINT}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(payload),
        }
      );

      const contentType = response.headers.get("content-type");

      const responseBody = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          typeof responseBody === "object" && responseBody !== null
            ? (responseBody.message as string | undefined) ??
              (responseBody.error as string | undefined) ??
              "Failed to create charity."
            : responseBody || "Failed to create charity.";

        throw new Error(message);
      }

      await onCreated();
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create charity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-slate-950/50 px-3 py-4 backdrop-blur-sm sm:px-6">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8d9cc3]">
              Create charity
            </p>

            <h2 className="font-display mt-2 text-2xl font-semibold text-slate-950">
              Add a new charity
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Submit charity details to appear in the admin panel list.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 sm:px-8">
          {error && (
            <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
              {error}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#8d9cc3]">
                Charity profile
              </p>

              <Field
                id="registrationNumber"
                label="Registration Number (UUID)"
                value={form.registrationNumber}
                onChange={(value) => updateField("registrationNumber", value)}
                placeholder="00000000-0000-0000-0000-000000000000"
              />

              <Field
                id="charityName"
                label="Charity Name"
                value={form.charityName}
                onChange={(value) => updateField("charityName", value)}
                placeholder="Nafaa Relief Initiative"
              />

              <Field
                id="address"
                label="Address"
                value={form.address}
                onChange={(value) => updateField("address", value)}
                placeholder="City, Country"
              />

              <Field
                id="bankAccountNumber"
                label="Bank Account Number"
                value={form.bankAccountNumber}
                onChange={(value) => updateField("bankAccountNumber", value)}
                placeholder="IBAN / Account number"
              />

              <TextareaField
                id="description"
                label="Description"
                value={form.description}
                onChange={(value) => updateField("description", value)}
                placeholder="Short overview of the charity"
              />

              <TextareaField
                id="aim"
                label="Aim"
                value={form.aim}
                onChange={(value) => updateField("aim", value)}
                placeholder="Primary mission or focus"
              />

              <TextareaField
                id="vision"
                label="Vision"
                value={form.vision}
                onChange={(value) => updateField("vision", value)}
                placeholder="Long-term vision for the charity"
              />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#8d9cc3]">
                Admin contact
              </p>

              <Field
                id="adminEmail"
                label="Admin Email"
                type="email"
                value={form.adminEmail}
                onChange={(value) => updateField("adminEmail", value)}
                placeholder="admin@charity.org"
              />

              <Field
                id="adminFirstName"
                label="Admin First Name"
                value={form.adminFirstName}
                onChange={(value) => updateField("adminFirstName", value)}
                placeholder="First name"
              />

              <Field
                id="adminLastName"
                label="Admin Last Name"
                value={form.adminLastName}
                onChange={(value) => updateField("adminLastName", value)}
                placeholder="Last name"
              />

              <Field
                id="adminPhoneNumber"
                label="Admin Phone Number"
                type="tel"
                value={form.adminPhoneNumber}
                onChange={(value) => updateField("adminPhoneNumber", value)}
                placeholder="+1 555 123 4567"
              />
            </section>
          </div>

          <div className="sticky bottom-0 -mx-6 mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur sm:-mx-8 sm:flex-row sm:justify-end sm:px-8">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !canSubmit}
              className="rounded-xl border border-[var(--brand-teal)] bg-[var(--brand-teal)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-300"
            >
              {isSubmitting ? "Creating..." : "Create charity"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: FieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-[#8d9cc3]"
      >
        {label}
      </label>

      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required
        className="block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold tracking-[0.18em] text-slate-700 shadow-sm outline-none transition placeholder:text-[#8d9cc3] focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
      />
    </div>
  );
}

type TextareaFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function TextareaField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: TextareaFieldProps) {
  return (
    <div className="mb-4">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.28em] text-[#8d9cc3]"
      >
        {label}
      </label>

      <textarea
        id={id}
        name={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        required
        className="block w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold tracking-[0.18em] text-slate-700 shadow-sm outline-none transition placeholder:text-[#8d9cc3] focus:border-[var(--brand-teal)] focus:ring-2 focus:ring-[var(--brand-teal)]/15"
      />
    </div>
  );
}