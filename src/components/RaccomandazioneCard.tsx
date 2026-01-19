import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbsUp, AlertCircle, XCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

type Decisione = 'ASSUMERE' | 'VALUTARE' | 'SCARTARE';

export interface Raccomandazione {
  decisione: Decisione;
  motivo_principale: string;
  rischio_aziendale: string;
  tempo_onboarding: string;
  probabilita_successo_12m: number;
}

interface RaccomandazioneCardProps {
  raccomandazione: Raccomandazione;
  className?: string;
}

const DECISIONE_CONFIG = {
  ASSUMERE: {
    icon: ThumbsUp,
    bg: 'bg-success/10 border-success/30',
    headerBg: 'bg-success',
    textColor: 'text-success',
    label: 'ASSUMERE',
  },
  VALUTARE: {
    icon: AlertCircle,
    bg: 'bg-warning/10 border-warning/30',
    headerBg: 'bg-warning',
    textColor: 'text-warning',
    label: 'VALUTARE',
  },
  SCARTARE: {
    icon: XCircle,
    bg: 'bg-destructive/10 border-destructive/30',
    headerBg: 'bg-destructive',
    textColor: 'text-destructive',
    label: 'SCARTARE',
  },
};

export function RaccomandazioneCard({ 
  raccomandazione, 
  className 
}: RaccomandazioneCardProps) {
  const config = DECISIONE_CONFIG[raccomandazione.decisione];
  const Icon = config.icon;
  
  const probabilitaColor = 
    raccomandazione.probabilita_successo_12m >= 70 ? 'text-success' :
    raccomandazione.probabilita_successo_12m >= 50 ? 'text-warning' :
    'text-destructive';

  return (
    <Card className={cn('border-2 overflow-hidden', config.bg, className)}>
      {/* Header con decisione */}
      <CardHeader className={cn('text-white py-4', config.headerBg)}>
        <CardTitle className="flex items-center justify-center gap-3 text-xl">
          <Icon className="h-6 w-6" />
          Decisione Consigliata: {config.label}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Motivo principale */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Motivo Principale
          </h4>
          <p className="text-foreground font-medium">
            {raccomandazione.motivo_principale}
          </p>
        </div>
        
        {/* Rischio aziendale */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Rischio Aziendale
          </h4>
          <p className="text-foreground">
            {raccomandazione.rischio_aziendale}
          </p>
        </div>
        
        {/* Metriche */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
            <p className="text-xs text-muted-foreground mb-1">Tempo Onboarding</p>
            <p className="font-semibold text-foreground">{raccomandazione.tempo_onboarding}</p>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <TrendingUp className={cn('h-5 w-5 mx-auto mb-2', probabilitaColor)} />
            <p className="text-xs text-muted-foreground mb-1">Successo a 12 mesi</p>
            <p className={cn('font-bold text-2xl', probabilitaColor)}>
              {raccomandazione.probabilita_successo_12m}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
