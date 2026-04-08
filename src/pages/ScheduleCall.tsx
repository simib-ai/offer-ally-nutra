import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScheduleCallForm from '@/components/schedule-call/ScheduleCallForm';

const ScheduleCall = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-12 lg:py-16">
        <div className="section-container">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
              Schedule a Call
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Pick a time and share your details — we&apos;ll follow up to confirm your meeting.
            </p>
          </div>

          <ScheduleCallForm />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ScheduleCall;
