import Link from "next/link";

export default function EmailCapture() {
  return (
    <section className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
      <div className="max-w-[720px] mx-auto text-center">
        <p className="text-body-lg text-zinc-600 mb-6">
          More than 100,000 have signed up to learn how to build their perfect K-Beauty routine.
        </p>
        <h2 className="text-section-title text-[var(--foreground)]">
          Get the email series that unpacks our Skincare GPS—built to help you find the right routine for your skin.
        </h2>
        <div className="mt-12">
          <Link
            href="/glass-skin"
            className="inline-flex items-center justify-center px-8 py-4 bg-[var(--flare-support-1)] text-white rounded-[10px] font-semibold text-body hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
          >
            Get the Free Guide
          </Link>
        </div>
      </div>
    </section>
  );
}
