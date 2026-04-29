import { UseFormReturn } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuoteFormData, Ingredient, unitOptions } from '@/types/quoteForm';
import { cn } from '@/lib/utils';

interface Step3Props {
  form: UseFormReturn<QuoteFormData>;
}

const Step3 = ({ form }: Step3Props) => {
  const { watch, setValue, register } = form;
  const ingredients = watch('ingredients') || [];

  const addIngredient = () => {
    setValue('ingredients', [...ingredients, { id: crypto.randomUUID(), name: '', amount: '', unit: 'mg' }]);
  };

  const removeIngredient = (id: string) => {
    setValue('ingredients', ingredients.filter((ing) => ing.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setValue('ingredients', ingredients.map((ing) => ing.id === id ? { ...ing, [field]: value } : ing));
  };

  return (
    <div className="space-y-6">
      {/* Ingredient Table */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Your Formulation <span className="text-destructive">*</span>
        </Label>

        {/* Column headers */}
        <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium px-1">
          <div className="col-span-5">Raw Material</div>
          <div className="col-span-3">Amount/Serving <span className="text-destructive">*</span></div>
          <div className="col-span-3">Unit</div>
          <div className="col-span-1" />
        </div>

        {ingredients.map((ingredient) => (
          <div key={ingredient.id} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5">
              <Input
                placeholder="e.g., Vitamin C"
                value={ingredient.name}
                onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                className={cn('bg-white border-border', ingredient.name && 'border-accent/50')}
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
              <Select value={ingredient.unit} onValueChange={(v) => updateIngredient(ingredient.id, 'unit', v)}>
                <SelectTrigger className="bg-white border-border"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white z-50">
                  {unitOptions.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1">
              {ingredients.length > 1 && (
                <button type="button" onClick={() => removeIngredient(ingredient.id)}
                  className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        <Button type="button" onClick={addIngredient} variant="outline"
          className="w-full border-dashed">
          <Plus className="w-4 h-4 mr-2" />
          Add Ingredient
        </Button>
        <p className="text-xs text-muted-foreground">
          Select each raw material and enter its amount per serving. You can add up to 30 ingredients.
        </p>
      </div>

      {/* Serving Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="servingSize" className="text-sm">
            Serving Size <span className="text-destructive">*</span>
          </Label>
          <Input id="servingSize" type="number" min="1" {...register('servingSize')} placeholder="e.g., 2" />
          <p className="text-xs text-muted-foreground">Number of capsules per serving</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="servingsPerContainer" className="text-sm">
            Servings Per Container <span className="text-destructive">*</span>
          </Label>
          <Input id="servingsPerContainer" type="number" min="1" {...register('servingsPerContainer')} placeholder="e.g., 30" />
          <p className="text-xs text-muted-foreground">Total servings in one bottle</p>
        </div>
      </div>

      {/* Formulation Notes */}
      <div className="space-y-2">
        <Label htmlFor="formulationDetails" className="text-sm">Additional Formulation Notes</Label>
        <Textarea
          id="formulationDetails"
          {...register('formulationDetails')}
          placeholder="Any additional notes about your formulation, dosages, or special requirements"
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
};

export default Step3;
