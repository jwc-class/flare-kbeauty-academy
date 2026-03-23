import Link from "next/link";

const courses = [
  {
    id: "skincare",
    title: "Skincare Master",
    subtitle: "From basics to advanced for perfect skin",
    description:
      "Learn everything about K-Beauty skincare—cleansing, toner, serum, moisturizer. Complete a custom routine tailored to your skin type.",
    features: [
      "Custom skin type analysis",
      "7-step skincare routine",
      "Product selection guide",
      "Seasonal skincare strategies",
    ],
    price: "$198",
    cta: "Enroll in Skincare Course",
    featured: false,
  },
  {
    id: "makeup",
    title: "Makeup Artist",
    subtitle: "Complete your signature makeup style",
    description:
      "From daily makeup to glam looks for special occasions. Master K-Beauty makeup techniques and create your signature look.",
    features: [
      "Base makeup fundamentals",
      "Eye makeup techniques",
      "Lip & cheek color matching",
      "5-minute daily look",
    ],
    price: "$248",
    cta: "Enroll in Makeup Course",
    featured: false,
  },
  {
    id: "bundle",
    title: "All-in-One Package",
    subtitle: "Skincare + Makeup combined",
    description:
      "Learn skincare and makeup together! Our most popular package—get everything K-Beauty has to offer at 20% off.",
    features: [
      "Full Skincare Master course",
      "Full Makeup Artist course",
      "2x 1:1 feedback sessions",
      "Lifetime community access",
    ],
    price: "$358",
    originalPrice: "$446",
    cta: "Get the Package",
    featured: true,
  },
];

export default function CoursesSection() {
  return (
    <section id="courses" className="py-28 md:py-36 px-4 sm:px-8 bg-[var(--background-pastel-lavender)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h2 className="text-section-title text-[var(--foreground)]">
            Real courses. Real results.
          </h2>
          <p className="mt-8 text-body-lg text-[var(--muted)]">
            Skincare and makeup courses taught directly by K-Beauty experts.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-10">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`relative rounded-2xl bg-[#fcfbfa] p-10 border transition-all duration-300 ease-in-out shadow-soft hover:shadow-soft-sm hover:-translate-y-0.5 ${
                course.featured ? "ring-2 ring-[#d4b5a5]/80 lg:-translate-y-1" : "border-[#f0ebe8]"
              }`}
            >
              {course.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[image:var(--gradient-cta)] text-white text-sm font-semibold px-5 py-2 rounded-2xl shadow-soft-sm">
                  Popular
                </span>
              )}
              <div className="mb-8">
                <h3 className="text-card-title text-[var(--foreground)]">{course.title}</h3>
                <p className="mt-2 text-body text-[var(--muted)]">{course.subtitle}</p>
              </div>
              <p className="text-body text-[var(--foreground-soft)] mb-8 leading-relaxed">{course.description}</p>
              <ul className="space-y-3 mb-10">
                {course.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-body text-[var(--foreground-soft)]">
                    <span className="text-[var(--cta-rose-deep)]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-2xl font-semibold text-[var(--foreground)]">{course.price}</span>
                {course.originalPrice && (
                  <span className="text-body text-[#b0b0b0] line-through">{course.originalPrice}</span>
                )}
              </div>
              <Link
                href="/glass-skin"
                className="btn-cta block w-full py-4"
              >
                {course.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
