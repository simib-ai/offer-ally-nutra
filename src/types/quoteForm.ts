import { z } from 'zod';

export const ingredientSchema = z.object({
  id: z.string(),
  name: z.string(),
  amount: z.string().optional(),
  unit: z.string().default('mg'),
});

export const quoteFormSchema = z.object({
  // Step 1
  formulationStatus: z.enum(['complete', 'general_idea'], { required_error: 'Please select your formulation status' }),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(7, 'Please enter a valid phone number'),

  // Step 2 — Delivery Format
  deliveryFormat: z.string().min(1, 'Please select a delivery format'),
  capsuleType: z.string().optional(),
  capsuleTypeOther: z.string().optional(),
  tabletType: z.string().optional(),
  tabletTypeOther: z.string().optional(),
  unitsPerBox: z.string().optional(),
  unitsPerBoxOther: z.string().optional(),
  pouchVolume: z.string().optional(),
  pouchVolumeOther: z.string().optional(),
  quantity: z.string().optional(),

  // Step 3 — Formulation
  ingredients: z.array(ingredientSchema).default([{ id: '', name: '', amount: '', unit: 'mg' }]),
  servingSize: z.string().optional(),
  servingsPerContainer: z.string().optional(),
  formulationDetails: z.string().optional(),

  // Step 4 — Packaging
  bottleType: z.string().optional(),
  bottleTypeOther: z.string().optional(),
  bottleSize: z.string().optional(),
  bottleSizeOther: z.string().optional(),
  bottleColor: z.string().optional(),
  bottleColorOther: z.string().optional(),
  lidType: z.string().optional(),
  lidTypeOther: z.string().optional(),
  lidColor: z.string().optional(),
  lidColorOther: z.string().optional(),
  materialType: z.string().optional(),
  materialTypeOther: z.string().optional(),
  pouchSize: z.string().optional(),
  pouchSizeOther: z.string().optional(),
  closureType: z.string().optional(),
  closureTypeOther: z.string().optional(),
  packageDimensions: z.string().optional(),
  netWeight: z.string().optional(),
  labelsProvidedBy: z.string().optional(),
  labelsProvidedByOther: z.string().optional(),
  graphicDesignBy: z.string().optional(),
  graphicDesignByOther: z.string().optional(),
  message: z.string().optional(),

  // Step 5 — Review & Submit
  fullName: z.string().optional(),
  company: z.string().optional(),
  smsConsent: z.boolean().default(false),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;
export type Ingredient = z.infer<typeof ingredientSchema>;

export const unitOptions = ['mg', 'g', 'mcg', 'IU', 'ml', 'oz', '%'];
