export default function ProblemSection() {
  const features = [
    { title: "Community", description: "Connect with fellow K-Beauty lovers, share tips, and level up together.", icon: "👥" },
    { title: "Clear Guidance", description: "Find the perfect skincare routine for your skin type and goals.", icon: "🎯" },
    { title: "Step-by-Step Curriculum", description: "Master makeup from basics to advanced techniques with structured classes.", icon: "📚" },
    { title: "Expert Feedback", description: "Complete your signature style with real-time feedback from beauty experts.", icon: "✨" },
    { title: "Content System", description: "Build your own beauty brand with repeatable content creation methods.", icon: "📱" },
    { title: "Step-by-Step Guide", description: "Efficient 5-minute morning makeup routine that saves you time.", icon: "⏱️" },
  ];

  return (
    <section id="problem" className="py-28 md:py-36 px-4 sm:px-8 bg-[#fefcfb]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-section-title text-[var(--foreground)]">
            Too many products, not sure how to use them?
          </h2>
          <p className="mt-8 text-body-lg text-[var(--muted)]">
            K Beauty Academy is a structured learning system for your perfect beauty routine.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-10 rounded-2xl bg-[var(--background-pastel-pink)]/40 border border-[#f2e8e4] hover:border-[#e8d4dc]/60 transition-all duration-300 ease-in-out shadow-soft-sm hover:shadow-soft"
            >
              <div className="text-3xl mb-5">{feature.icon}</div>
              <h3 className="text-card-title text-[var(--foreground)]">{feature.title}</h3>
              <p className="mt-4 text-body text-[var(--foreground-soft)] leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
