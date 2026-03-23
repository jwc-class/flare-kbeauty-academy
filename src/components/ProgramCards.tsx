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
    <section id="features" className="py-28 md:py-36 px-4 sm:px-8 bg-[#fffbf7]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-section-title text-[var(--foreground)]">
            No fluff. Just real courses, support, and community.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto mb-28">
          {programs.map((program) => (
            <Link
              key={program.title}
              href={program.href}
              className="group block p-10 rounded-2xl bg-[#fcfbfa] border border-[#f0ebe8] hover:border-[#e8d4dc]/70 transition-all duration-300 ease-in-out shadow-soft-sm hover:shadow-soft hover:-translate-y-0.5"
            >
              <div className="flex items-start gap-6">
                <span className="text-4xl">{program.icon}</span>
                <div>
                  <h3 className="text-card-title text-[var(--foreground)] group-hover:text-[var(--cta-rose-deep)] transition-colors duration-300">
                    {program.title}
                  </h3>
                  <p className="mt-3 text-body text-[var(--foreground-soft)]">{program.description}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-[var(--cta-rose-deep)] font-semibold text-body">
                    Learn more
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-section-title text-[var(--foreground)]">
            Build a beauty routine that works for you.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {pillars.map((item) => (
            <div
              key={item.title}
              className="p-9 rounded-2xl bg-[#faf7fc]/80 text-center border border-[#f0ebe8] shadow-soft-sm"
            >
              <span className="text-4xl block mb-5">{item.icon}</span>
              <h4 className="text-card-title text-[var(--foreground)]">{item.title}</h4>
              <p className="mt-3 text-body text-[var(--foreground-soft)]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
