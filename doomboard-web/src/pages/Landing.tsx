import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustStrip } from "@/components/landing/TrustStrip";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Testimonials } from "@/components/landing/Testimonials";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <TrustStrip />
        <FeaturesSection />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
