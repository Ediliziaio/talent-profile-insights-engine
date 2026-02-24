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

// ---- Server-side validation helpers ----
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-().]{7,20}$/;

interface ValidationError {
  field: string;
  message: string;
}

function validateRegistrationInput(body: Record<string, unknown>): { valid: true; data: ValidatedData } | { valid: false; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  const azienda_id = typeof body.azienda_id === 'string' ? body.azienda_id.trim() : '';
  const cognome = typeof body.cognome === 'string' ? body.cognome.trim().substring(0, 100) : '';
  const nome = typeof body.nome === 'string' ? body.nome.trim().substring(0, 100) : '';
  const etaRaw = body.eta;
  const sesso = typeof body.sesso === 'string' ? body.sesso.trim().toUpperCase() : '';
  const ruolo_attuale = typeof body.ruolo_attuale === 'string' ? body.ruolo_attuale.trim().substring(0, 100) : '';
  const funzione = typeof body.funzione === 'string' ? body.funzione.trim().substring(0, 100) : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase().substring(0, 255) : '';
  const telefono = typeof body.telefono === 'string' ? body.telefono.trim().substring(0, 30) : '';
  const sessionToken = typeof body.sessionToken === 'string' ? body.sessionToken.trim() : '';

  if (!azienda_id) errors.push({ field: 'azienda_id', message: 'Azienda obbligatoria' });
  if (!cognome) errors.push({ field: 'cognome', message: 'Cognome obbligatorio' });
  if (!nome) errors.push({ field: 'nome', message: 'Nome obbligatorio' });
  
  const eta = typeof etaRaw === 'string' ? parseInt(etaRaw, 10) : typeof etaRaw === 'number' ? etaRaw : NaN;
  if (isNaN(eta) || eta < 16 || eta > 99) {
    errors.push({ field: 'eta', message: 'Età deve essere tra 16 e 99' });
  }

  if (!['M', 'F'].includes(sesso)) {
    errors.push({ field: 'sesso', message: 'Sesso deve essere M o F' });
  }

  if (!ruolo_attuale) errors.push({ field: 'ruolo_attuale', message: 'Ruolo obbligatorio' });
  if (!funzione) errors.push({ field: 'funzione', message: 'Funzione obbligatoria' });

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'Email non valida' });
  }

  if (!telefono || !PHONE_REGEX.test(telefono.replace(/\s/g, ''))) {
    errors.push({ field: 'telefono', message: 'Telefono non valido' });
  }

  if (!sessionToken) {
    errors.push({ field: 'sessionToken', message: 'Token di sessione mancante' });
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: { azienda_id, cognome, nome, eta, sesso, ruolo_attuale, funzione, email, telefono, sessionToken },
  };
}

interface ValidatedData {
  azienda_id: string;
  cognome: string;
  nome: string;
  eta: number;
  sesso: string;
  ruolo_attuale: string;
  funzione: string;
  email: string;
  telefono: string;
  sessionToken: string;
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

    // Server-side validation
    const validation = validateRegistrationInput(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: 'Dati non validi', details: validation.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { azienda_id, cognome, nome, eta, sesso, ruolo_attuale, funzione, email, telefono, sessionToken } = validation.data;

    // ---- Validate session token ----
    const { data: session, error: sessionError } = await supabaseAdmin
      .from('candidate_sessions')
      .select('id, azienda_id, expires_at, used')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !session) {
      console.error('Session validation failed:', sessionError);
      return new Response(
        JSON.stringify({ error: 'Sessione non valida. Effettua nuovamente l\'accesso.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (session.used) {
      return new Response(
        JSON.stringify({ error: 'Sessione già utilizzata. Effettua nuovamente l\'accesso.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (new Date(session.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'Sessione scaduta. Effettua nuovamente l\'accesso.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (session.azienda_id !== azienda_id) {
      return new Response(
        JSON.stringify({ error: 'Sessione non valida per questa azienda.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mark session as used (one-time use)
    await supabaseAdmin
      .from('candidate_sessions')
      .update({ used: true })
      .eq('id', session.id);

    // ---- Verify azienda exists ----
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
      // Create or update profile (may already exist from trigger)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: userId,
          email: internalEmail,
          nome,
          cognome,
          ruolo: 'candidato',
          azienda_id,
        }, { onConflict: 'user_id' });

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
          eta,
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

      console.log(JSON.stringify({
        event: 'candidate_registered',
        azienda_id,
        candidato_id: candidato.id,
        timestamp: new Date().toISOString(),
      }));

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
