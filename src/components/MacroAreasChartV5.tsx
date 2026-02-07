/**
 * MacroAreasChartV5 - Visualizzazione Macro-Aree V5
 * 
 * Mostra le 3 macro-aree ESSERE, FARE, AVERE con:
 * - Barre orizzontali colorate per percentuale
 * - Tratti inclusi in ogni macro-area
 * - Sindromi attive con severity
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Target, Brain, Activity, Users, 
  AlertTriangle, CheckCircle2, XCircle, AlertCircle,
  TrendingUp, TrendingDown, Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TraitCode, TRAIT_LABELS, MACRO_AREA_TRAITS, MacroAreaCode } from '@/types/database';
import { SyndromeResult } from '@/lib/syndromes';

interface MacroAreasChartV5Props {
  esserePct: number;
  farePct: number;
  averePct: number;
  traitsV5?: Record<string, number>;
  syndromes?: SyndromeResult[];
  showTraitDetails?: boolean;
  className?: string;
}

// Configurazione macro-aree
const MACRO_AREA_CONFIG: Record<MacroAreaCode, {
  label: string;
  description: string;
  icon: typeof Target;
  color: string;
  bgColor: string;
  borderColor: string;
}> = {
  ESSERE: {
    label: 'ESSERE',
    description: 'Concentrazione sugli obiettivi',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-950',
    borderColor: 'border-blue-500',
  },
  FARE: {
    label: 'FARE',
    description: 'Azioni concrete e operative',
    icon: Activity,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-950',
    borderColor: 'border-green-500',
  },
  AVERE: {
    label: 'AVERE',
    description: 'Relazioni che stabilizzano il valore',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-950',
    borderColor: 'border-purple-500',
  },
};

// Colore dinamico per percentuale
function getPercentageColor(pct: number): string {
  if (pct >= 70) return 'bg-green-500';
  if (pct >= 50) return 'bg-blue-500';
  if (pct >= 35) return 'bg-amber-500';
  return 'bg-red-500';
}

function getPercentageTextColor(pct: number): string {
  if (pct >= 70) return 'text-green-600';
  if (pct >= 50) return 'text-blue-600';
  if (pct >= 35) return 'text-amber-600';
  return 'text-red-600';
}

function getTrendIcon(pct: number) {
  if (pct >= 60) return <TrendingUp className="h-4 w-4 text-green-500" />;
  if (pct >= 40) return <Minus className="h-4 w-4 text-amber-500" />;
  return <TrendingDown className="h-4 w-4 text-red-500" />;
}

// Severity colori
const SEVERITY_CONFIG = {
  RED: { label: 'Critica', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
  ORANGE: { label: 'Attenzione', color: 'bg-orange-100 text-orange-800 border-orange-300', icon: AlertTriangle },
  YELLOW: { label: 'Info', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: AlertCircle },
};

export function MacroAreasChartV5({
  esserePct,
  farePct,
  averePct,
  traitsV5,
  syndromes = [],
  showTraitDetails = true,
  className,
}: MacroAreasChartV5Props) {
  const areas: { code: MacroAreaCode; pct: number }[] = [
    { code: 'ESSERE', pct: esserePct },
    { code: 'FARE', pct: farePct },
    { code: 'AVERE', pct: averePct },
  ];

  // Filtra solo sindromi attive
  const activeSyndromes = syndromes.filter(s => s.isActive);
  const criticalSyndromes = activeSyndromes.filter(s => s.severity === 'RED');
  const warningSyndromes = activeSyndromes.filter(s => s.severity === 'ORANGE');
  const infoSyndromes = activeSyndromes.filter(s => s.severity === 'YELLOW');

  return (
    <Card className={cn("border-2", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Macro-Aree V5
        </CardTitle>
        <CardDescription>
          Distribuzione competenze: ESSERE (obiettivi), FARE (azioni), AVERE (relazioni)
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Barre Macro-Aree */}
        <div className="space-y-4">
          {areas.map(({ code, pct }) => {
            const config = MACRO_AREA_CONFIG[code];
            const Icon = config.icon;
            const traits = MACRO_AREA_TRAITS[code];

            return (
              <div key={code} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
                      <Icon className={cn("h-4 w-4", config.color)} />
                    </div>
                    <div>
                      <span className="font-semibold text-sm">{config.label}</span>
                      <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                        {config.description}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(pct)}
                    <span className={cn("text-2xl font-bold", getPercentageTextColor(pct))}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="relative">
                  <div className="h-4 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", getPercentageColor(pct))}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  {/* Markers */}
                  <div className="absolute inset-0 flex">
                    <div className="w-[35%] border-r border-muted-foreground/20" />
                    <div className="w-[15%] border-r border-muted-foreground/20" />
                    <div className="w-[20%] border-r border-muted-foreground/20" />
                  </div>
                </div>

                {/* Tratti con valori */}
                {showTraitDetails && traitsV5 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <TooltipProvider>
                      {traits.map(trait => {
                        const value = traitsV5[trait] ?? 0;
                        const isPositive = value > 0;
                        const isNegative = value < -15;
                        
                        return (
                          <Tooltip key={trait}>
                            <TooltipTrigger>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs cursor-help",
                                  isNegative && "border-red-400 bg-red-50 text-red-700",
                                  isPositive && value > 30 && "border-green-400 bg-green-50 text-green-700"
                                )}
                              >
                                {TRAIT_LABELS[trait]}: {value > 0 ? '+' : ''}{value}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="font-semibold">{TRAIT_LABELS[trait]}</p>
                              <p className="text-xs">Punteggio: {value} (scala -100/+100)</p>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex flex-wrap justify-center gap-4 pt-2 text-xs text-muted-foreground border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>&lt;35% Critico</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>35-50% Attenzione</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span>50-70% Adeguato</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span>&gt;70% Eccellente</span>
          </div>
        </div>

        {/* Sindromi Attive */}
        {activeSyndromes.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Sindromi Rilevate ({activeSyndromes.length})
            </h4>

            {/* Critiche (RED) */}
            {criticalSyndromes.length > 0 && (
              <div className="space-y-2">
                {criticalSyndromes.map(s => (
                  <Alert key={s.code} variant="destructive" className="py-2">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm font-bold">
                      [{s.code}] {s.name}
                    </AlertTitle>
                    <AlertDescription className="text-xs">
                      {s.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Attenzione (ORANGE) */}
            {warningSyndromes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {warningSyndromes.map(s => (
                  <TooltipProvider key={s.code}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge 
                          variant="outline" 
                          className="bg-orange-100 text-orange-800 border-orange-300"
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {s.code}: {s.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">{s.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}

            {/* Info (YELLOW) */}
            {infoSyndromes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {infoSyndromes.map(s => (
                  <TooltipProvider key={s.code}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge 
                          variant="outline" 
                          className="bg-yellow-100 text-yellow-800 border-yellow-300"
                        >
                          {s.code}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-semibold">{s.name}</p>
                        <p className="max-w-xs text-xs">{s.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
