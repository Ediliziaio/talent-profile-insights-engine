import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Shield, Lock, FileText, Lightbulb, Clock, Target, Heart, CheckCircle, Loader2 } from 'lucide-react';

export default function ConsensoPrivacy() {
  const { profile, user, loading } = useAuth();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [checkingTest, setCheckingTest] = useState(true);
  const [navigating, setNavigating] = useState(false);

  // Check if test already completed → redirect
  useEffect(() => {
    if (!user || loading) return;
    
    const checkTestStatus = async () => {
      const { data } = await supabase
        .from('candidati')
        .select('test_completato')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data?.test_completato) {
        navigate('/test/completato', { replace: true });
      } else {
        setCheckingTest(false);
      }
    };
    
    checkTestStatus();
  }, [user, loading, navigate]);

  if (loading || checkingTest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // If not authenticated, redirect to auth
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Only candidato role can access this page
  if (profile?.ruolo !== 'candidato') {
    return <Navigate to="/" replace />;
  }

  const handleContinue = () => {
    if (accepted && !navigating) {
      setNavigating(true);
      navigate('/test/questionario');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-3 sm:p-4 safe-area-bottom">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="mx-auto p-2.5 sm:p-3 bg-primary/10 rounded-full w-fit mb-3 sm:mb-4">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">Talent Profile Assessment</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Benvenuto/a, {profile?.nome || 'Candidato'}! Prima di iniziare, leggi attentamente le linee guida e l'informativa sulla privacy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Psychological Guidelines */}
          <Card className="border-accent/30 bg-accent/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-accent">
                <Lightbulb className="h-5 w-5" />
                Linee Guida per il Candidato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Questo sistema di analisi non è a tempo</p>
                    <p className="text-xs text-muted-foreground">Prenditi tutto il tempo necessario per riflettere su ogni domanda.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">L'obiettivo è trovare spunti di riflessione e crescita personale</p>
                    <p className="text-xs text-muted-foreground">Non esistono risposte giuste o sbagliate, solo quelle che ti rappresentano.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Comprendi bene il senso della domanda prima di rispondere</p>
                    <p className="text-xs text-muted-foreground">Leggi attentamente ogni quesito e le opzioni di risposta disponibili.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-accent/20 mt-0.5">
                    <Heart className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-accent">Descrivi come SEI realmente, non come vorresti essere</p>
                    <p className="text-xs text-muted-foreground">L'autenticità delle risposte garantisce un profilo accurato e utile per te.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security badges */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground items-center justify-center">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Dati protetti</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Crittografia SSL</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>GDPR Compliant</span>
            </div>
          </div>

          <ScrollArea className="h-40 sm:h-48 rounded-md border p-3 sm:p-4">
            <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
              <h3 className="font-semibold text-sm sm:text-base">Informativa sul Trattamento dei Dati Personali</h3>
              
              <p>
                Ai sensi dell'art. 13 del Regolamento UE 2016/679 (GDPR), La informiamo che i dati personali 
                da Lei forniti saranno trattati nel rispetto della normativa vigente in materia di protezione 
                dei dati personali.
              </p>

              <h4 className="font-semibold">1. Titolare del Trattamento</h4>
              <p>
                Il Titolare del trattamento è l'azienda che ha richiesto la Sua valutazione, 
                come indicato nelle comunicazioni a Lei inviate.
              </p>

              <h4 className="font-semibold">2. Finalità del Trattamento</h4>
              <p>
                I dati raccolti attraverso questo questionario saranno utilizzati esclusivamente per:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Valutazione del profilo psico-attitudinale ai fini della selezione del personale</li>
                <li>Analisi delle competenze e del potenziale professionale</li>
                <li>Supporto alle decisioni in ambito HR</li>
              </ul>

              <h4 className="font-semibold">3. Natura dei Dati</h4>
              <p>
                Il questionario raccoglie informazioni relative a:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Dati anagrafici (nome, cognome, età)</li>
                <li>Preferenze comportamentali e attitudinali</li>
                <li>Stili di lavoro e relazionali</li>
              </ul>

              <h4 className="font-semibold">4. Conservazione dei Dati</h4>
              <p>
                I dati saranno conservati per il tempo strettamente necessario alle finalità indicate 
                e comunque non oltre 24 mesi dalla data di compilazione, salvo obblighi di legge.
              </p>

              <h4 className="font-semibold">5. Diritti dell'Interessato</h4>
              <p>
                Lei ha il diritto di accedere ai propri dati, richiederne la rettifica, la cancellazione, 
                la limitazione del trattamento, nonché di opporsi al trattamento stesso. 
                Per esercitare tali diritti, può contattare il Titolare del trattamento.
              </p>

              <h4 className="font-semibold">6. Misure di Sicurezza</h4>
              <p>
                I dati sono trattati con strumenti informatici e sono protetti da misure tecniche 
                e organizzative adeguate a garantirne la sicurezza e la riservatezza.
              </p>
            </div>
          </ScrollArea>

          <div className="flex items-start space-x-3 pt-3 sm:pt-4">
            <Checkbox
              id="privacy"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              className="mt-0.5 h-5 w-5"
            />
            <label
              htmlFor="privacy"
              className="text-xs sm:text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Dichiaro di aver letto e compreso le linee guida e l'informativa sulla privacy, e acconsento al trattamento 
              dei miei dati personali per le finalità indicate.
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end px-4 sm:px-6 pb-4 sm:pb-6">
          <Button 
            size="lg" 
            onClick={handleContinue} 
            disabled={!accepted || navigating}
            className="w-full sm:w-auto h-12 text-base bg-accent hover:bg-accent/90"
          >
            {navigating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Caricamento...
              </>
            ) : (
              'Accetto e Proseguo'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}