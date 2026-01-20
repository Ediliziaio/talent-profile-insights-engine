/**
 * Sistema di Matching Automatico per Ruolo - Manuale Talent Profiler V5
 * 
 * CORREZIONI FONDAMENTALI:
 * - STILE DI VITA (SV) = Situazione personale ATTUALE (problemi/serenità in famiglia, salute, economia)
 *   Basso = momento buio, da supportare sulla persona prima che sul lavoro
 * - SPAZIO VITALE (SP) = AMBIZIONE, obiettivi personali materiali/economici
 *   Basso = nessun obiettivo, incompatibile con vendita
 * 
 * COMBINAZIONE CHIAVE:
 * - Alta Motivazione + Basso Spazio Vitale = "Motore che gira a vuoto"
 *   Carico ma senza meta, PERICOLOSO per vendita perché sembra motivato ma non produce
 */

import { ScalaCode, SCALE_LABELS } from '@/types/database';

// 4 livelli di verdetto (NO default generici!)
export type FitVerdict = 'NON_IDONEO' | 'DA_VALUTARE' | 'IDONEO_CON_RISERVA' | 'IDONEO';

export interface RoleRequirement {
  scala: ScalaCode;
  soglia: number;
  tipo: 'min' | 'max' | 'range';
  rangeMax?: number;
  isCritical: boolean; // Se fallisce = criticità
  label: string;
}

export interface RoleProfile {
  id: string;
  nome: string;
  descrizione: string;
  requisiti: RoleRequirement[];
  attenzioni: RoleRequirement[]; // Soglie di attenzione (warning, non blocking)
  profiloIdeale: string;
  chiE: string;
  cosaMotiva: string;
  cosaBlocca: string;
  comeGestirlo: string;
  cosaDare: string;
  cosaNonDare: string;
  comeFarloCrescere: string;
  erroriEvitare: string;
}

export interface RoleMatchResult {
  ruolo: string;
  compatibilitaPct: number;
  requisitiSoddisfatti: { label: string; valore: number; soglia: number; ok: boolean }[];
  requisitiMancanti: { label: string; valore: number; soglia: number; diff: number }[];
  areeAttenzione: { label: string; valore: number; motivo: string }[];
  criticita: number;
  attenzioni: number;
  verdict: FitVerdict;
  motivazione: string;
  domandeColloquio: string[];
  patternRilevati: string[];
}

export interface AllRolesCompatibility {
  ruoloRichiesto: RoleMatchResult;
  tuttiRuoli: { ruolo: string; compatibilita: number; verdict: FitVerdict }[];
  ruoloIdeale: { ruolo: string; compatibilita: number } | null;
}

// ============ REQUISITI PER OGNI RUOLO (dal Manuale V5) ============

export const ROLE_PROFILES: Record<string, RoleProfile> = {
  'Ufficio vendite': {
    id: 'vendite',
    nome: 'Ufficio Vendite',
    descrizione: 'Ruolo commerciale con contatto cliente, negoziazione e obiettivi di fatturato',
    requisiti: [
      { scala: 'SP', soglia: 130, tipo: 'min', isCritical: true, label: 'Ambizione (SP > 130)' },
      { scala: 'PA', soglia: 145, tipo: 'min', isCritical: true, label: 'Partecipazione (PA > 145)' },
      { scala: 'MO', soglia: 140, tipo: 'min', isCritical: true, label: 'Motivazione (MO > 140)' },
      { scala: 'CF', soglia: 130, tipo: 'min', isCritical: true, label: 'Capacità Fronteggiare (CF > 130)' },
      { scala: 'EC', soglia: 150, tipo: 'min', isCritical: true, label: 'Efficacia (EC > 150)' },
    ],
    attenzioni: [
      { scala: 'SC', soglia: 165, tipo: 'max', isCritical: false, label: 'Schematicità (SC < 165)' },
    ],
    profiloIdeale: 'Persona ambiziosa, relazionale, resiliente, che ama la sfida e sa chiudere',
    chiE: 'Cacciatore naturale che vive per la conquista. Ama le relazioni, la sfida, il riconoscimento economico.',
    cosaMotiva: 'Bonus legati ai risultati, sfide chiare, riconoscimento pubblico, autonomia.',
    cosaBlocca: 'Procedure rigide, back office eccessivo, obiettivi irraggiungibili, micromanagement.',
    comeGestirlo: 'Target ambiziosi ma raggiungibili, libertà di movimento, feedback sui risultati.',
    cosaDare: 'Portafoglio clienti sfidante, incentivi, auto aziendale, visibilità.',
    cosaNonDare: 'Compiti amministrativi, lavoro da scrivania, regole troppo strette.',
    comeFarloCrescere: 'Key Account, Team Lead commerciale, Business Development.',
    erroriEvitare: 'Limitare la sua autonomia, non celebrare i successi, assegnare clienti già saturi.',
  },

  'Amministrazione': {
    id: 'amministrazione',
    nome: 'Amministrazione',
    descrizione: 'Ruolo procedurale con gestione contabile, scadenze fiscali e precisione',
    requisiti: [
      { scala: 'EF', soglia: 145, tipo: 'min', isCritical: true, label: 'Efficienza (EF > 145)' },
      { scala: 'SC', soglia: 120, tipo: 'range', rangeMax: 170, isCritical: true, label: 'Schematicità (120 < SC < 170)' },
      { scala: 'QR', soglia: 125, tipo: 'min', isCritical: true, label: 'Qualità Responsabilità (QR > 125)' },
    ],
    attenzioni: [],
    profiloIdeale: 'Persona metodica, precisa, affidabile, che ama le procedure e i numeri',
    chiE: 'Guardiano dell\'ordine. Trova soddisfazione nella precisione, nella quadratura, nel rispetto delle scadenze.',
    cosaMotiva: 'Procedure chiare, riconoscimento della precisione, stabilità, ordine.',
    cosaBlocca: 'Caos, cambiamenti frequenti, pressione temporale estrema, eccezioni continue.',
    comeGestirlo: 'Procedure documentate, scadenze definite, ambiente ordinato.',
    cosaDare: 'Strumenti adeguati, formazione normativa, tempo per fare bene.',
    cosaNonDare: 'Urgenze continue, compiti commerciali, ambiguità.',
    comeFarloCrescere: 'Specializzazione (bilancio, controllo gestione), responsabilità di area.',
    erroriEvitare: 'Chiedere flessibilità estrema, non fornire procedure, ignorare il suo bisogno di ordine.',
  },

  'Direzione generale': {
    id: 'direzione',
    nome: 'Direzione Generale',
    descrizione: 'Ruolo direttivo con visione strategica, responsabilità decisionale e gestione risorse',
    requisiti: [
      { scala: 'QR', soglia: 160, tipo: 'min', isCritical: true, label: 'Qualità Responsabilità (QR > 160)' },
      { scala: 'CF', soglia: 150, tipo: 'min', isCritical: true, label: 'Capacità Fronteggiare (CF > 150)' },
      { scala: 'SP', soglia: 140, tipo: 'min', isCritical: true, label: 'Ambizione (SP > 140)' },
      { scala: 'PA', soglia: 140, tipo: 'min', isCritical: true, label: 'Partecipazione (PA > 140)' },
      { scala: 'EC', soglia: 150, tipo: 'min', isCritical: true, label: 'Efficacia (EC > 150)' },
    ],
    attenzioni: [
      { scala: 'SC', soglia: 160, tipo: 'max', isCritical: false, label: 'Schematicità (SC < 160)' },
    ],
    profiloIdeale: 'Leader visionario con capacità decisionale, resilienza e carisma',
    chiE: 'Capitano della nave. Assume la responsabilità totale, guida con visione, gestisce la complessità.',
    cosaMotiva: 'Potere decisionale, visione realizzabile, team da guidare, risultati aziendali.',
    cosaBlocca: 'Burocrazia eccessiva, azionisti invasivi, mancanza di autonomia strategica.',
    comeGestirlo: 'Fiducia, delega vera, obiettivi strategici chiari, supporto nelle crisi.',
    cosaDare: 'Autorità reale, team affidabile, risorse per innovare, riconoscimento del ruolo.',
    cosaNonDare: 'Micromanagement, deleghe vuote, responsabilità senza potere.',
    comeFarloCrescere: 'Board exposure, mentoring executive, gestione M&A.',
    erroriEvitare: 'Sottovalutare il suo ego, non riconoscere i risultati, limitare la sua visione.',
  },

  'Ufficio risorse umane': {
    id: 'risorse_umane',
    nome: 'Ufficio Risorse Umane',
    descrizione: 'Ruolo HR con gestione persone, sviluppo organizzativo e clima aziendale',
    requisiti: [
      { scala: 'PA', soglia: 140, tipo: 'min', isCritical: true, label: 'Partecipazione (PA > 140)' },
      { scala: 'CF', soglia: 130, tipo: 'min', isCritical: true, label: 'Capacità Fronteggiare (CF > 130)' },
      { scala: 'SV', soglia: 110, tipo: 'min', isCritical: true, label: 'Stile di Vita (SV > 110)' },
    ],
    attenzioni: [],
    profiloIdeale: 'Persona empatica, stabile, con ottime doti relazionali e gestione conflitti',
    chiE: 'Custode delle persone. Bilancia esigenze aziendali e benessere dipendenti.',
    cosaMotiva: 'Impatto sulle persone, sviluppo talenti, clima aziendale positivo.',
    cosaBlocca: 'Management che ignora le persone, budget risicati, conflitti irrisolti.',
    comeGestirlo: 'Autonomia nelle politiche HR, supporto della direzione, strumenti adeguati.',
    cosaDare: 'Voce in comitato direttivo, budget formazione, tempo per le persone.',
    cosaNonDare: 'Solo ruolo amministrativo, esclusione dalle decisioni strategiche.',
    comeFarloCrescere: 'HR Business Partner, OD (Organizational Development), ruoli internazionali.',
    erroriEvitare: 'Ridurlo a ruolo burocratico, ignorare i suoi alert sul clima.',
  },

  'Ufficio marketing': {
    id: 'marketing',
    nome: 'Ufficio Marketing',
    descrizione: 'Ruolo creativo/strategico con comunicazione, brand e analisi mercato',
    requisiti: [
      { scala: 'SP', soglia: 130, tipo: 'min', isCritical: true, label: 'Ambizione (SP > 130)' },
      { scala: 'PA', soglia: 130, tipo: 'min', isCritical: true, label: 'Partecipazione (PA > 130)' },
      { scala: 'EC', soglia: 130, tipo: 'min', isCritical: true, label: 'Efficacia (EC > 130)' },
    ],
    attenzioni: [
      { scala: 'SC', soglia: 160, tipo: 'max', isCritical: false, label: 'Schematicità (SC < 160)' },
    ],
    profiloIdeale: 'Creativo strategico con visione, capacità di execution e orientamento ai risultati',
    chiE: 'Costruttore di brand. Combina creatività e analisi, visione e pragmatismo.',
    cosaMotiva: 'Libertà creativa, progetti innovativi, visibilità dei risultati.',
    cosaBlocca: 'Burocrazia, decisioni lente, mancanza di budget, stakeholder troppo conservativi.',
    comeGestirlo: 'Brief chiari, deadline realistiche, autonomia creativa, feedback costruttivo.',
    cosaDare: 'Strumenti moderni, budget per sperimentare, accesso ai dati.',
    cosaNonDare: 'Micromanagement creativo, task ripetitivi, ruolo solo esecutivo.',
    comeFarloCrescere: 'Brand Manager, CMO path, digital transformation leader.',
    erroriEvitare: 'Soffocare la creatività, non misurare i risultati, isolare dal business.',
  },

  'Ufficio tecnico': {
    id: 'tecnico',
    nome: 'Ufficio Tecnico',
    descrizione: 'Ruolo tecnico/ingegneristico con progettazione, problem solving e competenze specialistiche',
    requisiti: [
      { scala: 'EC', soglia: 145, tipo: 'min', isCritical: true, label: 'Efficacia (EC > 145)' },
      { scala: 'EF', soglia: 130, tipo: 'min', isCritical: true, label: 'Efficienza (EF > 130)' },
    ],
    attenzioni: [],
    profiloIdeale: 'Tecnico competente, orientato al risultato, metodico nel problem solving',
    chiE: 'Risolutore di problemi. Trova soddisfazione nel far funzionare le cose, nel migliorare.',
    cosaMotiva: 'Sfide tecniche, autonomia operativa, aggiornamento competenze.',
    cosaBlocca: 'Burocrazia, mancanza di strumenti, gestione personale (se non richiesta).',
    comeGestirlo: 'Problemi da risolvere, tempo per concentrarsi, riconoscimento competenze.',
    cosaDare: 'Formazione tecnica, strumenti adeguati, progetti sfidanti.',
    cosaNonDare: 'Ruoli commerciali, gestione conflitti, presentazioni frequenti.',
    comeFarloCrescere: 'Senior Technical, Tech Lead, specializzazione di nicchia.',
    erroriEvitare: 'Forzare ruoli relazionali, non riconoscere la competenza, interrupt continui.',
  },

  'Ufficio acquisti': {
    id: 'acquisti',
    nome: 'Ufficio Acquisti',
    descrizione: 'Ruolo negoziale con gestione fornitori, contratti e ottimizzazione costi',
    requisiti: [
      { scala: 'EC', soglia: 140, tipo: 'min', isCritical: true, label: 'Efficacia (EC > 140)' },
      { scala: 'QR', soglia: 130, tipo: 'min', isCritical: true, label: 'Qualità Responsabilità (QR > 130)' },
      { scala: 'EF', soglia: 130, tipo: 'min', isCritical: true, label: 'Efficienza (EF > 130)' },
    ],
    attenzioni: [],
    profiloIdeale: 'Negoziatore efficace, analitico, orientato al risparmio con qualità',
    chiE: 'Guardiano del valore. Ottimizza costi, negozia duramente, garantisce qualità.',
    cosaMotiva: 'Risparmio ottenuto, accordi vantaggiosi, riconoscimento del valore generato.',
    cosaBlocca: 'Urgenze non pianificate, fornitori imposti, mancanza di leva negoziale.',
    comeGestirlo: 'Autonomia negoziale, dati per decidere, tempo per scouting.',
    cosaDare: 'Potere contrattuale, accesso a fiere/mercati, riconoscimento savings.',
    cosaNonDare: 'Fornitori obbligati, pressioni politiche, fretta costante.',
    comeFarloCrescere: 'Category Manager, Procurement Director, Strategic Sourcing.',
    erroriEvitare: 'Ignorare i suoi alert qualità, imporre fornitori, non riconoscere i risultati.',
  },

  'Produzione': {
    id: 'produzione',
    nome: 'Produzione',
    descrizione: 'Ruolo operativo con gestione processi produttivi, qualità e sicurezza',
    requisiti: [
      { scala: 'EF', soglia: 130, tipo: 'min', isCritical: true, label: 'Efficienza (EF > 130)' },
      { scala: 'SC', soglia: 100, tipo: 'min', isCritical: true, label: 'Schematicità (SC > 100)' },
      { scala: 'EC', soglia: 110, tipo: 'min', isCritical: true, label: 'Efficacia (EC > 110)' },
    ],
    attenzioni: [],
    profiloIdeale: 'Operativo affidabile, metodico, rispettoso delle procedure di sicurezza',
    chiE: 'Motore della fabbrica. Costante, affidabile, orientato all\'esecuzione corretta.',
    cosaMotiva: 'Ambiente ordinato, procedure chiare, riconoscimento della costanza.',
    cosaBlocca: 'Caos, cambiamenti continui, mancanza di strumenti, pressioni eccessive.',
    comeGestirlo: 'Procedure documentate, turni stabili, ambiente sicuro.',
    cosaDare: 'DPI adeguati, formazione sicurezza, chiarezza sui compiti.',
    cosaNonDare: 'Improvvisazione, responsabilità decisionali complesse, ruoli fuori linea.',
    comeFarloCrescere: 'Capo turno, responsabile linea, formatore interno.',
    erroriEvitare: 'Ignorare la sicurezza, cambiare turni senza preavviso, non ascoltare i feedback operativi.',
  },

  'Logistica': {
    id: 'logistica',
    nome: 'Logistica',
    descrizione: 'Ruolo organizzativo con gestione flussi, magazzino e trasporti',
    requisiti: [
      { scala: 'EF', soglia: 140, tipo: 'min', isCritical: true, label: 'Efficienza (EF > 140)' },
      { scala: 'EC', soglia: 130, tipo: 'min', isCritical: true, label: 'Efficacia (EC > 130)' },
      { scala: 'CF', soglia: 110, tipo: 'min', isCritical: true, label: 'Capacità Fronteggiare (CF > 110)' },
    ],
    attenzioni: [],
    profiloIdeale: 'Organizzatore efficiente, capace di gestire complessità e imprevisti',
    chiE: 'Orchestratore dei flussi. Tiene tutto insieme, prevede problemi, risolve in tempo reale.',
    cosaMotiva: 'Efficienza del sistema, problem solving quotidiano, riconoscimento.',
    cosaBlocca: 'Sistemi obsoleti, mancanza di dati, decisioni centralizzate altrove.',
    comeGestirlo: 'Sistemi adeguati, autonomia operativa, supporto nelle emergenze.',
    cosaDare: 'WMS moderno, team affidabile, margine per gestire imprevisti.',
    cosaNonDare: 'Sistemi inadeguati, tagli al personale senza alternative, responsabilità senza mezzi.',
    comeFarloCrescere: 'Supply Chain Manager, Operations Director, progetti di automazione.',
    erroriEvitare: 'Ignorare i suoi alert capacity, tagliare senza strategia, non investire in tecnologia.',
  },
};

// ============ FUNZIONI DI MATCHING ============

/**
 * Verifica se un requisito è soddisfatto
 */
function checkRequirement(
  req: RoleRequirement, 
  scalePunteggi: Record<string, number>
): { ok: boolean; valore: number; diff: number } {
  const valore = scalePunteggi[req.scala] ?? 100;
  let ok = false;
  let diff = 0;

  switch (req.tipo) {
    case 'min':
      ok = valore >= req.soglia;
      diff = valore - req.soglia;
      break;
    case 'max':
      ok = valore <= req.soglia;
      diff = req.soglia - valore;
      break;
    case 'range':
      ok = valore >= req.soglia && valore <= (req.rangeMax || 200);
      if (valore < req.soglia) diff = valore - req.soglia;
      else if (valore > (req.rangeMax || 200)) diff = (req.rangeMax || 200) - valore;
      break;
  }

  return { ok, valore, diff };
}

/**
 * Identifica pattern critici dal Manuale V5
 */
function identifyPatterns(scalePunteggi: Record<string, number>): string[] {
  const patterns: string[] = [];
  
  const sv = scalePunteggi['SV'] ?? 100;
  const mo = scalePunteggi['MO'] ?? 100;
  const sp = scalePunteggi['SP'] ?? 100;
  const cf = scalePunteggi['CF'] ?? 100;
  const ef = scalePunteggi['EF'] ?? 100;
  const ec = scalePunteggi['EC'] ?? 100;
  const sc = scalePunteggi['SC'] ?? 100;
  const pa = scalePunteggi['PA'] ?? 100;
  const qn = scalePunteggi['QN'] ?? 100;
  const qr = scalePunteggi['QR'] ?? 100;

  // NUOVO PATTERN V5: Motore che gira a vuoto
  if (mo > 140 && sp < 100) {
    patterns.push('🔴 MOTORE A VUOTO: Alta Motivazione (MO ' + mo + ') + Bassa Ambizione (SP ' + sp + '). Sembra motivato ma non ha obiettivi concreti. PERICOLOSO per vendita: produce poco nonostante l\'apparente impegno.');
  }

  // Stress Zone critica
  if (sv < 60 && cf < 60) {
    patterns.push('🔴 STRESS ZONE CRITICA: Situazione personale grave (SV ' + sv + ') + Resilienza minima (CF ' + cf + '). Da supportare prima come persona.');
  } else if (sv < 80 && cf < 80) {
    patterns.push('🟠 STRESS ZONE ATTIVA: Difficoltà personale (SV ' + sv + ') + Resilienza ridotta (CF ' + cf + '). Inserimento graduale necessario.');
  }

  // Visionario Disorganizzato - CORREZIONE: scatta solo se EF è effettivamente basso
  if (ec - ef > 40 && ef < 100) {
    patterns.push('🟠 VISIONARIO DISORGANIZZATO: Gap EC-EF di ' + (ec - ef) + ' punti con EF basso (' + ef + '). Sa cosa fare ma fatica a organizzarsi.');
  }
  
  // PATTERN POSITIVO: Determinazione Superiore (alto EC + alto EF)
  if (ec >= 160 && ef >= 130) {
    patterns.push('🟢 DETERMINAZIONE SUPERIORE: EC eccellente (' + ec + ') + EF alto (' + ef + '). Sa cosa fare E sa organizzarsi per farlo. Punto di forza significativo.')
  }

  // Rigidità Fragile
  if (sc > 170 && cf < 90) {
    patterns.push('🔴 RIGIDITÀ FRAGILE: Schematicità estrema (SC ' + sc + ') + Bassa resilienza (CF ' + cf + '). Rischio blocco su imprevisti.');
  }

  // Caricato Irresponsabile
  if (qn > 140 && qr < 80) {
    patterns.push('🔴 CARICATO IRRESPONSABILE: Si carica molto (QN ' + qn + ') ma non risponde dei risultati (QR ' + qr + ').');
  }

  // Workaholic a rischio
  if ((ef + ec) / 2 > 150 && sv < 80) {
    patterns.push('🟠 WORKAHOLIC A RISCHIO: Alta produttività ma sfera personale trascurata. Rischio burnout.');
  }

  // Leader Isolato
  if (qr > 150 && pa < 90) {
    patterns.push('🟠 LEADER ISOLATO: Alta responsabilità (QR ' + qr + ') ma scarsa partecipazione (PA ' + pa + '). Rischio autoritarismo.');
  }

  return patterns;
}

/**
 * Genera domande colloquio specifiche per il candidato
 */
function generateInterviewQuestions(
  ruolo: string,
  requisitiMancanti: { label: string; diff: number }[],
  areeAttenzione: { label: string; motivo: string }[],
  patterns: string[]
): string[] {
  const questions: string[] = [];

  // Domande su requisiti mancanti
  for (const req of requisitiMancanti.slice(0, 2)) {
    if (req.label.includes('Ambizione')) {
      questions.push('Quali sono i suoi obiettivi economici e di carriera nei prossimi 3 anni?');
    } else if (req.label.includes('Partecipazione')) {
      questions.push('Come si trova a lavorare in team? Preferisce lavorare da solo?');
    } else if (req.label.includes('Motivazione')) {
      questions.push('Cosa la motiva realmente nel suo lavoro? Cosa la spinge a dare il massimo?');
    } else if (req.label.includes('Fronteggiare')) {
      questions.push('Racconti di una situazione molto stressante. Come l\'ha gestita?');
    } else if (req.label.includes('Efficienza')) {
      questions.push('Come organizza la sua giornata lavorativa? Quali strumenti usa?');
    } else if (req.label.includes('Efficacia')) {
      questions.push('Racconti di un progetto difficile che ha portato a termine nonostante gli ostacoli.');
    }
  }

  // Domande su pattern
  if (patterns.some(p => p.includes('MOTORE A VUOTO'))) {
    questions.push('Ha obiettivi personali/economici specifici che vuole raggiungere con questo lavoro?');
    questions.push('Cosa intende acquistare/realizzare con il suo stipendio/bonus nei prossimi 12 mesi?');
  }

  if (patterns.some(p => p.includes('STRESS ZONE'))) {
    questions.push('Come sta in questo periodo della sua vita, a livello personale?');
    questions.push('Ha un sistema di supporto (famiglia, amici) su cui può contare?');
  }

  if (patterns.some(p => p.includes('RIGIDITÀ'))) {
    questions.push('Racconti di una volta in cui ha dovuto cambiare completamente approccio. Come l\'ha vissuta?');
  }

  // Domande specifiche per ruolo vendite
  if (ruolo === 'Ufficio vendite') {
    if (!questions.some(q => q.includes('obiettivi'))) {
      questions.push('Quanto vuole guadagnare tra 3 anni? Cosa farà con quei soldi?');
    }
    questions.push('Come reagisce quando un cliente le dice no? Racconti un esempio.');
  }

  return questions.slice(0, 7); // Max 7 domande
}

/**
 * Calcola il matching per un singolo ruolo
 */
export function calculateRoleMatching(
  ruolo: string,
  scalePunteggi: Record<string, number>
): RoleMatchResult {
  const profile = ROLE_PROFILES[ruolo];
  
  if (!profile) {
    return {
      ruolo,
      compatibilitaPct: 50,
      requisitiSoddisfatti: [],
      requisitiMancanti: [],
      areeAttenzione: [],
      criticita: 0,
      attenzioni: 0,
      verdict: 'DA_VALUTARE',
      motivazione: 'Ruolo non configurato nel sistema di matching.',
      domandeColloquio: [],
      patternRilevati: [],
    };
  }

  const requisitiSoddisfatti: RoleMatchResult['requisitiSoddisfatti'] = [];
  const requisitiMancanti: RoleMatchResult['requisitiMancanti'] = [];
  const areeAttenzione: RoleMatchResult['areeAttenzione'] = [];
  let criticita = 0;
  let attenzioni = 0;

  // Verifica requisiti essenziali
  for (const req of profile.requisiti) {
    const { ok, valore, diff } = checkRequirement(req, scalePunteggi);
    
    if (ok) {
      requisitiSoddisfatti.push({ label: req.label, valore, soglia: req.soglia, ok: true });
    } else {
      requisitiMancanti.push({ label: req.label, valore, soglia: req.soglia, diff });
      if (req.isCritical) criticita++;
    }
  }

  // Verifica soglie di attenzione
  for (const att of profile.attenzioni) {
    const { ok, valore, diff } = checkRequirement(att, scalePunteggi);
    if (!ok) {
      areeAttenzione.push({ 
        label: att.label, 
        valore, 
        motivo: `Valore ${valore} ${att.tipo === 'max' ? 'supera' : 'sotto'} soglia ${att.soglia}` 
      });
      attenzioni++;
    }
  }

  // Identifica pattern critici
  const patterns = identifyPatterns(scalePunteggi);
  
  // Pattern specifici contano come criticità
  const patternCritici = patterns.filter(p => p.includes('🔴'));
  criticita += patternCritici.length;
  attenzioni += patterns.filter(p => p.includes('🟠')).length;

  // Calcola compatibilità percentuale
  const totalReqs = profile.requisiti.length;
  const okReqs = requisitiSoddisfatti.length;
  let compatibilitaPct = Math.round((okReqs / totalReqs) * 100);
  
  // Penalità per pattern critici
  compatibilitaPct = Math.max(0, compatibilitaPct - (patternCritici.length * 15));
  compatibilitaPct = Math.max(0, compatibilitaPct - (attenzioni * 5));

  // Determina verdetto (ALGORITMO V5 - NO DEFAULT!)
  let verdict: FitVerdict;
  let motivazione: string;

  if (criticita >= 2) {
    verdict = 'NON_IDONEO';
    motivazione = `Profilo NON IDONEO per ${ruolo}: ${criticita} criticità rilevate (${requisitiMancanti.map(r => r.label.split('(')[0].trim()).join(', ')}).`;
  } else if (criticita === 1) {
    verdict = 'DA_VALUTARE';
    motivazione = `DA VALUTARE per ${ruolo}: 1 criticità (${requisitiMancanti[0]?.label.split('(')[0].trim() || 'pattern critico'}). Approfondire in colloquio.`;
  } else if (attenzioni > 0) {
    verdict = 'IDONEO_CON_RISERVA';
    motivazione = `IDONEO CON RISERVA per ${ruolo}: requisiti essenziali OK, ma ${attenzioni} area/e di attenzione (${areeAttenzione.map(a => a.label.split('(')[0].trim()).join(', ')}).`;
  } else {
    verdict = 'IDONEO';
    motivazione = `IDONEO per ${ruolo}: tutti i requisiti essenziali soddisfatti. Profilo compatibile.`;
  }

  // Genera domande colloquio
  const domandeColloquio = generateInterviewQuestions(ruolo, requisitiMancanti, areeAttenzione, patterns);

  return {
    ruolo,
    compatibilitaPct,
    requisitiSoddisfatti,
    requisitiMancanti,
    areeAttenzione,
    criticita,
    attenzioni,
    verdict,
    motivazione,
    domandeColloquio,
    patternRilevati: patterns,
  };
}

/**
 * Calcola la compatibilità con TUTTI i 9 ruoli
 */
export function calculateAllRolesCompatibility(
  ruoloRichiesto: string,
  scalePunteggi: Record<string, number>
): AllRolesCompatibility {
  const ruoloRichiestoResult = calculateRoleMatching(ruoloRichiesto, scalePunteggi);
  
  const tuttiRuoli: { ruolo: string; compatibilita: number; verdict: FitVerdict }[] = [];
  
  for (const ruolo of Object.keys(ROLE_PROFILES)) {
    const result = calculateRoleMatching(ruolo, scalePunteggi);
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

/**
 * Helper per ottenere colore badge del verdetto
 */
export function getVerdictBadgeVariant(verdict: FitVerdict): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (verdict) {
    case 'IDONEO': return 'default';
    case 'IDONEO_CON_RISERVA': return 'secondary';
    case 'DA_VALUTARE': return 'outline';
    case 'NON_IDONEO': return 'destructive';
    default: return 'outline';
  }
}

/**
 * Helper per ottenere label leggibile del verdetto
 */
export function getVerdictLabel(verdict: FitVerdict): string {
  const labels: Record<FitVerdict, string> = {
    'IDONEO': 'Idoneo',
    'IDONEO_CON_RISERVA': 'Idoneo con Riserva',
    'DA_VALUTARE': 'Da Valutare',
    'NON_IDONEO': 'Non Idoneo',
  };
  return labels[verdict];
}

/**
 * Helper per ottenere colore CSS del verdetto
 */
export function getVerdictColor(verdict: FitVerdict): string {
  switch (verdict) {
    case 'IDONEO': return 'text-green-600';
    case 'IDONEO_CON_RISERVA': return 'text-amber-600';
    case 'DA_VALUTARE': return 'text-orange-600';
    case 'NON_IDONEO': return 'text-red-600';
    default: return 'text-gray-600';
  }
}
