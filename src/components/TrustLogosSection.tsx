import certGmp from "@/assets/cert-gmp.png";
import certFda from "@/assets/cert-fda.png";
import certFastTurnaround from "@/assets/cert-fast-turnaround.png";
import certCompetitivePricing from "@/assets/cert-competitive-pricing.png";

const certificates = [
  { 
    id: "gmp",
    alt: "GMP Certified - Good Manufacturing Practice",
    image: certGmp
  },
  { 
    id: "fda",
    alt: "FDA Approved",
    image: certFda
  },
  { 
    id: "fast-turnaround",
    alt: "Fast Turnarounds",
    image: certFastTurnaround
  },
  { 
    id: "competitive-pricing",
    alt: "Competitive Pricing",
    image: certCompetitivePricing
  },
];

const TrustLogosSection = () => {
  return (
    <section className="py-8 bg-white border-y border-border">
      <div className="section-container">
        <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-12">
          {certificates.map((cert) => (
            <div 
              key={cert.id}
              className="flex items-center justify-center"
            >
              <img 
                src={cert.image} 
                alt={cert.alt}
                className="h-16 lg:h-20 w-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustLogosSection;
