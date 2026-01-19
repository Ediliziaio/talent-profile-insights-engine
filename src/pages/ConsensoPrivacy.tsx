import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Brain, Shield, Lock, FileText } from 'lucide-react';

export default function ConsensoPrivacy() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Only candidato role can access this page
  if (profile?.ruolo !== 'candidato') {
    return <Navigate to="/" replace />;
  }

  const handleContinue = () => {
    if (accepted) {
      navigate('/test/questionario');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Talent Profile Assessment</CardTitle>
          <CardDescription>
            Benvenuto/a, {profile?.nome || 'Candidato'}! Prima di iniziare il test, leggi e accetta l'informativa sulla privacy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Dati protetti</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <span>Crittografia SSL</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>GDPR Compliant</span>
            </div>
          </div>

          <ScrollArea className="h-64 rounded-md border p-4">
            <div className="space-y-4 text-sm">
              <h3 className="font-semibold text-base">Informativa sul Trattamento dei Dati Personali</h3>
              
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

          <div className="flex items-start space-x-3 pt-4">
            <Checkbox
              id="privacy"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
            />
            <label
              htmlFor="privacy"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Dichiaro di aver letto e compreso l'informativa sulla privacy e acconsento al trattamento 
              dei miei dati personali per le finalità indicate.
            </label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            size="lg" 
            onClick={handleContinue} 
            disabled={!accepted}
          >
            Accetto e Proseguo
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
