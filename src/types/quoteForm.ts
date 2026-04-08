import { z } from 'zod';

// Step 1: Initial Information
export const step1Schema = z.object({
  supplementType: z.string().min(1, 'Please select a product type'),
  quantity: z.string().min(1, 'Please select a quantity range'),
  formulationStatus: z.enum(['complete', 'general_idea', 'need_help'], {
    required_error: 'Please select your formulation status',
  }),
});

// Ingredient schema
export const ingredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Ingredient name is required'),
  amount: z.string().optional(),
  unit: z.string().default('mg'),
});

// Step 2: Formulation Details
export const step2Schema = z.object({
  deliveryFormat: z.string().min(1, 'Please select a delivery format'),
  ingredients: z.array(ingredientSchema).min(1, 'Add at least one ingredient'),
  servingSize: z.string().optional(),
  servingsPerContainer: z.string().optional(),
});

// Step 3: Finalization
export const step3Schema = z.object({
  // Packaging preferences (conditional based on delivery format)
  materialType: z.string().optional(),
  unitsPerBox: z.string().optional(),
  netWeight: z.string().optional(),
  packageDimensions: z.string().optional(),
  includeDisplayBox: z.boolean().default(false),
  
  // Label & Design
  labelsProvidedBy: z.string().optional(),
  graphicDesignBy: z.string().optional(),
  
  // Additional comments
  additionalComments: z.string().optional(),
  
  // Contact info
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  company: z.string().optional(),
  
  // Consent
  marketingConsent: z.boolean().default(false),
  emailConsent: z.boolean().default(false),
});

// Combined schema
export const quoteFormSchema = step1Schema.merge(step2Schema).merge(step3Schema);

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Ingredient = z.infer<typeof ingredientSchema>;
export type QuoteFormData = z.infer<typeof quoteFormSchema>;

// Supplement types
export const supplementTypes = [
  'Multivitamin',
  'Probiotic',
  'Sleep Support',
  'Energy & Focus',
  'Joint Health',
  'Immune Support',
  'Digestive Health',
  'Weight Management',
  'Sports Nutrition',
  'Beauty & Wellness',
  'Custom/Other Formula',
];

// Quantity ranges
export const quantityRanges = [
  'Less than 2,000 units',
  '2,000 – 5,000 units',
  '5,000 – 10,000 units',
  '10,000 – 25,000 units',
  '25,000 – 50,000 units',
  '50,000 – 100,000 units',
  '100,000+ units',
];

// Delivery formats with descriptions
export const deliveryFormats = [
  { value: 'capsules', label: 'Capsules (hard shell)', description: 'Great for powders, herbs, and multi-ingredient formulas' },
  { value: 'softgels', label: 'Softgels', description: 'Ideal for oils, liquids, and fat-soluble vitamins' },
  { value: 'tablets', label: 'Tablets (pressed)', description: 'Cost-effective for high-volume production' },
  { value: 'stick_packs', label: 'Stick Packs (slim tubes)', description: 'Great for energy powders, sleep aids, DTC brands' },
  { value: 'sachets', label: 'Sachets', description: 'Perfect for single-dose powders and drink mixes' },
  { value: 'pouches', label: 'Resealable Pouches', description: 'Multi-serve powder bags with zip closure' },
  { value: 'gummies', label: 'Gummies', description: 'Popular for vitamins, supplements targeting consumers' },
  { value: 'liquids', label: 'Liquid/Shots', description: 'Ready-to-drink supplements and liquid formulas' },
];

// Unit options for ingredients
export const unitOptions = ['mg', 'g', 'mcg', 'IU', 'ml', 'oz', '%'];

// Material types for packaging
export const materialTypes = [
  'Aluminum Foil',
  'Kraft Paper',
  'Matte Finish',
  'Glossy Finish',
  'Clear Window',
];

// Units per box options
export const unitsPerBoxOptions = ['10', '20', '30', '60', '90', '120', 'Custom'];

// Label/Design provider options
export const labelProviderOptions = ['Ally Nutra', 'Customer', 'Third Party'];
export const designProviderOptions = ['Ally Nutra', 'Customer', 'Third Party'];
