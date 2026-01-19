import { cn } from '@/lib/utils';
import { AlertTriangle, Activity, Shield, TrendingDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { StressZoneSeverity, getStressZoneSeverityLabel } from '@/lib/stressZone';

interface StressZoneHeroProps {
  sv: number;
  cf: number;
  severity: StressZoneSeverity;
  className?: string;
}

const SEVERITY_CONFIG = {
  nessuna: {
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    borderClass: 'border-green-200 dark:border-green-800',
    textClass: 'text-green-700 dark:text-green-300',
    iconBgClass: 'bg-green-100 dark:bg-green-900/50',
    progressClass: 'bg-green-500',
    label: 'Nessuna',
    description: 'SV e CF nella norma. Il candidato dispone di buone risorse personali e resilienza.'
  },
  lieve: {
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-300 dark:border-amber-700',
    textClass: 'text-amber-700 dark:text-amber-300',
    iconBgClass: 'bg-amber-100 dark:bg-amber-900/50',
    progressClass: 'bg-amber-500',
    label: 'Lieve',
    description: 'Situazione di lieve difficoltà ma gestibile. Monitorare senza allarmarsi, inserimento normale con check-up periodici.'
  },
  moderata: {
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    borderClass: 'border-orange-400 dark:border-orange-600',
    textClass: 'text-orange-700 dark:text-orange-300',
    iconBgClass: 'bg-orange-100 dark:bg-orange-900/50',
    progressClass: 'bg-orange-500',
    label: 'Moderata',
    description: 'Segnali di difficoltà moderata. Consigliato inserimento graduale con supporto e checkpoint regolari dopo 30-60-90 giorni.'
  },
  severa: {
    bgClass: 'bg-red-50 dark:bg-red-950/30',
    borderClass: 'border-red-400 dark:border-red-500',
    textClass: 'text-red-700 dark:text-red-300',
    iconBgClass: 'bg-red-100 dark:bg-red-900/50',
    progressClass: 'bg-red-500',
    label: 'Severa',
    description: 'Condizione di elevata vulnerabilità. Colloquio approfondito OBBLIGATORIO. Verificare situazione personale e capacità di gestione dello stress prima di procedere.'
  },
  critica: {
    bgClass: 'bg-destructive/10',
    borderClass: 'border-destructive',
    textClass: 'text-destructive',
    iconBgClass: 'bg-destructive/20',
    progressClass: 'bg-destructive',
    label: 'Critica',
    description: 'SITUAZIONE DI CRISI GRAVE. Risorse personali quasi nulle. ASSUNZIONE FORTEMENTE SCONSIGLIATA senza valutazione specialistica approfondita.'
  }
};

export function StressZoneHero({ sv, cf, severity, className }: StressZoneHeroProps) {
  const config = SEVERITY_CONFIG[severity];
  const isActive = severity !== 'nessuna';
  
  // Calcola la percentuale per i progress (0-100 da 0-200)
  const svPercent = Math.min(100, Math.max(0, sv / 2));
  const cfPercent = Math.min(100, Math.max(0, cf / 2));
  
  // Progress inverso per stress zone (più basso = peggiore)
  const severityLevel = 
    severity === 'nessuna' ? 100 :
    severity === 'lieve' ? 75 :
    severity === 'moderata' ? 50 :
    severity === 'severa' ? 25 : 10;

  if (!isActive) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl border-2 p-5",
        config.borderClass, config.bgClass,
        className
      )}>
        <div className="flex items-center gap-4">
          <div className={cn("p-3 rounded-full", config.iconBgClass)}>
            <Shield className={cn("h-6 w-6", config.textClass)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn("text-lg font-bold", config.textClass)}>
                Stress Zone Non Attiva
              </h3>
              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                OK
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
        
        {/* Mini indicators */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Stile di Vita (SV)</span>
              <span className="font-medium">{sv}/200</span>
            </div>
            <Progress value={svPercent} className="h-2" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Capacità Fronteggiare (CF)</span>
              <span className="font-medium">{cf}/200</span>
            </div>
            <Progress value={cfPercent} className="h-2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border-2 p-5",
      config.borderClass, config.bgClass,
      className
    )}>
      {/* Animated background gradient for critical levels */}
      {(severity === 'critica' || severity === 'severa') && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
      )}
      
      {/* Header with icon and severity */}
      <div className="relative flex items-start gap-4 mb-4">
        <div className={cn(
          "p-3 rounded-full shrink-0",
          config.iconBgClass,
          (severity === 'critica' || severity === 'severa') && "animate-pulse"
        )}>
          <AlertTriangle className={cn("h-7 w-7", config.textClass)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className={cn("text-xl font-bold", config.textClass)}>
              STRESS ZONE
            </h3>
            <Badge 
              variant="outline" 
              className={cn(
                "font-bold uppercase text-xs",
                severity === 'critica' && "bg-destructive text-destructive-foreground border-destructive",
                severity === 'severa' && "bg-red-500 text-white border-red-500",
                severity === 'moderata' && "bg-orange-500 text-white border-orange-500",
                severity === 'lieve' && "bg-amber-500 text-white border-amber-500"
              )}
            >
              {config.label}
            </Badge>
          </div>
          <p className={cn("text-sm", config.textClass, "opacity-90")}>
            {config.description}
          </p>
        </div>
      </div>
      
      {/* Progress bars for SV and CF */}
      <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className={cn("h-4 w-4", sv < 100 ? "text-destructive" : "text-muted-foreground")} />
              <span className="text-sm font-medium">Stile di Vita (SV)</span>
            </div>
            <span className={cn(
              "text-sm font-bold",
              sv < 60 ? "text-destructive" : sv < 80 ? "text-orange-600" : sv < 100 ? "text-amber-600" : "text-green-600"
            )}>
              {sv}/200
            </span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                sv < 60 ? "bg-destructive" : sv < 80 ? "bg-orange-500" : sv < 100 ? "bg-amber-500" : "bg-green-500"
              )}
              style={{ width: `${svPercent}%` }}
            />
            {/* Threshold indicator at 100 (50%) */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-muted-foreground/30" />
          </div>
          <p className="text-xs text-muted-foreground">
            {sv < 80 ? 'Problemi significativi nella sfera personale' : 
             sv < 100 ? 'Leggere difficoltà personali' : 
             'Sfera personale equilibrata'}
          </p>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className={cn("h-4 w-4", cf < 100 ? "text-destructive" : "text-muted-foreground")} />
              <span className="text-sm font-medium">Capacità Fronteggiare (CF)</span>
            </div>
            <span className={cn(
              "text-sm font-bold",
              cf < 60 ? "text-destructive" : cf < 80 ? "text-orange-600" : cf < 100 ? "text-amber-600" : "text-green-600"
            )}>
              {cf}/200
            </span>
          </div>
          <div className="relative h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
                cf < 60 ? "bg-destructive" : cf < 80 ? "bg-orange-500" : cf < 100 ? "bg-amber-500" : "bg-green-500"
              )}
              style={{ width: `${cfPercent}%` }}
            />
            {/* Threshold indicator at 100 (50%) */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-muted-foreground/30" />
          </div>
          <p className="text-xs text-muted-foreground">
            {cf < 80 ? 'Bassa resilienza allo stress' : 
             cf < 100 ? 'Resilienza moderata' : 
             'Buona capacità di fronteggiare'}
          </p>
        </div>
      </div>
      
      {/* Recommendation box */}
      <div className={cn(
        "relative p-4 rounded-lg border",
        severity === 'critica' ? "bg-destructive/10 border-destructive/30" :
        severity === 'severa' ? "bg-red-100/50 border-red-300 dark:bg-red-900/20 dark:border-red-700" :
        "bg-white/50 border-current/20 dark:bg-black/20"
      )}>
        <h4 className={cn("font-semibold text-sm mb-1", config.textClass)}>
          Raccomandazione HR
        </h4>
        <p className="text-sm text-muted-foreground">
          {severity === 'critica' && 
            "❌ NON PROCEDERE senza valutazione specialistica. Rischio elevatissimo di performance instabili e abbandono precoce."}
          {severity === 'severa' && 
            "⚠️ Colloquio approfondito OBBLIGATORIO. Esplorare situazione personale, risorse di supporto e piani di gestione dello stress."}
          {severity === 'moderata' && 
            "👁️ Inserimento graduale consigliato. Prevedere checkpoint a 30-60-90 giorni. Evitare pressione eccessiva nei primi mesi."}
          {severity === 'lieve' && 
            "📋 Monitoraggio periodico. Inserimento normale ma con attenzione ai segnali di stress. Favorire work-life balance."}
        </p>
      </div>
    </div>
  );
}
