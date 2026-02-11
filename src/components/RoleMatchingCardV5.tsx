/**
 * RoleMatchingCardV5 - Componente UI per matching ruolo V5 nativo
 * 
 * Supporta:
 * - Tratti V5 nativi con matching roleMatchingV5
 * - Disqualifier con severity
 * - Sindromi rilevanti
 * - Compatibilità tutti i ruoli
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
  Award, AlertCircle, Lightbulb, User, Shield, Ban,
  ArrowRight, Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  getVerdictLabelV5, 
  getVerdictBadgeVariantV5,
  getVerdictColorV5,
  FitVerdictV5,
  RoleMatchResultV5,
  AllRolesCompatibilityV5,
  ROLE_PROFILES_V5,
} from '@/lib/roleMatchingV5';
import {
  calculateRoleMatchingV5Cached,
  calculateAllRolesCompatibilityV5Cached,
} from '@/lib/roleMatchingV5Cache';
import { TraitScores, SyndromeResult } from '@/lib/syndromes';
import { TraitCode, TRAIT_LABELS } from '@/types/database';
import { ProfiloTipoV5 } from '@/types/database';

interface RoleMatchingCardV5Props {
  ruoloRichiesto: string;
  traitsV5: Record<string, number>;
  candidateAge?: number;
  showFullDetails?: boolean;
  showAllRoles?: boolean;
  className?: string;
}

export function RoleMatchingCardV5({ 
  ruoloRichiesto, 
  traitsV5, 
  candidateAge,
  showFullDetails = true,
  showAllRoles = true,
  className 
}: RoleMatchingCardV5Props) {
  // Converti a TraitScores
  const traitScores: TraitScores = {
    ORG: traitsV5.ORG ?? 0,
    AUT: traitsV5.AUT ?? 0,
    GP: traitsV5.GP ?? 0,
    ADS: traitsV5.ADS ?? 0,
    DET: traitsV5.DET ?? 0,
    VEN: traitsV5.VEN ?? 0,
    HRM: traitsV5.HRM ?? 0,
    LDR: traitsV5.LDR ?? 0,
    PRO: traitsV5.PRO ?? 0,
    COM: traitsV5.COM ?? 0,
    ESP: traitsV5.ESP ?? 0,
    RC: traitsV5.RC ?? 0,
    FIN: traitsV5.FIN ?? 0,
    SUC: traitsV5.SUC ?? 0,
    PRI: traitsV5.PRI ?? 0,
  };

  // Calcola matching per ruolo richiesto e tutti i ruoli (con cache)
  const result = calculateRoleMatchingV5Cached(ruoloRichiesto, traitScores, candidateAge);
  const allRoles = calculateAllRolesCompatibilityV5Cached(ruoloRichiesto, traitScores, candidateAge);
  const roleProfile = ROLE_PROFILES_V5[ruoloRichiesto];

  // Raggruppa disqualifier per severity
  const blockingDisqualifiers = result.disqualifiersAttivi.filter(d => d.severity === 'blocking');
  const warningDisqualifiers = result.disqualifiersAttivi.filter(d => d.severity === 'warning');

  return (
    <Card className={cn("border-2", className, {
      'border-green-500/50': result.verdict === 'IDONEO',
      'border-blue-500/50': result.verdict === 'IDONEO_CON_RISERVA',
      'border-amber-500/50': result.verdict === 'DA_VALUTARE',
      'border-destructive/50': result.verdict === 'NON_IDONEO',
    })}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Matching V5: {ruoloRichiesto}
            </CardTitle>
            <CardDescription className="mt-1">
              {roleProfile?.descrizione || 'Analisi basata sui 15 tratti V5'}
            </CardDescription>
            {roleProfile && !roleProfile.validatoManualeV2 && (
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                <HelpCircle className="h-3.5 w-3.5 shrink-0" />
                <span>Soglie definite internamente (non validate dal Manuale V2.0)</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center sm:items-end gap-1">
            <Badge 
              variant={getVerdictBadgeVariantV5(result.verdict)}
              className="text-base px-4 py-1.5"
            >
              {getVerdictLabelV5(result.verdict)}
            </Badge>
            <span className="text-2xl font-bold text-muted-foreground">
              {result.compatibilitaPct}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Alert Blocking Disqualifiers */}
        {blockingDisqualifiers.length > 0 && (
          <Alert variant="destructive" className="border-2">
            <Ban className="h-5 w-5" />
            <AlertTitle className="font-bold">Disqualificatori Attivi</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 space-y-1">
                {blockingDisqualifiers.map((d, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{d.reason}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Warning Disqualifiers */}
        {warningDisqualifiers.length > 0 && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-400 font-bold">Attenzione</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              <ul className="mt-2 space-y-1">
                {warningDisqualifiers.map((d, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{d.reason}</span>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Sindromi Rilevanti */}
        {result.syndromiRilevanti.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              Sindromi Rilevanti ({result.syndromiRilevanti.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {result.syndromiRilevanti.map((s) => (
                <Badge 
                  key={s.code}
                  variant="outline"
                  className={cn(
                    s.severity === 'RED' && 'border-red-400 bg-red-50 text-red-700',
                    s.severity === 'ORANGE' && 'border-orange-400 bg-orange-50 text-orange-700',
                    s.severity === 'YELLOW' && 'border-yellow-400 bg-yellow-50 text-yellow-700',
                  )}
                >
                  [{s.code}] {s.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Motivazione */}
        <Alert className={cn("border", {
          'border-green-500/50 bg-green-50/50 dark:bg-green-950/30': result.verdict === 'IDONEO',
          'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/30': result.verdict === 'IDONEO_CON_RISERVA',
          'border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/30': result.verdict === 'DA_VALUTARE',
          'border-destructive/50 bg-destructive/10': result.verdict === 'NON_IDONEO',
        })}>
          <Lightbulb className={cn("h-4 w-4", getVerdictColorV5(result.verdict))} />
          <AlertDescription className="text-sm font-medium">
            {result.motivazione}
          </AlertDescription>
        </Alert>

        <Separator />

        {/* Requisiti */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Soddisfatti */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              Requisiti OK ({result.requisitiSoddisfatti.length})
            </h4>
            {result.requisitiSoddisfatti.length > 0 ? (
              <ul className="space-y-1">
                {result.requisitiSoddisfatti.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 shrink-0" />
                    <span>{TRAIT_LABELS[req.trait]}</span>
                    <Badge variant="outline" className="ml-auto text-xs bg-green-50">
                      {req.valore > 0 ? '+' : ''}{req.valore}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Nessun requisito soddisfatto</p>
            )}
          </div>

          {/* Mancanti */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold flex items-center gap-2 text-destructive">
              <XCircle className="h-4 w-4" />
              Requisiti Mancanti ({result.requisitiMancanti.length})
            </h4>
            {result.requisitiMancanti.length > 0 ? (
              <ul className="space-y-1">
                {result.requisitiMancanti.map((req, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm">
                    <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span>{TRAIT_LABELS[req.trait]}</span>
                    <Badge variant="destructive" className="ml-auto text-xs">
                      {req.valore > 0 ? '+' : ''}{req.valore} (min {req.soglia})
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Tutti i requisiti soddisfatti ✓</p>
            )}
          </div>
        </div>

        {/* Domande Colloquio */}
        {showFullDetails && result.domandeColloquio.length > 0 && (
          <>
            <Separator />
            <Accordion type="single" collapsible>
              <AccordionItem value="domande" className="border-none">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <MessageSquare className="h-4 w-4" />
                    Domande Suggerite per Colloquio ({result.domandeColloquio.length})
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-2 pt-2">
                    {result.domandeColloquio.map((domanda, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                        <span className="font-bold text-primary shrink-0">{idx + 1}.</span>
                        <span>{domanda}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}

        {/* Ruoli Alternativi - Solo se NON IDONEO o DA VALUTARE */}
        {(result.verdict === 'NON_IDONEO' || result.verdict === 'DA_VALUTARE') && allRoles.tuttiRuoli.length > 1 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Ruoli Alternativi Consigliati
              </h4>
              <p className="text-xs text-muted-foreground">
                In base al profilo, questi ruoli potrebbero essere più adatti:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allRoles.tuttiRuoli
                  .filter(r => r.ruolo !== ruoloRichiesto && r.compatibilita >= 50)
                  .sort((a, b) => b.compatibilita - a.compatibilita)
                  .slice(0, 4)
                  .map((r, idx) => (
                    <div 
                      key={idx} 
                      className={cn(
                        "p-3 rounded-lg border flex items-center justify-between",
                        r.verdict === 'IDONEO' && 'border-green-300 bg-green-50/50 dark:bg-green-950/20',
                        r.verdict === 'IDONEO_CON_RISERVA' && 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/20',
                        r.verdict === 'DA_VALUTARE' && 'border-amber-300 bg-amber-50/50 dark:bg-amber-950/20',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{r.ruolo}</span>
                      </div>
                      <Badge 
                        variant={getVerdictBadgeVariantV5(r.verdict)}
                        className="text-xs"
                      >
                        {r.compatibilita}%
                      </Badge>
                    </div>
                  ))}
              </div>
              {allRoles.ruoloIdeale && allRoles.ruoloIdeale.ruolo !== ruoloRichiesto && (
                <Alert className="border-green-300 bg-green-50/50 dark:bg-green-950/20 mt-2">
                  <Star className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-sm">
                    <strong>Ruolo Ideale:</strong> {allRoles.ruoloIdeale.ruolo} ({allRoles.ruoloIdeale.compatibilita}% compatibilità)
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {/* Tutti i Ruoli - Accordion per vedere tutto */}
        {showAllRoles && allRoles.tuttiRuoli.length > 1 && (
          <>
            <Separator />
            <Accordion type="single" collapsible>
              <AccordionItem value="ruoli" className="border-none">
                <AccordionTrigger className="hover:no-underline py-2">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Briefcase className="h-4 w-4" />
                    Compatibilità Tutti i Ruoli
                    {allRoles.ruoloIdeale && allRoles.ruoloIdeale.ruolo !== ruoloRichiesto && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Ideale: {allRoles.ruoloIdeale.ruolo}
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    {allRoles.tuttiRuoli
                      .sort((a, b) => b.compatibilita - a.compatibilita)
                      .map((r, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <span className="text-sm w-48 truncate">{r.ruolo}</span>
                          <Progress value={r.compatibilita} className="flex-1 h-2" />
                          <Badge 
                            variant={getVerdictBadgeVariantV5(r.verdict)}
                            className="text-xs w-24 justify-center"
                          >
                            {r.compatibilita}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}

        {/* Profilo Ideale */}
        {showFullDetails && roleProfile && (
          <>
            <Separator />
            <div className="bg-muted/30 rounded-lg p-3">
              <h4 className="text-sm font-semibold flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-primary" />
                Profilo Ideale per {ruoloRichiesto}
              </h4>
              <p className="text-sm text-muted-foreground">
                {roleProfile.profiloIdeale}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {roleProfile.trattiFondamentali.map(trait => (
                  <Badge key={trait} variant="outline" className="text-xs">
                    {TRAIT_LABELS[trait]}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
