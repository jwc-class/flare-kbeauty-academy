import Link from "next/link";

export default function ApplySection() {
  return (
    <section id="apply" className="py-[120px] px-4 sm:px-6 bg-white">
      <div className="max-w-[560px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-section-title text-[var(--foreground)]">
            Join thousands of K-Beauty lovers
          </h2>
          <p className="mt-6 text-body-lg text-zinc-600">
            Get personalized course recommendations through our free consultation.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/glass-skin"
            className="inline-flex items-center justify-center w-full sm:w-auto py-4 px-8 rounded-[10px] bg-[var(--flare-support-1)] text-white font-semibold text-body-lg hover:bg-[var(--flare-support-2)] transition-colors min-h-[56px]"
          >
            Get the Free Guide
          </Link>
        </div>
      </div>
    </section>
  );
}
