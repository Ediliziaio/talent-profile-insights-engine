import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Complete list of 200 questions with scale and polarity (from questionario.ts)
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

// Scale codes - main 10 scales
const MAIN_SCALES = ['SV', 'MO', 'CF', 'EF', 'EC', 'QN', 'QR', 'SP', 'PA', 'SC'] as const;
type ScalaCode = typeof MAIN_SCALES[number];
type ProfiloTipo = 'EXECUTOR' | 'STRATEGIST' | 'LEADER' | 'IN_TRANSIZIONE';

const SCALE_LABELS: Record<ScalaCode, string> = {
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

// Candidate profiles with FIXED deterministic responses for each question
// Each candidate has a specific response pattern that produces predictable scores
interface CandidateProfile {
  nome: string;
  cognome: string;
  email: string;
  eta: number;
  sesso: 'M' | 'F';
  ruolo: string;
  funzione: string;
  telefono: string;
  expectedProfile: ProfiloTipo;
  // Fixed responses: map of domanda_id -> 'A' | 'B' | 'C'
  responses: Record<number, 'A' | 'B' | 'C'>;
}

// Generate fixed responses for Marco Rossi - IN_TRANSIZIONE profile
// Low scores on SV, MO, CF to trigger stress zone
function generateMarcoRossiResponses(): Record<number, 'A' | 'B' | 'C'> {
  const responses: Record<number, 'A' | 'B' | 'C'> = {};
  
  for (const domanda of DOMANDE) {
    const id = domanda.id;
    const scala = domanda.scala;
    const polarita = domanda.polarita;
    
    // Skip non-main scales with neutral responses
    if (!MAIN_SCALES.includes(scala as ScalaCode)) {
      responses[id] = 'B';
      continue;
    }
    
    // Marco: very poor on SV, MO, CF (stress zone), poor on most others
    if (scala === 'SV') {
      // Target: ~68 - need mostly negative responses
      // SV has 18 questions: need score = 68, base = 100, delta = -32
      responses[id] = polarita === '+' ? 'C' : 'A';
    } else if (scala === 'MO') {
      // Target: ~55 - very negative
      responses[id] = polarita === '+' ? 'C' : 'A';
    } else if (scala === 'CF') {
      // Target: ~62 - very negative
      responses[id] = polarita === '+' ? 'C' : 'A';
    } else if (scala === 'EC') {
      // Target: ~58 - very negative
      responses[id] = polarita === '+' ? 'C' : 'A';
    } else if (scala === 'EF') {
      // Target: ~82 - slightly negative
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'C') : (id % 3 === 0 ? 'B' : 'A');
    } else if (scala === 'QN') {
      // Target: ~72 - negative
      responses[id] = polarita === '+' ? 'C' : 'A';
    } else if (scala === 'QR') {
      // Target: ~75 - negative
      responses[id] = polarita === '+' ? 'C' : (id % 2 === 0 ? 'A' : 'B');
    } else if (scala === 'SP') {
      // Target: ~95 - neutral
      responses[id] = 'B';
    } else if (scala === 'PA') {
      // Target: ~65 - negative
      responses[id] = polarita === '+' ? 'C' : 'A';
    } else if (scala === 'SC') {
      // Target: ~108 - slightly positive
      responses[id] = polarita === '+' ? (id % 2 === 0 ? 'A' : 'B') : 'C';
    }
  }
  
  return responses;
}

// Generate fixed responses for Luca Bianchi - LEADER profile
// High scores across all scales
function generateLucaBianchiResponses(): Record<number, 'A' | 'B' | 'C'> {
  const responses: Record<number, 'A' | 'B' | 'C'> = {};
  
  for (const domanda of DOMANDE) {
    const id = domanda.id;
    const scala = domanda.scala;
    const polarita = domanda.polarita;
    
    if (!MAIN_SCALES.includes(scala as ScalaCode)) {
      responses[id] = 'B';
      continue;
    }
    
    // Luca: excellent on all scales (LEADER profile)
    if (scala === 'SV') {
      // Target: ~172
      responses[id] = polarita === '+' ? 'A' : 'C';
    } else if (scala === 'MO') {
      // Target: ~178
      responses[id] = polarita === '+' ? 'A' : 'C';
    } else if (scala === 'CF') {
      // Target: ~168
      responses[id] = polarita === '+' ? 'A' : 'C';
    } else if (scala === 'EC') {
      // Target: ~175
      responses[id] = polarita === '+' ? 'A' : 'C';
    } else if (scala === 'EF') {
      // Target: ~162
      responses[id] = polarita === '+' ? 'A' : 'C';
    } else if (scala === 'QN') {
      // Target: ~155
      responses[id] = polarita === '+' ? 'A' : 'C';
    } else if (scala === 'QR') {
      // Target: ~170
      responses[id] = polarita === '+' ? 'A' : 'C';
    } else if (scala === 'SP') {
      // Target: ~165
      responses[id] = polarita === '+' ? 'A' : 'C';
    } else if (scala === 'PA') {
      // Target: ~175
      responses[id] = polarita === '+' ? 'A' : 'C';
    } else if (scala === 'SC') {
      // Target: ~138
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    }
  }
  
  return responses;
}

// Generate fixed responses for Paolo Verdi - STRATEGIST profile
// High on SV, MO, SC; lower on PA, QN
function generatePaoloVerdiResponses(): Record<number, 'A' | 'B' | 'C'> {
  const responses: Record<number, 'A' | 'B' | 'C'> = {};
  
  for (const domanda of DOMANDE) {
    const id = domanda.id;
    const scala = domanda.scala;
    const polarita = domanda.polarita;
    
    if (!MAIN_SCALES.includes(scala as ScalaCode)) {
      responses[id] = 'B';
      continue;
    }
    
    // Paolo: analytical strategist
    if (scala === 'SV') {
      // Target: ~145
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'MO') {
      // Target: ~142
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'CF') {
      // Target: ~108
      responses[id] = 'B';
    } else if (scala === 'EC') {
      // Target: ~128
      responses[id] = polarita === '+' ? (id % 2 === 0 ? 'A' : 'B') : (id % 2 === 0 ? 'C' : 'B');
    } else if (scala === 'EF') {
      // Target: ~135
      responses[id] = polarita === '+' ? (id % 2 === 0 ? 'A' : 'B') : 'C';
    } else if (scala === 'QN') {
      // Target: ~88 - lower
      responses[id] = polarita === '+' ? (id % 2 === 0 ? 'C' : 'B') : (id % 2 === 0 ? 'B' : 'A');
    } else if (scala === 'QR') {
      // Target: ~118
      responses[id] = polarita === '+' ? (id % 2 === 0 ? 'A' : 'B') : (id % 2 === 0 ? 'C' : 'B');
    } else if (scala === 'SP') {
      // Target: ~112
      responses[id] = 'B';
    } else if (scala === 'PA') {
      // Target: ~92 - lower (introverted)
      responses[id] = polarita === '+' ? (id % 2 === 0 ? 'B' : 'C') : (id % 2 === 0 ? 'B' : 'A');
    } else if (scala === 'SC') {
      // Target: ~178 - very high (analytical)
      responses[id] = polarita === '+' ? 'A' : 'C';
    }
  }
  
  return responses;
}

// Generate fixed responses for Simone Neri - EXECUTOR profile
// Balanced good scores across all scales
function generateSimoneNeriResponses(): Record<number, 'A' | 'B' | 'C'> {
  const responses: Record<number, 'A' | 'B' | 'C'> = {};
  
  for (const domanda of DOMANDE) {
    const id = domanda.id;
    const scala = domanda.scala;
    const polarita = domanda.polarita;
    
    if (!MAIN_SCALES.includes(scala as ScalaCode)) {
      responses[id] = 'B';
      continue;
    }
    
    // Simone: balanced executor
    if (scala === 'SV') {
      // Target: ~142
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'MO') {
      // Target: ~138
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'CF') {
      // Target: ~145
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'EC') {
      // Target: ~148
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'EF') {
      // Target: ~155
      responses[id] = polarita === '+' ? (id % 4 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'QN') {
      // Target: ~142
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'QR') {
      // Target: ~135
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'SP') {
      // Target: ~140
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'PA') {
      // Target: ~132
      responses[id] = polarita === '+' ? (id % 3 === 0 ? 'B' : 'A') : 'C';
    } else if (scala === 'SC') {
      // Target: ~128
      responses[id] = polarita === '+' ? (id % 2 === 0 ? 'A' : 'B') : (id % 2 === 0 ? 'C' : 'B');
    }
  }
  
  return responses;
}

const CANDIDATE_PROFILES: CandidateProfile[] = [
  {
    nome: 'Marco',
    cognome: 'Rossi',
    email: 'marco.rossi@demo.test',
    eta: 28,
    sesso: 'M',
    ruolo: 'Operativo',
    funzione: 'Ufficio vendite',
    telefono: '+39 333 1111111',
    expectedProfile: 'IN_TRANSIZIONE',
    responses: generateMarcoRossiResponses()
  },
  {
    nome: 'Luca',
    cognome: 'Bianchi',
    email: 'luca.bianchi@demo.test',
    eta: 42,
    sesso: 'M',
    ruolo: 'Intermedio',
    funzione: 'Direzione generale',
    telefono: '+39 333 2222222',
    expectedProfile: 'LEADER',
    responses: generateLucaBianchiResponses()
  },
  {
    nome: 'Paolo',
    cognome: 'Verdi',
    email: 'paolo.verdi@demo.test',
    eta: 35,
    sesso: 'M',
    ruolo: 'Intermedio',
    funzione: 'Amministrazione',
    telefono: '+39 333 3333333',
    expectedProfile: 'STRATEGIST',
    responses: generatePaoloVerdiResponses()
  },
  {
    nome: 'Simone',
    cognome: 'Neri',
    email: 'simone.neri@demo.test',
    eta: 31,
    sesso: 'M',
    ruolo: 'Operativo',
    funzione: 'Produzione',
    telefono: '+39 333 4444444',
    expectedProfile: 'EXECUTOR',
    responses: generateSimoneNeriResponses()
  }
];

// Calculate actual scores from responses
function calculateScores(responses: Record<number, 'A' | 'B' | 'C'>): Record<ScalaCode, number> {
  const scores: Record<string, number> = {};
  
  for (const scala of MAIN_SCALES) {
    scores[scala] = 100; // Base score
  }
  
  for (const domanda of DOMANDE) {
    const scala = domanda.scala;
    if (!MAIN_SCALES.includes(scala as ScalaCode)) continue;
    
    const valore = responses[domanda.id];
    if (!valore) continue;
    
    if (domanda.polarita === '+') {
      if (valore === 'A') scores[scala] += 10;
      else if (valore === 'B') scores[scala] += 5;
    } else {
      if (valore === 'A') scores[scala] -= 10;
      else if (valore === 'B') scores[scala] -= 5;
    }
  }
  
  // Normalize to 0-200 range
  for (const scala of MAIN_SCALES) {
    scores[scala] = Math.max(0, Math.min(200, scores[scala]));
  }
  
  return scores as Record<ScalaCode, number>;
}

// Determine profile type based on scores
function determinaProfiloTipo(scores: Record<ScalaCode, number>): ProfiloTipo {
  const leadership = (scores.QR + scores.SP + scores.PA) / 600 * 100;
  const stressZone = scores.SV < 100 && scores.CF < 100;
  
  // IN_TRANSIZIONE: stress zone active
  if (stressZone) {
    return 'IN_TRANSIZIONE';
  }
  
  // LEADER: High across all areas
  if (
    leadership > 35 &&
    Object.values(scores).every(v => v >= 120) &&
    scores.QR >= 140 &&
    scores.PA >= 140
  ) {
    return 'LEADER';
  }
  
  // STRATEGIST: High Planning, analytical (high SC)
  if (
    scores.SV > 140 &&
    scores.MO > 140 &&
    scores.SC > 150
  ) {
    return 'STRATEGIST';
  }
  
  // EXECUTOR: Default
  return 'EXECUTOR';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify superadmin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Check if superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (profile?.role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Superadmin only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get Teknofinestre company
    const { data: azienda, error: aziendaError } = await supabase
      .from('aziende')
      .select('id')
      .ilike('nome', '%teknofinestre%')
      .single();
    
    if (aziendaError || !azienda) {
      return new Response(JSON.stringify({ error: 'Company Teknofinestre not found. Create it first.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const createdCandidates: string[] = [];
    
    for (const candidateProfile of CANDIDATE_PROFILES) {
      console.log(`Processing candidate: ${candidateProfile.nome} ${candidateProfile.cognome}`);
      
      // Delete existing candidate if exists
      const { data: existingCandidate } = await supabase
        .from('candidati')
        .select('id')
        .eq('email', candidateProfile.email)
        .single();
      
      if (existingCandidate) {
        // Delete in order: profile -> risposte -> risultati -> candidate
        await supabase
          .from('profili_candidato')
          .delete()
          .eq('candidato_id', existingCandidate.id);
        
        await supabase
          .from('risposte')
          .delete()
          .eq('candidato_id', existingCandidate.id);
        
        await supabase
          .from('risultati')
          .delete()
          .eq('candidato_id', existingCandidate.id);
        
        await supabase
          .from('candidati')
          .delete()
          .eq('id', existingCandidate.id);
        
        console.log(`Deleted existing candidate: ${candidateProfile.email}`);
      }
      
      // Create candidate
      const testDate = new Date();
      testDate.setDate(testDate.getDate() - (CANDIDATE_PROFILES.indexOf(candidateProfile) * 7 + 1));
      
      const { data: newCandidate, error: candidateError } = await supabase
        .from('candidati')
        .insert({
          azienda_id: azienda.id,
          nome: candidateProfile.nome,
          cognome: candidateProfile.cognome,
          email: candidateProfile.email,
          eta: candidateProfile.eta,
          sesso: candidateProfile.sesso,
          ruolo: candidateProfile.ruolo,
          funzione: candidateProfile.funzione,
          telefono: candidateProfile.telefono,
          test_completato: true,
          data_test: testDate.toISOString()
        })
        .select('id')
        .single();
      
      if (candidateError || !newCandidate) {
        console.error(`Error creating candidate ${candidateProfile.email}:`, candidateError);
        continue;
      }
      
      console.log(`Created candidate: ${candidateProfile.nome} ${candidateProfile.cognome} (${newCandidate.id})`);
      
      // Insert responses from fixed map
      const responseRecords = DOMANDE.map(d => ({
        candidato_id: newCandidate.id,
        domanda_id: d.id,
        valore: candidateProfile.responses[d.id] || 'B'
      }));
      
      const { error: responsesError } = await supabase
        .from('risposte')
        .insert(responseRecords);
      
      if (responsesError) {
        console.error(`Error inserting responses for ${candidateProfile.email}:`, responsesError);
        continue;
      }
      
      console.log(`Inserted ${responseRecords.length} responses for ${candidateProfile.nome}`);
      
      // Calculate actual scores from generated responses
      const actualScores = calculateScores(candidateProfile.responses);
      console.log(`Calculated scores for ${candidateProfile.nome}:`, JSON.stringify(actualScores));
      
      // Calculate profile indicators
      const leadership_pct = ((actualScores.QR + actualScores.SP + actualScores.PA) / 600) * 100;
      const maturita_pct = ((actualScores.SV + actualScores.MO + actualScores.CF) / 600) * 100;
      const potenziale_pct = ((actualScores.QN + actualScores.EC + actualScores.EF) / 600) * 100;
      
      const stress_zone = actualScores.SV < 100 && actualScores.CF < 100;
      
      // Determine profile type
      const profilo_tipo = determinaProfiloTipo(actualScores);
      
      // Calculate out_points and strength_points
      const out_points: string[] = [];
      const strength_points: string[] = [];
      
      for (const scala of MAIN_SCALES) {
        if (scala === 'SC') continue;
        
        if (actualScores[scala] < 80) {
          out_points.push(SCALE_LABELS[scala]);
        }
        if (actualScores[scala] > 160) {
          strength_points.push(SCALE_LABELS[scala]);
        }
      }
      
      console.log(`Profile for ${candidateProfile.nome}: type=${profilo_tipo}, leadership=${leadership_pct.toFixed(1)}%, maturita=${maturita_pct.toFixed(1)}%, potenziale=${potenziale_pct.toFixed(1)}%`);
      console.log(`  Stress zone: ${stress_zone}`);
      console.log(`  Out points: ${out_points.join(', ') || 'none'}`);
      console.log(`  Strength points: ${strength_points.join(', ') || 'none'}`);
      
      // Insert risultati (individual scale scores)
      const risultatiRecords = MAIN_SCALES.map(scala => ({
        candidato_id: newCandidate.id,
        scala,
        punteggio_grezzo: actualScores[scala],
        punteggio_normalizzato: actualScores[scala]
      }));
      
      const { error: risultatiError } = await supabase
        .from('risultati')
        .insert(risultatiRecords);
      
      if (risultatiError) {
        console.error(`Error inserting risultati for ${candidateProfile.email}:`, risultatiError);
      }
      
      // Insert profile
      const { error: profileError } = await supabase
        .from('profili_candidato')
        .insert({
          candidato_id: newCandidate.id,
          scale_punteggi: actualScores,
          leadership_pct: Math.round(leadership_pct * 10) / 10,
          maturita_pct: Math.round(maturita_pct * 10) / 10,
          potenziale_pct: Math.round(potenziale_pct * 10) / 10,
          schematicita: actualScores.SC,
          stress_zone,
          profilo_tipo,
          out_points,
          strength_points
        });
      
      if (profileError) {
        console.error(`Error inserting profile for ${candidateProfile.email}:`, profileError);
        continue;
      }
      
      createdCandidates.push(`${candidateProfile.nome} ${candidateProfile.cognome} (${profilo_tipo})`);
      console.log(`Successfully created complete profile for ${candidateProfile.nome} ${candidateProfile.cognome}`);
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: `Created ${createdCandidates.length} demo candidates`,
      candidates: createdCandidates
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error: unknown) {
    console.error('Error in seed-demo-candidates:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
