/**
 * ProfiloUnificatoTab - Tab unificato Profilo + Compatibilità
 * 
 * Ordine sezioni:
 * 1. Grafico barre con soglie ruolo
 * 2. Conteggio requisiti soddisfatti
 * 3. Segnalazioni sindromi
 * 4. Grafico barre comportamentale (senza soglie)
 * 5. Narrativa "Chi è [Nome]"
 * 6. Punti di Forza e Aree di Lavoro
 * 7. Ruoli alternativi (algoritmici unificati)
 * 8. Profilo Tipo accordion
 * 9. Attendibilità accordion
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  CheckCircle2, AlertTriangle, Star, Shield, Target, ArrowRight,
  Heart, Brain, Zap, Users, TrendingUp, TrendingDown, UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TraitCode, TRAIT_LABELS, ProfiloTipoV5, ReliabilityIndex } from '@/types/database';
import { TraitBarChart } from './TraitBarChart';
import { getTraitNarrative, getGPSpecialNarrative, personalizzaTesto } from '@/lib/traitNarrativesV5';
import { getProfiloTipoV5Extended } from '@/lib/profiloTipoV5Extended';
import {
  ROLE_PROFILES_V5,
  RUOLI_V5,
  getVerdictBadgeVariantV5,
} from '@/lib/roleMatchingV5';
import { calculateRoleMatchingV5Cached, calculateAllRolesCompatibilityV5Cached } from '@/lib/roleMatchingV5Cache';
import { TraitScores, SyndromeResult } from '@/lib/syndromes';
import { SYNDROMES_V5_DATA } from '@/lib/syndromesV5Data';

interface ProfiloUnificatoTabProps {
  traitsV5: Record<string, number>;
  ruoloRichiesto: string;
  candidatoNome: string;
  candidatoSesso: string | null;
  candidateAge?: number;
  syndromes: SyndromeResult[];
  reliabilityIndex?: ReliabilityIndex;
  traits: Record<TraitCode, number>;
  macroAree: { essere: number; fare: number; avere: number };
  profiloTipoV5?: ProfiloTipoV5 | null;
}

// ─── Syndrome labels ───
function getSyndromeHRLabel(code: string): string {
  const labels: Record<string, string> = {
    S01: 'Atteggiamento sistematicamente negativo',
    S02: 'Personalità potenzialmente manipolativa',
    S03: 'Comportamento imprevedibile e dirompente',
    S04: 'Tendenza a demotivare il team',
    S05: 'Atteggiamento demotivante verso i colleghi',
    S06: 'Possibili problemi di integrità professionale',
    S07: 'Tendenza a iniziare senza completare',
    S08: 'Profilo troppo uniforme – prestazioni reali inferiori',
    S09: "Fa l'opposto di quanto richiesto",
    S10: 'Genera disaccordi senza rendersene conto',
    S11: 'Reagisce male ai disaccordi',
    S12: 'Risultati commerciali inferiori alle attese',
    S13: 'Valori professionali disallineati',
    S14: 'Non adatto a ruoli di precisione',
    S15: 'Profilo complessivamente basso',
    S16: 'Difficoltà relazionali marcate',
    S17: 'Evita le situazioni difficili',
    S18: 'Ego molto sviluppato, resiste al feedback',
    S19: 'Forte resistenza ai cambiamenti',
    S20: 'Eccessiva dispersione e impulsività',
    SS1: 'Fa le cose ma non le delega',
    SS2: 'Genera conflitti sotto pressione',
    SS3: 'Perfezionismo eccessivo',
    SS4: 'Profilo esecutore positivo',
    SS5: 'Troppo disponibile, non si impone',
  };
  return labels[code] || SYNDROMES_V5_DATA[code]?.name || 'Segnalazione comportamentale';
}

// ─── Narrative chapters ───
const CAPITOLI = [
  {
    key: 'essere',
    titolo: 'Come Pensa',
    sottotitolo: 'Organizzazione, motivazione e gestione delle pressioni',
    icon: Brain,
    tratti: ['ORG', 'AUT', 'GP'] as TraitCode[],
    colorClass: 'text-blue-600',
    bgClass: 'bg-blue-50/50 dark:bg-blue-950/20',
  },
  {
    key: 'fare',
    titolo: 'Come Agisce',
    sottotitolo: 'Disciplina, determinazione e capacità operative',
    icon: Zap,
    tratti: ['ADS', 'DET', 'VEN', 'HRM'] as TraitCode[],
    colorClass: 'text-amber-600',
    bgClass: 'bg-amber-50/50 dark:bg-amber-950/20',
  },
  {
    key: 'avere',
    titolo: 'Come si Relaziona',
    sottotitolo: 'Leadership, proattività, comprensione e networking',
    icon: Users,
    tratti: ['LDR', 'PRO', 'COM', 'ESP'] as TraitCode[],
    colorClass: 'text-purple-600',
    bgClass: 'bg-purple-50/50 dark:bg-purple-950/20',
  },
  {
    key: 'indicatori',
    titolo: 'Stabilità e Principi',
    sottotitolo: 'Resistenza al cambiamento, finanze, successo e valori',
    icon: Shield,
    tratti: ['RC', 'FIN', 'SUC', 'PRI'] as TraitCode[],
    colorClass: 'text-gray-600',
    bgClass: 'bg-gray-50/50 dark:bg-gray-800/10',
  },
];

// ─── Strength/weakness descriptions ───
const STRENGTH_DESC: Partial<Record<TraitCode, string>> = {
  ORG: "[Nome] porta ordine e chiarezza in ogni progetto. La capacità di pianificare e gestire le priorità libera il team da incertezze.",
  AUT: "[Nome] si muove con energia e determinazione senza bisogno di stimoli esterni.",
  GP: "[Nome] mantiene la calma anche nelle situazioni più tese.",
  ADS: "[Nome] è una garanzia di affidabilità: quando prende un impegno, lo mantiene.",
  DET: "[Nome] dice le cose come stanno, con rispetto ma senza giri di parole.",
  VEN: "[Nome] sa accendere l'entusiasmo nelle persone.",
  HRM: "[Nome] fa crescere le persone che gestisce.",
  LDR: "[Nome] è un punto di riferimento naturale.",
  PRO: "[Nome] affronta i problemi cercando soluzioni, non colpevoli.",
  COM: "[Nome] accoglie le diversità con apertura genuina.",
  ESP: "[Nome] ha una rete di contatti ampia e diversificata.",
  RC: "[Nome] è coerente e prevedibile nei comportamenti.",
  FIN: "[Nome] gestisce le risorse con oculatezza e visione.",
  SUC: "[Nome] ha una storia di risultati concreti.",
  PRI: "[Nome] ha principi professionali solidi e allineati.",
};

const WEAKNESS_DESC: Partial<Record<TraitCode, string>> = {
  ORG: "[Nome] fatica a tenere il filo delle attività quando la complessità aumenta.",
  AUT: "[Nome] ha bisogno di stimoli esterni per attivarsi.",
  GP: "[Nome] sta subendo l'influenza negativa di qualcuno.",
  ADS: "[Nome] fatica a mantenere gli impegni presi.",
  DET: "[Nome] evita le conversazioni difficili.",
  VEN: "[Nome] fatica a coinvolgere e entusiasmare.",
  HRM: "[Nome] non riesce a far crescere le persone che gestisce.",
  LDR: "[Nome] fatica a farsi seguire.",
  PRO: "[Nome] tende a prendere le cose sul personale.",
  COM: "[Nome] fatica ad accogliere punti di vista diversi.",
  ESP: "[Nome] lavora in isolamento relazionale.",
  RC: "[Nome] è instabile nelle convinzioni, cambia idea frequentemente.",
  FIN: "[Nome] non presta attenzione alla gestione finanziaria.",
  SUC: "[Nome] non ha ancora raggiunto stabilità nella carriera.",
  PRI: "[Nome] ha principi professionali disallineati.",
};

function getTopTraits(traits: Record<TraitCode, number>, direction: 'highest' | 'lowest', count = 3) {
  return Object.entries(traits)
    .filter(([k]) => k !== 'CTRL')
    .sort((a, b) => direction === 'highest' ? b[1] - a[1] : a[1] - b[1])
    .slice(0, count)
    .map(([tratto, punteggio]) => ({ tratto: tratto as TraitCode, punteggio }));
}

function getHighestTrait(traits: Record<TraitCode, number>): TraitCode {
  let maxTrait: TraitCode = 'ORG';
  let maxValue = -Infinity;
  for (const [trait, value] of Object.entries(traits)) {
    if (trait !== 'CTRL' && value > maxValue) {
      maxValue = value;
      maxTrait = trait as TraitCode;
    }
  }
  return maxTrait;
}

export function ProfiloUnificatoTab({
  traitsV5,
  ruoloRichiesto,
  candidatoNome,
  candidatoSesso,
  candidateAge,
  syndromes,
  reliabilityIndex,
  traits,
  macroAree,
  profiloTipoV5,
}: ProfiloUnificatoTabProps) {
  const [selectedRuolo, setSelectedRuolo] = useState(ruoloRichiesto);

  // ─── Role matching (algorithmic) ───
  const traitScores: TraitScores = {
    ORG: traitsV5.ORG ?? 0, AUT: traitsV5.AUT ?? 0, GP: traitsV5.GP ?? 0,
    ADS: traitsV5.ADS ?? 0, DET: traitsV5.DET ?? 0, VEN: traitsV5.VEN ?? 0,
    HRM: traitsV5.HRM ?? 0, LDR: traitsV5.LDR ?? 0, PRO: traitsV5.PRO ?? 0,
    COM: traitsV5.COM ?? 0, ESP: traitsV5.ESP ?? 0, RC: traitsV5.RC ?? 0,
    FIN: traitsV5.FIN ?? 0, SUC: traitsV5.SUC ?? 0, PRI: traitsV5.PRI ?? 0,
  };

  const result = calculateRoleMatchingV5Cached(selectedRuolo, traitScores, candidateAge);
  const allRoles = calculateAllRolesCompatibilityV5Cached(selectedRuolo, traitScores, candidateAge);
  const roleProfile = ROLE_PROFILES_V5[selectedRuolo];

  const thresholds = roleProfile?.requisiti.map(r => ({
    trait: r.trait,
    soglia: r.soglia,
    tipo: r.tipo as 'min' | 'max' | 'range',
  })) || [];

  const totalRequisiti = result.requisitiSoddisfatti.length + result.requisitiMancanti.length;
  const activeSyndromes = syndromes.filter(s => s.isActive && s.code !== 'SS4');

  // ─── Profile helpers ───
  const topStrengths = getTopTraits(traits, 'highest', 3);
  const topWeaknesses = getTopTraits(traits, 'lowest', 3);
  const highestTrait = getHighestTrait(traits);
  const profiloInfo = profiloTipoV5 ? getProfiloTipoV5Extended(profiloTipoV5) : null;

  // Top algorithmic roles for profile type section
  const topAlgorithmicRoles = allRoles.tuttiRuoli
    .filter(r => r.compatibilita >= 50)
    .sort((a, b) => b.compatibilita - a.compatibilita)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ═══ 1. Profilo Comportamentale unificato con soglie ruolo ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Profilo Comportamentale di {candidatoNome}
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">Soglie per:</span>
              <Select value={selectedRuolo} onValueChange={setSelectedRuolo}>
                <SelectTrigger className="w-[220px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RUOLI_V5.map((ruolo) => (
                    <SelectItem key={ruolo} value={ruolo} className="text-xs">
                      {ruolo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <TraitBarChart traits={traitsV5} thresholds={thresholds} showThresholdIndicator showValueLabels />
        </CardContent>
      </Card>

      {/* ═══ 3. Segnalazioni sindromi ═══ */}
      {activeSyndromes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Segnalazioni ({activeSyndromes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSyndromes.map((syndrome) => {
              const data = SYNDROMES_V5_DATA[syndrome.code];
              const hrLabel = getSyndromeHRLabel(syndrome.code);

              if (syndrome.severity === 'RED') {
                return (
                  <div key={syndrome.code} className="p-4 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">{hrLabel}</p>
                    {data && (
                      <p className="text-sm text-red-700 dark:text-red-400 mt-1 leading-relaxed">
                        {data.organizationalImpact.slice(0, 200)}...
                      </p>
                    )}
                  </div>
                );
              }
              if (syndrome.severity === 'ORANGE') {
                return (
                  <div key={syndrome.code} className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">{hrLabel}</p>
                    {data && (
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                        {data.shortDescription}
                      </p>
                    )}
                  </div>
                );
              }
              return (
                <div key={syndrome.code} className="flex items-start gap-2 p-3 rounded-lg border">
                  <Badge variant="outline" className="text-xs border-yellow-400 bg-yellow-50 text-yellow-700 shrink-0 mt-0.5">
                    Nota
                  </Badge>
                  <p className="text-sm text-muted-foreground">{hrLabel}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}


      {/* ═══ 5. Narrativa "Chi è [Nome]" ═══ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Chi è {candidatoNome}</CardTitle>
          <p className="text-sm text-muted-foreground">Ritratto comportamentale in linguaggio naturale</p>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['essere']} className="w-full">
            {CAPITOLI.map((cap) => (
              <AccordionItem key={cap.key} value={cap.key} className="border rounded-lg mb-3 overflow-hidden">
                <AccordionTrigger className={cn('px-4 py-3 hover:no-underline', cap.bgClass)}>
                  <div className="flex items-center gap-3">
                    <cap.icon className={cn('h-5 w-5', cap.colorClass)} />
                    <div className="text-left">
                      <h4 className="font-semibold text-foreground">{cap.titolo}</h4>
                      <p className="text-xs text-muted-foreground">{cap.sottotitolo}</p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-4 pb-2">
                  {cap.tratti.map((tratto) => {
                    const narrativa = getTraitNarrative(tratto, traits[tratto] || 0, candidatoNome, candidatoSesso);
                    let specialNote: string | null = null;
                    if (tratto === 'GP') {
                      specialNote = getGPSpecialNarrative(traits[tratto], highestTrait === 'GP', candidatoNome, candidatoSesso);
                    }
                    return (
                      <div key={tratto} className="border-b border-border/50 last:border-0 py-4 first:pt-0 last:pb-0">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground">{TRAIT_LABELS[tratto]}</span>
                          <Badge
                            variant={traits[tratto] >= 50 ? 'default' : traits[tratto] >= 0 ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {traits[tratto] > 0 ? '+' : ''}{traits[tratto]}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{narrativa}</p>
                        {specialNote && (
                          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
                            <p className="text-sm text-amber-700 dark:text-amber-300">⚠️ {specialNote}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* ═══ 6. Punti di Forza e Aree di Lavoro ═══ */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-green-600">
              <TrendingUp className="h-4 w-4" />
              Punti di Forza
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topStrengths.map(({ tratto, punteggio }) => (
              <div key={tratto} className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{TRAIT_LABELS[tratto]}</span>
                  <Badge variant="default" className="bg-green-500 text-xs">+{punteggio}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {personalizzaTesto(STRENGTH_DESC[tratto] || '', candidatoNome, candidatoSesso)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-600">
              <TrendingDown className="h-4 w-4" />
              Aree di Lavoro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topWeaknesses.map(({ tratto, punteggio }) => (
              <div key={tratto} className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm">{TRAIT_LABELS[tratto]}</span>
                  <Badge variant="outline" className="text-xs">{punteggio > 0 ? '+' : ''}{punteggio}</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {personalizzaTesto(WEAKNESS_DESC[tratto] || '', candidatoNome, candidatoSesso)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ═══ 7. Ruoli alternativi (algoritmici, sempre visibili) ═══ */}
      {topAlgorithmicRoles.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Ruoli più compatibili
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topAlgorithmicRoles.map((r, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium flex-1">{r.ruolo}</span>
                <Progress value={r.compatibilita} className="w-24 h-2" />
                <Badge variant={getVerdictBadgeVariantV5(r.verdict)} className="text-xs w-14 justify-center">
                  {r.compatibilita}%
                </Badge>
              </div>
            ))}
            {allRoles.ruoloIdeale && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 Ruolo ideale: <strong>{allRoles.ruoloIdeale.ruolo}</strong> ({allRoles.ruoloIdeale.compatibilita}%)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ 8. Profilo Tipo accordion ═══ */}
      {profiloInfo && (
        <Accordion type="single" collapsible>
          <AccordionItem value="profilo-tipo" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-3">
                <span className="text-xl">{profiloInfo.emoji}</span>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Profilo: {profiloInfo.label}</h4>
                  <p className="text-xs text-muted-foreground">{profiloInfo.descrizioneBreve}</p>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className={cn('p-4 rounded-lg text-sm leading-relaxed', profiloInfo.bgColorClass)}>
                <p className="whitespace-pre-line">{profiloInfo.descrizioneEstesa.split('\n\n')[0]}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
                    <UserCog className="h-4 w-4" /> Come gestirlo
                  </h5>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {profiloInfo.comeGestirlo.map((tip, i) => (
                      <li key={i}>• {tip}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-sm font-semibold mb-2">Ruoli ideali</h5>
                  <div className="flex flex-wrap gap-1.5">
                    {topAlgorithmicRoles.slice(0, 4).map((r, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{r.ruolo} ({r.compatibilita}%)</Badge>
                    ))}
                  </div>
                  {profiloInfo.ruoliDaEvitare.length > 0 && (
                    <>
                      <h5 className="text-sm font-semibold mt-3 mb-2">Ruoli da evitare</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {profiloInfo.ruoliDaEvitare.map((ruolo, i) => (
                          <Badge key={i} variant="outline" className="text-xs text-red-600 border-red-200">{ruolo}</Badge>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* ═══ 9. Attendibilità accordion ═══ */}
      {reliabilityIndex && (
        <Accordion type="single" collapsible>
          <AccordionItem value="attendibilita" className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="h-4 w-4" />
                Attendibilità del test
                <Badge
                  variant={reliabilityIndex === 'YES' ? 'default' : reliabilityIndex === 'CAUTION' ? 'secondary' : 'destructive'}
                  className="text-xs ml-2"
                >
                  {reliabilityIndex === 'YES' ? 'Affidabile' : reliabilityIndex === 'CAUTION' ? 'Cautela' : 'Bassa'}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {reliabilityIndex === 'YES' && `Il test di ${candidatoNome} risulta attendibile. Le risposte sono coerenti e il profilo riflette con buona probabilità il reale comportamento della persona.`}
                {reliabilityIndex === 'CAUTION' && `Il test mostra alcune risposte non del tutto coerenti. Il profilo è utilizzabile ma va letto con una certa cautela, approfondendo in colloquio i tratti più estremi.`}
                {reliabilityIndex === 'NO' && `Diverse risposte risultano incoerenti. Il profilo va usato solo come spunto per il colloquio, non come base per decisioni. Si consiglia di ripetere il test.`}
                {reliabilityIndex === 'ZERO' && `L'alto numero di risposte incoerenti rende il profilo non utilizzabile. Si consiglia di ripetere il test in condizioni ottimali (ambiente tranquillo, nessuna pressione).`}
                {reliabilityIndex === 'FORCED' && `Il test sembra essere stato compilato in modo forzato o casuale. I risultati non sono attendibili.`}
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
