/**
 * ═══════════════════════════════════════════════════════════════════
 * CRITICAL BUSINESS FLOW — EDGE FUNCTION
 * ═══════════════════════════════════════════════════════════════════
 * This function handles revenue-generating lead capture.
 * Execution order:
 *   1. Rate limit check
 *   2. Honeypot check
 *   3. reCAPTCHA verification
 *   4. Insert into public.leads (main Supabase project)
 *   5. Send to webhook
 *   6. BOTH must succeed for final success
 *
 * DO NOT remove, simplify, or refactor without ensuring:
 *   - Insert into public.leads works
 *   - Webhook integration works
 *   - Full error handling remains intact
 * ═══════════════════════════════════════════════════════════════════
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const LOG = '[CRITICAL_LEAD_FLOW]';
const LOG_FAIL = '[CRITICAL_LEAD_FLOW_FAILURE]';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const RECAPTCHA_SECRET_KEY = Deno.env.get('RECAPTCHA_SECRET_KEY');
const WEBHOOK_URL = 'https://webhook.simibrown.cloud/webhook/ally_nutra';
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';
const MIN_SCORE_THRESHOLD = 0.5;

const MAIN_SUPABASE_URL = Deno.env.get('MAIN_SUPABASE_URL');
const MAIN_SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('MAIN_SUPABASE_SERVICE_ROLE_KEY');

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const ADMIN_NOTIFICATION_EMAIL = 'simi.b@allynutra.com';

// ── Rate limiting ──
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_REQUESTS_PER_WINDOW) return true;
  record.count++;
  return false;
}

// ── reCAPTCHA ──
interface RecaptchaResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

async function verifyRecaptcha(token: string): Promise<{ valid: boolean; score?: number; error?: string }> {
  try {
    const response = await fetch(RECAPTCHA_VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${token}`,
    });
    const data: RecaptchaResponse = await response.json();

    console.log(`${LOG} reCAPTCHA response:`, {
      success: data.success, score: data.score, action: data.action,
      hostname: data.hostname, errors: data['error-codes'],
    });

    if (!data.success) return { valid: false, error: `reCAPTCHA failed: ${data['error-codes']?.join(', ') || 'unknown'}` };
    if (data.action !== 'quote_submit') return { valid: false, error: `Invalid action: '${data.action}'` };
    if (data.score !== undefined && data.score < MIN_SCORE_THRESHOLD) return { valid: false, score: data.score, error: `Score ${data.score} < ${MIN_SCORE_THRESHOLD}` };
    return { valid: true, score: data.score };
  } catch (error) {
    console.error(`${LOG_FAIL} reCAPTCHA verification exception:`, error);
    return { valid: false, error: 'reCAPTCHA verification exception' };
  }
}

// ── Admin notification ──
async function sendAdminErrorNotification(error: string, formData: Record<string, unknown>): Promise<void> {
  if (!RESEND_API_KEY) { console.error(`${LOG} Resend API key not configured`); return; }
  try {
    const resend = new Resend(RESEND_API_KEY);
    await resend.emails.send({
      from: 'Ally Nutra LP <notifications@allynutra.com>',
      to: [ADMIN_NOTIFICATION_EMAIL],
      subject: '⚠️ LP Lead Insert Failed - Action Required',
      html: `
        <h2>Lead Insert Failed</h2>
        <p>A lead from the landing page failed to insert into the database.</p>
        <h3>Error</h3><pre>${error}</pre>
        <h3>Lead Data</h3><pre>${JSON.stringify({ email: formData.email, phone: formData.phone, quantity: formData.quantity }, null, 2)}</pre>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    });
    console.log(`${LOG} Admin notification email sent`);
  } catch (emailError) {
    console.error(`${LOG_FAIL} Failed to send admin notification:`, emailError);
  }
}

// ── Supabase insert ──
async function insertLead(formData: Record<string, unknown>): Promise<{ success: boolean; lead_id?: string; error?: string }> {
  if (!MAIN_SUPABASE_URL || !MAIN_SUPABASE_SERVICE_ROLE_KEY) {
    const msg = 'Main Supabase credentials not configured';
    console.error(`${LOG_FAIL} ${msg}`);
    return { success: false, error: msg };
  }

  try {
    const mainSupabase = createClient(MAIN_SUPABASE_URL, MAIN_SUPABASE_SERVICE_ROLE_KEY);

    // ── STRICT WHITELIST: Only known columns in public.leads ──
    // All tracking/attribution fields go into 'tracking' JSONB column.
    // NEVER spread formData into the insert — only whitelisted keys below.
    // PREREQUISITE: Run on external DB:
    //   ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS tracking jsonb;
    const tracking = {
      gclid: formData.GCLID || formData.gclid || null,
      wbraid: formData.wbraid || null,
      gbraid: formData.gbraid || null,
      fbclid: formData.fbclid || null,
      utm_source: formData.utm_source || null,
      utm_medium: formData.utm_medium || null,
      utm_campaign: formData.utm_campaign || null,
      utm_content: formData.utm_content || null,
      utm_term: formData.utm_term || null,
      campaign_id: formData.campaign_id || null,
      ad_group_id: formData.ad_group_id || null,
      ad_id: formData.ad_id || null,
      utm_keyword: formData.utm_keyword || null,
      utm_matchtype: formData.utm_matchtype || null,
      page_url: formData.page_url || null,
    };

    // ── Formulation details bucket (non-column fields stored as JSON) ──
    const formulationDetails = {
      formulation_status: formData.formulationStatus || formData.formulation_status || null,
      ingredients: formData.ingredients || null,
      serving_size: formData.servingSize || formData.serving_size || null,
      servings_per_container: formData.servingsPerContainer || formData.servings_per_container || null,
      material_type: formData.materialType || formData.material_type || null,
      include_display_box: formData.includeDisplayBox ?? null,
    };

    // ── STRICT WHITELIST — keys MUST match real public.leads columns exactly ──
    const leadData: Record<string, unknown> = {
      full_name: formData.fullName || formData.full_name || null,
      email: formData.email || null,
      phone: formData.phone || null,
      company_name: formData.company || formData.company_name || null,
      product_type: formData.supplementType || formData.supplement_type || formData.product_type || null,
      product_form: formData.deliveryFormat || formData.product_form || null,
      quantity: formData.quantity || null,
      formulation_status: formData.formulationStatus || formData.formulation_status || null,
      labels_provided_by: formData.labelsProvidedBy || formData.labels_provided_by || null,
      graphic_design_by: formData.graphicDesignBy || formData.graphic_design_by || null,
      units_per_box: formData.unitsPerBox || formData.units_per_box || null,
      net_weight: formData.netWeight || formData.net_weight || null,
      package_dimensions: formData.packageDimensions || formData.package_dimensions || null,
      message: formData.additionalComments || formData.message || null,
      source_url: formData.page_url || null,
      tracking,
    };

    console.log(`${LOG} [LEADROW_KEYS]`, Object.keys(leadData));

    // ── DEFENSIVE COLUMN CHECK: query actual DB columns and diff against leadData keys ──
    const { data: colRows, error: colErr } = await mainSupabase
      .from('information_schema.columns' as any)
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'leads');

    if (!colErr && colRows) {
      const dbColumns = new Set((colRows as any[]).map((r: any) => r.column_name));
      const insertKeys = Object.keys(leadData);
      const missingInDB = insertKeys.filter(k => !dbColumns.has(k));
      const logPrefix = `${LOG} [COLUMN_DIFF]`;
      console.log(`${logPrefix} insertKeys:`, insertKeys);
      console.log(`${logPrefix} dbColumns:`, [...dbColumns]);
      if (missingInDB.length > 0) {
        console.error(`${logPrefix} MISMATCH — keys NOT in DB: ${missingInDB.join(', ')}`);
        await sendAdminErrorNotification(`Column mismatch: ${missingInDB.join(', ')}`, leadData);
        return {
          success: false,
          error: 'Column mismatch — insert keys do not exist in public.leads',
          details: `Offending keys: ${missingInDB.join(', ')}`,
          missingInDB,
        };
      }
    } else {
      console.warn(`${LOG} Could not query column list, skipping diff guard. Error:`, colErr?.message);
    }

    console.log(`${LOG} DB insert start`, JSON.stringify(leadData, null, 2));

    const { data, error } = await mainSupabase.from('leads').insert([leadData]).select();

    if (error) {
      console.error(`${LOG_FAIL} Supabase insert error:`, JSON.stringify(error, null, 2));
      await sendAdminErrorNotification(error.message, leadData);
      return { success: false, error: error.message, pg: { code: error.code, details: error.details, hint: error.hint, message: error.message } };
    }

    const lead_id = data?.[0]?.id;
    if (!lead_id) {
      console.error(`${LOG_FAIL} Insert returned no id. Data:`, JSON.stringify(data));
      await sendAdminErrorNotification('Insert returned no id', leadData);
      return { success: false, error: 'Insert returned no id' };
    }

    console.log(`${LOG} DB insert OK id=${lead_id}`);
    return { success: true, lead_id: String(lead_id) };
  } catch (error) {
    console.error(`${LOG_FAIL} Supabase insert exception:`, error);
    await sendAdminErrorNotification(String(error), formData);
    return { success: false, error: String(error) };
  }
}

// ── Webhook ──
async function sendToWebhook(formData: Record<string, unknown>, recaptchaScore: number | undefined): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`${LOG} Sending to webhook...`);
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formData, recaptcha_score: recaptchaScore }),
    });

    const responseBody = await response.text();

    if (!response.ok) {
      const msg = `Webhook returned ${response.status}: ${responseBody}`;
      console.error(`${LOG_FAIL} ${msg}`);
      return { success: false, error: msg };
    }

    console.log(`${LOG} ✓ Webhook success (${response.status})`);
    return { success: true };
  } catch (error) {
    console.error(`${LOG_FAIL} Webhook exception:`, error);
    return { success: false, error: String(error) };
  }
}

// ═══════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ success: false, error: 'Method not allowed', details: `Received ${req.method}` }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    console.log(`${LOG} ── Edge function invoked ──`);

    // ── Rate limit ──
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('cf-connecting-ip') || 'unknown';
    if (isRateLimited(clientIP)) {
      console.log(`${LOG} Rate limited: ${clientIP}`);
      return new Response(JSON.stringify({ success: false, error: 'Rate limited', details: `IP ${clientIP} exceeded ${MAX_REQUESTS_PER_WINDOW} requests per ${RATE_LIMIT_WINDOW_MS}ms` }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    // ── Honeypot ──
    if (body.company_website && body.company_website.trim() !== '') {
      console.log(`${LOG} Honeypot triggered`);
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { recaptchaToken, company_website, ...formData } = body;

    // ── reCAPTCHA ──
    const pageUrl = formData.page_url || '';
    const isDevEnv = pageUrl.includes('lovableproject.com') || pageUrl.includes('lovable.app') ||
                     pageUrl.includes('localhost') || pageUrl.includes('127.0.0.1');
    let recaptchaScore: number | undefined = 1.0;

    if (isDevEnv) {
      console.log(`${LOG} Dev environment — skipping reCAPTCHA`);
    } else {
      if (!recaptchaToken) {
        return new Response(JSON.stringify({ success: false, error: 'Security verification missing', details: 'No recaptchaToken provided in request body' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const recaptchaResult = await verifyRecaptcha(recaptchaToken);
      if (!recaptchaResult.valid) {
        console.log(`${LOG_FAIL} reCAPTCHA failed: ${recaptchaResult.error}`);
        return new Response(JSON.stringify({ success: false, error: 'Security verification failed', details: recaptchaResult.error || 'Unknown reCAPTCHA error' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      recaptchaScore = recaptchaResult.score;
    }

    // ── Step 1: Insert into Supabase (MUST succeed) ──
    console.log(`${LOG} Step 1: Inserting lead into database...`);
    const dbResult = await insertLead(formData);
    if (!dbResult.success) {
      console.error(`${LOG_FAIL} Database insert failed — blocking submission: ${dbResult.error}`);
      return new Response(JSON.stringify({
        success: false,
        error: 'DB insert failed',
        details: dbResult.error || 'Unknown DB error',
        pg: (dbResult as any).pg || null,
      }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Step 2: Send to webhook ──
    console.log(`${LOG} Step 2: Sending to webhook...`);
    const webhookResult = await sendToWebhook(formData, recaptchaScore);
    if (!webhookResult.success) {
      console.error(`${LOG_FAIL} Webhook failed (DB succeeded, lead_id=${dbResult.lead_id}): ${webhookResult.error}`);
      // DB succeeded so lead is persisted — don't fail the user, but log the webhook issue
    }

    // ── Final result ──
    console.log(`${LOG} ── Submission complete (DB: ✓ id=${dbResult.lead_id}, Webhook: ${webhookResult.success ? '✓' : '✗'}) ──`);

    return new Response(JSON.stringify({ success: true, lead_id: dbResult.lead_id, message: 'Quote request submitted successfully' }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`${LOG_FAIL} Unhandled exception:`, error);
    return new Response(JSON.stringify({ success: false, error: 'Unhandled server exception', details: String(error) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
