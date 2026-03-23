import Link from "next/link";

export default function EmailCapture() {
  return (
    <section className="py-28 md:py-36 px-4 sm:px-8 bg-[image:var(--gradient-flare-subtle)]">
      <div className="max-w-[720px] mx-auto text-center">
        <p className="text-body-lg text-[var(--muted)] mb-8">
          More than 100,000 have signed up to learn how to build their perfect K-Beauty routine.
        </p>
        <h2 className="text-section-title text-[var(--foreground)]">
          Get the email series that unpacks our Skincare GPS—built to help you find the right routine for your skin.
        </h2>
        <div className="mt-14">
          <Link
            href="/glass-skin"
            className="btn-cta min-h-[56px]"
          >
            Get the Free Guide
          </Link>
        </div>
      </div>
    </section>
  );
}
