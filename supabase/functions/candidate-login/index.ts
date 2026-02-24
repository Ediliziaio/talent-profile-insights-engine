import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for password verification
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Rate limiting: max 5 attempts per identifier per 15 minutes
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_ATTEMPTS = 5;

async function checkRateLimit(supabaseAdmin: ReturnType<typeof createClient>, identifier: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  const { count, error } = await supabaseAdmin
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('identifier', identifier)
    .gte('attempted_at', windowStart);

  if (error) {
    console.error('Rate limit check error:', error);
    return false; // fail open on error
  }

  return (count ?? 0) >= RATE_LIMIT_MAX_ATTEMPTS;
}

async function recordAttempt(supabaseAdmin: ReturnType<typeof createClient>, identifier: string): Promise<void> {
  await supabaseAdmin
    .from('login_attempts')
    .insert({ identifier });

  // Cleanup old entries (fire-and-forget)
  const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOW_MS * 2).toISOString();
  supabaseAdmin
    .from('login_attempts')
    .delete()
    .lt('attempted_at', cutoff)
    .then(() => {});
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username e password richiesti' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedUsername = username.toLowerCase().trim();

    // Rate limiting check
    const isRateLimited = await checkRateLimit(supabaseAdmin, normalizedUsername);
    if (isRateLimited) {
      return new Response(
        JSON.stringify({ error: 'Troppi tentativi di accesso. Riprova tra 15 minuti.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record this attempt
    await recordAttempt(supabaseAdmin, normalizedUsername);

    // Find the access record by username
    const { data: accesso, error: accessoError } = await supabaseAdmin
      .from('accessi_azienda')
      .select('*, aziende(id, nome)')
      .eq('username', normalizedUsername)
      .eq('attivo', true)
      .single();

    if (accessoError || !accesso) {
      return new Response(
        JSON.stringify({ error: 'Credenziali non valide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    if (passwordHash !== accesso.password_hash) {
      return new Response(
        JSON.stringify({ error: 'Credenziali non valide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate a session token and persist it in DB
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    // Persist session token for validation by register-candidate
    const { error: sessionError } = await supabaseAdmin
      .from('candidate_sessions')
      .insert({
        session_token: sessionToken,
        azienda_id: accesso.aziende.id,
        expires_at: expiresAt,
      });

    if (sessionError) {
      console.error('Session insert error:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Errore nella creazione della sessione' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Cleanup expired sessions (fire-and-forget but with error logging)
    supabaseAdmin.rpc('cleanup_expired_candidate_sessions').then(({ error }) => {
      if (error) console.error('Session cleanup error:', error);
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        sessionToken,
        expiresAt,
        azienda: {
          id: accesso.aziende.id,
          nome: accesso.aziende.nome,
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Errore interno';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
