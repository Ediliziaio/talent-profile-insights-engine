import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, CheckCircle2, PartyPopper, Loader2 } from 'lucide-react';

export default function TestCompletato() {
  const { user, profile, loading, signOut } = useAuth();

  // Guard: must be authenticated
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) {
    return <Navigate to="/auth" replace />;
  }

  // Guard: only candidato role
  if (profile.ruolo !== 'candidato') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center">
        <CardHeader className="space-y-4">
          <div className="mx-auto flex items-center justify-center gap-2">
            <div className="p-3 bg-success/10 rounded-full">
              <CheckCircle2 className="h-10 w-10 text-success" />
            </div>
            <PartyPopper className="h-8 w-8 text-warning" />
          </div>
          <CardTitle className="text-2xl">Complimenti, {profile?.nome}!</CardTitle>
          <CardDescription className="text-base">
            Hai completato con successo il questionario Talent Profile.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-muted rounded-lg space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Brain className="h-5 w-5" />
              <span className="font-semibold">Le tue risposte sono state elaborate</span>
            </div>
            <p className="text-sm text-muted-foreground">
              I risultati del tuo assessment sono stati inviati all'azienda che ha richiesto la valutazione. 
              Verrai contattato per i prossimi passi del processo di selezione.
            </p>
          </div>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Cosa succede ora?</strong></p>
            <ul className="text-left space-y-1 pl-4">
              <li>• L'azienda riceverà il tuo profilo completo</li>
              <li>• I risultati verranno analizzati dal team HR</li>
              <li>• Sarai ricontattato per eventuali colloqui</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 justify-center">
          <p className="text-xs text-muted-foreground text-center">
            Puoi chiudere questa pagina. I tuoi risultati sono stati salvati.
          </p>
          <Button variant="outline" onClick={signOut}>
            Esci dalla piattaforma
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
