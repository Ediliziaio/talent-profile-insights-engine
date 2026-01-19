import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Building2, Users, ClipboardList, LogOut, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const isSuperadmin = profile?.ruolo === 'superadmin';
  const isAzienda = profile?.ruolo === 'azienda';

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Brain className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Talent Profile</h1>
              <p className="text-sm text-muted-foreground">
                {isSuperadmin ? 'Superadmin' : isAzienda ? 'Portale Azienda' : 'Dashboard'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{profile?.email}</span>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Esci
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Benvenuto, {profile?.nome || 'Utente'}</h2>
          <p className="text-muted-foreground">Gestisci assessment e candidati</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isSuperadmin && (
            <>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link to="/aziende">
                  <CardHeader>
                    <Building2 className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Gestione Aziende</CardTitle>
                    <CardDescription>Crea e gestisci le aziende clienti</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link to="/utenti">
                  <CardHeader>
                    <Users className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Gestione Utenti</CardTitle>
                    <CardDescription>Assegna ruoli e permessi</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <Link to="/impostazioni">
                  <CardHeader>
                    <Settings className="h-10 w-10 text-primary mb-2" />
                    <CardTitle>Impostazioni</CardTitle>
                    <CardDescription>Configura il sistema</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            </>
          )}

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/candidati">
              <CardHeader>
                <Users className="h-10 w-10 text-accent mb-2" />
                <CardTitle>Candidati</CardTitle>
                <CardDescription>Visualizza e gestisci i candidati</CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link to="/risultati">
              <CardHeader>
                <ClipboardList className="h-10 w-10 text-success mb-2" />
                <CardTitle>Risultati Test</CardTitle>
                <CardDescription>Analizza i profili completati</CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {!isSuperadmin && !isAzienda && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ruolo non configurato</CardTitle>
              <CardDescription>
                Il tuo account non è ancora stato assegnato a un'azienda. Contatta l'amministratore.
              </CardDescription>
            </CardHeader>
          </Card>
        )}
      </main>
    </div>
  );
}
