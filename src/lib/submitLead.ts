/**
 * ═══════════════════════════════════════════════════════════════════
 * CRITICAL BUSINESS FLOW
 * ═══════════════════════════════════════════════════════════════════
 * This module handles revenue-generating lead capture.
 * DO NOT remove, simplify, or refactor without ensuring:
 *   1. Insert into public.leads works
 *   2. Webhook integration works
 *   3. Full error handling remains intact
 *   4. Attribution (UTM/GCLID) is always populated
 *   5. reCAPTCHA verification is never bypassed
 *
 * All submissions MUST go through submitLead().
 * ═══════════════════════════════════════════════════════════════════
 */

import { forceRefreshAttribution, type AttributionParams } from '@/hooks/useAttribution';
import type { QuoteFormData } from '@/types/quoteForm';

const LOG_PREFIX = '[CRITICAL_LEAD_FLOW]';

/** Legacy anon/service keys are JWTs (3 dot-separated segments, typically start with eyJ). New publishable keys (sb_publishable_…) must NOT be sent as Bearer — gateway rejects with 401. */
function isLegacySupabaseJwtApiKey(key: string): boolean {
  if (!key.startsWith('eyJ')) return false;
  return key.split('.').length === 3;
}

interface SubmitLeadOptions {
  formData: QuoteFormData;
  recaptchaToken: string;
  honeypot: string;
}

interface LeadError {
  message: string;
  details: string | null;
  status: number | null;
  rawData?: Record<string, unknown> | null;
}

interface SubmitLeadResult {
  success: boolean;
  error?: LeadError;
}

/**
 * Build the full payload for submission.
 * Guarantees all attribution fields are strings (never null/undefined).
 */
function buildPayload(
  formData: QuoteFormData,
  attribution: AttributionParams,
  recaptchaToken: string,
  honeypot: string
): Record<string, unknown> {
  return {
    // ── Form data ──
    ...formData,
    ingredients: formData.ingredients.filter(ing => ing.name.trim() !== ''),

    // ── Attribution (all guaranteed strings) ──
    gclid: attribution.gclid,
    GCLID: attribution.gclid, // uppercase alias for CRM
    wbraid: attribution.wbraid,
    gbraid: attribution.gbraid,
    fbclid: attribution.fbclid,
    utm_source: attribution.utm_source,
    utm_medium: attribution.utm_medium,
    utm_campaign: attribution.utm_campaign,
    utm_content: attribution.utm_content,
    utm_term: attribution.utm_term,
    campaign_id: attribution.campaign_id,
    ad_group_id: attribution.ad_group_id,
    ad_id: attribution.ad_id,
    utm_keyword: attribution.utm_keyword,
    utm_matchtype: attribution.utm_matchtype,
    page_url: attribution.page_url,

    // ── Metadata ──
    submission_time: new Date().toISOString(),

    // ── Security ──
    recaptchaToken,
    company_website: honeypot,
  };
}

/**
 * Validate required form fields before any external calls.
 * Throws a descriptive error if validation fails.
 */
function validatePreSubmit(formData: QuoteFormData): void {
  if (!formData.email || formData.email.trim() === '') {
    throw new Error('Email is required.');
  }
  // fullName is soft-required: general_idea quick-submit may not have it set yet
  if (!formData.fullName || formData.fullName.trim() === '') {
    console.warn(`${LOG_PREFIX} fullName is empty — will proceed with email-derived name`);
  }
}

/**
 * Centralized lead submission function.
 *
 * Execution order:
 *   1. Validate form data locally
 *   2. Capture attribution (URL > localStorage > cookies)
 *   3. Build enriched payload
 *   4. Invoke edge function (which handles Supabase insert + webhook)
 *   5. Validate response
 *
 * This function NEVER throws an unhandled exception.
 * It always returns { success, error? }.
 */
export async function submitLead(options: SubmitLeadOptions): Promise<SubmitLeadResult> {
  const { formData, recaptchaToken, honeypot } = options;

  console.log(`${LOG_PREFIX} ── Submission started ──`);
  console.log(`${LOG_PREFIX} Timestamp: ${new Date().toISOString()}`);

  try {
    // ── Step 1: Pre-validation ──
    console.log(`${LOG_PREFIX} Step 1: Validating form data...`);
    validatePreSubmit(formData);
    console.log(`${LOG_PREFIX} Step 1: ✓ Form data valid`);

    // ── Step 2: reCAPTCHA validation ──
    console.log(`${LOG_PREFIX} Step 2: Verifying reCAPTCHA token...`);
    if (!recaptchaToken || recaptchaToken.trim() === '') {
      throw new Error('reCAPTCHA token is missing. Please try again.');
    }
    console.log(`${LOG_PREFIX} Step 2: ✓ reCAPTCHA token present`);

    // ── Step 3: Capture attribution ──
    console.log(`${LOG_PREFIX} Step 3: Capturing attribution...`);
    const attribution = forceRefreshAttribution();
    console.log(`${LOG_PREFIX} Step 3: ✓ Attribution captured`, {
      gclid: attribution.gclid || '(empty)',
      utm_source: attribution.utm_source || '(empty)',
      utm_medium: attribution.utm_medium || '(empty)',
      utm_campaign: attribution.utm_campaign || '(empty)',
      page_url: attribution.page_url,
    });

    // ── Step 4: Build payload ──
    console.log(`${LOG_PREFIX} Step 4: Building payload...`);
    const payload = buildPayload(formData, attribution, recaptchaToken, honeypot);
    console.log(`${LOG_PREFIX} Step 4: ✓ Payload built (${Object.keys(payload).length} fields)`);

    // ── Step 5: Submit to edge function via raw fetch ──
    // We use fetch directly instead of supabase.functions.invoke() because
    // the SDK consumes the response body on non-2xx, making structured error
    // parsing impossible. Raw fetch gives us full control.
    console.log(`${LOG_PREFIX} Step 5: Calling submit-quote edge function via fetch...`);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const functionUrl = `${supabaseUrl}/functions/v1/submit-quote`;
    const rawKey = supabaseAnonKey == null ? '' : String(supabaseAnonKey);
    const trimmedKey = rawKey.trim();
    const useJwtBearer = isLegacySupabaseJwtApiKey(trimmedKey);

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      apikey: trimmedKey,
    };
    if (useJwtBearer) {
      requestHeaders.Authorization = `Bearer ${trimmedKey}`;
    }

    const fetchResponse = await fetch(functionUrl, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify(payload),
    });

    const responseText = await fetchResponse.text();
    console.log(`${LOG_PREFIX} [DEBUG] HTTP ${fetchResponse.status} raw body:`, responseText);

    let serverPayload: Record<string, unknown> | null = null;
    try {
      serverPayload = JSON.parse(responseText);
    } catch {
      console.error(`${LOG_PREFIX} [DEBUG] Could not parse response as JSON`);
    }

    console.log(`${LOG_PREFIX} [DEBUG] Parsed serverPayload:`, serverPayload);

    if (!fetchResponse.ok || serverPayload?.success === false || !serverPayload?.lead_id) {
      const leadError: LeadError = {
        message: (serverPayload?.error as string) || 'Failed to submit. Please try again.',
        details: (serverPayload?.details as string) || null,
        status: fetchResponse.status,
        rawData: serverPayload,
      };

      console.error(`[CRITICAL_LEAD_FLOW_FAILURE]`, leadError);

      return { success: false, error: leadError };
    }

    console.log(`${LOG_PREFIX} ── Submission completed successfully (lead_id=${serverPayload.lead_id}) ──`);
    return { success: true };

  } catch (caughtError: unknown) {
    const message = caughtError instanceof Error ? caughtError.message : 'An unexpected error occurred.';
    console.error(`[CRITICAL_LEAD_FLOW_FAILURE]`, {
      error: message,
      stack: caughtError instanceof Error ? caughtError.stack : undefined,
      formEmail: formData.email,
      timestamp: new Date().toISOString(),
    });
    return { success: false, error: { message, details: null, status: null } };
  }
}
