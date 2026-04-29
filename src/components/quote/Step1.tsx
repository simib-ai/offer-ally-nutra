import { ClipboardCheck, Lightbulb } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { QuoteFormData } from '@/types/quoteForm';

const options: Array<{
  value: string;
  label: string;
  description: string;
  Icon: typeof ClipboardCheck;
  style: {
    selected: string;
    unselected: string;
    icon: { selected: string; unselected: string };
    dot: { selected: string; fill: string };
  };
}> = [
  {
    value: 'complete',
    label: 'I have my formula ready',
    description: 'Ready with ingredient list, dosages, and specifications',
    Icon: ClipboardCheck,
    style: {
      selected: 'border-ally-orange bg-ally-orange/10 shadow-md',
      unselected: 'border-border hover:border-ally-orange/50',
      icon: { selected: 'bg-ally-orange text-white', unselected: 'bg-muted text-muted-foreground' },
      dot: { selected: 'border-ally-orange', fill: 'bg-ally-orange' },
    },
  },
  {
    value: 'general_idea',
    label: 'I have an idea but need help refining it',
    description: "We'll show you a few ways to connect with our team",
    Icon: Lightbulb,
    style: {
      selected: 'border-amber-500 bg-amber-50 shadow-md',
      unselected: 'border-amber-200 hover:border-amber-400 hover:bg-amber-50/50',
      icon: { selected: 'bg-amber-500 text-white', unselected: 'bg-amber-50 text-amber-600' },
      dot: { selected: 'border-amber-500', fill: 'bg-amber-500' },
    },
  },
];

interface Step1Props {
  form: UseFormReturn<QuoteFormData>;
}

const Step1 = ({ form }: Step1Props) => {
  const { watch, setValue, register, formState: { errors } } = form;
  const formulationStatus = watch('formulationStatus');

  return (
    <div className="animate-fade-in space-y-4">
      <div className="space-y-2">
        {options.map(({ value, label, description, Icon, style }) => {
          const isSelected = formulationStatus === value;

          return (
            <div
              key={value}
              className={`border-2 rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md active:scale-[0.99] ${
                isSelected ? style.selected : style.unselected
              }`}
              onClick={() => setValue('formulationStatus', value as 'complete' | 'general_idea', { shouldValidate: true })}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? style.icon.selected : style.icon.unselected
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-base">{label}</p>
                  <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected ? style.dot.selected : 'border-muted-foreground/50'
                  }`}
                >
                  {isSelected && (
                    <div className={`w-2.5 h-2.5 rounded-full ${style.dot.fill}`} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {errors.formulationStatus && (
        <p className="text-sm text-destructive">{errors.formulationStatus.message}</p>
      )}

      {/* Business Email — captured early */}
      <div className={cn('space-y-2 pt-2', errors.email && 'animate-shake')}>
        <Label htmlFor="leadEmail">Business Email Address <span className="text-destructive">*</span></Label>
        <Input
          id="leadEmail"
          type="email"
          placeholder="you@company.com"
          className={cn('h-11 transition-colors', errors.email && 'border-destructive')}
          {...register('email')}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
      </div>

      {/* Phone Number — captured early */}
      <div className={cn('space-y-2', errors.phone && 'animate-shake')}>
        <Label htmlFor="leadPhone">Phone Number <span className="text-destructive">*</span></Label>
        <Input
          id="leadPhone"
          type="tel"
          placeholder="(555) 123-4567"
          className={cn('h-11 transition-colors', errors.phone && 'border-destructive')}
          {...register('phone')}
        />
        {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
      </div>
    </div>
  );
};

export default Step1;
