import Link from "next/link";
import AdminFooterLink from "@/components/AdminFooterLink";

export default function Footer() {
  return (
    <footer className="bg-[var(--foreground)] text-white py-20 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <p className="text-xl font-bold">K Beauty Academy</p>
            <p className="mt-2 text-body text-zinc-400">
              Skincare & Makeup Expert Courses
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            <Link href="#courses" className="text-body text-zinc-400 hover:text-[var(--flare-support-3)] transition-colors">
              Courses
            </Link>
            <Link href="#features" className="text-body text-zinc-400 hover:text-[var(--flare-support-3)] transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-body text-zinc-400 hover:text-[var(--flare-support-3)] transition-colors">
              About
            </Link>
            <Link
              href="/glass-skin"
              className="inline-flex items-center justify-center rounded-[10px] bg-[var(--flare-support-1)] px-6 py-3 font-semibold text-body text-white transition-colors hover:bg-[var(--flare-support-2)]"
            >
              Get the Free Guide
            </Link>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-zinc-700 text-center text-body text-zinc-500">
          <p>© 2025 K Beauty Academy. All rights reserved.</p>
          <AdminFooterLink />
        </div>
      </div>
    </footer>
  );
}
