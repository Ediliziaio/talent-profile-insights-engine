import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, AlertCircle, Brain } from 'lucide-react';
import { FitScoreDisplay } from './FitScoreDisplay';
import { RaccomandazioneCard, Raccomandazione } from './RaccomandazioneCard';

export interface AnalisiAI {
  profilo_sintetico: string;
  punti_forza: string[];
  punti_debolezza: string[];
  rischi_operativi: string;
  fit_score: number;
  fit_verdict: 'NON_IDONEO' | 'VALUTARE' | 'IDONEO';
  fit_motivo: string;
  raccomandazione: Raccomandazione;
}

interface AnalisiPsicologicaProps {
  analisi: AnalisiAI;
  candidatoNome: string;
  className?: string;
}

export function AnalisiPsicologica({ 
  analisi, 
  candidatoNome,
  className 
}: AnalisiPsicologicaProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Profilo Sintetico */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Profilo Generale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed">
            {analisi.profilo_sintetico}
          </p>
        </CardContent>
      </Card>
      
      {/* Punti di Forza e Debolezza */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Punti di Forza */}
        <Card className="border-success/30 bg-success/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-success">
              <CheckCircle2 className="h-5 w-5" />
              Punti di Forza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analisi.punti_forza.map((punto, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span className="text-foreground">{punto}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        {/* Punti di Debolezza */}
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-warning">
              <AlertCircle className="h-5 w-5" />
              Punti di Debolezza
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analisi.punti_debolezza.map((punto, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 shrink-0" />
                  <span className="text-foreground">{punto}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      
      {/* Rischi Operativi */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Rischi Operativi per l'Azienda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {analisi.rischi_operativi}
          </p>
        </CardContent>
      </Card>
      
      {/* Fit Score */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Fit per il Ruolo</CardTitle>
        </CardHeader>
        <CardContent>
          <FitScoreDisplay 
            score={analisi.fit_score}
            verdict={analisi.fit_verdict}
            motivo={analisi.fit_motivo}
          />
        </CardContent>
      </Card>
      
      {/* Raccomandazione Finale */}
      <RaccomandazioneCard raccomandazione={analisi.raccomandazione} />
    </div>
  );
}

// Placeholder per quando l'analisi non è ancora disponibile
export function AnalisiPsicologicaPlaceholder() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <Brain className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          Analisi AI non ancora generata
        </h3>
        <p className="text-sm text-muted-foreground">
          Clicca "Genera Analisi" per ottenere una valutazione dettagliata del candidato.
        </p>
      </CardContent>
    </Card>
  );
}
