import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative px-4 pb-[120px] pt-[160px] sm:px-6">
      <div className="mx-auto max-w-[900px] text-center">
        <h1
          className="mx-auto font-bold leading-[1.05] text-[var(--foreground)]"
          style={{ fontSize: "clamp(2.5rem, 8vw, 96px)", fontWeight: 800 }}
        >
          Master the Art of{" "}
          <span className="bg-[image:var(--gradient-flare)] bg-clip-text text-transparent">
            K-Beauty
          </span>
        </h1>

        <p
          className="mx-auto mt-6 text-zinc-600"
          style={{
            fontSize: "clamp(1.125rem, 2vw, 22px)",
            maxWidth: "650px",
            lineHeight: 1.5,
          }}
        >
          Learn professional K-Beauty Skincare and Makeup techniques from Korea&apos;s leading experts.
        </p>

        <div className="mt-8">
          <Link
            href="/glass-skin"
            className="inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-7 py-3.5 font-semibold text-white transition-colors hover:bg-[var(--flare-support-2)]"
            style={{ fontWeight: 600 }}
          >
            Get Free Skincare Guide
          </Link>
        </div>

        <div className="mt-8 flex justify-center">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-10 w-10 shrink-0 rounded-[10px] border-2 border-white bg-zinc-200 first:ml-0 last:mr-0"
                style={{
                  marginLeft: i === 1 ? 0 : -8,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <p
          className="mx-auto mt-4 text-zinc-500"
          style={{ fontSize: "15px", lineHeight: 1.5 }}
        >
          Trusted by 10,000+ who have perfected their beauty routine with K Beauty Academy
        </p>

        <div className="mx-auto mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {["Skincare Masters", "Makeup Artists", "Beauty Influencers", "Editors"].map(
            (label) => (
              <span
                key={label}
                className="text-zinc-400"
                style={{ fontSize: "15px", fontWeight: 500 }}
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
