import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { QuoteFormData } from '@/types/quoteForm';

interface Step5Props {
  form: UseFormReturn<QuoteFormData>;
}

const Step5 = ({ form }: Step5Props) => {
  const { register, watch, setValue, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div className={cn('space-y-2', errors.fullName && 'animate-shake')}>
        <Label htmlFor="fullName">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="fullName"
          {...register('fullName')}
          placeholder="Your full name"
          className={cn('h-11 transition-colors', errors.fullName && 'border-destructive')}
        />
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          readOnly
          className="h-11 bg-muted cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          readOnly
          className="h-11 bg-muted cursor-not-allowed"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">Company</Label>
        <Input id="company" {...register('company')} className="h-11" placeholder="Your company name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm">Additional Notes</Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Tell us about your project, questions, or how we can help..."
          className="min-h-[100px] resize-y"
        />
      </div>

      <div className="flex items-start space-x-3 pt-2">
        <Checkbox
          id="smsConsent"
          checked={watch('smsConsent')}
          onCheckedChange={(checked) => setValue('smsConsent', checked === true)}
          className="mt-1"
        />
        <label
          htmlFor="smsConsent"
          className="text-xs text-muted-foreground leading-relaxed cursor-pointer"
        >
          By checking this box, I expressly consent to receive marketing calls, text messages
          (SMS/MMS), and emails from Ally Nutra LLC at the phone number and email address provided. I
          understand that my consent is not required to make a purchase. Message frequency varies.
          Standard message and data rates may apply. Reply STOP to opt out of texts at any time. View
          our{' '}
          <a href="https://allynutra.com/privacy-policy" target="_blank" rel="noreferrer" className="text-primary underline hover:no-underline">
            Privacy Policy
          </a>
          .
        </label>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed pt-3 border-t">
        By submitting this form, you agree to receive email communications from Ally Nutra
        regarding your quote request and product updates. You can unsubscribe at any time.
      </p>
    </div>
  );
};

export default Step5;
