import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import TrustLogosSection from "@/components/TrustLogosSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WhyChooseSection from "@/components/WhyChooseSection";
import CTABannerSection from "@/components/CTABannerSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <TrustLogosSection />
        <HowItWorksSection />
        <WhyChooseSection />
        <CTABannerSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
