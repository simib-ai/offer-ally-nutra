import { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, startOfToday } from 'date-fns';
import { CheckCircle, ChevronRight, Loader2, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

import FormCard from '@/components/quote/FormCard';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAttribution } from '@/hooks/useAttribution';
import { buildScheduleCallQuotePayload } from '@/lib/buildScheduleCallQuotePayload';
import { submitLead } from '@/lib/submitLead';
import { cn } from '@/lib/utils';
import {
  scheduleCallFormSchema,
  type ScheduleCallFormValues,
} from '@/types/scheduleCallForm';
import { quantityRanges } from '@/types/quoteForm';
import allyNutraLogo from '@/assets/ally-nutra-logo.png';

const RECAPTCHA_SITE_KEY = '6LciZlksAAAAAEyOAQFiSUe1Z5pEcUJ4BkFndC5K';
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const TIME_SLOTS_ET = [
  '9:00 AM – 9:30 AM ET',
  '9:30 AM – 10:00 AM ET',
  '10:00 AM – 10:30 AM ET',
  '10:30 AM – 11:00 AM ET',
  '11:00 AM – 11:30 AM ET',
  '11:30 AM – 12:00 PM ET',
  '1:00 PM – 1:30 PM ET',
  '1:30 PM – 2:00 PM ET',
  '2:00 PM – 2:30 PM ET',
  '2:30 PM – 3:00 PM ET',
  '3:00 PM – 3:30 PM ET',
  '3:30 PM – 4:00 PM ET',
  '4:00 PM – 4:30 PM ET',
  '4:30 PM – 5:00 PM ET',
];

interface GrecaptchaInstance {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
}

const getGrecaptcha = (): GrecaptchaInstance | null =>
  (window as unknown as { grecaptcha?: GrecaptchaInstance }).grecaptcha || null;

const StepIndicator = ({ step, current }: { step: number; current: number }) => {
  const done = current > step;
  const active = current === step;
  return (
    <div
      className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors',
        done && 'bg-primary border-primary text-primary-foreground',
        active && 'bg-primary border-primary text-primary-foreground',
        !done && !active && 'bg-white border-border text-muted-foreground'
      )}
    >
      {done ? <CheckCircle className="w-4 h-4" /> : step}
    </div>
  );
};

const ScheduleCallForm = () => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useAttribution();

  const form = useForm<ScheduleCallFormValues>({
    resolver: zodResolver(scheduleCallFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      company: '',
      quantityRange: '',
      message: '',
      timeSlot: '',
    },
    mode: 'onChange',
  });

  const meetingDate = form.watch('meetingDate');
  const timeSlot = form.watch('timeSlot');

  const addFiles = useCallback((list: FileList | File[]) => {
    setFiles((prev) => {
      const next = [...prev];
      for (const file of Array.from(list)) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          toast.error(`${file.name} exceeds 10MB and was skipped.`);
          continue;
        }
        next.push(file);
      }
      return next;
    });
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        const f = items[i].getAsFile();
        if (f) imageFiles.push(f);
      }
    }
    if (imageFiles.length) { e.preventDefault(); addFiles(imageFiles); }
  }, [addFiles]);

  const executeRecaptcha = (): Promise<string> =>
    new Promise((resolve, reject) => {
      const g = getGrecaptcha();
      if (!g) { reject(new Error('reCAPTCHA not loaded. Please refresh and try again.')); return; }
      g.ready(() => g.execute(RECAPTCHA_SITE_KEY, { action: 'quote_submit' }).then(resolve).catch(reject));
    });

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha();
      } catch {
        toast.error('Security verification failed. Please refresh the page and try again.');
        return;
      }

      const result = await submitLead({
        formData: buildScheduleCallQuotePayload(values, files.map((f) => f.name)),
        recaptchaToken,
        honeypot,
      });

      if (result.success) {
        setIsSuccess(true);
        form.reset();
        setFiles([]);
        return;
      }

      const err = result.error!;
      const parts = [err.message];
      if (err.details) parts.push(String(err.details).slice(0, 200));
      toast.error(parts.join(' — '), { duration: 15000 });
    } catch {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  });

  if (isSuccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">You're Booked!</h2>
          <p className="text-muted-foreground mb-2">Your call request has been submitted successfully.</p>
          <p className="text-sm text-muted-foreground mb-6">We'll confirm your slot shortly.</p>
          <button
            type="button"
            onClick={() => { setIsSuccess(false); form.reset(); setFiles([]); setStep(1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="mx-auto block cursor-pointer bg-transparent border-none p-0"
          >
            <img src={allyNutraLogo} alt="Ally Nutra" className="h-10" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {[1, 2, 3].map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <StepIndicator step={s} current={step} />
            {i < 2 && <div className={cn('w-12 h-0.5', step > s ? 'bg-primary' : 'bg-border')} />}
          </div>
        ))}
      </div>

      {/* Step 1 — Select a Date */}
      {step === 1 && (
        <FormCard>
          <h2 className="text-xl font-bold text-primary mb-1">Select a Date</h2>
          <p className="text-sm text-muted-foreground mb-5">Choose your preferred day for the call.</p>
          <Controller
            control={form.control}
            name="meetingDate"
            render={({ field }) => (
              <div className="rounded-md border border-border p-3 bg-white">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) => date < startOfToday()}
                  initialFocus
                  className="mx-auto"
                />
              </div>
            )}
          />
          {form.formState.errors.meetingDate && (
            <p className="text-sm text-destructive mt-2">{form.formState.errors.meetingDate.message}</p>
          )}
          <Button
            className="w-full mt-6 py-6 text-base font-semibold"
            disabled={!meetingDate}
            onClick={() => setStep(2)}
          >
            Continue <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </FormCard>
      )}

      {/* Step 2 — Select a Time */}
      {step === 2 && (
        <FormCard>
          <div className="mb-5">
            <p className="text-sm text-muted-foreground font-medium">
              {meetingDate ? format(meetingDate, 'EEEE, MMMM d, yyyy') : ''}
            </p>
            <h2 className="text-xl font-bold text-primary mt-0.5">Select a Time</h2>
            <p className="text-sm text-muted-foreground mt-1">All times are Eastern Time (ET).</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TIME_SLOTS_ET.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => form.setValue('timeSlot', slot, { shouldValidate: true })}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-sm font-medium text-left transition-colors',
                  timeSlot === slot
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-white hover:border-primary/40 text-foreground'
                )}
              >
                {slot}
              </button>
            ))}
          </div>
          {form.formState.errors.timeSlot && (
            <p className="text-sm text-destructive mt-2">{form.formState.errors.timeSlot.message}</p>
          )}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1 py-6" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              className="flex-1 py-6 text-base font-semibold"
              disabled={!timeSlot}
              onClick={() => setStep(3)}
            >
              Continue <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </FormCard>
      )}

      {/* Step 3 — Your Information */}
      {step === 3 && (
        <FormCard>
          <div className="mb-5">
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm mb-5">
              <p className="font-semibold text-foreground">{meetingDate ? format(meetingDate, 'EEEE, MMMM d, yyyy') : ''}</p>
              <p className="text-muted-foreground mt-0.5">{timeSlot}</p>
            </div>
            <h2 className="text-xl font-bold text-primary">Your Information</h2>
            <p className="text-sm text-muted-foreground mt-1">Tell us how to reach you.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sc-fullName" className="text-sm font-medium">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input id="sc-fullName" placeholder="Jane Doe" className="bg-white border-border" {...form.register('fullName')} />
                {form.formState.errors.fullName && <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sc-email" className="text-sm font-medium">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input id="sc-email" type="email" placeholder="jane@company.com" className="bg-white border-border" {...form.register('email')} />
                {form.formState.errors.email && <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sc-phone" className="text-sm font-medium">
                  Phone <span className="text-destructive">*</span>
                </Label>
                <Input id="sc-phone" type="tel" placeholder="(555) 123-4567" className="bg-white border-border" {...form.register('phone')} />
                {form.formState.errors.phone && <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sc-company" className="text-sm font-medium">Company</Label>
                <Input id="sc-company" placeholder="Your company" className="bg-white border-border" {...form.register('company')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">
                How many units are you looking to order? <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.watch('quantityRange')}
                onValueChange={(v) => form.setValue('quantityRange', v, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full bg-white border-border">
                  <SelectValue placeholder="Select quantity range" />
                </SelectTrigger>
                <SelectContent className="bg-white border-border z-50">
                  {quantityRanges.map((range) => (
                    <SelectItem key={range} value={range}>{range}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.quantityRange && <p className="text-sm text-destructive">{form.formState.errors.quantityRange.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sc-message" className="text-sm font-medium">Message</Label>
              <Textarea
                id="sc-message"
                placeholder="What would you like to discuss? e.g. product formulation, pricing, timelines..."
                className="bg-white border-border min-h-[100px] resize-y"
                {...form.register('message')}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Attachments</Label>
              <div
                ref={dropRef}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onPaste={handlePaste}
                className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center cursor-pointer transition-colors hover:bg-muted/35 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <input ref={fileInputRef} type="file" className="hidden" multiple accept=".pdf,image/*,.doc,.docx,.xls,.xlsx"
                  onChange={(e) => { if (e.target.files?.length) addFiles(e.target.files); e.target.value = ''; }} />
                <Paperclip className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground">Click to browse or paste image</p>
                <p className="text-xs text-muted-foreground mt-1">PDF, images, Word, Excel — max 10MB per file</p>
                {files.length > 0 && (
                  <ul className="mt-2 text-left text-xs text-muted-foreground max-h-20 overflow-y-auto">
                    {files.map((f) => <li key={f.name + f.size} className="truncate">{f.name}</li>)}
                  </ul>
                )}
              </div>
            </div>

            <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden">
              <label htmlFor="sc_company_website">Company Website</label>
              <input type="text" id="sc_company_website" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1 py-6" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1 py-6 text-base font-semibold">
                {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Submitting...</> : 'Confirm Call'}
              </Button>
            </div>
          </form>
        </FormCard>
      )}
    </div>
  );
};

export default ScheduleCallForm;
