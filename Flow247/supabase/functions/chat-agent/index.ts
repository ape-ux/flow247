// Supabase Edge Function: Chat Agent Proxy
// Proxies authenticated chat requests to the Xano Agent API.
// Deploy: supabase functions deploy chat-agent --project-ref chpeeawrdhjfqgdhqhsr

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const XANO_AGENT_URL =
  'https://xjlt-4ifj-k7qu.n7e.xano.io/api:AKAonta6/agent/invoke';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(message: string, status: number) {
  return jsonResponse({ error: message }, status);
}

// ─── Handler ─────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  // ── CORS preflight ─────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // ── Only POST ──────────────────────────────────────────────────────────
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    // ── Auth: validate JWT ─────────────────────────────────────────────
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return errorResponse('Missing authorization header', 401);
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return errorResponse('Unauthorized', 401);
    }

    // ── Parse request body ─────────────────────────────────────────────
    const body = await req.json();
    const { message, conversation_id, context } = body as {
      message?: string;
      conversation_id?: string;
      context?: Record<string, unknown>;
    };

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return errorResponse('Missing or empty "message" field', 400);
    }

    // ── Look up Xano user ID from profiles ─────────────────────────────
    const { data: profile } = await supabase
      .from('profiles')
      .select('xano_user_id, full_name, account_id, tenant_id')
      .eq('id', user.id)
      .single();

    // ── Build Xano payload ─────────────────────────────────────────────
    const xanoPayload = {
      message: message.trim(),
      conversation_id: conversation_id || null,
      context: {
        ...(context || {}),
        // Inject user info so the agent knows who is speaking
        user: {
          supabase_id: user.id,
          xano_user_id: profile?.xano_user_id || null,
          email: user.email,
          name: profile?.full_name || user.user_metadata?.name || null,
          account_id: profile?.account_id || null,
          tenant_id: profile?.tenant_id || null,
        },
      },
    };

    // ── Forward to Xano Agent API ──────────────────────────────────────
    const xanoResponse = await fetch(XANO_AGENT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the original auth header in case Xano needs it
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(xanoPayload),
    });

    // ── Handle Xano errors ─────────────────────────────────────────────
    if (!xanoResponse.ok) {
      const errorText = await xanoResponse.text().catch(() => 'Unknown error');
      console.error(
        `[chat-agent] Xano error ${xanoResponse.status}:`,
        errorText
      );
      return errorResponse(
        `Agent service error (${xanoResponse.status})`,
        xanoResponse.status >= 500 ? 502 : xanoResponse.status
      );
    }

    // ── Return Xano response ───────────────────────────────────────────
    const xanoData = await xanoResponse.json();

    return jsonResponse({
      success: true,
      data: xanoData,
      conversation_id: xanoData.conversation_id || conversation_id || null,
    });
  } catch (error) {
    console.error('[chat-agent] Unexpected error:', error);

    if (error instanceof SyntaxError) {
      return errorResponse('Invalid JSON in request body', 400);
    }

    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error',
      500
    );
  }
});
