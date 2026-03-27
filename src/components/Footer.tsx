import { Phone, Mail, MapPin } from "lucide-react";
import allyNutraLogo from "@/assets/ally-nutra-logo.png";

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-12">
      <div className="section-container">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Company Info */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center mb-4 cursor-pointer bg-transparent border-none p-0"
            >
              <img 
                src={allyNutraLogo} 
                alt="Ally Nutra" 
                className="h-14 w-auto brightness-0 invert"
              />
            </button>
            <p className="text-white/70 text-sm max-w-md mb-4">
              Full-service supplement manufacturing with FDA compliance, NSF/cGMP certification, and fast turnaround times.
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm text-white/70">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent" />
                (888) 720-5888
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent" />
                info@allynutra.com
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent mt-0.5" />
                <span>USA Manufacturing Facility</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/70">
              <li><a href="#" className="hover:text-accent transition-colors">Our Services</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Facility</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Certifications</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-white/50">
          <p>&copy; {new Date().getFullYear()} Ally Nutra. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;