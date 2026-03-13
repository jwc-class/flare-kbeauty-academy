import Link from "next/link";

const programs = [
  { title: "Skincare Master", description: "7-step routine for perfect skin", href: "#courses", icon: "💆‍♀️" },
  { title: "Makeup Artist", description: "Complete your signature look", href: "#courses", icon: "💄" },
];

const pillars = [
  { title: "Skincare Basics", description: "Attract your dream customers", icon: "🧴" },
  { title: "Makeup Templates", description: "Turn vision into execution", icon: "🎨" },
  { title: "Beauty Framework", description: "Convert attention to opportunity", icon: "✨" },
  { title: "Community", description: "Grow together, not alone", icon: "👥" },
];

export default function ProgramCards() {
  return (
    <section id="features" className="py-[120px] px-4 sm:px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-section-title text-[var(--foreground)]">
            No fluff. Just real courses, support, and community.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-24">
          {programs.map((program) => (
            <Link
              key={program.title}
              href={program.href}
              className="group block p-10 rounded-[10px] bg-[var(--background)] border border-zinc-100 hover:border-[var(--flare-support-2)]/40 transition-colors"
            >
              <div className="flex items-start gap-5">
                <span className="text-4xl">{program.icon}</span>
                <div>
                  <h3 className="text-card-title text-[var(--foreground)] group-hover:text-[var(--flare-support-1)] transition-colors">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-body text-zinc-600">{program.description}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-[var(--flare-support-1)] font-semibold text-body">
                    Learn more
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-section-title text-[var(--foreground)]">
            Build a beauty routine that works for you.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="p-8 rounded-[10px] bg-[var(--background)] text-center border border-zinc-100"
            >
              <span className="text-4xl block mb-4">{item.icon}</span>
              <h4 className="text-card-title text-[var(--foreground)]">{item.title}</h4>
              <p className="mt-2 text-body text-zinc-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
