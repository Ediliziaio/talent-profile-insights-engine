import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DOMANDE } from '@/data/questionario';
import { calcolaProfilo, RispostaInput } from '@/lib/scoring';
import { Brain, ChevronLeft, ChevronRight, Send, Loader2 } from 'lucide-react';
import { Candidato } from '@/types/database';

const QUESTIONS_PER_PAGE = 5;

export default function Questionario() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(0);
  const [risposte, setRisposte] = useState<Record<number, 'A' | 'B' | 'C'>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalPages = Math.ceil(DOMANDE.length / QUESTIONS_PER_PAGE);
  const startIndex = currentPage * QUESTIONS_PER_PAGE;
  const currentQuestions = DOMANDE.slice(startIndex, startIndex + QUESTIONS_PER_PAGE);

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

  // Load existing answers
  useEffect(() => {
    if (candidato) {
      supabase
        .from('risposte')
        .select('domanda_id, valore')
        .eq('candidato_id', candidato.id)
        .then(({ data }) => {
          if (data) {
            const existing: Record<number, 'A' | 'B' | 'C'> = {};
            data.forEach((r) => {
              existing[r.domanda_id] = r.valore as 'A' | 'B' | 'C';
            });
            setRisposte(existing);
          }
        });
    }
  }, [candidato]);

  const saveMutation = useMutation({
    mutationFn: async ({ domandaId, valore }: { domandaId: number; valore: 'A' | 'B' | 'C' }) => {
      if (!candidato) throw new Error('Candidato non trovato');

      // Upsert the answer
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
  });

  const handleAnswer = (domandaId: number, valore: 'A' | 'B' | 'C') => {
    setRisposte((prev) => ({ ...prev, [domandaId]: valore }));
    saveMutation.mutate({ domandaId, valore });
  };

  const canGoNext = currentQuestions.every((q) => risposte[q.id]);
  const progress = (Object.keys(risposte).length / DOMANDE.length) * 100;
  const isLastPage = currentPage === totalPages - 1;
  const allAnswered = Object.keys(risposte).length === DOMANDE.length;

  // Only candidato role can access this page - check AFTER all hooks
  if (!authLoading && profile?.ruolo !== 'candidato') {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async () => {
    if (!candidato || !allAnswered) return;

    setIsSubmitting(true);
    try {
      // Calculate profile
      const risposteArray: RispostaInput[] = Object.entries(risposte).map(([id, valore]) => ({
        domanda_id: parseInt(id),
        valore,
      }));
      const profilo = calcolaProfilo(risposteArray);

      // Save risultati for each scale
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

      // Save profilo_candidato
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

      // Update candidato
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
    } catch (error: any) {
      toast({
        title: 'Errore',
        description: error.message || 'Si è verificato un errore durante l\'invio',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingCandidato) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!candidato) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Errore</CardTitle>
            <CardDescription>
              Non è stato possibile trovare il tuo profilo candidato. Contatta l'amministratore.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (candidato.test_completato) {
    navigate('/test/completato');
    return null;
  }

  return (
    <div className="min-h-screen bg-background py-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Brain className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">Talent Profile Assessment</h1>
            <p className="text-sm text-muted-foreground">
              Domanda {startIndex + 1}-{Math.min(startIndex + QUESTIONS_PER_PAGE, DOMANDE.length)} di {DOMANDE.length}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {currentQuestions.map((domanda, idx) => (
            <Card key={domanda.id} className={risposte[domanda.id] ? 'border-primary/30' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium flex gap-2">
                  <span className="text-muted-foreground">{startIndex + idx + 1}.</span>
                  {domanda.testo}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={risposte[domanda.id] || ''}
                  onValueChange={(value) => handleAnswer(domanda.id, value as 'A' | 'B' | 'C')}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="A" id={`${domanda.id}-A`} />
                    <Label htmlFor={`${domanda.id}-A`} className="flex-1 cursor-pointer">
                      <span className="font-medium">A.</span> Sì, sempre / Decisamente sì
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="B" id={`${domanda.id}-B`} />
                    <Label htmlFor={`${domanda.id}-B`} className="flex-1 cursor-pointer">
                      <span className="font-medium">B.</span> Incerto, a volte / Dipende
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer">
                    <RadioGroupItem value="C" id={`${domanda.id}-C`} />
                    <Label htmlFor={`${domanda.id}-C`} className="flex-1 cursor-pointer">
                      <span className="font-medium">C.</span> No, più no che sì / Mai
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Indietro
          </Button>

          {isLastPage && allAnswered ? (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Invia Risposte
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={!canGoNext}
            >
              Avanti
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
