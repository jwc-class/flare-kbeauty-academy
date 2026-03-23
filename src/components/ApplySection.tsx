import Link from "next/link";

export default function ApplySection() {
  return (
    <section id="apply" className="py-28 md:py-36 px-4 sm:px-8 bg-[#fefcfb]">
      <div className="max-w-[560px] mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-section-title text-[var(--foreground)]">
            Join thousands of K-Beauty lovers
          </h2>
          <p className="mt-8 text-body-lg text-[var(--muted)]">
            Get personalized course recommendations through our free consultation.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/glass-skin"
            className="btn-cta w-full min-h-[56px] sm:w-auto text-body-lg"
          >
            Get the Free Guide
          </Link>
        </div>
      </div>
    </section>
  );
}
