import { UseFormReturn } from 'react-hook-form';
import { CheckCircle2, Pill, Package, Zap, Archive, Tablet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuoteFormData } from '@/types/quoteForm';
import {
  deliveryFormatOptions,
  capsuleTypeOptions,
  tabletTypeOptions,
  unitsPerBoxOptions,
  pouchVolumeOptions,
} from './quoteOptions';

const formatIcons: Record<string, React.ElementType> = {
  capsules: Pill,
  tablets: Tablet,
  sachets: Package,
  'stick-packs': Zap,
  pouches: Archive,
};

interface Step2Props {
  form: UseFormReturn<QuoteFormData>;
}

const Step2 = ({ form }: Step2Props) => {
  const { watch, setValue, register, formState: { errors } } = form;
  const deliveryFormat = watch('deliveryFormat');
  const capsuleType = watch('capsuleType');
  const tabletType = watch('tabletType');
  const unitsPerBox = watch('unitsPerBox');
  const pouchVolume = watch('pouchVolume');

  return (
    <div className="space-y-6">
      {/* Delivery Format Cards */}
      <div className="space-y-3">
        <Label className={cn('text-sm font-medium', errors.deliveryFormat && 'text-destructive')}>
          Delivery Format <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {deliveryFormatOptions.map((option) => {
            const Icon = formatIcons[option.value] || Package;
            const isSelected = deliveryFormat === option.value;
            return (
              <div
                key={option.value}
                className={cn(
                  'border-2 rounded-xl p-4 cursor-pointer transition-all hover:shadow-md active:scale-[0.99]',
                  isSelected ? 'border-ally-orange bg-ally-orange/10 shadow-md' : 'border-border hover:border-ally-orange/50'
                )}
                onClick={() => {
                  setValue('deliveryFormat', option.value, { shouldValidate: true });
                  if (option.value !== 'capsules') { setValue('capsuleType', ''); setValue('capsuleTypeOther', ''); }
                  if (option.value !== 'tablets') { setValue('tabletType', ''); setValue('tabletTypeOther', ''); }
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                    isSelected ? 'bg-ally-orange text-white' : 'bg-muted text-muted-foreground'
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{option.label}</p>
                    <p className="text-xs text-muted-foreground">{option.description}</p>
                  </div>
                  <CheckCircle2 className={cn(
                    'h-5 w-5 flex-shrink-0 transition-all',
                    isSelected ? 'text-ally-orange opacity-100' : 'opacity-0'
                  )} />
                </div>
              </div>
            );
          })}
        </div>
        {errors.deliveryFormat && <p className="text-sm text-destructive">{errors.deliveryFormat.message}</p>}
      </div>

      {/* Capsule Type */}
      {deliveryFormat === 'capsules' && (
        <div className="space-y-2">
          <Label htmlFor="capsuleType">Capsule Type <span className="text-destructive">*</span></Label>
          <Select value={capsuleType || ''} onValueChange={(v) => { setValue('capsuleType', v); if (v !== 'other') setValue('capsuleTypeOther', ''); }}>
            <SelectTrigger><SelectValue placeholder="Select capsule type" /></SelectTrigger>
            <SelectContent>
              {capsuleTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {capsuleType === 'other' && (
            <Input {...register('capsuleTypeOther')} placeholder="Describe your capsule requirements" className="mt-2" />
          )}
        </div>
      )}

      {/* Tablet Type */}
      {deliveryFormat === 'tablets' && (
        <div className="space-y-2">
          <Label htmlFor="tabletType">Tablet Type <span className="text-destructive">*</span></Label>
          <Select value={tabletType || ''} onValueChange={(v) => { setValue('tabletType', v); if (v !== 'other') setValue('tabletTypeOther', ''); }}>
            <SelectTrigger><SelectValue placeholder="Select tablet type" /></SelectTrigger>
            <SelectContent>
              {tabletTypeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {tabletType === 'other' && (
            <Input {...register('tabletTypeOther')} placeholder="Describe your tablet requirements" className="mt-2" />
          )}
        </div>
      )}

      {/* Units Per Box — sachets / stick-packs */}
      {['sachets', 'stick-packs'].includes(deliveryFormat) && (
        <div className="space-y-2">
          <Label>Units Per Box <span className="text-destructive">*</span></Label>
          <Select value={unitsPerBox || ''} onValueChange={(v) => { setValue('unitsPerBox', v); if (v !== 'other') setValue('unitsPerBoxOther', ''); }}>
            <SelectTrigger><SelectValue placeholder="Select count" /></SelectTrigger>
            <SelectContent>
              {unitsPerBoxOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {unitsPerBox === 'other' && (
            <Input {...register('unitsPerBoxOther')} placeholder="Specify count" className="mt-2" />
          )}
        </div>
      )}

      {/* Pouch Volume */}
      {deliveryFormat === 'pouches' && (
        <div className="space-y-2">
          <Label>Pouch Volume / Net Weight <span className="text-destructive">*</span></Label>
          <Select value={pouchVolume || ''} onValueChange={(v) => { setValue('pouchVolume', v); if (v !== 'other') setValue('pouchVolumeOther', ''); }}>
            <SelectTrigger><SelectValue placeholder="Select volume" /></SelectTrigger>
            <SelectContent>
              {pouchVolumeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
          {pouchVolume === 'other' && (
            <Input {...register('pouchVolumeOther')} placeholder="Specify volume" className="mt-2" />
          )}
        </div>
      )}

      {/* Estimated Order Quantity */}
      <div className="space-y-2 pt-4 border-t border-border">
        <Label htmlFor="quantity" className="text-sm font-medium">
          Estimated order quantity <span className="text-destructive">*</span>
        </Label>
        <Select value={watch('quantity') || ''} onValueChange={(v) => setValue('quantity', v)}>
          <SelectTrigger className="h-11"><SelectValue placeholder="Select quantity range" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="under-2000">Less than 2,000 units</SelectItem>
            <SelectItem value="2000-5000">2,000 – 5,000 units</SelectItem>
            <SelectItem value="5000-10000">5,000 – 10,000 units</SelectItem>
            <SelectItem value="10000-25000">10,000 – 25,000 units</SelectItem>
            <SelectItem value="25000-50000">25,000 – 50,000 units</SelectItem>
            <SelectItem value="50000-100000">50,000 – 100,000 units</SelectItem>
            <SelectItem value="100000+">100,000+ units</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Step2;
