import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnswerValue } from '@/lib/constants';

interface AnswerButtonProps {
  value: AnswerValue;
  label: string;
  shortLabel?: string;
  selected: boolean;
  onClick: () => void;
  variant?: 'desktop' | 'mobile';
}

export function AnswerButton({ 
  value, 
  label, 
  shortLabel,
  selected, 
  onClick,
  variant = 'desktop'
}: AnswerButtonProps) {
  if (variant === 'mobile') {
    return (
      <button
        onClick={onClick}
        className={cn(
          "min-h-[56px] p-2 rounded-lg border-2 text-center transition-all touch-manipulation",
          "active:scale-[0.98]",
          "flex flex-col items-center justify-center gap-0.5",
          selected
            ? "border-accent bg-accent text-accent-foreground shadow-md"
            : "border-border bg-card hover:border-accent/50 hover:bg-accent/5"
        )}
      >
        <div className={cn(
          "w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-bold text-xs",
          selected ? "bg-white/20" : "bg-primary/10 text-primary"
        )}>
          {selected ? <Check className="h-3.5 w-3.5" /> : value}
        </div>
        <span className="text-[10px] font-medium leading-tight">
          {shortLabel || label}
        </span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "p-3 rounded-lg border-2 text-center transition-all",
        "flex items-center justify-center gap-2",
        selected
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-card hover:border-accent/50 hover:bg-accent/5"
      )}
    >
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs",
        selected ? "bg-white/20" : "bg-primary/10 text-primary"
      )}>
        {selected ? <Check className="h-3 w-3" /> : value}
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

export default AnswerButton;
