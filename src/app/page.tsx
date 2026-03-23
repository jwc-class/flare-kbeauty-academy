import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import CoursesSection from "@/components/CoursesSection";
import EmailCapture from "@/components/EmailCapture";
import Testimonials from "@/components/Testimonials";
import ProgramCards from "@/components/ProgramCards";
import AboutSection from "@/components/AboutSection";
import ApplySection from "@/components/ApplySection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Header />
      <main>
        <Hero />
        <ProblemSection />
        <CoursesSection />
        <ProgramCards />
        <EmailCapture />
        <Testimonials />
        <AboutSection />
        <ApplySection />
        <Footer />
      </main>
    </div>
  );
}
