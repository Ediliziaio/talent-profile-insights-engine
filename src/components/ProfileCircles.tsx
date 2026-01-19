import { cn } from '@/lib/utils';
import { SCALE_LABELS, ScalaCode } from '@/types/database';

interface ProfileCirclesProps {
  leadership_pct: number;
  maturita_pct: number;
  potenziale_pct: number;
  scale_punteggi: Record<string, number>;
}

interface CircleProps {
  title: string;
  subtitle: string;
  percentage: number;
  color: string;
  scales: { code: ScalaCode; label: string; value: number }[];
}

function CircularProgress({ percentage, color, size = 120 }: { percentage: number; color: string; size?: number }) {
  const radius = (size - 12) / 2;
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
          strokeWidth="10"
          fill="transparent"
          className="text-muted/30"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          strokeLinecap="round"
          className={color}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(percentage)}%</span>
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

function Circle({ title, subtitle, percentage, color, scales }: CircleProps) {
  return (
    <div className="flex flex-col items-center p-4 bg-card rounded-xl border shadow-sm">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
        {title}
      </h3>
      <p className={cn("text-lg font-bold mb-3", color.replace('text-', 'text-'))}>{subtitle}</p>
      <CircularProgress percentage={percentage} color={color} />
      <div className="w-full mt-4 space-y-2">
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
  const circles: CircleProps[] = [
    {
      title: 'Impatto Organizzativo',
      subtitle: 'QR + SP + PA',
      percentage: leadership_pct,
      color: 'text-[#1e3a5f]',
      scales: [
        { code: 'QR', label: SCALE_LABELS['QR'], value: scale_punteggi['QR'] || 100 },
        { code: 'SP', label: SCALE_LABELS['SP'], value: scale_punteggi['SP'] || 100 },
        { code: 'PA', label: SCALE_LABELS['PA'], value: scale_punteggi['PA'] || 100 },
      ]
    },
    {
      title: 'Solidità Personale',
      subtitle: 'SV + MO + CF',
      percentage: maturita_pct,
      color: 'text-green-600',
      scales: [
        { code: 'SV', label: SCALE_LABELS['SV'], value: scale_punteggi['SV'] || 100 },
        { code: 'MO', label: SCALE_LABELS['MO'], value: scale_punteggi['MO'] || 100 },
        { code: 'CF', label: SCALE_LABELS['CF'], value: scale_punteggi['CF'] || 100 },
      ]
    },
    {
      title: 'Capacità Produttiva',
      subtitle: 'QN + EC + EF',
      percentage: potenziale_pct,
      color: 'text-[#f09133]',
      scales: [
        { code: 'QN', label: SCALE_LABELS['QN'], value: scale_punteggi['QN'] || 100 },
        { code: 'EC', label: SCALE_LABELS['EC'], value: scale_punteggi['EC'] || 100 },
        { code: 'EF', label: SCALE_LABELS['EF'], value: scale_punteggi['EF'] || 100 },
      ]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {circles.map((circle) => (
        <Circle key={circle.title} {...circle} />
      ))}
    </div>
  );
}
