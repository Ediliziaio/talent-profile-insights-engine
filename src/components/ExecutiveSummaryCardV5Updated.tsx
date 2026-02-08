/**
 * ExecutiveSummaryCardV5Updated - Versione aggiornata per dati V5 nativi
 * 
 * Supporta:
 * - Tratti V5 nativi (traitsV5) 
 * - Fallback a scalePunteggi V4 per retrocompatibilità
 * - Sindromi V5
 * - Macro-aree V5
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, XCircle, AlertCircle, AlertTriangle, 
  Target, TrendingUp, Clock, Shield, Award, Brain, Sparkles, Lightbulb, BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfiloTipo, ProfiloTipoV5, TraitCode, ReliabilityIndex } from '@/types/database';
import { 
  calculateRoleMatchingV5, 
  getVerdictLabelV5, 
  getVerdictBadgeVariantV5,
  FitVerdictV5,
  RoleMatchResultV5 
} from '@/lib/roleMatchingV5';
import { getProfiloDetailedDescription } from '@/lib/profiloDetailedDescriptions';
import { getProfiloTipoV5Extended, PROFILI_TIPO_V5_EXTENDED } from '@/lib/profiloTipoV5Extended';

// Helper: Calcola probabilità successo dai tratti V5
function calculateSuccessProbabilityFromTraits(
  traitsV5: Record<string, number> | undefined,
  compatibilitaPct: number,
  stressZone: boolean
): number {
  if (!traitsV5) return 50;
  
  let base = compatibilitaPct;
  
  // Bonus/malus da tratti chiave
  const pro = traitsV5.PRO ?? 0;
  const esp = traitsV5.ESP ?? 0;
  const aut = traitsV5.AUT ?? 0;
  const org = traitsV5.ORG ?? 0;
  
  if (pro > 30) base += 5;
  if (esp > 30) base += 3;
  if (aut > 30) base += 3;
  if (org > 30) base += 2;
  if (stressZone) base -= 15;
  
  return Math.max(20, Math.min(95, Math.round(base)));
}
import { getActiveSyndromes, TraitScores, SyndromeResult } from '@/lib/syndromes';
import { getProfiloTipoV5Label } from '@/lib/scoringV5';

interface ExecutiveSummaryCardV5UpdatedProps {
  // V5 native data
  traitsV5?: Record<string, number>;
  esserePct?: number;
  farePct?: number;
  averePct?: number;
  profiloTipoV5?: ProfiloTipoV5 | null;
  reliabilityIndex?: ReliabilityIndex;
  syndromesDetected?: SyndromeResult[];
  
  // Legacy V4 data (fallback)
  scalePunteggi?: Record<string, number>;
  profiloTipo?: ProfiloTipo | null;
  
  // Common props
  ruoloRichiesto: string;
  eta?: number | null;
  stressZone?: boolean;
  assessmentVersion?: 'v4' | 'v5';
  className?: string;
}

export function ExecutiveSummaryCardV5Updated({
  traitsV5,
  esserePct,
  farePct,
  averePct,
  profiloTipoV5,
  reliabilityIndex,
  syndromesDetected,
  scalePunteggi,
  profiloTipo,
  ruoloRichiesto,
  eta,
  stressZone = false,
  assessmentVersion = 'v4',
  className
}: ExecutiveSummaryCardV5UpdatedProps) {
  
  // Calcola matching V5
  let matching: RoleMatchResultV5 | null = null;
  let syndromes: SyndromeResult[] = [];
  
  if (traitsV5 && Object.keys(traitsV5).length > 0) {
    const traitScores: TraitScores = {
      ORG: traitsV5.ORG ?? 0,
      AUT: traitsV5.AUT ?? 0,
      GP: traitsV5.GP ?? 0,
      ADS: traitsV5.ADS ?? 0,
      DET: traitsV5.DET ?? 0,
      VEN: traitsV5.VEN ?? 0,
      HRM: traitsV5.HRM ?? 0,
      LDR: traitsV5.LDR ?? 0,
      PRO: traitsV5.PRO ?? 0,
      COM: traitsV5.COM ?? 0,
      ESP: traitsV5.ESP ?? 0,
      RC: traitsV5.RC ?? 0,
      FIN: traitsV5.FIN ?? 0,
      SUC: traitsV5.SUC ?? 0,
      PRI: traitsV5.PRI ?? 0,
    };
    matching = calculateRoleMatchingV5(ruoloRichiesto, traitScores, eta ?? undefined);
    syndromes = syndromesDetected || getActiveSyndromes(traitScores, eta ?? undefined);
  }
  
  // Valori da mostrare
  const verdict = matching?.verdict;
  const compatibilitaPct = matching?.compatibilitaPct ?? 0;
  const motivazione = matching?.motivazione ?? '';
  
  // Calcola probabilità successo deterministicamente
  const successProbability = calculateSuccessProbabilityFromTraits(traitsV5, matching?.compatibilitaPct ?? 0, stressZone);
  
  // Profilo info - V5 o V4 fallback
  const profiloInfoV5 = profiloTipoV5 ? getProfiloTipoV5Extended(profiloTipoV5) : null;
  const profiloInfo = profiloTipo ? getProfiloDetailedDescription(profiloTipo) : null;
  
  // Configurazione verdetto
  const verdictConfigV5: Record<FitVerdictV5, {
    bgColor: string;
    textColor: string;
    borderColor: string;
    icon: typeof CheckCircle2;
    label: string;
  }> = {
    'IDONEO': {
      bgColor: 'bg-green-100 dark:bg-green-950',
      textColor: 'text-green-700 dark:text-green-400',
      borderColor: 'border-green-500',
      icon: CheckCircle2,
      label: 'IDONEO',
    },
    'IDONEO_CON_RISERVA': {
      bgColor: 'bg-blue-100 dark:bg-blue-950',
      textColor: 'text-blue-700 dark:text-blue-400',
      borderColor: 'border-blue-500',
      icon: AlertCircle,
      label: 'CON RISERVA',
    },
    'DA_VALUTARE': {
      bgColor: 'bg-amber-100 dark:bg-amber-950',
      textColor: 'text-amber-700 dark:text-amber-400',
      borderColor: 'border-amber-500',
      icon: AlertTriangle,
      label: 'DA VALUTARE',
    },
    'NON_IDONEO': {
      bgColor: 'bg-red-100 dark:bg-red-950',
      textColor: 'text-red-700 dark:text-red-400',
      borderColor: 'border-red-500',
      icon: XCircle,
      label: 'NON IDONEO',
    },
  };
  
  const config = verdict ? verdictConfigV5[verdict as FitVerdictV5] : null;
  const VerdictIcon = config?.icon || AlertCircle;
  
  // Rischio
  const riskLevel = profiloInfo?.livelloRischio || 'medio';
  const riskConfig = {
    'basso': { color: 'text-green-600', bg: 'bg-green-100', label: 'Basso' },
    'medio': { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Medio' },
    'alto': { color: 'text-red-600', bg: 'bg-red-100', label: 'Alto' },
  };
  
  // Critical syndromes check
  const hasCriticalSyndromes = syndromes.some(s => 
    ['S01', 'S02', 'S03', 'S04'].includes(s.code) && s.isActive
  );
  
  // Fascia Guru check (RC tra -14 e +14 = creativi ma dispersivi)
  const rcValue = traitsV5?.RC ?? null;
  const isFasciaGuru = traitsV5 && rcValue !== null && rcValue >= -14 && rcValue <= 14;
  
  return (
    <Card className={cn(
      "border-2 overflow-hidden",
      config?.borderColor || 'border-muted',
      className
    )}>
      {/* Version badge */}
      <div className="absolute top-2 right-2">
        <Badge variant="outline" className="text-xs">V5</Badge>
      </div>
      
      {/* Header con Verdetto */}
      <div className={cn("p-3 sm:p-4 md:p-6", config?.bgColor || 'bg-muted')}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Verdetto */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className={cn(
              "w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center border-4 bg-background shrink-0",
              config?.borderColor || 'border-muted'
            )}>
              <VerdictIcon className={cn("h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10", config?.textColor || 'text-muted-foreground')} />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Verdetto HR</p>
              <h2 className={cn("text-lg sm:text-2xl md:text-3xl font-bold leading-tight", config?.textColor || 'text-foreground')}>
                {config?.label || 'N/D'}
              </h2>
              {profiloTipoV5 && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {getProfiloTipoV5Label(profiloTipoV5)}
                </p>
              )}
            </div>
          </div>
          
          {/* Metriche */}
          <div className="flex gap-4 sm:gap-6 md:gap-8 justify-around sm:justify-end">
            {/* Compatibilità */}
            <div className="text-center">
              <div className={cn(
                "text-2xl sm:text-3xl md:text-4xl font-bold",
                (compatibilitaPct ?? 0) >= 70 ? "text-green-600" :
                (compatibilitaPct ?? 0) >= 50 ? "text-amber-600" : "text-red-600"
              )}>
                {compatibilitaPct ?? 0}%
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 flex items-center gap-1 justify-center">
                <Target className="h-3 w-3" />
                Compatibilità
              </p>
            </div>
            
            {/* Successo 12m */}
            <div className="text-center">
              <div className={cn(
                "text-2xl sm:text-3xl md:text-4xl font-bold",
                successProbability >= 70 ? "text-green-600" :
                successProbability >= 50 ? "text-amber-600" : "text-red-600"
              )}>
                {successProbability}%
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 flex items-center gap-1 justify-center">
                <Clock className="h-3 w-3" />
                Successo 12m
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="pt-3 sm:pt-4 md:pt-6 space-y-3 sm:space-y-4 px-3 sm:px-6">
        {/* Barra Compatibilità */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs sm:text-sm">
            <span className="text-muted-foreground truncate mr-2">Compatibilità con {ruoloRichiesto}</span>
            <span className="font-medium shrink-0">{compatibilitaPct ?? 0}%</span>
          </div>
          <Progress value={compatibilitaPct ?? 0} className="h-2 sm:h-3" />
        </div>
        
        {/* Macro-aree V5 */}
        {esserePct !== undefined && farePct !== undefined && averePct !== undefined && (
          <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-muted/50">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">{esserePct.toFixed(0)}%</div>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1">
                <Brain className="h-3 w-3" />
                ESSERE
              </p>
            </div>
            <div className="text-center border-x border-muted">
              <div className="text-lg font-bold text-green-600">{farePct.toFixed(0)}%</div>
              <p className="text-[10px] text-muted-foreground">FARE</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{averePct.toFixed(0)}%</div>
              <p className="text-[10px] text-muted-foreground">AVERE</p>
            </div>
          </div>
        )}
        
        {/* Attendibilità */}
        {reliabilityIndex && (
          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
            <span className="text-xs text-muted-foreground">Attendibilità Test</span>
            <Badge 
              variant={reliabilityIndex === 'YES' ? 'default' : reliabilityIndex === 'CAUTION' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {reliabilityIndex === 'YES' ? 'AFFIDABILE' : 
               reliabilityIndex === 'CAUTION' ? 'CAUTELA' : 
               reliabilityIndex === 'FORCED' ? 'FORZATO' : 'NON AFFIDABILE'}
            </Badge>
          </div>
        )}
        
        {/* KPI Grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-0.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span className="font-bold text-sm sm:text-lg">
                {matching?.requisitiSoddisfatti.length || 0}
              </span>
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">OK</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-red-600 mb-0.5">
              <XCircle className="h-3.5 w-3.5" />
              <span className="font-bold text-sm sm:text-lg">
                {matching?.requisitiMancanti.length || 0}
              </span>
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">Manca</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 mb-0.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="font-bold text-sm sm:text-lg">
                {syndromes.length}
              </span>
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">Sindr.</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 text-center">
            <div className={cn("flex items-center justify-center gap-1 mb-0.5", riskConfig[riskLevel].color)}>
              <Shield className="h-3.5 w-3.5" />
              <span className="font-bold text-[10px] sm:text-sm">{riskConfig[riskLevel].label}</span>
            </div>
            <p className="text-[9px] sm:text-xs text-muted-foreground">Rischio</p>
          </div>
        </div>
        
        {/* Profilo Sintetico V5 */}
        {profiloInfoV5 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl">{profiloInfoV5.emoji}</span>
              <h4 className="text-xs sm:text-sm font-semibold">{profiloInfoV5.label}</h4>
              <Badge variant="outline" className={profiloInfoV5.colorClass}>
                {profiloInfoV5.labelBreve}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {profiloInfoV5.descrizioneBreve}
            </p>
            {/* Testo esteso */}
            <div className={cn("p-3 rounded-lg text-xs leading-relaxed", profiloInfoV5.bgColorClass)}>
              <p className="text-foreground/80 whitespace-pre-line">
                {profiloInfoV5.descrizioneEstesa.split('\n\n')[0]}
              </p>
            </div>
            {/* Punti chiave */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <p className="text-[10px] font-medium text-green-600 mb-1 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Punti di Forza
                </p>
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  {profiloInfoV5.puntiForza.slice(0, 3).map((p, i) => (
                    <li key={i} className="truncate">• {p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[10px] font-medium text-amber-600 mb-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Attenzione
                </p>
                <ul className="text-[10px] text-muted-foreground space-y-0.5">
                  {profiloInfoV5.areeAttenzione.slice(0, 3).map((p, i) => (
                    <li key={i} className="truncate">• {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Fallback a profilo V4 se non V5 */}
        {!profiloInfoV5 && profiloInfo && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Award className="h-3.5 w-3.5 text-primary" />
              <h4 className="text-xs sm:text-sm font-semibold">{profiloInfo.titolo}</h4>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
              {profiloInfo.chiE}
            </p>
          </div>
        )}
        
        {/* Alerts */}
        {hasCriticalSyndromes && (
          <Alert variant="destructive" className="py-2">
            <XCircle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              <strong>Sindrome Critica Rilevata</strong> - Candidatura ad alto rischio. Valutazione approfondita necessaria.
            </AlertDescription>
          </Alert>
        )}
        
        {stressZone && !hasCriticalSyndromes && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              <strong>Stress Zone Attiva</strong> - Momento di difficoltà. Valutare contesto.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Fascia Guru Alert (RC -14 a +14) */}
        {isFasciaGuru && !hasCriticalSyndromes && (
          <Alert className="py-2 border-purple-500 bg-purple-50 dark:bg-purple-950">
            <Lightbulb className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-xs sm:text-sm text-purple-800 dark:text-purple-300">
              <strong>Fascia Guru (RC = {rcValue})</strong> - Profilo creativo e aperto al cambiamento, ma potenzialmente dispersivo. 
              Vulcano di idee, può faticare a completare progetti. Richiede guida e struttura per essere produttivo.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Motivazione */}
        {motivazione && (
          <div className={cn(
            "p-2.5 sm:p-3 rounded-lg border text-xs sm:text-sm",
            config?.bgColor || 'bg-muted',
            config?.borderColor || 'border-muted'
          )}>
            <p className={cn("font-medium leading-relaxed", config?.textColor || 'text-foreground')}>
              {motivazione}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
