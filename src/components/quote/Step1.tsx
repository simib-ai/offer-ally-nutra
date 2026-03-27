import { UseFormReturn } from 'react-hook-form';
import { ClipboardCheck, Lightbulb, HelpCircle } from 'lucide-react';
import FormCard from './FormCard';
import RadioCard from './RadioCard';
import { QuoteFormData, supplementTypes, quantityRanges } from '@/types/quoteForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Step1Props {
  form: UseFormReturn<QuoteFormData>;
}

const Step1 = ({ form }: Step1Props) => {
  const { watch, setValue } = form;
  const formulationStatus = watch('formulationStatus');

  const formulationOptions = [
    {
      value: 'complete' as const,
      icon: <ClipboardCheck className="w-5 h-5" />,
      title: 'I have a complete formulation',
      description: 'Ready with ingredient list, dosages, and specifications',
    },
    {
      value: 'general_idea' as const,
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'I have a general idea',
      description: 'Know some ingredients or concepts but need refinement',
    },
    {
      value: 'need_help' as const,
      icon: <HelpCircle className="w-5 h-5" />,
      title: 'I need help developing a formulation',
      description: 'Our team will help create a custom formula for your needs',
    },
  ];

  return (
    <div className="animate-fade-in">
      <FormCard>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-primary mb-2">Let's Get Started</h3>
          <p className="text-muted-foreground">A few quick questions to get you started</p>
        </div>

        <div className="space-y-6">
          {/* Supplement Type */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              What type of supplement are you creating? <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('supplementType')}
              onValueChange={(value) => setValue('supplementType', value, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full bg-white border-border">
                <SelectValue placeholder="Select your product type" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border z-50">
                {supplementTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.supplementType && (
              <p className="text-sm text-destructive">{form.formState.errors.supplementType.message}</p>
            )}
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              How many units are you looking to order? <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch('quantity')}
              onValueChange={(value) => setValue('quantity', value, { shouldValidate: true })}
            >
              <SelectTrigger className="w-full bg-white border-border">
                <SelectValue placeholder="Select quantity range" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border z-50">
                {quantityRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.quantity && (
              <p className="text-sm text-destructive">{form.formState.errors.quantity.message}</p>
            )}
          </div>

          {/* Divider with text */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-muted-foreground">One more thing...</span>
            </div>
          </div>

          {/* Formulation Status */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">
              How would you describe your formulation status? <span className="text-destructive">*</span>
            </Label>
            <div className="space-y-3">
              {formulationOptions.map((option) => (
                <RadioCard
                  key={option.value}
                  selected={formulationStatus === option.value}
                  onClick={() => setValue('formulationStatus', option.value, { shouldValidate: true })}
                  icon={option.icon}
                  title={option.title}
                  description={option.description}
                />
              ))}
            </div>
            {form.formState.errors.formulationStatus && (
              <p className="text-sm text-destructive">{form.formState.errors.formulationStatus.message}</p>
            )}
          </div>
        </div>
      </FormCard>
    </div>
  );
};

export default Step1;
