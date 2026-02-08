import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnswerButton } from '@/components/AnswerButton';
import { useToast } from '@/hooks/use-toast';
import { DOMANDE } from '@/data/questionario';
import { calcolaProfilo, RispostaInput } from '@/lib/scoring';
import { QUESTIONS_PER_PAGE, ANSWER_OPTIONS, type AnswerValue } from '@/lib/constants';
import { Brain, ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { Candidato } from '@/types/database';
import { cn } from '@/lib/utils';
import { QuestionarioSkeleton } from '@/components/skeletons';

export default function Questionario() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(0);
  const [risposte, setRisposte] = useState<Record<number, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRisposte, setLoadingRisposte] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);

  const totalPages = Math.ceil(DOMANDE.length / QUESTIONS_PER_PAGE);
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, DOMANDE.length);
  const currentQuestions = DOMANDE.slice(startIndex, endIndex);

  const { data: candidato, isLoading: loadingCandidato } = useQuery({
    queryKey: ['candidato', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('candidati')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Candidato | null;
    },
    enabled: !!user,
  });

  // Load existing answers with proper loading state
  useEffect(() => {
    if (candidato) {
      setLoadingRisposte(true);
      supabase
        .from('risposte')
        .select('domanda_id, valore')
        .eq('candidato_id', candidato.id)
        .then(({ data, error }) => {
          if (error) {
            toast({
              title: 'Errore caricamento',
              description: 'Impossibile caricare le risposte salvate',
              variant: 'destructive',
            });
          } else if (data) {
            const existing: Record<number, AnswerValue> = {};
            data.forEach((r) => {
              existing[r.domanda_id] = r.valore as AnswerValue;
            });
            setRisposte(existing);
          }
          setLoadingRisposte(false);
        });
    } else {
      setLoadingRisposte(false);
    }
  }, [candidato, toast]);

  const saveMutation = useMutation({
    mutationFn: async ({ domandaId, valore }: { domandaId: number; valore: AnswerValue }) => {
      if (!candidato) throw new Error('Candidato non trovato');

      const { error } = await supabase
        .from('risposte')
        .upsert({
          candidato_id: candidato.id,
          domanda_id: domandaId,
          valore,
        }, {
          onConflict: 'candidato_id,domanda_id',
        });

      if (error) throw error;
    },
    onMutate: ({ domandaId }) => {
      setSavingId(domandaId);
    },
    onSettled: () => {
      setSavingId(null);
    },
    onError: () => {
      toast({
        title: 'Errore salvataggio',
        description: 'Riprova a selezionare la risposta',
      });
    },
  });

  const handleAnswer = useCallback((domandaId: number, valore: AnswerValue) => {
    setRisposte((prev) => ({ ...prev, [domandaId]: valore }));
    saveMutation.mutate({ domandaId, valore });
  }, [saveMutation]);

  const canGoNext = currentQuestions.every((q) => risposte[q.id]);
  const progress = (Object.keys(risposte).length / DOMANDE.length) * 100;
  const isLastPage = currentPage === totalPages - 1;
  const allAnswered = Object.keys(risposte).length === DOMANDE.length;

  // Auto-scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Redirect if test already completed (using useEffect for side effects)
  useEffect(() => {
    if (candidato?.test_completato) {
      navigate('/test/completato');
    }
  }, [candidato?.test_completato, navigate]);

  // Only candidato role can access this page
  if (!authLoading && profile?.ruolo !== 'candidato') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async () => {
    if (!candidato || !allAnswered) return;

    setIsSubmitting(true);
    try {
      const risposteArray: RispostaInput[] = Object.entries(risposte).map(([id, valore]) => ({
        domanda_id: parseInt(id),
        valore,
      }));
      const profilo = calcolaProfilo(risposteArray);

      const risultatiData = Object.entries(profilo.scale_punteggi).map(([scala, punteggio]) => ({
        candidato_id: candidato.id,
        scala,
        punteggio_normalizzato: punteggio,
        punteggio_grezzo: punteggio,
      }));

      const { error: risultatiError } = await supabase
        .from('risultati')
        .insert(risultatiData);

      if (risultatiError) throw risultatiError;

      const { error: profiloError } = await supabase
        .from('profili_candidato')
        .insert({
          candidato_id: candidato.id,
          leadership_pct: profilo.leadership_pct,
          maturita_pct: profilo.maturita_pct,
          potenziale_pct: profilo.potenziale_pct,
          schematicita: profilo.schematicita,
          stress_zone: profilo.stress_zone,
          profilo_tipo: profilo.profilo_tipo,
          out_points: profilo.out_points,
          strength_points: profilo.strength_points,
          scale_punteggi: profilo.scale_punteggi,
        });

      if (profiloError) throw profiloError;

      const { error: updateError } = await supabase
        .from('candidati')
        .update({
          test_completato: true,
          data_test: new Date().toISOString(),
        })
        .eq('id', candidato.id);

      if (updateError) throw updateError;

      toast({
        title: 'Test completato!',
        description: 'Le tue risposte sono state inviate con successo.',
      });

      navigate('/test/completato');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Si è verificato un errore durante l\'invio';
      toast({
        title: 'Errore',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading states
  if (loadingCandidato || loadingRisposte) {
    return <QuestionarioSkeleton />;
  }

  if (!candidato) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Errore</h2>
              <p className="text-muted-foreground">
                Non è stato possibile trovare il tuo profilo candidato. Contatta l'amministratore.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Guard for completed test (navigation handled by useEffect above)
  if (candidato.test_completato) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-28 sm:pb-24 safe-area-bottom">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 bg-primary text-primary-foreground rounded-lg p-3 sm:p-4">
          <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg shrink-0">
            <Brain className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base sm:text-lg">Talent Profile</h1>
            <p className="text-xs sm:text-sm opacity-90 truncate">
              Pag. {currentPage + 1}/{totalPages} • Dom. {startIndex + 1}-{endIndex} di {DOMANDE.length}
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xl sm:text-2xl font-bold">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Progress */}
        <div className="h-3 sm:h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full progress-gradient transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Questions - Optimized Desktop Grid */}
        <div className="space-y-3">
          {currentQuestions.map((domanda, idx) => (
            <Card key={domanda.id} className={cn(
              "transition-all duration-300 min-h-[72px]",
              "animate-in fade-in-50 slide-in-from-bottom-1",
              risposte[domanda.id] ? "border-accent/50 shadow-md" : ""
            )} style={{ animationDelay: `${idx * 30}ms` }}>
              <CardContent className="p-3 lg:p-4">
                {/* Desktop: 4 column grid [50% | 16% | 17% | 17%] */}
                <div className="hidden lg:grid lg:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
                  {/* Column 1: Question - takes ~50% width */}
                  <div className="flex gap-2 items-start">
                    <span className="text-muted-foreground font-medium min-w-[2.5rem] text-sm">
                      {startIndex + idx + 1}.
                    </span>
                    <p className="font-medium text-sm lg:text-base leading-snug line-clamp-2">
                      {domanda.testo}
                    </p>
                  </div>

                  {/* Answer buttons - Desktop */}
                  {ANSWER_OPTIONS.map(option => (
                    <AnswerButton
                      key={option.value}
                      value={option.value}
                      label={option.label}
                      selected={risposte[domanda.id] === option.value}
                      onClick={() => handleAnswer(domanda.id, option.value)}
                      variant="desktop"
                      isSaving={savingId === domanda.id}
                    />
                  ))}
                </div>

                {/* Mobile: Stack layout */}
                <div className="lg:hidden space-y-2.5">
                  {/* Question */}
                  <div className="flex gap-2 items-start">
                    <span className="text-muted-foreground font-medium min-w-[1.75rem] text-sm">
                      {startIndex + idx + 1}.
                    </span>
                    <p className="font-medium text-sm leading-relaxed">{domanda.testo}</p>
                  </div>

                  {/* Answer buttons - Mobile */}
                  <div className="grid grid-cols-3 gap-2">
                    {ANSWER_OPTIONS.map(option => (
                      <AnswerButton
                        key={option.value}
                        value={option.value}
                        label={option.label}
                        shortLabel={option.shortLabel}
                        selected={risposte[domanda.id] === option.value}
                        onClick={() => handleAnswer(domanda.id, option.value)}
                        isSaving={savingId === domanda.id}
                        variant="mobile"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sticky Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t py-3 sm:py-4 px-3 sm:px-4 z-50 safe-area-bottom">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0}
            className="h-12 px-3 sm:px-4 text-sm sm:text-base"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Indietro</span>
          </Button>

          <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">{Object.keys(risposte).length}/{DOMANDE.length}</span>
          </div>

          {isLastPage && allAnswered ? (
            <Button onClick={handleSubmit} disabled={isSubmitting} className="h-12 px-4 sm:px-6 text-sm sm:text-base bg-accent hover:bg-accent/90">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:mr-2" />
              )}
              <span className="hidden sm:inline">Invia Test</span>
              <span className="sm:hidden">Invia</span>
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!canGoNext}
              className="h-12 px-3 sm:px-4 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Avanti</span>
              <ChevronRight className="h-4 w-4 sm:ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
