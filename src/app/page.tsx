import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Hero } from "@/components/landing/hero";
import { PrivateFleet } from "@/components/landing/private-fleet";
import { OperationsWalkthrough } from "@/components/landing/operations-walkthrough";
import { HowItWorks } from "@/components/landing/how-it-works";
import { CustomerTracking } from "@/components/landing/customer-tracking";
import { CtaBanner } from "@/components/landing/cta-banner";
import { LandingFaq } from "@/components/landing/faq";
import "./landing-theme.css";

export default function LandingPage() {
  return (
    <div className="landing-page min-h-screen bg-[var(--landing-canvas)] text-[var(--landing-ink)]">
      <Navbar />
      <main>
        <Hero />
        <OperationsWalkthrough />
        <PrivateFleet />
        <HowItWorks />
        <CustomerTracking />
        <LandingFaq />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
