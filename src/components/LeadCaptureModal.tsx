"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LeadCaptureModalProps = {
  open: boolean;
  onClose: () => void;
  /** 유입 경로 (예: main, glass-skin). DB에 저장됩니다. */
  source?: string;
  /** 제출 성공 시 이동할 URL (예: /thank-you). 없으면 모달만 닫습니다. */
  successRedirect?: string;
  /** landing_pages.id — 리드 제출 시 lead_submissions에 저장 */
  landing_page_id?: string | null;
  /** lead_magnets.id — 리드 제출 시 lead_submissions에 저장 */
  lead_magnet_id?: string | null;
};

const COUNTRY_OPTIONS = [
  { code: "KR", label: "South Korea (+82)", dial: "+82" },
  { code: "US", label: "United States (+1)", dial: "+1" },
  { code: "JP", label: "Japan (+81)", dial: "+81" },
  { code: "GB", label: "United Kingdom (+44)", dial: "+44" },
];

export function LeadCaptureModal({ open, onClose, source = "main", successRedirect, landing_page_id, lead_magnet_id }: LeadCaptureModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [countryCode, setCountryCode] = useState("+82");
  const [phone, setPhone] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(1);
      setEmail("");
      setFirstName("");
      setPhone("");
      setMarketingConsent(false);
      setSubmitting(false);
      setError(null);
      return;
    }

    try {
      const locale =
        typeof window !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().locale
          : "";
      if (!locale) return;
      const lang = locale.split("-")[1] ?? locale.split("-")[0];
      const match = COUNTRY_OPTIONS.find((c) => c.code === lang.toUpperCase());
      if (match) {
        setCountryCode(match.dial);
      }
    } catch {
      // ignore locale errors
    }
  }, [open]);

  const progress = useMemo(() => {
    if (step === 1) return 33;
    if (step === 2) return 66;
    return 100;
  }, [step]);

  if (!open) return null;

  const validateStep = () => {
    setError(null);
    if (step === 1) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email.trim())) {
        setError("Please enter a valid email address.");
        return false;
      }
    }
    if (step === 2) {
      if (!firstName.trim()) {
        setError("Please enter your first name.");
        return false;
      }
    }
    if (step === 3) {
      const digits = phone.replace(/[^0-9]/g, "");
      if (digits.length < 7) {
        setError("Please enter a valid phone number.");
        return false;
      }
      if (!marketingConsent) {
        setError("You must agree to receive marketing communications.");
        return false;
      }
    }
    return true;
  };

  const handleNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep()) return;

    if (step < 3) {
      setStep((prev) => (prev === 1 ? 2 : 3));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const payload = {
        email: email.trim(),
        first_name: firstName.trim() || null,
        phone_number: phone.trim() || null,
        country_code: countryCode.trim() || null,
        marketing_consent: marketingConsent,
        source,
        ...(landing_page_id && { landing_page_id }),
        ...(lead_magnet_id && { lead_magnet_id }),
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      onClose();
      if (successRedirect) {
        router.push(successRedirect);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <h2 className="text-section-title text-[var(--foreground)] mb-4">
            What&apos;s your best email address?
          </h2>
          <p className="text-body text-zinc-600 mb-8">
            We&apos;ll send your free skincare guide to this email.
          </p>
          <form onSubmit={handleNext} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-[10px] border border-zinc-300 px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-[10px] bg-[var(--flare-support-1)] py-3 font-semibold text-body text-white transition-colors hover:bg-[var(--flare-support-2)]"
              disabled={submitting}
            >
              Next
            </button>
          </form>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <button
            type="button"
            className="mb-3 text-sm text-zinc-500 hover:text-zinc-700"
            onClick={() => {
              setError(null);
              setStep(1);
            }}
          >
            ← Back
          </button>
          <h2 className="text-section-title text-[var(--foreground)] mb-4">
            What&apos;s your first name so we can address you properly?
          </h2>
          <form onSubmit={handleNext} className="space-y-4">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
              className="w-full rounded-[10px] border border-zinc-300 px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full rounded-[10px] bg-[var(--flare-support-1)] py-3 font-semibold text-body text-white transition-colors hover:bg-[var(--flare-support-2)]"
              disabled={submitting}
            >
              Next
            </button>
          </form>
        </>
      );
    }

    return (
      <>
        <button
          type="button"
          className="mb-3 text-sm text-zinc-500 hover:text-zinc-700"
          onClick={() => {
            setError(null);
            setStep(2);
          }}
        >
          ← Back
        </button>
        <h2 className="text-section-title text-[var(--foreground)] mb-4">
          What&apos;s your phone number so our team can follow up?
        </h2>
        <form onSubmit={handleNext} className="space-y-4">
          <div className="flex gap-3">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className="w-32 rounded-[10px] border border-zinc-300 px-3 py-3 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c.code} value={c.dial}>
                  {c.label}
                </option>
              ))}
            </select>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone number"
              className="flex-1 rounded-[10px] border border-zinc-300 px-4 py-3 text-body focus:outline-none focus:ring-2 focus:ring-[var(--flare-support-2)]"
            />
          </div>
          <label className="flex items-start gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-[var(--flare-support-1)] focus:ring-[var(--flare-support-2)]"
            />
            <span>I agree to receive marketing communications.</span>
          </label>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full rounded-[10px] bg-[var(--flare-support-1)] py-3 font-semibold text-body text-white transition-colors hover:bg-[var(--flare-support-2)] disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Get the Guide"}
          </button>
        </form>
      </>
    );
  };

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onMouseDown={handleBackdropClick}
    >
      <div
        className="w-full max-w-[520px] rounded-[10px] bg-white p-6 shadow-xl sm:p-8"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="h-1.5 w-full rounded-[10px] bg-zinc-100">
            <div
              className="h-1.5 rounded-[10px] bg-[var(--flare-support-1)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            type="button"
            className="ml-4 text-zinc-400 hover:text-zinc-600"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {renderStep()}
      </div>
    </div>
  );
}

