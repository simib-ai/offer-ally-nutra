import { UseFormReturn } from 'react-hook-form';
import { Plus, Trash2, Check } from 'lucide-react';
import FormCard from './FormCard';
import { QuoteFormData, Ingredient, deliveryFormats, unitOptions } from '@/types/quoteForm';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Step2Props {
  form: UseFormReturn<QuoteFormData>;
}

const Step2 = ({ form }: Step2Props) => {
  const { watch, setValue } = form;
  const ingredients = watch('ingredients') || [];
  const deliveryFormat = watch('deliveryFormat');
  const supplementType = watch('supplementType');
  const quantity = watch('quantity');

  const selectedFormat = deliveryFormats.find((f) => f.value === deliveryFormat);

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: crypto.randomUUID(),
      name: '',
      amount: '',
      unit: 'mg',
    };
    setValue('ingredients', [...ingredients, newIngredient]);
  };

  const removeIngredient = (id: string) => {
    setValue(
      'ingredients',
      ingredients.filter((ing) => ing.id !== id)
    );
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setValue(
      'ingredients',
      ingredients.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing))
    );
  };

  const clearAllIngredients = () => {
    setValue('ingredients', [{ id: crypto.randomUUID(), name: '', amount: '', unit: 'mg' }]);
  };

  return (
    <div className="animate-fade-in">
      <FormCard>
        <div className="mb-6">
          <h3 className="text-xl font-bold text-primary mb-2">Your Supplement</h3>
          <p className="text-muted-foreground">Type and formulation details</p>
        </div>

        {/* Summary from Step 1 */}
        <div className="bg-secondary/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{supplementType || 'Not selected'}</span>
            {quantity && (
              <>
                {' '}•{' '}
                <span className="font-medium text-foreground">{quantity}</span>
              </>
            )}
          </p>
        </div>

        <div className="space-y-6">
          {/* Delivery Format */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Delivery Format <span className="text-destructive">*</span>
            </Label>
            <Select
              value={deliveryFormat}
              onValueChange={(value) => setValue('deliveryFormat', value, { shouldValidate: true })}
            >
              <SelectTrigger className={cn(
                'w-full bg-white border-border',
                deliveryFormat && 'border-accent'
              )}>
                <div className="flex items-center justify-between w-full">
                  <SelectValue placeholder="Select delivery format" />
                  {deliveryFormat && <Check className="w-4 h-4 text-accent ml-2" />}
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white border-border z-50">
                {deliveryFormats.map((format) => (
                  <SelectItem key={format.value} value={format.value}>
                    {format.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedFormat && (
              <p className="text-sm text-accent">{selectedFormat.description}</p>
            )}
            {form.formState.errors.deliveryFormat && (
              <p className="text-sm text-destructive">{form.formState.errors.deliveryFormat.message}</p>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Ingredients Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">Your Formulation</Label>
              <button
                type="button"
                onClick={clearAllIngredients}
                className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>

            {/* Ingredient headers */}
            <div className="grid grid-cols-12 gap-2 text-sm text-muted-foreground">
              <div className="col-span-5">Raw Material</div>
              <div className="col-span-3">Amount/Serving</div>
              <div className="col-span-3">Unit</div>
              <div className="col-span-1"></div>
            </div>

            {/* Ingredient rows */}
            {ingredients.map((ingredient, index) => (
              <div key={ingredient.id} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    placeholder="e.g., Vitamin C"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                    className={cn(
                      'bg-white border-border',
                      ingredient.name && 'border-accent/50 bg-accent/5'
                    )}
                  />
                </div>
                <div className="col-span-3">
                  <Input
                    placeholder="e.g., 1000"
                    value={ingredient.amount || ''}
                    onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                    className="bg-white border-border"
                  />
                </div>
                <div className="col-span-3">
                  <Select
                    value={ingredient.unit}
                    onValueChange={(value) => updateIngredient(ingredient.id, 'unit', value)}
                  >
                    <SelectTrigger className="bg-white border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border z-50">
                      {unitOptions.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-1">
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(ingredient.id)}
                      className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add Ingredient Button */}
            <Button
              type="button"
              onClick={addIngredient}
              className="w-full bg-accent/10 hover:bg-accent/20 text-accent-foreground border-0"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Button>

            <p className="text-sm text-muted-foreground">
              Enter each raw material with its amount per serving. You can add up to 30 ingredients.
            </p>
          </div>

          {/* Serving Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Serving Size</Label>
              <Input
                placeholder="e.g., 2"
                value={watch('servingSize') || ''}
                onChange={(e) => setValue('servingSize', e.target.value)}
                className="bg-white border-border"
              />
              <p className="text-xs text-muted-foreground">Number of capsules per serving</p>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Servings Per Container</Label>
              <Input
                placeholder="e.g., 30"
                value={watch('servingsPerContainer') || ''}
                onChange={(e) => setValue('servingsPerContainer', e.target.value)}
                className="bg-white border-border"
              />
              <p className="text-xs text-muted-foreground">Total servings in one bottle</p>
            </div>
          </div>
        </div>
      </FormCard>
    </div>
  );
};

export default Step2;
