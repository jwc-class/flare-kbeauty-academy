import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AccountContent from "./AccountContent";

export const metadata = {
  title: "Account | K Beauty Academy",
  description: "Your account and course access.",
};

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header />
      <main className="pt-24 pb-16">
        <AccountContent />
      </main>
      <Footer />
    </div>
  );
}
