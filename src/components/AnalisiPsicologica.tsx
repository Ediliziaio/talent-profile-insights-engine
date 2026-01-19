import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, AlertTriangle, AlertCircle, Brain, MessageSquare, ChevronDown } from 'lucide-react';
import { FitScoreDisplay } from './FitScoreDisplay';
import { RaccomandazioneCard, Raccomandazione } from './RaccomandazioneCard';

export interface DomandaColloquioAI {
  area: string;
  domanda: string;
}

export interface AnalisiAI {
  profilo_sintetico: string;
  punti_forza: string[];
  punti_debolezza: string[];
  rischi_operativi: string;
  fit_score: number;
  fit_verdict: 'NON_IDONEO' | 'VALUTARE' | 'IDONEO';
  fit_motivo: string;
  raccomandazione: Raccomandazione;
  // Nuovi campi Manuale V3
  domande_colloquio?: DomandaColloquioAI[];
  stress_zone_severity?: string;
  stress_zone_analisi?: string;
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
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {analisi.profilo_sintetico}
          </p>
        </CardContent>
      </Card>

      {/* Analisi Stress Zone AI (se presente) */}
      {analisi.stress_zone_analisi && analisi.stress_zone_severity && analisi.stress_zone_severity !== 'nessuna' && (
        <Card className={cn(
          "border-l-4",
          analisi.stress_zone_severity === 'critica' ? "border-destructive bg-destructive/5" :
          analisi.stress_zone_severity === 'severa' ? "border-red-500 bg-red-50" :
          analisi.stress_zone_severity === 'moderata' ? "border-orange-500 bg-orange-50" :
          "border-amber-500 bg-amber-50"
        )}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className={cn(
                "h-5 w-5",
                analisi.stress_zone_severity === 'critica' || analisi.stress_zone_severity === 'severa' 
                  ? "text-destructive" : "text-amber-600"
              )} />
              Analisi Stress Zone ({analisi.stress_zone_severity.toUpperCase()})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-line">
              {analisi.stress_zone_analisi}
            </p>
          </CardContent>
        </Card>
      )}
      
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
            <ul className="space-y-3">
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
            <ul className="space-y-3">
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

      {/* Domande per il Colloquio generate dall'AI */}
      {analisi.domande_colloquio && analisi.domande_colloquio.length > 0 && (
        <Card className="border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg text-primary">
              <MessageSquare className="h-5 w-5" />
              Domande Suggerite dall'AI per il Colloquio
              <Badge variant="outline" className="ml-2">{analisi.domande_colloquio.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analisi.domande_colloquio.map((item, idx) => (
                <Collapsible key={idx}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-xs">{item.area}</Badge>
                      </div>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 bg-background border rounded-b-lg -mt-1">
                      <p className="text-sm italic text-foreground">"{item.domanda}"</p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
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
          Clicca "Genera Analisi" per ottenere una valutazione dettagliata del candidato basata sul Manuale V3.
        </p>
      </CardContent>
    </Card>
  );
}
