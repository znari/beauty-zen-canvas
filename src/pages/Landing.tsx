import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { AgendaPreviewSection } from "@/components/landing/AgendaPreviewSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { CTABanner } from "@/components/landing/CTABanner";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <HeroSection />
        <ProblemSection />
        <FeaturesSection />
        <AgendaPreviewSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTABanner />
      </main>
      <LandingFooter />
    </div>
  );
};

export default Landing;
