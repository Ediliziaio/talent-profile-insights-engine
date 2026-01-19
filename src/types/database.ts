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
  password_plain: string;
  attivo: boolean;
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

// 10 Profili Professionali basati sul Manuale di Elaborazione V2
export type ProfiloTipo = 
  | 'LEADER_NATURALE'           // Leadership forte, QR>140, PA>130, CF>120, SC 90-140
  | 'ESECUTORE_AFFIDABILE'      // Efficienza alta, disciplina, SC equilibrata
  | 'CREATIVO_DESTABILIZZANTE'  // SC<80, alta SP/MO/PA, basso EF
  | 'TECNICO_SPECIALISTA'       // SC molto alta, alta EF/EC, basso PA
  | 'COMMERCIALE_NATURALE'      // PA>150, SP>140, MO>130, CF>120
  | 'AMMINISTRATIVO_METODICO'   // SC alta, EF>140, QN nella norma
  | 'COLLABORATORE_CRESCITA'    // Punteggi medi con potenziale
  | 'PROFESSIONISTA_AUTONOMO'   // Alta autonomia, bassi QN, alti EC/EF
  | 'SUPPORTO_OPERATIVO'        // Preferisce ruoli esecutivi strutturati
  | 'IN_TRANSIZIONE';           // Stress Zone attiva O >2 scale critiche

export type MacroCategoria = 'ALTA_PERFORMANCE' | 'CRESCITA' | 'ATTENZIONE';

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
  'Direzione generale',
  'Ufficio risorse umane',
  'Ufficio marketing',
  'Ufficio vendite',
  'Ufficio tecnico',
  'Ufficio acquisti',
  'Produzione',
  'Logistica',
  'Amministrazione'
];