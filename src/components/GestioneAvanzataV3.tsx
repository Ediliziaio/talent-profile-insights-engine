/**
 * GestioneAvanzataV3 - Quadro Psicologico + Piano di Crescita 4 Fasi
 * Inserito nel tab Gestione dopo ManagementGuideV5 e ActionPlanCardV5
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ChevronDown, AlertTriangle, Lightbulb, RotateCcw, 
  Clock, Target, TrendingUp, Award, Info, Brain
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TraitCode, TRAIT_LABELS } from '@/types/database';
import { getPersonalizedPatterns, categorizePatterns } from '@/lib/crossPatternsV5';
import { personalizzaTesto } from '@/lib/traitNarrativesV5';

interface GestioneAvanzataV3Props {
  candidatoNome: string;
  candidatoSesso: string | null;
  traits: Record<TraitCode, number>;
  macroAree: { essere: number; fare: number; avere: number };
  eta?: number;
}

// ─── Helpers ──────────────────────────────────────────────

const MAIN_TRAITS: TraitCode[] = ['ORG','AUT','GP','ADS','DET','VEN','HRM','LDR','PRO','COM','ESP'];

function getLowestTrait(traits: Record<TraitCode, number>): { code: TraitCode; value: number } {
  let min: { code: TraitCode; value: number } = { code: 'ORG', value: Infinity };
  for (const t of MAIN_TRAITS) {
    if (traits[t] < min.value) min = { code: t, value: traits[t] };
  }
  return min;
}

function getHighestTrait(traits: Record<TraitCode, number>): { code: TraitCode; value: number } {
  let max: { code: TraitCode; value: number } = { code: 'ORG', value: -Infinity };
  for (const t of MAIN_TRAITS) {
    if (traits[t] > max.value) max = { code: t, value: traits[t] };
  }
  return max;
}

function getTraitsBelowThreshold(traits: Record<TraitCode, number>, threshold = 20): { code: TraitCode; value: number }[] {
  return MAIN_TRAITS
    .filter(t => traits[t] < threshold)
    .map(t => ({ code: t, value: traits[t] }))
    .sort((a, b) => a.value - b.value);
}

// ─── Root cause narrative ─────────────────────────────────

function getRootCauseNarrative(lowest: TraitCode, nome: string, sesso: string | null): string {
  const label = TRAIT_LABELS[lowest];
  const base: Record<string, string> = {
    ORG: `Il punto di partenza di [Nome] è la mancanza di direzione. Senza una chiara organizzazione degli obiettivi, anche le migliori capacità restano disperse. Questo impatta direttamente sulla disciplina e sulla capacità di portare a termine i progetti.`,
    AUT: `[Nome] fatica a credere nelle proprie capacità. Questa bassa automotivazione è la radice che frena tutto il resto: senza fiducia in sé, non si rischia, non si innova, non si cresce. Gli altri tratti vengono limitati da questa convinzione profonda di non farcela.`,
    GP: `[Nome] sta vivendo un periodo di forte pressione relazionale. Quando la gestione delle pressioni è così bassa, ogni altro aspetto del lavoro viene contaminato: la concentrazione cala, la pazienza si riduce, le relazioni si deteriorano. Prima di lavorare su qualsiasi altra cosa, bisogna affrontare questa situazione.`,
    ADS: `La scarsa autodisciplina di [Nome] è il collo di bottiglia principale. Può avere tutte le idee del mondo, ma senza la capacità di trasformarle in azioni quotidiane e costanti, nulla si concretizza. È il classico gap tra "sapere cosa fare" e "farlo davvero".`,
    DET: `[Nome] evita i confronti e le situazioni difficili. Questa bassa determinazione significa che le cose importanti non vengono dette, i problemi non vengono affrontati e le opportunità vengono perse per paura del conflitto.`,
    VEN: `[Nome] ha difficoltà nel proporre e nel "vendere" le proprie idee. Non si tratta solo di vendita commerciale: è la capacità di convincere, influenzare e ottenere consenso. Senza questa abilità, anche il lavoro migliore resta invisibile.`,
    HRM: `[Nome] non riesce a far crescere le persone intorno a sé. Questo limita enormemente il potenziale del team e crea un collo di bottiglia dove tutto passa da una persona sola.`,
    LDR: `[Nome] non esercita influenza naturale sugli altri. Senza leadership, anche le competenze tecniche più elevate non si traducono in impatto organizzativo. Gli altri non seguono, non si ispirano, non cambiano comportamento.`,
    PRO: `[Nome] tende ad aspettare invece di agire. Questa bassa proattività significa che le opportunità vengono viste ma non colte, i problemi vengono identificati ma non risolti. Serve un cambio di mentalità dall'attesa all'azione.`,
    COM: `[Nome] fatica ad ascoltare e comprendere gli altri. Questa carenza nella comprensione deteriora tutte le relazioni professionali e impedisce di costruire la fiducia necessaria per collaborare efficacemente.`,
    ESP: `[Nome] ha un network molto limitato. L'isolamento relazionale è un freno invisibile ma potente: senza connessioni, mancano opportunità, feedback e supporto. Il mondo professionale premia chi costruisce ponti.`,
  };
  const raw = base[lowest] || `${label} è l'area più critica per [Nome]. Lavorare su questo tratto avrà un effetto a cascata positivo su tutti gli altri aspetti del profilo.`;
  return personalizzaTesto(raw, nome, sesso);
}

// ─── Hidden resource narrative ────────────────────────────

function getHiddenResourceNarrative(highest: TraitCode, lowestCode: TraitCode, nome: string, sesso: string | null): string {
  const hLabel = TRAIT_LABELS[highest];
  const lLabel = TRAIT_LABELS[lowestCode];
  const raw = `La risorsa più forte di [Nome] è ${hLabel}. Questo tratto può essere usato come leva per compensare la debolezza in ${lLabel}. Ad esempio, sfruttando la naturale inclinazione verso ${hLabel.toLowerCase()}, si possono costruire abitudini e strategie che aggirino il limite principale. Il lavoro del manager è collegare il punto di forza al punto di debolezza: non chiedere a [Nome] di cambiare natura, ma di usare ciò che ha per colmare ciò che manca.`;
  return personalizzaTesto(raw, nome, sesso);
}

// ─── Growth plan phases ───────────────────────────────────

interface GrowthPhase {
  title: string;
  period: string;
  icon: typeof Clock;
  color: string;
  bgColor: string;
  objective: string;
  actions: string[];
  kpi: string;
}

function buildGrowthPlan(traits: Record<TraitCode, number>, nome: string, sesso: string | null): GrowthPhase[] {
  const belowThreshold = getTraitsBelowThreshold(traits, 20);
  const lowest = getLowestTrait(traits);
  const lowestLabel = TRAIT_LABELS[lowest.code];
  const secondLowest = belowThreshold.length > 1 ? belowThreshold[1] : null;

  return [
    {
      title: 'Stabilizzazione',
      period: '0 – 3 mesi',
      icon: Clock,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950/30',
      objective: personalizzaTesto(`Portare ${lowestLabel} fuori dalla zona critica. Focus esclusivo su un solo tratto per evitare dispersione.`, nome, sesso),
      actions: [
        personalizzaTesto(`Colloquio riservato con [Nome] per condividere il punto di partenza e definire aspettative realistiche`, nome, sesso),
        personalizzaTesto(`Assegnare a [Nome] un obiettivo settimanale misurabile legato a ${lowestLabel.toLowerCase()}`, nome, sesso),
        `Check-in bisettimanale di 15 minuti per monitorare i progressi`,
      ],
      kpi: `Miglioramento percepito su ${lowestLabel} (autovalutazione + feedback manager)`,
    },
    {
      title: 'Sviluppo Base',
      period: '3 – 6 mesi',
      icon: Target,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
      objective: personalizzaTesto(
        secondLowest
          ? `Estendere il lavoro a ${TRAIT_LABELS[secondLowest.code]}. Consolidare i progressi su ${lowestLabel}.`
          : `Consolidare i progressi su ${lowestLabel} e iniziare a lavorare sulle competenze complementari.`,
        nome, sesso
      ),
      actions: [
        personalizzaTesto(`Inserire [Nome] in un progetto dove possa esercitare le competenze in sviluppo`, nome, sesso),
        `Affiancare un collega senior come riferimento informale (non mentoring formale)`,
        `Revisione mensile degli obiettivi con feedback strutturato`,
      ],
      kpi: secondLowest
        ? `${TRAIT_LABELS[secondLowest.code]}: raggiungimento soglia minima accettabile`
        : `${lowestLabel}: consolidamento sopra soglia critica`,
    },
    {
      title: 'Consolidamento',
      period: '6 – 12 mesi',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
      objective: personalizzaTesto(`Verificare che i miglioramenti siano stabili e non situazionali. Preparare [Nome] per responsabilità maggiori.`, nome, sesso),
      actions: [
        personalizzaTesto(`Assegnare a [Nome] un obiettivo di medio termine che richieda i tratti su cui ha lavorato`, nome, sesso),
        `Raccogliere feedback dai colleghi per validare i progressi percepiti`,
        `Valutare se emergono nuove aree di lavoro non identificate inizialmente`,
      ],
      kpi: `Feedback 360° positivo sulle aree lavorate + risultati misurabili del progetto assegnato`,
    },
    {
      title: 'Maturità',
      period: '12 – 24 mesi',
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950/30',
      objective: personalizzaTesto(`Ricompilare il test per misurare oggettivamente i cambiamenti. Definire il prossimo step di crescita per [Nome].`, nome, sesso),
      actions: [
        personalizzaTesto(`Ripetizione dell’analisi Talent Profile per [Nome] — confronto prima/dopo`, nome, sesso),
        `Colloquio di bilancio: cosa è cambiato, cosa resta da fare`,
        `Definizione nuovo piano basato sui risultati aggiornati`,
      ],
      kpi: `Confronto punteggi test: variazione positiva sui tratti target ≥ 15 punti`,
    },
  ];
}

// ─── Component ────────────────────────────────────────────

export function GestioneAvanzataV3({ candidatoNome, candidatoSesso, traits, macroAree, eta }: GestioneAvanzataV3Props) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    radice: true,
    risorsa: false,
    circolo: false,
  });

  const lowest = getLowestTrait(traits);
  const highest = getHighestTrait(traits);

  // Cross patterns (critici only for "circolo vizioso")
  const personalizedPatterns = getPersonalizedPatterns(
    traits, macroAree, candidatoNome, candidatoSesso, eta
  );
  const { critici } = categorizePatterns(personalizedPatterns);

  // Growth plan
  const phases = buildGrowthPlan(traits, candidatoNome, candidatoSesso);

  const toggle = (key: string) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      {/* ─── QUADRO PSICOLOGICO ─── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Quadro Psicologico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Radice del Problema */}
          <Collapsible open={openSections.radice} onOpenChange={() => toggle('radice')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-semibold text-sm">Radice del Problema</span>
                <Badge variant="outline" className="text-xs border-red-300 text-red-700 dark:text-red-400">
                  {TRAIT_LABELS[lowest.code]}: {lowest.value}
                </Badge>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.radice && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getRootCauseNarrative(lowest.code, candidatoNome, candidatoSesso)}
              </p>
            </CollapsibleContent>
          </Collapsible>

          {/* Risorsa Nascosta */}
          <Collapsible open={openSections.risorsa} onOpenChange={() => toggle('risorsa')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-green-50 dark:bg-green-950/30 hover:bg-green-100 dark:hover:bg-green-950/50 transition-colors">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-green-600" />
                <span className="font-semibold text-sm">Risorsa Nascosta</span>
                <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:text-green-400">
                  {TRAIT_LABELS[highest.code]}: {highest.value}
                </Badge>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.risorsa && "rotate-180")} />
            </CollapsibleTrigger>
            <CollapsibleContent className="px-3 pt-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getHiddenResourceNarrative(highest.code, lowest.code, candidatoNome, candidatoSesso)}
              </p>
            </CollapsibleContent>
          </Collapsible>

          {/* Circolo Vizioso */}
          {critici.length > 0 && (
            <Collapsible open={openSections.circolo} onOpenChange={() => toggle('circolo')}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-sm">Circoli Viziosi</span>
                  <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 dark:text-amber-400">
                    {critici.length} pattern attivi
                  </Badge>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", openSections.circolo && "rotate-180")} />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 pt-3 space-y-3">
                {critici.slice(0, 3).map(({ pattern, testo }) => (
                  <div key={pattern.id} className="border-l-2 border-amber-400 pl-3">
                    <p className="font-medium text-sm">{pattern.nome}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{testo}</p>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* ─── PIANO DI CRESCITA 4 FASI ─── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Piano di Crescita
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-0">
          {/* Timeline */}
          <div className="relative">
            {phases.map((phase, idx) => {
              const Icon = phase.icon;
              const isLast = idx === phases.length - 1;
              return (
                <div key={phase.period} className="relative flex gap-4 pb-6">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-[15px] top-[32px] bottom-0 w-0.5 bg-border" />
                  )}
                  {/* Icon */}
                  <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center z-10", phase.bgColor)}>
                    <Icon className={cn("h-4 w-4", phase.color)} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn("font-semibold text-sm", phase.color)}>{phase.title}</span>
                      <Badge variant="outline" className="text-xs">{phase.period}</Badge>
                    </div>
                    <p className="text-sm text-foreground mb-2">{phase.objective}</p>
                    <ul className="space-y-1 mb-2">
                      {phase.actions.map((action, i) => (
                        <li key={i} className="text-xs text-muted-foreground flex gap-2">
                          <span className="text-muted-foreground/50 mt-0.5">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs font-medium text-muted-foreground">
                      📊 KPI: {phase.kpi}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nota temporale */}
          <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-muted/50 border">
            <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground italic">
              I tratti della personalità non cambiano in settimane. Ogni misurazione va fatta su base semestrale. 
              Il test andrebbe ripetuto non prima di 12 mesi dalla prima compilazione.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
