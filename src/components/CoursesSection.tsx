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
    <section id="courses" className="py-[120px] px-4 sm:px-6 bg-[var(--background)]">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-section-title text-[var(--foreground)]">
            Real courses. Real results.
          </h2>
          <p className="mt-6 text-body-lg text-zinc-600">
            Skincare and makeup courses taught directly by K-Beauty experts.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.id}
              className={`relative rounded-[10px] bg-white p-8 border transition-shadow hover:shadow-lg ${
                course.featured ? "ring-2 ring-[var(--flare-support-1)] lg:-translate-y-1" : "border-zinc-100"
              }`}
            >
              {course.featured && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--flare-support-1)] text-white text-sm font-semibold px-4 py-1.5 rounded-[10px]">
                  Popular
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-card-title text-[var(--foreground)]">{course.title}</h3>
                <p className="mt-1 text-body text-zinc-500">{course.subtitle}</p>
              </div>
              <p className="text-body text-zinc-600 mb-6">{course.description}</p>
              <ul className="space-y-3 mb-8">
                {course.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-body">
                    <span className="text-[var(--flare-support-1)]">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-bold text-[var(--foreground)]">{course.price}</span>
                {course.originalPrice && (
                  <span className="text-body text-zinc-400 line-through">{course.originalPrice}</span>
                )}
              </div>
              <Link
                href="/glass-skin"
                className={`block w-full text-center py-4 rounded-[10px] font-semibold text-body transition-colors ${
                  course.featured
                    ? "bg-[image:var(--gradient-flare)] text-white hover:opacity-95"
                    : "bg-[var(--flare-support-1)] text-white hover:bg-[var(--flare-support-2)]"
                }`}
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
