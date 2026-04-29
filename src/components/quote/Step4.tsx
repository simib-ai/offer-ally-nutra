import { UseFormReturn } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuoteFormData } from '@/types/quoteForm';
import {
  getProductCategory,
  bottleTypeOptions, bottleSizeOptions, bottleColorOptions,
  lidTypeOptions, lidColorOptions,
  materialTypeOptions, unitsPerBoxOptions,
  pouchSizeOptions, pouchVolumeOptions, closureTypeOptions,
} from './quoteOptions';

interface Step4Props {
  form: UseFormReturn<QuoteFormData>;
}

function SelectWithOther({
  value, onValueChange, options, placeholder,
  otherValue, onOtherChange, otherPlaceholder,
}: {
  value: string; onValueChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string;
  otherValue: string; onOtherChange: (v: string) => void; otherPlaceholder: string;
}) {
  return (
    <>
      <Select value={value} onValueChange={(v) => { onValueChange(v); if (v !== 'other') onOtherChange(''); }}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((opt) => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
        </SelectContent>
      </Select>
      {value === 'other' && (
        <Input value={otherValue} onChange={(e) => onOtherChange(e.target.value)} placeholder={otherPlaceholder} className="mt-2" />
      )}
    </>
  );
}

const Step4 = ({ form }: Step4Props) => {
  const { watch, setValue, register } = form;
  const deliveryFormat = watch('deliveryFormat');
  const productCategory = getProductCategory(deliveryFormat);

  return (
    <div className="space-y-4">
      {/* BOTTLED (Capsules / Tablets) */}
      {productCategory === 'bottled' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Bottle &amp; Lid Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Bottle Type</Label>
              <SelectWithOther
                value={watch('bottleType') || ''} onValueChange={(v) => setValue('bottleType', v)}
                options={bottleTypeOptions} placeholder="Select type"
                otherValue={watch('bottleTypeOther') || ''} onOtherChange={(v) => setValue('bottleTypeOther', v)}
                otherPlaceholder="Specify bottle type"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Bottle Size</Label>
              <SelectWithOther
                value={watch('bottleSize') || ''} onValueChange={(v) => setValue('bottleSize', v)}
                options={bottleSizeOptions} placeholder="Select size"
                otherValue={watch('bottleSizeOther') || ''} onOtherChange={(v) => setValue('bottleSizeOther', v)}
                otherPlaceholder="Specify size"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Bottle Color</Label>
              <SelectWithOther
                value={watch('bottleColor') || ''} onValueChange={(v) => setValue('bottleColor', v)}
                options={bottleColorOptions} placeholder="Select color"
                otherValue={watch('bottleColorOther') || ''} onOtherChange={(v) => setValue('bottleColorOther', v)}
                otherPlaceholder="Specify color"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Lid Type</Label>
              <SelectWithOther
                value={watch('lidType') || ''} onValueChange={(v) => setValue('lidType', v)}
                options={lidTypeOptions} placeholder="Select type"
                otherValue={watch('lidTypeOther') || ''} onOtherChange={(v) => setValue('lidTypeOther', v)}
                otherPlaceholder="Specify lid type"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Lid Color</Label>
              <SelectWithOther
                value={watch('lidColor') || ''} onValueChange={(v) => setValue('lidColor', v)}
                options={lidColorOptions} placeholder="Select color"
                otherValue={watch('lidColorOther') || ''} onOtherChange={(v) => setValue('lidColorOther', v)}
                otherPlaceholder="Specify color"
              />
            </div>
          </div>
        </div>
      )}

      {/* SACHETS / STICK PACKS */}
      {productCategory === 'flexible-single' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">
            {deliveryFormat === 'sachets' ? 'Sachet' : 'Stick Pack'} Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Material Type</Label>
              <SelectWithOther
                value={watch('materialType') || ''} onValueChange={(v) => setValue('materialType', v)}
                options={materialTypeOptions} placeholder="Select material"
                otherValue={watch('materialTypeOther') || ''} onOtherChange={(v) => setValue('materialTypeOther', v)}
                otherPlaceholder="Specify material type"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Units Per Box</Label>
              <Select value={watch('unitsPerBox') || ''} onValueChange={(v) => { setValue('unitsPerBox', v); if (v !== 'other') setValue('unitsPerBoxOther', ''); }}>
                <SelectTrigger><SelectValue placeholder="Select count" /></SelectTrigger>
                <SelectContent>
                  {unitsPerBoxOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {watch('unitsPerBox') === 'other' && (
                <Input {...register('unitsPerBoxOther')} placeholder="Specify count" className="mt-2" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Net Weight Per Unit</Label>
              <Input {...register('netWeight')} placeholder="e.g., 5g, 10g" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Package Dimensions</Label>
              <Input {...register('packageDimensions')} placeholder="e.g., 3x5 inches" />
            </div>
          </div>
        </div>
      )}

      {/* POUCHES */}
      {productCategory === 'flexible-bulk' && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Pouch Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Pouch Size</Label>
              <SelectWithOther
                value={watch('pouchSize') || ''} onValueChange={(v) => setValue('pouchSize', v)}
                options={pouchSizeOptions} placeholder="Select size"
                otherValue={watch('pouchSizeOther') || ''} onOtherChange={(v) => setValue('pouchSizeOther', v)}
                otherPlaceholder="Specify size"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Volume / Net Weight</Label>
              <Select value={watch('pouchVolume') || ''} onValueChange={(v) => { setValue('pouchVolume', v); if (v !== 'other') setValue('pouchVolumeOther', ''); }}>
                <SelectTrigger><SelectValue placeholder="Select volume" /></SelectTrigger>
                <SelectContent>
                  {pouchVolumeOptions.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {watch('pouchVolume') === 'other' && (
                <Input {...register('pouchVolumeOther')} placeholder="Specify volume" className="mt-2" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm">Material Type</Label>
              <SelectWithOther
                value={watch('materialType') || ''} onValueChange={(v) => setValue('materialType', v)}
                options={materialTypeOptions} placeholder="Select material"
                otherValue={watch('materialTypeOther') || ''} onOtherChange={(v) => setValue('materialTypeOther', v)}
                otherPlaceholder="Specify material type"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm">Closure Type</Label>
              <SelectWithOther
                value={watch('closureType') || ''} onValueChange={(v) => setValue('closureType', v)}
                options={closureTypeOptions} placeholder="Select closure"
                otherValue={watch('closureTypeOther') || ''} onOtherChange={(v) => setValue('closureTypeOther', v)}
                otherPlaceholder="Specify closure type"
              />
            </div>
          </div>
        </div>
      )}

      {/* OTHER */}
      {productCategory === 'other' && deliveryFormat && (
        <div className="space-y-2">
          <Label htmlFor="packageDimensions">Package Requirements</Label>
          <Input id="packageDimensions" {...register('packageDimensions')} placeholder="Describe your packaging needs" />
        </div>
      )}

      {/* Labels & Design */}
      <div className="space-y-4 pt-4 border-t">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm">Labels Provided By <span className="text-destructive">*</span></Label>
            <Select value={watch('labelsProvidedBy') || ''} onValueChange={(v) => { setValue('labelsProvidedBy', v); if (v !== 'other') setValue('labelsProvidedByOther', ''); }}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="ally-nutra">Ally Nutra</SelectItem>
                <SelectItem value="undecided">Undecided</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {watch('labelsProvidedBy') === 'other' && (
              <Input {...register('labelsProvidedByOther')} placeholder="e.g., Third-party printer" className="mt-2" />
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-sm">Graphic Design By <span className="text-destructive">*</span></Label>
            <Select value={watch('graphicDesignBy') || ''} onValueChange={(v) => { setValue('graphicDesignBy', v); if (v !== 'other') setValue('graphicDesignByOther', ''); }}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="ally-nutra">Ally Nutra</SelectItem>
                <SelectItem value="undecided">Undecided</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {watch('graphicDesignBy') === 'other' && (
              <Input {...register('graphicDesignByOther')} placeholder="e.g., Freelance designer" className="mt-2" />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm">Additional Comments</Label>
          <Textarea id="message" {...register('message')} placeholder="Any other details about your project, special requests, timeline needs..." rows={3} />
        </div>
      </div>
    </div>
  );
};

export default Step4;
