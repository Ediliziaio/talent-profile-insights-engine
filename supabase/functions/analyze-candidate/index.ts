import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============ V5 TRAIT CODES & LABELS ============
const TRAIT_LABELS: Record<string, string> = {
  ORG: 'Organizzazione', AUT: 'Automotivazione', GP: 'Gestione Pressioni',
  ADS: 'Autodisciplina', DET: 'Determinazione', VEN: 'Attitudine Vendita',
  HRM: 'HR Management', LDR: 'Leadership Naturale', PRO: 'Proattività',
  COM: 'Comprensione', ESP: 'Espansività', RC: 'Resistenza al Cambiamento',
  FIN: 'Finanze', SUC: 'Successo', PRI: 'Principi',
};

type TraitScores = Record<string, number>;
type FitVerdictV5 = 'NON_IDONEO' | 'DA_VALUTARE' | 'IDONEO_CON_RISERVA' | 'IDONEO';

interface TraitRequirement {
  trait: string;
  soglia: number;
  tipo: 'min' | 'max';
  isCritical: boolean;
  label: string;
}

interface RoleProfileV5 {
  requisiti: TraitRequirement[];
  disqualifierDescriptions: string[];
  domandeColloquio: string[];
  profiloIdeale: string;
  validatoManualeV2: boolean;
}

// ============ FUNZIONE→RUOLO MAPPING ============
const FUNZIONE_TO_RUOLO: Record<string, string> = {
  'Direzione generale': 'Direttore Generale',
  'Ufficio vendite': 'Venditore/Commerciale',
  'Vendite': 'Venditore/Commerciale',
  'Amministrazione': 'Responsabile Amministrativo',
  'Produzione': 'Responsabile Produzione/Logistica',
  'Logistica': 'Responsabile Produzione/Logistica',
  'Ufficio marketing': 'Marketing Manager',
  'Marketing': 'Marketing Manager',
  'Risorse umane': 'HR Manager',
  'HR': 'HR Manager',
  'Customer care': 'Customer Care',
  'Ufficio tecnico': 'Responsabile Tecnico',
  'Ufficio acquisti': 'Buyer/Acquisti',
  'Ufficio risorse umane': 'HR Manager',
  'Direzione commerciale': 'Direttore Commerciale',
  'Imprenditore': 'Imprenditore/Titolare',
  'Consulenza': 'Consulente Strategico',
  'Coordinamento': 'Team Leader/Coordinatore',
  'Formazione': 'Formatore/Coach',
  'Qualità/Compliance': 'Responsabile Qualità/Compliance',
  'Controllo di gestione': 'Controller di Gestione',
  'Data analysis': 'Data Analyst',
  'Account management': 'Account Manager',
  'Segreteria/Assistenza dir.': 'Office Manager',
  'IT/Sistemi informativi': 'Responsabile IT/Sistemi',
  'Selezione personale': 'HR Recruiter',
  'Project management': 'Project Manager',
  'Impiegato amministrativo': 'Impiegato Amministrativo',
  'Assistente di direzione': 'Assistente di Direzione',
};

// ============ ROLE PROFILES V5 (simplified for edge function) ============
const ROLE_PROFILES: Record<string, RoleProfileV5> = {
  'Responsabile Amministrativo': {
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
    disqualifierDescriptions: ['ORG<20: disorganizzato', 'GP<21: non regge pressione', 'VEN>60: soffre in back-office'],
    domandeColloquio: ['Come organizza la gestione delle scadenze fiscali?', 'Racconti di un errore contabile grave e come lo ha risolto.'],
    profiloIdeale: 'Persona metodica, precisa, affidabile.',
    validatoManualeV2: true,
  },
  'Venditore/Commerciale': {
    requisiti: [
      { trait: 'VEN', soglia: 30, tipo: 'min', isCritical: true, label: 'Attitudine Vendita ≥ 30' },
      { trait: 'DET', soglia: 30, tipo: 'min', isCritical: true, label: 'Determinazione ≥ 30' },
      { trait: 'GP', soglia: 21, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 21' },
      { trait: 'AUT', soglia: 20, tipo: 'min', isCritical: false, label: 'Automotivazione ≥ 20' },
      { trait: 'ESP', soglia: 15, tipo: 'min', isCritical: false, label: 'Espansività ≥ 15' },
      { trait: 'PRO', soglia: 10, tipo: 'min', isCritical: false, label: 'Proattività ≥ 10' },
      { trait: 'COM', soglia: 0, tipo: 'min', isCritical: false, label: 'Comprensione ≥ 0' },
    ],
    disqualifierDescriptions: ['VEN<20: attitudine vendita insufficiente', 'DET<15: troppo arrendevole', 'AUT>60+VEN<20: motivato ma non per vendere'],
    domandeColloquio: ['Quanto vuole guadagnare tra 3 anni?', 'Racconti della vendita più difficile che ha chiuso.', 'Come reagisce dopo il quinto no?'],
    profiloIdeale: 'Cacciatore naturale. Ama la sfida e il riconoscimento economico.',
    validatoManualeV2: true,
  },
  'Customer Care': {
    requisiti: [
      { trait: 'PRO', soglia: 20, tipo: 'min', isCritical: true, label: 'Proattività ≥ 20' },
      { trait: 'COM', soglia: 10, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 10' },
      { trait: 'GP', soglia: 21, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 21' },
      { trait: 'ESP', soglia: 10, tipo: 'min', isCritical: false, label: 'Espansività ≥ 10' },
      { trait: 'ADS', soglia: 25, tipo: 'min', isCritical: false, label: 'Autodisciplina ≥ 25' },
    ],
    disqualifierDescriptions: ['COM<0: non capisce il cliente', 'PRO<0: non anticipa le esigenze'],
    domandeColloquio: ['Racconti di un cliente molto arrabbiato e come lo ha gestito.', 'Cosa fa quando il cliente ha ragione e l\'azienda ha torto?'],
    profiloIdeale: 'Empatico, paziente, orientato alla soluzione.',
    validatoManualeV2: true,
  },
  'Direttore Generale': {
    requisiti: [
      { trait: 'LDR', soglia: 55, tipo: 'min', isCritical: true, label: 'Leadership ≥ 55' },
      { trait: 'AUT', soglia: 50, tipo: 'min', isCritical: true, label: 'Automotivazione ≥ 50' },
      { trait: 'DET', soglia: 50, tipo: 'min', isCritical: true, label: 'Determinazione ≥ 50' },
      { trait: 'GP', soglia: 40, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 40' },
      { trait: 'HRM', soglia: 40, tipo: 'min', isCritical: false, label: 'HR Management ≥ 40' },
      { trait: 'SUC', soglia: 60, tipo: 'min', isCritical: false, label: 'Successo ≥ 60' },
    ],
    disqualifierDescriptions: ['LDR<40: leadership insufficiente', 'HRM<20: non gestisce persone', 'RC>60: troppo rigido'],
    domandeColloquio: ['Racconti della decisione più difficile presa.', 'Come ha gestito un collaboratore non performante?'],
    profiloIdeale: 'Leader visionario con capacità decisionale, resilienza e carisma.',
    validatoManualeV2: false,
  },
  'HR Manager': {
    requisiti: [
      { trait: 'HRM', soglia: 50, tipo: 'min', isCritical: true, label: 'HR Management ≥ 50' },
      { trait: 'COM', soglia: 45, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 45' },
      { trait: 'PRO', soglia: 35, tipo: 'min', isCritical: true, label: 'Proattività ≥ 35' },
      { trait: 'LDR', soglia: 35, tipo: 'min', isCritical: false, label: 'Leadership ≥ 35' },
    ],
    disqualifierDescriptions: ['HRM<30: capacità HR insufficienti', 'COM<25: troppo poco empatico'],
    domandeColloquio: ['Come ha gestito un conflitto grave tra colleghi?', 'Racconti di un talento che ha sviluppato.'],
    profiloIdeale: 'Custode delle persone. Bilancia esigenze aziendali e benessere.',
    validatoManualeV2: false,
  },
  'Marketing Manager': {
    requisiti: [
      { trait: 'ORG', soglia: 30, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 30' },
      { trait: 'AUT', soglia: 25, tipo: 'min', isCritical: true, label: 'Automotivazione ≥ 25' },
      { trait: 'VEN', soglia: 25, tipo: 'min', isCritical: false, label: 'Attitudine Vendita ≥ 25' },
      { trait: 'ESP', soglia: 15, tipo: 'min', isCritical: false, label: 'Espansività ≥ 15' },
    ],
    disqualifierDescriptions: ['RC>55: troppo rigido per ruolo creativo'],
    domandeColloquio: ['Racconti della campagna di cui va più fiero.', 'Come misura il successo marketing?'],
    profiloIdeale: 'Creativo strategico con visione e orientamento ai risultati.',
    validatoManualeV2: true,
  },
  'Responsabile Produzione/Logistica': {
    requisiti: [
      { trait: 'ORG', soglia: 44, tipo: 'min', isCritical: true, label: 'Organizzazione > 44' },
      { trait: 'GP', soglia: 21, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 21' },
      { trait: 'ADS', soglia: 44, tipo: 'min', isCritical: true, label: 'Autodisciplina > 44' },
      { trait: 'DET', soglia: 30, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 30' },
      { trait: 'PRO', soglia: 10, tipo: 'min', isCritical: false, label: 'Proattività ≥ 10' },
      { trait: 'RC', soglia: -19, tipo: 'min', isCritical: true, label: 'RC > -19' },
      { trait: 'PRI', soglia: 39, tipo: 'min', isCritical: false, label: 'Principi ≥ 39' },
    ],
    disqualifierDescriptions: ['ORG<35: non gestisce flussi complessi', 'RC<=-19: dispersivo'],
    domandeColloquio: ['Come gestisce un imprevisto in produzione?', 'Come motiva un team operativo sotto pressione?'],
    profiloIdeale: 'Orchestratore dei flussi. Prevede problemi, risolve in tempo reale.',
    validatoManualeV2: true,
  },
  'Responsabile Tecnico': {
    requisiti: [
      { trait: 'ORG', soglia: 40, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 40' },
      { trait: 'ADS', soglia: 45, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 45' },
      { trait: 'DET', soglia: 35, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 35' },
      { trait: 'RC', soglia: 50, tipo: 'max', isCritical: false, label: 'RC ≤ 50' },
    ],
    disqualifierDescriptions: ['ADS<30: autodisciplina insufficiente', 'ORG<25: disorganizzato'],
    domandeColloquio: ['Racconti del problema tecnico più complesso risolto.', 'Come gestisce deadline aggressive?'],
    profiloIdeale: 'Risolutore di problemi. Trova soddisfazione nel far funzionare le cose.',
    validatoManualeV2: false,
  },
  'Buyer/Acquisti': {
    requisiti: [
      { trait: 'DET', soglia: 45, tipo: 'min', isCritical: true, label: 'Determinazione ≥ 45' },
      { trait: 'ORG', soglia: 40, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 40' },
      { trait: 'FIN', soglia: 35, tipo: 'min', isCritical: true, label: 'Finanze ≥ 35' },
      { trait: 'VEN', soglia: 30, tipo: 'min', isCritical: false, label: 'Attitudine Negoziale ≥ 30' },
    ],
    disqualifierDescriptions: ['DET<25: non negozia con fornitori', 'FIN<15: nessun orientamento al valore'],
    domandeColloquio: ['Racconti della negoziazione più dura.', 'Come bilancia qualità e risparmio?'],
    profiloIdeale: 'Guardiano del valore. Ottimizza costi, negozia duramente.',
    validatoManualeV2: false,
  },
  'Direttore Commerciale': {
    requisiti: [
      { trait: 'LDR', soglia: 50, tipo: 'min', isCritical: true, label: 'Leadership ≥ 50' },
      { trait: 'VEN', soglia: 45, tipo: 'min', isCritical: true, label: 'Attitudine Vendita ≥ 45' },
      { trait: 'DET', soglia: 50, tipo: 'min', isCritical: true, label: 'Determinazione ≥ 50' },
      { trait: 'HRM', soglia: 35, tipo: 'min', isCritical: true, label: 'HR Management ≥ 35' },
      { trait: 'AUT', soglia: 45, tipo: 'min', isCritical: false, label: 'Automotivazione ≥ 45' },
      { trait: 'FIN', soglia: 40, tipo: 'min', isCritical: false, label: 'Finanze ≥ 40' },
    ],
    disqualifierDescriptions: ['LDR<35: non dirige team', 'VEN<30: non può guidare venditori', 'HRM<20: non motiva la rete'],
    domandeColloquio: ['Come costruisce e motiva una rete vendita?', 'Come gestisce un venditore non performante?'],
    profiloIdeale: 'Leader commerciale. Vende, ma soprattutto fa vendere gli altri.',
    validatoManualeV2: false,
  },
  'HR Recruiter': {
    requisiti: [
      { trait: 'COM', soglia: 20, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 20' },
      { trait: 'ESP', soglia: 20, tipo: 'min', isCritical: true, label: 'Espansività ≥ 20' },
      { trait: 'PRO', soglia: 20, tipo: 'min', isCritical: true, label: 'Proattività ≥ 20' },
      { trait: 'DET', soglia: 30, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 30' },
      { trait: 'ORG', soglia: 30, tipo: 'min', isCritical: false, label: 'Organizzazione ≥ 30' },
      { trait: 'VEN', soglia: 20, tipo: 'min', isCritical: false, label: 'Attitudine Vendita ≥ 20' },
    ],
    disqualifierDescriptions: ['COM<10: non legge le persone', 'PRO<10: troppo passivo'],
    domandeColloquio: ['Come identifica un talento nascosto?', 'Racconti di un\'assunzione di cui va fiero.'],
    profiloIdeale: 'Cacciatore di talenti. Empatico, proattivo, vede oltre il CV.',
    validatoManualeV2: true,
  },
  'Impiegato Amministrativo': {
    requisiti: [
      { trait: 'ORG', soglia: 30, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 30' },
      { trait: 'ADS', soglia: 30, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 30' },
      { trait: 'PRO', soglia: 10, tipo: 'min', isCritical: false, label: 'Proattività ≥ 10' },
      { trait: 'RC', soglia: -19, tipo: 'min', isCritical: true, label: 'RC > -19' },
      { trait: 'PRI', soglia: 30, tipo: 'min', isCritical: false, label: 'Principi ≥ 30' },
    ],
    disqualifierDescriptions: ['ORG<20: disorganizzato', 'ADS<20: insufficiente per lavoro ripetitivo'],
    domandeColloquio: ['Come gestisce le priorità quando tutto sembra urgente?', 'Come mantiene la concentrazione nel lavoro ripetitivo?'],
    profiloIdeale: 'Affidabile, ordinato, costante. Il pilastro dell\'ufficio.',
    validatoManualeV2: true,
  },
  'Project Manager': {
    requisiti: [
      { trait: 'ORG', soglia: 45, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 45' },
      { trait: 'GP', soglia: 35, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 35' },
      { trait: 'LDR', soglia: 35, tipo: 'min', isCritical: true, label: 'Leadership ≥ 35' },
      { trait: 'DET', soglia: 40, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 40' },
      { trait: 'COM', soglia: 20, tipo: 'min', isCritical: false, label: 'Comprensione ≥ 20' },
    ],
    disqualifierDescriptions: ['ORG<30: non gestisce progetti complessi', 'GP<20: non regge deadline'],
    domandeColloquio: ['Come gestisce un progetto in ritardo?', 'Racconti del progetto più complesso che ha guidato.'],
    profiloIdeale: 'Orchestratore di risorse. Pianifica, esegue, controlla.',
    validatoManualeV2: false,
  },
  'Imprenditore/Titolare': {
    requisiti: [
      { trait: 'LDR', soglia: 45, tipo: 'min', isCritical: true, label: 'Leadership ≥ 45' },
      { trait: 'PRO', soglia: 40, tipo: 'min', isCritical: true, label: 'Proattività ≥ 40' },
      { trait: 'GP', soglia: 40, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 40' },
      { trait: 'AUT', soglia: 40, tipo: 'min', isCritical: true, label: 'Automotivazione ≥ 40' },
      { trait: 'DET', soglia: 35, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 35' },
      { trait: 'VEN', soglia: 20, tipo: 'min', isCritical: false, label: 'Attitudine Vendita ≥ 20' },
    ],
    disqualifierDescriptions: ['LDR<30: leadership insufficiente', 'GP<25: non regge pressione imprenditoriale'],
    domandeColloquio: ['Qual è la decisione più rischiosa presa?', 'Come costruisce e motiva il suo team?'],
    profiloIdeale: 'Visionario pragmatico. Decide, rischia, costruisce.',
    validatoManualeV2: false,
  },
  'Consulente Strategico': {
    requisiti: [
      { trait: 'ORG', soglia: 45, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 45' },
      { trait: 'AUT', soglia: 40, tipo: 'min', isCritical: true, label: 'Automotivazione ≥ 40' },
      { trait: 'PRO', soglia: 35, tipo: 'min', isCritical: true, label: 'Proattività ≥ 35' },
      { trait: 'COM', soglia: 30, tipo: 'min', isCritical: false, label: 'Comprensione ≥ 30' },
      { trait: 'GP', soglia: 30, tipo: 'min', isCritical: false, label: 'Gestione Pressioni ≥ 30' },
    ],
    disqualifierDescriptions: ['ORG<30: insufficiente per analisi complesse', 'RC>60: troppo rigido'],
    domandeColloquio: ['Racconti di un problema complesso risolto con approccio innovativo.', 'Come presenta raccomandazioni scomode?'],
    profiloIdeale: 'Pensatore analitico autonomo. Vede pattern, propone soluzioni.',
    validatoManualeV2: false,
  },
  'Team Leader/Coordinatore': {
    requisiti: [
      { trait: 'LDR', soglia: 35, tipo: 'min', isCritical: true, label: 'Leadership ≥ 35' },
      { trait: 'COM', soglia: 25, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 25' },
      { trait: 'HRM', soglia: 30, tipo: 'min', isCritical: true, label: 'HR Management ≥ 30' },
      { trait: 'PRO', soglia: 30, tipo: 'min', isCritical: false, label: 'Proattività ≥ 30' },
      { trait: 'GP', soglia: 30, tipo: 'min', isCritical: false, label: 'Gestione Pressioni ≥ 30' },
    ],
    disqualifierDescriptions: ['LDR<20: leadership insufficiente', 'HRM<15: non gestisce dinamiche gruppo'],
    domandeColloquio: ['Come motiva un collega in difficoltà?', 'Come bilancia esigenze team e obiettivi aziendali?'],
    profiloIdeale: 'Leader di prossimità. Guida con l\'esempio, ascolta.',
    validatoManualeV2: false,
  },
  'Formatore/Coach': {
    requisiti: [
      { trait: 'COM', soglia: 35, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 35' },
      { trait: 'HRM', soglia: 35, tipo: 'min', isCritical: true, label: 'HR Management ≥ 35' },
      { trait: 'PRO', soglia: 30, tipo: 'min', isCritical: true, label: 'Proattività ≥ 30' },
      { trait: 'ESP', soglia: 25, tipo: 'min', isCritical: false, label: 'Espansività ≥ 25' },
      { trait: 'DET', soglia: 25, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 25' },
    ],
    disqualifierDescriptions: ['COM<20: non capisce bisogni formativi', 'ESP<10: non comunica'],
    domandeColloquio: ['Come adatta il suo stile formativo?', 'Come gestisce un partecipante resistente?'],
    profiloIdeale: 'Trasmettitore di sapere. Empatico, paziente, ispira crescita.',
    validatoManualeV2: false,
  },
  'Responsabile Qualità/Compliance': {
    requisiti: [
      { trait: 'ORG', soglia: 50, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 50' },
      { trait: 'ADS', soglia: 45, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 45' },
      { trait: 'PRI', soglia: 50, tipo: 'min', isCritical: true, label: 'Principi ≥ 50' },
      { trait: 'RC', soglia: 10, tipo: 'min', isCritical: false, label: 'RC ≥ 10' },
      { trait: 'GP', soglia: 25, tipo: 'min', isCritical: false, label: 'Gestione Pressioni ≥ 25' },
    ],
    disqualifierDescriptions: ['ORG<35: non gestisce standard', 'PRI<35: non garantisce conformità'],
    domandeColloquio: ['Come gestisce resistenza al cambiamento?', 'Racconti di una non-conformità grave.'],
    profiloIdeale: 'Guardiano degli standard. Rigoroso, non scende a compromessi.',
    validatoManualeV2: false,
  },
  'Controller di Gestione': {
    requisiti: [
      { trait: 'ORG', soglia: 50, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 50' },
      { trait: 'ADS', soglia: 45, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 45' },
      { trait: 'FIN', soglia: 50, tipo: 'min', isCritical: true, label: 'Finanze ≥ 50' },
      { trait: 'DET', soglia: 35, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 35' },
    ],
    disqualifierDescriptions: ['ORG<35: non gestisce analisi complesse', 'FIN<30: nessun orientamento finanziario'],
    domandeColloquio: ['Come costruisce un report di budget?', 'Come comunica scostamenti critici alla direzione?'],
    profiloIdeale: 'Analista numerico. Preciso, rigoroso, orientato ai dati.',
    validatoManualeV2: false,
  },
  'Data Analyst': {
    requisiti: [
      { trait: 'ORG', soglia: 45, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 45' },
      { trait: 'ADS', soglia: 40, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 40' },
      { trait: 'AUT', soglia: 35, tipo: 'min', isCritical: false, label: 'Automotivazione ≥ 35' },
      { trait: 'DET', soglia: 30, tipo: 'min', isCritical: false, label: 'Determinazione ≥ 30' },
    ],
    disqualifierDescriptions: ['ORG<30: insufficiente per analisi dati', 'ADS<25: troppo indisciplinato'],
    domandeColloquio: ['Come affronta un dataset disordinato?', 'Come comunica insight ai non tecnici?'],
    profiloIdeale: 'Cercatore di verità nei dati. Preciso, curioso, autonomo.',
    validatoManualeV2: false,
  },
  'Account Manager': {
    requisiti: [
      { trait: 'COM', soglia: 30, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 30' },
      { trait: 'PRO', soglia: 30, tipo: 'min', isCritical: true, label: 'Proattività ≥ 30' },
      { trait: 'VEN', soglia: 25, tipo: 'min', isCritical: true, label: 'Attitudine Vendita ≥ 25' },
      { trait: 'ORG', soglia: 30, tipo: 'min', isCritical: false, label: 'Organizzazione ≥ 30' },
      { trait: 'ESP', soglia: 20, tipo: 'min', isCritical: false, label: 'Espansività ≥ 20' },
    ],
    disqualifierDescriptions: ['COM<15: non capisce i clienti', 'VEN<15: senza orientamento commerciale'],
    domandeColloquio: ['Come fidelizza i clienti strategici?', 'Come gestisce un cliente che vuole rescindere?'],
    profiloIdeale: 'Relationship builder. Empatico, proattivo, orientato al risultato.',
    validatoManualeV2: false,
  },
  'Office Manager': {
    requisiti: [
      { trait: 'ORG', soglia: 45, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 45' },
      { trait: 'ADS', soglia: 40, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 40' },
      { trait: 'COM', soglia: 25, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 25' },
      { trait: 'HRM', soglia: 25, tipo: 'min', isCritical: false, label: 'HR Management ≥ 25' },
      { trait: 'PRO', soglia: 20, tipo: 'min', isCritical: false, label: 'Proattività ≥ 20' },
    ],
    disqualifierDescriptions: ['ORG<30: disorganizzato', 'ADS<25: indisciplinato'],
    domandeColloquio: ['Come organizza le priorità dell\'ufficio?', 'Come gestisce richieste da diversi reparti?'],
    profiloIdeale: 'Punto di riferimento dell\'ufficio. Organizza, coordina, risolve.',
    validatoManualeV2: false,
  },
  'Responsabile IT/Sistemi': {
    requisiti: [
      { trait: 'ORG', soglia: 45, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 45' },
      { trait: 'ADS', soglia: 40, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 40' },
      { trait: 'GP', soglia: 30, tipo: 'min', isCritical: true, label: 'Gestione Pressioni ≥ 30' },
      { trait: 'PRO', soglia: 30, tipo: 'min', isCritical: false, label: 'Proattività ≥ 30' },
      { trait: 'AUT', soglia: 30, tipo: 'min', isCritical: false, label: 'Automotivazione ≥ 30' },
    ],
    disqualifierDescriptions: ['ORG<30: non gestisce infrastruttura', 'ADS<25: indisciplinato'],
    domandeColloquio: ['Racconti di un\'emergenza IT critica.', 'Come pianifica la manutenzione preventiva?'],
    profiloIdeale: 'Problem solver tecnico. Gestisce sistemi, previene guasti.',
    validatoManualeV2: false,
  },
  'Assistente di Direzione': {
    requisiti: [
      { trait: 'ORG', soglia: 45, tipo: 'min', isCritical: true, label: 'Organizzazione ≥ 45' },
      { trait: 'ADS', soglia: 40, tipo: 'min', isCritical: true, label: 'Autodisciplina ≥ 40' },
      { trait: 'COM', soglia: 20, tipo: 'min', isCritical: true, label: 'Comprensione ≥ 20' },
      { trait: 'PRO', soglia: 25, tipo: 'min', isCritical: false, label: 'Proattività ≥ 25' },
      { trait: 'GP', soglia: 25, tipo: 'min', isCritical: false, label: 'Gestione Pressioni ≥ 25' },
    ],
    disqualifierDescriptions: ['ORG<30: non gestisce agende complesse', 'COM<10: comprensione insufficiente'],
    domandeColloquio: ['Come gestisce le priorità del dirigente?', 'Come anticipa le esigenze del suo responsabile?'],
    profiloIdeale: 'Braccio destro affidabile. Anticipa, organizza, semplifica.',
    validatoManualeV2: false,
  },
};

// ============ MATCHING FUNCTIONS ============

function checkRequirement(req: TraitRequirement, traits: TraitScores): { ok: boolean; valore: number; gap: number } {
  const valore = traits[req.trait] ?? 0;
  const ok = req.tipo === 'min' ? valore >= req.soglia : valore <= req.soglia;
  const gap = ok ? 0 : Math.abs(req.soglia - valore);
  return { ok, valore, gap };
}

function calculateRoleMatchV5(ruolo: string, traits: TraitScores): {
  compatibilitaPct: number;
  verdict: FitVerdictV5;
  motivazione: string;
  requisitiVerificati: { label: string; valore: number; soglia: number; ok: boolean }[];
  requisitiMancanti: { label: string; valore: number; soglia: number; gap: number }[];
} {
  const profile = ROLE_PROFILES[ruolo];
  if (!profile) {
    return { compatibilitaPct: 50, verdict: 'DA_VALUTARE', motivazione: 'Ruolo non configurato nel sistema V5.', requisitiVerificati: [], requisitiMancanti: [] };
  }

  const requisitiVerificati: { label: string; valore: number; soglia: number; ok: boolean }[] = [];
  const requisitiMancanti: { label: string; valore: number; soglia: number; gap: number }[] = [];

  for (const req of profile.requisiti) {
    const { ok, valore, gap } = checkRequirement(req, traits);
    requisitiVerificati.push({ label: req.label, valore, soglia: req.soglia, ok });
    if (!ok) requisitiMancanti.push({ label: req.label, valore, soglia: req.soglia, gap });
  }

  const criticalReqs = profile.requisiti.filter(r => r.isCritical);
  const criticalOk = criticalReqs.filter(r => checkRequirement(r, traits).ok).length;
  const criticalMissing = criticalReqs.length - criticalOk;

  let pct = criticalReqs.length > 0 ? Math.round((criticalOk / criticalReqs.length) * 80) : 80;
  const nonCritical = profile.requisiti.filter(r => !r.isCritical);
  const nonCriticalOk = nonCritical.filter(r => checkRequirement(r, traits).ok).length;
  if (nonCritical.length > 0) pct += Math.round((nonCriticalOk / nonCritical.length) * 20);
  pct = Math.max(0, Math.min(100, pct));

  let verdict: FitVerdictV5;
  let motivazione: string;
  if (criticalMissing >= 2) {
    verdict = 'NON_IDONEO';
    motivazione = `${criticalMissing} requisiti critici non soddisfatti.`;
  } else if (criticalMissing === 1) {
    verdict = 'DA_VALUTARE';
    motivazione = `1 requisito critico mancante. Approfondire in colloquio.`;
  } else if (requisitiMancanti.length > 0) {
    verdict = 'IDONEO_CON_RISERVA';
    motivazione = `Requisiti critici OK, ma ${requisitiMancanti.length} requisiti secondari mancanti.`;
  } else {
    verdict = 'IDONEO';
    motivazione = `Tutti i requisiti soddisfatti. Profilo eccellente per ${ruolo}.`;
  }

  return { compatibilitaPct: pct, verdict, motivazione, requisitiVerificati, requisitiMancanti };
}

function calculateAllRolesV5(traits: TraitScores): { ruolo: string; compatibilita: number; verdict: FitVerdictV5 }[] {
  return Object.keys(ROLE_PROFILES).map(ruolo => {
    const m = calculateRoleMatchV5(ruolo, traits);
    return { ruolo, compatibilita: m.compatibilitaPct, verdict: m.verdict };
  }).sort((a, b) => b.compatibilita - a.compatibilita);
}

// ============ CROSS-PATTERN DETECTION V5 ============

function detectPatternsV5(traits: TraitScores): string[] {
  const patterns: string[] = [];
  const { ORG, AUT, GP, ADS, DET, VEN, HRM, LDR, PRO, COM, ESP, RC, FIN, SUC, PRI } = traits;

  if (AUT > 40 && VEN < 0) patterns.push(`🔴 MOTORE A VUOTO: Alta Automotivazione (AUT ${AUT}) + Bassa Attitudine Vendita (VEN ${VEN}). Motivato ma senza orientamento commerciale.`);
  if (GP < -20) patterns.push(`🔴 PSP CRITICA: Gestione Pressioni ${GP}. Non regge la pressione lavorativa.`);
  if (GP < 0 && GP >= -20) patterns.push(`🟠 PSP ATTIVA: Gestione Pressioni ${GP}. Inserimento graduale necessario.`);
  if (ORG > 50 && ADS < 10) patterns.push(`🟠 VISIONARIO DISORGANIZZATO: Gap ORG-ADS (${ORG} vs ${ADS}).`);
  if (RC > 55 && GP < 10) patterns.push(`🔴 RIGIDITÀ FRAGILE: RC ${RC} + GP ${GP}. Rigido e fragile sotto pressione.`);
  if (LDR > 50 && COM < -10) patterns.push(`🟠 LEADER ISOLATO: LDR ${LDR} + COM ${COM}. Guida senza ascoltare.`);
  if (DET > 50 && PRI < -10) patterns.push(`🔴 DETERMINATO SENZA ETICA: DET ${DET} + PRI ${PRI}. Rischio comportamentale.`);
  if (AUT > 50 && SUC > 50 && GP < 0) patterns.push(`🟠 WORKAHOLIC A RISCHIO: Alta motivazione e ambizione ma GP ${GP}.`);
  if (RC > 45) patterns.push(`⚠️ RC ALTA (${RC}): Zona rigidità. Possibile resistenza al cambiamento.`);
  if (RC < -29) patterns.push(`⚠️ RC BASSA (${RC}): Zona impulsività. Rischio dispersione.`);

  return patterns;
}

// ============ TRAIT INTERPRETATION ============

function getTraitBand(val: number): string {
  if (val <= -60) return '⚠️ CRITICO';
  if (val <= -20) return '⚠️ Sotto media';
  if (val <= 20) return '✓ Nella media';
  if (val <= 50) return '✓ Sopra media';
  return '★ Eccellenza';
}

// ============ MAIN HANDLER ============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidato_id } = await req.json();

    if (!candidato_id) {
      return new Response(
        JSON.stringify({ error: 'candidato_id è richiesto' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: 'LOVABLE_API_KEY non configurata' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Recupera dati candidato con profilo V5
    const { data: candidato, error: candError } = await supabase
      .from('candidati')
      .select('*, profili_candidato(*)')
      .eq('id', candidato_id)
      .single();

    if (candError || !candidato) {
      return new Response(
        JSON.stringify({ error: 'Candidato non trovato' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const profilo = candidato.profili_candidato;
    if (!profilo || !profilo.traits_v5) {
      return new Response(
        JSON.stringify({ error: 'Profilo V5 non disponibile. Il test deve essere completato con assessment V5.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const traitsV5: TraitScores = profilo.traits_v5 as TraitScores;
    const eta = candidato.eta;
    const funzioneDB = candidato.funzione || 'Non specificata';
    const ruoloV5 = FUNZIONE_TO_RUOLO[funzioneDB] || funzioneDB;
    const nome = `${candidato.nome} ${candidato.cognome}`;
    const sesso = candidato.sesso;
    const ruoloAttuale = candidato.ruolo_attuale;

    // V5 matching
    const roleMatch = calculateRoleMatchV5(ruoloV5, traitsV5);
    const allRolesMatch = calculateAllRolesV5(traitsV5);
    const ruoloIdeale = allRolesMatch[0];

    // Cross-patterns V5
    const patterns = detectPatternsV5(traitsV5);

    // Syndromes from profile
    const syndromes = profilo.syndromes_detected || [];

    // Build requisiti text
    const requisitiText = roleMatch.requisitiVerificati.map(r =>
      `- ${r.label}: Valore ${r.valore} → ${r.ok ? '✅ OK' : '❌ CRITICITÀ'}`
    ).join('\n');

    const requisitiMancantiText = roleMatch.requisitiMancanti.length > 0
      ? roleMatch.requisitiMancanti.map(r => `- ${r.label}: Valore ${r.valore} (richiesto ${r.soglia}, gap ${r.gap})`).join('\n')
      : 'Nessun requisito mancante';

    // Build trait table
    const traitEntries = Object.entries(TRAIT_LABELS);
    const traitTable = traitEntries.map(([code, label]) => {
      const val = traitsV5[code] ?? 0;
      return `| ${code} - ${label} | ${val} | ${getTraitBand(val)} |`;
    }).join('\n');

    // Macro-aree
    const esserePct = profilo.essere_pct ?? 0;
    const farePct = profilo.fare_pct ?? 0;
    const averePct = profilo.avere_pct ?? 0;

    // Profile info
    const profiloTipoV5 = profilo.profilo_tipo_v5 || 'N/A';
    const reliabilityIndex = profilo.reliability_index || 'N/A';

    // Domande colloquio del ruolo
    const roleProfile = ROLE_PROFILES[ruoloV5];
    const domandeRuolo = roleProfile?.domandeColloquio || [];

    // ============ PROMPT V5 ============
    const systemPrompt = `Sei un Senior HR Expert specializzato in psicologia del lavoro secondo il Manuale Talent Profiler V5.

## SISTEMA DI TRATTI V5 (scala -100/+100, 0=media)

### MACRO-AREA ESSERE (Concentrazione sugli obiettivi)
- **ORG** (Organizzazione): capacità di pianificare e strutturare il lavoro
- **AUT** (Automotivazione): capacità di auto-attivarsi senza stimoli esterni
- **GP** (Gestione Pressioni): resilienza sotto stress e pressione lavorativa. GP<0 = PSP (Punto Sotto Pressione critico)

### MACRO-AREA FARE (Azioni concrete)
- **ADS** (Autodisciplina): costanza, rigore, rispetto delle regole
- **DET** (Determinazione): tenacia nel perseguire obiettivi
- **VEN** (Attitudine Vendita): orientamento alla vendita e persuasione
- **HRM** (HR Management): capacità di gestire e sviluppare persone

### MACRO-AREA AVERE (Relazioni)
- **LDR** (Leadership Naturale): capacità di guidare e ispirare
- **PRO** (Proattività): iniziativa, anticipazione, propositività
- **COM** (Comprensione): empatia, ascolto, comprensione degli altri
- **ESP** (Espansività): socievolezza, apertura, comunicazione

### INDICATORI
- **RC** (Resistenza al Cambiamento): 20-45 zona ottimale. >45=rigidità, <-29=impulsività
- **FIN** (Finanze): orientamento al denaro e risultati economici
- **SUC** (Successo): ambizione e desiderio di realizzazione
- **PRI** (Principi): etica, valori morali, integrità

## 4 LIVELLI DI VERDETTO
- **IDONEO**: Tutti i requisiti soddisfatti
- **IDONEO_CON_RISERVA**: Requisiti critici OK, aree di attenzione
- **DA_VALUTARE**: 1 requisito critico mancante
- **NON_IDONEO**: 2+ requisiti critici mancanti o disqualifier attivi

## OUTPUT JSON RICHIESTO
{
  "profilo_sintetico": "Descrizione DETTAGLIATA del candidato basata sui 15 tratti V5 in 4-6 frasi.",
  "punti_forza": ["5 punti specifici con riferimento ai tratti V5"],
  "punti_debolezza": ["5 punti specifici con impatto concreto"],
  "rischi_operativi": "Analisi APPROFONDITA dei rischi (min 100 parole)",
  "fit_score": numero 0-100,
  "fit_verdict": "${roleMatch.verdict}",
  "fit_motivo": "Spiegazione dettagliata del verdetto basata sui tratti V5 in 2-3 frasi",
  "matching_ruolo_richiesto": {
    "ruolo": "${ruoloV5}",
    "compatibilita_pct": ${roleMatch.compatibilitaPct},
    "requisiti_verificati": ${JSON.stringify(roleMatch.requisitiVerificati)},
    "requisiti_mancanti": ${JSON.stringify(roleMatch.requisitiMancanti)},
    "verdict": "${roleMatch.verdict}"
  },
  "compatibilita_tutti_ruoli": ${JSON.stringify(allRolesMatch.slice(0, 10))},
  "ruolo_ideale": "${ruoloIdeale?.ruolo || ruoloV5}",
  "pattern_rilevati": ${JSON.stringify(patterns)},
  "domande_colloquio": [
    { "area": "Nome area critica", "domanda": "Domanda SPECIFICA per il colloquio basata sul ruolo ${ruoloV5}" }
  ],
  "raccomandazione": {
    "decisione": "ASSUMERE" | "VALUTARE" | "SCARTARE",
    "motivo_principale": "Motivazione in 1-2 frasi",
    "rischio_aziendale": "Rischio principale",
    "tempo_onboarding": "es: 2-4 settimane",
    "probabilita_successo_12m": numero 0-100
  }
}

## REGOLE CRITICHE
1. MAI verdetti generici tipo "Profilo in fase di analisi"
2. SEMPRE verificare pattern PSP (GP<0) per qualsiasi ruolo
3. Le domande colloquio devono essere SPECIFICHE per ${ruoloV5}
4. Il fit_verdict DEVE corrispondere a "${roleMatch.verdict}" (calcolato algoritmicamente)
5. Usa i codici tratto V5 (ORG, AUT, GP, ADS, DET, VEN, HRM, LDR, PRO, COM, ESP, RC, FIN, SUC, PRI) - NON le vecchie scale V4`;

    const userPrompt = `## CANDIDATO: ${nome}
Età: ${eta || 'N/S'} | Sesso: ${sesso || 'N/S'}
Ruolo attuale: ${ruoloAttuale || 'N/S'}
**FUNZIONE RICHIESTA: ${funzioneDB}** → Ruolo V5: **${ruoloV5}**

## PROFILO TIPO V5: ${profiloTipoV5}
## ATTENDIBILITÀ: ${reliabilityIndex}

## TRATTI V5 (scala -100/+100, 0=media)
| Tratto | Valore | Interpretazione |
|--------|--------|-----------------|
${traitTable}

## MACRO-AREE
- ESSERE (Obiettivi): ${esserePct.toFixed(1)}%
- FARE (Azioni): ${farePct.toFixed(1)}%
- AVERE (Relazioni): ${averePct.toFixed(1)}%

## VERIFICA REQUISITI RUOLO "${ruoloV5}"
${requisitiText}

### REQUISITI MANCANTI (${roleMatch.requisitiMancanti.length})
${requisitiMancantiText}

## VERDETTO AUTOMATICO V5: **${roleMatch.verdict}**
Motivazione: ${roleMatch.motivazione}

## PATTERN V5 RILEVATI
${patterns.length > 0 ? patterns.join('\n') : '✓ Nessun pattern critico'}

## SINDROMI RILEVATE
${syndromes.length > 0 ? (syndromes as Array<{code: string; severity: string; label?: string}>).map((s) => `- [${s.severity}] ${s.code}: ${s.label || ''}`).join('\n') : '✓ Nessuna sindrome attiva'}

## INDICATORI DAL PROFILO
- Punti di forza: ${profilo.strength_points?.join(', ') || 'Nessuno'}
- Punti critici: ${profilo.out_points?.join(', ') || 'Nessuno'}
- Leadership: ${profilo.leadership_pct?.toFixed(1) || 'N/A'}%
- Maturità: ${profilo.maturita_pct?.toFixed(1) || 'N/A'}%
- Potenziale: ${profilo.potenziale_pct?.toFixed(1) || 'N/A'}%

## TOP 10 RUOLI COMPATIBILI
${allRolesMatch.slice(0, 10).map((r, i) => `${i + 1}. ${r.ruolo}: ${r.compatibilita}% (${r.verdict})`).join('\n')}

${domandeRuolo.length > 0 ? `## DOMANDE COLLOQUIO SUGGERITE PER ${ruoloV5}\n${domandeRuolo.map((d, i) => `${i + 1}. ${d}`).join('\n')}` : ''}

Genera l'analisi JSON completa secondo il sistema V5. Le domande colloquio devono essere SPECIFICHE per ${ruoloV5}.`;

    // Chiama AI Gateway
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit superato. Riprova tra qualche secondo.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Crediti AI esauriti. Contatta il supporto.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const errorText = await aiResponse.text();
      console.error('AI Gateway error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'Errore nella generazione dell\'analisi AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      return new Response(JSON.stringify({ error: 'Risposta AI vuota' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Parse JSON
    let analisi;
    try {
      const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analisi = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError, content);
      return new Response(JSON.stringify({ error: 'Errore nel parsing della risposta AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Salva nel database con dati V5
    const { data: savedAnalisi, error: saveError } = await supabase
      .from('analisi_candidato')
      .upsert({
        candidato_id,
        profilo_sintetico: analisi.profilo_sintetico,
        punti_forza: analisi.punti_forza,
        punti_debolezza: analisi.punti_debolezza,
        rischi_operativi: analisi.rischi_operativi,
        fit_score: analisi.fit_score,
        fit_verdict: roleMatch.verdict,
        fit_motivo: analisi.fit_motivo,
        raccomandazione: {
          ...analisi.raccomandazione,
          domande_colloquio: analisi.domande_colloquio,
          matching_ruolo_richiesto: {
            ruolo: ruoloV5,
            funzione_originale: funzioneDB,
            requisiti: roleMatch.requisitiVerificati,
            requisiti_mancanti: roleMatch.requisitiMancanti,
            compatibilita_pct: roleMatch.compatibilitaPct,
            verdict: roleMatch.verdict,
            validato_manuale: roleProfile?.validatoManualeV2 ?? false,
          },
          compatibilita_tutti_ruoli: allRolesMatch.slice(0, 10),
          ruolo_ideale: ruoloIdeale?.ruolo,
          pattern_rilevati: patterns,
          syndromes_detected: syndromes,
          profilo_tipo_v5: profiloTipoV5,
          macro_aree: { essere: esserePct, fare: farePct, avere: averePct },
        },
        generated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'candidato_id',
      })
      .select()
      .single();

    if (saveError) {
      console.error('Error saving analysis:', saveError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        analisi: savedAnalisi || analisi,
        message: 'Analisi generata con successo secondo il sistema V5'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Analyze candidate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Errore sconosciuto' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
