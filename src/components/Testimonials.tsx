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
    <section id="testimonials" className="bg-[var(--background-alt)] px-4 py-28 md:py-36 sm:px-8">
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
              className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] p-10 shadow-soft-sm transition-all duration-300 hover:shadow-soft"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface-blush)] text-2xl">
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
