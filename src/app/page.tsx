import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Hero } from "@/components/landing/hero";
import { StatsStrip } from "@/components/landing/stats-strip";
import { Features } from "@/components/landing/features";
import { OperationsProof } from "@/components/landing/operations-proof";
import { HowItWorks } from "@/components/landing/how-it-works";
import { AboutProject } from "@/components/landing/testimonials";
import { CtaBanner } from "@/components/landing/cta-banner";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Navbar />
      <main>
        <Hero />
        <StatsStrip />
        <Features />
        <OperationsProof />
        <HowItWorks />
        <AboutProject />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
