import { ArrowRight, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import AppLink from "@/components/AppLink";
import heroBackground from "@/assets/hero-background.png";

function getSecondsUntilMidnight(): number {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / 1000));
}

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

const HeroSection = () => {
  const [secondsLeft, setSecondsLeft] = useState(getSecondsUntilMidnight);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          return getSecondsUntilMidnight();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <section id="hero" className="relative overflow-hidden min-h-[500px] lg:min-h-[600px]">
      {/* Background image - covers entire hero */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroBackground})`,
        }}
      />
      {/* White gradient overlay for text readability */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'linear-gradient(to right, rgba(255, 255, 255, 0.92) 0%, rgba(255, 255, 255, 0.85) 35%, rgba(255, 255, 255, 0.6) 60%, rgba(255, 255, 255, 0.3) 100%)'
        }}
      />

      <div className="section-container relative z-10">
        <div className="py-16 lg:py-24">
          <div className="max-w-2xl">
            {/* Badge/Pill */}
            <div className="inline-block mb-6">
              <span className="text-sm font-medium text-foreground bg-white border border-border px-4 py-2 rounded-md">
                Full-Service Supplement Manufacturer
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 drop-shadow-sm">
              <span className="text-primary">Your Supplements</span>
              <br />
              <span className="text-accent drop-shadow-md">Made</span>
              <span className="text-primary"> and </span>
              <span className="text-accent drop-shadow-md">Ready to Sell</span>
            </h1>

            {/* Product types in yellow/amber */}
            <p className="text-accent font-semibold mb-8 drop-shadow-md">Capsules • Sachets • Stick Packs • Pouches and more...</p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <AppLink
                to="/quote"
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-6 py-3 rounded-md inline-flex items-center gap-2 transition-colors w-fit"
              >
                Get Instant Quote
                <ArrowRight className="w-4 h-4" />
              </AppLink>
              <AppLink
                to="/schedule-call"
                className="bg-white hover:bg-secondary text-foreground font-semibold px-6 py-3 rounded-md border border-border inline-flex items-center gap-2 transition-colors w-fit"
              >
                <Calendar className="w-4 h-4" />
                Schedule a Call
              </AppLink>
            </div>

            {/* Countdown timer */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">Today's offer ends in:</span>
              <span className="font-mono text-lg font-bold text-accent tabular-nums">
                {formatCountdown(secondsLeft)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
