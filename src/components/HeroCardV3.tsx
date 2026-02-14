/**
 * HeroCardV3 - Verdetto + Frase motivazionale + Gauge semicerchi
 * Sostituisce ExecutiveSummaryCardV5Updated
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfiloTipoV5, TraitCode } from '@/types/database';
import { FitVerdictV5, RoleMatchResultV5 } from '@/lib/roleMatchingV5';
import { calculateRoleMatchingV5Cached } from '@/lib/roleMatchingV5Cache';
import { getProfiloTipoV5Extended } from '@/lib/profiloTipoV5Extended';
import { getProfiloTipoV5Label } from '@/lib/scoringV5';
import { TraitScores } from '@/lib/syndromes';
import { personalizzaTesto } from '@/lib/traitNarrativesV5';
import { AreaGaugeSVG } from './AreaGaugeSVG';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeroCardV3Props {
  traitsV5?: Record<string, number>;
  esserePct?: number;
  farePct?: number;
  averePct?: number;
  profiloTipoV5?: ProfiloTipoV5 | null;
  ruoloRichiesto: string;
  candidatoNome: string;
  candidatoSesso: string | null;
  eta?: number | null;
  className?: string;
}

// Genera frase motivazionale deterministicamente dai tratti
function generateMotivationalPhrase(
  traits: Record<string, number>,
  nome: string,
  sesso: string | null,
  verdict: FitVerdictV5
): string {
  const isFemale = sesso?.toLowerCase() === 'f';
  const pronome = isFemale ? 'la' : 'lo';
  
  if (verdict === 'IDONEO') {
    if ((traits.LDR ?? 0) > 50 && (traits.AUT ?? 0) > 50) {
      return `${nome} è ${isFemale ? 'una' : 'un'} leader ${isFemale ? 'nata' : 'nato'}: si muove con visione e trascina il team.`;
    }
    if ((traits.ADS ?? 0) > 50 && (traits.ORG ?? 0) > 40) {
      return `${nome} è ${isFemale ? 'una' : 'un'} professionista ${isFemale ? 'affidabile' : 'affidabile'} e ${isFemale ? 'metodica' : 'metodico'}, su cui si può contare.`;
    }
    return `${nome} ha le qualità giuste per questo ruolo. Il suo profilo indica una buona probabilità di successo.`;
  }
  
  if (verdict === 'IDONEO_CON_RISERVA') {
    if ((traits.GP ?? 50) < 30) {
      return `${nome} ha potenziale, ma sta attraversando un periodo di pressione che ne limita l'espressione.`;
    }
    return `${nome} ha buone basi ma alcune aree richiedono attenzione e sviluppo mirato.`;
  }
  
  if (verdict === 'DA_VALUTARE') {
    return `Il profilo di ${nome} richiede un approfondimento in colloquio per capire il contesto attuale.`;
  }
  
  // NON_IDONEO
  return `Il profilo attuale di ${nome} non è compatibile con questo ruolo. Valutiamo alternative.`;
}

const VERDICT_CONFIG: Record<FitVerdictV5, {
  emoji: string;
  label: string;
  bgClass: string;
  textClass: string;
  borderColor: string;
  icon: typeof CheckCircle2;
}> = {
  IDONEO: {
    emoji: '✅',
    label: 'IDONEO',
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    textClass: 'text-green-700 dark:text-green-400',
    borderColor: '#16A34A',
    icon: CheckCircle2,
  },
  IDONEO_CON_RISERVA: {
    emoji: '⚠️',
    label: 'CON RISERVA',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    textClass: 'text-amber-700 dark:text-amber-400',
    borderColor: '#D97706',
    icon: AlertTriangle,
  },
  DA_VALUTARE: {
    emoji: '🔍',
    label: 'DA VALUTARE',
    bgClass: 'bg-blue-50 dark:bg-blue-950/30',
    textClass: 'text-blue-700 dark:text-blue-400',
    borderColor: '#2563EB',
    icon: AlertCircle,
  },
  NON_IDONEO: {
    emoji: '❌',
    label: 'NON IDONEO',
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    textClass: 'text-red-700 dark:text-red-400',
    borderColor: '#DC2626',
    icon: XCircle,
  },
};

export function HeroCardV3({
  traitsV5,
  esserePct,
  farePct,
  averePct,
  profiloTipoV5,
  ruoloRichiesto,
  candidatoNome,
  candidatoSesso,
  eta,
  className,
}: HeroCardV3Props) {
  // Calculate matching
  const isMobile = useIsMobile();
  let matching: RoleMatchResultV5 | null = null;
  if (traitsV5 && Object.keys(traitsV5).length > 0) {
    const traitScores: TraitScores = {
      ORG: traitsV5.ORG ?? 0, AUT: traitsV5.AUT ?? 0, GP: traitsV5.GP ?? 0,
      ADS: traitsV5.ADS ?? 0, DET: traitsV5.DET ?? 0, VEN: traitsV5.VEN ?? 0,
      HRM: traitsV5.HRM ?? 0, LDR: traitsV5.LDR ?? 0, PRO: traitsV5.PRO ?? 0,
      COM: traitsV5.COM ?? 0, ESP: traitsV5.ESP ?? 0, RC: traitsV5.RC ?? 0,
      FIN: traitsV5.FIN ?? 0, SUC: traitsV5.SUC ?? 0, PRI: traitsV5.PRI ?? 0,
    };
    matching = calculateRoleMatchingV5Cached(ruoloRichiesto, traitScores, eta ?? undefined);
  }

  const verdict = (matching?.verdict as FitVerdictV5) || 'DA_VALUTARE';
  const config = VERDICT_CONFIG[verdict];
  const profiloInfo = profiloTipoV5 ? getProfiloTipoV5Extended(profiloTipoV5) : null;
  const motivationalPhrase = traitsV5
    ? generateMotivationalPhrase(traitsV5, candidatoNome, candidatoSesso, verdict)
    : '';

  return (
    <Card
      className={cn(className)}
      style={{ borderLeft: `4px solid ${config.borderColor}` }}
    >
      <CardContent className={cn('p-3 sm:p-5 md:p-6', config.bgClass)}>
        <div className="flex flex-col md:flex-row md:items-center gap-4 sm:gap-6">
          {/* Left 60%: Verdict */}
          <div className="flex-1 space-y-2 sm:space-y-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl">{config.emoji}</span>
              <div>
                <h2 className={cn('text-xl sm:text-2xl md:text-3xl font-bold', config.textClass)}>
                  {config.label}
                </h2>
                <p className="text-sm text-muted-foreground">
                  per il ruolo di <span className="font-medium">{ruoloRichiesto}</span>
                </p>
              </div>
            </div>

            {/* Motivational phrase */}
            {motivationalPhrase && (
              <p className="text-sm italic text-muted-foreground leading-relaxed">
                "{motivationalPhrase}"
              </p>
            )}

            {/* Profile type badge */}
            {profiloInfo && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{profiloInfo.emoji}</span>
                <Badge variant="outline" className={cn('text-xs', profiloInfo.colorClass)}>
                  {profiloInfo.label}
                </Badge>
              </div>
            )}
          </div>

          {/* Right 40%: Gauges */}
          {esserePct !== undefined && farePct !== undefined && averePct !== undefined && (
            <>
              <div className="hidden md:block border-l border-border/50 self-stretch" />
              <div className="flex items-center justify-around md:justify-end gap-3 sm:gap-4 md:gap-6 bg-white/50 dark:bg-white/5 rounded-xl p-2 md:p-3">
                <AreaGaugeSVG value={esserePct} label="ESSERE" color="#3B82F6" size={isMobile ? 70 : 100} />
                <AreaGaugeSVG value={farePct} label="FARE" color="#F59E0B" size={isMobile ? 70 : 100} />
                <AreaGaugeSVG value={averePct} label="AVERE" color="#8B5CF6" size={isMobile ? 70 : 100} />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
