/**
 * CompatibilitaTabV3 - Tab 1: Compatibilità con il ruolo
 * 
 * Sezioni:
 * 1. Grafico barre con soglie
 * 2. Conteggio requisiti
 * 3. Segnalazioni (sindromi in linguaggio naturale)
 * 4. Ruoli alternativi (se NON IDONEO)
 * 5. Attendibilità accordion
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, XCircle, AlertTriangle, Star, Shield, Target, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TraitCode, TRAIT_LABELS, ReliabilityIndex } from '@/types/database';
import { TraitBarChart } from './TraitBarChart';
import {
  RoleMatchResultV5,
  FitVerdictV5,
  ROLE_PROFILES_V5,
  getVerdictBadgeVariantV5,
} from '@/lib/roleMatchingV5';
import { calculateRoleMatchingV5Cached, calculateAllRolesCompatibilityV5Cached } from '@/lib/roleMatchingV5Cache';
import { TraitScores, SyndromeResult } from '@/lib/syndromes';
import { SYNDROMES_V5_DATA } from '@/lib/syndromesV5Data';

interface CompatibilitaTabV3Props {
  traitsV5: Record<string, number>;
  ruoloRichiesto: string;
  candidatoNome: string;
  candidatoSesso: string | null;
  candidateAge?: number;
  syndromes: SyndromeResult[];
  reliabilityIndex?: ReliabilityIndex;
}

// Friendly syndrome labels (no codes)
function getSyndromeHRLabel(code: string): string {
  const data = SYNDROMES_V5_DATA[code];
  if (!data) return 'Segnalazione comportamentale';
  
  // Map codes to human-friendly titles
  const labels: Record<string, string> = {
    S01: 'Atteggiamento sistematicamente negativo',
    S02: 'Personalità potenzialmente manipolativa',
    S03: 'Comportamento imprevedibile e dirompente',
    S04: 'Tendenza a demotivare il team',
    S05: 'Atteggiamento demotivante verso i colleghi',
    S06: 'Possibili problemi di integrità professionale',
    S07: 'Tendenza a iniziare senza completare',
    S08: 'Profilo troppo uniforme – prestazioni reali inferiori',
    S09: 'Fa l\'opposto di quanto richiesto',
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
  
  return labels[code] || data.name;
}

export function CompatibilitaTabV3({
  traitsV5,
  ruoloRichiesto,
  candidatoNome,
  candidatoSesso,
  candidateAge,
  syndromes,
  reliabilityIndex,
}: CompatibilitaTabV3Props) {
  const traitScores: TraitScores = {
    ORG: traitsV5.ORG ?? 0, AUT: traitsV5.AUT ?? 0, GP: traitsV5.GP ?? 0,
    ADS: traitsV5.ADS ?? 0, DET: traitsV5.DET ?? 0, VEN: traitsV5.VEN ?? 0,
    HRM: traitsV5.HRM ?? 0, LDR: traitsV5.LDR ?? 0, PRO: traitsV5.PRO ?? 0,
    COM: traitsV5.COM ?? 0, ESP: traitsV5.ESP ?? 0, RC: traitsV5.RC ?? 0,
    FIN: traitsV5.FIN ?? 0, SUC: traitsV5.SUC ?? 0, PRI: traitsV5.PRI ?? 0,
  };

  const result = calculateRoleMatchingV5Cached(ruoloRichiesto, traitScores, candidateAge);
  const allRoles = calculateAllRolesCompatibilityV5Cached(ruoloRichiesto, traitScores, candidateAge);
  const roleProfile = ROLE_PROFILES_V5[ruoloRichiesto];

  // Build thresholds for the chart
  const thresholds = roleProfile?.requisiti.map(r => ({
    trait: r.trait,
    soglia: r.soglia,
    tipo: r.tipo as 'min' | 'max' | 'range',
  })) || [];

  const totalRequisiti = result.requisitiSoddisfatti.length + result.requisitiMancanti.length;
  const activeSyndromes = syndromes.filter(s => s.isActive && s.code !== 'SS4'); // Exclude positive SS4

  return (
    <div className="space-y-6">
      {/* 1. Trait chart with thresholds */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="h-4 w-4" />
            Requisiti per {ruoloRichiesto}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TraitBarChart
            traits={traitsV5}
            thresholds={thresholds}
            showThresholdIndicator
          />
        </CardContent>
      </Card>

      {/* 2. Requirements count */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-500" />
          <span className="font-medium">
            Soddisfatti {result.requisitiSoddisfatti.length}/{totalRequisiti} requisiti fondamentali
          </span>
        </div>
        <Badge variant={getVerdictBadgeVariantV5(result.verdict)} className="text-sm px-3 py-1">
          {result.compatibilitaPct}%
        </Badge>
      </div>

      {/* 3. Syndrome signals */}
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
              
              // YELLOW
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

      {/* 4. Alternative roles (only if NON_IDONEO or DA_VALUTARE) */}
      {(result.verdict === 'NON_IDONEO' || result.verdict === 'DA_VALUTARE') && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" />
              Ruoli Alternativi Consigliati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {allRoles.tuttiRuoli
              .filter(r => r.ruolo !== ruoloRichiesto && r.compatibilita >= 50)
              .sort((a, b) => b.compatibilita - a.compatibilita)
              .slice(0, 5)
              .map((r, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm font-medium flex-1">{r.ruolo}</span>
                  <Progress value={r.compatibilita} className="w-24 h-2" />
                  <Badge variant={getVerdictBadgeVariantV5(r.verdict)} className="text-xs w-14 justify-center">
                    {r.compatibilita}%
                  </Badge>
                </div>
              ))}
            {allRoles.ruoloIdeale && allRoles.ruoloIdeale.ruolo !== ruoloRichiesto && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 Ruolo ideale: <strong>{allRoles.ruoloIdeale.ruolo}</strong> ({allRoles.ruoloIdeale.compatibilita}%)
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* 5. Reliability accordion */}
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
