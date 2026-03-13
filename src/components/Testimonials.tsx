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
    <section id="testimonials" className="py-[120px] px-4 sm:px-6 bg-white">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-section-title text-[var(--foreground)]">
            What our students say about K Beauty Academy
          </h2>
          <p className="mt-6 text-body-lg text-zinc-600">
            Read authentic reviews from our students.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="p-8 rounded-[10px] bg-[var(--background)] border border-zinc-100"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-[10px] bg-white border border-zinc-200 flex items-center justify-center text-2xl">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)] text-body">{t.name}</p>
                  <p className="text-body text-zinc-500">{t.role}</p>
                </div>
              </div>
              <p className="text-body text-zinc-600 leading-relaxed">&ldquo;{t.content}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
