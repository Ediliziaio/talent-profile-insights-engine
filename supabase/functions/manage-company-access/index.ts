import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
  let password = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

function generateUsername(aziendaNome: string): string {
  const slug = aziendaNome
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
  const suffix = Math.random().toString(36).substring(2, 6);
  return `${slug}-${suffix}`;
}

// Simple hash function for password verification
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify caller is authenticated
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Token non valido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get caller's profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('ruolo, azienda_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'Profilo non trovato' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only azienda or superadmin can manage access
    if (!['azienda', 'superadmin'].includes(profile.ruolo)) {
      return new Response(
        JSON.stringify({ error: 'Non autorizzato' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { action, azienda_id: requestedAziendaId } = body;

    // Determine which azienda to manage
    let targetAziendaId: string;
    if (profile.ruolo === 'superadmin' && requestedAziendaId) {
      targetAziendaId = requestedAziendaId;
    } else if (profile.azienda_id) {
      targetAziendaId = profile.azienda_id;
    } else {
      return new Response(
        JSON.stringify({ error: 'Azienda non specificata' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get azienda info
    const { data: azienda, error: aziendaError } = await supabaseAdmin
      .from('aziende')
      .select('id, nome')
      .eq('id', targetAziendaId)
      .single();

    if (aziendaError || !azienda) {
      return new Response(
        JSON.stringify({ error: 'Azienda non trovata' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'get') {
      // Get existing credentials
      const { data: existing } = await supabaseAdmin
        .from('accessi_azienda')
        .select('*')
        .eq('azienda_id', targetAziendaId)
        .eq('attivo', true)
        .single();

      return new Response(
        JSON.stringify({ accesso: existing || null }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'generate' || action === 'regenerate') {
      // Generate new credentials
      const username = generateUsername(azienda.nome);
      const password = generatePassword();
      const passwordHash = await hashPassword(password);

      // Delete existing if regenerating
      if (action === 'regenerate') {
        await supabaseAdmin
          .from('accessi_azienda')
          .delete()
          .eq('azienda_id', targetAziendaId);
      }

      // Insert new credentials (never store plain-text password)
      const { data: newAccesso, error: insertError } = await supabaseAdmin
        .from('accessi_azienda')
        .insert({
          azienda_id: targetAziendaId,
          username,
          password_hash: passwordHash,
          attivo: true,
        })
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        return new Response(
          JSON.stringify({ error: 'Errore nella creazione delle credenziali' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Return password only in the response — it is NEVER persisted in DB
      return new Response(
        JSON.stringify({ 
          accesso: { ...newAccesso, password_plain: password },
          plainPassword: password,
          message: action === 'regenerate' ? 'Credenziali rigenerate' : 'Credenziali generate'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Azione non valida' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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