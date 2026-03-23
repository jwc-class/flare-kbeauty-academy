import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Purchase Complete | K Beauty Academy",
  description: "Welcome to the K-Beauty Glass Skin Masterclass.",
};

export default function PurchaseCompletePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="pt-[140px] pb-[120px] px-4 sm:px-6">
        <div className="max-w-[560px] mx-auto text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[10px] bg-[var(--flare-support-3)]/20 text-4xl mb-8">
            ✓
          </div>
          <h1 className="text-section-title text-[var(--foreground)] font-bold">
            You&apos;re in!
          </h1>
          <p className="mt-6 text-body-lg text-zinc-600 leading-relaxed">
            Your payment was successful. Welcome to the K-Beauty Glass Skin Masterclass.
          </p>
          <p className="mt-4 text-body text-zinc-500">
            Check your email for next steps and access details.
          </p>
          <Link
            href="/"
            className="btn-cta mt-10 py-4"
          >
            Back to K Beauty Academy
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
