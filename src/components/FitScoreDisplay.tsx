import { cn } from '@/lib/utils';
import { FitIndicatorIcon } from './FitIndicator';

type Verdict = 'NON_IDONEO' | 'VALUTARE' | 'IDONEO';

interface FitScoreDisplayProps {
  score: number;
  verdict: Verdict;
  motivo?: string;
  className?: string;
}

const VERDICT_COLORS = {
  IDONEO: 'text-success',
  VALUTARE: 'text-warning',
  NON_IDONEO: 'text-destructive',
};

const VERDICT_BG = {
  IDONEO: 'bg-success/10 border-success/30',
  VALUTARE: 'bg-warning/10 border-warning/30',
  NON_IDONEO: 'bg-destructive/10 border-destructive/30',
};

export function FitScoreDisplay({ 
  score, 
  verdict, 
  motivo,
  className 
}: FitScoreDisplayProps) {
  return (
    <div className={cn('rounded-xl border-2 p-6 text-center', VERDICT_BG[verdict], className)}>
      {/* Score grande */}
      <div className="mb-4">
        <span className={cn('text-6xl font-bold tabular-nums', VERDICT_COLORS[verdict])}>
          {score}
        </span>
        <span className="text-2xl text-muted-foreground">/100</span>
      </div>
      
      {/* Verdict con icona */}
      <div className="flex justify-center mb-4">
        <FitIndicatorIcon verdict={verdict} size="lg" showLabel />
      </div>
      
      {/* Barra di progresso */}
      <div className="w-full bg-muted rounded-full h-3 mb-4">
        <div 
          className={cn(
            'h-full rounded-full transition-all duration-500',
            verdict === 'IDONEO' && 'bg-success',
            verdict === 'VALUTARE' && 'bg-warning',
            verdict === 'NON_IDONEO' && 'bg-destructive'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {/* Scala riferimento */}
      <div className="flex justify-between text-xs text-muted-foreground mb-4">
        <span>0</span>
        <span className="text-destructive">Non Idoneo</span>
        <span>40</span>
        <span className="text-warning">Valutare</span>
        <span>65</span>
        <span className="text-success">Idoneo</span>
        <span>100</span>
      </div>
      
      {/* Motivo */}
      {motivo && (
        <p className="text-sm text-muted-foreground italic">
          "{motivo}"
        </p>
      )}
    </div>
  );
}
