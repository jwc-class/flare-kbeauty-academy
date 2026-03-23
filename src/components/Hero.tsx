import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-[image:var(--gradient-flare-subtle)] px-4 pb-32 pt-40 sm:px-8 sm:pb-36 sm:pt-44">
      <div className="mx-auto max-w-[900px] text-center">
        <h1
          className="font-serif-heading mx-auto font-semibold leading-[1.08] text-[var(--foreground)]"
          style={{ fontSize: "clamp(2.5rem, 8vw, 5.5rem)", fontWeight: 600, letterSpacing: "0.02em" }}
        >
          Master the Art of{" "}
          <span className="bg-[image:var(--gradient-flare)] bg-clip-text text-transparent">
            K-Beauty
          </span>
        </h1>

        <p
          className="mx-auto mt-8 text-[var(--muted)]"
          style={{
            fontSize: "clamp(1.125rem, 2vw, 22px)",
            maxWidth: "650px",
            lineHeight: 1.7,
            letterSpacing: "0.02em",
          }}
        >
          Learn professional K-Beauty Skincare and Makeup techniques from Korea&apos;s leading experts.
        </p>

        <div className="mt-10">
          <Link
            href="/glass-skin"
            className="btn-cta"
          >
            Get Free Skincare Guide
          </Link>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-10 shrink-0 rounded-2xl border-2 border-white bg-[#f0e8e4] first:ml-0 last:mr-0"
                style={{
                  marginLeft: i === 1 ? 0 : -8,
                  boxShadow: "0 8px 24px rgba(61, 61, 61, 0.06)",
                }}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <p
          className="mx-auto mt-5 text-[var(--muted)]"
          style={{ fontSize: "15px", lineHeight: 1.65, letterSpacing: "0.02em" }}
        >
          Trusted by 10,000+ who have perfected their beauty routine with K Beauty Academy
        </p>

        <div className="mx-auto mt-14 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {["Skincare Masters", "Makeup Artists", "Beauty Influencers", "Editors"].map(
            (label) => (
              <span
                key={label}
                className="text-[#9a9a9a]"
                style={{ fontSize: "15px", fontWeight: 500, letterSpacing: "0.06em" }}
              >
                {label}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
