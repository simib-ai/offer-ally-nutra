

# Plan: Align offer.allynutra.com Quote Form with allynutra.com

## Summary

You want to synchronize the quote form on **offer.allynutra.com** with the one on **allynutra.com/quote** so that:
1. Both forms collect the same data fields
2. Leads are stored in the same database (the one used by allynutra.com)
3. After submission, users are redirected to **https://allynutra.com/quote-requested**

---

## Current State Analysis

### What's Already Working
- The Edge Function (`submit-quote`) is already configured to insert leads into the main allynutra.com database
- The secrets `MAIN_SUPABASE_URL` and `MAIN_SUPABASE_SERVICE_ROLE_KEY` are already set up
- Email notifications are configured to alert `simi.b@allynutra.com` on insertion failures

### Form Differences

| Field | offer.allynutra.com | allynutra.com |
|-------|---------------------|---------------|
| Supplement Types | 14 options (includes separate Multivitamins & Probiotics) | 11 options (Multivitamin, Probiotic as single options) |
| Quantity Ranges | Starts at 1,000 units | Starts at "Less than 2,000 units" |
| Redirect | Returns to homepage `/` | Redirects to `https://allynutra.com/quote-requested` |

### Core Issue
The lead insertion is currently failing. This could be due to:
- Field name mismatches between what's sent and what the main database expects
- Missing or extra columns in the payload

---

## Implementation Plan

### Step 1: Match Supplement Type Options
Update `src/types/quoteForm.ts` to use the exact same supplement type options as allynutra.com:
- Multivitamin
- Probiotic
- Sleep Support
- Energy & Focus
- Joint Health
- Immune Support
- Digestive Health
- Weight Management
- Sports Nutrition
- Beauty & Wellness
- Custom/Other Formula

### Step 2: Match Quantity Range Options
Update quantity ranges to match allynutra.com:
- Less than 2,000 units
- 2,000 - 5,000 units
- 5,000 - 10,000 units
- 10,000 - 25,000 units
- 25,000 - 50,000 units
- 50,000 - 100,000 units
- 100,000+ units

### Step 3: Update Redirect After Submission
Modify `src/components/quote/QuoteForm.tsx` to redirect to `https://allynutra.com/quote-requested` instead of the homepage after successful submission.

### Step 4: Verify Lead Data Mapping
Review and update the Edge Function (`supabase/functions/submit-quote/index.ts`) to ensure the field mapping matches exactly what the main allynutra.com `leads` table expects. The key fields to verify:
- `name` (from `fullName`)
- `email`
- `phone`
- `supplement_type`
- `product_format` (from `deliveryFormat`)
- `quantity`
- `message` (from `additionalComments`)
- `source_url` / `page_url`
- UTM parameters

---

## Technical Details

### Files to Modify

1. **`src/types/quoteForm.ts`**
   - Update `supplementTypes` array
   - Update `quantityRanges` array

2. **`src/components/quote/QuoteForm.tsx`**
   - Change redirect from `navigate('/')` to `window.location.href = 'https://allynutra.com/quote-requested'`

3. **`supabase/functions/submit-quote/index.ts`**
   - Verify field mapping in `insertLeadToMainProject` function
   - Add logging to debug any schema mismatches

### Testing Strategy
After implementation, we'll need to:
1. Submit a test lead through the form
2. Check Edge Function logs to verify the insertion succeeds
3. Verify the lead appears in the allynutra.com admin panel
4. Confirm the redirect works correctly

---

## Next Steps

Once you approve this plan, I'll:
1. Update the form options to match allynutra.com
2. Implement the redirect to the thank-you page
3. Review and fix the Edge Function field mapping
4. Deploy and test the changes

