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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
              Get a Free Quote
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Tell us about your project and we'll provide a custom quote
            </p>
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
