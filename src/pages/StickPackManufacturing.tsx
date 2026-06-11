import { ArrowRight, CheckCircle, Zap, DollarSign, Clock, Shield, FlaskConical, TrendingUp, Package, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ─── Assets ────────────────────────────────────────────────────────────────
// Add these files to src/assets/ (provided separately):
import machineImg from "@/assets/njp-2500-capsule-machine.png";
import heroImg from "@/assets/customcapsule.jpg";
import certCgmp from "@/assets/cert-cgmp.png";
import certFda from "@/assets/cert-fda.png";
import certNsf from "@/assets/cert-nsf.png";
import certUsa from "@/assets/cert-usa.png";

// ─── Data ───────────────────────────────────────────────────────────────────

const filterPills = [
  "Electrolyte Stick Packs",
  "Powder Sticks",
  "Single-Serve",
  "Low MOQs",
];

const stickPackTypes = [
  {
    title: "Electrolyte Stick Packs",
    description:
      "Custom electrolyte blends with precise mineral ratios — sodium, potassium, magnesium and more. Ideal for sports nutrition, hydration, and recovery brands.",
  },
  {
    title: "Single-Serve Powder Sticks",
    description:
      "Convenient single-dose powder sachets for any supplement category. Perfect format for on-the-go consumers and DTC subscription brands.",
  },
  {
    title: "Protein & Amino Stick Packs",
    description:
      "High-density protein and BCAA formulas in stick-pack format. Excellent flowability and mixability engineered into every batch.",
  },
  {
    title: "Hydration Stick Packs",
    description:
      "Rapid-dissolve hydration formulas with added vitamins and minerals. Clean-label options with natural flavors and sweeteners available.",
  },
  {
    title: "Nutraceutical Stick Packs",
    description:
      "Vitamins, minerals, greens, and functional blends in stick-pack form. Broad compatibility with water-soluble and flavor-masked ingredients.",
  },
  {
    title: "Specialty & Custom Blends",
    description:
      "Proprietary formulas, multi-ingredient stacks, and unique delivery formats. Our R&D team works with you from concept through commercial production.",
  },
];

const capabilities = [
  {
    title: "Precision Blending",
    description:
      "Ribbon and high-shear blenders ensure ingredient homogeneity and consistent fill weights across every stick pack run.",
  },
  {
    title: "High-Speed Stick Pack Filling",
    description:
      "Our filling lines run up to 150 sticks per minute with ±2% fill-weight accuracy and inline checkweighing.",
  },
  {
    title: "Sealing & Packaging",
    description:
      "Heat-sealed, multi-layer laminate films. Compatible with display boxes, retail cartons, and bulk poly bags.",
  },
  {
    title: "Polishing & Inspection",
    description:
      "Every batch is visually inspected, metal-detected, and weigh-checked before release to ensure zero defects.",
  },
  {
    title: "Label Application",
    description:
      "In-house label application with FDA 21 CFR Part 111 compliance. Front-back and wrap labeling available.",
  },
  {
    title: "Case Packing & Fulfillment",
    description:
      "Ready-to-ship case packs. Amazon FBA-ready prep, direct-to-consumer and B2B fulfillment options.",
  },
];

const formulationSupport = [
  {
    icon: FlaskConical,
    title: "Custom Formula Development",
    description:
      "Our R&D team works with you on ingredient selection, flavor profiling, and stick-pack-specific flow optimization.",
  },
  {
    icon: TrendingUp,
    title: "Existing Formula Scale-Up",
    description:
      "Already have a formula? We scale it to commercial production without reformulating or compromising efficacy.",
  },
  {
    icon: Zap,
    title: "Bioavailability Optimization",
    description:
      "We advise on form selection (oxide vs. chelated minerals, free-form vs. esterified vitamins) to maximize absorption.",
  },
  {
    icon: FileText,
    title: "Regulatory Label Review",
    description:
      "Our team reviews your supplement facts panel, claims, and label for FDA 21 CFR Part 111 compliance before printing.",
  },
];

const qualityCards = [
  {
    icon: Shield,
    title: "In-House QC Lab",
    description:
      "On-site laboratory performs identity, potency, and microbiological testing at incoming raw material and finished product stages.",
  },
  {
    icon: CheckCircle,
    title: "Third-Party Lab Testing",
    description:
      "All batches are sent to accredited third-party labs for independent verification. Certificate of Analysis provided with every order.",
  },
  {
    icon: Package,
    title: "FDA-Registered Facility",
    description:
      "Manufactured under 21 CFR Dover, DE facility — full documentation available for brand quality assurance.",
  },
  {
    icon: Zap,
    title: "NSF/ANSI 455-2 Certified",
    description:
      "Third-party verified cGMP compliance. The gold standard for dietary supplement manufacturing quality systems.",
  },
];

const capacityStats = [
  {
    value: "150+",
    label: "Sticks/min",
    sublabel: "High-Speed Output",
    description:
      "Our stick pack filling line delivers high-throughput output — ideal for fast-to-market brands at any scale.",
  },
  {
    value: "Fast",
    label: "Turnaround",
    sublabel: "Competitive Lead Times",
    description:
      "We understand your launch timeline. Our production scheduling prioritizes speed without sacrificing quality.",
  },
  {
    value: "Low",
    label: "MOQs",
    sublabel: "Start Up to Scale",
    description:
      "Low minimum order quantities for entry-stage brands. As your volume grows, our tiered pricing rewards scale with better per-unit cost.",
  },
  {
    value: "100%",
    label: "USA Made",
    sublabel: "Flexible Formats",
    description:
      "Every stick pack manufactured in our Dover, DE facility. Full domestic supply chain, no overseas sourcing.",
  },
];

const exploreLinks = [
  { label: "Contract Manufacturing", href: "https://allynutra.com/services" },
  { label: "Private Label Supplements", href: "https://allynutra.com/services" },
  { label: "All Capsule Services", href: "https://allynutra.com/capsule-manufacturing" },
  { label: "All Services", href: "https://allynutra.com/services" },
  { label: "Our Facility", href: "https://allynutra.com/facility" },
  { label: "Certifications", href: "https://allynutra.com/certifications" },
];

const QUOTE_URL = "https://offer.allynutra.com/quote";

// ─── Page ────────────────────────────────────────────────────────────────────

const StickPackManufacturing = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[520px] lg:min-h-[600px]">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImg})` }}
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(15,30,60,0.88) 0%, rgba(15,30,60,0.78) 45%, rgba(15,30,60,0.45) 100%)",
          }}
        />

        <div className="section-container relative z-10">
          <div className="py-16 lg:py-24 max-w-2xl">
            {/* Badge */}
            <div className="inline-block mb-5">
              <span className="text-xs font-semibold text-white bg-white/15 border border-white/25 px-4 py-2 rounded-md tracking-wide uppercase">
                FDA-Registered · NSF/cGMP Certified · Dover, DE
              </span>
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5 text-white drop-shadow-sm">
              Custom{" "}
              <span className="text-accent">Stick Pack</span>
              <br />
              <span className="text-accent">Manufacturing</span> for
              <br />
              Supplement Brands
            </h1>

            {/* Subtext */}
            <p className="text-white/75 text-lg mb-8 max-w-xl leading-relaxed">
              From electrolyte blends to private-label single-serve powders — Ally Nutra
              provides end-to-end stick pack co-packing and contract manufacturing
              services across the USA. FDA-registered, cGMP-certified, and committed
              to quality at every batch.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={QUOTE_URL}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors w-fit"
              >
                Get a Quote in 5 Minutes
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Filter pills */}
            <div className="mt-8 flex flex-wrap gap-2">
              {filterPills.map((pill) => (
                <span
                  key={pill}
                  className="text-xs font-medium text-white/80 bg-white/10 border border-white/20 px-3 py-1.5 rounded-full"
                >
                  {pill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. TRUST BADGES ─────────────────────────────────────────────── */}
      <section className="py-8 bg-white border-y border-border">
        <div className="section-container">
          <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-12">
            <img src={certCgmp} alt="cGMP Compliant (21 CFR Part 111)" className="h-16 lg:h-20 w-auto object-contain" />
            <img src={certFda} alt="FDA Registered Facility" className="h-16 lg:h-20 w-auto object-contain" />
            <img src={certNsf} alt="NSF Certified" className="h-16 lg:h-20 w-auto object-contain" />
            <img src={certUsa} alt="Made in USA – Dover, DE" className="h-16 lg:h-20 w-auto object-contain" />
          </div>
        </div>
      </section>

      {/* ── 3. STICK PACK TYPES ──────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-12 lg:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
              Stick Pack Types We Manufacture
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We fill all major stick pack categories — from electrolyte and hydration
              formulas to specialty nutraceutical and private-label blends.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stickPackTypes.map((type) => (
              <div
                key={type.title}
                className="bg-white rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-2 h-6 bg-accent rounded-full mb-4" />
                <h3 className="text-lg font-bold text-primary mb-2">{type.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. FILLING CAPABILITIES ─────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-section-alt">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left — content */}
            <div>
              <div className="w-1 h-8 bg-accent rounded-full mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                Stick Pack Filling Capabilities
              </h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Our fully-equipped stick pack filling operation handles every step
                in-house — from precision powder blending through high-speed filling,
                sealing, labeling, and case packing — with full chain-of-custody
                documentation for every batch.
              </p>

              <div className="space-y-5">
                {capabilities.map((cap) => (
                  <div key={cap.title} className="flex gap-4">
                    <div className="mt-1 w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-primary text-sm mb-1">
                        {cap.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {cap.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — machine image */}
            <div className="rounded-xl overflow-hidden border border-border shadow-md bg-white">
              <img
                src={machineImg}
                alt="NJP-2500 Stick Pack Filling Machine"
                className="w-full h-auto object-cover"
              />
              <div className="px-5 py-4 bg-white border-t border-border">
                <p className="text-sm font-semibold text-primary">
                  NJP-2500 High-Speed Filling Line
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Slot 00 · Size 4 · 150 sticks/min max · GMP validated
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. FORMULATION SUPPORT ──────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left — header */}
            <div>
              <div className="w-1 h-8 bg-accent rounded-full mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-primary mb-4">
                Custom Stick Pack Formulation Support
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Whether you're developing a new formula from scratch or scaling an
                existing one, our in-house R&amp;D team provides the technical support
                to get your stick pack product to market correctly — the first time.
              </p>
            </div>

            {/* Right — 2×2 feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {formulationSupport.map((item) => (
                <div
                  key={item.title}
                  className="bg-white rounded-xl p-5 border border-border shadow-sm"
                >
                  <div className="w-10 h-10 bg-accent/15 rounded-lg flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-bold text-primary text-sm mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. QUALITY CONTROL ──────────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-section-alt">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
              Stick Pack Quality Control &amp; Compliance
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every stick pack batch leaves our facility with full documentation —
              in-house testing, third-party verification, and a Certificate of
              Analysis for your records.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {qualityCards.map((card) => (
              <div
                key={card.title}
                className="bg-white rounded-xl p-6 border border-border shadow-sm text-center"
              >
                <div className="w-12 h-12 bg-accent/15 rounded-full flex items-center justify-center mx-auto mb-4">
                  <card.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-primary text-sm mb-2">{card.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>

          {/* View Certifications link */}
          <div className="text-center">
            <a
              href="https://allynutra.com/certifications"
              className="text-accent font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all text-sm"
            >
              View All Certifications
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── 7. CAPACITY & TURNAROUND ────────────────────────────────────── */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
              Production Capacity &amp; Turnaround Times
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {capacityStats.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-xl p-6 border border-border shadow-sm text-center"
              >
                <div className="text-4xl font-bold text-accent mb-1">{stat.value}</div>
                <div className="text-base font-bold text-primary mb-1">{stat.label}</div>
                <div className="text-xs font-semibold text-accent uppercase tracking-wide mb-3">
                  {stat.sublabel}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {stat.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
            For accurate lead times and capacity availability,{" "}
            <a href={QUOTE_URL} className="text-accent font-semibold hover:underline">
              request a quote
            </a>{" "}
            — we'll give you production timelines specific to your project.
          </p>
        </div>
      </section>

      {/* ── 8. EXPLORE MORE ─────────────────────────────────────────────── */}
      <section className="py-10 bg-section-alt border-y border-border">
        <div className="section-container">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mb-5">
            Explore More from Ally Nutra
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {exploreLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-primary border border-border rounded-full px-4 py-2 hover:border-accent hover:text-accent transition-colors inline-flex items-center gap-1"
              >
                {link.label}
                <ArrowRight className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 9. CTA BANNER ───────────────────────────────────────────────── */}
      <section className="cta-banner-gradient py-16 lg:py-20">
        <div className="section-container">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Manufacture Your Custom Stick Pack Supplement?
            </h2>
            <p className="text-lg text-white/70 mb-8">
              Get a personalized stick pack manufacturing quote in under 5 minutes.
              Tell us your formula, stick pack type, and target quantity — our team
              responds within 1 business day.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <a
                href={QUOTE_URL}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-4 rounded-md inline-flex items-center gap-2 transition-colors text-lg"
              >
                Get a Quote in 5 Minutes
                <ArrowRight className="w-5 h-5" />
              </a>
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

            {/* Contact line */}
            <p className="text-white/50 text-xs mt-6">
              123 Ridgely St, STE 3 · Dover, DE 19904 · (888) 720-5888 ·{" "}
              <a href="mailto:info@allynutra.com" className="hover:text-white transition-colors">
                info@allynutra.com
              </a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StickPackManufacturing;
