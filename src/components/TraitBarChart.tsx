/**
 * TraitBarChart - Grafico barre orizzontali per i 15 tratti V5
 * Raggruppati per area con colori distinti
 * Supporta soglie opzionali per il ruolo (tab Compatibilità)
 */

import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TraitCode, TRAIT_LABELS } from '@/types/database';

interface TraitThreshold {
  trait: TraitCode;
  soglia: number;
  tipo: 'min' | 'max' | 'range';
}

interface TraitBarChartProps {
  traits: Record<string, number>;
  thresholds?: TraitThreshold[];
  showThresholdIndicator?: boolean;
  showValueLabels?: boolean;
  compact?: boolean;
}

const AREA_GROUPS: {
  label: string;
  color: string;
  bgColor: string;
  barColor: string;
  traits: TraitCode[];
}[] = [
  {
    label: 'ESSERE',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    barColor: '#3B82F6',
    traits: ['ORG', 'AUT', 'GP'],
  },
  {
    label: 'FARE',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    barColor: '#F59E0B',
    traits: ['ADS', 'DET', 'VEN', 'HRM'],
  },
  {
    label: 'AVERE',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    barColor: '#8B5CF6',
    traits: ['LDR', 'PRO', 'COM', 'ESP'],
  },
  {
    label: 'INDICATORI',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50 dark:bg-gray-800/20',
    barColor: '#6B7280',
    traits: ['RC', 'FIN', 'SUC', 'PRI'],
  },
];

function getValueLabel(value: number): { text: string; className: string } {
  if (value >= 50) return { text: 'Alto', className: 'text-green-600 dark:text-green-400' };
  if (value >= 20) return { text: 'Buono', className: 'text-blue-600 dark:text-blue-400' };
  if (value >= 0) return { text: 'Medio', className: 'text-muted-foreground' };
  if (value >= -30) return { text: 'Basso', className: 'text-amber-600 dark:text-amber-400' };
  return { text: 'Critico', className: 'text-red-600 dark:text-red-400' };
}

function TraitBar({
  trait,
  value,
  barColor,
  threshold,
  showThresholdIndicator,
  showValueLabel,
  compact,
}: {
  trait: TraitCode;
  value: number;
  barColor: string;
  threshold?: TraitThreshold;
  showThresholdIndicator?: boolean;
  showValueLabel?: boolean;
  compact?: boolean;
}) {
  // Scale from [-100, +100] to [0, 100] for display
  const displayPct = ((value + 100) / 200) * 100;
  const centerPct = 50; // 0 point

  const barLeft = value >= 0 ? centerPct : displayPct;
  const barWidth = value >= 0 ? displayPct - centerPct : centerPct - displayPct;

  // Threshold check
  let meetsThreshold: boolean | null = null;
  if (threshold && showThresholdIndicator) {
    if (threshold.tipo === 'min') {
      meetsThreshold = value >= threshold.soglia;
    } else if (threshold.tipo === 'max') {
      meetsThreshold = value <= threshold.soglia;
    }
  }

  // Threshold line position
  const thresholdPct = threshold
    ? ((threshold.soglia + 100) / 200) * 100
    : null;

  return (
    <div className={cn('flex items-center gap-2', compact ? 'py-1' : 'py-1.5')}>
      <span className={cn('font-medium text-foreground shrink-0', compact ? 'text-xs w-28' : 'text-sm w-36')}>
        {TRAIT_LABELS[trait]}
      </span>
      <div className="flex-1 relative h-5 bg-muted/60 rounded-full overflow-hidden">
        {/* Center line (0 point) */}
        <div
          className="absolute top-0 bottom-0 w-px bg-border z-10"
          style={{ left: '50%' }}
        />
        {/* Value bar */}
        <div
          className="absolute top-0.5 bottom-0.5 rounded-full transition-all"
          style={{
            left: `${barLeft}%`,
            width: `${barWidth}%`,
            backgroundColor: barColor,
            opacity: 0.8,
          }}
        />
        {/* Threshold line */}
        {thresholdPct !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
            style={{ left: `${thresholdPct}%` }}
          />
        )}
      </div>
      <span className={cn('font-mono shrink-0 tabular-nums', compact ? 'text-xs w-10' : 'text-sm w-12', 'text-right')}>
        {value > 0 ? '+' : ''}{value}
      </span>
      {showValueLabel && (() => {
        const label = getValueLabel(value);
        return <span className={cn('text-xs font-medium shrink-0 w-12 text-right', label.className)}>{label.text}</span>;
      })()}
      {showThresholdIndicator && meetsThreshold !== null && (
        meetsThreshold ? (
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500 shrink-0" />
        )
      )}
    </div>
  );
}

export function TraitBarChart({
  traits,
  thresholds,
  showThresholdIndicator = false,
  showValueLabels = false,
  compact = false,
}: TraitBarChartProps) {
  return (
    <div className="space-y-4">
      {AREA_GROUPS.map((group) => (
        <div key={group.label}>
          <div className={cn('flex items-center gap-2 mb-1.5 px-2 py-1 rounded-md', group.bgColor)}>
            <span className={cn('text-xs font-semibold uppercase tracking-wide', group.color)}>
              {group.label}
            </span>
          </div>
          <div className="space-y-0">
            {group.traits.map((trait) => {
              const value = traits[trait] ?? 0;
              const threshold = thresholds?.find(t => t.trait === trait);
              return (
                <TraitBar
                  key={trait}
                  trait={trait}
                  value={value}
                  barColor={group.barColor}
                  threshold={threshold}
                  showThresholdIndicator={showThresholdIndicator}
                  showValueLabel={showValueLabels}
                  compact={compact}
                />
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Legend */}
      {showThresholdIndicator && thresholds && thresholds.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <span className="flex items-center gap-1">
            <div className="w-3 h-0.5 bg-red-500" /> Soglia minima ruolo
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" /> Requisito soddisfatto
          </span>
          <span className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" /> Requisito mancante
          </span>
        </div>
      )}
    </div>
  );
}
