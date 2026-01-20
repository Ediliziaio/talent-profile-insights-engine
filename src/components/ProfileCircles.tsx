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

function CircularProgress({ percentage, color, size = 140, isMobile = false }: { percentage: number; color: string; size?: number; isMobile?: boolean }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

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
          strokeWidth="8"
          fill="transparent"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold`} style={{ color }}>
          {percentage}%
        </span>
      </div>
    </div>
  );
}
function ScaleBar({ label, value, isMobile = false }: { label: string; value: number; isMobile?: boolean }) {
  const percentage = (value / 200) * 100;
  const isLow = value < 80;
  const isHigh = value > 140;
  
  const barColor = isLow 
    ? 'bg-destructive' 
    : isHigh 
      ? 'bg-green-500' 
      : 'bg-primary/60';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-full cursor-help">
          <div className="flex justify-between items-center mb-0.5">
            <span className={`font-medium ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>{label}</span>
            <span className={`font-semibold ${isMobile ? 'text-[9px]' : 'text-[10px]'}`}>{value}</span>
          </div>
          <div className={`w-full bg-muted rounded-full overflow-hidden ${isMobile ? 'h-1' : 'h-1.5'}`}>
            <div 
              className={`h-full rounded-full transition-all duration-300 ${barColor}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{label}: {value}/200</p>
      </TooltipContent>
    </Tooltip>
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
  leadershipPct, 
  maturitaPct, 
  potenzialePct, 
  scalePunteggi 
}: ProfileCirclesProps) {
  const isMobile = useIsMobile();
  
  const circles: CircleProps[] = [
    {
      title: "Impatto Organizzativo",
      subtitle: "IIO - Leadership",
      tooltip: "Misura la capacità di influenzare, guidare e lasciare un'impronta nell'organizzazione. Basato su Motivazione (MO), Qualità Negoziali (QN) e Spinta alla Performance (SP).",
      percentage: leadershipPct,
      color: "#1e3a5f",
      scales: [
        { key: 'MO', label: 'Motivazione', value: scalePunteggi['MO'] || 100 },
        { key: 'QN', label: 'Qualità Negoziali', value: scalePunteggi['QN'] || 100 },
        { key: 'SP', label: 'Spinta Performance', value: scalePunteggi['SP'] || 100 },
      ]
    },
    {
      title: "Solidità Personale",
      subtitle: "ISP - Maturità",
      tooltip: "Indica la stabilità emotiva, la capacità di gestire lo stress e la maturità personale. Basato su Stile di Vita (SV), Capacità di Fronteggiare (CF) e Pensiero Autonomo (PA).",
      percentage: maturitaPct,
      color: "#22c55e",
      scales: [
        { key: 'SV', label: 'Stile di Vita', value: scalePunteggi['SV'] || 100 },
        { key: 'CF', label: 'Fronteggiamento', value: scalePunteggi['CF'] || 100 },
        { key: 'PA', label: 'Pensiero Autonomo', value: scalePunteggi['PA'] || 100 },
      ]
    },
    {
      title: "Capacità Produttiva",
      subtitle: "ICP - Potenziale",
      tooltip: "Valuta l'orientamento al risultato, l'efficienza operativa e la capacità di produrre valore. Basato su Efficienza (EF), Qualità Realizzativa (QR) e Schematicità (SC).",
      percentage: potenzialePct,
      color: "#f09133",
      scales: [
        { key: 'EF', label: 'Efficienza', value: scalePunteggi['EF'] || 100 },
        { key: 'QR', label: 'Qualità Realizz.', value: scalePunteggi['QR'] || 100 },
        { key: 'SC', label: 'Schematicità', value: scalePunteggi['SC'] || 100 },
      ]
    },
  ];

  return (
    <div className={`grid grid-cols-3 ${isMobile ? 'gap-2' : 'gap-6'}`}>
      {circles.map((circle) => (
        <Circle key={circle.title} {...circle} isMobile={isMobile} />
      ))}
    </div>
  );
}