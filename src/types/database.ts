export type UserRole = 'superadmin' | 'azienda' | 'candidato';

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  nome: string | null;
  cognome: string | null;
  ruolo: UserRole;
  azienda_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Azienda {
  id: string;
  nome: string;
  settore: string | null;
  email_contatto: string | null;
  telefono: string | null;
  indirizzo: string | null;
  logo_url: string | null;
  attiva: boolean;
  created_at: string;
  updated_at: string;
}

export interface Candidato {
  id: string;
  user_id: string | null;
  azienda_id: string;
  cognome: string;
  nome: string;
  eta: number | null;
  email: string | null;
  telefono: string | null;
  ruolo_attuale: string | null;
  funzione: string | null;
  data_test: string | null;
  test_completato: boolean;
  test_link_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Domanda {
  id: number;
  testo: string;
  scala_primaria: ScalaCode;
  scala_secondaria: ScalaCode | null;
  polarita: '+' | '-';
  blocco_tematico: number | null;
  ordine: number | null;
}

export interface Risposta {
  id: string;
  candidato_id: string;
  domanda_id: number;
  valore: 'A' | 'B' | 'C';
  created_at: string;
}

export interface Risultato {
  id: string;
  candidato_id: string;
  scala: string;
  punteggio_grezzo: number | null;
  punteggio_normalizzato: number | null;
  calculated_at: string;
}

export interface ProfiloCandidato {
  id: string;
  candidato_id: string;
  leadership_pct: number | null;
  maturita_pct: number | null;
  potenziale_pct: number | null;
  schematicita: number | null;
  stress_zone: boolean;
  profilo_tipo: ProfiloTipo | null;
  out_points: string[];
  strength_points: string[];
  scale_punteggi: Record<string, number>;
  created_at: string;
  updated_at: string;
}

export type ScalaCode = 'SV' | 'MO' | 'CF' | 'EF' | 'EC' | 'QN' | 'QR' | 'SP' | 'PA' | 'SC' | 'ST' | 'LE';

export type ProfiloTipo = 'EXECUTOR' | 'STRATEGIST' | 'LEADER' | 'IN_TRANSIZIONE';

export const SCALE_LABELS: Record<ScalaCode, string> = {
  SV: 'Stile di Vita',
  MO: 'Motivazione',
  CF: 'Capacità di Fronteggiare',
  EF: 'Efficienza',
  EC: 'Efficacia',
  QN: 'Quantità Responsabilità',
  QR: 'Qualità Responsabilità',
  SP: 'Spazio Vitale',
  PA: 'Partecipazione',
  SC: 'Schematicità',
  ST: 'Stress',
  LE: 'Leadership'
};

export const RUOLI_AZIENDALI = [
  'Top Management',
  'Intermedio',
  'Operativo',
  'Candidato'
];

export const FUNZIONI = [
  'Direzione',
  'HR',
  'Marketing',
  'Vendite',
  'Amministrazione',
  'Produzione',
  'IT',
  'Logistica',
  'Customer Care',
  'R&D',
  'Altro'
];
