import { Phone, ArrowRight, Calendar, CheckCircle } from "lucide-react";
import AppLink from "@/components/AppLink";

const CTABannerSection = () => {
  return (
    <section className="cta-banner-gradient py-16 lg:py-20">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto">
          {/* Headline - matching the reference */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Get Started? Call Us Now.
          </h2>

          {/* Subtext */}
          <p className="text-lg text-white/70 mb-8">
            Speak with an expert in minutes - no bots, no wait.
          </p>

          {/* Primary CTA - Yellow button */}
          <div className="mb-6">
            <a 
              href="tel:8887205888"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 rounded-md inline-flex items-center gap-2 transition-colors text-lg"
            >
              <Phone className="w-5 h-5" />
              Call Now: (888) 720-5888
            </a>
          </div>

          {/* Secondary CTAs - Dark outlined buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <AppLink 
              to="/quote"
              className="bg-primary/80 hover:bg-primary text-white font-semibold px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors"
            >
              Get Instant Quote
              <ArrowRight className="w-4 h-4" />
            </AppLink>
            <AppLink 
              to="/quote"
              className="bg-transparent hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-md border border-white/30 inline-flex items-center gap-2 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              Schedule a Call
            </AppLink>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              Talk to a real person
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              No commitment
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-accent" />
              Same-day response
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABannerSection;