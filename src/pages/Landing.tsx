import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBadgesBar } from "@/components/landing/TrustBadgesBar";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { SolutionOverview } from "@/components/landing/SolutionOverview";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { DemoSection } from "@/components/landing/DemoSection";
import { AgendaPreviewSection } from "@/components/landing/AgendaPreviewSection";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
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
        <TrustBadgesBar />
        <ProblemSection />
        <SolutionOverview />
        <FeaturesSection />
        <DemoSection />
        <AgendaPreviewSection />
        <BenefitsSection />
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
