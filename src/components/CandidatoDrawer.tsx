import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CandleChart } from './CandleChart';
import { AnalisiPsicologica, AnalisiPsicologicaPlaceholder, AnalisiAI } from './AnalisiPsicologica';
import { FitIndicator } from './FitIndicator';
import { Candidato, ProfiloCandidato } from '@/types/database';
import { getProfiloTipoV5Label } from '@/lib/scoringV5';
import { Brain, Mail, Phone, Briefcase, Building2, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface CandidatoDrawerProps {
  candidato: (Candidato & { 
    aziende?: { nome: string } | null;
    profili_candidato?: ProfiloCandidato | null;
  }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CandidatoDrawer({ candidato, open, onOpenChange }: CandidatoDrawerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch analisi AI se esiste
  const { data: analisi, isLoading: isLoadingAnalisi } = useQuery({
    queryKey: ['analisi-candidato', candidato?.id],
    queryFn: async () => {
      if (!candidato?.id) return null;
      const { data, error } = await supabase
        .from('analisi_candidato')
        .select('*')
        .eq('candidato_id', candidato.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!candidato?.id && !!candidato?.test_completato,
  });

  // Mutation per generare analisi
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error('Non autenticato');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-candidate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${sessionData.session.access_token}`,
          },
          body: JSON.stringify({ candidato_id: candidato?.id }),
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Errore nella generazione');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analisi-candidato', candidato?.id] });
      toast({ title: 'Analisi generata', description: 'L\'analisi AI è stata completata' });
    },
    onError: (error: Error) => {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    },
  });

  if (!candidato) return null;

  const profilo = candidato.profili_candidato;
  const scalePunteggi = profilo?.scale_punteggi || {};

  // Trasforma analisi DB in formato componente
  const analisiFormatted: AnalisiAI | null = analisi ? {
    profilo_sintetico: analisi.profilo_sintetico || '',
    punti_forza: (analisi.punti_forza as string[]) || [],
    punti_debolezza: (analisi.punti_debolezza as string[]) || [],
    rischi_operativi: analisi.rischi_operativi || '',
    fit_score: analisi.fit_score || 0,
    fit_verdict: (analisi.fit_verdict as 'NON_IDONEO' | 'VALUTARE' | 'IDONEO') || 'VALUTARE',
    fit_motivo: analisi.fit_motivo || '',
    raccomandazione: (analisi.raccomandazione as any) || {
      decisione: 'VALUTARE',
      motivo_principale: '',
      rischio_aziendale: '',
      tempo_onboarding: '',
      probabilita_successo_12m: 0,
    },
  } : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        <SheetHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl">
              {candidato.cognome} {candidato.nome}
            </SheetTitle>
            {analisi?.fit_verdict && (
              <FitIndicator verdict={analisi.fit_verdict as any} size="lg" showLabel />
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 pb-6">
            {/* Info base */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {candidato.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{candidato.email}</span>
                </div>
              )}
              {candidato.telefono && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{candidato.telefono}</span>
                </div>
              )}
              {candidato.ruolo_attuale && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  <span>{candidato.ruolo_attuale}</span>
                </div>
              )}
              {candidato.funzione && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>{candidato.funzione}</span>
                </div>
              )}
              {candidato.eta && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{candidato.eta} anni</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant={candidato.test_completato ? 'default' : 'secondary'}>
                {candidato.test_completato ? 'Test Completato' : 'Test da fare'}
              </Badge>
              {profilo?.profilo_tipo && (
                <Badge variant="outline">{getProfiloTipoV5Label(profilo.profilo_tipo as any)}</Badge>
              )}
              {profilo?.stress_zone && (
                <Badge variant="destructive">Zona Stress</Badge>
              )}
            </div>

            <Separator />

            {/* Contenuto per test completato */}
            {candidato.test_completato && profilo ? (
              <>
                {/* Grafico Candele */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Profilo Competenze</h3>
                  <CandleChart scalePunteggi={scalePunteggi} />
                </div>

                <Separator />

                {/* Analisi AI */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      Analisi AI
                    </h3>
                    <Button
                      onClick={() => generateMutation.mutate()}
                      disabled={generateMutation.isPending}
                      variant={analisi ? 'outline' : 'default'}
                      size="sm"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generazione...
                        </>
                      ) : analisi ? (
                        'Rigenera Analisi'
                      ) : (
                        'Genera Analisi'
                      )}
                    </Button>
                  </div>

                  {isLoadingAnalisi ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : analisiFormatted ? (
                    <AnalisiPsicologica 
                      analisi={analisiFormatted} 
                      candidatoNome={`${candidato.nome} ${candidato.cognome}`}
                    />
                  ) : (
                    <AnalisiPsicologicaPlaceholder />
                  )}
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-muted-foreground">
                <p>Il candidato non ha ancora completato il test.</p>
                <p className="text-sm mt-2">L'analisi sarà disponibile dopo il completamento.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
