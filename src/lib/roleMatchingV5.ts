/**
 * Sistema di Matching Ruoli V5 - Assessment Psicometrico
 * 
 * Matching per 9 mansioni basato sui 15 tratti V5:
 * - Responsabile Amministrativo
 * - Venditore/Commerciale
 * - Customer Care
 * - Direttore Generale
 * - HR Manager
 * - Marketing Manager
 * - Responsabile Tecnico
 * - Buyer/Acquisti
 * - Responsabile Produzione/Logistica
 * 
 * Include disqualifier e soglie tratti dal Manuale V5
 */

import { TraitCode, TRAIT_LABELS } from '@/types/database';
import { 
  getActiveSyndromes, 
  hasCriticalSyndromes, 
  TraitScores,
  SyndromeResult 
} from './syndromes';

// ============================================
// TIPI
// ============================================

export type FitVerdictV5 = 'NON_IDONEO' | 'DA_VALUTARE' | 'IDONEO_CON_RISERVA' | 'IDONEO';

export interface TraitRequirement {
  trait: TraitCode;
  soglia: number;
  tipo: 'min' | 'max' | 'range';
  rangeMax?: number;
  isCritical: boolean;
  label: string;
}

export interface RoleDisqualifier {
  condition: (traits: TraitScores, syndromes: SyndromeResult[]) => boolean;
  reason: string;
  severity: 'blocking' | 'warning';
}

export interface RoleProfileV5 {
  id: string;
  nome: string;
  categoria: 'direzione' | 'commerciale' | 'amministrativo' | 'tecnico' | 'operativo';
  descrizione: string;
  requisiti: TraitRequirement[];
  disqualifiers: RoleDisqualifier[];
  profiloIdeale: string;
  trattiFondamentali: TraitCode[];
  domandeColloquio: string[];
}

export interface RoleMatchResultV5 {
  ruolo: string;
  categoria: string;
  compatibilitaPct: number;
  requisitiSoddisfatti: { trait: TraitCode; label: string; valore: number; soglia: number }[];
  requisitiMancanti: { trait: TraitCode; label: string; valore: number; soglia: number; gap: number }[];
  disqualifiersAttivi: { reason: string; severity: 'blocking' | 'warning' }[];
  syndromiRilevanti: SyndromeResult[];
  verdict: FitVerdictV5;
  motivazione: string;
  domandeColloquio: string[];
}

export interface AllRolesCompatibilityV5 {
  ruoloRichiesto: RoleMatchResultV5;
  tuttiRuoli: { ruolo: string; compatibilita: number; verdict: FitVerdictV5 }[];
  ruoloIdeale: { ruolo: string; compatibilita: number } | null;
}

// ============================================
// PROFILI RUOLI V5
// ============================================

export const ROLE_PROFILES_V5: Record<string, RoleProfileV5> = {
  'Responsabile Amministrativo': {
    id: 'resp_amm',
    nome: 'Responsabile Amministrativo',
    categoria: 'amministrativo',
    descrizione: 'Gestione contabilità, bilancio, fiscalità e procedure amministrative',
    // Soglie allineate al Manuale V2: ORG>40, AUT≥-15, GP≥21, ADS>39, PRO>19, COM≥-15, RC>-19, PRI>39
    requisiti: [
      { trait: 'ORG', soglia: 40, tipo: 'min', isCritical: true, label: 'Organizzazione > 40' },
      { trait: 'AUT', soglia: -15, tipo: 'min', isCritical: false, label: 'Automotivazione ≥ -15' },
      { trait: 'GP', soglia: 21, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 21' },
      { trait: 'ADS', soglia: 39, tipo: 'min', isCritical: true, label: 'Autodisciplina > 39' },
      { trait: 'PRO', soglia: 19, tipo: 'min', isCritical: false, label: 'Proattività > 19' },
      { trait: 'COM', soglia: -15, tipo: 'min', isCritical: false, label: 'Comprensione ≥ -15' },
      { trait: 'RC', soglia: -19, tipo: 'min', isCritical: true, label: 'RC > -19' },
      { trait: 'PRI', soglia: 39, tipo: 'min', isCritical: true, label: 'Principi > 39' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.ORG < 20,
        reason: 'Organizzazione troppo bassa per ruolo amministrativo',
        severity: 'blocking'
      },
      {
        condition: (t) => t.GP < 21,
        reason: 'PSP: non regge la pressione lavorativa',
        severity: 'blocking'
      },
      {
        condition: (t) => t.VEN > 60,
        reason: 'Troppo orientato alla vendita, soffrirà in ruolo back-office',
        severity: 'warning'
      },
      {
        condition: (_, s) => s.some(syn => ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08'].includes(syn.code) && syn.isActive),
        reason: 'Sindrome critica o problematica per ruolo amministrativo',
        severity: 'blocking'
      },
      {
        condition: (t) => t.COM < -38,
        reason: 'Comprensione troppo bassa per gestire relazioni interne',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Persona metodica, precisa, affidabile. Ama le procedure e i numeri.',
    trattiFondamentali: ['ORG', 'ADS', 'PRI', 'GP'],
    domandeColloquio: [
      'Come organizza la gestione delle scadenze fiscali?',
      'Racconti di un errore contabile grave e come lo ha risolto.',
      'Come gestisce le priorità quando tutto sembra urgente?',
    ],
  },

  'Venditore/Commerciale': {
    id: 'venditore',
    nome: 'Venditore/Commerciale',
    categoria: 'commerciale',
    descrizione: 'Sviluppo clienti, negoziazione, raggiungimento obiettivi di fatturato',
    // Soglie allineate al Manuale V2: AUT≥20, VEN≥30, ESP≥15, GP≥21, DET≥30, PRO≥10, COM≥0
    requisiti: [
      { trait: 'VEN', soglia: 30, tipo: 'min', isCritical: true, label: 'Attitudine Vendita ≥ 30' },
      { trait: 'DET', soglia: 30, tipo: 'min', isCritical: true, label: 'Determinazione ≥ 30' },
      { trait: 'GP', soglia: 21, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 21' },
      { trait: 'AUT', soglia: 20, tipo: 'min', isCritical: false, label: 'Automotivazione ≥ 20' },
      { trait: 'ESP', soglia: 15, tipo: 'min', isCritical: false, label: 'Espansività ≥ 15' },
      { trait: 'PRO', soglia: 10, tipo: 'min', isCritical: false, label: 'Proattività ≥ 10' },
      { trait: 'COM', soglia: 0, tipo: 'min', isCritical: false, label: 'Comprensione ≥ 0' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.VEN < 20,
        reason: 'Attitudine vendita insufficiente',
        severity: 'blocking'
      },
      {
        condition: (t) => t.DET < 15,
        reason: 'Determinazione troppo bassa per gestire rifiuti e negoziazioni',
        severity: 'blocking'
      },
      {
        condition: (t) => t.GP < 21,
        reason: 'PSP: non regge la pressione commerciale',
        severity: 'blocking'
      },
      {
        condition: (_, s) => s.some(syn => ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S07', 'S08'].includes(syn.code) && syn.isActive),
        reason: 'Sindrome critica o problematica per ruolo commerciale',
        severity: 'blocking'
      },
      {
        condition: (_, s) => s.some(syn => syn.code === 'S17' && syn.isActive),
        reason: 'GP più alto: evita la chiusura, non affronta il cliente',
        severity: 'warning'
      },
      {
        condition: (t) => t.AUT > 60 && t.VEN < 20,
        reason: 'Alto AUT + Basso VEN: motivato ma non per vendere',
        severity: 'warning'
      },
    ],
    profiloIdeale: 'Cacciatore naturale. Ama la sfida, la conquista, il riconoscimento economico.',
    trattiFondamentali: ['VEN', 'DET', 'GP', 'ESP'],
    domandeColloquio: [
      'Quanto vuole guadagnare tra 3 anni? Cosa farà con quei soldi?',
      'Racconti della vendita più difficile che ha chiuso.',
      'Come reagisce quando un cliente le dice no per la quinta volta?',
      'Qual è il suo record di fatturato? Come lo ha raggiunto?',
    ],
  },

  'Customer Care': {
    id: 'customer_care',
    nome: 'Customer Care',
    categoria: 'commerciale',
    descrizione: 'Gestione clienti, risoluzione problemi, fidelizzazione',
    // Soglie allineate al Manuale V2: PRO≥20, COM≥10, ESP≥10, GP≥21, ADS≥25
    requisiti: [
      { trait: 'PRO', soglia: 20, tipo: 'min', isCritical: true, label: 'Proattività ≥ 20' },
      { trait: 'COM', soglia: 10, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 10' },
      { trait: 'GP', soglia: 21, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 21' },
      { trait: 'ESP', soglia: 10, tipo: 'min', isCritical: false, label: 'Espansività ≥ 10' },
      { trait: 'ADS', soglia: 25, tipo: 'min', isCritical: false, label: 'Autodisciplina ≥ 25' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.COM < 0,
        reason: 'Comprensione negativa: non capirà le esigenze del cliente',
        severity: 'blocking'
      },
      {
        condition: (t) => t.PRO < 0,
        reason: 'Proattività negativa: non anticipa le esigenze del cliente',
        severity: 'blocking'
      },
      {
        condition: (t) => t.GP < 21,
        reason: 'PSP: non regge la pressione dei clienti difficili',
        severity: 'blocking'
      },
      {
        condition: (_, s) => s.some(syn => ['S01', 'S04', 'S16'].includes(syn.code) && syn.isActive),
        reason: 'Sindrome demotivante o brutto carattere: trasmetterà negatività ai clienti',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Empatico, paziente, orientato alla soluzione. Ama aiutare le persone.',
    trattiFondamentali: ['PRO', 'COM', 'GP', 'ESP'],
    domandeColloquio: [
      'Racconti di un cliente molto arrabbiato e come lo ha gestito.',
      'Come fa a mantenere la calma dopo la decima telefonata difficile?',
      'Cosa fa quando il cliente ha ragione e l\'azienda ha torto?',
    ],
  },

  'Direttore Generale': {
    id: 'dg',
    nome: 'Direttore Generale',
    categoria: 'direzione',
    descrizione: 'Responsabilità strategica, gestione risorse, risultati aziendali',
    requisiti: [
      { trait: 'LDR', soglia: 55, tipo: 'min', isCritical: true, label: 'Leadership ≥ 55' },
      { trait: 'AUT', soglia: 50, tipo: 'min', isCritical: true, label: 'Automotivazione ≥ 50' },
      { trait: 'DET', soglia: 50, tipo: 'min', isCritical: true, label: 'Determinazione ≥ 50' },
      { trait: 'GP', soglia: 40, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 40' },
      { trait: 'HRM', soglia: 40, tipo: 'min', isCritical: false, label: 'HR Management ≥ 40' },
      { trait: 'SUC', soglia: 60, tipo: 'min', isCritical: false, label: 'Orientamento Successo ≥ 60' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.LDR < 40,
        reason: 'Leadership insufficiente per ruolo direttivo',
        severity: 'blocking'
      },
      {
        condition: (t) => t.HRM < 20,
        reason: 'Incapace di gestire le persone',
        severity: 'blocking'
      },
      {
        condition: (_, s) => s.some(syn => ['S01', 'S02', 'S03', 'S04'].includes(syn.code) && syn.isActive),
        reason: 'Sindrome critica: porterebbe l\'azienda al fallimento',
        severity: 'blocking'
      },
      {
        condition: (t) => t.RC > 60,
        reason: 'Troppo rigido per guidare il cambiamento',
        severity: 'warning'
      },
    ],
    profiloIdeale: 'Leader visionario con capacità decisionale, resilienza e carisma.',
    trattiFondamentali: ['LDR', 'AUT', 'DET', 'HRM'],
    domandeColloquio: [
      'Racconti della decisione più difficile che ha dovuto prendere.',
      'Come ha gestito un collaboratore che non performava?',
      'Qual è stata la sua più grande vittoria aziendale?',
      'Come gestisce la pressione degli stakeholder?',
    ],
  },

  'HR Manager': {
    id: 'hr_manager',
    nome: 'HR Manager',
    categoria: 'direzione',
    descrizione: 'Gestione risorse umane, sviluppo talenti, clima aziendale',
    requisiti: [
      { trait: 'HRM', soglia: 50, tipo: 'min', isCritical: true, label: 'HR Management ≥ 50' },
      { trait: 'COM', soglia: 45, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 45' },
      { trait: 'PRO', soglia: 35, tipo: 'min', isCritical: true, label: 'Proattività ≥ 35' },
      { trait: 'LDR', soglia: 35, tipo: 'min', isCritical: false, label: 'Leadership ≥ 35' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.HRM < 30,
        reason: 'Capacità HR insufficienti',
        severity: 'blocking'
      },
      {
        condition: (t) => t.COM < 25,
        reason: 'Troppo poco empatico per gestire le persone',
        severity: 'blocking'
      },
      {
        condition: (_, s) => s.some(syn => ['S01', 'S04', 'S05'].includes(syn.code) && syn.isActive),
        reason: 'Sindrome demotivante: danneggerà il clima aziendale',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Custode delle persone. Bilancia esigenze aziendali e benessere dipendenti.',
    trattiFondamentali: ['HRM', 'COM', 'PRO', 'LDR'],
    domandeColloquio: [
      'Come ha gestito un conflitto grave tra colleghi?',
      'Racconti di un talento che ha sviluppato e fatto crescere.',
      'Come affronta le decisioni impopolari (licenziamenti, tagli)?',
    ],
  },

  'Marketing Manager': {
    id: 'marketing_mgr',
    nome: 'Marketing Manager',
    categoria: 'commerciale',
    descrizione: 'Strategia marketing, brand, comunicazione, analisi mercato',
    requisiti: [
      { trait: 'ESP', soglia: 45, tipo: 'min', isCritical: true, label: 'Espansività ≥ 45' },
      { trait: 'AUT', soglia: 40, tipo: 'min', isCritical: true, label: 'Automotivazione ≥ 40' },
      { trait: 'PRO', soglia: 40, tipo: 'min', isCritical: true, label: 'Proattività ≥ 40' },
      { trait: 'ORG', soglia: 30, tipo: 'min', isCritical: false, label: 'Organizzazione ≥ 30' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.ESP < 30,
        reason: 'Espansività insufficiente per ruolo di comunicazione',
        severity: 'blocking'
      },
      {
        condition: (t) => t.RC > 55,
        reason: 'Troppo rigido per ruolo creativo',
        severity: 'warning'
      },
    ],
    profiloIdeale: 'Creativo strategico con visione, capacità di execution e orientamento ai risultati.',
    trattiFondamentali: ['ESP', 'AUT', 'PRO'],
    domandeColloquio: [
      'Racconti della campagna di cui va più fiero.',
      'Come misura il successo delle sue attività marketing?',
      'Come gestisce stakeholder che vogliono cambiare tutto?',
    ],
  },

  'Responsabile Tecnico': {
    id: 'resp_tecnico',
    nome: 'Responsabile Tecnico',
    categoria: 'tecnico',
    descrizione: 'Gestione tecnica, progettazione, problem solving specialistico',
    requisiti: [
      { trait: 'ORG', soglia: 40, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 40' },
      { trait: 'ADS', soglia: 45, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 45' },
      { trait: 'DET', soglia: 35, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 35' },
      { trait: 'RC', soglia: 50, tipo: 'max', isCritical: false, label: 'RC ≤ 50 (aperto a nuove soluzioni)' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.ADS < 30,
        reason: 'Autodisciplina insufficiente per ruolo tecnico',
        severity: 'blocking'
      },
      {
        condition: (t) => t.ORG < 25,
        reason: 'Disorganizzato: non può gestire progetti tecnici complessi',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Risolutore di problemi. Trova soddisfazione nel far funzionare le cose.',
    trattiFondamentali: ['ORG', 'ADS', 'DET'],
    domandeColloquio: [
      'Racconti del problema tecnico più complesso che ha risolto.',
      'Come gestisce le deadline tecniche aggressive?',
      'Come si tiene aggiornato sulle nuove tecnologie?',
    ],
  },

  'Buyer/Acquisti': {
    id: 'buyer',
    nome: 'Buyer/Acquisti',
    categoria: 'amministrativo',
    descrizione: 'Gestione fornitori, negoziazione, ottimizzazione costi',
    requisiti: [
      { trait: 'DET', soglia: 45, tipo: 'min', isCritical: true, label: 'Determinazione ≥ 45' },
      { trait: 'ORG', soglia: 40, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 40' },
      { trait: 'FIN', soglia: 35, tipo: 'min', isCritical: true, label: 'Orientamento Finanze ≥ 35' },
      { trait: 'VEN', soglia: 30, tipo: 'min', isCritical: false, label: 'Attitudine Negoziale ≥ 30' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.DET < 25,
        reason: 'Determinazione insufficiente per negoziare con fornitori',
        severity: 'blocking'
      },
      {
        condition: (t) => t.FIN < 15,
        reason: 'Nessun orientamento al risparmio/valore',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Guardiano del valore. Ottimizza costi, negozia duramente, garantisce qualità.',
    trattiFondamentali: ['DET', 'ORG', 'FIN', 'VEN'],
    domandeColloquio: [
      'Racconti della negoziazione più dura che ha condotto.',
      'Come bilancia qualità e risparmio?',
      'Come gestisce un fornitore storico che alza i prezzi?',
    ],
  },

  'Responsabile Produzione/Logistica': {
    id: 'resp_prod_log',
    nome: 'Responsabile Produzione/Logistica',
    categoria: 'operativo',
    descrizione: 'Gestione flussi produttivi, logistica, efficienza operativa',
    requisiti: [
      { trait: 'ORG', soglia: 50, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 50' },
      { trait: 'ADS', soglia: 45, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 45' },
      { trait: 'GP', soglia: 35, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 35' },
      { trait: 'LDR', soglia: 30, tipo: 'min', isCritical: false, label: 'Leadership ≥ 30' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.ORG < 35,
        reason: 'Organizzazione insufficiente per gestire flussi complessi',
        severity: 'blocking'
      },
      {
        condition: (t) => t.GP < 21,
        reason: 'PSP: non regge la pressione operativa',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Orchestratore dei flussi. Tiene tutto insieme, prevede problemi, risolve in tempo reale.',
    trattiFondamentali: ['ORG', 'ADS', 'GP', 'LDR'],
    domandeColloquio: [
      'Come gestisce un imprevisto che blocca la produzione?',
      'Racconti di come ha migliorato l\'efficienza di un processo.',
      'Come motiva un team operativo sotto pressione?',
    ],
  },

  // ============================================
  // NUOVI RUOLI V5 (dal Manuale Completo)
  // ============================================

  'Direttore Commerciale': {
    id: 'dir_comm',
    nome: 'Direttore Commerciale',
    categoria: 'direzione',
    descrizione: 'Strategia vendite, gestione rete commerciale, obiettivi fatturato',
    requisiti: [
      { trait: 'LDR', soglia: 50, tipo: 'min', isCritical: true, label: 'Leadership ≥ 50' },
      { trait: 'VEN', soglia: 45, tipo: 'min', isCritical: true, label: 'Attitudine Vendita ≥ 45' },
      { trait: 'DET', soglia: 50, tipo: 'min', isCritical: true, label: 'Determinazione ≥ 50' },
      { trait: 'HRM', soglia: 35, tipo: 'min', isCritical: true, label: 'HR Management ≥ 35' },
      { trait: 'AUT', soglia: 45, tipo: 'min', isCritical: false, label: 'Automotivazione ≥ 45' },
      { trait: 'FIN', soglia: 40, tipo: 'min', isCritical: false, label: 'Orientamento Finanze ≥ 40' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.LDR < 35,
        reason: 'Leadership insufficiente per dirigere team commerciale',
        severity: 'blocking'
      },
      {
        condition: (t) => t.VEN < 30,
        reason: 'Senza esperienza vendita non può guidare venditori',
        severity: 'blocking'
      },
      {
        condition: (t) => t.HRM < 20,
        reason: 'Incapace di gestire e motivare la rete vendita',
        severity: 'blocking'
      },
      {
        condition: (_, s) => s.some(syn => ['S01', 'S02', 'S03', 'S04'].includes(syn.code) && syn.isActive),
        reason: 'Sindrome critica: danneggerà l\'intera rete commerciale',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Leader commerciale. Vende, ma soprattutto fa vendere gli altri. Visione strategica + execution.',
    trattiFondamentali: ['LDR', 'VEN', 'DET', 'HRM'],
    domandeColloquio: [
      'Come costruisce e motiva una rete vendita?',
      'Racconti del suo miglior anno commerciale: come lo ha ottenuto?',
      'Come gestisce un venditore che non performa?',
      'Qual è la sua strategia per entrare in un nuovo mercato?',
    ],
  },

  'Capocantiere': {
    id: 'capocantiere',
    nome: 'Capocantiere',
    categoria: 'operativo',
    descrizione: 'Gestione cantiere edile, coordinamento maestranze, sicurezza, tempistiche',
    requisiti: [
      { trait: 'ORG', soglia: 50, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 50' },
      { trait: 'GP', soglia: 45, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 45' },
      { trait: 'LDR', soglia: 40, tipo: 'min', isCritical: true, label: 'Leadership ≥ 40' },
      { trait: 'ADS', soglia: 40, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 40' },
      { trait: 'DET', soglia: 35, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 35' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.ORG < 35,
        reason: 'Organizzazione insufficiente per gestire un cantiere',
        severity: 'blocking'
      },
      {
        condition: (t) => t.GP < 30,
        reason: 'Non regge la pressione tipica del cantiere',
        severity: 'blocking'
      },
      {
        condition: (t) => t.LDR < 25,
        reason: 'Incapace di comandare le maestranze',
        severity: 'blocking'
      },
      {
        condition: (_, s) => s.some(syn => ['S01', 'S04', 'S05'].includes(syn.code) && syn.isActive),
        reason: 'Demotivante: causerà turnover e problemi di sicurezza',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Comandante di cantiere. Polso fermo, organizzato, sa far rispettare tempi e sicurezza.',
    trattiFondamentali: ['ORG', 'GP', 'LDR', 'ADS'],
    domandeColloquio: [
      'Come gestisce ritardi dovuti a maltempo o imprevisti?',
      'Racconti di un problema di sicurezza che ha risolto.',
      'Come fa rispettare le regole a maestranze difficili?',
      'Come gestisce più subappaltatori contemporaneamente?',
    ],
  },

  'Commerciale Edilizia': {
    id: 'comm_edilizia',
    nome: 'Commerciale Edilizia',
    categoria: 'commerciale',
    descrizione: 'Vendita prodotti/servizi edilizia, consulenza tecnico-commerciale',
    requisiti: [
      { trait: 'VEN', soglia: 45, tipo: 'min', isCritical: true, label: 'Attitudine Vendita ≥ 45' },
      { trait: 'DET', soglia: 40, tipo: 'min', isCritical: true, label: 'Determinazione ≥ 40' },
      { trait: 'ORG', soglia: 35, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 35' },
      { trait: 'ESP', soglia: 35, tipo: 'min', isCritical: false, label: 'Espansività ≥ 35' },
      { trait: 'ADS', soglia: 30, tipo: 'min', isCritical: false, label: 'Autodisciplina ≥ 30' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.VEN < 30,
        reason: 'Attitudine vendita insufficiente',
        severity: 'blocking'
      },
      {
        condition: (t) => t.ORG < 20,
        reason: 'Troppo disorganizzato per gestire progetti complessi',
        severity: 'blocking'
      },
      {
        condition: (t) => t.GP < 21,
        reason: 'PSP: non regge trattative lunghe e pressioni cliente',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Consulente tecnico-commerciale. Capisce il prodotto, lo sa vendere, segue il progetto.',
    trattiFondamentali: ['VEN', 'DET', 'ORG', 'ADS'],
    domandeColloquio: [
      'Come gestisce una trattativa che dura mesi?',
      'Racconti di un progetto complesso che ha portato a casa.',
      'Come bilancia esigenze tecniche e commerciali?',
      'Come gestisce il post-vendita e i reclami?',
    ],
  },

  'HR Recruiter': {
    id: 'hr_recruiter',
    nome: 'HR Recruiter',
    categoria: 'amministrativo',
    descrizione: 'Selezione del personale, screening CV, colloqui, valutazione candidati',
    requisiti: [
      { trait: 'COM', soglia: 50, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 50' },
      { trait: 'PRO', soglia: 40, tipo: 'min', isCritical: true, label: 'Proattività ≥ 40' },
      { trait: 'ORG', soglia: 35, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 35' },
      { trait: 'ESP', soglia: 35, tipo: 'min', isCritical: false, label: 'Espansività ≥ 35' },
      { trait: 'HRM', soglia: 30, tipo: 'min', isCritical: false, label: 'HR Management ≥ 30' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.COM < 30,
        reason: 'Comprensione insufficiente: non leggerà le persone',
        severity: 'blocking'
      },
      {
        condition: (t) => t.PRO < 20,
        reason: 'Troppo passivo per cercare attivamente talenti',
        severity: 'blocking'
      },
      {
        condition: (_, s) => s.some(syn => ['S01', 'S04', 'S16'].includes(syn.code) && syn.isActive),
        reason: 'Demotivante: allontanerà i candidati migliori',
        severity: 'blocking'
      },
    ],
    profiloIdeale: 'Cacciatore di talenti. Empatico, proattivo, sa vedere oltre il CV.',
    trattiFondamentali: ['COM', 'PRO', 'ORG', 'ESP'],
    domandeColloquio: [
      'Come identifica un talento nascosto in un colloquio?',
      'Racconti di un\'assunzione di cui va particolarmente fiero.',
      'Come gestisce un candidato che rifiuta l\'offerta?',
      'Quali domande chiave fa sempre in un colloquio?',
    ],
  },

  'Impiegato Amministrativo': {
    id: 'imp_amm',
    nome: 'Impiegato Amministrativo',
    categoria: 'amministrativo',
    descrizione: 'Attività amministrative, contabilità ordinaria, gestione documenti',
    requisiti: [
      { trait: 'ORG', soglia: 40, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 40' },
      { trait: 'ADS', soglia: 40, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 40' },
      { trait: 'PRO', soglia: 20, tipo: 'min', isCritical: false, label: 'Proattività ≥ 20' },
      { trait: 'RC', soglia: 65, tipo: 'max', isCritical: false, label: 'RC ≤ 65 (minima flessibilità)' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.ORG < 25,
        reason: 'Organizzazione insufficiente per lavoro amministrativo',
        severity: 'blocking'
      },
      {
        condition: (t) => t.ADS < 25,
        reason: 'Autodisciplina troppo bassa per lavoro ripetitivo',
        severity: 'blocking'
      },
      {
        condition: (t) => t.VEN > 65,
        reason: 'Troppo orientato alla vendita: soffrirà in back-office',
        severity: 'warning'
      },
    ],
    profiloIdeale: 'Affidabile e preciso. Ama l\'ordine, le procedure, i numeri che tornano.',
    trattiFondamentali: ['ORG', 'ADS'],
    domandeColloquio: [
      'Come organizza le sue attività giornaliere?',
      'Racconti di un errore che ha scoperto e corretto.',
      'Come gestisce le scadenze multiple?',
      'Cosa le piace del lavoro amministrativo?',
    ],
  },

  'Operaio/Installatore': {
    id: 'operaio',
    nome: 'Operaio/Installatore',
    categoria: 'operativo',
    descrizione: 'Lavoro manuale, installazione, posa, manutenzione',
    requisiti: [
      { trait: 'ADS', soglia: 35, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 35' },
      { trait: 'ORG', soglia: 30, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 30' },
      { trait: 'GP', soglia: 25, tipo: 'min', isCritical: false, label: 'Gestione Pressioni ≥ 25' },
      { trait: 'PRO', soglia: 15, tipo: 'min', isCritical: false, label: 'Proattività ≥ 15' },
    ],
    disqualifiers: [
      {
        condition: (t) => t.ADS < 20,
        reason: 'Autodisciplina insufficiente per lavoro manuale costante',
        severity: 'blocking'
      },
      {
        condition: (_, s) => s.some(syn => ['S01', 'S04'].includes(syn.code) && syn.isActive),
        reason: 'Demotivante: creerà problemi nel team operativo',
        severity: 'blocking'
      },
      {
        condition: (t) => t.RC > 70,
        reason: 'Troppo rigido per adattarsi a situazioni diverse',
        severity: 'warning'
      },
    ],
    profiloIdeale: 'Esecutore affidabile. Fa il suo lavoro bene, rispetta tempi e istruzioni.',
    trattiFondamentali: ['ADS', 'ORG'],
    domandeColloquio: [
      'Racconti del lavoro che ha fatto meglio.',
      'Come gestisce istruzioni poco chiare?',
      'Cosa fa quando trova un problema imprevisto?',
      'Come si trova a lavorare in squadra?',
    ],
  },
};

// ============================================
// FUNZIONI DI MATCHING
// ============================================

/**
 * Verifica se un requisito è soddisfatto
 */
function checkRequirement(
  req: TraitRequirement, 
  traits: TraitScores
): { ok: boolean; valore: number; gap: number } {
  const valore = traits[req.trait as keyof TraitScores] ?? 0;
  let ok = false;
  let gap = 0;

  switch (req.tipo) {
    case 'min':
      ok = valore >= req.soglia;
      gap = ok ? 0 : req.soglia - valore;
      break;
    case 'max':
      ok = valore <= req.soglia;
      gap = ok ? 0 : valore - req.soglia;
      break;
    case 'range':
      ok = valore >= req.soglia && valore <= (req.rangeMax || 100);
      if (valore < req.soglia) gap = req.soglia - valore;
      else if (valore > (req.rangeMax || 100)) gap = valore - (req.rangeMax || 100);
      break;
  }

  return { ok, valore, gap };
}

/**
 * Calcola il matching V5 per un singolo ruolo
 */
export function calculateRoleMatchingV5(
  ruolo: string,
  traits: TraitScores,
  candidateAge?: number
): RoleMatchResultV5 {
  const profile = ROLE_PROFILES_V5[ruolo];
  
  if (!profile) {
    return {
      ruolo,
      categoria: 'altro',
      compatibilitaPct: 50,
      requisitiSoddisfatti: [],
      requisitiMancanti: [],
      disqualifiersAttivi: [],
      syndromiRilevanti: [],
      verdict: 'DA_VALUTARE',
      motivazione: 'Ruolo non configurato nel sistema V5.',
      domandeColloquio: [],
    };
  }

  // Ottieni sindromi attive
  const syndromes = getActiveSyndromes(traits, candidateAge);
  
  const requisitiSoddisfatti: RoleMatchResultV5['requisitiSoddisfatti'] = [];
  const requisitiMancanti: RoleMatchResultV5['requisitiMancanti'] = [];
  const disqualifiersAttivi: RoleMatchResultV5['disqualifiersAttivi'] = [];

  // Verifica requisiti
  for (const req of profile.requisiti) {
    const { ok, valore, gap } = checkRequirement(req, traits);
    
    if (ok) {
      requisitiSoddisfatti.push({ 
        trait: req.trait, 
        label: req.label, 
        valore, 
        soglia: req.soglia 
      });
    } else {
      requisitiMancanti.push({ 
        trait: req.trait, 
        label: req.label, 
        valore, 
        soglia: req.soglia, 
        gap 
      });
    }
  }

  // Verifica disqualifiers
  for (const disq of profile.disqualifiers) {
    if (disq.condition(traits, syndromes)) {
      disqualifiersAttivi.push({ reason: disq.reason, severity: disq.severity });
    }
  }

  // Sindromi rilevanti per il ruolo
  const syndromiRilevanti = syndromes.filter(s => 
    s.severity === 'RED' || 
    (s.severity === 'ORANGE' && s.isActive)
  );

  // Calcola compatibilità
  const totalReqs = profile.requisiti.length;
  const criticalReqs = profile.requisiti.filter(r => r.isCritical).length;
  const criticalOk = requisitiSoddisfatti.filter(r => 
    profile.requisiti.find(p => p.trait === r.trait)?.isCritical
  ).length;
  
  let compatibilitaPct = Math.round((criticalOk / criticalReqs) * 80);
  
  // Bonus per requisiti non-critici soddisfatti
  const nonCriticalOk = requisitiSoddisfatti.length - criticalOk;
  const nonCriticalTotal = totalReqs - criticalReqs;
  if (nonCriticalTotal > 0) {
    compatibilitaPct += Math.round((nonCriticalOk / nonCriticalTotal) * 20);
  }
  
  // Penalità per disqualifiers
  const blockingDisq = disqualifiersAttivi.filter(d => d.severity === 'blocking').length;
  const warningDisq = disqualifiersAttivi.filter(d => d.severity === 'warning').length;
  
  compatibilitaPct = Math.max(0, compatibilitaPct - (blockingDisq * 30) - (warningDisq * 10));
  
  // Penalità per sindromi
  if (hasCriticalSyndromes(traits, candidateAge)) {
    compatibilitaPct = Math.min(compatibilitaPct, 20);
  }

  // Determina verdetto
  let verdict: FitVerdictV5;
  let motivazione: string;

  if (blockingDisq > 0) {
    verdict = 'NON_IDONEO';
    motivazione = `NON IDONEO: ${disqualifiersAttivi.filter(d => d.severity === 'blocking').map(d => d.reason).join('; ')}`;
  } else if (hasCriticalSyndromes(traits, candidateAge)) {
    verdict = 'NON_IDONEO';
    motivazione = `NON IDONEO: sindromi critiche rilevate (${syndromiRilevanti.filter(s => s.severity === 'RED').map(s => s.code).join(', ')})`;
  } else if (requisitiMancanti.filter(r => 
    profile.requisiti.find(p => p.trait === r.trait)?.isCritical
  ).length >= 2) {
    verdict = 'NON_IDONEO';
    motivazione = `NON IDONEO: ${requisitiMancanti.length} requisiti critici non soddisfatti`;
  } else if (requisitiMancanti.filter(r => 
    profile.requisiti.find(p => p.trait === r.trait)?.isCritical
  ).length === 1) {
    verdict = 'DA_VALUTARE';
    motivazione = `DA VALUTARE: 1 requisito critico mancante (${requisitiMancanti[0]?.label}). Approfondire in colloquio.`;
  } else if (warningDisq > 0 || requisitiMancanti.length > 0) {
    verdict = 'IDONEO_CON_RISERVA';
    motivazione = `IDONEO CON RISERVA: requisiti critici OK, ma ${warningDisq + requisitiMancanti.length} punto/i di attenzione.`;
  } else {
    verdict = 'IDONEO';
    motivazione = `IDONEO: tutti i requisiti soddisfatti. Profilo eccellente per ${ruolo}.`;
  }

  return {
    ruolo,
    categoria: profile.categoria,
    compatibilitaPct,
    requisitiSoddisfatti,
    requisitiMancanti,
    disqualifiersAttivi,
    syndromiRilevanti,
    verdict,
    motivazione,
    domandeColloquio: profile.domandeColloquio,
  };
}

/**
 * Calcola la compatibilità con TUTTI i 9 ruoli V5
 */
export function calculateAllRolesCompatibilityV5(
  ruoloRichiesto: string,
  traits: TraitScores,
  candidateAge?: number
): AllRolesCompatibilityV5 {
  const ruoloRichiestoResult = calculateRoleMatchingV5(ruoloRichiesto, traits, candidateAge);
  
  const tuttiRuoli: { ruolo: string; compatibilita: number; verdict: FitVerdictV5 }[] = [];
  
  for (const ruolo of Object.keys(ROLE_PROFILES_V5)) {
    const result = calculateRoleMatchingV5(ruolo, traits, candidateAge);
    tuttiRuoli.push({
      ruolo,
      compatibilita: result.compatibilitaPct,
      verdict: result.verdict,
    });
  }

  // Ordina per compatibilità decrescente
  tuttiRuoli.sort((a, b) => b.compatibilita - a.compatibilita);

  // Identifica ruolo ideale (diverso da quello richiesto, se migliore)
  const ruoloIdeale = tuttiRuoli.find(r => 
    r.ruolo !== ruoloRichiesto && 
    r.compatibilita > ruoloRichiestoResult.compatibilitaPct &&
    (r.verdict === 'IDONEO' || r.verdict === 'IDONEO_CON_RISERVA')
  ) || null;

  return {
    ruoloRichiesto: ruoloRichiestoResult,
    tuttiRuoli,
    ruoloIdeale: ruoloIdeale ? { ruolo: ruoloIdeale.ruolo, compatibilita: ruoloIdeale.compatibilita } : null,
  };
}

// ============================================
// HELPER UI
// ============================================

export function getVerdictBadgeVariantV5(verdict: FitVerdictV5): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (verdict) {
    case 'IDONEO': return 'default';
    case 'IDONEO_CON_RISERVA': return 'secondary';
    case 'DA_VALUTARE': return 'outline';
    case 'NON_IDONEO': return 'destructive';
    default: return 'outline';
  }
}

export function getVerdictLabelV5(verdict: FitVerdictV5): string {
  const labels: Record<FitVerdictV5, string> = {
    'IDONEO': 'Idoneo',
    'IDONEO_CON_RISERVA': 'Idoneo con Riserva',
    'DA_VALUTARE': 'Da Valutare',
    'NON_IDONEO': 'Non Idoneo',
  };
  return labels[verdict];
}

export function getVerdictColorV5(verdict: FitVerdictV5): string {
  switch (verdict) {
    case 'IDONEO': return 'text-green-600';
    case 'IDONEO_CON_RISERVA': return 'text-amber-600';
    case 'DA_VALUTARE': return 'text-orange-600';
    case 'NON_IDONEO': return 'text-red-600';
    default: return 'text-gray-600';
  }
}

/**
 * Lista dei ruoli V5 disponibili
 */
export const RUOLI_V5 = Object.keys(ROLE_PROFILES_V5);
