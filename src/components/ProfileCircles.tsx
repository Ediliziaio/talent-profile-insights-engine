import { cn } from '@/lib/utils';
import { SCALE_LABELS, ScalaCode } from '@/types/database';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface ProfileCirclesProps {
  leadership_pct: number;
  maturita_pct: number;
  potenziale_pct: number;
  scale_punteggi: Record<string, number>;
}

interface CircleProps {
  title: string;
  subtitle: string;
  tooltip: string;
  percentage: number;
  color: string;
  scales: { code: ScalaCode; label: string; value: number }[];
}

function CircularProgress({ percentage, color, size = 140 }: { percentage: number; color: string; size?: number }) {
  const radius = (size - 14) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        className="transform -rotate-90"
        width={size}
        height={size}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-muted/20"
        />
        {/* Progress circle with animation */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          strokeLinecap="round"
          className={cn(color, "drop-shadow-sm")}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

function ScaleBar({ label, value }: { label: string; value: number }) {
  const normalizedValue = ((value - 0) / 200) * 100;
  const isLow = value < 80;
  const isHigh = value > 160;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(
          "font-medium",
          isLow && "text-destructive",
          isHigh && "text-green-600"
        )}>{value}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full rounded-full transition-all",
            isLow ? "bg-destructive" : isHigh ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${Math.min(100, normalizedValue)}%` }}
        />
      </div>
    </div>
  );
}

function Circle({ title, subtitle, tooltip, percentage, color, scales, abbreviation }: CircleProps & { abbreviation?: string }) {
  return (
    <div className="flex flex-col items-center p-5 bg-card rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-1">
        {abbreviation && (
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded", color.replace('text-', 'bg-').replace('[#', '[').replace(']', '/15]'), color)}>
            {abbreviation}
          </span>
        )}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground/60 cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">
              <p className="font-medium mb-1">{title}</p>
              <p>{tooltip}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className={cn("text-xs font-medium mb-4 text-muted-foreground")}>{subtitle}</p>
      <CircularProgress percentage={percentage} color={color} />
      <div className="w-full mt-5 space-y-2.5">
        {scales.map((scale) => (
          <ScaleBar 
            key={scale.code} 
            label={scale.label} 
            value={scale.value} 
          />
        ))}
      </div>
    </div>
  );
}

export function ProfileCircles({ 
  leadership_pct, 
  maturita_pct, 
  potenziale_pct, 
  scale_punteggi 
}: ProfileCirclesProps) {
  // Configurazione secondo Manuale V3 Cap. 8.2
  const circlesConfig = [
    {
      title: 'Impatto Organizzativo',
      abbreviation: 'IIO',
      subtitle: 'Relazioni e Qualità',
      tooltip: 'Indice di Impatto Organizzativo: misura la capacità di influenzare l\'organizzazione attraverso Qualità Relazionale (QR), Sensibilità Personale (SP) e Propensione all\'Azione (PA). Formula: (QR + SP + PA) / 600 × 100',
      percentage: leadership_pct,
      color: 'text-[#1e3a5f]',
      scales: [
        { code: 'QR' as ScalaCode, label: SCALE_LABELS['QR'], value: scale_punteggi['QR'] || 100 },
        { code: 'SP' as ScalaCode, label: SCALE_LABELS['SP'], value: scale_punteggi['SP'] || 100 },
        { code: 'PA' as ScalaCode, label: SCALE_LABELS['PA'], value: scale_punteggi['PA'] || 100 },
      ]
    },
    {
      title: 'Solidità Personale',
      abbreviation: 'ISP',
      subtitle: 'Stabilità e Motivazione',
      tooltip: 'Indice di Solidità Personale: valuta la stabilità interiore attraverso Stile di Vita (SV), Motivazione (MO) e Capacità di Fronteggiare (CF). Formula: (SV + MO + CF) / 600 × 100',
      percentage: maturita_pct,
      color: 'text-green-600',
      scales: [
        { code: 'SV' as ScalaCode, label: SCALE_LABELS['SV'], value: scale_punteggi['SV'] || 100 },
        { code: 'MO' as ScalaCode, label: SCALE_LABELS['MO'], value: scale_punteggi['MO'] || 100 },
        { code: 'CF' as ScalaCode, label: SCALE_LABELS['CF'], value: scale_punteggi['CF'] || 100 },
      ]
    },
    {
      title: 'Capacità Produttiva',
      abbreviation: 'ICP',
      subtitle: 'Esecuzione e Risultati',
      tooltip: 'Indice di Capacità Produttiva: indica l\'efficacia operativa attraverso Quantità (QN), Efficacia (EC) ed Efficienza (EF). Formula: (QN + EC + EF) / 600 × 100',
      percentage: potenziale_pct,
      color: 'text-[#f09133]',
      scales: [
        { code: 'QN' as ScalaCode, label: SCALE_LABELS['QN'], value: scale_punteggi['QN'] || 100 },
        { code: 'EC' as ScalaCode, label: SCALE_LABELS['EC'], value: scale_punteggi['EC'] || 100 },
        { code: 'EF' as ScalaCode, label: SCALE_LABELS['EF'], value: scale_punteggi['EF'] || 100 },
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {circlesConfig.map((circle) => (
        <Circle key={circle.title} {...circle} />
      ))}
    </div>
  );
}
