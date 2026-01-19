import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

type Verdict = 'NON_IDONEO' | 'VALUTARE' | 'IDONEO';

interface FitIndicatorProps {
  verdict: Verdict;
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
    dot: 'w-3 h-3',
    icon: 'h-4 w-4',
    text: 'text-xs',
  },
  md: {
    dot: 'w-4 h-4',
    icon: 'h-5 w-5',
    text: 'text-sm',
  },
  lg: {
    dot: 'w-5 h-5',
    icon: 'h-6 w-6',
    text: 'text-base',
  },
};

export function FitIndicator({ 
  verdict, 
  size = 'md', 
  showLabel = false,
  className 
}: FitIndicatorProps) {
  const config = VERDICT_CONFIG[verdict];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div 
        className={cn(
          'rounded-full flex items-center justify-center',
          config.color,
          sizeConfig.dot
        )}
      />
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
  verdict, 
  size = 'md', 
  showLabel = false,
  className 
}: FitIndicatorProps) {
  const config = VERDICT_CONFIG[verdict];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={cn(config.textColor, sizeConfig.icon)} />
      {showLabel && (
        <span className={cn('font-medium', config.textColor, sizeConfig.text)}>
          {config.label}
        </span>
      )}
    </div>
  );
}
