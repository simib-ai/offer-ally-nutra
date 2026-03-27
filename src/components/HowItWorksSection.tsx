import { FileText, BarChart3, Package, ArrowRight } from "lucide-react";
import AppLink from "@/components/AppLink";

const steps = [
  {
    icon: FileText,
    step: "01",
    title: "Share or Create Your Formula",
    description: "Have a formula? Share it with us. Need one? We'll help develop a custom formula tailored to your product goals.",
    cta: "Start Your Quote",
    ctaLink: "/quote",
  },
  {
    icon: BarChart3,
    step: "02",
    title: "We Quote & Manufacture",
    description: "Get competitive pricing within minutes. Once approved, we manufacture your capsules with precision.",
    cta: "Get Pricing",
    ctaLink: "/quote",
  },
  {
    icon: Package,
    step: "03",
    title: "Receive Finished Capsules",
    description: "Your capsules arrive bottled, labeled, tested and ready to sell. Ship direct to Amazon FBA or your warehouse.",
    cta: "Let's Talk",
    ctaLink: "/quote",
  },
];

const HowItWorksSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-section-alt">
      <div className="section-container">
        {/* Section Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Three simple steps from idea or formula to finished, sellable capsules.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-12">
          {steps.map((step) => (
            <div
              key={step.step}
              className="bg-white rounded-xl p-8 border border-border card-shadow relative"
            >
              {/* Step Number Badge - positioned at top left */}
              <div className="absolute -top-3 left-6">
                <span className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full">
                  {step.step}
                </span>
              </div>

              {/* Icon in yellow/amber square */}
              <div className="w-12 h-12 bg-accent/15 rounded-lg flex items-center justify-center mb-6 mt-2">
                <step.icon className="w-6 h-6 text-accent" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                {step.description}
              </p>

              {/* CTA Link */}
              <AppLink 
                to={step.ctaLink}
                className="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all text-sm"
              >
                {step.cta}
                <ArrowRight className="w-4 h-4" />
              </AppLink>
            </div>
          ))}
        </div>

        {/* Bottom CTA Button */}
        <div className="text-center">
          <AppLink 
            to="/quote"
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-3.5 rounded-md inline-flex items-center gap-2 transition-colors"
          >
            Get Started Now
            <ArrowRight className="w-4 h-4" />
          </AppLink>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;