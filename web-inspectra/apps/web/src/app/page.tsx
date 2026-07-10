import {
  LandingHero,
  FeatureHighlightsSection,
  HowItWorksSection,
  BenefitsSection,
  LandingCtaSection,
  SiteFooter,
} from "@/components/landing";

export default function LandingPage() {
  return (
    <div className="bg-scan-grid bg-scan-grid-size">
      <LandingHero />
      <FeatureHighlightsSection />
      <HowItWorksSection />
      <BenefitsSection />
      <LandingCtaSection />
      <SiteFooter />
    </div>
  );
}
