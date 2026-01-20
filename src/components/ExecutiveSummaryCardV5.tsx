/**
 * ExecutiveSummaryCardV5 - Componente Deterministico per Executive Summary
 * 
 * Calcola TUTTO senza AI basandosi sul Manuale V5:
 * - Verdetto HR (4 livelli)
 * - Compatibilità Ruolo %
 * - Probabilità Successo a 12 mesi
 * - Profilo sintetico dal database profiloDetailedDescriptions
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle2, XCircle, AlertCircle, AlertTriangle, 
  Target, TrendingUp, Clock, Shield, Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfiloTipo } from '@/types/database';
import { calculateRoleMatching, getVerdictLabel, FitVerdict } from '@/lib/roleMatching';
import { getProfiloDetailedDescription } from '@/lib/profiloDetailedDescriptions';
import { calculateSuccessProbability } from '@/lib/fitScoring';

interface ExecutiveSummaryCardV5Props {
  scalePunteggi: Record<string, number>;
  ruoloRichiesto: string;
  profiloTipo: ProfiloTipo | null;
  eta?: number | null;
  stressZone?: boolean;
  className?: string;
}

export function ExecutiveSummaryCardV5({
  scalePunteggi,
  ruoloRichiesto,
  profiloTipo,
  eta,
  stressZone = false,
  className
}: ExecutiveSummaryCardV5Props) {
  // Calcola matching ruolo
  const matching = calculateRoleMatching(ruoloRichiesto, scalePunteggi);
  
  // Calcola probabilità successo deterministicamente
  const successProbability = calculateSuccessProbability({
    scalePunteggi,
    ruolo: ruoloRichiesto,
    eta: eta || undefined,
    stressZone,
    profiloTipo: profiloTipo || undefined,
  });
  
  // Ottieni descrizione profilo
  const profiloInfo = getProfiloDetailedDescription(profiloTipo);
  
  // Configurazione visiva per verdetto
  const verdictConfig: Record<FitVerdict, {
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
      label: 'IDONEO CON RISERVA',
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
  
  const config = verdictConfig[matching.verdict];
  const VerdictIcon = config.icon;
  
  // Calcola livello rischio dal profilo
  const riskLevel = profiloInfo?.livelloRischio || 'medio';
  const riskConfig = {
    'basso': { color: 'text-green-600', bg: 'bg-green-100', label: 'Basso' },
    'medio': { color: 'text-amber-600', bg: 'bg-amber-100', label: 'Medio' },
    'alto': { color: 'text-red-600', bg: 'bg-red-100', label: 'Alto' },
  };
  
  return (
    <Card className={cn(
      "border-2 overflow-hidden",
      config.borderColor,
      className
    )}>
      {/* Header con Verdetto Prominente */}
      <div className={cn("p-4 sm:p-6", config.bgColor)}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Verdetto Grande */}
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-4 bg-background",
              config.borderColor
            )}>
              <VerdictIcon className={cn("h-8 w-8 sm:h-10 sm:w-10", config.textColor)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Verdetto HR</p>
              <h2 className={cn("text-2xl sm:text-3xl font-bold", config.textColor)}>
                {config.label}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {getVerdictLabel(matching.verdict)}
              </p>
            </div>
          </div>
          
          {/* Metriche Principali */}
          <div className="flex gap-6 sm:gap-8">
            {/* Compatibilità Ruolo */}
            <div className="text-center">
              <div className={cn(
                "text-3xl sm:text-4xl font-bold",
                matching.compatibilitaPct >= 70 ? "text-green-600" :
                matching.compatibilitaPct >= 50 ? "text-amber-600" : "text-red-600"
              )}>
                {matching.compatibilitaPct}%
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-center">
                <Target className="h-3 w-3" />
                Compatibilità
              </p>
            </div>
            
            {/* Probabilità Successo 12m */}
            <div className="text-center">
              <div className={cn(
                "text-3xl sm:text-4xl font-bold",
                successProbability >= 70 ? "text-green-600" :
                successProbability >= 50 ? "text-amber-600" : "text-red-600"
              )}>
                {successProbability}%
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-center">
                <Clock className="h-3 w-3" />
                Successo 12m
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <CardContent className="pt-4 sm:pt-6 space-y-4">
        {/* Barra Progresso Compatibilità */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Compatibilità con {ruoloRichiesto}</span>
            <span className="font-medium">{matching.compatibilitaPct}%</span>
          </div>
          <Progress value={matching.compatibilitaPct} className="h-3" />
        </div>
        
        {/* Grid con KPI */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Requisiti */}
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-green-600 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-bold text-lg">{matching.requisitiSoddisfatti.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Requisiti OK</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-red-600 mb-1">
              <XCircle className="h-4 w-4" />
              <span className="font-bold text-lg">{matching.requisitiMancanti.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Mancanti</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 text-amber-600 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-bold text-lg">{matching.attenzioni}</span>
            </div>
            <p className="text-xs text-muted-foreground">Attenzioni</p>
          </div>
          
          <div className="bg-muted/50 rounded-lg p-3 text-center">
            <div className={cn("flex items-center justify-center gap-1.5 mb-1", riskConfig[riskLevel].color)}>
              <Shield className="h-4 w-4" />
              <span className="font-bold text-sm">{riskConfig[riskLevel].label}</span>
            </div>
            <p className="text-xs text-muted-foreground">Rischio</p>
          </div>
        </div>
        
        {/* Profilo Sintetico */}
        {profiloInfo && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">{profiloInfo.titolo}</h4>
              <Badge variant="outline" className="text-xs ml-auto">
                {profiloInfo.motto}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {profiloInfo.chiE}
            </p>
          </div>
        )}
        
        {/* Alert Stress Zone */}
        {stressZone && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Stress Zone Attiva</strong> - Il candidato sta attraversando un momento di difficoltà. 
              Valutare con attenzione il contesto lavorativo e il supporto disponibile.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Motivazione */}
        <div className={cn(
          "p-3 rounded-lg border text-sm",
          config.bgColor,
          config.borderColor
        )}>
          <p className={cn("font-medium", config.textColor)}>
            {matching.motivazione}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
