/**
 * RoleMatchingCard - Componente UI per visualizzare il matching ruolo V5
 * 
 * Visualizza:
 * - Verdetto grande (4 livelli)
 * - Requisiti con checkmark/X
 * - Aree di attenzione
 * - Compatibilità con altri ruoli
 * - Ruolo ideale suggerito
 * - Pattern rilevati
 * - Domande suggerite per colloquio
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  CheckCircle2, XCircle, AlertTriangle, Target, 
  TrendingUp, HelpCircle, Briefcase, MessageSquare,
  Award, AlertCircle, Lightbulb
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  calculateAllRolesCompatibility, 
  getVerdictLabel, 
  getVerdictBadgeVariant,
  getVerdictColor,
  FitVerdict,
  AllRolesCompatibility,
  ROLE_PROFILES,
} from '@/lib/roleMatching';

interface RoleMatchingCardProps {
  ruoloRichiesto: string;
  scalePunteggi: Record<string, number>;
  showFullDetails?: boolean;
  className?: string;
}

export function RoleMatchingCard({ 
  ruoloRichiesto, 
  scalePunteggi, 
  showFullDetails = true,
  className 
}: RoleMatchingCardProps) {
  const matching = calculateAllRolesCompatibility(ruoloRichiesto, scalePunteggi);
  const result = matching.ruoloRichiesto;
  const roleProfile = ROLE_PROFILES[ruoloRichiesto];

  return (
    <Card className={cn("border-2", className, {
      'border-green-500/50': result.verdict === 'IDONEO',
      'border-amber-500/50': result.verdict === 'IDONEO_CON_RISERVA',
      'border-orange-500/50': result.verdict === 'DA_VALUTARE',
      'border-red-500/50': result.verdict === 'NON_IDONEO',
    })}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Matching per: {ruoloRichiesto}
            </CardTitle>
            <CardDescription className="mt-1">
              Analisi automatica basata sui requisiti del ruolo
            </CardDescription>
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <Badge 
              variant={getVerdictBadgeVariant(result.verdict)}
              className="text-base px-4 py-1.5"
            >
              {getVerdictLabel(result.verdict)}
            </Badge>
            <span className="text-2xl font-bold text-muted-foreground">
              {result.compatibilitaPct}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Motivazione principale */}
        <Alert className={cn({
          'border-green-500/50 bg-green-50/50': result.verdict === 'IDONEO',
          'border-amber-500/50 bg-amber-50/50': result.verdict === 'IDONEO_CON_RISERVA',
          'border-orange-500/50 bg-orange-50/50': result.verdict === 'DA_VALUTARE',
          'border-red-500/50 bg-red-50/50': result.verdict === 'NON_IDONEO',
        })}>
          <AlertCircle className={cn("h-4 w-4", getVerdictColor(result.verdict))} />
          <AlertDescription className="text-sm font-medium">
            {result.motivazione}
          </AlertDescription>
        </Alert>

        {/* Pattern Rilevati */}
        {result.patternRilevati.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Pattern Rilevati
            </h4>
            <div className="space-y-1.5">
              {result.patternRilevati.map((pattern, idx) => (
                <p key={idx} className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
                  {pattern}
                </p>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Requisiti Soddisfatti e Mancanti */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Requisiti OK */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-4 w-4" />
              Requisiti Soddisfatti ({result.requisitiSoddisfatti.length})
            </h4>
            {result.requisitiSoddisfatti.length > 0 ? (
              <ul className="space-y-1">
                {result.requisitiSoddisfatti.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                    <span>{req.label.split('(')[0].trim()}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {req.valore}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nessun requisito soddisfatto</p>
            )}
          </div>

          {/* Requisiti Mancanti */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-red-700">
              <XCircle className="h-4 w-4" />
              Requisiti Mancanti ({result.requisitiMancanti.length})
            </h4>
            {result.requisitiMancanti.length > 0 ? (
              <ul className="space-y-1">
                {result.requisitiMancanti.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <XCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />
                    <span>{req.label.split('(')[0].trim()}</span>
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {req.valore} (min {req.soglia})
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Tutti i requisiti sono soddisfatti</p>
            )}
          </div>
        </div>

        {/* Aree di Attenzione */}
        {result.areeAttenzione.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-700">
                <AlertTriangle className="h-4 w-4" />
                Aree di Attenzione ({result.areeAttenzione.length})
              </h4>
              <ul className="space-y-1">
                {result.areeAttenzione.map((area, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm bg-amber-50 p-2 rounded">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
                    <span>{area.label.split('(')[0].trim()}: {area.motivo}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {showFullDetails && (
          <>
            <Separator />

            {/* Compatibilità Altri Ruoli */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="ruoli">
                <AccordionTrigger className="text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Compatibilità con Altri Ruoli
                    {matching.ruoloIdeale && (
                      <Badge variant="secondary" className="ml-2">
                        Ruolo ideale: {matching.ruoloIdeale.ruolo}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {matching.tuttiRuoli.map((r) => (
                      <div key={r.ruolo} className="flex items-center gap-3">
                        <span className="text-sm w-40 truncate">{r.ruolo}</span>
                        <Progress value={r.compatibilita} className="flex-1 h-2" />
                        <span className="text-sm font-medium w-12 text-right">
                          {r.compatibilita}%
                        </span>
                        <Badge 
                          variant={getVerdictBadgeVariant(r.verdict)} 
                          className="text-[10px] w-20 justify-center"
                        >
                          {getVerdictLabel(r.verdict).split(' ')[0]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Ruolo Ideale Suggerito */}
              {matching.ruoloIdeale && (
                <AccordionItem value="ideale">
                  <AccordionTrigger className="text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      Ruolo Ideale Suggerito
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <Alert className="border-amber-500/50 bg-amber-50/50">
                      <Lightbulb className="h-4 w-4 text-amber-600" />
                      <AlertTitle>Considerare: {matching.ruoloIdeale.ruolo}</AlertTitle>
                      <AlertDescription className="text-sm">
                        Questo candidato mostra una compatibilità del {matching.ruoloIdeale.compatibilita}% 
                        per il ruolo di <strong>{matching.ruoloIdeale.ruolo}</strong>, superiore al 
                        {result.compatibilitaPct}% per {ruoloRichiesto}. Valutare una eventuale 
                        ricollocazione o doppia considerazione.
                      </AlertDescription>
                    </Alert>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Domande Colloquio */}
              {result.domandeColloquio.length > 0 && (
                <AccordionItem value="domande">
                  <AccordionTrigger className="text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Domande Suggerite per Colloquio ({result.domandeColloquio.length})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <ol className="space-y-2 pt-2">
                      {result.domandeColloquio.map((domanda, idx) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <span className="font-bold text-primary">{idx + 1}.</span>
                          <span className="text-muted-foreground">{domanda}</span>
                        </li>
                      ))}
                    </ol>
                  </AccordionContent>
                </AccordionItem>
              )}

              {/* Info Ruolo */}
              {roleProfile && (
                <AccordionItem value="info-ruolo">
                  <AccordionTrigger className="text-sm font-semibold">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Profilo Ideale per {ruoloRichiesto}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2 text-sm">
                      <div>
                        <span className="font-semibold">Chi è:</span>
                        <p className="text-muted-foreground">{roleProfile.chiE}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Cosa lo motiva:</span>
                        <p className="text-muted-foreground">{roleProfile.cosaMotiva}</p>
                      </div>
                      <div>
                        <span className="font-semibold">Cosa lo blocca:</span>
                        <p className="text-muted-foreground">{roleProfile.cosaBlocca}</p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Versione compatta per la tabella candidati
 */
export function RoleMatchingBadge({ 
  ruoloRichiesto, 
  scalePunteggi 
}: { 
  ruoloRichiesto: string; 
  scalePunteggi: Record<string, number>;
}) {
  const matching = calculateAllRolesCompatibility(ruoloRichiesto, scalePunteggi);
  const result = matching.ruoloRichiesto;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getVerdictBadgeVariant(result.verdict)}>
        {getVerdictLabel(result.verdict)}
      </Badge>
      <span className="text-xs text-muted-foreground">
        {result.compatibilitaPct}%
      </span>
    </div>
  );
}
