import {
  CTASection,
  ElecFlowHeader,
  FAQSection,
  FeaturesSection,
  HeroSection,
  HowItWorksSection,
  StatsSection,
} from "@/features/landing/elecflow";
import { Footer } from "@/features/layout/footer";
import { Pricing } from "@/features/plans/pricing-section";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <ElecFlowHeader />

      <main>
        <HeroSection />
        <StatsSection />
        <FeaturesSection />
        <HowItWorksSection />
        <Pricing />
        <FAQSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
