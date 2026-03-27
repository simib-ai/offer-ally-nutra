import { Zap, DollarSign, Clock, Shield, ArrowRight } from "lucide-react";
import AppLink from "@/components/AppLink";

// Product images
import productCapsules from "@/assets/product-capsules.png";
import productSachets from "@/assets/product-sachets.png";
import productStickPacks from "@/assets/product-stick-packs.png";
import productPouches from "@/assets/product-pouches.png";

const features = [
  {
    icon: Zap,
    title: "We Are All In",
    description: "When it's time to get things done, we're all in - no excuses.",
  },
  {
    icon: DollarSign,
    title: "Competitive Pricing",
    description: "Premium products at prices that keep you profitable.",
  },
  {
    icon: Clock,
    title: "Aggressive Turnaround",
    description: "Speed matters. Your product gets priority treatment.",
  },
  {
    icon: Shield,
    title: "Quality. Period.",
    description: "NSF cGMP certified. FDA compliant. Every batch tested.",
  },
];

const stats = [
  { value: "1,000+", label: "Products Made" },
  { value: "4hr", label: "Email Response" },
  { value: "100%", label: "USA Made" },
];

// Product cards to display below the image
const productCards = [
  { 
    title: "Capsules", 
    color: "bg-red-50",
    image: productCapsules,
    link: "https://id-preview--e9edc903-0ae4-4a0e-8513-7d9d0b009a59.lovable.app/services?format=capsules",
  },
  { 
    title: "Sachets", 
    color: "bg-gray-100",
    image: productSachets,
    link: "https://id-preview--e9edc903-0ae4-4a0e-8513-7d9d0b009a59.lovable.app/services?format=sachets",
  },
  { 
    title: "Stick Packs", 
    color: "bg-gray-50",
    image: productStickPacks,
    link: "https://id-preview--e9edc903-0ae4-4a0e-8513-7d9d0b009a59.lovable.app/services?format=stick-packs",
  },
  { 
    title: "Resealable Pouches", 
    color: "bg-cyan-50",
    image: productPouches,
    link: "https://id-preview--e9edc903-0ae4-4a0e-8513-7d9d0b009a59.lovable.app/services?format=pouches",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Side - Image, Stats & Product Cards */}
          <div className="relative">
            {/* Machine image */}
            <div className="aspect-[4/3] bg-secondary rounded-xl overflow-hidden relative">
              <img 
                src="https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800&auto=format&fit=crop&q=80"
                alt="Manufacturing equipment"
                className="w-full h-full object-cover"
              />
              
              {/* Stats overlay at bottom of image */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary/90 to-primary/70 p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {stats.map((stat) => (
                    <div key={stat.label}>
                      <div className="text-2xl lg:text-3xl font-bold text-accent">{stat.value}</div>
                      <div className="text-xs text-white/80 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Cards below the image */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {productCards.map((product) => (
                <a
                  key={product.title}
                  href={product.link}
                  className="group bg-white rounded-lg border border-border card-shadow overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-accent hover:-translate-y-1 cursor-pointer block"
                >
                  {/* Product Image */}
                  <div className={`aspect-square ${product.color} flex items-center justify-center p-3`}>
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-105"
                    />
                  </div>

                  {/* Title */}
                  <div className="p-2 text-center">
                    <h4 className="font-semibold text-primary text-xs leading-tight group-hover:text-accent transition-colors">{product.title}</h4>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Right Side - Content */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
              Why Choose Ally Nutra?
            </h2>
            
            <p className="text-muted-foreground mb-8 text-lg">
              We manufacture your supplements from scratch - tablets, capsules, sachets, stick packs, and pouches. Bring us your formula, we handle everything.
            </p>

            {/* Feature Cards - 2x2 Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl p-5 border border-border card-shadow"
                >
                  {/* Icon in yellow circle */}
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center mb-3">
                    <feature.icon className="w-5 h-5 text-accent-foreground" />
                  </div>
                  <h3 className="font-bold text-primary mb-1 text-sm">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <AppLink 
                to="/quote"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors w-fit"
              >
                Get Your Quote Now
                <ArrowRight className="w-4 h-4" />
              </AppLink>
              <a 
                href="tel:8887205888"
                className="bg-white hover:bg-secondary text-foreground font-semibold px-6 py-3 rounded-md border border-border inline-flex items-center gap-2 transition-colors w-fit"
              >
                Prefer to Talk Now?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSection;
