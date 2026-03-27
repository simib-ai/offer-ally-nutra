import { UseFormReturn } from 'react-hook-form';
import { Package, Mail, Phone, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import FormCard from './FormCard';
import { QuoteFormData, materialTypes, unitsPerBoxOptions, labelProviderOptions, designProviderOptions } from '@/types/quoteForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface Step3Props {
  form: UseFormReturn<QuoteFormData>;
}

const Step3 = ({ form }: Step3Props) => {
  const { watch, setValue, formState: { errors } } = form;
  const [packagingExpanded, setPackagingExpanded] = useState(true);
  const deliveryFormat = watch('deliveryFormat');

  // Get packaging section title based on delivery format
  const getPackagingTitle = () => {
    switch (deliveryFormat) {
      case 'stick_packs':
        return 'Stick Pack Details';
      case 'sachets':
        return 'Sachet Details';
      case 'pouches':
        return 'Pouch Details';
      case 'capsules':
      case 'softgels':
        return 'Bottle Details';
      case 'tablets':
        return 'Tablet Packaging Details';
      default:
        return 'Packaging Details';
    }
  };

  return (
    <div className="animate-fade-in">
      <FormCard>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-primary mb-2">Finalize Your Quote</h3>
          <p className="text-muted-foreground">Your contact info, packaging preferences, and special requests</p>
        </div>

        <div className="space-y-6">
          {/* Packaging Details - Collapsible */}
          <div className="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setPackagingExpanded(!packagingExpanded)}
              className="w-full flex items-center justify-between p-4 bg-white hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium text-foreground">{getPackagingTitle()}</span>
              </div>
              {packagingExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {packagingExpanded && (
              <div className="p-4 border-t border-border space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Material Type</Label>
                    <Select
                      value={watch('materialType') || ''}
                      onValueChange={(value) => setValue('materialType', value)}
                    >
                      <SelectTrigger className="bg-white border-border">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-border z-50">
                        {materialTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Units Per Box</Label>
                    <Select
                      value={watch('unitsPerBox') || ''}
                      onValueChange={(value) => setValue('unitsPerBox', value)}
                    >
                      <SelectTrigger className="bg-white border-border">
                        <SelectValue placeholder="Select count" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-border z-50">
                        {unitsPerBoxOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Net Weight Per Unit</Label>
                    <Input
                      placeholder="e.g., 5g, 10g"
                      value={watch('netWeight') || ''}
                      onChange={(e) => setValue('netWeight', e.target.value)}
                      className="bg-white border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-foreground">Package Dimensions</Label>
                    <Input
                      placeholder="e.g., 3x5 inches"
                      value={watch('packageDimensions') || ''}
                      onChange={(e) => setValue('packageDimensions', e.target.value)}
                      className="bg-white border-border"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    id="displayBox"
                    checked={watch('includeDisplayBox')}
                    onCheckedChange={(checked) => setValue('includeDisplayBox', checked as boolean)}
                  />
                  <Label htmlFor="displayBox" className="text-sm text-foreground cursor-pointer">
                    Include display box packaging
                  </Label>
                </div>
              </div>
            )}
          </div>

          {/* Label & Design Services */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Label & Design Services</h4>
              <p className="text-sm text-muted-foreground">Let us know your preferences</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Labels Provided By</Label>
                <Select
                  value={watch('labelsProvidedBy') || ''}
                  onValueChange={(value) => setValue('labelsProvidedBy', value)}
                >
                  <SelectTrigger className="bg-white border-border">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border z-50">
                    {labelProviderOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Graphic Design By</Label>
                <Select
                  value={watch('graphicDesignBy') || ''}
                  onValueChange={(value) => setValue('graphicDesignBy', value)}
                >
                  <SelectTrigger className="bg-white border-border">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-border z-50">
                    {designProviderOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Comments */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Additional Comments</Label>
            <Textarea
              placeholder="Any other details about your project, special requests, timeline needs..."
              value={watch('additionalComments') || ''}
              onChange={(e) => setValue('additionalComments', e.target.value)}
              className="bg-white border-border min-h-[100px] resize-none"
            />
          </div>

          {/* Contact Information Section */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <h4 className="font-semibold text-foreground">Your Contact Information</h4>
                <p className="text-sm text-muted-foreground">We'll use this to send your personalized quote</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder=""
                  value={watch('fullName') || ''}
                  onChange={(e) => setValue('fullName', e.target.value, { shouldValidate: true })}
                  className={cn(
                    'bg-white border-border',
                    errors.fullName && 'border-destructive'
                  )}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">{errors.fullName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  placeholder=""
                  value={watch('email') || ''}
                  onChange={(e) => setValue('email', e.target.value, { shouldValidate: true })}
                  className={cn(
                    'bg-white border-border',
                    errors.email && 'border-destructive'
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  type="tel"
                  placeholder=""
                  value={watch('phone') || ''}
                  onChange={(e) => setValue('phone', e.target.value)}
                  className="bg-white border-border"
                />
                <p className="text-xs text-muted-foreground">For faster quote delivery</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Company <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Input
                  placeholder=""
                  value={watch('company') || ''}
                  onChange={(e) => setValue('company', e.target.value)}
                  className="bg-white border-border"
                />
              </div>
            </div>
          </div>

          {/* Consent Checkboxes */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="marketingConsent"
                checked={watch('marketingConsent')}
                onCheckedChange={(checked) => setValue('marketingConsent', checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="marketingConsent" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                By checking this box, I expressly consent to receive marketing calls, text messages (SMS/MMS), and emails from Ally Nutra LLC at the phone number and email address provided. I understand that my consent is not required to make a purchase. Message frequency varies. Standard message and data rates may apply. Reply STOP to opt out of texts at any time. View our <a href="/privacy" className="text-accent underline">Privacy Policy</a>.
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="emailConsent"
                checked={watch('emailConsent')}
                onCheckedChange={(checked) => setValue('emailConsent', checked as boolean)}
                className="mt-1"
              />
              <Label htmlFor="emailConsent" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                I agree to receive email communications from Ally Nutra regarding my quote request and product updates. You can unsubscribe at any time.
              </Label>
            </div>
          </div>
        </div>
      </FormCard>
    </div>
  );
};

export default Step3;
