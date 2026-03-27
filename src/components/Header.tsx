import { Phone } from "lucide-react";
import { Link } from "react-router-dom";
import allyNutraLogo from "@/assets/ally-nutra-logo.png";

const Header = () => {
  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img 
                src={allyNutraLogo} 
                alt="Ally Nutra" 
                className="h-12 lg:h-14 w-auto"
              />
            </Link>
          </div>

          {/* CTA Button - Yellow/Amber */}
          <div className="flex items-center">
            <a 
              href="tel:8887205888"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 py-2.5 rounded-md inline-flex items-center gap-2 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">Call Now: (888) 720-5888</span>
              <span className="sm:hidden">Call Now</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
