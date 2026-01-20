import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { User, Building2, Loader2 } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [cognome, setCognome] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Candidate login state
  const [candidateUsername, setCandidateUsername] = useState('');
  const [candidatePassword, setCandidatePassword] = useState('');
  const [candidateLoading, setCandidateLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // If input doesn't contain @, treat as username and construct internal email
    let loginEmail = email;
    if (!email.includes('@')) {
      loginEmail = `${email}@candidati.talentprofile.local`;
    }
    
    const { error } = await signIn(loginEmail, password);
    setLoading(false);
    
    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    } else {
      navigate('/');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, nome, cognome);
    setLoading(false);
    
    if (error) {
      toast({ title: 'Errore', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Registrazione completata', description: 'Puoi ora accedere.' });
      navigate('/');
    }
  };

  const handleCandidateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCandidateLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/candidate-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: candidateUsername.trim().toLowerCase(),
            password: candidatePassword,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Credenziali non valide');
      }

      // Store session info for the anagraphic form
      sessionStorage.setItem('candidate_session', JSON.stringify({
        sessionToken: result.sessionToken,
        azienda: result.azienda,
        expiresAt: result.expiresAt,
      }));

      toast({
        title: 'Accesso effettuato',
        description: 'Compila i tuoi dati per procedere',
      });

      navigate('/test/anagrafica');

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Credenziali non valide';
      toast({
        title: 'Errore',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setCandidateLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 safe-area-bottom">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center px-4 sm:px-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <img 
              src="/talentprofile_logo_v3.png?v=20260119" 
              alt="Talent Profile" 
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Talent Profile</CardTitle>
          <CardDescription className="text-sm">Sistema di Assessment HR</CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <Tabs defaultValue="candidate" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 h-11">
              <TabsTrigger value="candidate" className="flex items-center justify-center gap-1.5 h-full text-xs sm:text-sm">
                <User className="h-4 w-4 shrink-0" />
                <span className="hidden xs:inline sm:inline">Candidato</span>
              </TabsTrigger>
              <TabsTrigger value="azienda" className="flex items-center justify-center gap-1.5 h-full text-xs sm:text-sm">
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="hidden xs:inline sm:inline">Azienda</span>
              </TabsTrigger>
              <TabsTrigger value="register" className="h-full text-xs sm:text-sm">Registra</TabsTrigger>
            </TabsList>

            {/* Candidate Login Tab */}
            <TabsContent value="candidate">
              <form onSubmit={handleCandidateLogin} className="space-y-4 mt-4">
                <div className="text-center text-xs sm:text-sm text-muted-foreground mb-4">
                  Accedi con le credenziali fornite dalla tua azienda
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-username" className="text-sm">Username</Label>
                  <Input 
                    id="candidate-username" 
                    type="text" 
                    value={candidateUsername} 
                    onChange={e => setCandidateUsername(e.target.value)} 
                    required 
                    placeholder="es. teknofinestre-a1b2"
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="candidate-password" className="text-sm">Password</Label>
                  <Input 
                    id="candidate-password" 
                    type="password" 
                    value={candidatePassword} 
                    onChange={e => setCandidatePassword(e.target.value)} 
                    required 
                    className="h-11 text-base"
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-base bg-accent hover:bg-accent/90" disabled={candidateLoading}>
                  {candidateLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accesso...
                    </>
                  ) : (
                    'Accedi al Test'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            {/* Company/Admin Login Tab */}
            <TabsContent value="azienda">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="text-center text-xs sm:text-sm text-muted-foreground mb-4">
                  Accesso per aziende e amministratori
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    required 
                    placeholder="email@azienda.it"
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required className="h-11 text-base" />
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Accesso...
                    </>
                  ) : (
                    'Accedi'
                  )}
                </Button>
              </form>
            </TabsContent>
            
            {/* Registration Tab */}
            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome" className="text-sm">Nome</Label>
                    <Input id="nome" value={nome} onChange={e => setNome(e.target.value)} required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cognome" className="text-sm">Cognome</Label>
                    <Input id="cognome" value={cognome} onChange={e => setCognome(e.target.value)} required className="h-11 text-base" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email" className="text-sm">Email</Label>
                  <Input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required className="h-11 text-base" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-password" className="text-sm">Password</Label>
                  <Input id="reg-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="h-11 text-base" />
                </div>
                <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registrazione...
                    </>
                  ) : (
                    'Registrati'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}