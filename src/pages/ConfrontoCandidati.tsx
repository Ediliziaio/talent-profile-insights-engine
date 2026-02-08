/**
 * ConfrontoCandidati - Pagina per confronto side-by-side 2-4 candidati
 * Sezione 16.1 del Manuale V5
 */

import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { NotionLayout } from '@/components/NotionLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { 
  ArrowLeft, Users, Plus, X, Target, Brain, 
  TrendingUp, AlertTriangle, CheckCircle2, XCircle,
  BarChart3, Award, Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tables } from '@/integrations/supabase/types';
import { TRAIT_LABELS, TraitCode } from '@/types/database';
import { 
  getVerdictLabelV5, 
  getVerdictBadgeVariantV5,
  RUOLI_V5,
  RoleMatchResultV5,
} from '@/lib/roleMatchingV5';
import { calculateRoleMatchingV5Cached } from '@/lib/roleMatchingV5Cache';
import { TraitScores } from '@/lib/syndromes';

type Candidato = Tables<'candidati'>;
type ProfiloCandidato = Tables<'profili_candidato'>;

type CandidatoWithProfilo = Candidato & {
  profili_candidato: ProfiloCandidato | null;
  aziende: { nome: string } | null;
};

const TRAIT_CODES: TraitCode[] = [
  'ORG', 'AUT', 'GP', 'ADS', 'DET', 'VEN', 'HRM', 
  'LDR', 'PRO', 'COM', 'ESP', 'RC', 'FIN', 'SUC', 'PRI'
];

function getScoreColor(value: number): string {
  if (value >= 50) return 'text-green-600 dark:text-green-400';
  if (value >= 20) return 'text-blue-600 dark:text-blue-400';
  if (value >= 0) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-600 dark:text-red-400';
}

function getScoreBarColor(value: number): string {
  if (value >= 50) return 'bg-green-500';
  if (value >= 20) return 'bg-blue-500';
  if (value >= 0) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function ConfrontoCandidati() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [ruoloConfronto, setRuoloConfronto] = useState('Venditore/Commerciale');

  // Ottieni IDs dai query params
  const selectedIds = useMemo(() => {
    const ids = searchParams.get('ids');
    return ids ? ids.split(',').filter(Boolean) : [];
  }, [searchParams]);

  // Fetch candidati disponibili per selezione
  const { data: allCandidati, isLoading: loadingAll } = useQuery({
    queryKey: ['candidati-confronto-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('candidati')
        .select('id, nome, cognome, ruolo_attuale, test_completato, profili_candidato(assessment_version)')
        .eq('test_completato', true)
        .order('cognome');
      if (error) throw error;
      return data;
    },
  });

  // Fetch dati completi dei candidati selezionati
  const { data: candidatiSelezionati, isLoading } = useQuery({
    queryKey: ['candidati-confronto', selectedIds],
    queryFn: async () => {
      if (selectedIds.length === 0) return [];
      const { data, error } = await supabase
        .from('candidati')
        .select('*, aziende(nome), profili_candidato(*)')
        .in('id', selectedIds);
      if (error) throw error;
      return data as CandidatoWithProfilo[];
    },
    enabled: selectedIds.length > 0,
  });

  // Funzione per aggiungere candidato
  const addCandidato = (id: string) => {
    if (selectedIds.length >= 4 || selectedIds.includes(id)) return;
    const newIds = [...selectedIds, id];
    setSearchParams({ ids: newIds.join(',') });
  };

  // Funzione per rimuovere candidato
  const removeCandidato = (id: string) => {
    const newIds = selectedIds.filter(i => i !== id);
    setSearchParams({ ids: newIds.join(',') });
  };

  // Calcola matching per ogni candidato (con cache)
  const matchResults = useMemo(() => {
    if (!candidatiSelezionati) return {};
    const results: Record<string, RoleMatchResultV5> = {};
    
    for (const c of candidatiSelezionati) {
      if (c.profili_candidato?.traits_v5) {
        const traits = c.profili_candidato.traits_v5 as Record<string, number>;
        const traitScores: TraitScores = {
          ORG: traits.ORG ?? 0, AUT: traits.AUT ?? 0, GP: traits.GP ?? 0,
          ADS: traits.ADS ?? 0, DET: traits.DET ?? 0, VEN: traits.VEN ?? 0,
          HRM: traits.HRM ?? 0, LDR: traits.LDR ?? 0, PRO: traits.PRO ?? 0,
          COM: traits.COM ?? 0, ESP: traits.ESP ?? 0, RC: traits.RC ?? 0,
          FIN: traits.FIN ?? 0, SUC: traits.SUC ?? 0, PRI: traits.PRI ?? 0,
        };
        results[c.id] = calculateRoleMatchingV5Cached(ruoloConfronto, traitScores, c.eta ?? undefined);
      }
    }
    return results;
  }, [candidatiSelezionati, ruoloConfronto]);

  // Candidati disponibili per aggiunta (non già selezionati e V5)
  const candidatiDisponibili = useMemo(() => {
    if (!allCandidati) return [];
    return allCandidati.filter(c => 
      !selectedIds.includes(c.id) && 
      c.profili_candidato?.assessment_version === 'v5'
    );
  }, [allCandidati, selectedIds]);

  return (
    <ProtectedRoute>
      <NotionLayout>
        <div className="container max-w-7xl py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/candidati')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  Confronto Candidati
                </h1>
                <p className="text-muted-foreground text-sm">
                  Seleziona da 2 a 4 candidati per confrontarli side-by-side
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Ruolo confronto:</span>
              <Select value={ruoloConfronto} onValueChange={setRuoloConfronto}>
                <SelectTrigger className="w-[220px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RUOLI_V5.map(ruolo => (
                    <SelectItem key={ruolo} value={ruolo}>{ruolo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Selezione Candidati */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Aggiungi Candidati ({selectedIds.length}/4)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {selectedIds.length < 4 && candidatiDisponibili.length > 0 && (
                  <Select onValueChange={addCandidato}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Seleziona un candidato..." />
                    </SelectTrigger>
                    <SelectContent>
                      {candidatiDisponibili.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.cognome} {c.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* Badge candidati selezionati */}
                {candidatiSelezionati?.map(c => (
                  <Badge 
                    key={c.id} 
                    variant="secondary" 
                    className="px-3 py-1.5 text-sm gap-2"
                  >
                    {c.cognome} {c.nome}
                    <button onClick={() => removeCandidato(c.id)}>
                      <X className="h-3 w-3 hover:text-destructive" />
                    </button>
                  </Badge>
                ))}
              </div>

              {selectedIds.length < 2 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Seleziona almeno 2 candidati per iniziare il confronto
                </p>
              )}
            </CardContent>
          </Card>

          {/* Confronto Side-by-Side */}
          {candidatiSelezionati && candidatiSelezionati.length >= 2 && (
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4" style={{ minWidth: `${candidatiSelezionati.length * 300}px` }}>
                {candidatiSelezionati.map(candidato => {
                  const profilo = candidato.profili_candidato;
                  const traits = (profilo?.traits_v5 as Record<string, number>) || {};
                  const match = matchResults[candidato.id];

                  return (
                    <Card key={candidato.id} className="flex-1 min-w-[280px] max-w-[350px]">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {candidato.cognome} {candidato.nome}
                            </CardTitle>
                            <CardDescription>
                              {candidato.ruolo_attuale || 'N/D'}
                            </CardDescription>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => removeCandidato(candidato.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Match Result */}
                        {match && (
                          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {ruoloConfronto}
                              </span>
                              <Badge variant={getVerdictBadgeVariantV5(match.verdict)}>
                                {getVerdictLabelV5(match.verdict)}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <Progress value={match.compatibilitaPct} className="h-2 flex-1" />
                              <span className="text-lg font-bold">{match.compatibilitaPct}%</span>
                            </div>
                            {match.disqualifiersAttivi.length > 0 && (
                              <div className="flex items-center gap-1 text-xs text-destructive">
                                <AlertTriangle className="h-3 w-3" />
                                {match.disqualifiersAttivi.length} disqualifier
                              </div>
                            )}
                          </div>
                        )}

                        <Separator />

                        {/* Macro Aree */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            Macro Aree
                          </h4>
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="bg-blue-50 dark:bg-blue-950/30 rounded p-2">
                              <div className="text-xs text-muted-foreground">ESSERE</div>
                              <div className="text-lg font-bold text-blue-600">
                                {profilo?.essere_pct?.toFixed(0) ?? '-'}%
                              </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-950/30 rounded p-2">
                              <div className="text-xs text-muted-foreground">FARE</div>
                              <div className="text-lg font-bold text-green-600">
                                {profilo?.fare_pct?.toFixed(0) ?? '-'}%
                              </div>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-950/30 rounded p-2">
                              <div className="text-xs text-muted-foreground">AVERE</div>
                              <div className="text-lg font-bold text-amber-600">
                                {profilo?.avere_pct?.toFixed(0) ?? '-'}%
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator />

                        {/* Tratti V5 */}
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold flex items-center gap-1">
                            <Brain className="h-4 w-4" />
                            15 Tratti V5
                          </h4>
                          <div className="space-y-1.5">
                            {TRAIT_CODES.map(code => {
                              const value = traits[code] ?? 0;
                              const normalized = ((value + 100) / 200) * 100;
                              return (
                                <div key={code} className="flex items-center gap-2">
                                  <span className="text-xs w-8 font-mono text-muted-foreground">
                                    {code}
                                  </span>
                                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                    <div 
                                      className={cn("h-full transition-all", getScoreBarColor(value))}
                                      style={{ width: `${Math.max(0, normalized)}%` }}
                                    />
                                  </div>
                                  <span className={cn("text-xs font-bold w-10 text-right", getScoreColor(value))}>
                                    {value > 0 ? '+' : ''}{value}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <Separator />

                        {/* Sindromi */}
                        {profilo?.syndromes_detected && Array.isArray(profilo.syndromes_detected) && (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold flex items-center gap-1">
                              <AlertTriangle className="h-4 w-4" />
                              Sindromi ({(profilo.syndromes_detected as any[]).length})
                            </h4>
                            <div className="flex flex-wrap gap-1">
                              {(profilo.syndromes_detected as any[]).map((s: any, idx: number) => (
                                <Badge 
                                  key={idx} 
                                  variant="outline"
                                  className={cn(
                                    "text-xs",
                                    s.severity === 'RED' && 'border-red-400 text-red-600',
                                    s.severity === 'ORANGE' && 'border-orange-400 text-orange-600',
                                    s.severity === 'YELLOW' && 'border-yellow-400 text-yellow-600',
                                  )}
                                >
                                  {s.code}
                                </Badge>
                              ))}
                              {(profilo.syndromes_detected as any[]).length === 0 && (
                                <span className="text-xs text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Nessuna sindrome
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Link Dettaglio */}
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => navigate(`/candidati/${candidato.id}`)}
                        >
                          Vedi Profilo Completo
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}

          {/* Empty State */}
          {(!candidatiSelezionati || candidatiSelezionati.length < 2) && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-2">Nessun confronto attivo</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                  Seleziona almeno 2 candidati V5 dalla lista sopra per visualizzare 
                  il confronto side-by-side con matching, tratti e sindromi.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </NotionLayout>
    </ProtectedRoute>
  );
}
