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
  sesso: string | null;
  email: string | null;
  telefono: string | null;
  ruolo_attuale: string | null;
  funzione: string | null;
  data_test: string | null;
  test_completato: boolean;
  test_link_token: string | null;
  username: string | null;
  created_at: string;
  updated_at: string;
}

export interface AccessoAzienda {
  id: string;
  azienda_id: string;
  username: string;
  password_plain?: string | null;
  attivo: boolean;
  created_at: string;
  updated_at: string;
}

// Legacy V4 Domanda interface (per retrocompatibilità)
export interface Domanda {
  id: number;
  testo: string;
  scala_primaria: ScalaCode;
  scala_secondaria: ScalaCode | null;
  polarita: '+' | '-';
  blocco_tematico: number | null;
  ordine: number | null;
}

// V5 Domanda interface con supporto polarità speciali
export interface DomandaV5 {
  id: number;
  testo: string;
  scala_primaria: TraitCode;
  scala_secondaria?: TraitCode | null;
  polarita: PolaritaV5;
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

// Legacy V4 Scale Codes (mantenute per retrocompatibilità)
export type ScalaCode = 'SV' | 'MO' | 'CF' | 'EF' | 'EC' | 'QN' | 'QR' | 'SP' | 'PA' | 'SC' | 'ST' | 'LE';

// V5 Trait Codes - 15 nuovi tratti + CTRL per attendibilità
export type TraitCode = 
  | 'ORG' | 'AUT' | 'GP' | 'ADS' | 'DET' | 'VEN' | 'HRM' 
  | 'LDR' | 'PRO' | 'COM' | 'ESP' | 'RC' | 'FIN' | 'SUC' | 'PRI' | 'CTRL';

// V5 Trait Labels
export const TRAIT_LABELS: Record<TraitCode, string> = {
  ORG: 'Organizzazione',
  AUT: 'Automotivazione',
  GP: 'Gestione Pressioni',
  ADS: 'Autodisciplina',
  DET: 'Determinazione',
  VEN: 'Attitudine Vendita',
  HRM: 'HR Management',
  LDR: 'Leadership Naturale',
  PRO: 'Proattività',
  COM: 'Comprensione',
  ESP: 'Espansività',
  RC: 'Resistenza al Cambiamento',
  FIN: 'Finanze',
  SUC: 'Successo',
  PRI: 'Principi',
  CTRL: 'Controllo'
};

// V5 Macro-Aree
export type MacroAreaCode = 'ESSERE' | 'FARE' | 'AVERE';

export const MACRO_AREA_LABELS: Record<MacroAreaCode, string> = {
  ESSERE: 'Essere (Concentrazione sugli obiettivi)',
  FARE: 'Fare (Azioni concrete)',
  AVERE: 'Avere (Relazioni che stabilizzano il valore)'
};

// V5 Macro-Area composition
export const MACRO_AREA_TRAITS: Record<MacroAreaCode, TraitCode[]> = {
  ESSERE: ['ORG', 'AUT', 'GP'],
  FARE: ['ADS', 'DET', 'VEN', 'HRM'],
  AVERE: ['LDR', 'PRO', 'COM', 'ESP']
};

// V5 Indicatori (non appartengono a macro-aree)
export const INDICATOR_TRAITS: TraitCode[] = ['RC', 'FIN', 'SUC', 'PRI'];

// V5 Reliability Index
// Manuale V2: ZERO = profilo non utilizzabile (>8 risposte inattese)
export type ReliabilityIndex = 'YES' | 'CAUTION' | 'NO' | 'ZERO' | 'FORCED';

// V5 Syndrome Severity
export type SyndromeSeverity = 'RED' | 'ORANGE' | 'YELLOW';

// V5 Assessment Version
export type AssessmentVersion = 'v4' | 'v5';

// Legacy V4 Profili (mantenuti per retrocompatibilità)
export type ProfiloTipo = 
  | 'LEADER_NATURALE'
  | 'ESECUTORE_AFFIDABILE'
  | 'CREATIVO_DESTABILIZZANTE'
  | 'TECNICO_SPECIALISTA'
  | 'COMMERCIALE_NATURALE'
  | 'AMMINISTRATIVO_METODICO'
  | 'COLLABORATORE_CRESCITA'
  | 'PROFESSIONISTA_AUTONOMO'
  | 'SUPPORTO_OPERATIVO'
  | 'IN_TRANSIZIONE';

// V5 Profile Types
export type ProfiloTipoV5 = 
  | 'LEADER'             // ESSERE>=60% E FARE>=60% E AVERE>=60%
  | 'STRATEGIST'         // ESSERE>=60% E FARE<50%
  | 'EXECUTOR'           // FARE>=60% E ESSERE<50%
  | 'SPECIALIST'         // una area>=70%, altre<50%
  | 'GROWTH_POTENTIAL'   // tutte 40-60%, no sindromi gravi
  | 'IN_TRANSIZIONE'     // pattern misto con sindromi attive
  | 'CRITICAL';          // almeno una S01-S04

export type MacroCategoria = 'ALTA_PERFORMANCE' | 'CRESCITA' | 'ATTENZIONE';

// Legacy V4 Scale Labels (mantenute per retrocompatibilità)
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

// V5 Risposta Types (include D = preferisco non rispondere)
export type RispostaValueV5 = 'A' | 'B' | 'C' | 'D';

// V5 Polarità Types
// '+' = positiva, '-' = negativa, 'S' = SPECIAL scoring, 'C' = CTRL (domande controllo)
export type PolaritaV5 = '+' | '-' | 'S' | 'C';

// Ruoli candidato per il form anagrafico
export const RUOLI_CANDIDATO = [
  'Intermedio',
  'Operativo',
  'Candidato'
];

// Ruoli aziendali completi
export const RUOLI_AZIENDALI = [
  'Top Management',
  'Intermedio',
  'Operativo',
  'Candidato'
];

// Funzioni aziendali aggiornate
export const FUNZIONI = [
  'Account management',
  'Amministrazione',
  'Assistente di direzione',
  'Cantiere/Edilizia',
  'Consulenza',
  'Controllo di gestione',
  'Coordinamento',
  'Customer care',
  'Data analysis',
  'Direzione commerciale',
  'Direzione generale',
  'Formazione',
  'Impiegato amministrativo',
  'Imprenditore',
  'Installazione/Manutenzione',
  'IT/Sistemi informativi',
  'Logistica',
  'Produzione',
  'Project management',
  'Qualità/Compliance',
  'Segreteria/Assistenza dir.',
  'Selezione personale',
  'Ufficio acquisti',
  'Ufficio marketing',
  'Ufficio risorse umane',
  'Ufficio tecnico',
  'Ufficio vendite',
];

// Abbonamento (subscription) interface
export type StatoAbbonamento = 'attivo' | 'scaduto' | 'sospeso' | 'trial';

export interface Abbonamento {
  id: string;
  azienda_id: string;
  stato: StatoAbbonamento;
  importo_mensile: number;
  data_inizio: string | null;
  data_scadenza: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  aziende?: { nome: string };
}

// Pagamento (payment) interface
export type StatoPagamento = 'completato' | 'fallito' | 'in_attesa' | 'rimborsato';
export type MetodoPagamento = 'stripe' | 'bonifico' | 'manuale';

export interface Pagamento {
  id: string;
  abbonamento_id: string;
  azienda_id: string;
  importo: number;
  stato: StatoPagamento;
  data_pagamento: string;
  metodo: MetodoPagamento;
  stripe_payment_id: string | null;
  note: string | null;
  created_at: string;
}