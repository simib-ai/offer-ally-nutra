/**
 * ═══════════════════════════════════════════════════════════════════
 * CRITICAL BUSINESS FLOW — FORM UI
 * ═══════════════════════════════════════════════════════════════════
 * This component renders the 3-step quote form.
 * All submission logic is delegated to submitLead() in src/lib/submitLead.ts.
 * DO NOT inline submission logic here.
 * ═══════════════════════════════════════════════════════════════════
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle, CalendarDays, Phone, FileText } from 'lucide-react';
import { toast } from 'sonner';
import StepIndicator from './StepIndicator';
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';
import { QuoteFormData, step1Schema, step2Schema, step3Schema, quoteFormSchema } from '@/types/quoteForm';
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

const QuoteForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showContactOptions, setShowContactOptions] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  // [CRITICAL_LEAD_FLOW][DEBUG_UI] Temporary debug panel state — REMOVE after diagnosis
  const [debugError, setDebugError] = useState<Record<string, unknown> | null>(null);
  // Attribution tracking (captures on mount + SPA navigation)
  useAttribution();

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      formulationStatus: undefined,
      email: '',
      phone: '',
      supplementType: '',
      quantity: '',
      deliveryFormat: '',
      ingredients: [{ id: crypto.randomUUID(), name: '', amount: '', unit: 'mg' }],
      servingSize: '',
      servingsPerContainer: '',
      materialType: '',
      unitsPerBox: '',
      netWeight: '',
      packageDimensions: '',
      includeDisplayBox: false,
      labelsProvidedBy: '',
      graphicDesignBy: '',
      additionalComments: '',
      fullName: '',
      company: '',
      marketingConsent: false,
      emailConsent: false,
    },
    mode: 'onChange',
  });

  const validateCurrentStep = async () => {
    const values = form.getValues();

    try {
      if (currentStep === 1) {
        await step1Schema.parseAsync({
          formulationStatus: values.formulationStatus,
          email: values.email,
          phone: values.phone,
        });
        return true;
      } else if (currentStep === 2) {
        await step2Schema.parseAsync({
          supplementType: values.supplementType,
          quantity: values.quantity,
          deliveryFormat: values.deliveryFormat,
          ingredients: values.ingredients,
          servingSize: values.servingSize,
          servingsPerContainer: values.servingsPerContainer,
        });
        return true;
      } else if (currentStep === 3) {
        await step3Schema.parseAsync({
          materialType: values.materialType,
          unitsPerBox: values.unitsPerBox,
          netWeight: values.netWeight,
          packageDimensions: values.packageDimensions,
          includeDisplayBox: values.includeDisplayBox,
          labelsProvidedBy: values.labelsProvidedBy,
          graphicDesignBy: values.graphicDesignBy,
          additionalComments: values.additionalComments,
          fullName: values.fullName,
          company: values.company,
          marketingConsent: values.marketingConsent,
          emailConsent: values.emailConsent,
        });
        return true;
      }
    } catch {
      if (currentStep === 1) {
        form.trigger(['formulationStatus', 'email', 'phone']);
      } else if (currentStep === 2) {
        form.trigger(['deliveryFormat', 'ingredients']);
      } else if (currentStep === 3) {
        form.trigger(['fullName']);
      }
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    // After step 1, check formulationStatus
    if (currentStep === 1) {
      const formulationStatus = form.getValues('formulationStatus');
      if (formulationStatus === 'general_idea') {
        setShowContactOptions(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    if (currentStep < 3) {
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

      // For general_idea quick-submit: use email prefix as fullName if not set
      const values = form.getValues();
      if (!values.fullName || values.fullName.trim() === '') {
        const emailPrefix = values.email.split('@')[0] || 'Customer';
        form.setValue('fullName', emailPrefix);
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

  /**
   * CRITICAL: This handler delegates ALL submission logic to submitLead().
   * It only handles UI concerns: validation trigger, loading state, feedback.
   */
  const handleSubmit = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const isValid = await validateCurrentStep();
    if (!isValid) return;

    setIsSubmitting(true);

    try {
      // ── reCAPTCHA ──
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha();
      } catch (recaptchaError) {
        console.error('[CRITICAL_LEAD_FLOW] reCAPTCHA execution failed:', recaptchaError);
        toast.error('Security verification failed. Please refresh the page and try again.');
        return; // finally will reset isSubmitting
      }

      // ── Delegate to centralized submitLead ──
      const result = await submitLead({
        formData: form.getValues(),
        recaptchaToken,
        honeypot,
      });

      if (result.success) {
        /**
         * POST-SUBMISSION: Show built-in success screen.
         * DO NOT redirect to a URL that contains another form (e.g. /quote-requested).
         * If a real thank-you page is added in the future, set THANK_YOU_URL below
         * and use: window.location.assign(THANK_YOU_URL);
         */
        // const THANK_YOU_URL: string | null = null; // Set to a real thank-you page URL when available
        setIsSuccess(true);
        form.reset();
        return;
      }

      // ── [CRITICAL_LEAD_FLOW][DEBUG_UI] Surface real error from Edge Function ──
      const err = result.error!;
      console.error('[CRITICAL_LEAD_FLOW_FAILURE]', err);

      // Always show message + details in toast (temporary debug mode)
      const parts = [err.message];
      if (err.details) parts.push(String(err.details).slice(0, 200));
      toast.error(parts.join(' — '), { duration: 15000 });

      // [DEBUG_UI] Set debug info for on-page panel
      setDebugError(err as unknown as Record<string, unknown>);

    } catch (unexpectedError) {
      // This catch should never be reached because submitLead() catches everything.
      // But we guard against it for absolute safety — no white screens.
      console.error('[CRITICAL_LEAD_FLOW_FAILURE] Unexpected error in handleSubmit:', unexpectedError);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      // ALWAYS reset loading state unless we're redirecting
      // (if redirect happened, this line still runs but the page is leaving)
      setIsSubmitting(false);
    }
  };

  /**
   * handleReturnToHome — full UI reset back to Step 1.
   * Prevents default anchor/hash navigation, resets all form state,
   * clears URL hash, and smooth-scrolls to top.
   * State-driven only. No navigate(), no window.location, no reload.
   */
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
            <img
              src={allyNutraLogo}
              alt="Ally Nutra logo – return to offer"
              className="h-10"
            />
          </button>
        </div>
      </div>
    );
  }

  // Contact options view for general_idea path
  if (showContactOptions) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6">
          <StepIndicator currentStep={2} totalSteps={2} label="How Would You Like to Connect?" />
        </div>

        <div className="mb-8 space-y-3">

          {/* Submit a Quote Request — continues to full form */}
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

          {/* Schedule a Call */}
          <div
            className="border border-border rounded-xl p-4 cursor-pointer transition-all hover:shadow-md hover:border-primary/40 active:scale-[0.99]"
            onClick={() => { window.location.href = '/schedule-call'; }}
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

          {/* Call Us Now */}
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

        {/* [CRITICAL_LEAD_FLOW][DEBUG_UI] Temporary debug panel — REMOVE after diagnosis */}
        {debugError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded text-xs font-mono text-red-900 overflow-auto max-h-64">
            <div className="font-bold mb-1">[DEBUG_UI] Edge Function Error Details:</div>
            <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugError, null, 2)}</pre>
            <button type="button" onClick={() => setDebugError(null)} className="mt-2 text-red-600 underline text-xs">Dismiss</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="px-6 py-3 border-border"
          >
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
      <StepIndicator currentStep={currentStep} totalSteps={3} />

      <div className="mb-8">
        {currentStep === 1 && <Step1 form={form} />}
        {currentStep === 2 && <Step2 form={form} />}
        {currentStep === 3 && <Step3 form={form} />}
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

      {/* [CRITICAL_LEAD_FLOW][DEBUG_UI] Temporary debug panel — REMOVE after diagnosis */}
      {debugError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded text-xs font-mono text-red-900 overflow-auto max-h-64">
          <div className="font-bold mb-1">[DEBUG_UI] Edge Function Error Details:</div>
          <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugError, null, 2)}</pre>
          <button type="button" onClick={() => setDebugError(null)} className="mt-2 text-red-600 underline text-xs">Dismiss</button>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            className="px-6 py-3 border-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
        ) : (
          <div />
        )}

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3"
          >
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
