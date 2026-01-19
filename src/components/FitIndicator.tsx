import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export type Verdict = 'NON_IDONEO' | 'VALUTARE' | 'IDONEO';

interface FitIndicatorProps {
  score?: number | null;
  verdict?: Verdict | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const VERDICT_CONFIG = {
  IDONEO: {
    color: 'bg-success',
    textColor: 'text-success',
    icon: CheckCircle2,
    label: 'Idoneo',
  },
  VALUTARE: {
    color: 'bg-warning',
    textColor: 'text-warning',
    icon: AlertCircle,
    label: 'Valutare',
  },
  NON_IDONEO: {
    color: 'bg-destructive',
    textColor: 'text-destructive',
    icon: XCircle,
    label: 'Non Idoneo',
  },
};

const SIZE_CONFIG = {
  sm: {
    dot: 'w-2 h-2',
    icon: 'h-4 w-4',
    text: 'text-xs',
  },
  md: {
    dot: 'w-3 h-3',
    icon: 'h-5 w-5',
    text: 'text-sm',
  },
  lg: {
    dot: 'w-4 h-4',
    icon: 'h-6 w-6',
    text: 'text-base',
  },
};

function getVerdictFromScore(score: number): Verdict {
  if (score >= 65) return 'IDONEO';
  if (score >= 40) return 'VALUTARE';
  return 'NON_IDONEO';
}

export function FitIndicator({ 
  score,
  verdict: providedVerdict, 
  size = 'md', 
  showLabel = false,
  className 
}: FitIndicatorProps) {
  // Determine verdict from score if not provided
  const verdict = providedVerdict as Verdict || (score != null ? getVerdictFromScore(score) : 'VALUTARE');
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.VALUTARE;
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className={cn(
          'rounded-full flex items-center justify-center shrink-0',
          config.color,
          sizeConfig.dot
        )}
      />
      {score != null && (
        <span className={cn('font-semibold', config.textColor, sizeConfig.text)}>
          {score}%
        </span>
      )}
      {showLabel && (
        <span className={cn('font-medium', config.textColor, sizeConfig.text)}>
          {config.label}
        </span>
      )}
    </div>
  );
}

// Versione con icona
export function FitIndicatorIcon({ 
  score,
  verdict: providedVerdict, 
  size = 'md', 
  showLabel = false,
  className 
}: FitIndicatorProps) {
  const verdict = providedVerdict as Verdict || (score != null ? getVerdictFromScore(score) : 'VALUTARE');
  const config = VERDICT_CONFIG[verdict] || VERDICT_CONFIG.VALUTARE;
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={cn(config.textColor, sizeConfig.icon)} />
      {score != null && (
        <span className={cn('font-semibold', config.textColor, sizeConfig.text)}>
          {score}%
        </span>
      )}
      {showLabel && (
        <span className={cn('font-medium', config.textColor, sizeConfig.text)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
