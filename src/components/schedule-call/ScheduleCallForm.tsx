import { useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, startOfToday } from 'date-fns';
import { CheckCircle, Loader2, Paperclip, User } from 'lucide-react';
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

const getGrecaptcha = (): GrecaptchaInstance | null => {
  return (window as unknown as { grecaptcha?: GrecaptchaInstance }).grecaptcha || null;
};

const ScheduleCallForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [debugError, setDebugError] = useState<Record<string, unknown> | null>(null);
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
    const arr = Array.from(list);
    setFiles((prev) => {
      const next = [...prev];
      for (const file of arr) {
        if (file.size > MAX_ATTACHMENT_BYTES) {
          toast.error(`${file.name} exceeds 10MB and was skipped.`);
          continue;
        }
        next.push(file);
      }
      return next;
    });
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const f = item.getAsFile();
          if (f) imageFiles.push(f);
        }
      }
      if (imageFiles.length) {
        e.preventDefault();
        addFiles(imageFiles);
      }
    },
    [addFiles]
  );

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

  const handleSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    setDebugError(null);
    try {
      let recaptchaToken: string;
      try {
        recaptchaToken = await executeRecaptcha();
      } catch (recaptchaError) {
        console.error('[ScheduleCall] reCAPTCHA failed:', recaptchaError);
        toast.error('Security verification failed. Please refresh the page and try again.');
        return;
      }

      const attachmentNames = files.map((f) => f.name);
      const quotePayload = buildScheduleCallQuotePayload(values, attachmentNames);

      const result = await submitLead({
        formData: quotePayload,
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
      console.error('[ScheduleCall] submit failed', err);
      const parts = [err.message];
      if (err.details) parts.push(String(err.details).slice(0, 200));
      toast.error(parts.join(' — '), { duration: 15000 });
      setDebugError(err as unknown as Record<string, unknown>);
    } catch (unexpectedError) {
      console.error('[ScheduleCall] unexpected', unexpectedError);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  });

  const handleReturnToHome = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsSuccess(false);
    setIsSubmitting(false);
    form.reset();
    setFiles([]);
    setHoneypot('');
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
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
          <p className="text-muted-foreground mb-2">Your call request has been submitted successfully.</p>
          <p className="text-sm text-muted-foreground mb-6">We&apos;ll confirm your slot shortly.</p>
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

  return (
    <div className="w-full max-w-xl mx-auto relative">
      <FormCard>
        <div className="flex items-start gap-3 mb-6">
          <div className="mt-0.5 rounded-md p-2 border border-primary/30 text-primary">
            <User className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-primary">Your Information</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a time, then tell us how to reach you.
            </p>
          </div>
        </div>

        {(meetingDate && timeSlot) ? (
          <div className="mb-6 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
            <p className="font-semibold text-foreground">{format(meetingDate, 'EEEE, MMMM d, yyyy')}</p>
            <p className="text-muted-foreground mt-0.5">{timeSlot}</p>
          </div>
        ) : (
          <div className="mb-6 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
            Select a date and time slot below to see your meeting summary here.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Preferred date <span className="text-destructive">*</span>
            </Label>
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
              <p className="text-sm text-destructive">{form.formState.errors.meetingDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Time slot <span className="text-destructive">*</span>
            </Label>
            <Select
              value={form.watch('timeSlot')}
              onValueChange={(v) => form.setValue('timeSlot', v, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full bg-white border-border">
                <SelectValue placeholder="Select a time (Eastern Time)" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border z-50 max-h-64">
                {TIME_SLOTS_ET.map((slot) => (
                  <SelectItem
                    key={slot}
                    value={slot}
                    className="focus:bg-accent focus:text-accent-foreground"
                  >
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.timeSlot && (
              <p className="text-sm text-destructive">{form.formState.errors.timeSlot.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-fullName" className="text-sm font-medium text-foreground">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sc-fullName"
              placeholder="Jane Doe"
              className="bg-white border-border rounded-md"
              {...form.register('fullName')}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-destructive">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-email" className="text-sm font-medium text-foreground">
              Email <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sc-email"
              type="email"
              placeholder="jane@company.com"
              className="bg-white border-border rounded-md"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-phone" className="text-sm font-medium text-foreground">
              Phone <span className="text-destructive">*</span>
            </Label>
            <Input
              id="sc-phone"
              type="tel"
              placeholder="(555) 123-4567"
              className="bg-white border-border rounded-md"
              {...form.register('phone')}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-company" className="text-sm font-medium text-foreground">
              Company Name
            </Label>
            <Input
              id="sc-company"
              placeholder="Your company"
              className="bg-white border-border rounded-md"
              {...form.register('company')}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
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
                  <SelectItem
                    key={range}
                    value={range}
                    className="focus:bg-accent focus:text-accent-foreground"
                  >
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.quantityRange && (
              <p className="text-sm text-destructive">{form.formState.errors.quantityRange.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sc-message" className="text-sm font-medium text-foreground">
              Message
            </Label>
            <Textarea
              id="sc-message"
              placeholder="What would you like to discuss on the call? e.g. product formulation, pricing, timelines..."
              className="bg-white border-border rounded-md min-h-[120px] resize-y"
              {...form.register('message')}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Attachments</Label>
            <div
              ref={dropRef}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  fileInputRef.current?.click();
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onPaste={handlePaste}
              className={cn(
                'rounded-lg border border-dashed border-border bg-muted/20 px-4 py-8 text-center cursor-pointer transition-colors hover:bg-muted/35 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf,image/*,.doc,.docx,.xls,.xlsx"
                onChange={(e) => {
                  if (e.target.files?.length) addFiles(e.target.files);
                  e.target.value = '';
                }}
              />
              <Paperclip className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Click to browse or paste image</p>
              <p className="text-xs text-muted-foreground mt-1">
                Ctrl+V / ⌘V · PDF, images, Word, Excel — max 10MB per file
              </p>
              {files.length > 0 && (
                <ul className="mt-3 text-left text-xs text-muted-foreground max-h-24 overflow-y-auto">
                  {files.map((f) => (
                    <li key={f.name + f.size} className="truncate">
                      {f.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div aria-hidden="true" className="absolute -left-[9999px] opacity-0 h-0 overflow-hidden">
            <label htmlFor="sc_company_website">Company Website</label>
            <input
              type="text"
              id="sc_company_website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {debugError && (
            <div className="p-4 bg-red-50 border border-red-300 rounded text-xs font-mono text-red-900 overflow-auto max-h-64">
              <div className="font-bold mb-1">Error details:</div>
              <pre className="whitespace-pre-wrap break-all">{JSON.stringify(debugError, null, 2)}</pre>
              <button
                type="button"
                onClick={() => setDebugError(null)}
                className="mt-2 text-red-600 underline text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-md inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Confirm Call'
            )}
          </Button>
        </form>
      </FormCard>
    </div>
  );
};

export default ScheduleCallForm;
