/**
 * ═══════════════════════════════════════════════════════════════════
 * CRITICAL BUSINESS FLOW — FORM UI
 * ═══════════════════════════════════════════════════════════════════
 * This component renders the 5-step quote form.
 * All submission logic is delegated to submitLead() in src/lib/submitLead.ts.
 * DO NOT inline submission logic here.
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle, CalendarDays, Phone, FileText } from 'lucide-react';
import { toast } from 'sonner';
import StepIndicator from './StepIndicator';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import Step4 from './Step4';
import Step5 from './Step5';
import { QuoteFormData, quoteFormSchema } from '@/types/quoteForm';
import { useAttribution } from '@/hooks/useAttribution';
import { submitLead } from '@/lib/submitLead';
import { Button } from '@/components/ui/button';
import allyNutraLogo from '@/assets/ally-nutra-logo.png';

const RECAPTCHA_SITE_KEY = '6LciZlksAAAAAEyOAQFiSUe1Z5pEcUJ4BkFndC5K';

interface GrecaptchaInstance {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

const getGrecaptcha = (): GrecaptchaInstance | null => {
  return (window as unknown as { grecaptcha?: GrecaptchaInstance }).grecaptcha || null;
};

const TOTAL_STEPS = 5;

const QuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [debugError, setDebugError] = useState<Record<string, unknown> | null>(null);
  const navigate = useNavigate();

  useAttribution();

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      formulationStatus: undefined,
      email: '',
      phone: '',
      deliveryFormat: '',
      capsuleType: '',
      capsuleTypeOther: '',
      tabletType: '',
      tabletTypeOther: '',
      unitsPerBox: '',
      unitsPerBoxOther: '',
      pouchVolume: '',
      pouchVolumeOther: '',
      quantity: '',
      ingredients: [{ id: crypto.randomUUID(), name: '', amount: '', unit: 'mg' }],
      servingSize: '',
      servingsPerContainer: '',
      formulationDetails: '',
      bottleType: '',
      bottleTypeOther: '',
      bottleSize: '',
      bottleSizeOther: '',
      bottleColor: '',
      bottleColorOther: '',
      lidType: '',
      lidTypeOther: '',
      lidColor: '',
      lidColorOther: '',
      materialType: '',
      materialTypeOther: '',
      pouchSize: '',
      pouchSizeOther: '',
      closureType: '',
      closureTypeOther: '',
      packageDimensions: '',
      netWeight: '',
      labelsProvidedBy: '',
      labelsProvidedByOther: '',
      graphicDesignBy: '',
      graphicDesignByOther: '',
      message: '',
      fullName: '',
      company: '',
      smsConsent: false,
    },
    mode: 'onChange',
  });

  const validateCurrentStep = async (): Promise<boolean> => {
    if (currentStep === 1) {
      const valid = await form.trigger(['formulationStatus', 'email', 'phone']);
      return valid;
    }
    if (currentStep === 2) {
      const valid = await form.trigger(['deliveryFormat']);
      return valid;
    }
    // Steps 3 and 4 have no hard-required fields — always pass
    if (currentStep === 3 || currentStep === 4) {
      return true;
    }
    if (currentStep === 5) {
      const valid = await form.trigger(['fullName']);
      return valid;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (currentStep === 1) {
      const formulationStatus = form.getValues('formulationStatus');
      if (formulationStatus === 'general_idea') {
        setShowContactOptions(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevious = () => {
    if (showContactOptions) {
      setShowContactOptions(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const executeRecaptcha = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const grecaptcha = getGrecaptcha();
      if (!grecaptcha) {
        reject(new Error('reCAPTCHA not loaded. Please refresh and try again.'));
        return;
      }
      grecaptcha.ready(() => {
        grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action: 'quote_submit' })
          .then(resolve)
          .catch(reject);
      });
    });
  };

  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // Ensure fullName is set (fall back to email prefix)
    const values = form.getValues();
    if (!values.fullName || values.fullName.trim() === '') {
      form.setValue('fullName', values.email.split('@')[0] || 'Customer');
    }

    setIsSubmitting(true);

    try {
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha();
      } catch (recaptchaError) {
        console.error('[CRITICAL_LEAD_FLOW] reCAPTCHA execution failed:', recaptchaError);
        toast.error('Security verification failed. Please refresh the page and try again.');
        return;
      }

      const result = await submitLead({
        formData: form.getValues(),
        recaptchaToken,
        honeypot,
      });

      if (result.success) {
        setIsSuccess(true);
        form.reset();
        return;
      }

      const err = result.error!;
      console.error('[CRITICAL_LEAD_FLOW_FAILURE]', err);
      const parts = [err.message];
      if (err.details) parts.push(String(err.details).slice(0, 200));
      toast.error(parts.join(' — '), { duration: 15000 });
      setDebugError(err as unknown as Record<string, unknown>);
    } catch (unexpectedError) {
      console.error('[CRITICAL_LEAD_FLOW_FAILURE] Unexpected error in handleSubmit:', unexpectedError);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    setIsSubmitting(true);
    try {
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha();
      } catch (recaptchaError) {
        console.error('[CRITICAL_LEAD_FLOW] reCAPTCHA execution failed:', recaptchaError);
        toast.error('Security verification failed. Please refresh the page and try again.');
        return;
      }

      const values = form.getValues();
      if (!values.fullName || values.fullName.trim() === '') {
        form.setValue('fullName', values.email.split('@')[0] || 'Customer');
      }

      const result = await submitLead({
        formData: form.getValues(),
        recaptchaToken,
        honeypot,
      });

      if (result.success) {
        setIsSuccess(true);
        form.reset();
        return;
      }

      const err = result.error!;
      const parts = [err.message];
      if (err.details) parts.push(String(err.details).slice(0, 200));
      toast.error(parts.join(' — '), { duration: 15000 });
      setDebugError(err as unknown as Record<string, unknown>);
    } catch (unexpectedError) {
      console.error('[CRITICAL_LEAD_FLOW_FAILURE] Unexpected error in handleSendMessage:', unexpectedError);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturnToHome = (e?: React.MouseEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setIsSuccess(false);
    setCurrentStep(1);
    setShowContactOptions(false);
    setIsSubmitting(false);
    form.reset();
    setHoneypot('');
    if (window.location.hash) history.replaceState(null, '', window.location.pathname + window.location.search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">Thank You!</h2>
          <p className="text-muted-foreground mb-2">Your quote request has been submitted successfully.</p>
          <p className="text-sm text-muted-foreground mb-6">We'll get back to you within 4 hours.</p>
          <button
            type="button"
            onClick={handleReturnToHome}
            className="mx-auto block cursor-pointer bg-transparent border-none p-0"
            aria-label="Return to offer"
          >
            <img src={allyNutraLogo} alt="Ally Nutra logo – return to offer" className="h-10" />
          </button>
        </div>
      </div>
    );
  }

  if (showContactOptions) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <StepIndicator currentStep={2} totalSteps={2} label="How Would You Like to Connect?" />
        </div>

        <div className="mb-8 space-y-3">
          <div
            className="border border-border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.99]"
            onClick={() => {
              form.setValue('formulationStatus', 'complete');
              setShowContactOptions(false);
              setCurrentStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Submit a Quote Request</p>
                <p className="text-xs text-muted-foreground">Tell us about your concept in a quick form</p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
            </div>
          </div>

          <div
            className="border border-border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.99]"
            onClick={() => navigate('/schedule-call')}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Schedule a Call</p>
                <p className="text-xs text-muted-foreground">Book a time with our team to shape your idea</p>
              </div>
              <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
            </div>
          </div>

          <a
            href="tel:+18887205888"
            className="block border border-ally-orange/30 bg-ally-orange/5 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-ally-orange/60 active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-ally-orange/10 flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-ally-orange" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Call Us Now</p>
                <p className="text-xs text-muted-foreground">Speak with a specialist at (888) 720-5888</p>
              </div>
              <ArrowRight className="w-4 h-4 text-ally-orange flex-shrink-0" />
            </div>
          </a>
        </div>

        {debugError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded text-xs font-mono text-red-900 overflow-auto max-h-64">
            <div className="font-bold mb-1">[DEBUG_UI] Edge Function Error Details:</div>
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugError, null, 2)}</pre>
            <button type="button" onClick={() => setDebugError(null)} className="mt-2 text-red-600 underline text-xs">Dismiss</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <Button type="button" variant="outline" onClick={handlePrevious} className="px-6 py-3 border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <div />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <div className="mb-8">
        {currentStep === 1 && <Step1 form={form} />}
        {currentStep === 2 && <Step2 form={form} />}
        {currentStep === 3 && <Step3 form={form} />}
        {currentStep === 4 && <Step4 form={form} />}
        {currentStep === 5 && <Step5 form={form} />}
      </div>

      {/* Hidden honeypot field */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
        <label htmlFor="company_website">Company Website</label>
        <input
          type="text"
          id="company_website"
          name="company_website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {debugError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded text-xs font-mono text-red-900 overflow-auto max-h-64">
          <div className="font-bold mb-1">[DEBUG_UI] Edge Function Error Details:</div>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugError, null, 2)}</pre>
          <button type="button" onClick={() => setDebugError(null)} className="mt-2 text-red-600 underline text-xs">Dismiss</button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {currentStep > 1 ? (
          <Button type="button" variant="outline" onClick={handlePrevious} className="px-6 py-3 border-border">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        ) : (
          <div />
        )}

        {currentStep < TOTAL_STEPS ? (
          <Button type="button" onClick={handleNext} className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={(e) => handleSubmit(e)}
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Quote Request'
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuoteForm;
