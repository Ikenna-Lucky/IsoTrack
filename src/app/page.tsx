import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { OperationsWalkthrough } from "@/components/landing/operations-walkthrough";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AboutProject } from "@/components/landing/testimonials";
import { CtaBanner } from "@/components/landing/cta-banner";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#080806] text-stone-100">
      <Navbar />
      <main>
        <Hero />
        <OperationsWalkthrough />
        <Features />
        <HowItWorks />
        <AboutProject />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
