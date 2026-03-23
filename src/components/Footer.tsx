import Link from "next/link";
import AdminFooterLink from "@/components/AdminFooterLink";

export default function Footer() {
  return (
    <footer className="bg-[#3a3533] text-[#faf7f5] py-24 px-4 sm:px-8">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <p className="font-serif-heading text-xl font-semibold tracking-wide">K Beauty Academy</p>
            <p className="mt-3 text-body text-[#c4bbb6]">
              Skincare & Makeup Expert Courses
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <Link href="#courses" className="text-body text-[#c4bbb6] hover:text-[#f5e6e0] transition-all duration-300">
              Courses
            </Link>
            <Link href="#features" className="text-body text-[#c4bbb6] hover:text-[#f5e6e0] transition-all duration-300">
              Features
            </Link>
            <Link href="#about" className="text-body text-[#c4bbb6] hover:text-[#f5e6e0] transition-all duration-300">
              About
            </Link>
            <Link
              href="/glass-skin"
              className="btn-cta"
            >
              Get the Free Guide
            </Link>
          </div>
        </div>
        <div className="mt-20 pt-10 border-t border-[#524a47] text-center text-body text-[#a89f9a]">
          <p>© 2025 K Beauty Academy. All rights reserved.</p>
          <AdminFooterLink />
        </div>
      </div>
    </footer>
  );
}
