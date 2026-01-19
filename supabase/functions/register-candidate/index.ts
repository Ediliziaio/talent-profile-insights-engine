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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { 
      azienda_id,
      cognome,
      nome,
      eta,
      sesso,
      ruolo_attuale,
      funzione,
      email,
      telefono
    } = body;

    // Validate required fields
    if (!azienda_id || !cognome || !nome || !eta || !sesso || !ruolo_attuale || !funzione || !email || !telefono) {
      return new Response(
        JSON.stringify({ error: 'Tutti i campi sono obbligatori' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify azienda exists
    const { data: azienda, error: aziendaError } = await supabaseAdmin
      .from('aziende')
      .select('id, nome')
      .eq('id', azienda_id)
      .eq('attiva', true)
      .single();

    if (aziendaError || !azienda) {
      return new Response(
        JSON.stringify({ error: 'Azienda non trovata' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate username and password for the candidate
    const slug = azienda.nome.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
    const suffix = Math.random().toString(36).substring(2, 8);
    const username = `${slug}-${suffix}`;
    const internalEmail = `${username}@candidati.talentprofile.local`;
    const password = generatePassword();

    // Create auth user
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        nome,
        cognome,
        ruolo: 'candidato',
        azienda_id,
      },
    });

    if (authError || !authUser.user) {
      console.error('Auth error:', authError);
      return new Response(
        JSON.stringify({ error: 'Errore nella creazione dell\'account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authUser.user.id;

    try {
      // Create profile
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          email: internalEmail,
          nome,
          cognome,
          ruolo: 'candidato',
          azienda_id,
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error('Errore nella creazione del profilo');
      }

      // Create candidato record
      const { data: candidato, error: candidatoError } = await supabaseAdmin
        .from('candidati')
        .insert({
          user_id: userId,
          azienda_id,
          cognome,
          nome,
          eta: parseInt(eta),
          sesso,
          email,
          telefono,
          ruolo_attuale,
          funzione,
          username,
          test_completato: false,
        })
        .select()
        .single();

      if (candidatoError) {
        console.error('Candidato error:', candidatoError);
        throw new Error('Errore nella creazione del candidato');
      }

      // Sign in the user immediately
      const { data: sessionData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
        email: internalEmail,
        password,
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        // Not fatal - user can still log in manually
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          candidato,
          session: sessionData?.session || null,
          credentials: {
            username,
            password, // Only shown once during registration
          }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } catch (dbError) {
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw dbError;
    }

  } catch (error: unknown) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Errore interno';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});