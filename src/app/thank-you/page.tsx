import Link from "next/link";

export const metadata = {
  title: "Thank You | K Beauty Academy",
  description: "Your free guide is on the way.",
};

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4">
      <div className="max-w-[560px] w-full text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-[10px] bg-[var(--flare-support-3)]/20 text-4xl mb-8">
          ✓
        </div>
        <h1 className="text-section-title text-[var(--foreground)] font-bold">
          Check your inbox
        </h1>
        <p className="mt-6 text-body text-zinc-600 leading-relaxed">
          Your free Korean Glass Skin Blueprint is on the way. We&apos;ve sent it to the email you provided.
        </p>
        <p className="mt-4 text-body text-zinc-500">
          Can&apos;t find it? Check your spam folder.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/glass-skin"
            className="inline-flex items-center justify-center rounded-[10px] border-2 border-[var(--flare-support-2)] text-[var(--flare-support-1)] px-6 py-3.5 font-semibold text-body hover:bg-[var(--flare-support-3)]/10 transition-colors"
          >
            Back to Glass Skin Guide
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-6 py-3.5 font-semibold text-body text-white hover:bg-[var(--flare-support-2)] transition-colors"
          >
            Visit K Beauty Academy
          </Link>
        </div>
      </div>
    </div>
  );
}
