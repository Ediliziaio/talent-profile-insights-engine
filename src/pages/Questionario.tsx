import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AnswerButton } from '@/components/AnswerButton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { DOMANDE } from '@/data/questionario';
import { calcolaProfiloV5, determinaProfiloTipoV5, RispostaInputV5 } from '@/lib/scoringV5';
import { getActiveSyndromes, formatSyndromesForDB, TraitScores } from '@/lib/syndromes';
import { calcolaValiditaEstesa, TEMPO_MS_MAX_VALIDO } from '@/lib/validityV5';
import { QUESTIONS_PER_PAGE, ANSWER_OPTIONS, type AnswerValue } from '@/lib/constants';
import { Brain, ChevronLeft, ChevronRight, Send, Loader2, CheckCircle2, CloudUpload } from 'lucide-react';
import { Candidato, RispostaValueV5 } from '@/types/database';
import { Json } from '@/integrations/supabase/types';
import { cn } from '@/lib/utils';
import { QuestionarioSkeleton } from '@/components/skeletons';

// ---- Memoized Question Block Components ----

interface QuestionBlockDesktopProps {
  domanda: (typeof DOMANDE)[number];
  questionNumber: number;
  selectedValue: AnswerValue | undefined;
  savingId: number | null;
  onAnswer: (domandaId: number, valore: AnswerValue) => void;
  animationDelay: number;
}

const QuestionBlockDesktop = React.memo(function QuestionBlockDesktop({
  domanda, questionNumber, selectedValue, savingId, onAnswer, animationDelay,
}: QuestionBlockDesktopProps) {
  const options = domanda.risposte_custom
    ? ANSWER_OPTIONS.map(option => ({
        ...option,
        label: domanda.risposte_custom![option.value.toLowerCase() as 'a' | 'b' | 'c'],
        shortLabel: domanda.risposte_custom![option.value.toLowerCase() as 'a' | 'b' | 'c'],
      }))
    : ANSWER_OPTIONS;

  return (
    <Card className={cn(
      "hidden lg:block transition-all duration-300",
      "animate-in fade-in-50 slide-in-from-bottom-1",
      selectedValue ? "border-accent/50 shadow-md" : ""
    )} style={{ animationDelay: `${animationDelay}ms` }}>
      <CardContent className="p-3 lg:p-4">
        <div className="lg:grid lg:grid-cols-[1fr_auto_auto_auto] gap-3 items-center">
          <div className="flex gap-2 items-start">
            <span className="text-muted-foreground font-medium min-w-[2.5rem] text-sm">
              {questionNumber}.
            </span>
            <p className="font-medium text-sm lg:text-base leading-snug line-clamp-2">
              {domanda.testo}
            </p>
          </div>
          {options.map(option => (
            <AnswerButton
              key={option.value}
              value={option.value}
              label={option.label}
              selected={selectedValue === option.value}
              onClick={() => onAnswer(domanda.id, option.value)}
              variant="desktop"
              isSaving={savingId === domanda.id}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

interface QuestionBlockMobileProps {
  domanda: (typeof DOMANDE)[number];
  questionNumber: number;
  selectedValue: AnswerValue | undefined;
  savingId: number | null;
  onAnswer: (domandaId: number, valore: AnswerValue) => void;
  animationDelay: number;
  showDivider: boolean;
}

const QuestionBlockMobile = React.memo(function QuestionBlockMobile({
  domanda, questionNumber, selectedValue, savingId, onAnswer, animationDelay, showDivider,
}: QuestionBlockMobileProps) {
  const options = domanda.risposte_custom
    ? ANSWER_OPTIONS.map(option => ({
        ...option,
        label: domanda.risposte_custom![option.value.toLowerCase() as 'a' | 'b' | 'c'],
        shortLabel: domanda.risposte_custom![option.value.toLowerCase() as 'a' | 'b' | 'c'],
      }))
    : ANSWER_OPTIONS;

  return (
    <div className={cn(
      "lg:hidden py-2.5 px-2 rounded-md transition-all duration-200",
      "animate-in fade-in-50",
      selectedValue
        ? "border-l-[3px] border-l-accent bg-accent/5"
        : "border-l-[3px] border-l-transparent"
    )} style={{ animationDelay: `${animationDelay}ms` }}>
      <div className="space-y-2">
        <div className="flex gap-1.5 items-start">
          <span className="text-muted-foreground font-medium min-w-[1.5rem] text-xs mt-0.5">
            {questionNumber}.
          </span>
          <p className="font-medium text-[13px] leading-snug">{domanda.testo}</p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 pl-5">
          {options.map(option => (
            <AnswerButton
              key={option.value}
              value={option.value}
              label={option.label}
              shortLabel={option.shortLabel}
              selected={selectedValue === option.value}
              onClick={() => onAnswer(domanda.id, option.value)}
              isSaving={savingId === domanda.id}
              variant="mobile"
            />
          ))}
        </div>
      </div>
      {showDivider && (
        <div className="h-px bg-border/50 mt-2.5 -mx-2" />
      )}
    </div>
  );
});

// ---- Main Component ----

export default function Questionario() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(0);
  const [risposte, setRisposte] = useState<Record<number, AnswerValue>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  /* Misura dei tempi di risposta (per l'attendibilità estesa).
     tempiRef: ms fra una risposta e la successiva, per domanda.
     lastAnswerTsRef: istante dell'ultima risposta (o dell'ultimo cambio pagina,
     così la prima domanda di ogni pagina non ingloba il tempo di lettura
     accumulato altrove). Se la colonna tempo_ms non esiste ancora nel DB,
     tempoMsSupportato disattiva l'invio senza rompere il salvataggio. */
  const tempiRef = React.useRef<Record<number, number>>({});
  const lastAnswerTsRef = React.useRef<number>(performance.now());
  const tempoMsSupportatoRef = React.useRef(true);

  useEffect(() => {
    lastAnswerTsRef.current = performance.now();
  }, [currentPage]);

  const totalPages = Math.ceil(DOMANDE.length / QUESTIONS_PER_PAGE);
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const endIndex = Math.min(startIndex + QUESTIONS_PER_PAGE, DOMANDE.length);
  const currentQuestions = useMemo(
    () => DOMANDE.slice(startIndex, endIndex),
    [startIndex, endIndex]
  );

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

  // Load existing answers via useQuery for cache, retry, and proper error handling
  const { data: risposteCaricate, isLoading: loadingRisposteQuery } = useQuery({
    queryKey: ['risposte', candidato?.id],
    queryFn: async () => {
      if (!candidato) return {};
      const { data, error } = await supabase
        .from('risposte')
        .select('domanda_id, valore')
        .eq('candidato_id', candidato.id);
      if (error) throw error;
      const existing: Record<number, AnswerValue> = {};
      (data ?? []).forEach((r) => {
        existing[r.domanda_id] = r.valore as AnswerValue;
      });
      return existing;
    },
    enabled: !!candidato,
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });

  // Sync loaded answers into local state (once)
  useEffect(() => {
    if (risposteCaricate && Object.keys(risposteCaricate).length > 0 && Object.keys(risposte).length === 0) {
      setRisposte(risposteCaricate);
    }
  }, [risposteCaricate]);

  const loadingRisposte = loadingRisposteQuery;

  const saveMutation = useMutation({
    mutationFn: async ({ domandaId, valore }: { domandaId: number; valore: AnswerValue }) => {
      if (!candidato) throw new Error('Candidato non trovato');

      const base = {
        candidato_id: candidato.id,
        domanda_id: domandaId,
        valore,
      };
      const tempo = tempiRef.current[domandaId];

      if (tempoMsSupportatoRef.current && tempo !== undefined) {
        const { error } = await supabase
          .from('risposte')
          .upsert({ ...base, tempo_ms: tempo }, { onConflict: 'candidato_id,domanda_id' });
        if (!error) return;
        // Colonna assente (migration non applicata): riprova senza e smetti di provarci
        if (/tempo_ms/.test(error.message)) {
          tempoMsSupportatoRef.current = false;
        } else {
          throw error;
        }
      }

      const { error } = await supabase
        .from('risposte')
        .upsert(base, { onConflict: 'candidato_id,domanda_id' });

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
    // Registra il tempo solo alla prima risposta: la correzione di una risposta
    // già data non dice nulla sulla velocità di lettura.
    if (tempiRef.current[domandaId] === undefined) {
      const now = performance.now();
      const delta = Math.round(now - lastAnswerTsRef.current);
      if (delta > 0 && delta <= TEMPO_MS_MAX_VALIDO) {
        tempiRef.current[domandaId] = delta;
      }
      lastAnswerTsRef.current = now;
    }
    setRisposte((prev) => ({ ...prev, [domandaId]: valore }));
    saveMutation.mutate({ domandaId, valore });
  }, [saveMutation]);

  const canGoNext = currentQuestions.every((q) => risposte[q.id]);
  const progress = (Object.keys(risposte).length / DOMANDE.length) * 100;
  const isLastPage = currentPage === totalPages - 1;
  const allAnswered = Object.keys(risposte).length === DOMANDE.length;
  const isSaving = saveMutation.isPending;

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
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async () => {
    if (!candidato || !allAnswered) return;

    setIsSubmitting(true);
    try {
      // Prepara risposte per scoring V5
      const risposteArray: RispostaInputV5[] = Object.entries(risposte).map(([id, valore]) => ({
        domanda_id: parseInt(id),
        valore: valore as RispostaValueV5,
      }));
      
      // Converti DOMANDE per il calcolo V5
      const domandeV5 = DOMANDE.map(d => ({
        id: d.id,
        scala_primaria: d.scala_primaria,
        polarita: d.polarita,
      }));
      
      // Calcola profilo V5
      const profilo = calcolaProfiloV5(risposteArray, domandeV5);

      // Attendibilità estesa: coerenza intra-tratto, risposte in serie, tempi.
      // Affianca il reliability_index del manuale, non lo sostituisce.
      const validitaEstesa = calcolaValiditaEstesa(risposteArray, domandeV5, tempiRef.current);
      
      // Rileva sindromi comportamentali
      const traitScores: TraitScores = {
        ORG: profilo.traits_v5.ORG,
        AUT: profilo.traits_v5.AUT,
        GP: profilo.traits_v5.GP,
        ADS: profilo.traits_v5.ADS,
        DET: profilo.traits_v5.DET,
        VEN: profilo.traits_v5.VEN,
        HRM: profilo.traits_v5.HRM,
        LDR: profilo.traits_v5.LDR,
        PRO: profilo.traits_v5.PRO,
        COM: profilo.traits_v5.COM,
        ESP: profilo.traits_v5.ESP,
        RC: profilo.traits_v5.RC,
        FIN: profilo.traits_v5.FIN,
        SUC: profilo.traits_v5.SUC,
        PRI: profilo.traits_v5.PRI,
      };
      const syndromes = getActiveSyndromes(traitScores, candidato.eta ?? undefined);
      const syndromesForDB = formatSyndromesForDB(syndromes);

      // Ricalcola profilo tipo con sindromi
      const activeSyndromeCodes = syndromes
        .filter(s => s.isActive)
        .map(s => s.code);
      const hasCriticalSyndromes = activeSyndromeCodes
        .some(c => ['S01', 'S02', 'S03', 'S04'].includes(c));
      const profiloTipoCorretto = determinaProfiloTipoV5(
        profilo.traits_v5,
        { essere_pct: profilo.essere_pct, fare_pct: profilo.fare_pct, avere_pct: profilo.avere_pct },
        hasCriticalSyndromes,
        activeSyndromeCodes
      );

      // Idempotent: check if profile already exists (retry-safe)
      const { data: existingProfilo } = await supabase
        .from('profili_candidato')
        .select('id')
        .eq('candidato_id', candidato.id)
        .maybeSingle();

      if (existingProfilo) {
        toast({
          title: 'Test già completato',
          description: 'I risultati erano già stati salvati.',
        });
        navigate('/test/completato');
        return;
      }

      // Salva risultati per ogni tratto V5 — upsert per idempotenza
      const risultatiData = Object.entries(profilo.traits_v5).map(([scala, punteggio]) => ({
        candidato_id: candidato.id,
        scala,
        punteggio_normalizzato: punteggio,
        punteggio_grezzo: punteggio,
      }));

      const { error: risultatiError } = await supabase
        .from('risultati')
        .upsert(risultatiData, { onConflict: 'candidato_id,scala' });

      if (risultatiError) throw risultatiError;

      // Salva profilo V5 completo
      const profiloData = {
        candidato_id: candidato.id,
        essere_pct: profilo.essere_pct,
        fare_pct: profilo.fare_pct,
        avere_pct: profilo.avere_pct,
        traits_v5: profilo.traits_v5 as Json,
        profilo_tipo_v5: profiloTipoCorretto,
        reliability_index: profilo.reliability_index,
        syndromes_detected: syndromesForDB as Json,
        out_points: profilo.valleys as Json,
        strength_points: profilo.strengths as Json,
        scale_punteggi: profilo.traits_v5 as Json,
        leadership_pct: profilo.avere_pct,
        maturita_pct: profilo.essere_pct,
        potenziale_pct: profilo.fare_pct,
        stress_zone: hasCriticalSyndromes,
        assessment_version: 'v5',
      };

      // Prova a salvare anche i segnali di validità; se la colonna non esiste
      // ancora (migration non applicata) riprova senza, senza bloccare il test.
      let { error: profiloError } = await supabase
        .from('profili_candidato')
        .upsert([{ ...profiloData, validity_flags: validitaEstesa as unknown as Json }], {
          onConflict: 'candidato_id',
        });

      if (profiloError && /validity_flags/.test(profiloError.message)) {
        ({ error: profiloError } = await supabase
          .from('profili_candidato')
          .upsert([profiloData], { onConflict: 'candidato_id' }));
      }

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
    <div className="min-h-screen bg-background pb-32 sm:pb-24 safe-area-bottom">
      <div className="max-w-6xl mx-auto px-2.5 sm:px-4 py-3 sm:py-6 space-y-2 sm:space-y-6">
        {/* Header - compact on mobile */}
        <div className="bg-primary text-primary-foreground rounded-lg overflow-hidden">
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-4">
            <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg shrink-0">
              <Brain className="h-4 w-4 sm:h-6 sm:w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm sm:text-lg">Talenti Edili</h1>
              <p className="text-[11px] sm:text-sm opacity-90 truncate">
                <span className="sm:hidden">Pag. {currentPage + 1}/{totalPages}</span>
                <span className="hidden sm:inline">Pag. {currentPage + 1}/{totalPages} • Dom. {startIndex + 1}-{endIndex} di {DOMANDE.length}</span>
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-lg sm:text-2xl font-bold">{Math.round(progress)}%</span>
            </div>
          </div>
          {/* Progress bar integrated in header */}
          <div className="h-1.5 sm:h-3 bg-white/20">
            <div 
              className="h-full bg-white/60 transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Separate progress bar on desktop only */}
        <div className="hidden sm:block h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full progress-gradient transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Questions - Memoized blocks */}
        <div className="space-y-1.5 sm:space-y-3">
          {currentQuestions.map((domanda, idx) => (
            <React.Fragment key={domanda.id}>
              <QuestionBlockDesktop
                domanda={domanda}
                questionNumber={startIndex + idx + 1}
                selectedValue={risposte[domanda.id]}
                savingId={savingId}
                onAnswer={handleAnswer}
                animationDelay={idx * 30}
              />
              <QuestionBlockMobile
                domanda={domanda}
                questionNumber={startIndex + idx + 1}
                selectedValue={risposte[domanda.id]}
                savingId={savingId}
                onAnswer={handleAnswer}
                animationDelay={idx * 20}
                showDivider={idx < currentQuestions.length - 1}
              />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Sticky Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t py-2 sm:py-4 px-3 sm:px-4 z-50 safe-area-bottom">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-2 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0}
            className="h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Indietro</span>
          </Button>

          {/* Global saving indicator */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {isSaving ? (
              <span className="flex items-center gap-1 text-primary animate-pulse">
                <CloudUpload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Salvataggio...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span className="hidden sm:inline">Salvato</span>
              </span>
            )}
            <span className="font-semibold ml-1">{Object.keys(risposte).length}/{DOMANDE.length}</span>
          </div>

          {isLastPage && allAnswered ? (
            <Button 
              onClick={() => setShowConfirmDialog(true)} 
              disabled={isSubmitting} 
              className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base bg-accent hover:bg-accent/90"
            >
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
              className="h-10 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Avanti</span>
              <ChevronRight className="h-4 w-4 sm:ml-2" />
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma invio test</AlertDialogTitle>
            <AlertDialogDescription>
              Stai per inviare le tue risposte. Questa azione non è reversibile: una volta confermato, 
              non sarà più possibile modificare le risposte. Sei sicuro di voler procedere?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Torna al test</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-accent hover:bg-accent/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Invio in corso...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Conferma e Invia
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
