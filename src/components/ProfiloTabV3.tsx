/**
 * ProfiloTabV3 - Tab 2: Chi è [Nome]
 * 
 * Sezioni:
 * 1. Grafico barre orizzontali 15 tratti
 * 2. Narrativa "Chi è [Nome]" (4 accordion per area)
 * 3. Punti di Forza e Aree di Lavoro
 * 4. Profilo Tipo accordion
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Heart, Brain, Zap, Users, Shield, TrendingUp, TrendingDown, UserCog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TraitCode, TRAIT_LABELS, ProfiloTipoV5 } from '@/types/database';
import { TraitBarChart } from './TraitBarChart';
import { getTraitNarrative, getGPSpecialNarrative, personalizzaTesto } from '@/lib/traitNarrativesV5';
import { getProfiloTipoV5Extended } from '@/lib/profiloTipoV5Extended';

interface ProfiloTabV3Props {
  candidatoNome: string;
  candidatoSesso: string | null;
  traits: Record<TraitCode, number>;
  macroAree: { essere: number; fare: number; avere: number };
  profiloTipoV5?: ProfiloTipoV5 | null;
}

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

// Strengths/weaknesses descriptions
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

export function ProfiloTabV3({
  candidatoNome,
  candidatoSesso,
  traits,
  macroAree,
  profiloTipoV5,
}: ProfiloTabV3Props) {
  const topStrengths = getTopTraits(traits, 'highest', 3);
  const topWeaknesses = getTopTraits(traits, 'lowest', 3);
  const highestTrait = getHighestTrait(traits);
  const profiloInfo = profiloTipoV5 ? getProfiloTipoV5Extended(profiloTipoV5) : null;

  return (
    <div className="space-y-6">
      {/* 1. Trait chart */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Profilo Comportamentale di {candidatoNome}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TraitBarChart traits={traits} showValueLabels={true} />
        </CardContent>
      </Card>

      {/* 2. Narrative accordions */}
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

      {/* 3. Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Strengths */}
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

        {/* Weaknesses */}
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

      {/* 4. Profile Type accordion */}
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
                    {profiloInfo.ruoliIdeali.map((ruolo, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{ruolo}</Badge>
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
    </div>
  );
}
