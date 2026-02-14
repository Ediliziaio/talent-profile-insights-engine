/**
 * AlertBannerV3 - Alert condizionale singolo dismissable
 * Mostra UN SOLO alert (il più grave)
 */

import { useState } from 'react';
import { X, AlertTriangle, ShieldAlert, AlertCircle, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SyndromeResult } from '@/lib/syndromes';
import { ReliabilityIndex } from '@/types/database';

interface AlertBannerV3Props {
  candidatoNome: string;
  syndromes: SyndromeResult[];
  gpValue?: number;
  reliabilityIndex?: ReliabilityIndex;
  rcValue?: number;
}

type AlertType = {
  priority: number;
  bgClass: string;
  textClass: string;
  icon: typeof AlertTriangle;
  title: string;
  description: string;
};

export function AlertBannerV3({
  candidatoNome,
  syndromes,
  gpValue,
  reliabilityIndex,
  rcValue,
}: AlertBannerV3Props) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  // Determine alert (priority order)
  let alert: AlertType | null = null;

  // 1. Red syndrome
  const redSyndrome = syndromes.find(s => s.severity === 'RED' && s.isActive);
  if (redSyndrome) {
    alert = {
      priority: 1,
      bgClass: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800',
      textClass: 'text-red-800 dark:text-red-300',
      icon: ShieldAlert,
      title: 'Pattern comportamentale critico rilevato',
      description: `È stato rilevato un pattern comportamentale che richiede attenzione immediata e un approfondimento in colloquio prima di procedere.`,
    };
  }

  // 2. GP < 21
  if (!alert && gpValue !== undefined && gpValue < 21) {
    alert = {
      priority: 2,
      bgClass: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      textClass: 'text-amber-800 dark:text-amber-300',
      icon: AlertTriangle,
      title: 'Periodo di forte pressione relazionale',
      description: `${candidatoNome} sta attraversando un periodo di forte pressione relazionale. Questo condiziona tutto il profilo e va approfondito in colloquio.`,
    };
  }

  // 3. Low reliability
  if (!alert && reliabilityIndex && (reliabilityIndex === 'ZERO' || reliabilityIndex === 'FORCED')) {
    alert = {
      priority: 3,
      bgClass: 'bg-gray-100 dark:bg-gray-800/40 border-gray-300 dark:border-gray-700',
      textClass: 'text-gray-800 dark:text-gray-300',
      icon: AlertCircle,
      title: 'Attendibilità del test bassa',
      description: `Il test di ${candidatoNome} mostra segnali di scarsa attendibilità. I risultati vanno interpretati con cautela.`,
    };
  }

  // 4. RC between -14 and +14
  if (!alert && rcValue !== undefined && rcValue >= -14 && rcValue <= 14) {
    alert = {
      priority: 4,
      bgClass: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800',
      textClass: 'text-purple-800 dark:text-purple-300',
      icon: Lightbulb,
      title: 'Profilo creativo, richiede struttura',
      description: `${candidatoNome} ha una mente molto aperta e creativa, ma potrebbe disperdere le energie. Necessita di guida e struttura per essere produttivo.`,
    };
  }

  if (!alert) return null;

  const Icon = alert.icon;

  return (
    <div className={cn('relative flex items-start gap-3 p-4 rounded-xl border', alert.bgClass)}>
      <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', alert.textClass)} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', alert.textClass)}>{alert.title}</p>
        <p className={cn('text-sm mt-0.5 leading-relaxed', alert.textClass, 'opacity-80')}>
          {alert.description}
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className={cn('shrink-0 p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors', alert.textClass)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
