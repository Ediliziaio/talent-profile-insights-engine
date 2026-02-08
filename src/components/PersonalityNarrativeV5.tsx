/**
 * PersonalityNarrativeV5 - SEZIONE 2: Chi è [Nome] come Persona
 * 
 * Genera un "ritratto umano" dinamico diviso in 4 capitoli:
 * - Capitolo 1: COME PENSA (Area ESSERE)
 * - Capitolo 2: COME AGISCE (Area FARE)
 * - Capitolo 3: COME SI RELAZIONA (Area AVERE)
 * - Capitolo 4: STABILITÀ E PRINCIPI (Indicatori)
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Brain, Zap, Users, Shield, Lightbulb, Target, Heart, Star } from "lucide-react";
import { TraitCode, TRAIT_LABELS } from "@/types/database";
import { getTraitNarrative, getGPSpecialNarrative } from "@/lib/traitNarrativesV5";
import { getPersonalizedPatterns, categorizePatterns } from "@/lib/crossPatternsV5";

interface PersonalityNarrativeV5Props {
  candidatoNome: string;
  candidatoSesso: string | null;
  candidatoEta?: number;
  traits: Record<TraitCode, number>;
  macroAree: {
    essere: number;
    fare: number;
    avere: number;
  };
}

// Mappatura tratti per capitolo
const CAPITOLI = {
  essere: {
    titolo: "Come Pensa",
    sottotitolo: "Area ESSERE - La sua mente e i suoi obiettivi",
    icon: Brain,
    tratti: ['ORG', 'AUT', 'GP'] as TraitCode[],
    colore: 'bg-blue-500/10 text-blue-600 border-blue-200'
  },
  fare: {
    titolo: "Come Agisce",
    sottotitolo: "Area FARE - Le sue azioni concrete",
    icon: Zap,
    tratti: ['ADS', 'DET', 'VEN', 'HRM'] as TraitCode[],
    colore: 'bg-amber-500/10 text-amber-600 border-amber-200'
  },
  avere: {
    titolo: "Come si Relaziona",
    sottotitolo: "Area AVERE - Le sue relazioni",
    icon: Users,
    tratti: ['LDR', 'PRO', 'COM', 'ESP'] as TraitCode[],
    colore: 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
  },
  indicatori: {
    titolo: "Stabilità e Principi",
    sottotitolo: "Indicatori - Il suo equilibrio",
    icon: Shield,
    tratti: ['RC', 'FIN', 'SUC', 'PRI'] as TraitCode[],
    colore: 'bg-purple-500/10 text-purple-600 border-purple-200'
  }
};

// Helper per determinare il tratto più alto
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

// Componente per singolo tratto narrativo
function TraitNarrativeItem({ 
  tratto, 
  punteggio, 
  nome, 
  sesso,
  specialNote 
}: { 
  tratto: TraitCode; 
  punteggio: number; 
  nome: string; 
  sesso: string | null;
  specialNote?: string | null;
}) {
  const narrativa = getTraitNarrative(tratto, punteggio, nome, sesso);
  
  // Determina colore badge punteggio
  const getBadgeVariant = (p: number) => {
    if (p >= 50) return 'default';
    if (p >= 30) return 'secondary';
    if (p >= 0) return 'outline';
    return 'destructive';
  };

  return (
    <div className="border-b border-border/50 last:border-0 py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium text-foreground">
          {TRAIT_LABELS[tratto]}
        </span>
        <Badge variant={getBadgeVariant(punteggio)} className="text-xs">
          {punteggio > 0 ? '+' : ''}{punteggio}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {narrativa}
      </p>
      {specialNote && (
        <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <p className="text-sm text-amber-700 dark:text-amber-300">
            ⚠️ {specialNote}
          </p>
        </div>
      )}
    </div>
  );
}

// Componente per capitolo
function CapitoloSection({ 
  capitoloKey,
  candidatoNome,
  candidatoSesso,
  traits,
  highestTrait
}: { 
  capitoloKey: keyof typeof CAPITOLI;
  candidatoNome: string;
  candidatoSesso: string | null;
  traits: Record<TraitCode, number>;
  highestTrait: TraitCode;
}) {
  const capitolo = CAPITOLI[capitoloKey];
  const Icon = capitolo.icon;
  
  return (
    <AccordionItem value={capitoloKey} className="border rounded-lg mb-3 overflow-hidden">
      <AccordionTrigger className={`px-4 py-3 hover:no-underline ${capitolo.colore}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${capitolo.colore}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h4 className="font-semibold text-foreground">{capitolo.titolo}</h4>
            <p className="text-xs text-muted-foreground">{capitolo.sottotitolo}</p>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pt-4 pb-2">
        {capitolo.tratti.map((tratto) => {
          // Caso speciale per GP
          let specialNote = null;
          if (tratto === 'GP') {
            specialNote = getGPSpecialNarrative(
              traits[tratto], 
              highestTrait === 'GP',
              candidatoNome,
              candidatoSesso
            );
          }
          
          return (
            <TraitNarrativeItem
              key={tratto}
              tratto={tratto}
              punteggio={traits[tratto] || 0}
              nome={candidatoNome}
              sesso={candidatoSesso}
              specialNote={specialNote}
            />
          );
        })}
      </AccordionContent>
    </AccordionItem>
  );
}

// Componente per pattern cross-area
function CrossPatternsSection({
  candidatoNome,
  candidatoSesso,
  candidatoEta,
  traits,
  macroAree
}: {
  candidatoNome: string;
  candidatoSesso: string | null;
  candidatoEta?: number;
  traits: Record<TraitCode, number>;
  macroAree: { essere: number; fare: number; avere: number };
}) {
  const patterns = getPersonalizedPatterns(traits, macroAree, candidatoNome, candidatoSesso, candidatoEta);
  const { positivi, critici } = categorizePatterns(patterns);
  
  if (patterns.length === 0) return null;
  
  return (
    <div className="mt-6 space-y-4">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-primary" />
        Pattern Comportamentali
      </h4>
      
      {positivi.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Star className="h-4 w-4" />
            Punti di Forza Combinati
          </h5>
          {positivi.map(({ pattern, testo }) => (
            <div 
              key={pattern.id} 
              className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg"
            >
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-2">
                {pattern.nome}
              </p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400 leading-relaxed">
                {testo}
              </p>
            </div>
          ))}
        </div>
      )}
      
      {critici.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <Target className="h-4 w-4" />
            Aree di Attenzione
          </h5>
          {critici.map(({ pattern, testo }) => (
            <div 
              key={pattern.id} 
              className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg"
            >
              <p className="text-sm font-medium text-amber-700 dark:text-amber-300 mb-2">
                {pattern.nome}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400 leading-relaxed">
                {testo}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PersonalityNarrativeV5({
  candidatoNome,
  candidatoSesso,
  candidatoEta,
  traits,
  macroAree
}: PersonalityNarrativeV5Props) {
  const highestTrait = getHighestTrait(traits);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-primary" />
          Chi è {candidatoNome} come Persona
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Ritratto umano basato sul profilo comportamentale
        </p>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['essere']} className="w-full">
          <CapitoloSection 
            capitoloKey="essere" 
            candidatoNome={candidatoNome}
            candidatoSesso={candidatoSesso}
            traits={traits}
            highestTrait={highestTrait}
          />
          <CapitoloSection 
            capitoloKey="fare" 
            candidatoNome={candidatoNome}
            candidatoSesso={candidatoSesso}
            traits={traits}
            highestTrait={highestTrait}
          />
          <CapitoloSection 
            capitoloKey="avere" 
            candidatoNome={candidatoNome}
            candidatoSesso={candidatoSesso}
            traits={traits}
            highestTrait={highestTrait}
          />
          <CapitoloSection 
            capitoloKey="indicatori" 
            candidatoNome={candidatoNome}
            candidatoSesso={candidatoSesso}
            traits={traits}
            highestTrait={highestTrait}
          />
        </Accordion>
        
        <CrossPatternsSection
          candidatoNome={candidatoNome}
          candidatoSesso={candidatoSesso}
          candidatoEta={candidatoEta}
          traits={traits}
          macroAree={macroAree}
        />
      </CardContent>
    </Card>
  );
}
