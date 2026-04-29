import Header from '@/components/Header';
import Footer from '@/components/Footer';
import QuoteForm from '@/components/quote/QuoteForm';

const Quote = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12 lg:py-16">
        <div className="section-container">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
              Get an Instant Quote
              <span className="block text-sm sm:text-base font-medium tracking-widest uppercase text-muted-foreground/60 my-2">— or —</span>
              Request Help
            </h1>
          </div>

          {/* Quote Form */}
          <QuoteForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Quote;
