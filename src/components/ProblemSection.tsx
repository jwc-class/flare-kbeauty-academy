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
    <section id="problem" className="py-[120px] px-4 sm:px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-section-title text-[var(--foreground)]">
            Too many products, not sure how to use them?
          </h2>
          <p className="mt-6 text-body-lg text-zinc-600">
            K Beauty Academy is a structured learning system for your perfect beauty routine.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="p-8 rounded-[10px] bg-[var(--background)] border border-zinc-100 hover:border-[var(--flare-support-3)]/30 transition-colors"
            >
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-card-title text-[var(--foreground)]">{feature.title}</h3>
              <p className="mt-3 text-body text-zinc-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
