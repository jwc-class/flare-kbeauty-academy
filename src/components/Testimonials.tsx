const testimonials = [
  {
    name: "Sarah Kim",
    role: "Beauty Creator",
    content:
      "Thanks to K Beauty Academy's skincare course, my skin has completely transformed. I now know exactly which products to use and how.",
    avatar: "👩",
  },
  {
    name: "Jessica Lee",
    role: "Makeup Artist",
    content:
      "The techniques I learned from the makeup course have significantly increased my client satisfaction. Everything is practical and immediately applicable.",
    avatar: "👩‍🎨",
  },
  {
    name: "Emily Park",
    role: "Editor",
    content:
      "I learned both skincare and makeup with the all-in-one package. The 5-minute makeup routine is a total game-changer!",
    avatar: "👩‍💼",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-28 md:py-36 px-4 sm:px-8 bg-[#fefcfb]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-section-title text-[var(--foreground)]">
            What our students say about K Beauty Academy
          </h2>
          <p className="mt-8 text-body-lg text-[var(--muted)]">
            Read authentic reviews from our students.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-10 rounded-2xl bg-[#fcfbfa] border border-[#f0ebe8] shadow-soft-sm transition-all duration-300 hover:shadow-soft"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-[#fef8fa] border border-[#f0ebe8] flex items-center justify-center text-2xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)] text-body">{t.name}</p>
                  <p className="text-body text-[var(--muted)]">{t.role}</p>
                </div>
              </div>
              <p className="text-body text-[var(--foreground-soft)] leading-relaxed">&ldquo;{t.content}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
