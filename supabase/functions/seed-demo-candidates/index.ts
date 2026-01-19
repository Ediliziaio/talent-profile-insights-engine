import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Complete list of 200 questions with scale and polarity
const DOMANDE = [
  { id: 1, scala: 'SV', polarita: '-' },
  { id: 2, scala: 'MO', polarita: '-' },
  { id: 3, scala: 'CF', polarita: '-' },
  { id: 4, scala: 'EC', polarita: '+' },
  { id: 5, scala: 'MO', polarita: '+' },
  { id: 6, scala: 'PA', polarita: '+' },
  { id: 7, scala: 'QR', polarita: '+' },
  { id: 8, scala: 'SC', polarita: '+' },
  { id: 9, scala: 'SP', polarita: '-' },
  { id: 10, scala: 'PA', polarita: '+' },
  { id: 11, scala: 'EC', polarita: '+' },
  { id: 12, scala: 'SV', polarita: '+' },
  { id: 13, scala: 'SV', polarita: '+' },
  { id: 14, scala: 'CF', polarita: '+' },
  { id: 15, scala: 'MO', polarita: '+' },
  { id: 16, scala: 'PA', polarita: '+' },
  { id: 17, scala: 'QR', polarita: '-' },
  { id: 18, scala: 'SC', polarita: '+' },
  { id: 19, scala: 'SC', polarita: '+' },
  { id: 20, scala: 'PA', polarita: '+' },
  { id: 21, scala: 'EC', polarita: '+' },
  { id: 22, scala: 'CF', polarita: '-' },
  { id: 23, scala: 'CF', polarita: '-' },
  { id: 24, scala: 'QR', polarita: '+' },
  { id: 25, scala: 'EF', polarita: '+' },
  { id: 26, scala: 'EC', polarita: '+' },
  { id: 27, scala: 'QR', polarita: '-' },
  { id: 28, scala: 'SC', polarita: '+' },
  { id: 29, scala: 'PA', polarita: '+' },
  { id: 30, scala: 'PA', polarita: '+' },
  { id: 31, scala: 'EC', polarita: '+' },
  { id: 32, scala: 'CF', polarita: '-' },
  { id: 33, scala: 'ST', polarita: '-' },
  { id: 34, scala: 'SC', polarita: '+' },
  { id: 35, scala: 'EF', polarita: '-' },
  { id: 36, scala: 'LE', polarita: '+' },
  { id: 37, scala: 'CF', polarita: '+' },
  { id: 38, scala: 'LE', polarita: '+' },
  { id: 39, scala: 'SP', polarita: '+' },
  { id: 40, scala: 'SP', polarita: '-' },
  { id: 41, scala: 'EC', polarita: '+' },
  { id: 42, scala: 'CF', polarita: '+' },
  { id: 43, scala: 'ST', polarita: '-' },
  { id: 44, scala: 'MO', polarita: '+' },
  { id: 45, scala: 'ST', polarita: '-' },
  { id: 46, scala: 'LE', polarita: '-' },
  { id: 47, scala: 'CF', polarita: '-' },
  { id: 48, scala: 'SP', polarita: '+' },
  { id: 49, scala: 'PA', polarita: '-' },
  { id: 50, scala: 'SP', polarita: '-' },
  { id: 51, scala: 'SV', polarita: '-' },
  { id: 52, scala: 'SV', polarita: '+' },
  { id: 53, scala: 'ST', polarita: '-' },
  { id: 54, scala: 'EC', polarita: '-' },
  { id: 55, scala: 'EF', polarita: '+' },
  { id: 56, scala: 'LE', polarita: '+' },
  { id: 57, scala: 'EC', polarita: '+' },
  { id: 58, scala: 'CF', polarita: '-' },
  { id: 59, scala: 'MO', polarita: '+' },
  { id: 60, scala: 'PA', polarita: '+' },
  { id: 61, scala: 'MO', polarita: '+' },
  { id: 62, scala: 'SV', polarita: '+' },
  { id: 63, scala: 'ST', polarita: '-' },
  { id: 64, scala: 'CF', polarita: '-' },
  { id: 65, scala: 'SV', polarita: '+' },
  { id: 66, scala: 'CF', polarita: '-' },
  { id: 67, scala: 'LE', polarita: '+' },
  { id: 68, scala: 'SC', polarita: '+' },
  { id: 69, scala: 'SP', polarita: '+' },
  { id: 70, scala: 'PA', polarita: '+' },
  { id: 71, scala: 'EC', polarita: '-' },
  { id: 72, scala: 'MO', polarita: '+' },
  { id: 73, scala: 'ST', polarita: '-' },
  { id: 74, scala: 'SC', polarita: '+' },
  { id: 75, scala: 'EF', polarita: '+' },
  { id: 76, scala: 'EC', polarita: '+' },
  { id: 77, scala: 'SC', polarita: '+' },
  { id: 78, scala: 'EF', polarita: '+' },
  { id: 79, scala: 'SP', polarita: '+' },
  { id: 80, scala: 'PA', polarita: '-' },
  { id: 81, scala: 'SC', polarita: '-' },
  { id: 82, scala: 'SV', polarita: '-' },
  { id: 83, scala: 'ST', polarita: '-' },
  { id: 84, scala: 'SC', polarita: '+' },
  { id: 85, scala: 'EF', polarita: '+' },
  { id: 86, scala: 'LE', polarita: '+' },
  { id: 87, scala: 'SV', polarita: '-' },
  { id: 88, scala: 'CF', polarita: '+' },
  { id: 89, scala: 'SP', polarita: '-' },
  { id: 90, scala: 'PA', polarita: '-' },
  { id: 91, scala: 'EC', polarita: '+' },
  { id: 92, scala: 'SV', polarita: '+' },
  { id: 93, scala: 'ST', polarita: '-' },
  { id: 94, scala: 'CF', polarita: '-' },
  { id: 95, scala: 'SV', polarita: '+' },
  { id: 96, scala: 'LE', polarita: '+' },
  { id: 97, scala: 'QR', polarita: '-' },
  { id: 98, scala: 'CF', polarita: '+' },
  { id: 99, scala: 'SP', polarita: '-' },
  { id: 100, scala: 'PA', polarita: '+' },
  { id: 101, scala: 'QR', polarita: '+' },
  { id: 102, scala: 'SV', polarita: '+' },
  { id: 103, scala: 'ST', polarita: '-' },
  { id: 104, scala: 'SC', polarita: '+' },
  { id: 105, scala: 'EC', polarita: '+' },
  { id: 106, scala: 'LE', polarita: '+' },
  { id: 107, scala: 'QR', polarita: '-' },
  { id: 108, scala: 'LE', polarita: '+' },
  { id: 109, scala: 'PA', polarita: '+' },
  { id: 110, scala: 'PA', polarita: '+' },
  { id: 111, scala: 'SC', polarita: '+' },
  { id: 112, scala: 'SV', polarita: '-' },
  { id: 113, scala: 'ST', polarita: '-' },
  { id: 114, scala: 'EC', polarita: '-' },
  { id: 115, scala: 'EF', polarita: '-' },
  { id: 116, scala: 'SP', polarita: '+' },
  { id: 117, scala: 'QR', polarita: '-' },
  { id: 118, scala: 'LE', polarita: '-' },
  { id: 119, scala: 'SP', polarita: '+' },
  { id: 120, scala: 'PA', polarita: '+' },
  { id: 121, scala: 'CF', polarita: '+' },
  { id: 122, scala: 'SV', polarita: '-' },
  { id: 123, scala: 'ST', polarita: '-' },
  { id: 124, scala: 'SC', polarita: '+' },
  { id: 125, scala: 'SV', polarita: '-' },
  { id: 126, scala: 'LE', polarita: '+' },
  { id: 127, scala: 'QR', polarita: '-' },
  { id: 128, scala: 'LE', polarita: '+' },
  { id: 129, scala: 'SP', polarita: '+' },
  { id: 130, scala: 'PA', polarita: '+' },
  { id: 131, scala: 'CF', polarita: '+' },
  { id: 132, scala: 'SV', polarita: '-' },
  { id: 133, scala: 'QN', polarita: '-' },
  { id: 134, scala: 'SC', polarita: '+' },
  { id: 135, scala: 'EC', polarita: '+' },
  { id: 136, scala: 'PA', polarita: '+' },
  { id: 137, scala: 'QR', polarita: '-' },
  { id: 138, scala: 'LE', polarita: '+' },
  { id: 139, scala: 'SP', polarita: '+' },
  { id: 140, scala: 'PA', polarita: '-' },
  { id: 141, scala: 'EC', polarita: '+' },
  { id: 142, scala: 'MO', polarita: '-' },
  { id: 143, scala: 'CF', polarita: '-' },
  { id: 144, scala: 'SC', polarita: '+' },
  { id: 145, scala: 'QN', polarita: '+' },
  { id: 146, scala: 'EC', polarita: '+' },
  { id: 147, scala: 'LE', polarita: '+' },
  { id: 148, scala: 'CF', polarita: '-' },
  { id: 149, scala: 'SP', polarita: '+' },
  { id: 150, scala: 'PA', polarita: '+' },
  { id: 151, scala: 'MO', polarita: '+' },
  { id: 152, scala: 'SV', polarita: '+' },
  { id: 153, scala: 'ST', polarita: '-' },
  { id: 154, scala: 'CF', polarita: '-' },
  { id: 155, scala: 'EC', polarita: '-' },
  { id: 156, scala: 'LE', polarita: '+' },
  { id: 157, scala: 'QR', polarita: '-' },
  { id: 158, scala: 'LE', polarita: '+' },
  { id: 159, scala: 'SP', polarita: '+' },
  { id: 160, scala: 'PA', polarita: '+' },
  { id: 161, scala: 'SC', polarita: '+' },
  { id: 162, scala: 'MO', polarita: '+' },
  { id: 163, scala: 'CF', polarita: '-' },
  { id: 164, scala: 'SC', polarita: '+' },
  { id: 165, scala: 'MO', polarita: '+' },
  { id: 166, scala: 'CF', polarita: '-' },
  { id: 167, scala: 'CF', polarita: '-' },
  { id: 168, scala: 'CF', polarita: '-' },
  { id: 169, scala: 'SP', polarita: '+' },
  { id: 170, scala: 'LE', polarita: '-' },
  { id: 171, scala: 'EC', polarita: '+' },
  { id: 172, scala: 'MO', polarita: '-' },
  { id: 173, scala: 'ST', polarita: '-' },
  { id: 174, scala: 'SC', polarita: '-' },
  { id: 175, scala: 'EF', polarita: '+' },
  { id: 176, scala: 'SP', polarita: '+' },
  { id: 177, scala: 'QR', polarita: '-' },
  { id: 178, scala: 'LE', polarita: '+' },
  { id: 179, scala: 'PA', polarita: '+' },
  { id: 180, scala: 'PA', polarita: '+' },
  { id: 181, scala: 'MO', polarita: '+' },
  { id: 182, scala: 'SC', polarita: '+' },
  { id: 183, scala: 'ST', polarita: '-' },
  { id: 184, scala: 'CF', polarita: '+' },
  { id: 185, scala: 'EF', polarita: '+' },
  { id: 186, scala: 'MO', polarita: '+' },
  { id: 187, scala: 'LE', polarita: '+' },
  { id: 188, scala: 'SV', polarita: '-' },
  { id: 189, scala: 'MO', polarita: '-' },
  { id: 190, scala: 'PA', polarita: '-' },
  { id: 191, scala: 'EC', polarita: '+' },
  { id: 192, scala: 'SV', polarita: '-' },
  { id: 193, scala: 'LE', polarita: '+' },
  { id: 194, scala: 'SC', polarita: '+' },
  { id: 195, scala: 'EF', polarita: '-' },
  { id: 196, scala: 'EC', polarita: '+' },
  { id: 197, scala: 'QR', polarita: '+' },
  { id: 198, scala: 'QR', polarita: '-' },
  { id: 199, scala: 'SP', polarita: '-' },
  { id: 200, scala: 'CF', polarita: '-' },
];

// Main 10 scales
const MAIN_SCALES = ['SV', 'MO', 'CF', 'EF', 'EC', 'QN', 'QR', 'SP', 'PA', 'SC'] as const;
type ScalaCode = typeof MAIN_SCALES[number];
type ProfiloTipo = 'EXECUTOR' | 'STRATEGIST' | 'LEADER' | 'IN_TRANSIZIONE';

// Target scores for each candidate - these define their profile
interface TargetScores {
  SV: number;
  MO: number;
  CF: number;
  EF: number;
  EC: number;
  QN: number;
  QR: number;
  SP: number;
  PA: number;
  SC: number;
}

interface CandidateConfig {
  nome: string;
  cognome: string;
  email: string;
  eta: number;
  sesso: 'M' | 'F';
  ruolo_attuale: string;
  funzione: string;
  telefono: string;
  targetScores: TargetScores;
  expectedProfile: ProfiloTipo;
}

// 4 demo candidates with DISTINCT target scores
const DEMO_CANDIDATES: CandidateConfig[] = [
  {
    nome: 'Marco',
    cognome: 'Rossi',
    email: 'marco.rossi@test.com',
    eta: 27,
    sesso: 'M',
    ruolo_attuale: 'Candidato',
    funzione: 'Ufficio vendite',
    telefono: '3331112222',
    expectedProfile: 'IN_TRANSIZIONE',
    // Low SV and CF trigger stress zone -> IN_TRANSIZIONE
    targetScores: {
      SV: 70,
      MO: 65,
      CF: 72,
      EF: 85,
      EC: 68,
      QN: 75,
      QR: 78,
      SP: 95,
      PA: 70,
      SC: 110
    }
  },
  {
    nome: 'Luca',
    cognome: 'Bianchi',
    email: 'luca.bianchi@test.com',
    eta: 34,
    sesso: 'M',
    ruolo_attuale: 'Candidato',
    funzione: 'Ufficio vendite',
    telefono: '3332223333',
    expectedProfile: 'LEADER',
    // High scores across all scales -> LEADER
    targetScores: {
      SV: 170,
      MO: 175,
      CF: 165,
      EF: 160,
      EC: 172,
      QN: 155,
      QR: 168,
      SP: 162,
      PA: 175,
      SC: 135
    }
  },
  {
    nome: 'Paolo',
    cognome: 'Verdi',
    email: 'paolo.verdi@test.com',
    eta: 41,
    sesso: 'M',
    ruolo_attuale: 'Candidato',
    funzione: 'Amministrazione',
    telefono: '3333334444',
    expectedProfile: 'STRATEGIST',
    // High SV, MO, SC but lower PA, QN -> STRATEGIST
    targetScores: {
      SV: 148,
      MO: 145,
      CF: 112,
      EF: 130,
      EC: 125,
      QN: 88,
      QR: 118,
      SP: 115,
      PA: 90,
      SC: 178
    }
  },
  {
    nome: 'Simone',
    cognome: 'Neri',
    email: 'simone.neri@test.com',
    eta: 30,
    sesso: 'M',
    ruolo_attuale: 'Candidato',
    funzione: 'Produzione',
    telefono: '3334445555',
    expectedProfile: 'EXECUTOR',
    // Balanced good scores, not extreme -> EXECUTOR
    targetScores: {
      SV: 138,
      MO: 135,
      CF: 142,
      EF: 152,
      EC: 148,
      QN: 140,
      QR: 132,
      SP: 138,
      PA: 128,
      SC: 125
    }
  }
];

// Count questions per scale
function countQuestionsPerScale(): Record<ScalaCode, { plus: number; minus: number }> {
  const counts: Record<string, { plus: number; minus: number }> = {};
  
  for (const scala of MAIN_SCALES) {
    counts[scala] = { plus: 0, minus: 0 };
  }
  
  for (const d of DOMANDE) {
    if (MAIN_SCALES.includes(d.scala as ScalaCode)) {
      if (d.polarita === '+') {
        counts[d.scala].plus++;
      } else {
        counts[d.scala].minus++;
      }
    }
  }
  
  return counts as Record<ScalaCode, { plus: number; minus: number }>;
}

// Generate responses to achieve target scores
function generateResponsesToTarget(targetScores: TargetScores): Record<number, 'A' | 'B' | 'C'> {
  const responses: Record<number, 'A' | 'B' | 'C'> = {};
  const scaleCounts = countQuestionsPerScale();
  
  // For each scale, calculate how many "positive" answers we need
  // Base = 100, A on + polarity = +4, C on + polarity = -4
  // A on - polarity = -4, C on - polarity = +4
  // B always = 0
  
  // Group questions by scale
  const questionsByScale: Record<string, typeof DOMANDE> = {};
  for (const scala of MAIN_SCALES) {
    questionsByScale[scala] = DOMANDE.filter(d => d.scala === scala);
  }
  
  for (const scala of MAIN_SCALES) {
    const target = targetScores[scala];
    const delta = target - 100; // How much we need to deviate from base
    const questions = questionsByScale[scala];
    
    if (!questions || questions.length === 0) continue;
    
    // Each extreme answer (A or C) contributes ±4 points
    // We need to distribute answers to reach the target
    const totalQuestions = questions.length;
    
    // Calculate how many "max positive" answers we need
    // If delta > 0, we need more positive answers
    // If delta < 0, we need more negative answers
    
    // Max possible delta = totalQuestions * 4
    // So we need (delta / 4) questions answered at max
    
    const maxPositiveNeeded = Math.round(delta / 4);
    const absNeeded = Math.abs(maxPositiveNeeded);
    
    // Sort questions to ensure deterministic ordering
    const sortedQuestions = [...questions].sort((a, b) => a.id - b.id);
    
    for (let i = 0; i < sortedQuestions.length; i++) {
      const q = sortedQuestions[i];
      
      if (i < absNeeded) {
        // This question gets an extreme answer
        if (delta > 0) {
          // Need positive: + polarity -> A, - polarity -> C
          responses[q.id] = q.polarita === '+' ? 'A' : 'C';
        } else {
          // Need negative: + polarity -> C, - polarity -> A
          responses[q.id] = q.polarita === '+' ? 'C' : 'A';
        }
      } else {
        // Neutral answer
        responses[q.id] = 'B';
      }
    }
  }
  
  // Fill in any non-main-scale questions with B
  for (const d of DOMANDE) {
    if (!(d.id in responses)) {
      responses[d.id] = 'B';
    }
  }
  
  return responses;
}

// Calculate actual scores from responses
function calculateScoresFromResponses(responses: Record<number, 'A' | 'B' | 'C'>): Record<ScalaCode, number> {
  const scores: Record<string, number> = {};
  
  for (const scala of MAIN_SCALES) {
    scores[scala] = 100; // Base score
  }
  
  for (const domanda of DOMANDE) {
    const scala = domanda.scala;
    if (!MAIN_SCALES.includes(scala as ScalaCode)) continue;
    
    const risposta = responses[domanda.id];
    const polarita = domanda.polarita;
    
    let delta = 0;
    if (risposta === 'A') {
      delta = polarita === '+' ? 4 : -4;
    } else if (risposta === 'C') {
      delta = polarita === '+' ? -4 : 4;
    }
    // B = 0
    
    scores[scala] += delta;
  }
  
  // Clamp scores to valid range
  for (const scala of MAIN_SCALES) {
    scores[scala] = Math.max(0, Math.min(200, scores[scala]));
  }
  
  return scores as Record<ScalaCode, number>;
}

// Determine profile type from scores
function determinaProfiloTipo(scores: Record<ScalaCode, number>): ProfiloTipo {
  const { SV, MO, CF, EC, EF, QN, QR, SP, PA, SC } = scores;
  
  // Stress zone check: SV < 100 AND CF < 100
  if (SV < 100 && CF < 100) {
    return 'IN_TRANSIZIONE';
  }
  
  // Leadership check: high across key scales + high leadership %
  const leadershipPct = ((EC + EF + QN + QR + SP + PA) / 1200) * 100;
  const avgMainScores = (SV + MO + CF + EC + EF + QN + QR + SP + PA) / 9;
  
  if (avgMainScores >= 150 && leadershipPct >= 70 && QR >= 150 && PA >= 150) {
    return 'LEADER';
  }
  
  // Strategist check: high SV, MO, SC but lower PA/QN
  if (SV > 140 && MO > 140 && SC > 150 && (PA < 100 || QN < 100)) {
    return 'STRATEGIST';
  }
  
  // Default to EXECUTOR
  return 'EXECUTOR';
}

// Calculate percentages
function calculatePercentages(scores: Record<ScalaCode, number>) {
  const { SV, MO, CF, EC, EF, QN, QR, SP, PA, SC } = scores;
  
  // Leadership % = (EC + EF + QN + QR + SP + PA) / 1200 * 100
  const leadership = Math.round(((EC + EF + QN + QR + SP + PA) / 1200) * 100);
  
  // Maturità % = (SV + MO + CF) / 600 * 100
  const maturita = Math.round(((SV + MO + CF) / 600) * 100);
  
  // Potenziale % = (EC + EF + CF) / 600 * 100
  const potenziale = Math.round(((EC + EF + CF) / 600) * 100);
  
  return { leadership, maturita, potenziale };
}

// Identify strength points (>160) and out points (<80)
function identifyPoints(scores: Record<ScalaCode, number>) {
  const strengthPoints: string[] = [];
  const outPoints: string[] = [];
  
  const labels: Record<ScalaCode, string> = {
    'SV': 'Stile di Vita',
    'MO': 'Motivazione',
    'CF': 'Capacità di Fronteggiare',
    'EF': 'Efficienza',
    'EC': 'Efficacia',
    'QN': 'Quantità Responsabilità',
    'QR': 'Qualità Responsabilità',
    'SP': 'Spazio Vitale',
    'PA': 'Partecipazione',
    'SC': 'Schematicità'
  };
  
  for (const scala of MAIN_SCALES) {
    if (scores[scala] > 160) {
      strengthPoints.push(labels[scala]);
    }
    if (scores[scala] < 80) {
      outPoints.push(labels[scala]);
    }
  }
  
  return { strengthPoints, outPoints };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('ruolo')
      .eq('user_id', user.id)
      .single();
    
    if (profile?.ruolo !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Superadmin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get Teknofinestre company
    const { data: azienda, error: aziendaError } = await supabase
      .from('aziende')
      .select('id')
      .eq('nome', 'Teknofinestre')
      .single();

    if (aziendaError || !azienda) {
      return new Response(JSON.stringify({ error: 'Company Teknofinestre not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const results: Array<{
      candidato: string;
      email: string;
      profilo_tipo: ProfiloTipo;
      leadership_pct: number;
      maturita_pct: number;
      potenziale_pct: number;
      scale_punteggi: Record<ScalaCode, number>;
      strength_points: string[];
      out_points: string[];
      risposte_count: number;
    }> = [];

    console.log(`Starting seed for ${DEMO_CANDIDATES.length} candidates...`);

    for (const candidate of DEMO_CANDIDATES) {
      console.log(`\n=== Processing ${candidate.nome} ${candidate.cognome} ===`);
      
      // 1. Delete existing data for this email
      const { data: existingCandidato } = await supabase
        .from('candidati')
        .select('id')
        .eq('email', candidate.email)
        .maybeSingle();

      if (existingCandidato) {
        console.log(`Deleting existing candidate ${existingCandidato.id}...`);
        
        // Delete in order: profili_candidato -> risultati -> risposte -> candidati
        await supabase.from('profili_candidato').delete().eq('candidato_id', existingCandidato.id);
        await supabase.from('risultati').delete().eq('candidato_id', existingCandidato.id);
        await supabase.from('risposte').delete().eq('candidato_id', existingCandidato.id);
        await supabase.from('candidati').delete().eq('id', existingCandidato.id);
        
        console.log('Deleted existing data.');
      }

      // 2. Create candidate
      const { data: newCandidato, error: candidatoError } = await supabase
        .from('candidati')
        .insert({
          nome: candidate.nome,
          cognome: candidate.cognome,
          email: candidate.email,
          eta: candidate.eta,
          sesso: candidate.sesso,
          ruolo_attuale: candidate.ruolo_attuale,
          funzione: candidate.funzione,
          telefono: candidate.telefono,
          azienda_id: azienda.id,
          test_completato: true,
          data_test: new Date().toISOString()
        })
        .select('id')
        .single();

      if (candidatoError || !newCandidato) {
        console.error(`Failed to create candidate ${candidate.email}:`, candidatoError);
        throw new Error(`Failed to create candidate: ${candidatoError?.message}`);
      }

      console.log(`Created candidate with ID: ${newCandidato.id}`);

      // 3. Generate responses based on target scores
      const responses = generateResponsesToTarget(candidate.targetScores);
      
      // 4. Insert responses
      const risposteRows = Object.entries(responses).map(([domandaId, valore]) => ({
        candidato_id: newCandidato.id,
        domanda_id: parseInt(domandaId),
        valore: valore
      }));

      const { error: risposteError } = await supabase
        .from('risposte')
        .insert(risposteRows);

      if (risposteError) {
        console.error(`Failed to insert responses:`, risposteError);
        throw new Error(`Failed to insert responses: ${risposteError.message}`);
      }

      // Verify response count
      const { count: risposteCount } = await supabase
        .from('risposte')
        .select('*', { count: 'exact', head: true })
        .eq('candidato_id', newCandidato.id);

      console.log(`Inserted ${risposteCount} responses`);

      if (risposteCount !== 200) {
        throw new Error(`Expected 200 responses, got ${risposteCount}`);
      }

      // 5. Calculate actual scores from responses
      const scores = calculateScoresFromResponses(responses);
      console.log('Calculated scores:', scores);

      // 6. Insert risultati
      const risultatiRows = MAIN_SCALES.map(scala => ({
        candidato_id: newCandidato.id,
        scala: scala,
        punteggio_grezzo: scores[scala],
        punteggio_normalizzato: scores[scala]
      }));

      const { error: risultatiError } = await supabase
        .from('risultati')
        .insert(risultatiRows);

      if (risultatiError) {
        console.error('Failed to insert risultati:', risultatiError);
        throw new Error(`Failed to insert risultati: ${risultatiError.message}`);
      }

      console.log('Inserted risultati');

      // 7. Calculate profile data
      const profiloTipo = determinaProfiloTipo(scores);
      const percentages = calculatePercentages(scores);
      const { strengthPoints, outPoints } = identifyPoints(scores);
      const stressZone = scores.SV < 100 && scores.CF < 100;

      console.log(`Profile type: ${profiloTipo}`);
      console.log(`Percentages: L=${percentages.leadership}%, M=${percentages.maturita}%, P=${percentages.potenziale}%`);
      console.log(`Strength points: ${strengthPoints.join(', ') || 'none'}`);
      console.log(`Out points: ${outPoints.join(', ') || 'none'}`);
      console.log(`Stress zone: ${stressZone}`);

      // 8. Insert profili_candidato
      const { error: profiloError } = await supabase
        .from('profili_candidato')
        .insert({
          candidato_id: newCandidato.id,
          profilo_tipo: profiloTipo,
          leadership_pct: percentages.leadership,
          maturita_pct: percentages.maturita,
          potenziale_pct: percentages.potenziale,
          schematicita: scores.SC,
          stress_zone: stressZone,
          strength_points: strengthPoints,
          out_points: outPoints,
          scale_punteggi: scores
        });

      if (profiloError) {
        console.error('Failed to insert profilo:', profiloError);
        throw new Error(`Failed to insert profilo: ${profiloError.message}`);
      }

      console.log('Inserted profilo_candidato');

      // Verify profile was created with data
      const { data: verifyProfile } = await supabase
        .from('profili_candidato')
        .select('*')
        .eq('candidato_id', newCandidato.id)
        .single();

      if (!verifyProfile || Object.keys(verifyProfile.scale_punteggi || {}).length === 0) {
        throw new Error(`Profile verification failed - scale_punteggi is empty!`);
      }

      console.log(`✓ Verified profile has ${Object.keys(verifyProfile.scale_punteggi).length} scale scores`);

      results.push({
        candidato: `${candidate.nome} ${candidate.cognome}`,
        email: candidate.email,
        profilo_tipo: profiloTipo,
        leadership_pct: percentages.leadership,
        maturita_pct: percentages.maturita,
        potenziale_pct: percentages.potenziale,
        scale_punteggi: scores,
        strength_points: strengthPoints,
        out_points: outPoints,
        risposte_count: risposteCount || 0
      });
    }

    console.log('\n=== SEED COMPLETED SUCCESSFULLY ===');
    console.log(JSON.stringify(results, null, 2));

    return new Response(JSON.stringify({
      success: true,
      message: `Created ${results.length} demo candidates with distinct profiles`,
      candidates: results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('Seed error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
