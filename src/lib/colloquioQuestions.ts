/**
 * Sistema di domande suggerite per il colloquio HR
 * Secondo il Manuale Talent Profiler V3 - Capitolo 16.6
 */

import { ScalaCode, SCALE_LABELS } from '@/types/database';
import { StressZoneSeverity } from './stressZone';

export interface ColloquioArea {
  id: string;
  area: string;
  priorita: 'alta' | 'media' | 'bassa';
  motivazione: string;
  domande: string[];
}

/**
 * Genera le domande suggerite per il colloquio basandosi sui dati del profilo
 */
export function generateColloquioQuestions(
  scalePunteggi: Record<string, number>,
  stressZoneSeverity: StressZoneSeverity,
  profiloTipo: string
): ColloquioArea[] {
  const areas: ColloquioArea[] = [];

  // STRESS ZONE - Priorità massima
  if (stressZoneSeverity !== 'nessuna') {
    const sv = scalePunteggi['SV'] || 100;
    const cf = scalePunteggi['CF'] || 100;
    
    areas.push({
      id: 'stress_zone',
      area: 'Situazione Personale e Stress',
      priorita: stressZoneSeverity === 'critica' || stressZoneSeverity === 'severa' ? 'alta' : 'media',
      motivazione: `Stress Zone ${stressZoneSeverity.toUpperCase()} rilevata (SV: ${sv}, CF: ${cf}). È fondamentale capire la situazione attuale del candidato.`,
      domande: [
        'So che può essere personale, ma come sta attraversando questo periodo della sua vita?',
        'C\'è qualcosa che la preoccupa particolarmente in questo momento che potrebbe influire sul suo lavoro?',
        'Ha un sistema di supporto (famiglia, amici, professionisti) su cui può contare?',
        'Come gestisce i momenti in cui si sente sotto pressione?',
        'Cosa cerca in un nuovo lavoro in questo momento? Stabilità, sfida, cambiamento?'
      ]
    });
  }

  // STILE DI VITA CRITICO (SV < 60)
  if ((scalePunteggi['SV'] || 100) < 60 && stressZoneSeverity === 'nessuna') {
    areas.push({
      id: 'vita_personale',
      area: 'Equilibrio Vita-Lavoro',
      priorita: 'alta',
      motivazione: `Stile di Vita molto basso (${scalePunteggi['SV']}). Possibili difficoltà personali significative.`,
      domande: [
        'Come descriverebbe il suo equilibrio attuale tra vita personale e lavoro?',
        'Cosa la motiva a cercare un cambiamento professionale in questo momento?',
        'Qual è stata la sfida più grande che ha dovuto affrontare recentemente fuori dal lavoro?'
      ]
    });
  } else if ((scalePunteggi['SV'] || 100) < 80) {
    areas.push({
      id: 'vita_personale',
      area: 'Equilibrio Vita-Lavoro',
      priorita: 'media',
      motivazione: `Stile di Vita sotto la media (${scalePunteggi['SV']}). Verificare se ci sono fattori di stress.`,
      domande: [
        'Come gestisce le giornate particolarmente impegnative?',
        'Cosa la aiuta a mantenere l\'equilibrio tra lavoro e vita privata?'
      ]
    });
  }

  // CAPACITÀ DI FRONTEGGIARE CRITICA (CF < 60)
  if ((scalePunteggi['CF'] || 100) < 60 && stressZoneSeverity === 'nessuna') {
    areas.push({
      id: 'resilienza',
      area: 'Gestione dello Stress',
      priorita: 'alta',
      motivazione: `Capacità di Fronteggiare molto bassa (${scalePunteggi['CF']}). Vulnerabilità significativa allo stress.`,
      domande: [
        'Mi racconti di una situazione particolarmente stressante che ha dovuto affrontare. Come l\'ha gestita?',
        'Cosa fa quando si sente sopraffatto/a dalle richieste?',
        'Quali strategie usa per recuperare dopo periodi intensi?',
        'Come reagisce quando qualcosa non va secondo i piani?'
      ]
    });
  } else if ((scalePunteggi['CF'] || 100) < 80) {
    areas.push({
      id: 'resilienza',
      area: 'Gestione dello Stress',
      priorita: 'media',
      motivazione: `Capacità di Fronteggiare sotto la media (${scalePunteggi['CF']}). Verificare resilienza.`,
      domande: [
        'Come gestisce le scadenze ravvicinate?',
        'Mi racconti di un momento difficile al lavoro e come l\'ha superato.'
      ]
    });
  }

  // MOTIVAZIONE BASSA (MO < 80)
  if ((scalePunteggi['MO'] || 100) < 80) {
    const isCritica = (scalePunteggi['MO'] || 100) < 60;
    areas.push({
      id: 'motivazione',
      area: 'Motivazione e Obiettivi',
      priorita: isCritica ? 'alta' : 'media',
      motivazione: `Motivazione ${isCritica ? 'molto bassa' : 'sotto la media'} (${scalePunteggi['MO']}). Capire le leve motivazionali.`,
      domande: [
        'Cosa la spinge a candidarsi per questa posizione specifica?',
        'Quali sono i suoi obiettivi professionali a 3-5 anni?',
        'Cosa la appassiona nel suo lavoro?',
        'Quando si è sentito/a più realizzato/a professionalmente?',
        'Cosa la demotiva in un ambiente lavorativo?'
      ]
    });
  }

  // QUALITÀ RESPONSABILITÀ BASSA (QR < 80)
  if ((scalePunteggi['QR'] || 100) < 80) {
    const isCritica = (scalePunteggi['QR'] || 100) < 60;
    areas.push({
      id: 'responsabilita',
      area: 'Responsabilità e Accountability',
      priorita: isCritica ? 'alta' : 'media',
      motivazione: `Qualità Responsabilità ${isCritica ? 'molto bassa' : 'sotto la media'} (${scalePunteggi['QR']}). Verificare senso di ownership.`,
      domande: [
        'Quando un progetto non va come previsto, a cosa lo attribuisce di solito?',
        'Mi racconti di un errore significativo che ha commesso e cosa ha fatto.',
        'Come gestisce le critiche al suo lavoro?',
        'Qual è il feedback più duro che ha ricevuto e come l\'ha elaborato?'
      ]
    });
  }

  // EFFICIENZA BASSA (EF < 80)
  if ((scalePunteggi['EF'] || 100) < 80) {
    const isCritica = (scalePunteggi['EF'] || 100) < 60;
    areas.push({
      id: 'organizzazione',
      area: 'Organizzazione e Autodisciplina',
      priorita: isCritica ? 'alta' : 'media',
      motivazione: `Efficienza ${isCritica ? 'molto bassa' : 'sotto la media'} (${scalePunteggi['EF']}). Verificare capacità organizzative.`,
      domande: [
        'Come organizza tipicamente la sua giornata lavorativa?',
        'Quali strumenti usa per gestire scadenze e priorità?',
        'Mi racconti di una volta in cui ha dovuto gestire più compiti contemporaneamente.',
        'Qual è il suo punto debole nell\'organizzazione del lavoro?'
      ]
    });
  }

  // SCHEMATICITÀ ESTREMA (SC > 170 o SC < 60)
  const sc = scalePunteggi['SC'] || 100;
  if (sc > 170) {
    areas.push({
      id: 'flessibilita',
      area: 'Flessibilità e Adattamento',
      priorita: 'alta',
      motivazione: `Schematicità molto alta (${sc}) = Flessibilità molto bassa. Potenziali difficoltà con cambiamenti.`,
      domande: [
        'Come reagisce quando i piani cambiano all\'improvviso?',
        'Mi racconti di una volta in cui ha dovuto cambiare completamente approccio. Come l\'ha vissuta?',
        'Cosa prova quando le regole cambiano senza preavviso?',
        'Come gestisce le eccezioni alle procedure standard?',
        'Preferisce ambienti stabili o dinamici? Perché?'
      ]
    });
  } else if (sc < 60) {
    areas.push({
      id: 'struttura',
      area: 'Struttura e Procedure',
      priorita: 'media',
      motivazione: `Schematicità molto bassa (${sc}) = Alta flessibilità. Verificare capacità di seguire procedure.`,
      domande: [
        'Come si trova con procedure e regole rigide?',
        'Preferisce libertà o struttura nel suo lavoro?',
        'Come gestisce compiti ripetitivi e routinari?'
      ]
    });
  }

  // PARTECIPAZIONE BASSA (PA < 80)
  if ((scalePunteggi['PA'] || 100) < 80) {
    const isCritica = (scalePunteggi['PA'] || 100) < 60;
    areas.push({
      id: 'relazioni',
      area: 'Lavoro in Team e Relazioni',
      priorita: isCritica ? 'alta' : 'media',
      motivazione: `Partecipazione ${isCritica ? 'molto bassa' : 'sotto la media'} (${scalePunteggi['PA']}). Verificare predisposizione al team.`,
      domande: [
        'Come si trova a lavorare in team?',
        'Mi racconti di una collaborazione che ha funzionato particolarmente bene.',
        'Preferisce lavorare da solo o in gruppo?',
        'Come contribuisce tipicamente alle riunioni?'
      ]
    });
  }

  // PATTERN COMBINATI CRITICI
  
  // Gap Efficacia-Efficienza (Visionario Disorganizzato)
  const ec = scalePunteggi['EC'] || 100;
  const ef = scalePunteggi['EF'] || 100;
  if (ec > 130 && ef < 80) {
    areas.push({
      id: 'gap_ec_ef',
      area: 'Visione vs Esecuzione',
      priorita: 'media',
      motivazione: `Gap significativo tra Efficacia (${ec}) ed Efficienza (${ef}). "Visionario Disorganizzato".`,
      domande: [
        'Come traduce le sue idee in azioni concrete?',
        'Mi racconti di un progetto che ha ideato e come l\'ha portato a termine.',
        'Cosa le risulta più difficile: avere idee o realizzarle?',
        'Come si organizza per non perdere di vista i dettagli?'
      ]
    });
  }

  // Caricato Irresponsabile (QN alto + QR basso)
  const qn = scalePunteggi['QN'] || 100;
  const qr = scalePunteggi['QR'] || 100;
  if (qn > 130 && qr < 80) {
    areas.push({
      id: 'carico_responsabilita',
      area: 'Carico di Lavoro e Responsabilità',
      priorita: 'alta',
      motivazione: `Quantità Responsabilità alta (${qn}) ma Qualità bassa (${qr}). Pattern "Promette molto, poi cerca scuse".`,
      domande: [
        'Quando si impegna in qualcosa e poi non riesce a rispettare l\'impegno, cosa succede?',
        'Come gestisce le aspettative quando si rende conto di aver promesso troppo?',
        'Mi faccia un esempio di quando ha dovuto ammettere di non farcela.'
      ]
    });
  }

  // Workaholic a rischio (SV basso + EF/EC alti)
  const sv = scalePunteggi['SV'] || 100;
  if (sv < 70 && ef > 140 && ec > 140) {
    areas.push({
      id: 'workaholic',
      area: 'Rischio Burnout',
      priorita: 'alta',
      motivazione: `Alta produttività (EF: ${ef}, EC: ${ec}) ma sfera personale trascurata (SV: ${sv}). Rischio burnout.`,
      domande: [
        'Quante ore lavora mediamente a settimana?',
        'Quando è stata l\'ultima volta che ha staccato completamente dal lavoro?',
        'Come si sente fisicamente? Riposa abbastanza?',
        'I suoi cari le hanno mai detto che lavora troppo?'
      ]
    });
  }

  // Ordina per priorità
  areas.sort((a, b) => {
    const priorityOrder = { alta: 0, media: 1, bassa: 2 };
    return priorityOrder[a.priorita] - priorityOrder[b.priorita];
  });

  return areas;
}

/**
 * Genera un riepilogo delle domande chiave per il colloquio
 */
export function generateColloquioSummary(areas: ColloquioArea[]): string {
  if (areas.length === 0) {
    return 'Il profilo non evidenzia aree critiche che richiedano domande specifiche. Procedere con colloquio standard.';
  }

  const highPriority = areas.filter(a => a.priorita === 'alta');
  const mediumPriority = areas.filter(a => a.priorita === 'media');

  let summary = '';

  if (highPriority.length > 0) {
    summary += `⚠️ AREE AD ALTA PRIORITÀ (${highPriority.length}):\n`;
    highPriority.forEach(area => {
      summary += `• ${area.area}: ${area.motivazione}\n`;
    });
    summary += '\n';
  }

  if (mediumPriority.length > 0) {
    summary += `📋 AREE DA APPROFONDIRE (${mediumPriority.length}):\n`;
    mediumPriority.forEach(area => {
      summary += `• ${area.area}: ${area.motivazione}\n`;
    });
  }

  return summary;
}
