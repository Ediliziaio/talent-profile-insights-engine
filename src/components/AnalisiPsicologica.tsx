import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CheckCircle2, AlertTriangle, AlertCircle, Brain, MessageSquare, ChevronDown, User, TrendingUp, XCircle, Sparkles } from 'lucide-react';
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
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {/* Profilo Sintetico */}
      {analisi.profilo_sintetico && (
        <Card>
          <CardHeader className="pb-2 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Profilo Sintetico
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {analisi.profilo_sintetico}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Analisi Stress Zone AI */}
      {analisi.stress_zone_analisi && (
        <Card className="border-amber-200 bg-amber-50/30">
          <CardHeader className="pb-2 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-amber-700 text-sm sm:text-base">
              <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />
              Analisi Stress Zone AI
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {analisi.stress_zone_analisi}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Punti di Forza e Debolezza */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Punti di Forza */}
        <Card className="border-green-200">
          <CardHeader className="pb-2 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-green-700 text-sm sm:text-base">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
              Punti di Forza
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            {analisi.punti_forza && analisi.punti_forza.length > 0 ? (
              <ul className="space-y-1.5 sm:space-y-2">
                {analisi.punti_forza.map((punto: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500 mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm">{punto}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground italic">Nessun punto di forza identificato.</p>
            )}
          </CardContent>
        </Card>

        {/* Punti di Debolezza */}
        <Card className="border-amber-200">
          <CardHeader className="pb-2 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-amber-700 text-sm sm:text-base">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Aree di Miglioramento
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            {analisi.punti_debolezza && analisi.punti_debolezza.length > 0 ? (
              <ul className="space-y-1.5 sm:space-y-2">
                {analisi.punti_debolezza.map((punto: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500 mt-0.5 shrink-0" />
                    <span className="text-xs sm:text-sm">{punto}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs sm:text-sm text-muted-foreground italic">Nessuna area di miglioramento identificata.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rischi Operativi */}
      {analisi.rischi_operativi && (
        <Card className="border-red-200 bg-red-50/30">
          <CardHeader className="pb-2 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-red-700 text-sm sm:text-base">
              <XCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              Rischi Operativi
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {analisi.rischi_operativi}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Domande Colloquio AI */}
      {analisi.domande_colloquio && analisi.domande_colloquio.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-3 sm:pt-4">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              Domande Colloquio Suggerite (AI)
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-3 sm:pb-4">
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-xs sm:text-sm text-primary hover:underline">
                <ChevronDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Mostra {analisi.domande_colloquio.length} domande
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-2 sm:space-y-3">
                {analisi.domande_colloquio.map((item: DomandaColloquioAI, idx: number) => (
                  <div key={idx} className="border-l-2 border-primary/30 pl-3 sm:pl-4">
                    <Badge variant="outline" className="mb-1 text-[10px] sm:text-xs">{item.area}</Badge>
                    <p className="text-xs sm:text-sm">"{item.domanda}"</p>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        </Card>
      )}

      {/* Fit Score Display */}
      <FitScoreDisplay 
        score={analisi.fit_score}
        verdict={analisi.fit_verdict}
        motivo={analisi.fit_motivo}
      />

      {/* Raccomandazione Finale */}
      {analisi.raccomandazione && (
        <RaccomandazioneCard raccomandazione={analisi.raccomandazione} />
      )}
    </div>
  );
}

// Placeholder per quando l'analisi non è ancora disponibile
export function AnalisiPsicologicaPlaceholder() {
  return (
    <div className="space-y-4">
      {/* Info box: dati già disponibili */}
      <div className="bg-muted/50 border border-muted rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              I dati deterministici sono già disponibili
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Verdetto, matching ruolo, pattern critici, profilo e aspettative temporali
              sono visibili nelle tab <strong>Match</strong>, <strong>Profilo</strong> e <strong>Colloquio</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Cosa genera l'AI */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="flex flex-col items-center justify-center py-8 sm:py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-3">
            Arricchisci con AI Insights
          </h3>
          <div className="text-xs sm:text-sm text-muted-foreground max-w-md space-y-2">
            <p className="font-medium text-foreground">L'AI genererà contenuti personalizzati:</p>
            <ul className="text-left space-y-1.5 mt-2">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Analisi narrativa personalizzata sul candidato
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Suggerimenti di sviluppo su misura
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Domande colloquio specifiche per criticità individuali
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                Rischi operativi e previsioni comportamentali
              </li>
            </ul>
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 italic">
            Questa funzione consuma crediti AI
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
