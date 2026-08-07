/**
 * ActionPlanCardV5.tsx - SEZIONE 8: Piano d'Azione
 * 
 * Piano d'azione prioritizzato per il candidato con:
 * - Priorità P1, P2, P3...
 * - GP < 21 sempre priorità 1
 * - Azioni specifiche per ogni sindrome
 * - Check-in intermedio a 3 mesi
 * - Ricompilazione a 24 mesi
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Clock, 
  Target,
  CalendarDays,
  RefreshCw,
  User,
  CheckCircle2
} from 'lucide-react';
import { TraitCode, TRAIT_LABELS } from '@/types/database';
import { SyndromeResult } from '@/lib/syndromes';
import { SYNDROMES_V5_DATA } from '@/lib/syndromesV5Data';
import { personalizzaTesto } from '@/lib/traitNarrativesV5';

interface ActionItem {
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  area: string;
  action: string;
  timeline: '0-3 mesi' | '3-6 mesi' | '6-12 mesi' | '12-24 mesi';
  responsible: 'HR' | 'Manager' | 'Candidato' | 'Team';
  trigger?: string;
}

interface ActionPlanCardV5Props {
  candidatoNome: string;
  sesso?: string | null;
  traits: Record<TraitCode, number>;
  syndromes: SyndromeResult[];
  reliabilityIndex: string;
}

// Genera le azioni basate sui tratti
function generateTraitActions(
  traits: Record<TraitCode, number>,
  nome: string,
  sesso?: string | null
): ActionItem[] {
  const actions: ActionItem[] = [];
  const isFemale = sesso === 'F';

  // GP < 21 - SEMPRE PRIORITÀ 1
  if (traits.GP !== undefined && traits.GP < 21) {
    actions.push({
      priority: 'P1',
      area: 'Gestione Pressioni',
      action: `PRIORITÀ ASSOLUTA: Identificare la fonte di pressione che sta vivendo ${nome}. Colloquio riservato con HR per capire se situazione temporanea o cronica. Se cronica, valutare supporto professionale.`,
      timeline: '0-3 mesi',
      responsible: 'HR',
      trigger: `GP = ${traits.GP} (critico)`
    });
  }

  // ORG < 25 - Supporto organizzativo
  if (traits.ORG !== undefined && traits.ORG < 25) {
    actions.push({
      priority: 'P2',
      area: 'Organizzazione',
      action: `Affiancare ${nome} con un buddy organizzato per i primi 3 mesi. Fornire strumenti di time management e checklist operative.`,
      timeline: '0-3 mesi',
      responsible: 'Manager',
      trigger: `ORG = ${traits.ORG} (basso)`
    });
  }

  // AUT < 20 - Supporto motivazionale
  if (traits.AUT !== undefined && traits.AUT < 20) {
    actions.push({
      priority: 'P2',
      area: 'Automotivazione',
      action: `${nome} necessita di feedback frequenti e incoraggiamento costante. Programmare check-in settimanali con il manager diretto. Celebrare i piccoli successi.`,
      timeline: '0-3 mesi',
      responsible: 'Manager',
      trigger: `AUT = ${traits.AUT} (basso)`
    });
  }

  // DET < 25 - Sviluppo assertività
  if (traits.DET !== undefined && traits.DET < 25) {
    actions.push({
      priority: 'P3',
      area: 'Determinazione',
      action: `Inserire ${nome} in un percorso di sviluppo dell'assertività. Esercizi pratici per imparare a dire no e negoziare in modo costruttivo.`,
      timeline: '3-6 mesi',
      responsible: 'HR',
      trigger: `DET = ${traits.DET} (basso)`
    });
  }

  // ESP < 20 - Sviluppo networking
  if (traits.ESP !== undefined && traits.ESP < 20) {
    actions.push({
      priority: 'P3',
      area: 'Espansività',
      action: `Coinvolgere ${nome} in attività di team building e eventi aziendali. Assegnare un mentor che ${isFemale ? 'la' : 'lo'} introduca gradualmente nelle dinamiche relazionali.`,
      timeline: '3-6 mesi',
      responsible: 'HR',
      trigger: `ESP = ${traits.ESP} (basso)`
    });
  }

  // COM < 20 - Sviluppo empatia
  if (traits.COM !== undefined && traits.COM < 20) {
    actions.push({
      priority: 'P3',
      area: 'Comprensione',
      action: `Formazione sulle soft skills relazionali per ${nome}. Focus su ascolto attivo e comprensione delle diversità.`,
      timeline: '6-12 mesi',
      responsible: 'HR',
      trigger: `COM = ${traits.COM} (basso)`
    });
  }

  // RC > 45 - Gestione del cambiamento
  if (traits.RC !== undefined && traits.RC > 45) {
    actions.push({
      priority: 'P2',
      area: 'Resistenza al Cambiamento',
      action: `Con ${nome} i cambiamenti vanno introdotti gradualmente, con dati e numeri a supporto. Anticipare le novità e spiegare il "perché" prima del "cosa".`,
      timeline: '0-3 mesi',
      responsible: 'Manager',
      trigger: `RC = ${traits.RC} (alta resistenza)`
    });
  }

  // HRM < 20 - Sviluppo gestione persone
  if (traits.HRM !== undefined && traits.HRM < 20) {
    actions.push({
      priority: 'P3',
      area: 'HR Management',
      action: `Se ${nome} ha responsabilità su persone, formazione specifica sulla gestione e sviluppo collaboratori. Coaching individuale consigliato.`,
      timeline: '6-12 mesi',
      responsible: 'HR',
      trigger: `HRM = ${traits.HRM} (basso)`
    });
  }

  // LDR < 20 - Non esporre a ruoli di leadership
  if (traits.LDR !== undefined && traits.LDR < 20) {
    actions.push({
      priority: 'P2',
      area: 'Leadership',
      action: `${nome} non va ${isFemale ? 'esposta' : 'esposto'} a ruoli di leadership formale in questa fase. Favorire contributi individuali di alto valore.`,
      timeline: '0-3 mesi',
      responsible: 'Manager',
      trigger: `LDR = ${traits.LDR} (basso)`
    });
  }

  // ADS < 25 - Strutturare il lavoro
  if (traits.ADS !== undefined && traits.ADS < 25) {
    actions.push({
      priority: 'P2',
      area: 'Autodisciplina',
      action: `Fornire a ${nome} checklist dettagliate e procedure scritte. Monitorare inizialmente le scadenze con gentilezza ma fermezza.`,
      timeline: '0-3 mesi',
      responsible: 'Manager',
      trigger: `ADS = ${traits.ADS} (basso)`
    });
  }

  // PRO < 20 - Stimolare proattività
  if (traits.PRO !== undefined && traits.PRO < 20) {
    actions.push({
      priority: 'P3',
      area: 'Proattività',
      action: `Assegnare a ${nome} piccoli progetti con autonomia crescente. Valorizzare ogni iniziativa spontanea per rinforzare il comportamento.`,
      timeline: '3-6 mesi',
      responsible: 'Manager',
      trigger: `PRO = ${traits.PRO} (basso)`
    });
  }

  return actions;
}

// Genera le azioni basate sulle sindromi
function generateSyndromeActions(
  syndromes: SyndromeResult[],
  nome: string,
  sesso?: string | null
): ActionItem[] {
  const actions: ActionItem[] = [];
  const isFemale = sesso === 'F';

  syndromes.forEach(syndrome => {
    const syndromeData = SYNDROMES_V5_DATA[syndrome.code];
    if (!syndromeData) return;

    switch (syndrome.severity) {
      case 'RED':
        // Sindromi RED richiedono azione immediata
        if (['S01', 'S02', 'S04'].includes(syndrome.code)) {
          actions.push({
            priority: 'P1',
            area: `Sindrome ${syndrome.code}`,
            action: `ATTENZIONE CRITICA: ${syndromeData.name}. Se ${nome} è già ${isFemale ? 'inserita' : 'inserito'} in azienda, valutare immediato piano di uscita. Se in selezione, NON PROCEDERE.`,
            timeline: '0-3 mesi',
            responsible: 'HR',
            trigger: syndromeData.shortDescription
          });
        } else if (syndrome.code === 'S03') {
          actions.push({
            priority: 'P1',
            area: `Sindrome ${syndrome.code} - TROUBLE`,
            action: `${nome} richiede supervisione costante. Mai ${isFemale ? 'lasciarla' : 'lasciarlo'} ${isFemale ? 'sola' : 'solo'} con clienti strategici. Check settimanali obbligatori.`,
            timeline: '0-3 mesi',
            responsible: 'Manager',
            trigger: syndromeData.shortDescription
          });
        }
        break;

      case 'ORANGE':
        actions.push({
          priority: 'P2',
          area: `Sindrome ${syndrome.code}`,
          action: syndromeData.managementTips?.[0] || `Monitoraggio specifico per ${syndromeData.name}`,
          timeline: '0-3 mesi',
          responsible: 'Manager',
          trigger: syndromeData.shortDescription
        });
        break;

      case 'YELLOW':
        actions.push({
          priority: 'P3',
          area: `Sindrome ${syndrome.code}`,
          action: syndromeData.managementTips?.[0] || `Attenzione per ${syndromeData.name}`,
          timeline: '3-6 mesi',
          responsible: 'Manager',
          trigger: syndromeData.shortDescription
        });
        break;
    }
  });

  return actions;
}

export function ActionPlanCardV5({
  candidatoNome,
  sesso,
  traits,
  syndromes,
  reliabilityIndex
}: ActionPlanCardV5Props) {
  // Combina tutte le azioni
  const traitActions = generateTraitActions(traits, candidatoNome, sesso);
  const syndromeActions = generateSyndromeActions(syndromes, candidatoNome, sesso);
  
  // Merge e ordina per priorità
  const allActions = [...traitActions, ...syndromeActions].sort((a, b) => {
    const priorityOrder: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4, P5: 5 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Azioni standard sempre presenti
  const standardActions: ActionItem[] = [
    {
      priority: 'P4',
      area: 'Check-in Intermedio',
      action: `Programmazione check-in di verifica a 3 mesi dall'inserimento di ${candidatoNome}. Valutare adattamento, performance e benessere.`,
      timeline: '3-6 mesi',
      responsible: 'HR'
    },
    {
      priority: 'P5',
      area: 'Ricompilazione Test',
      action: `Ricompilazione dell’analisi Talent Profile a 24 mesi per monitorare evoluzione del profilo di ${candidatoNome}.`,
      timeline: '12-24 mesi',
      responsible: 'HR'
    }
  ];

  const finalActions = [...allActions, ...standardActions];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800 border-red-300';
      case 'P2': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'P3': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'P4': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'P5': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTimelineIcon = (timeline: string) => {
    switch (timeline) {
      case '0-3 mesi': return <Clock className="w-4 h-4 text-red-500" />;
      case '3-6 mesi': return <CalendarDays className="w-4 h-4 text-orange-500" />;
      case '6-12 mesi': return <Target className="w-4 h-4 text-blue-500" />;
      case '12-24 mesi': return <RefreshCw className="w-4 h-4 text-purple-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getResponsibleIcon = (responsible: string) => {
    switch (responsible) {
      case 'HR': return <User className="w-4 h-4" />;
      case 'Manager': return <ClipboardCheck className="w-4 h-4" />;
      case 'Candidato': return <CheckCircle2 className="w-4 h-4" />;
      case 'Team': return <User className="w-4 h-4" />;
      default: return <User className="w-4 h-4" />;
    }
  };

  // Se profilo non attendibile, mostra avviso
  if (reliabilityIndex === 'ZERO') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Piano d'Azione Non Disponibile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">
            L'indice di attendibilità del test è ZERO. Non è possibile generare un piano d'azione 
            affidabile. Si consiglia di ripetere il test in condizioni ottimali.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardCheck className="w-5 h-5 text-primary" />
          Piano d'Azione per {candidatoNome}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Azioni prioritizzate basate sul profilo. P1 = priorità massima, P5 = lungo termine.
        </p>
      </CardHeader>
      <CardContent>
        {finalActions.length === 0 ? (
          <p className="text-muted-foreground italic">
            Nessuna azione critica rilevata. {candidatoNome} presenta un profilo equilibrato.
          </p>
        ) : (
          <div className="space-y-4">
            {finalActions.map((action, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  action.priority === 'P1' ? 'border-red-200 bg-red-50/50' :
                  action.priority === 'P2' ? 'border-orange-200 bg-orange-50/50' :
                  'border-border bg-card'
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(action.priority)}>
                      {action.priority}
                    </Badge>
                    <span className="font-medium text-foreground">
                      {action.area}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {getTimelineIcon(action.timeline)}
                      {action.timeline}
                    </span>
                    <span className="flex items-center gap-1">
                      {getResponsibleIcon(action.responsible)}
                      {action.responsible}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-foreground">
                  {action.action}
                </p>
                
                {action.trigger && (
                  <p className="mt-2 text-xs text-muted-foreground italic">
                    Trigger: {action.trigger}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Note footer */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
          <p className="font-medium mb-2">📌 Note importanti:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Le priorità P1 richiedono intervento immediato</li>
            <li>Il check-in a 3 mesi è obbligatorio per ogni nuova risorsa</li>
            <li>La ricompilazione a 24 mesi permette di misurare l'evoluzione</li>
            <li>Documentare sempre le azioni intraprese</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
